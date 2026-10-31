import BrandMark from "./brand-mark";
import SiteHeader from "./site-header";
import ContactUsLink from "./contact-us-link";
import ContactDetails from "./contact-details";
import PriceEstimatorTrigger from "./price-estimator-trigger";
import ProjectCarousel from "./projects/project-carousel";
import Image from "next/image";
import {
  getCompanyProfiles,
  getProjects,
} from "@/lib/server-api";
import { normalizeWhatsAppNumber } from "@/lib/contact-links";
import { connection } from "next/server";

const advantages = [
  {
    number: "01",
    title: "Siap Memenuhi Kebutuhan Anda",
    description:
      "Pekerjaan dilakukan sesuai spesifikasi dan kriteria penerimaan yang telah disepakati.",
  },
  {
    number: "02",
    title: "Proses Cleaning dan Inspeksi Terukur",
    description:
      "Lingkup kerja dan kriteria penerimaan disepakati sebelum pekerjaan dimulai.",
  },
  {
    number: "03",
    title: "Tepat Waktu dan Bergaransi",
    description:
      "Setiap proyek dilaksanakan berdasarkan lingkup kerja, kriteria penerimaan, dan ketentuan layanan yang disepakati.",
  },
] as const;

const featuredServices = [
  {
    number: "01",
    name: "Dry Pigging",
    description:
      "Pembersihan inner tube / pipe menggunakan metode Dry Pigging untuk membantu mengangkat endapan dan residu.",
    icon: "pipe",
  },
  {
    number: "02",
    name: "Eddy Current Testing (ECT)",
    description:
      "Inspeksi tube tanpa merusak untuk membantu menilai kondisi tube dan mengidentifikasi indikasi yang memerlukan evaluasi lebih lanjut.",
    icon: "clean",
  },
] as const;

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      className="size-4"
    >
      {diagonal ? (
        <path
          d="M5 15 15 5M6 5h9v9"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M3.5 10h12m-5-5 5 5-5 5"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

function ServiceIcon({
  name,
}: {
  name: "tube" | "pipe" | "clean";
}) {
  if (name === "tube") {
    return (
      <svg viewBox="0 0 32 32" fill="none" className="size-7">
        <path
          d="M10 4v24M22 4v24M10 10h12M10 22h12"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <circle cx="10" cy="7" r="2.2" fill="currentColor" />
        <circle cx="22" cy="25" r="2.2" fill="currentColor" />
      </svg>
    );
  }

  if (name === "pipe") {
    return (
      <svg viewBox="0 0 32 32" fill="none" className="size-7">
        <path
          d="M5 11h22v10H5zM9 11V7h14v4M9 21v4h14v-4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
        <path
          d="M12 16h8"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32" fill="none" className="size-7">
      <path
        d="M16 4.5 26 9v6.5c0 6.2-4.2 10-10 12-5.8-2-10-5.8-10-12V9l10-4.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
      <path
        d="m11.5 16 3 3 6-6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TubeIllustration() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-[1.4] w-full max-w-[570px] overflow-hidden rounded-2xl border border-white/10 bg-[#182a39] shadow-2xl shadow-black/20"
    >
      <Image
  src="/bene-hero-baru.jpg"
  alt="Tim teknisi PT Brianov Egatara Nirbana Estu di area industri"
  fill
  priority
  sizes="(max-width: 768px) 100vw, 570px"
  className="object-cover object-center"
/>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_18%,rgba(244,119,33,0.2),transparent_38%),linear-gradient(145deg,transparent_30%,rgba(5,14,23,0.55))]" />
      <div className="absolute left-[12%] top-[13%] h-px w-[76%] bg-white/10" />
      <div className="absolute left-[12%] top-[87%] h-px w-[76%] bg-white/10" />
      <div className="absolute left-[12%] top-[13%] h-[74%] w-px bg-white/10" />
      <div className="absolute right-[12%] top-[13%] h-[74%] w-px bg-white/10" />

      <div className="absolute bottom-[7%] left-[6%] flex items-center gap-3 rounded-lg border border-white/10 bg-[#101d29]/95 px-4 py-3 backdrop-blur">
        <span className="size-2 rounded-full bg-[#f47721]" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75 sm:text-xs">
          DRY PIGGING &amp; EDDY CURRENT TESTING
        </span>
      </div>
      <span className="absolute right-[8%] top-[8%] font-mono text-[10px] tracking-[0.2em] text-white/40 sm:text-xs">
        PETROKIMIA, OIL &amp; GAS
      </span>
    </div>
  );
}


export default async function Home() {
  await connection();

  const [profilesResult, projectsResult] = await Promise.allSettled([
    getCompanyProfiles(),
    getProjects(),
  ]);

  const profiles =
    profilesResult.status === "fulfilled" ? profilesResult.value : [];
  const profileLoadFailed = profilesResult.status === "rejected";
  const projects =
    projectsResult.status === "fulfilled" ? projectsResult.value : [];
  const projectLoadFailed = projectsResult.status === "rejected";

  if (profileLoadFailed) {
    console.error("Gagal memuat profil perusahaan:", profilesResult.reason);
  }
  if (projectLoadFailed) {
    console.error("Gagal memuat daftar proyek:", projectsResult.reason);
  }

  const company = profiles[0];
  const companyName = company?.display_name?.trim() || "BENE";

  return (

    <>
      <SiteHeader />

      <main>
        <section
          id="home"
          aria-labelledby="home-heading"
          className="overflow-hidden bg-[#101d29] text-white"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-9 px-5 py-12 sm:px-8 sm:py-14 md:grid-cols-[1.05fr_0.95fr] md:gap-8 md:py-16 lg:gap-12 lg:px-12 lg:py-20">
            <div className="max-w-2xl">
              <p className="mb-5 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#f47721] sm:text-sm">
                <span className="h-px w-8 bg-[#f47721]" />
                {company?.legal_name || companyName}
              </p>
              <h1 id="home-heading" className="max-w-[16ch] text-4xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-5xl lg:text-[3.5rem]">
                Penyedia Jasa Tube Dan Pipe Cleaning Terbaik di Indonesia
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                PT. BRIANOV EGATARA NIRBANA ESTU merupakan perusahaan kontraktor yang bergerak di bidang jasa pembersihan dan inspeksi tube / pipe di Indonesia.
                Berfokus pada pembersihan tube / pipe cleaning dengan metode Dry Pigging serta inspeksi tube menggunakan Eddy Current Testing (ECT).
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <a
                  href="#services"
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-[#b74e0d] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#9f4006]"
                >
                  Lihat Layanan <ArrowIcon />
                </a>
                <ContactUsLink
                  whatsappNumber={company?.whatsapp_number ?? null}
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/5"
                >
                  Hubungi Kami <ArrowIcon diagonal />
                </ContactUsLink>
                <PriceEstimatorTrigger
                  whatsappNumber={company?.whatsapp_number ?? null}
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md border border-[#f47721] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#f47721]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f47721] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101d29] motion-reduce:transition-none"
                />
              </div>
            </div>
            <TubeIllustration />
          </div>
          <div className="h-1 w-full bg-gradient-to-r from-[#f47721] via-[#f47721]/50 to-transparent" />
        </section>

        <section id="about" aria-labelledby="about-heading" className="bg-[#f4f5f4]">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 py-12 sm:px-8 sm:py-16 md:grid-cols-[0.8fr_1.2fr] md:items-start lg:px-12">
            <p className="flex items-center gap-3 pt-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#a7470a] sm:text-sm">
              <span className="h-px w-8 bg-[#a7470a]" />
              TENTANG {companyName}
            </p>
            <div className="max-w-3xl">
              <h2 id="about-heading" className="text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#142331] sm:text-4xl">
                Spesialis Pembersihan dan Inspeksi Tube
              </h2>
              {profileLoadFailed ? (
                <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-600" role="status">
                  Informasi profil perusahaan belum dapat dimuat. Silakan muat
                  ulang halaman untuk mencoba kembali.
                </p>
              ) : company ? (
                <>
                  {company.background && (
                    <p className="mt-5 max-w-2xl whitespace-pre-line text-base leading-7 text-slate-600">
                      {company.background}
                    </p>
                  )}
                  {company.vision && (
                    <p className="mt-4 max-w-2xl whitespace-pre-line text-base leading-7 text-slate-600">
                      <span className="font-semibold text-[#142331]">Visi:</span>{" "}
                      {company.vision}
                    </p>
                  )}
                  {company.mission && (
                    <p className="mt-3 max-w-2xl whitespace-pre-line text-base leading-7 text-slate-600">
                      <span className="font-semibold text-[#142331]">Misi:</span>{" "}
                      {company.mission}
                    </p>
                  )}
                </>
              ) : (
                <p className="mt-5 max-w-2xl text-sm leading-6 text-slate-600" role="status">
                  Informasi profil perusahaan belum tersedia.
                </p>
              )}
            </div>
          </div>
        </section>

        <section id="services" aria-labelledby="services-heading" className="bg-white">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
            <div>
              <div>
                <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#a7470a] sm:text-sm">
                  <span className="h-px w-8 bg-[#a7470a]" />
                  LAYANAN {companyName}
                </p>
                <h2 id="services-heading" className="text-3xl font-semibold tracking-[-0.035em] text-[#142331] sm:text-4xl">
                  Layanan Tube / Pipe Cleaning
                </h2>
              </div>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {featuredServices.map((service) => (
                <article
                  key={service.number}
                  className="group flex min-h-64 flex-col border border-slate-200 bg-white p-6 transition-all hover:-translate-y-1 hover:border-[#f47721]/50 hover:shadow-xl hover:shadow-slate-900/5 sm:p-8"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex size-12 items-center justify-center rounded-lg bg-[#fff3e9] text-[#a7470a]">
                      <ServiceIcon name={service.icon} />
                    </span>
                    <span className="font-mono text-xs tracking-widest text-slate-400">
                      {service.number}
                    </span>
                  </div>
                  <h3 className="mt-7 text-xl font-semibold text-[#142331]">
                    {service.name}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {service.description}
                  </p>
                  <a
                    href="#contact"
                    className="mt-auto inline-flex w-fit items-center gap-2 pt-6 text-sm font-semibold text-[#142331] transition-colors group-hover:text-[#a7470a]"
                  >
                    Konsultasikan Kebutuhan Anda <ArrowIcon />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="projects" aria-labelledby="projects-heading" className="bg-[#edf0f1]">
          <div className="mx-auto max-w-7xl px-5 pb-8 pt-12 sm:px-8 sm:pb-10 sm:pt-16 lg:px-12">
            <div className="max-w-2xl">
              <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#a7470a] sm:text-sm">
                <span className="h-px w-8 bg-[#a7470a]" />
                Proyek {companyName}
              </p>
              <h2 id="projects-heading" className="text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#142331] sm:text-4xl">
                Proyek yang Pernah Kami Lakukan
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
                Temukan proyek pembersihan dan inspeksi tube yang telah kami
                kerjakan untuk berbagai kebutuhan industri.
              </p>
            </div>
            {projectLoadFailed ? (
              <p className="mx-auto mt-8 flex min-h-24 max-w-3xl items-center justify-center border border-slate-200 bg-white px-5 py-6 text-center text-sm leading-6 text-slate-600 sm:px-8">
                Terjadi kendala saat memuat data. Silakan coba kembali.
              </p>
            ) : (
              <ProjectCarousel projects={projects} />
            )}
          </div>
        </section>

        <section aria-labelledby="why-heading" className="bg-white">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
            <div className="max-w-2xl">
              <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#a7470a] sm:text-sm">
                <span className="h-px w-8 bg-[#a7470a]" />
                MENGAPA {companyName}?
              </p>
              <h2 id="why-heading" className="text-3xl font-semibold tracking-[-0.035em] text-[#142331] sm:text-4xl">
                Kami Bukan Sekadar Penyedia Jasa Pembersihan Tube / Pipe
              </h2>
            </div>
            <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">
              {advantages.map((advantage) => (
                <article
                  key={advantage.number}
                  className="border-t border-slate-200 pt-5"
                >
                  <span className="font-mono text-xs tracking-widest text-[#a7470a]">
                    {advantage.number}
                  </span>
                  <h3 className="mt-4 text-lg font-semibold text-[#142331]">
                    {advantage.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {advantage.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" aria-labelledby="contact-heading" className="bg-[#101d29] text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-12 sm:px-8 sm:py-14 md:flex-row md:items-center md:gap-12 lg:px-12">
            <div className="min-w-0 flex-1">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#f47721] sm:text-sm">
                MARI BICARA LEBIH LANJUT
              </p>
              <h2 id="contact-heading" className="max-w-[28ch] text-3xl font-semibold leading-[1.12] tracking-[-0.035em] sm:text-4xl md:max-w-none">
                Butuh Jasa Tube / Pipe Cleaning dan Inspeksi?
              </h2>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">
                Hubungi kami untuk membahas kebutuhan
                proyek Anda.
              </p>
            </div>
            <div className="flex w-full flex-col items-stretch gap-3 md:w-auto md:shrink-0 md:items-end">
              <ContactUsLink
                whatsappNumber={company?.whatsapp_number ?? null}
                fallbackHref="#contact"
                className="inline-flex min-h-16 w-full shrink-0 items-center justify-center gap-3 rounded-md bg-[#b74e0d] px-9 py-[1.125rem] text-base font-semibold text-white transition-colors hover:bg-[#9f4006] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f47721] focus-visible:ring-offset-2 focus-visible:ring-offset-[#101d29] md:w-auto"
              >
                Hubungi Kami <ArrowIcon diagonal />
              </ContactUsLink>
              {!normalizeWhatsAppNumber(company?.whatsapp_number) && (
              <p className="text-sm text-slate-400">
                Tautan WhatsApp belum tersedia. Nomor WhatsApp internasional
                perlu dikonfirmasi pada profil perusahaan.
              </p>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-[#0b151e] text-white">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-12 lg:px-12">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-[1.2fr_0.8fr_1fr] md:gap-10">
            <div>
              <a
  href="#home"
  className="flex w-fit items-center rounded-md overflow-hidden"
>
  <BrandMark />
</a>
              <p className="mt-4 max-w-sm text-sm leading-6 text-slate-400">
                {company?.background?.trim() ||
                  "Informasi perusahaan belum tersedia."}
              </p>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
                Navigasi
              </h2>
              <nav
                aria-label="Navigasi footer"
                className="mt-3 flex flex-col items-start text-sm text-slate-400"
              >
                <a className="inline-flex min-h-9 items-center transition-colors hover:text-white" href="#home">
                  Beranda
                </a>
                <a className="inline-flex min-h-9 items-center transition-colors hover:text-white" href="#about">
                  Tentang Kami
                </a>
                <a className="inline-flex min-h-9 items-center transition-colors hover:text-white" href="#services">
                  Layanan
                </a>
                <a className="inline-flex min-h-9 items-center transition-colors hover:text-white" href="#projects">
                  Proyek
                </a>
                <a className="inline-flex min-h-9 items-center transition-colors hover:text-white" href="#contact">
                  Kontak
                </a>
              </nav>
            </div>
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
                Informasi Kontak
              </h2>
              <ContactDetails
                address={company?.address ?? null}
                email={company?.email ?? null}
                whatsappNumber={company?.whatsapp_number ?? null}
              />
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-5">
            <p className="text-center text-xs text-slate-400">
              &copy; {new Date().getFullYear()}{" "}
              {company?.legal_name?.trim() || companyName}. Hak Cipta Dilindungi.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
