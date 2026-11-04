"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import BrandMark from "./brand-mark";

const navigationLinks = [
  { label: "Beranda", href: "/#home" },
  { label: "Tentang Kami", href: "/#about" },
  { label: "Layanan", href: "/#services" },
  { label: "Proyek", href: "/#projects" },
  { label: "Kontak", href: "/#contact" },
  { label: "Masuk Admin", href: "/admin/login" },
] as const;

export default function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <header className="relative z-10 border-b border-white/10 bg-[#101d29] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-3 sm:px-8 md:flex-row md:items-center md:justify-between md:gap-6 md:py-4 lg:px-12">
        <div className="flex items-center justify-between">
          <Link href="/#home" className="flex w-fit items-center">
            <BrandMark className="h-12 w-auto sm:h-14" preload />
          </Link>
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex size-11 items-center justify-center rounded-md text-white transition-colors hover:bg-white/10 md:hidden"
          >
            {menuOpen ? (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="size-6"
              >
                <path
                  d="m6 6 12 12M18 6 6 18"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                className="size-6"
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </button>
        </div>
        <nav
          id="primary-navigation"
          aria-label="Navigasi utama"
          onKeyDown={(event) => {
            if (event.key === "Escape" && menuOpen) {
              setMenuOpen(false);
              menuButtonRef.current?.focus();
            }
          }}
          className={`${menuOpen ? "flex" : "hidden"} flex-col gap-1 border-t border-white/10 pt-2 text-sm text-white/70 md:flex md:flex-row md:items-center md:gap-x-6 md:border-0 md:pt-0`}
        >
          {navigationLinks.map(({ label, href }) => (
            <Link
              key={href}
              className={`inline-flex min-h-11 items-center rounded px-2 transition-colors hover:bg-white/5 hover:text-white md:px-0 md:hover:bg-transparent ${
                href === "/admin/login"
                  ? "font-semibold text-[#f47721] hover:text-white"
                  : ""
              }`}
              href={href}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
