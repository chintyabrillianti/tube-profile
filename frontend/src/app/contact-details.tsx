import { buildEmailHref, buildWhatsAppUrl } from "@/lib/contact-links";

interface ContactDetailsProps {
  address: string | null;
  email: string | null;
  whatsappNumber: string | null;
}

export default function ContactDetails({
  address,
  email,
  whatsappNumber,
}: ContactDetailsProps) {
  const items = [
    { label: "Alamat", value: address, href: null },
    { label: "Email", value: email, href: buildEmailHref(email) },
    {
      label: "WhatsApp",
      value: whatsappNumber,
      href: buildWhatsAppUrl(whatsappNumber),
    },
  ].filter(
    (item) =>
      item.value?.trim() && (item.label !== "WhatsApp" || item.href !== null),
  );

  if (items.length === 0) {
    return (
      <p className="mt-3 text-sm leading-6 text-slate-400">
        Informasi kontak belum tersedia.
      </p>
    );
  }

  return (
    <dl className="mt-3 grid gap-3 text-sm leading-6 text-slate-300">
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {item.label}
          </dt>
          <dd className="mt-1 break-words">
            {item.href ? (
              <a
                href={item.href}
                target={item.label === "WhatsApp" ? "_blank" : undefined}
                rel={
                  item.label === "WhatsApp"
                    ? "noopener noreferrer"
                    : undefined
                }
                className="underline decoration-white/40 underline-offset-4 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f47721]"
              >
                {item.value}
              </a>
            ) : (
              item.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
