"use client";

import Image from "next/image";
import { useState } from "react";
import type { PublicProject } from "@/lib/api";

const monthNames = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export function getProjectPeriod(project: PublicProject): string {
  const startMonth = monthNames[project.start_month - 1];
  const endMonth = monthNames[project.end_month - 1];
  return `${startMonth} ${project.start_year} – ${endMonth} ${project.end_year}`;
}

export function ProjectCard({ project }: { project: PublicProject }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden border border-slate-200 bg-white transition-shadow duration-300 hover:shadow-lg hover:shadow-slate-900/10">
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-[#182a39]">
        {project.image_url && !imageFailed ? (
          <Image
            src={project.image_url}
            alt={`Dokumentasi proyek ${project.title}`}
            fill
            sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 50vw"
            className="object-cover transition-transform duration-500 hover:scale-[1.02] motion-reduce:transform-none motion-reduce:transition-none"
            unoptimized
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            className="flex size-full items-center justify-center text-sm text-white/65"
            role="img"
            aria-label={`Gambar proyek ${project.title} tidak tersedia`}
          >
            Gambar proyek tidak tersedia
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#a7470a]">
          {project.work_type === "dry_pigging"
            ? "Dry Pigging"
            : "Eddy Current Testing (ECT)"}
        </p>
        <h3 className="mt-2 break-words text-xl font-semibold leading-snug text-[#142331] sm:text-2xl">
          {project.title}
        </h3>
        <p className="mt-2 text-sm font-medium text-slate-500">
          {getProjectPeriod(project)}
        </p>
        {project.description && (
          <p className="mt-4 text-sm leading-6 text-slate-600">
            {project.description}
          </p>
        )}
      </div>
    </article>
  );
}
