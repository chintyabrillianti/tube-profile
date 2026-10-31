import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getCompanyProfiles } from "@/lib/api";

describe("public company profile API", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("loads public profile fields without caching", async () => {
    const profile = {
      id: 1,
      legal_name: "Company legal name",
      display_name: "Company display name",
      slug: "company",
      background: "Current company background",
      vision: "Current vision",
      mission: "Current mission",
      address: "Company address",
      email: "contact@example.test",
      whatsapp_number: "+6281234567890",
      website_url: "https://bene.example",
      business_hours: {},
    };
    vi.mocked(fetch).mockResolvedValue(
      Response.json({ success: true, data: [profile] }),
    );

    await expect(getCompanyProfiles()).resolves.toEqual([profile]);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/company-profiles$/),
      { cache: "no-store" },
    );
  });

  it("rejects malformed profile API responses instead of falling back to stale content", async () => {
    vi.mocked(fetch).mockResolvedValue(
      Response.json({ success: false, data: null }),
    );

    await expect(getCompanyProfiles()).rejects.toThrow(
      "Respons profil perusahaan tidak valid.",
    );
  });
});
