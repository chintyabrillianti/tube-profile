import { API_URL, type CompanyProfile } from "@/lib/api";
import { prepareCsrf } from "@/lib/admin-auth";

export type AdminCompanyProfile = Pick<
CompanyProfile,
| "legal_name"
| "display_name"
| "slug"
| "background"
| "vision"
| "mission"
| "address"
| "email"
| "whatsapp_number"
| "website_url"
| "business_hours"
> & {
updated_by: number | null;
};

export type AdminCompanyProfileChanges = Pick<
AdminCompanyProfile,
| "legal_name"
| "display_name"
| "background"
| "vision"
| "mission"
| "address"
| "email"
| "whatsapp_number"
| "website_url"
>;

interface ProfileResponse {
success: boolean;
data: AdminCompanyProfile;
}

function responseError(status: number): Error {
if (status === 401) {
  return new Error("Sesi admin telah berakhir. Silakan masuk kembali.");
}
if (status === 403) {
  return new Error("Akses pengelolaan profil hanya tersedia untuk admin.");
}
if (status === 404) {
  return new Error("Data profil perusahaan belum tersedia untuk dikelola.");
}
if (status === 419) {
  return new Error(
    "Sesi keamanan kedaluwarsa. Muat ulang halaman lalu coba lagi.",
  );
}
if (status === 422) {
  return new Error(
    "Beberapa isian belum valid. Periksa kembali nama, teks, email, dan URL situs web.",
  );
}
if (status === 429) {
  return new Error("Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.");
}

return new Error("Profil belum dapat diproses. Coba lagi nanti.");
}

async function readProfileResponse(response: Response): Promise<AdminCompanyProfile> {
if (!response.ok) {
  throw responseError(response.status);
}

let result: ProfileResponse;
try {
  result = await response.json();
} catch {
  throw new Error("Respons profil perusahaan tidak valid.");
}

if (!result.success || !result.data) {
  throw new Error("Respons profil perusahaan tidak valid.");
}

return result.data;
}

export async function getAdminCompanyProfile(): Promise<AdminCompanyProfile> {
  let response: Response;

  try {
    response = await fetch(`${API_URL}/admin/company-profile`, {
      credentials: "include",
      headers: { Accept: "application/json" },
      cache: "no-store",
      referrerPolicy: "same-origin",
    });
} catch {
  throw new Error(
    "Tidak dapat terhubung ke server profil. Periksa koneksi dan coba lagi.",
  );
}

return readProfileResponse(response);
}

export async function updateAdminCompanyProfile(
changes: AdminCompanyProfileChanges,
): Promise<AdminCompanyProfile> {
const token = await prepareCsrf();
let response: Response;

try {
  response = await fetch(`${API_URL}/admin/company-profile`, {
    method: "PUT",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-XSRF-TOKEN": token,
    },
    body: JSON.stringify(changes),
  });
} catch {
  throw new Error(
    "Tidak dapat menyimpan profil karena server tidak terjangkau. Periksa koneksi lalu coba lagi.",
  );
}

return readProfileResponse(response);
}
