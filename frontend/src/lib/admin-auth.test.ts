import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  prepareCsrf,
  requestAdminPasswordOtp,
} from "@/lib/admin-auth";

vi.mock("@/lib/api", () => ({
  API_URL: "http://localhost:8000/api",
}));

describe("admin authentication API requests", () => {
  beforeEach(() => {
    document.cookie = "XSRF-TOKEN=csrf-token";
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    document.cookie = "";
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("requests the Laravel CSRF cookie from the configured API origin", async () => {
    vi.mocked(fetch).mockResolvedValue(
      new Response(null, { status: 204 }),
    );

    await expect(prepareCsrf()).resolves.toBe("csrf-token");

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:8000/sanctum/csrf-cookie",
      expect.objectContaining({ credentials: "include" }),
    );
  });

  it("reports unreachable or CORS-blocked security API separately from HTTP errors", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("fetch failed"));

    await expect(prepareCsrf()).rejects.toThrow(
      "Tidak dapat menjangkau API keamanan.",
    );
  });

  it.each([
    [503, "Server API mengalami kendala (HTTP 503)."],
    [429, "Terlalu banyak permintaan."],
    [500, "Server API mengalami kendala (HTTP 500)."],
  ])("preserves HTTP %i as an API response instead of a network failure", async (
    status,
    message,
  ) => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(new Response(null, { status }));

    await expect(requestAdminPasswordOtp("admin@example.test")).rejects.toThrow(
      message,
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:8000/api/admin/password/email",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("reports OTP API network failures as connectivity or CORS issues", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockRejectedValueOnce(new TypeError("fetch failed"));

    await expect(
      requestAdminPasswordOtp("admin@example.test"),
    ).rejects.toThrow("Koneksi ke API gagal atau diblokir oleh CORS.");
  });
});
