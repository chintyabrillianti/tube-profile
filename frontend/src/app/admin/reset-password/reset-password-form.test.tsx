import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import ResetPasswordForm from "./reset-password-form";

const mocks = vi.hoisted(() => ({
  resetAdminPassword: vi.fn(),
}));

vi.mock("@/lib/admin-auth", () => ({
  resetAdminPassword: mocks.resetAdminPassword,
}));

describe("ResetPasswordForm", () => {
  afterEach(cleanup);

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.resetAdminPassword.mockResolvedValue(undefined);
  });

  it("submits the token and both password fields", async () => {
    render(<ResetPasswordForm token="valid-token" initialEmail="admin@example.test" />);
    fireEvent.change(screen.getByLabelText("Kata sandi baru"), {
      target: { value: "StrongPassword12!" },
    });
    fireEvent.change(screen.getByLabelText("Konfirmasi kata sandi"), {
      target: { value: "StrongPassword12!" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Simpan Kata Sandi Baru" }));

    await waitFor(() => {
      expect(mocks.resetAdminPassword).toHaveBeenCalledWith(
        "admin@example.test",
        "valid-token",
        "StrongPassword12!",
        "StrongPassword12!",
      );
    });
    expect((await screen.findByRole("status")).textContent).toContain(
      "Kata sandi berhasil diperbarui",
    );
  });

  it("does not render password fields when the reset link is incomplete", () => {
    render(<ResetPasswordForm token="" initialEmail="" />);

    expect(screen.getByRole("alert").textContent).toContain(
      "Verifikasi OTP tidak ditemukan",
    );
    expect(screen.queryByLabelText("Kata sandi baru")).toBeNull();
    expect(
      screen
        .getByRole("link", { name: "Minta Kode Verifikasi Baru" })
        .getAttribute("href"),
    ).toBe("/admin/forgot-password");
  });
});
