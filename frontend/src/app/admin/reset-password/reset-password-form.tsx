"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { resetAdminPassword } from "@/lib/admin-auth";

interface ResetPasswordFormProps {
  token: string;
  initialEmail: string;
}

export default function ResetPasswordForm({
  token,
  initialEmail,
}: ResetPasswordFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await resetAdminPassword(email, token, password, passwordConfirmation);
      setSubmitted(true);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Kata sandi belum dapat diperbarui. Coba lagi.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token || !initialEmail) {
    return (
      <div className="mt-6 space-y-3">
        <p className="text-sm text-red-700" role="alert">
          Verifikasi OTP tidak ditemukan atau telah kedaluwarsa. Minta kode
          verifikasi baru.
        </p>
        <Link
          href="/admin/forgot-password"
          className="inline-flex min-h-11 items-center font-medium text-[#a7470a] hover:underline"
        >
          Minta Kode Verifikasi Baru
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mt-6 space-y-3">
        <p className="text-sm text-green-800" role="status" aria-live="polite">
          Kata sandi berhasil diperbarui. Silakan masuk menggunakan kata sandi
          baru.
        </p>
        <Link
          href="/admin/login"
          className="inline-flex min-h-11 items-center font-medium text-[#a7470a] hover:underline"
        >
          Masuk Admin
        </Link>
      </div>
    );
  }

  return (
    <form
      action="/admin/reset-password"
      method="post"
      className="mt-8 space-y-5"
      onSubmit={handleSubmit}
    >
      <div>
        <label
          htmlFor="reset-email"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Email
        </label>
        <input
          id="reset-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={255}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-[#142331] outline-none transition focus:border-[#b74e0d] focus:ring-2 focus:ring-[#b74e0d]/20"
        />
      </div>
      <div>
        <label
          htmlFor="new-password"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Kata sandi baru
        </label>
        <div className="relative">
          <input
            id="new-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={12}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-4 pr-14 text-[#142331] outline-none transition focus:border-[#b74e0d] focus:ring-2 focus:ring-[#b74e0d]/20"
          />
          <button
            type="button"
            aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
            aria-pressed={showPassword}
            onClick={() => setShowPassword((visible) => !visible)}
            className="absolute inset-y-0 right-0 inline-flex min-h-12 min-w-12 items-center justify-center rounded-r-md text-slate-600 hover:text-[#a7470a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#b74e0d]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M2.5 12c.8-2.3 4.2-7 9.5-7s8.7 4.7 9.5 7c-.8 2.3-4.2 7-9.5 7s-8.7-4.7-9.5-7z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          </button>
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-600">
          Gunakan minimal 12 karakter dengan huruf besar, huruf kecil, angka,
          dan simbol.
        </p>
      </div>
      <div>
        <label
          htmlFor="password-confirmation"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Konfirmasi kata sandi
        </label>
        <div className="relative">
          <input
            id="password-confirmation"
            name="password_confirmation"
            type={showConfirmation ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={12}
            value={passwordConfirmation}
            onChange={(event) => setPasswordConfirmation(event.target.value)}
            className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-4 pr-14 text-[#142331] outline-none transition focus:border-[#b74e0d] focus:ring-2 focus:ring-[#b74e0d]/20"
          />
          <button
            type="button"
            aria-label={
              showConfirmation
                ? "Sembunyikan konfirmasi kata sandi"
                : "Tampilkan konfirmasi kata sandi"
            }
            aria-pressed={showConfirmation}
            onClick={() => setShowConfirmation((visible) => !visible)}
            className="absolute inset-y-0 right-0 inline-flex min-h-12 min-w-12 items-center justify-center rounded-r-md text-slate-600 hover:text-[#a7470a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#b74e0d]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M2.5 12c.8-2.3 4.2-7 9.5-7s8.7 4.7 9.5 7c-.8 2.3-4.2 7-9.5 7s-8.7-4.7-9.5-7z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="2.5" />
            </svg>
          </button>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-700" role="alert" aria-live="assertive">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[#b74e0d] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#9f4006] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
      </button>
    </form>
  );
}
