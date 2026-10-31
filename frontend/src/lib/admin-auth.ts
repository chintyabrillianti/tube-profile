import { API_URL } from "@/lib/api";

const API_ORIGIN = new URL(API_URL).origin;
const API_HOSTNAME = new URL(API_URL).hostname;

export interface AdminUser {
  id: number;
  name: string;
  email: string;
}

interface UserResponse {
  data: AdminUser;
}

function csrfToken(): string | null {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith("XSRF-TOKEN="));

  return cookie ? decodeURIComponent(cookie.slice("XSRF-TOKEN=".length)) : null;
}

export async function prepareCsrf(): Promise<string> {
  if (window.location.hostname !== API_HOSTNAME) {
    throw new Error(
      `Buka situs web menggunakan host ${API_HOSTNAME} agar cookie keamanan dapat digunakan.`,
    );
  }

  const response = await fetch(`${API_ORIGIN}/sanctum/csrf-cookie`, {
    credentials: "include",
    headers: { Accept: "application/json" },
    cache: "no-store",
  }).catch(() => {
    throw new Error(
      "Tidak dapat menjangkau API keamanan. Pastikan Laravel berjalan dan CORS mengizinkan alamat frontend.",
    );
  });

  if (!response.ok) {
    if (response.status === 419) {
      throw new Error(
        "Sesi keamanan kedaluwarsa. Muat ulang halaman lalu coba lagi.",
      );
    }
    if (response.status === 429) {
      throw new Error(
        "Terlalu banyak permintaan ke layanan keamanan. Tunggu sebentar lalu coba lagi.",
      );
    }
    if (response.status >= 500) {
      throw new Error(
        `Server keamanan mengalami kendala (HTTP ${response.status}). Coba lagi nanti.`,
      );
    }
    throw new Error(
      `Sesi keamanan tidak dapat dimulai (HTTP ${response.status}). Coba lagi nanti.`,
    );
  }

  const token = csrfToken();
  if (!token) {
    throw new Error(
      "Token keamanan tidak tersedia. Pastikan frontend dan API memakai host yang sama.",
    );
  }

  return token;
}

export async function loginAdmin(
  email: string,
  password: string,
  remember = false,
): Promise<void> {
  const token = await prepareCsrf();
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-XSRF-TOKEN": token,
    },
    body: JSON.stringify({ email, password, remember }),
  }).catch(() => {
    throw new Error(
      "Koneksi ke API gagal atau diblokir oleh CORS. Pastikan Laravel berjalan dan CORS mengizinkan alamat frontend.",
    );
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 422) {
      throw new Error("Email atau kata sandi tidak sesuai.");
    }
    if (response.status === 419) {
      throw new Error(
        "Sesi keamanan kedaluwarsa. Muat ulang halaman lalu coba lagi.",
      );
    }
    if (response.status === 429) {
      throw new Error(
        "Terlalu banyak percobaan masuk. Tunggu sebentar lalu coba lagi.",
      );
    }
    throw new Error(
      "Proses masuk belum dapat dilakukan. Coba lagi nanti atau hubungi pengelola.",
    );
  }
}

async function postPasswordEndpoint(
  endpoint: "password/email" | "password/verify-otp" | "password/reset",
  body: Record<string, string>,
): Promise<void> {
  const token = await prepareCsrf();
  const response = await fetch(`${API_URL}/admin/${endpoint}`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-XSRF-TOKEN": token,
    },
    body: JSON.stringify(body),
  }).catch(() => {
    throw new Error(
      "Koneksi ke API gagal atau diblokir oleh CORS. Pastikan Laravel berjalan dan CORS mengizinkan alamat frontend.",
    );
  });

  if (response.ok) {
    return;
  }

  if (response.status === 429) {
    throw new Error(
      "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.",
    );
  }
  if (response.status === 419) {
    throw new Error(
      "Sesi keamanan kedaluwarsa. Muat ulang halaman lalu coba lagi.",
    );
  }
  if (response.status === 422) {
    throw new Error(
      endpoint === "password/verify-otp"
        ? "Kode verifikasi tidak valid atau telah kedaluwarsa."
        : endpoint === "password/reset"
          ? "Verifikasi tidak valid atau telah kedaluwarsa, atau kata sandi belum memenuhi persyaratan."
          : "Masukkan alamat email yang valid.",
    );
  }

  if (response.status >= 500) {
    throw new Error(
      `Server API mengalami kendala (HTTP ${response.status}). Coba lagi nanti.`,
    );
  }

  throw new Error("Permintaan belum dapat diproses. Coba lagi nanti.");
}

export async function requestAdminPasswordOtp(email: string): Promise<void> {
  return postPasswordEndpoint("password/email", { email });
}

interface OtpVerificationResponse {
  data: {
    reset_token: string;
  };
}

export async function verifyAdminPasswordOtp(
  email: string,
  otp: string,
): Promise<string> {
  const csrf = await prepareCsrf();
  const response = await fetch(`${API_URL}/admin/password/verify-otp`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-XSRF-TOKEN": csrf,
    },
    body: JSON.stringify({ email, otp }),
  }).catch(() => {
    throw new Error(
      "Koneksi ke API gagal atau diblokir oleh CORS. Pastikan Laravel berjalan dan CORS mengizinkan alamat frontend.",
    );
  });

  if (response.status === 429) {
    throw new Error(
      "Terlalu banyak percobaan. Tunggu sebentar sebelum mencoba lagi.",
    );
  }
  if (response.status === 422) {
    throw new Error("Kode verifikasi tidak valid atau telah kedaluwarsa.");
  }
  if (response.status === 419) {
    throw new Error(
      "Sesi keamanan kedaluwarsa. Muat ulang halaman lalu coba lagi.",
    );
  }
  if (response.status >= 500) {
    throw new Error(
      `Server API mengalami kendala (HTTP ${response.status}). Coba lagi nanti.`,
    );
  }
  if (!response.ok) {
    throw new Error("Kode belum dapat diverifikasi. Coba lagi nanti.");
  }

  const result = (await response.json()) as OtpVerificationResponse;
  if (typeof result.data?.reset_token !== "string") {
    throw new Error("Respons verifikasi tidak valid. Minta kode baru.");
  }

  return result.data.reset_token;
}

export async function resetAdminPassword(
  email: string,
  token: string,
  password: string,
  passwordConfirmation: string,
): Promise<void> {
  return postPasswordEndpoint("password/reset", {
    email,
    token,
    password,
    password_confirmation: passwordConfirmation,
  });
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const response = await fetch(`${API_URL}/user`, {
    credentials: "include",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Tidak dapat memeriksa sesi admin.");
  }

  const result = (await response.json()) as UserResponse;
  return result.data;
}

export async function logoutAdmin(): Promise<void> {
  const token = await prepareCsrf();
  const response = await fetch(`${API_URL}/logout`, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
      "X-XSRF-TOKEN": token,
    },
  });

  if (!response.ok) {
    throw new Error("Gagal keluar. Coba lagi.");
  }
}
