import BrandMark from "./brand-mark";
import SiteHeader from "./site-header";

const services = [
  {
    number: "01",
    title: "Tube Cleaning",
    description:
      "Remove deposits and buildup from heat exchanger and process tubes to support efficient operation.",
    icon: "tube",
  },
  {
    number: "02",
    title: "Pipe Cleaning",
    description:
      "Clear internal pipework with an approach suited to the line, material, and type of fouling.",
    icon: "pipe",
  },
  {
    number: "03",
    title: "Industrial Descaling",
    description:
      "Address scale and stubborn residue with cleaning methods selected for your equipment.",
    icon: "clean",
  },
] as const;

const advantages = [
  {
    number: "01",
    title: "Application context",
    description:
      "Equipment, operating conditions, and the type of buildup help shape a suitable cleaning approach.",
  },
  {
    number: "02",
    title: "Focused scope",
    description:
      "Tube and pipe cleaning needs can be considered in the context of your wider industrial system.",
  },
  {
    number: "03",
    title: "Clear discussions",
    description:
      "A clear description of the equipment and cleaning need helps establish practical next steps.",
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

function ServiceIcon({ name }: { name: (typeof services)[number]["icon"] }) {
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
      className="relative mx-auto aspect-[1.12] w-full max-w-[570px] overflow-hidden rounded-2xl border border-white/10 bg-[#182a39] shadow-2xl shadow-black/20"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_18%,rgba(244,119,33,0.2),transparent_38%),linear-gradient(145deg,transparent_30%,rgba(5,14,23,0.55))]" />
      <div className="absolute left-[12%] top-[13%] h-px w-[76%] bg-white/10" />
      <div className="absolute left-[12%] top-[87%] h-px w-[76%] bg-white/10" />
      <div className="absolute left-[12%] top-[13%] h-[74%] w-px bg-white/10" />
      <div className="absolute right-[12%] top-[13%] h-[74%] w-px bg-white/10" />

      <div className="absolute left-1/2 top-1/2 flex h-[49%] w-[79%] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-[2.2%] rounded-[50%] border-[10px] border-[#8b9aa4] bg-[#253a49] shadow-[inset_0_0_0_5px_rgba(5,14,23,0.55),0_20px_45px_rgba(0,0,0,0.3)] sm:border-[14px]">
        {Array.from({ length: 9 }, (_, index) => (
          <span
            key={index}
            className="h-[65%] min-w-0 flex-1 rounded-full border border-white/45 bg-[linear-gradient(90deg,#526875,#d5d8d2_38%,#75858c_70%,#354c5b)] shadow-[inset_2px_0_3px_rgba(255,255,255,0.4),inset_-2px_0_3px_rgba(4,13,20,0.4)]"
          />
        ))}
      </div>

      <div className="absolute bottom-[9%] left-[8%] flex items-center gap-3 rounded-lg border border-white/10 bg-[#101d29]/90 px-4 py-3 backdrop-blur">
        <span className="size-2 rounded-full bg-[#f47721]" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/75 sm:text-xs">
          Precision tube &amp; pipe care
        </span>
      </div>
      <span className="absolute right-[8%] top-[8%] font-mono text-[10px] tracking-[0.2em] text-white/40 sm:text-xs">
        TP / INDUSTRIAL
      </span>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />

      <main>
        <section
          id="home"
          aria-labelledby="home-heading"
          className="overflow-hidden bg-[#101d29] text-white"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-16 md:grid-cols-[1fr_0.95fr] md:gap-10 md:py-20 lg:gap-16 lg:px-12 lg:py-24">
            <div className="max-w-2xl">
              <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#f47721] sm:text-sm">
                <span className="h-px w-8 bg-[#f47721]" />
                Industrial tube &amp; pipe cleaning
              </p>
              <h1 id="home-heading" className="text-4xl font-semibold leading-[1.08] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
                Precision Tube &amp; Pipe Cleaning Solutions
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
                Practical cleaning solutions for industrial tubes and pipes.
                We help remove buildup and residue with an approach tailored to
                your equipment and application.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#services"
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md bg-[#b74e0d] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#9f4006]"
                >
                  Explore Our Services <ArrowIcon />
                </a>
                <a
                  href="#contact"
                  className="inline-flex min-h-12 items-center justify-center gap-3 rounded-md border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:border-white/60 hover:bg-white/5"
                >
                  Contact Us <ArrowIcon diagonal />
                </a>
              </div>
              <div className="mt-10 flex items-center gap-4 border-t border-white/10 pt-6 text-sm text-slate-300">
                <span className="flex size-9 items-center justify-center rounded-full border border-[#f47721]/50 text-[#f47721]">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    className="size-4"
                  >
                    <path
                      d="M10 2.5v15M2.5 10h15"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                Focused on tube and pipe cleaning for industry
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
              About Tube Profile
            </p>
            <div className="max-w-3xl">
              <h2 id="about-heading" className="text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#142331] sm:text-4xl">
                Cleaning solutions built around your operation.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
                Tube and pipe cleaning needs vary with the equipment, material,
                access, and type of buildup. Tube Profile focuses on this area
                of industrial cleaning, where understanding the application
                helps frame a suitable method for discussion.
              </p>
            </div>
          </div>
        </section>

        <section id="services" aria-labelledby="services-heading" className="bg-white">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#a7470a] sm:text-sm">
                  <span className="h-px w-8 bg-[#a7470a]" />
                  What we do
                </p>
                <h2 id="services-heading" className="text-3xl font-semibold tracking-[-0.035em] text-[#142331] sm:text-4xl">
                  Cleaning services
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-slate-600 sm:text-base">
                Targeted cleaning for the internal surfaces that keep
                industrial systems moving.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {services.map((service) => (
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
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {service.description}
                  </p>
                  <a
                    href="#contact"
                    className="mt-auto inline-flex w-fit items-center gap-2 pt-6 text-sm font-semibold text-[#142331] transition-colors group-hover:text-[#a7470a]"
                  >
                    Discuss your needs <ArrowIcon />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="products" aria-labelledby="products-heading" className="bg-[#edf0f1]">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 sm:px-8 sm:py-16 md:grid-cols-2 md:items-center lg:px-12">
            <div>
              <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#a7470a] sm:text-sm">
                <span className="h-px w-8 bg-[#a7470a]" />
                Products &amp; methods
              </p>
              <h2 id="products-heading" className="max-w-xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#142331] sm:text-4xl">
                The right cleaning method starts with the details.
              </h2>
            </div>
            <div className="border-l-2 border-[#f47721] pl-6 sm:pl-8">
              <p className="text-base leading-7 text-slate-600">
                Tube and pipe dimensions, material, access, and the type of
                buildup all matter. Tell us about your application and we can
                discuss suitable cleaning equipment and methods for the job.
              </p>
              <a
                href="#contact"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#142331] transition-colors hover:text-[#a7470a]"
              >
                Talk through your application <ArrowIcon />
              </a>
            </div>
          </div>
        </section>

        <section aria-labelledby="why-heading" className="bg-white">
          <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-12">
            <div className="max-w-2xl">
              <p className="mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#a7470a] sm:text-sm">
                <span className="h-px w-8 bg-[#a7470a]" />
                Why Tube Profile
              </p>
              <h2 id="why-heading" className="text-3xl font-semibold tracking-[-0.035em] text-[#142331] sm:text-4xl">
                A focused partner for cleaner systems.
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
          <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-12 sm:px-8 sm:py-14 md:flex-row md:items-center md:justify-between lg:px-12">
            <div className="max-w-2xl">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#f47721] sm:text-sm">
                Start a conversation
              </p>
              <h2 id="contact-heading" className="text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">
                Need to clean a tube or pipe system?
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-300 sm:text-base">
                Share a little about your equipment and cleaning requirements.
                We&apos;ll be glad to discuss the next step.
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-400">
                Informasi kontak resmi akan ditampilkan setelah dikonfirmasi.
              </p>
            </div>
            <a
              href="#contact"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-3 rounded-md bg-[#b74e0d] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#9f4006]"
            >
              Contact Us <ArrowIcon diagonal />
            </a>
          </div>
        </section>
      </main>

      <footer className="bg-[#0b151e] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <a href="#home" className="flex w-fit items-center gap-3">
            <BrandMark />
            <span className="font-semibold tracking-tight">
              Tube <span className="text-[#f47721]">Profile</span>
            </span>
          </a>
          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-400"
          >
            <a className="inline-flex min-h-11 items-center transition-colors hover:text-white" href="#home">
              Home
            </a>
            <a className="inline-flex min-h-11 items-center transition-colors hover:text-white" href="#about">
              About Us
            </a>
            <a className="inline-flex min-h-11 items-center transition-colors hover:text-white" href="#services">
              Services
            </a>
            <a className="inline-flex min-h-11 items-center transition-colors hover:text-white" href="#products">
              Products
            </a>
            <a className="inline-flex min-h-11 items-center transition-colors hover:text-white" href="#contact">
              Contact
            </a>
          </nav>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Tube Profile
          </p>
        </div>
      </footer>
    </>
  );
}
