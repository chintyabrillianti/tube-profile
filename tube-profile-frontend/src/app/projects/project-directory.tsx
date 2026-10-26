"use client";

import { useEffect, useMemo, useState } from "react";
import type { PublicProject, ProjectWorkType } from "@/lib/api";
import { ProjectCard } from "./project-card";

type SortOrder =
  | "newest"
  | "oldest"
  | "recently-started"
  | "name";

const PAGE_SIZE_OPTIONS = [10, 20, 30];

function completionValue(project: PublicProject): number | null {
  if (project.end_year === null || project.end_month === null) return null;
  return project.end_year * 12 + project.end_month;
}

function startValue(project: PublicProject): number | null {
  if (project.start_year === null || project.start_month === null) return null;
  return project.start_year * 12 + project.start_month;
}

export default function ProjectDirectory({
  projects,
}: {
  projects: PublicProject[];
}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [service, setService] = useState<ProjectWorkType | "all">("all");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timeout);
  }, [query]);

  const filteredProjects = useMemo(() => {
    const normalizedQuery = debouncedQuery.toLocaleLowerCase();
    return projects
      .filter((project) => {
        if (service !== "all" && project.work_type !== service) return false;
        if (!normalizedQuery) return true;
        const searchableText =
          `${project.title} ${project.description ?? ""}`.toLocaleLowerCase();
        return searchableText.includes(normalizedQuery);
      })
      .sort((first, second) => {
        if (sortOrder === "name") {
          return first.title.localeCompare(second.title, undefined, {
            sensitivity: "base",
          });
        }

        const firstValue =
          sortOrder === "recently-started"
            ? startValue(first)
            : completionValue(first);
        const secondValue =
          sortOrder === "recently-started"
            ? startValue(second)
            : completionValue(second);

        if (firstValue === null || secondValue === null) {
          if (firstValue === secondValue) return 0;
          return firstValue === null ? 1 : -1;
        }
        return sortOrder === "oldest"
          ? firstValue - secondValue
          : secondValue - firstValue;
      });
  }, [debouncedQuery, projects, service, sortOrder]);

  const totalPages = Math.ceil(filteredProjects.length / pageSize);
  const currentPage = totalPages === 0 ? 1 : Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const visibleProjects = filteredProjects.slice(pageStart, pageStart + pageSize);
  const filtersActive =
    query.trim() !== "" || service !== "all" || sortOrder !== "newest";

  function clearFilters() {
    setQuery("");
    setDebouncedQuery("");
    setService("all");
    setSortOrder("newest");
    setPage(1);
  }

  return (
    <>
      <div className="mt-8 grid gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-[minmax(0,1fr)_15rem_15rem]">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#142331]" htmlFor="project-search">
            Cari proyek
          </label>
          <input
            className="min-h-12 w-full rounded-md border border-slate-300 px-4 text-sm text-[#142331] outline-none placeholder:text-slate-400 focus:border-[#b74e0d] focus:ring-2 focus:ring-[#b74e0d]/20"
            id="project-search"
            type="search"
            value={query}
            placeholder="Cari nama proyek, perusahaan, atau deskripsi"
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#142331]" htmlFor="project-service">
            Layanan
          </label>
          <select
            className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-[#142331] outline-none focus:border-[#b74e0d] focus:ring-2 focus:ring-[#b74e0d]/20"
            id="project-service"
            value={service}
            onChange={(event) => {
              setService(event.target.value as ProjectWorkType | "all")
              setPage(1);
            }}
          >
            <option value="all">Semua Layanan</option>
            <option value="dry_pigging">Dry Pigging</option>
            <option value="ect">Eddy Current Testing (ECT)</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#142331]" htmlFor="project-sort">
            Urutkan
          </label>
          <select
            className="min-h-12 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-[#142331] outline-none focus:border-[#b74e0d] focus:ring-2 focus:ring-[#b74e0d]/20"
            id="project-sort"
            value={sortOrder}
            onChange={(event) => {
              setSortOrder(event.target.value as SortOrder);
              setPage(1);
            }}
          >
            <option value="newest">Terbaru</option>
            <option value="oldest">Terlama</option>
            <option value="recently-started">Paling Baru Dimulai</option>
            <option value="name">Nama Proyek A–Z</option>
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-sm font-medium text-slate-600" aria-live="polite">
            Menampilkan {filteredProjects.length}{" "}
            {filteredProjects.length === 1 ? "proyek" : "proyek"}
          </p>
          {filtersActive && (
            <button
              className="inline-flex min-h-10 items-center rounded-md px-1 text-sm font-semibold text-[#a7470a] underline decoration-[#a7470a]/40 underline-offset-4 hover:text-[#7d3508] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f47721]"
              type="button"
              onClick={clearFilters}
            >
              Hapus filter
            </button>
          )}
        </div>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-3">
          {projects.length >= 20 && (
            <label className="flex min-h-10 items-center gap-2 text-sm text-slate-600">
              <span>Jumlah per halaman</span>
              <select
                aria-label="Jumlah per halaman"
                className="min-h-10 rounded-md border border-slate-300 bg-white px-2 text-sm text-[#142331] outline-none focus:border-[#b74e0d] focus:ring-2 focus:ring-[#b74e0d]/20"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setPage(1);
                }}
              >
                {PAGE_SIZE_OPTIONS.filter((option) => option <= projects.length).map(
                  (option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ),
                )}
              </select>
            </label>
          )}
          {totalPages > 1 && (
            <nav aria-label="Halaman proyek" className="flex items-center gap-2">
              <button
                aria-label="Halaman sebelumnya"
                className="inline-flex size-10 items-center justify-center rounded-md border border-slate-300 bg-white text-[#142331] transition-colors hover:border-[#f47721] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f47721]"
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                <span aria-hidden="true" className="text-xl leading-none">‹</span>
              </button>
              <span className="min-w-20 text-center text-sm font-medium tabular-nums text-slate-600" aria-live="polite">
                {currentPage} / {totalPages}
              </span>
              <button
                aria-label="Halaman berikutnya"
                className="inline-flex size-10 items-center justify-center rounded-md border border-slate-300 bg-white text-[#142331] transition-colors hover:border-[#f47721] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f47721]"
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
              >
                <span aria-hidden="true" className="text-xl leading-none">›</span>
              </button>
            </nav>
          )}
        </div>
      </div>

      {visibleProjects.length > 0 ? (
        <div className="mt-5 grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-7">
          {visibleProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <p className="mt-5 flex min-h-32 items-center justify-center border border-slate-200 bg-white px-5 py-8 text-center text-sm leading-6 text-slate-600">
          Belum ada proyek yang sesuai dengan pencarian Anda. Coba kata kunci lain atau hapus filter.
        </p>
      )}

    </>
  );
}
