"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  requestAdminPasswordOtp,
  verifyAdminPasswordOtp,
} from "@/lib/admin-auth";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [otpRequested, setOtpRequested] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionInProgress = useRef(false);

  useEffect(() => {
    if (resendSeconds <= 0) {
      return;
    }

    const timer = window.setTimeout(
      () => setResendSeconds((remaining) => remaining - 1),
      1000,
    );

    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionInProgress.current) {
      return;
    }

    submissionInProgress.current = true;
    setError("");
    setIsSubmitting(true);

    try {
      if (otpRequested) {
        const resetToken = await verifyAdminPasswordOtp(email, otp);
        router.replace(
          `/admin/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(resetToken)}`,
        );
      } else {
        await requestAdminPasswordOtp(email);
        setOtpRequested(true);
        setResendSeconds(60);
      }
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Permintaan belum dapat diproses. Coba lagi nanti.",
      );
    } finally {
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    if (isSubmitting || resendSeconds > 0) {
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await requestAdminPasswordOtp(email);
      setResendSeconds(60);
      setOtp("");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Kode belum dapat dikirim. Coba lagi nanti.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      action="/admin/forgot-password"
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
          readOnly={otpRequested}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-[#142331] outline-none transition focus:border-[#b74e0d] focus:ring-2 focus:ring-[#b74e0d]/20"
        />
      </div>
      {otpRequested && (
        <>
          <p className="text-sm leading-6 text-slate-600" role="status">
            Jika email tersebut terdaftar dan layanan email berhasil mengirim,
            kode verifikasi akan diterima. Kode berlaku selama 5 menit. Jika
            kode tidak diterima, kirim ulang setelah waktu tunggu selesai.
          </p>
          <div>
            <label
              htmlFor="reset-otp"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Kode verifikasi 6 digit
            </label>
            <input
              id="reset-otp"
              name="otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              required
              value={otp}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-center text-lg tracking-[0.35em] text-[#142331] outline-none transition focus:border-[#b74e0d] focus:ring-2 focus:ring-[#b74e0d]/20"
            />
          </div>
          <button
            type="button"
            disabled={isSubmitting || resendSeconds > 0}
            onClick={handleResend}
            className="inline-flex min-h-11 items-center text-sm font-medium text-[#a7470a] hover:underline disabled:cursor-not-allowed disabled:text-slate-500"
          >
            {resendSeconds > 0
              ? `Kirim ulang kode (${resendSeconds} detik)`
              : "Kirim Ulang Kode"}
          </button>
        </>
      )}
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
        {isSubmitting
          ? otpRequested
            ? "Memverifikasi..."
            : "Mengirim kode..."
          : otpRequested
            ? "Verifikasi Kode"
            : "Kirim Kode Verifikasi"}
      </button>
    </form>
  );
}
