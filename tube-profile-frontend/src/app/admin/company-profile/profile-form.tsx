"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  getAdminCompanyProfile,
  updateAdminCompanyProfile,
} from "@/lib/admin-company-profile";
import type {
  AdminCompanyProfile,
  AdminCompanyProfileChanges,
} from "@/lib/admin-company-profile";

const fieldClassName =
  "min-h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-[#142331] outline-none transition focus:border-[#b74e0d] focus:ring-2 focus:ring-[#b74e0d]/20";
const textAreaClassName =
  "min-h-32 w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-[#142331] outline-none transition focus:border-[#b74e0d] focus:ring-2 focus:ring-[#b74e0d]/20";
const labelClassName = "mb-2 block text-sm font-medium text-slate-700";

function getErrorMessage(cause: unknown): string {
  return cause instanceof Error
    ? cause.message
    : "Profil belum dapat diproses. Coba lagi nanti.";
}

export default function AdminCompanyProfileForm() {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminCompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const submissionInProgress = useRef(false);

  useEffect(() => {
    let active = true;

    getAdminCompanyProfile()
      .then((loadedProfile) => {
        if (active) setProfile(loadedProfile);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        const message = getErrorMessage(cause);
        setError(message);
        if (message.startsWith("Sesi admin telah berakhir")) {
          router.replace("/admin/login");
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  async function handleRetry() {
    setIsLoading(true);
    setError("");

    try {
      setProfile(await getAdminCompanyProfile());
    } catch (cause) {
      const message = getErrorMessage(cause);
      setError(message);
      if (message.startsWith("Sesi admin telah berakhir")) {
        router.replace("/admin/login");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function updateField(
    field: keyof AdminCompanyProfileChanges,
    value: string | null,
  ) {
    setProfile((current) => (current ? { ...current, [field]: value } : current));
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionInProgress.current) {
      return;
    }
    submissionInProgress.current = true;

    if (!profile) {
      setError("Profil belum dimuat. Muat ulang data sebelum menyimpan.");
      submissionInProgress.current = false;
      return;
    }

    setError("");
    setSuccess("");
    setIsSaving(true);

    const changes: AdminCompanyProfileChanges = {
      legal_name: profile.legal_name,
      display_name: profile.display_name,
      background: profile.background,
      vision: profile.vision,
      mission: profile.mission,
      address: profile.address,
      email: profile.email || null,
      whatsapp_number: profile.whatsapp_number || null,
      website_url: profile.website_url || null,
    };

    try {
      setProfile(await updateAdminCompanyProfile(changes));
      setSuccess(
        "Perubahan berhasil disimpan. Halaman publik akan menampilkan profil terbaru saat dimuat ulang.",
      );
    } catch (cause) {
      const message = getErrorMessage(cause);
      setError(message);
      if (message.startsWith("Sesi admin telah berakhir")) {
        router.replace("/admin/login");
      }
    } finally {
      setIsSaving(false);
      submissionInProgress.current = false;
    }
  }

  const fields = profile;

  return (
    <div className="mx-auto w-full max-w-5xl">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a7470a]">
          Pengaturan perusahaan
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#142331] sm:text-3xl">
          Profil perusahaan
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Perbarui informasi perusahaan yang ditampilkan pada situs web publik.
          Informasi kontak dapat dikosongkan jika belum tersedia.
        </p>

        {isLoading ? (
          <p className="mt-8 text-sm text-slate-600" role="status">
            Memuat profil perusahaan...
          </p>
        ) : fields ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClassName} htmlFor="legal_name">
                  Nama resmi perusahaan
                </label>
                <input
                  className={fieldClassName}
                  id="legal_name"
                  maxLength={200}
                  required
                  value={fields.legal_name}
                  onChange={(event) =>
                    updateField("legal_name", event.target.value)
                  }
                />
              </div>
              <div>
                <label className={labelClassName} htmlFor="display_name">
                  Nama tampilan
                </label>
                <input
                  className={fieldClassName}
                  id="display_name"
                  maxLength={200}
                  required
                  value={fields.display_name}
                  onChange={(event) =>
                    updateField("display_name", event.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <label className={labelClassName} htmlFor="background">
                Deskripsi / latar belakang
              </label>
              <textarea
                className={textAreaClassName}
                id="background"
                maxLength={20000}
                required
                value={fields.background}
                onChange={(event) =>
                  updateField("background", event.target.value)
                }
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClassName} htmlFor="vision">
                  Visi
                </label>
                <textarea
                  className={textAreaClassName}
                  id="vision"
                  maxLength={10000}
                  required
                  value={fields.vision}
                  onChange={(event) => updateField("vision", event.target.value)}
                />
              </div>
              <div>
                <label className={labelClassName} htmlFor="mission">
                  Misi
                </label>
                <textarea
                  className={textAreaClassName}
                  id="mission"
                  maxLength={10000}
                  required
                  value={fields.mission}
                  onChange={(event) =>
                    updateField("mission", event.target.value)
                  }
                />
              </div>
            </div>

            <div>
              <label className={labelClassName} htmlFor="address">
                Alamat
              </label>
              <textarea
                className={textAreaClassName}
                id="address"
                maxLength={10000}
                required
                value={fields.address}
                onChange={(event) => updateField("address", event.target.value)}
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClassName} htmlFor="email">
                  Email
                </label>
                <input
                  className={fieldClassName}
                  id="email"
                  maxLength={255}
                  type="email"
                  value={fields.email ?? ""}
                  onChange={(event) => updateField("email", event.target.value)}
                />
              </div>
              <div>
                <label className={labelClassName} htmlFor="whatsapp_number">
                  Nomor WhatsApp
                </label>
                <input
                  className={fieldClassName}
                  id="whatsapp_number"
                  maxLength={30}
                  type="tel"
                  value={fields.whatsapp_number ?? ""}
                  onChange={(event) =>
                    updateField("whatsapp_number", event.target.value)
                  }
                />
                <p className="mt-1 text-xs text-slate-500">
                  Gunakan format internasional dengan tanda + dan kode negara.
                </p>
              </div>
              <div>
                <label className={labelClassName} htmlFor="website_url">
                  Situs web
                </label>
                <input
                  className={fieldClassName}
                  id="website_url"
                  maxLength={2048}
                  type="url"
                  value={fields.website_url ?? ""}
                  onChange={(event) =>
                    updateField("website_url", event.target.value)
                  }
                />
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-700" role="alert" aria-live="assertive">
                {error}
              </p>
            )}
            {success && (
              <p
                className="text-sm text-green-800"
                role="status"
                aria-live="polite"
              >
                {success}
              </p>
            )}

            <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center">
              <button
                className="inline-flex min-h-12 items-center justify-center rounded-md bg-[#b74e0d] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#9f4006] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b74e0d] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSaving}
                type="submit"
              >
                {isSaving ? "Menyimpan..." : "Simpan perubahan"}
              </button>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-md border border-slate-300 px-6 text-sm font-semibold text-[#142331] transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b74e0d]"
                href="/"
              >
                Lihat situs web publik
              </Link>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-4">
            {error && (
              <p className="text-sm text-red-700" role="alert" aria-live="assertive">
                {error}
              </p>
            )}
            <button
              className="inline-flex min-h-11 items-center rounded-md border border-slate-300 px-4 text-sm font-semibold text-[#142331] hover:bg-slate-50"
              onClick={handleRetry}
              type="button"
            >
              Coba lagi
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
