import "server-only";

import type {
  ApiResponse,
  CompanyProfile,
  PublicProject,
  Service,
} from "@/lib/api";

const API_SERVER_URL =
  process.env.API_SERVER_URL ?? "http://127.0.0.1:8000/api";

async function fetchApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_SERVER_URL}/${endpoint}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Gagal mengambil data API: ${endpoint}`);
  }

  const result: ApiResponse<T> = await response.json();

  if (!result.success || !Array.isArray(result.data)) {
    throw new Error(`Respons API tidak valid: ${endpoint}`);
  }

  return result.data;
}

export async function getCompanyProfiles(): Promise<CompanyProfile[]> {
  return fetchApi<CompanyProfile[]>("company-profiles");
}

export async function getServices(): Promise<Service[]> {
  return fetchApi<Service[]>("services");
}

export async function getProjects(): Promise<PublicProject[]> {
  return fetchApi<PublicProject[]>("projects");
}
