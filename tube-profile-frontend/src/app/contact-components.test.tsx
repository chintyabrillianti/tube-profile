import {
  cleanup,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import ContactDetails from "./contact-details";
import ContactUsLink from "./contact-us-link";
import { buildWhatsAppUrl } from "@/lib/contact-links";

afterEach(cleanup);

describe("contact components", () => {
  it("does not display the WhatsApp template or an input on the page", () => {
    render(
      <ContactUsLink
        whatsappNumber="+62 812-3456-7890"
        className="contact-button"
      >
        Contact Us
      </ContactUsLink>,
    );

    expect(screen.queryByRole("textbox")).toBeNull();
    expect(screen.queryByText(/Brianov Egatara Nirbana Estu/)).toBeNull();
    expect(screen.queryByText(/Saya tertarik untuk mengetahui lebih lanjut/)).toBeNull();
  });

  it("uses the latest profile number and falls back to Contact for invalid data", () => {
    const { rerender } = render(
      <ContactUsLink
        whatsappNumber="+62 812-3456-7890"
        className="contact-button"
      >
        Contact Us
      </ContactUsLink>,
    );

    expect(
      screen.getByRole("link", { name: "Contact Us" }).getAttribute("href"),
    ).toBe(buildWhatsAppUrl("+62 812-3456-7890"));

    rerender(
      <ContactUsLink
        whatsappNumber="+44 20 1234 5678"
        className="contact-button"
      >
        Contact Us
      </ContactUsLink>,
    );
    expect(
      screen.getByRole("link", { name: "Contact Us" }).getAttribute("href"),
    ).toBe(buildWhatsAppUrl("+44 20 1234 5678"));

    rerender(
      <ContactUsLink
        whatsappNumber="0812 3456 7890"
        fallbackHref="#contact"
        className="contact-button"
      >
        Contact Us
      </ContactUsLink>,
    );
    expect(
      screen.getByRole("link", { name: "Contact Us" }).getAttribute("href"),
    ).toBe("#contact");

    rerender(
      <ContactUsLink
        whatsappNumber="0812 3456 7890"
        className="contact-button"
      >
        Contact Us
      </ContactUsLink>,
    );
    expect(screen.queryByRole("link", { name: "Contact Us" })).toBeNull();
  });

  it("shows only address, email, and valid WhatsApp contact details", () => {
    render(
      <ContactDetails
        address="Factory road"
        email="contact@example.test"
        whatsappNumber="+62 812 3456 7890"
      />,
    );

    expect(
      screen.getByRole("link", { name: "contact@example.test" }).getAttribute("href"),
    ).toBe("mailto:contact@example.test");
    expect(
      screen.getByRole("link", { name: "+62 812 3456 7890" }).getAttribute("href"),
    ).toBe(buildWhatsAppUrl("+62 812 3456 7890"));
    expect(screen.queryByText("Phone")).toBeNull();
    expect(screen.queryByText("Website")).toBeNull();
    expect(screen.queryByText("Business hours")).toBeNull();
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("does not display an invalid WhatsApp number", () => {
    render(
      <ContactDetails
        address="Factory road"
        email={null}
        whatsappNumber="0812 3456 7890"
      />,
    );

    expect(screen.getByText("Factory road")).toBeTruthy();
    expect(screen.queryByText("WhatsApp")).toBeNull();
    expect(screen.queryByText("0812 3456 7890")).toBeNull();
  });
});
