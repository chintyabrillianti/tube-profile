"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getAdminCompanyProfile } from "@/lib/admin-company-profile";
import type { AdminCompanyProfile } from "@/lib/admin-company-profile";
import { getAdminProjects } from "@/lib/admin-projects";

export default function AdminDashboard() {
  const [profile, setProfile] = useState<AdminCompanyProfile | null>(null);
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [projectsError, setProjectsError] = useState("");

  const fetchDashboardData = useCallback(() => {
    return Promise.allSettled([
      getAdminCompanyProfile(),
      getAdminProjects(),
    ]);
  }, []);

  const applyDashboardData = useCallback(
    (results: Awaited<ReturnType<typeof fetchDashboardData>>) => {
      const [profileResult, projectsResult] = results;
      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value);
        setProfileError("");
      } else {
        setProfileError("Informasi profil perusahaan belum dapat dimuat.");
      }

      if (projectsResult.status === "fulfilled") {
        setProjectCount(projectsResult.value.length);
        setProjectsError("");
      } else {
        setProjectsError("Ringkasan proyek belum dapat dimuat.");
      }

      setIsLoading(false);
    },
    [],
  );

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setProfileError("");
    setProjectsError("");
    applyDashboardData(await fetchDashboardData());
  }, [applyDashboardData, fetchDashboardData]);

  useEffect(() => {
    let active = true;

    fetchDashboardData().then((results) => {
      if (active) applyDashboardData(results);
    });

    return () => {
      active = false;
    };
  }, [applyDashboardData, fetchDashboardData]);

  return (
    <div className="mx-auto w-full max-w-7xl space-y-7">
      <section className="overflow-hidden rounded-2xl border border-[#f2d4c2] bg-gradient-to-br from-white via-white to-[#fff1e8] p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.17em] text-[#a7470a]">
          PT. Brianov Egatara Nirbana Estu
        </p>
        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-[#142331] sm:text-3xl">
              Selamat datang di Dashboard Admin
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              Kelola informasi perusahaan dan portofolio proyek BENE dari satu
              tempat.
            </p>
          </div>
          <Link
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-[#b74e0d] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#9f4006] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#b74e0d]"
            href="/admin/projects"
          >
            Buka Kelola Proyek
          </Link>
        </div>
      </section>

      <section aria-labelledby="admin-overview-heading">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2
              className="text-lg font-semibold text-[#142331]"
              id="admin-overview-heading"
            >
              Ringkasan pengelolaan
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Informasi di bawah diambil dari data yang tersedia saat ini.
            </p>
          </div>
          <button
            className="inline-flex min-h-10 items-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-[#142331] transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b74e0d] disabled:cursor-wait disabled:opacity-60"
            disabled={isLoading}
            onClick={() => void loadDashboardData()}
            type="button"
          >
            {isLoading ? "Memuat..." : "Muat ulang"}
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <article className="flex min-h-48 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#fff1e8] text-[#a7470a]">
                <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 21h16M6 21V7l6-4 6 4v14M9 10h.01M15 10h.01M9 14h.01M15 14h.01M10 21v-4h4v4" />
                </svg>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Profil
              </span>
            </div>
            <div className="mt-4 flex-1">
              <h3 className="text-base font-semibold text-[#142331]">
                Profil Perusahaan
              </h3>
              {isLoading ? (
                <p className="mt-2 text-sm text-slate-500" role="status">
                  Memuat profil...
                </p>
              ) : profileError ? (
                <p className="mt-2 text-sm text-red-700" role="status">
                  {profileError}
                </p>
              ) : (
                <p className="mt-2 line-clamp-2 text-sm text-slate-600">
                  {profile?.display_name || profile?.legal_name}
                </p>
              )}
            </div>
            <Link
              className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#a7470a] hover:text-[#7f3508] focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b74e0d]"
              href="/admin/company-profile"
            >
              Kelola profil perusahaan
              <span aria-hidden="true">→</span>
            </Link>
          </article>

          <article className="flex min-h-48 flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#fff1e8] text-[#a7470a]">
                <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9h18M8 4v5m8-5v5M7 13h3m4 0h3m-10 3h3m4 0h3" />
                </svg>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                Portofolio
              </span>
            </div>
            <div className="mt-4 flex-1">
              <h3 className="text-base font-semibold text-[#142331]">
                Proyek
              </h3>
              {isLoading ? (
                <p className="mt-2 text-sm text-slate-500" role="status">
                  Memuat data proyek...
                </p>
              ) : projectsError ? (
                <p className="mt-2 text-sm text-red-700" role="status">
                  {projectsError}
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-600">
                  <span className="text-2xl font-semibold text-[#142331]">
                    {projectCount}
                  </span>{" "}
                  proyek dalam data admin
                </p>
              )}
            </div>
            <Link
              className="mt-4 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[#a7470a] hover:text-[#7f3508] focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b74e0d]"
              href="/admin/projects"
            >
              Kelola proyek
              <span aria-hidden="true">→</span>
            </Link>
          </article>
        </div>
      </section>

      <section
        aria-labelledby="recent-activity-heading"
        className="rounded-xl border border-dashed border-slate-300 bg-white p-6 sm:p-8"
      >
        <h2
          className="text-base font-semibold text-[#142331]"
          id="recent-activity-heading"
        >
          Aktivitas terbaru
        </h2>
        <div className="mt-4 rounded-lg bg-slate-50 px-4 py-5 text-sm text-slate-600">
          Belum ada sumber aktivitas terbaru yang tersedia.
        </div>
      </section>
    </div>
  );
}
