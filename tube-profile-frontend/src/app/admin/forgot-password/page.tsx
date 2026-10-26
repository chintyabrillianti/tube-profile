import Link from "next/link";
import ForgotPasswordForm from "./forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-[#f4f5f4] px-5 py-12">
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a7470a]">
          PT. BRIANOV EGATARA NIRBANA ESTU
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#142331]">
          Lupa Kata Sandi
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Masukkan email akun admin untuk meminta kode verifikasi pengaturan
          ulang kata sandi.
        </p>
        <ForgotPasswordForm />
        <Link
          href="/admin/login"
          className="mt-5 inline-flex min-h-11 items-center text-sm font-medium text-[#142331] hover:text-[#a7470a]"
        >
          Kembali ke Masuk Admin
        </Link>
      </section>
    </main>
  );
}
