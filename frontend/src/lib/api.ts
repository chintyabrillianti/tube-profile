export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

export interface CompanyProfile {
  id: number;
  legal_name: string;
  display_name: string;
  slug: string;
  background: string;
  vision: string;
  mission: string;
  address: string;
  email: string | null;
  whatsapp_number: string | null;
  website_url: string | null;
  business_hours: Record<string, string>;
}

export interface Service {
  id: number;
  name: string;
  slug: string;
  summary: string | null;
  description: string;
  sort_order: number;
}

export type ProjectWorkType = "dry_pigging" | "ect";

export interface Project {
  id: number;
  title: string;
  slug: string;
  work_type: ProjectWorkType | null;
  description: string | null;
  start_month: number | null;
  start_year: number | null;
  end_month: number | null;
  end_year: number | null;
  image_url: string | null;
  is_published: boolean;
}

export interface PublicProject extends Project {
  work_type: ProjectWorkType;
  start_month: number;
  start_year: number;
  end_month: number;
  end_year: number;
  image_url: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function getCompanyProfiles(): Promise<CompanyProfile[]> {
  const response = await fetch(`${API_URL}/company-profiles`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil profil perusahaan.");
  }

  const result: ApiResponse<CompanyProfile[]> = await response.json();
  if (!result.success || !Array.isArray(result.data)) {
    throw new Error("Respons profil perusahaan tidak valid.");
  }

  return result.data;
}

export async function getServices(): Promise<Service[]> {
  const response = await fetch(`${API_URL}/services`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil layanan.");
  }

  const result: ApiResponse<Service[]> = await response.json();
  if (!result.success || !Array.isArray(result.data)) {
    throw new Error("Respons layanan tidak valid.");
  }

  return result.data;
}

export async function getProjects(): Promise<PublicProject[]> {
  const response = await fetch(`${API_URL}/projects`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Gagal mengambil daftar proyek.");
  }

  const result: ApiResponse<PublicProject[]> = await response.json();
  if (!result.success || !Array.isArray(result.data)) {
    throw new Error("Respons daftar proyek tidak valid.");
  }

  return result.data;
}
