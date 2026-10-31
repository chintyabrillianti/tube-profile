import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminLoginForm from "./admin-login-form";

const mocks = vi.hoisted(() => ({
  loginAdmin: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("@/lib/admin-auth", () => ({
  loginAdmin: mocks.loginAdmin,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

function fillCredentials() {
  fireEvent.change(screen.getByLabelText("Email"), {
    target: { value: "admin@example.test" },
  });
  fireEvent.change(screen.getByLabelText("Kata sandi"), {
    target: { value: "not-a-real-password" },
  });
}

function submitForm() {
  const form = screen.getByRole("button", { name: "Masuk" }).closest("form");
  if (!form) {
    throw new Error("Login form was not rendered.");
  }

  const event = new Event("submit", { bubbles: true, cancelable: true });
  form.dispatchEvent(event);
  return event;
}

describe("AdminLoginForm", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.loginAdmin.mockResolvedValue(undefined);
  });

  it("does not allow native submission before client hydration", () => {
    const markup = renderToStaticMarkup(<AdminLoginForm />);

    expect(markup).toContain("Formulir masuk sedang dimuat.");
    expect(markup).toMatch(/<button type="submit" disabled=""/);
    expect(markup).toContain('action="/admin/login" method="post"');
  });

  it("prevents native submission, calls login, and navigates after success", async () => {
    render(<AdminLoginForm />);
    fillCredentials();

    const event = submitForm();

    expect(event.defaultPrevented).toBe(true);
    expect(mocks.loginAdmin).toHaveBeenCalledWith(
      "admin@example.test",
      "not-a-real-password",
      false,
    );
    await waitFor(() => {
      expect(mocks.replace).toHaveBeenCalledWith("/admin");
    });
    expect(window.location.search).toBe("");
  });

  it("supports password visibility, remember me, and the reset link", async () => {
    render(<AdminLoginForm />);
    fillCredentials();

    const password = screen.getByLabelText<HTMLInputElement>("Kata sandi");
    expect(password.type).toBe("password");
    fireEvent.click(screen.getByRole("button", { name: "Tampilkan kata sandi" }));
    expect(password.type).toBe("text");
    fireEvent.click(
      screen.getByRole("button", { name: "Sembunyikan kata sandi" }),
    );
    expect(password.type).toBe("password");

    fireEvent.click(screen.getByLabelText("Ingat saya"));
    expect(screen.getByRole("link", { name: "Lupa kata sandi?" }).getAttribute("href"))
      .toBe("/admin/forgot-password");
    submitForm();

    await waitFor(() => {
      expect(mocks.loginAdmin).toHaveBeenCalledWith(
        "admin@example.test",
        "not-a-real-password",
        true,
      );
    });
  });

  it.each([
    ["401/422", "Email atau kata sandi tidak sesuai."],
    ["419", "Sesi keamanan kedaluwarsa. Muat ulang halaman lalu coba lagi."],
    [
      "a CSRF network failure before login",
      "Tidak dapat terhubung ke server keamanan. Periksa koneksi dan konfigurasi API.",
    ],
    [
      "a login network failure",
      "Tidak dapat terhubung ke server. Periksa koneksi dan konfigurasi API.",
    ],
  ])("shows a safe error when %s occurs", async (_failure, message) => {
    mocks.loginAdmin.mockRejectedValue(new Error(message));
    render(<AdminLoginForm />);
    fillCredentials();

    submitForm();

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe(message);
    expect(mocks.replace).not.toHaveBeenCalled();
    expect(alert.textContent).not.toContain("not-a-real-password");
    expect(window.location.search).toBe("");
    expect(screen.getByLabelText<HTMLInputElement>("Email").value).toBe(
      "admin@example.test",
    );
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Masuk" }).disabled,
    ).toBe(false);
  });
});
