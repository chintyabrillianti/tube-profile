import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminCompanyProfileForm from "./profile-form";
import type { AdminCompanyProfile } from "@/lib/admin-company-profile";

const mocks = vi.hoisted(() => ({
  getProfile: vi.fn(),
  updateProfile: vi.fn(),
  replace: vi.fn(),
  router: {} as { replace: () => void },
}));
mocks.router.replace = mocks.replace;

vi.mock("@/lib/admin-company-profile", () => ({
  getAdminCompanyProfile: mocks.getProfile,
  updateAdminCompanyProfile: mocks.updateProfile,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => mocks.router,
}));

const profile: AdminCompanyProfile = {
  legal_name: "Company legal name",
  display_name: "Company display name",
  slug: "company-profile",
  background: "Company background",
  vision: "Company vision",
  mission: "Company mission",
  address: "Company address",
  email: null,
  whatsapp_number: null,
  website_url: null,
  business_hours: {},
  updated_by: null,
};

describe("AdminCompanyProfileForm", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getProfile.mockResolvedValue({ ...profile });
    mocks.updateProfile.mockImplementation(async (changes) => ({
      ...profile,
      ...changes,
      updated_by: 7,
    }));
  });

  it("loads the existing profile and sends changes to the API", async () => {
    render(<AdminCompanyProfileForm />);

    await screen.findByDisplayValue("Company display name");
    fireEvent.change(screen.getByLabelText("Nama tampilan"), {
      target: { value: "Updated display name" },
    });
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "contact@example.test" },
    });
    fireEvent.change(screen.getByLabelText("Nomor WhatsApp"), {
      target: { value: "+62 812 3456 7890" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Simpan perubahan" }));

    await waitFor(() => {
      expect(mocks.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          display_name: "Updated display name",
          email: "contact@example.test",
          whatsapp_number: "+62 812 3456 7890",
        }),
      );
    });
    expect(screen.queryByLabelText("Nomor telepon")).toBeNull();
    expect(
      await screen.findByText(/Perubahan berhasil disimpan/),
    ).toBeTruthy();
  });

  it("shows API errors and keeps the edited value available", async () => {
    mocks.updateProfile.mockRejectedValue(
      new Error("Beberapa isian belum valid. Periksa kembali data."),
    );
    render(<AdminCompanyProfileForm />);

    await screen.findByDisplayValue("Company display name");
    fireEvent.change(screen.getByLabelText("Nama tampilan"), {
      target: { value: "Draft display name" },
    });
    expect(screen.getByLabelText("Nama tampilan")).toHaveProperty(
      "value",
      "Draft display name",
    );
    fireEvent.click(screen.getByRole("button", { name: "Simpan perubahan" }));

    expect(
      await screen.findByText(/Beberapa isian belum valid/),
    ).toBeTruthy();
    expect(screen.getByLabelText("Nama tampilan")).toHaveProperty(
      "value",
      "Draft display name",
    );
  });

  it("waits for the API save response and ignores duplicate submissions", async () => {
    let resolveUpdate:
      | ((value: AdminCompanyProfile) => void)
      | undefined;
    mocks.updateProfile.mockReturnValue(
      new Promise<AdminCompanyProfile>((resolve) => {
        resolveUpdate = resolve;
      }),
    );
    render(<AdminCompanyProfileForm />);

    await screen.findByDisplayValue("Company display name");
    fireEvent.change(screen.getByLabelText("Nama tampilan"), {
      target: { value: "Saved display name" },
    });
    const form = screen.getByRole("button", { name: "Simpan perubahan" })
      .closest("form");
    if (!form) {
      throw new Error("Form profil tidak ditemukan.");
    }

    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(mocks.updateProfile).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: "Menyimpan..." })).toHaveProperty(
      "disabled",
      true,
    );
    expect(screen.queryByText(/Perubahan berhasil disimpan/)).toBeNull();

    resolveUpdate?.({
      ...profile,
      display_name: "Saved display name",
      updated_by: 7,
    });

    expect(
      await screen.findByText(/Perubahan berhasil disimpan/),
    ).toBeTruthy();
  });

  it("keeps existing optional contact values when they are not edited", async () => {
    mocks.getProfile.mockResolvedValueOnce({
      ...profile,
      email: "contact@example.test",
      whatsapp_number: "+62 812 3456 7890",
      website_url: "https://bene.example",
    });
    render(<AdminCompanyProfileForm />);

    await screen.findByDisplayValue("Company display name");
    fireEvent.change(screen.getByLabelText("Nama tampilan"), {
      target: { value: "Updated company name" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Simpan perubahan" }));

    await waitFor(() => {
      expect(mocks.updateProfile).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "contact@example.test",
          whatsapp_number: "+62 812 3456 7890",
          website_url: "https://bene.example",
        }),
      );
    });
  });

  it("shows a load error and retry action when the profile cannot be fetched", async () => {
    mocks.getProfile.mockRejectedValueOnce(
      new Error("Tidak dapat terhubung ke server profil."),
    );
    render(<AdminCompanyProfileForm />);

    expect(
      await screen.findByText(/Tidak dapat terhubung ke server profil/),
    ).toBeTruthy();
    expect(screen.getByRole("button", { name: "Coba lagi" })).toBeTruthy();
  });
});
