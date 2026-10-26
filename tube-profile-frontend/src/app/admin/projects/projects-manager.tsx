"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  deleteAdminProject,
  getAdminProjects,
  ProjectRequestError,
  saveAdminProject,
} from "@/lib/admin-projects";
import type { Project, ProjectWorkType } from "@/lib/api";

const months = [
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

const fieldClassName =
  "min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-[#142331] outline-none focus:border-[#b74e0d] focus:ring-2 focus:ring-[#b74e0d]/20";
const labelClassName = "mb-2 block text-sm font-medium text-slate-700";
interface ProjectFormValues {
  title: string;
  work_type: ProjectWorkType | "";
  description: string | null;
  start_month: number | null;
  start_year: number | null;
  end_month: number | null;
  end_year: number | null;
  is_published: boolean;
}

const initialValues: ProjectFormValues = {
  title: "",
  work_type: "",
  description: "",
  start_month: null,
  start_year: null,
  end_month: null,
  end_year: null,
  is_published: false,
};
type ProjectField = keyof ProjectFormValues | "image";

function projectTypeLabel(type: ProjectWorkType | null): string {
  if (type === null) return "Jenis pekerjaan belum dilengkapi";
  return type === "dry_pigging" ? "Dry Pigging" : "Eddy Current Testing (ECT)";
}

function projectPeriod(project: Project): string {
  if (
    project.start_month === null ||
    project.start_year === null ||
    project.end_month === null ||
    project.end_year === null
  ) {
    return "Periode belum dilengkapi";
  }
  const startMonth = months[project.start_month - 1];
  const endMonth = months[project.end_month - 1];
  return `${startMonth} ${project.start_year} – ${endMonth} ${project.end_year}`;
}

function messageFromError(cause: unknown): string {
  return cause instanceof Error
    ? cause.message
    : "Proyek belum dapat diproses. Coba lagi nanti.";
}

export default function ProjectsManager() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<ProjectField, string>>
  >({});
  const [isListFailed, setIsListFailed] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [values, setValues] = useState<ProjectFormValues>(initialValues);
  const [image, setImage] = useState<File | null>(null);
  const [imageInputKey, setImageInputKey] = useState(0);

  useEffect(() => {
    let active = true;

    getAdminProjects()
      .then((loadedProjects) => {
        if (active) setProjects(loadedProjects);
      })
      .catch((cause: unknown) => {
        if (!active) return;
        setIsListFailed(true);
        const message = messageFromError(cause);
        setError(message);
        if (message.startsWith("Sesi admin tidak valid")) {
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

  async function handleReload() {
    setIsLoading(true);
    setError("");
    setIsListFailed(false);
    try {
      setProjects(await getAdminProjects());
    } catch (cause) {
      setIsListFailed(true);
      const message = messageFromError(cause);
      setError(message);
      if (message.startsWith("Sesi admin tidak valid")) {
        router.replace("/admin/login");
      }
    } finally {
      setIsLoading(false);
    }
  }

  function clearFieldError(field: ProjectField) {
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  function startCreate() {
    setEditing(null);
    setValues(initialValues);
    setImage(null);
    setImageInputKey((key) => key + 1);
    setError("");
    setFieldErrors({});
  }

  function startEdit(project: Project) {
    setEditing(project);
    setValues({
      title: project.title,
      work_type: project.work_type ?? "",
      description: project.description ?? "",
      start_month: project.start_month,
      start_year: project.start_year,
      end_month: project.end_month,
      end_year: project.end_year,
      is_published: project.is_published,
    });
    setImage(null);
    setImageInputKey((key) => key + 1);
    setError("");
    setFieldErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const nextErrors: Partial<Record<ProjectField, string>> = {};

    if ((!editing || !editing.image_url) && !image) {
      nextErrors.image = "Gambar proyek wajib diunggah.";
    }
    if (!values.title.trim()) {
      nextErrors.title = "Nama proyek wajib diisi.";
    }
    if (!values.work_type) {
      nextErrors.work_type = "Pilih Dry Pigging atau Eddy Current Testing (ECT).";
    }
    if (values.start_month === null) {
      nextErrors.start_month = "Pilih bulan mulai.";
    }
    if (
      values.start_year === null ||
      !Number.isInteger(values.start_year) ||
      values.start_year < 1900 ||
      values.start_year > 2200
    ) {
      nextErrors.start_year = "Masukkan tahun mulai berupa angka antara 1900 dan 2200.";
    }
    if (values.end_month === null) {
      nextErrors.end_month = "Pilih bulan selesai.";
    }
    if (
      values.end_year === null ||
      !Number.isInteger(values.end_year) ||
      values.end_year < 1900 ||
      values.end_year > 2200
    ) {
      nextErrors.end_year = "Masukkan tahun selesai berupa angka antara 1900 dan 2200.";
    }
    if (
      image &&
      (!["image/jpeg", "image/png", "image/webp"].includes(image.type) ||
        image.size > 5 * 1024 * 1024)
    ) {
      nextErrors.image = "Pilih gambar JPG, PNG, atau WebP dengan ukuran maksimal 5 MB.";
    }
    if (
      values.start_year !== null &&
      values.start_month !== null &&
      values.end_year !== null &&
      values.end_month !== null &&
      values.end_year * 12 + values.end_month <
        values.start_year * 12 + values.start_month
    ) {
      nextErrors.end_month =
        "Periode selesai harus sama dengan atau setelah periode mulai.";
    }

    setFieldErrors(nextErrors);
    if (
      Object.keys(nextErrors).length > 0 ||
      !values.work_type ||
      values.start_month === null ||
      values.start_year === null ||
      values.end_month === null ||
      values.end_year === null
    ) {
      return;
    }

    setIsSaving(true);
    try {
      const savedProject = await saveAdminProject(
        {
          title: values.title,
          work_type: values.work_type,
          description: values.description,
          start_month: values.start_month,
          start_year: values.start_year,
          end_month: values.end_month,
          end_year: values.end_year,
          is_published: values.is_published,
        },
        image,
        editing?.id,
      );
      setProjects((current) =>
        editing
          ? current.map((project) =>
              project.id === savedProject.id ? savedProject : project,
            )
          : [savedProject, ...current],
      );
      startCreate();
    } catch (cause) {
      const message = messageFromError(cause);
      if (cause instanceof ProjectRequestError) {
        setFieldErrors(
          Object.fromEntries(
            Object.entries(cause.fieldErrors).map(([field, messages]) => [
              field,
              messages[0],
            ]),
          ) as Partial<Record<ProjectField, string>>,
        );
        if (Object.keys(cause.fieldErrors).length === 0) {
          setError(message);
        }
      } else {
        setError(message);
      }
      if (message.startsWith("Sesi admin tidak valid")) {
        router.replace("/admin/login");
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(project: Project) {
    if (!window.confirm(`Hapus proyek "${project.title}"? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    setError("");
    try {
      await deleteAdminProject(project.id);
      setProjects((current) =>
        current.filter((item) => item.id !== project.id),
      );
      if (editing?.id === project.id) {
        startCreate();
      }
    } catch (cause) {
      const message = messageFromError(cause);
      setError(message);
      if (message.startsWith("Sesi admin tidak valid")) {
        router.replace("/admin/login");
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a7470a]">
          Pengaturan perusahaan
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#142331] sm:text-3xl">
          Kelola Proyek
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Tambahkan dan perbarui proyek yang ditampilkan pada situs web publik.
        </p>

        {error && (
          <p className="mt-6 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
            {isListFailed && (
              <button
                className="ml-2 font-semibold underline"
                type="button"
                onClick={() => void handleReload()}
              >
                Coba lagi
              </button>
            )}
          </p>
        )}

        <form className="mt-8 space-y-5 border-b border-slate-200 pb-8" onSubmit={handleSubmit}>
          <h2 className="text-xl font-semibold text-[#142331]">
            {editing ? "Ubah proyek" : "Tambah proyek"}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClassName} htmlFor="project-title">
                Nama proyek
              </label>
              <input
                className={fieldClassName}
                id="project-title"
                maxLength={200}
                required
                value={values.title}
                onChange={(event) => {
                  setValues((current) => ({ ...current, title: event.target.value }))
                  clearFieldError("title");
                }}
              />
              {fieldErrors.title && (
                <p className="mt-1 text-sm text-red-700" role="alert">{fieldErrors.title}</p>
              )}
            </div>
            <div>
              <label className={labelClassName} htmlFor="project-work-type">
                Jenis pekerjaan
              </label>
              <select
                className={fieldClassName}
                id="project-work-type"
                value={values.work_type}
                onChange={(event) => {
                  setValues((current) => ({
                    ...current,
                    work_type:
                      event.target.value === "ect"
                        ? "ect"
                        : event.target.value === "dry_pigging"
                          ? "dry_pigging"
                          : "",
                  }))
                  clearFieldError("work_type");
                }}
              >
                <option value="">Pilih jenis pekerjaan</option>
                <option value="dry_pigging">Dry Pigging</option>
                <option value="ect">Eddy Current Testing (ECT)</option>
              </select>
              {fieldErrors.work_type && (
                <p className="mt-1 text-sm text-red-700" role="alert">{fieldErrors.work_type}</p>
              )}
            </div>
          </div>
          <div>
            <label className={labelClassName} htmlFor="project-description">
              Deskripsi singkat pekerjaan (opsional)
            </label>
            <textarea
              className="min-h-28 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-[#142331] outline-none focus:border-[#b74e0d] focus:ring-2 focus:ring-[#b74e0d]/20"
              id="project-description"
              maxLength={5000}
              value={values.description ?? ""}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-slate-700">
              Periode pengerjaan
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid grid-cols-[1fr_0.75fr] gap-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-600" htmlFor="start-month">
                    Bulan mulai
                  </label>
                  <select
                    className={fieldClassName}
                    id="start-month"
                    required
                    value={values.start_month ?? ""}
                    onChange={(event) => {
                      setValues((current) => ({
                        ...current,
                        start_month: event.target.value
                          ? Number(event.target.value)
                          : null,
                      }))
                      clearFieldError("start_month");
                    }}
                  >
                    <option value="">Pilih bulan</option>
                    {months.map((month, index) => (
                      <option key={month} value={index + 1}>{month}</option>
                    ))}
                  </select>
                  {fieldErrors.start_month && (
                    <p className="mt-1 text-sm text-red-700" role="alert">{fieldErrors.start_month}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-600" htmlFor="start-year">
                    Tahun mulai
                  </label>
                  <input
                    className={fieldClassName}
                    id="start-year"
                    max={2200}
                    min={1900}
                    required
                    type="number"
                    value={values.start_year ?? ""}
                    onChange={(event) => {
                      setValues((current) => ({
                        ...current,
                        start_year: event.target.value
                          ? Number(event.target.value)
                          : null,
                      }))
                      clearFieldError("start_year");
                    }}
                  />
                  {fieldErrors.start_year && (
                    <p className="mt-1 text-sm text-red-700" role="alert">{fieldErrors.start_year}</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-[1fr_0.75fr] gap-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-600" htmlFor="end-month">
                    Bulan selesai
                  </label>
                  <select
                    className={fieldClassName}
                    id="end-month"
                    required
                    value={values.end_month ?? ""}
                    onChange={(event) => {
                      setValues((current) => ({
                        ...current,
                        end_month: event.target.value
                          ? Number(event.target.value)
                          : null,
                      }))
                      clearFieldError("end_month");
                    }}
                  >
                    <option value="">Pilih bulan</option>
                    {months.map((month, index) => (
                      <option key={month} value={index + 1}>{month}</option>
                    ))}
                  </select>
                  {fieldErrors.end_month && (
                    <p className="mt-1 text-sm text-red-700" role="alert">{fieldErrors.end_month}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-600" htmlFor="end-year">
                    Tahun selesai
                  </label>
                  <input
                    className={fieldClassName}
                    id="end-year"
                    max={2200}
                    min={1900}
                    required
                    type="number"
                    value={values.end_year ?? ""}
                    onChange={(event) => {
                      setValues((current) => ({
                        ...current,
                        end_year: event.target.value
                          ? Number(event.target.value)
                          : null,
                      }))
                      clearFieldError("end_year");
                    }}
                  />
                  {fieldErrors.end_year && (
                    <p className="mt-1 text-sm text-red-700" role="alert">{fieldErrors.end_year}</p>
                  )}
                </div>
              </div>
            </div>
          </fieldset>
          <div>
            <label className={labelClassName} htmlFor="project-image">
              Gambar proyek {editing ? "(opsional jika tidak diganti)" : ""}
            </label>
            {editing?.image_url && (
              <div className="mb-3 flex items-center gap-3">
                <Image
                  alt={`Gambar proyek ${editing.title}`}
                  className="size-20 rounded object-cover"
                  height={80}
                  src={editing.image_url}
                  unoptimized
                  width={80}
                />
                <span className="text-sm text-slate-600">Gambar saat ini</span>
              </div>
            )}
            <input
              key={imageInputKey}
              accept="image/jpeg,image/png,image/webp"
              className="block w-full text-sm text-slate-600 file:mr-4 file:min-h-10 file:rounded-md file:border-0 file:bg-slate-100 file:px-4 file:font-medium file:text-[#142331]"
              id="project-image"
              required={!editing?.image_url}
              type="file"
              onChange={(event) =>
                {
                  setImage(event.target.files?.[0] ?? null);
                  clearFieldError("image");
                }
              }
            />
            <p className="mt-1 text-xs text-slate-500">
              JPG, PNG, atau WebP; ukuran maksimal 5 MB.
            </p>
            {fieldErrors.image && (
              <p className="mt-1 text-sm text-red-700" role="alert">{fieldErrors.image}</p>
            )}
          </div>
          <label className="flex min-h-10 items-center gap-3 text-sm text-slate-700">
            <input
              checked={values.is_published}
              className="size-4 accent-[#b74e0d]"
              type="checkbox"
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  is_published: event.target.checked,
                }))
              }
            />
            Tampilkan proyek pada situs web publik
          </label>
          {fieldErrors.is_published && (
            <p className="text-sm text-red-700" role="alert">
              {fieldErrors.is_published}
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#b74e0d] px-5 text-sm font-semibold text-white hover:bg-[#9f4006] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? "Menyimpan..." : editing ? "Simpan perubahan" : "Tambah proyek"}
            </button>
            {editing && (
              <button
                className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-[#142331] hover:bg-slate-50"
                type="button"
                onClick={startCreate}
              >
                Batal
              </button>
            )}
          </div>
        </form>

        <section className="pt-8" aria-labelledby="admin-projects-list">
          <h2 className="text-xl font-semibold text-[#142331]" id="admin-projects-list">
            Daftar proyek
          </h2>
          {isLoading ? (
            <p className="mt-5 text-sm text-slate-600" role="status">Memuat proyek...</p>
          ) : isListFailed ? (
            <p className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Daftar proyek belum dapat dimuat.
            </p>
          ) : projects.length === 0 ? (
            <p className="mt-5 rounded-md border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Belum ada proyek. Tambahkan proyek untuk mengelola portofolio publik.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-slate-200">
              {projects.map((project) => (
                <li className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center" key={project.id}>
                  {project.image_url ? (
                    <Image
                      alt={`Gambar proyek ${project.title}`}
                      className="size-20 rounded object-cover"
                      height={80}
                      src={project.image_url}
                      unoptimized
                      width={80}
                    />
                  ) : (
                    <div className="flex size-20 items-center justify-center rounded bg-slate-100 text-center text-xs text-slate-500">
                      Belum ada gambar
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-[#142331]">{project.title}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      {projectTypeLabel(project.work_type)} · {projectPeriod(project)}
                    </p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      {project.is_published ? "Ditampilkan di situs web publik" : "Draf"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="min-h-10 rounded-md border border-slate-300 px-4 text-sm font-medium text-[#142331] hover:bg-slate-50"
                      type="button"
                      onClick={() => startEdit(project)}
                    >
                      Ubah
                    </button>
                    <button
                      className="min-h-10 rounded-md border border-red-200 px-4 text-sm font-medium text-red-700 hover:bg-red-50"
                      type="button"
                      onClick={() => void handleDelete(project)}
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </div>
  );
}
