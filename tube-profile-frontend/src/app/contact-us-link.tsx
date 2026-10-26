import type { ReactNode } from "react";
import { buildWhatsAppUrl } from "@/lib/contact-links";

interface ContactUsLinkProps {
  whatsappNumber: string | null;
  fallbackHref?: string;
  className: string;
  children: ReactNode;
}

export default function ContactUsLink({
  whatsappNumber,
  fallbackHref,
  className,
  children,
}: ContactUsLinkProps) {
  const whatsappHref = buildWhatsAppUrl(whatsappNumber);
  const href = whatsappHref ?? fallbackHref;

  if (!href) {
    return null;
  }

  return (
    <a
      href={href}
      target={whatsappHref && href === whatsappHref ? "_blank" : undefined}
      rel={whatsappHref && href === whatsappHref ? "noopener noreferrer" : undefined}
      className={className}
    >
      {children}
    </a>
  );
}
