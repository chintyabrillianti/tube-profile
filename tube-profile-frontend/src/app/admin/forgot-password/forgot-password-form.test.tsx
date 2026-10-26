import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ForgotPasswordForm from "./forgot-password-form";

const mocks = vi.hoisted(() => ({
  requestAdminPasswordOtp: vi.fn(),
  verifyAdminPasswordOtp: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("@/lib/admin-auth", () => ({
  requestAdminPasswordOtp: mocks.requestAdminPasswordOtp,
  verifyAdminPasswordOtp: mocks.verifyAdminPasswordOtp,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

describe("ForgotPasswordForm", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requestAdminPasswordOtp.mockResolvedValue(undefined);
    mocks.verifyAdminPasswordOtp.mockResolvedValue("a".repeat(64));
  });

  it("requests an OTP and then verifies it before navigating to password creation", async () => {
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "admin@example.test" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Kirim Kode Verifikasi" }));

    await waitFor(() => {
      expect(mocks.requestAdminPasswordOtp).toHaveBeenCalledWith(
        "admin@example.test",
      );
    });
    expect(await screen.findByLabelText("Kode verifikasi 6 digit")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: /Kirim ulang kode/ }).hasAttribute("disabled"),
    ).toBe(true);
    fireEvent.change(screen.getByLabelText("Kode verifikasi 6 digit"), {
      target: { value: "012345" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verifikasi Kode" }));

    await waitFor(() => {
      expect(mocks.verifyAdminPasswordOtp).toHaveBeenCalledWith(
        "admin@example.test",
        "012345",
      );
    });
    expect(mocks.replace).toHaveBeenCalledWith(
      `/admin/reset-password?email=admin%40example.test&token=${"a".repeat(64)}`,
    );
  });

  it("shows a neutral error when the OTP is invalid or expired", async () => {
    mocks.verifyAdminPasswordOtp.mockRejectedValue(
      new Error("Kode verifikasi tidak valid atau telah kedaluwarsa."),
    );
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "admin@example.test" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Kirim Kode Verifikasi" }));
    await screen.findByLabelText("Kode verifikasi 6 digit");
    fireEvent.change(screen.getByLabelText("Kode verifikasi 6 digit"), {
      target: { value: "123456" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Verifikasi Kode" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Kode verifikasi tidak valid",
    );
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("keeps the email step active and shows a safe error when OTP delivery fails", async () => {
    mocks.requestAdminPasswordOtp.mockRejectedValue(
      new Error("Kode verifikasi belum dapat dikirim saat ini. Silakan coba lagi nanti."),
    );
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "admin@example.test" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Kirim Kode Verifikasi" }));

    expect((await screen.findByRole("alert")).textContent).toContain(
      "Kode verifikasi belum dapat dikirim",
    );
    expect(screen.queryByLabelText("Kode verifikasi 6 digit")).toBeNull();
    expect(mocks.replace).not.toHaveBeenCalled();
  });

  it("disables duplicate submissions while the request is pending", async () => {
    let resolveRequest: (() => void) | undefined;
    mocks.requestAdminPasswordOtp.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveRequest = resolve;
      }),
    );
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "admin@example.test" },
    });
    const button = screen.getByRole("button", {
      name: "Kirim Kode Verifikasi",
    });
    fireEvent.click(button);
    expect(
      screen.getByRole<HTMLButtonElement>("button", {
        name: "Mengirim kode...",
      }).disabled,
    ).toBe(true);
    fireEvent.click(button);

    expect(mocks.requestAdminPasswordOtp).toHaveBeenCalledTimes(1);
    resolveRequest?.();
    await screen.findByRole("status");
  });
});
