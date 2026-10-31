import Link from "next/link";
import { connection } from "next/server";
import SiteHeader from "../site-header";
import { getProjects } from "@/lib/server-api";
import type { PublicProject } from "@/lib/api";
import ProjectDirectory from "./project-directory";

export default async function ProjectsPage() {
  await connection();
  let projects: PublicProject[] | null = null;
  let loadFailed = false;

  try {
    projects = await getProjects();
  } catch (error) {
    console.error("Gagal memuat daftar proyek:", error);
    loadFailed = true;
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-[#edf0f1]">
        <section
          aria-labelledby="all-projects-heading"
          className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12 lg:py-20"
        >
          <Link
            className="inline-flex min-h-10 items-center text-sm font-semibold text-[#142331] underline decoration-slate-400 underline-offset-4 hover:text-[#a7470a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f47721]"
            href="/#projects"
          >
            ← Kembali ke beranda
          </Link>
          <div className="mt-8 max-w-3xl">
            <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#a7470a] sm:text-sm">
              <span className="h-px w-8 bg-[#a7470a]" />
              Proyek kami
            </p>
            <h1
              className="text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#142331] sm:text-4xl"
              id="all-projects-heading"
            >
              Proyek Yang Telah Kami Kerjakan
            </h1>
            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
              Temukan proyek pembersihan dan inspeksi tube yang telah kami
              kerjakan untuk berbagai kebutuhan industri.
            </p>
          </div>
          {loadFailed ? (
            <p className="mt-8 flex min-h-32 items-center justify-center border border-slate-200 bg-white px-5 py-8 text-center text-sm leading-6 text-slate-600">
              Terjadi kendala saat memuat data proyek. Silakan coba kembali.
            </p>
          ) : (
            <ProjectDirectory projects={projects ?? []} />
          )}
        </section>
      </main>
    </>
  );
}
