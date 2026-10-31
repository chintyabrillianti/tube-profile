"use client";

import { useState, useSyncExternalStore } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginAdmin } from "@/lib/admin-auth";

function subscribeToHydration(): () => void {
  return () => {};
}

function getHydrationSnapshot(): boolean {
  return true;
}

function getServerHydrationSnapshot(): boolean {
  return false;
}

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydrationSnapshot,
    getServerHydrationSnapshot,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await loginAdmin(email, password, remember);
      router.replace("/admin");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Gagal masuk. Coba lagi nanti.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      action="/admin/login"
      method="post"
      className="mt-8 space-y-5"
      onSubmit={handleSubmit}
    >
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-[#142331] outline-none transition focus:border-[#b74e0d] focus:ring-2 focus:ring-[#b74e0d]/20"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Kata sandi
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
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
            {showPassword ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9.9 5.2A10.8 10.8 0 0112 5c5 0 8.5 4.5 9.5 7-.4 1-1.3 2.4-2.6 3.7M6.2 6.2C4.3 7.4 3 9.2 2.5 12c.7 1.8 2.4 4.2 5.1 5.7A10 10 0 0012 19c.8 0 1.5-.1 2.2-.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M2.5 12c.8-2.3 4.2-7 9.5-7s8.7 4.7 9.5 7c-.8 2.3-4.2 7-9.5 7s-8.7-4.7-9.5-7z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
            )}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-slate-700">
            <input
              type="checkbox"
              name="remember"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
              className="h-4 w-4 accent-[#b74e0d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b74e0d]"
            />
            Ingat saya
          </label>
          <Link
            href="/admin/forgot-password"
            className="inline-flex min-h-11 items-center font-medium text-[#a7470a] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b74e0d]"
          >
            Lupa kata sandi?
          </Link>
        </div>
      </div>
      {!isHydrated && (
        <p className="text-sm text-slate-600" role="status">
          Formulir masuk sedang dimuat. Jika tombol belum aktif, muat ulang halaman.
        </p>
      )}
      {error && (
        <p className="text-sm text-red-700" role="alert" aria-live="assertive">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={!isHydrated || isSubmitting}
        className="inline-flex min-h-12 w-full items-center justify-center rounded-md bg-[#b74e0d] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#9f4006] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "Memeriksa..." : "Masuk"}
      </button>
    </form>
  );
}
