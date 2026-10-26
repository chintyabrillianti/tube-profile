import { describe, expect, it } from "vitest";
import {
  buildEmailHref,
  buildWhatsAppUrl,
  DEFAULT_WHATSAPP_MESSAGE,
  normalizeWhatsAppNumber,
} from "./contact-links";

describe("contact links", () => {
  it("normalizes an explicitly international WhatsApp number", () => {
    expect(normalizeWhatsAppNumber("+62 (812) 3456-7890")).toBe(
      "6281234567890",
    );
    expect(normalizeWhatsAppNumber("0044 20 1234 5678")).toBe("442012345678");
  });

  it("rejects missing, local, and malformed WhatsApp numbers", () => {
    expect(normalizeWhatsAppNumber(null)).toBeNull();
    expect(normalizeWhatsAppNumber("0812 3456 7890")).toBeNull();
    expect(normalizeWhatsAppNumber("+62")).toBeNull();
    expect(normalizeWhatsAppNumber("+0123456789")).toBeNull();
    expect(normalizeWhatsAppNumber("+999 1234 5678")).toBeNull();
    expect(normalizeWhatsAppNumber("++62 812 3456 7890")).toBeNull();
    expect(normalizeWhatsAppNumber("+62 call 812 3456 7890")).toBeNull();
    expect(buildWhatsAppUrl("0812 3456 7890")).toBeNull();
  });

  it("encodes the exact default message in the WhatsApp URL", () => {
    expect(DEFAULT_WHATSAPP_MESSAGE).toBe(
      "Halo, Brianov Egatara Nirbana Estu.\n\nSaya tertarik untuk mengetahui lebih lanjut mengenai layanan cleaning inner tube/pipe dengan metode dry pigging dan NDT inspeksi tube dengan eddy current testing (ECT).\n\nSaya ingin berkonsultasi mengenai kebutuhan pembersihan pipa/tube untuk perusahaan saya:\n\nMohon informasi lebih lanjut. Terima kasih.",
    );
    expect(buildWhatsAppUrl("+62 812-3456-7890")).toBe(
      `https://wa.me/6281234567890?text=${encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE)}`,
    );
  });

  it("uses the fixed valid message without customer input", () => {
    expect(buildWhatsAppUrl("+62 812-3456-7890")).toBe(
      `https://wa.me/6281234567890?text=${encodeURIComponent(DEFAULT_WHATSAPP_MESSAGE)}`,
    );
  });

  it("builds email links only from available profile fields", () => {
    expect(buildEmailHref(" sales@example.test ")).toBe(
      "mailto:sales@example.test",
    );
    expect(buildEmailHref(null)).toBeNull();
  });
});
