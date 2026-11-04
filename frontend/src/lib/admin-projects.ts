import { API_URL, type Project } from "@/lib/api";
import { prepareCsrf } from "@/lib/admin-auth";

export interface ProjectChanges {
  title: string;
  work_type: NonNullable<Project["work_type"]>;
  description: string | null;
  start_month: number;
  start_year: number;
  end_month: number;
  end_year: number;
  is_published: boolean;
}

interface ProjectResponse {
  success: boolean;
  data: Project;
}

interface ProjectsResponse {
  success: boolean;
  data: Project[];
}

export class ProjectRequestError extends Error {
  constructor(
    message: string,
    readonly fieldErrors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

const projectFieldLabels: Record<string, string> = {
  title: "Nama proyek",
  work_type: "Jenis pekerjaan",
  description: "Deskripsi pekerjaan",
  start_month: "Bulan mulai",
  start_year: "Tahun mulai",
  end_month: "Bulan selesai",
  end_year: "Tahun selesai",
  is_published: "Status publikasi",
  image: "Gambar proyek",
};

function localizedValidationMessage(field: string, message: string): string {
  const label = projectFieldLabels[field] ?? "Isian";
  if (!message.startsWith("The ")) return message;
  if (/field is required\.$/.test(message)) {
    return `${label} wajib diisi.`;
  }
  if (/must be an integer\.$/.test(message)) {
    return `${label} harus berupa angka bulat.`;
  }
  if (/must be a string\.$/.test(message)) {
    return `${label} harus berupa teks.`;
  }
  if (/must be a boolean\.|must be true or false\.$/i.test(message)) {
    return `Pilih status publikasi yang valid.`;
  }
  if (/must be between 1 and 12\.$/.test(message)) {
    return `${label} harus antara Januari dan Desember.`;
  }
  if (/must be between 1900 and 2200\.$/.test(message)) {
    return `${label} harus berupa tahun antara 1900 dan 2200.`;
  }
  if (/selected .* is invalid\.$/.test(message)) {
    return `Pilih jenis pekerjaan yang tersedia.`;
  }
  if (/must be an image\.$/.test(message)) {
    return "File harus berupa gambar.";
  }
  if (/must be a file of type:/i.test(message)) {
    return "Format gambar harus JPG, PNG, atau WebP.";
  }
  if (/must not be greater than \d+ kilobytes\.$/.test(message)) {
    return "Ukuran gambar maksimal 5 MB.";
  }
  const maxLength = message.match(
    /must not be greater than ([\d,]+) characters\.$/,
  );
  if (maxLength) {
    return `${label} maksimal ${maxLength[1]} karakter.`;
  }
  return `Periksa kembali ${label.toLocaleLowerCase()}.`;
}

async function errorFromResponse(response: Response): Promise<Error> {
  if (response.status === 401 || response.status === 403) {
    return new Error("Sesi admin tidak valid. Silakan masuk kembali.");
  }
  if (response.status === 422) {
    try {
      const result = (await response.json()) as {
        errors?: Record<string, string[]>;
      };
      const fieldErrors = Object.fromEntries(
        Object.entries(result.errors ?? {}).map(([field, messages]) => [
          field,
          messages.map((message) =>
            localizedValidationMessage(field, message),
          ),
        ]),
      );
      const firstMessage = Object.values(fieldErrors).flat()[0];
      return new ProjectRequestError(
        firstMessage ?? "Periksa kembali isian proyek dan file gambar.",
        fieldErrors,
      );
    } catch {
      return new Error("Periksa kembali isian proyek dan file gambar.");
    }
  }
  return new Error("Proyek belum dapat diproses. Coba lagi nanti.");
}

async function projectResponse(response: Response): Promise<Project> {
  if (!response.ok) {
    throw await errorFromResponse(response);
  }

  const result = (await response.json()) as ProjectResponse;
  if (!result.success || !result.data) {
    throw new Error("Respons proyek tidak valid.");
  }

  return result.data;
}

export async function getAdminProjects(): Promise<Project[]> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/admin/projects`, {
      credentials: "include",
      headers: { Accept: "application/json" },
      cache: "no-store",
      referrerPolicy: "same-origin",
    });
  } catch {
    throw new Error("Tidak dapat terhubung ke server proyek.");
  }

  if (!response.ok) {
    throw await errorFromResponse(response);
  }

  const result = (await response.json()) as ProjectsResponse;
  if (!result.success || !Array.isArray(result.data)) {
    throw new Error("Respons daftar proyek tidak valid.");
  }

  return result.data;
}

export async function saveAdminProject(
  changes: ProjectChanges,
  image: File | null,
  projectId?: number,
): Promise<Project> {
  const token = await prepareCsrf();
  const body = new FormData();
  body.set("title", changes.title);
  body.set("work_type", changes.work_type);
  body.set("description", changes.description ?? "");
  body.set("start_month", String(changes.start_month));
  body.set("start_year", String(changes.start_year));
  body.set("end_month", String(changes.end_month));
  body.set("end_year", String(changes.end_year));
  body.set("is_published", changes.is_published ? "1" : "0");
  if (image) {
    body.set("image", image);
  }
  if (projectId) {
    body.set("_method", "PUT");
  }

  let response: Response;
  try {
    response = await fetch(
      projectId
        ? `${API_URL}/admin/projects/${projectId}`
        : `${API_URL}/admin/projects`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-XSRF-TOKEN": token,
        },
        body,
      },
    );
  } catch {
    throw new Error("Tidak dapat terhubung ke server proyek.");
  }

  return projectResponse(response);
}

export async function deleteAdminProject(projectId: number): Promise<void> {
  const token = await prepareCsrf();
  let response: Response;
  try {
    response = await fetch(`${API_URL}/admin/projects/${projectId}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        Accept: "application/json",
        "X-XSRF-TOKEN": token,
      },
    });
  } catch {
    throw new Error("Tidak dapat terhubung ke server proyek.");
  }

  if (!response.ok) {
    throw await errorFromResponse(response);
  }
}
