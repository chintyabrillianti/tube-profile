"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import BrandMark from "../brand-mark";
import { getCurrentAdmin, logoutAdmin } from "@/lib/admin-auth";
import type { AdminUser } from "@/lib/admin-auth";

const navigationItems = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  {
    href: "/admin/company-profile",
    label: "Profil Perusahaan",
    icon: "profile",
  },
  { href: "/admin/projects", label: "Kelola Proyek", icon: "projects" },
] as const;

type NavigationIconName = (typeof navigationItems)[number]["icon"] | "logout";

function NavigationIcon({ name }: { name: NavigationIconName }) {
  const paths: Record<NavigationIconName, ReactNode> = {
    dashboard: (
      <>
        <rect x="3" y="3" width="8" height="8" rx="1.5" />
        <rect x="13" y="3" width="8" height="5" rx="1.5" />
        <rect x="13" y="10" width="8" height="11" rx="1.5" />
        <rect x="3" y="13" width="8" height="8" rx="1.5" />
      </>
    ),
    profile: (
      <>
        <path d="M4 21h16" />
        <path d="M6 21V7l6-4 6 4v14" />
        <path d="M9 10h.01M15 10h.01M9 14h.01M15 14h.01" />
        <path d="M10 21v-4h4v4" />
      </>
    ),
    projects: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M8 4v5m8-5v5M7 13h3m4 0h3m-10 3h3m4 0h3" />
      </>
    ),
    logout: (
      <>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
        <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="size-5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

function NavigationContents({
  pathname,
  onNavigate,
  onLogout,
  isLoggingOut,
}: {
  pathname: string;
  onNavigate?: () => void;
  onLogout: () => void;
  isLoggingOut: boolean;
}) {
  return (
    <>
      <div className="border-b border-slate-200 px-5 py-6 lg:px-6">
        <div className="inline-flex items-center bg-[#101d29] px-2 py-1">
          <BrandMark className="h-auto w-[180px] max-w-full" preload />
        </div>
      </div>

      <nav aria-label="Navigasi admin" className="flex-1 space-y-1 px-3 py-5">
        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 md:hidden lg:block">
          Menu utama
        </p>
        {navigationItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === item.href
              : pathname.startsWith(item.href);

          return (
            <Link
              aria-label={item.label}
              key={item.href}
              aria-current={active ? "page" : undefined}
              className={`group flex min-h-12 items-center gap-3 rounded-lg border-l-[3px] px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b74e0d] ${
                active
                  ? "border-[#b74e0d] bg-[#fff1e8] text-[#8e3c09]"
                  : "border-transparent text-slate-600 hover:bg-slate-100 hover:text-[#142331]"
              }`}
              href={item.href}
              onClick={onNavigate}
              title={item.label}
            >
              <NavigationIcon name={item.icon} />
              <span className="md:hidden lg:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button
          aria-label="Keluar"
          className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b74e0d] disabled:cursor-wait disabled:opacity-60"
          disabled={isLoggingOut}
          onClick={onLogout}
          title="Keluar"
          type="button"
        >
          <NavigationIcon name="logout" />
          <span className="md:hidden lg:inline">
            {isLoggingOut ? "Sedang keluar..." : "Keluar"}
          </span>
        </button>
      </div>
    </>
  );
}

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/company-profile": "Profil Perusahaan",
  "/admin/projects": "Kelola Proyek",
};

export default function AdminWorkspace({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authError, setAuthError] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let active = true;

    getCurrentAdmin()
      .then((admin) => {
        if (!active) return;
        if (!admin) {
          router.replace("/admin/login");
          return;
        }
        setUser(admin);
      })
      .catch(() => {
        if (active) {
          setAuthError(
            "Sesi admin belum dapat diperiksa. Periksa koneksi, lalu coba lagi.",
          );
        }
      })
      .finally(() => {
        if (active) setIsCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (!isDrawerOpen) return;

    const previousOverflow = document.body.style.overflow;
    const menuButton = menuButtonRef.current;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
        return;
      }
      if (event.key !== "Tab" || !drawerRef.current) return;

      const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      const first = focusable.item(0);
      const last = focusable.item(focusable.length - 1);

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      menuButton?.focus();
    };
  }, [isDrawerOpen]);

  async function handleLogout() {
    setAuthError("");
    setIsLoggingOut(true);
    try {
      await logoutAdmin();
      router.replace("/admin/login");
    } catch (cause) {
      setAuthError(
        cause instanceof Error ? cause.message : "Gagal keluar. Coba lagi.",
      );
      setIsLoggingOut(false);
    }
  }

  function renderSidebar(isMobile: boolean) {
    return (
      <NavigationContents
        isLoggingOut={isLoggingOut}
        onLogout={() => void handleLogout()}
        onNavigate={isMobile ? () => setIsDrawerOpen(false) : undefined}
        pathname={pathname}
      />
    );
  }

  const title = pageTitles[pathname] ?? "Area Admin";

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f5f4] px-5">
        <p className="rounded-xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-600 shadow-sm" role="status">
          Memeriksa sesi admin...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f5f4] px-5">
        <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-700" role={authError ? "alert" : "status"}>
            {authError || "Mengarahkan ke halaman masuk admin..."}
          </p>
          {authError && (
            <button
              className="mt-4 min-h-11 rounded-lg bg-[#b74e0d] px-4 text-sm font-semibold text-white hover:bg-[#9f4006] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b74e0d]"
              onClick={() => window.location.reload()}
              type="button"
            >
              Coba lagi
            </button>
          )}
        </section>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f6f5] md:pl-20 lg:pl-64">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-20 flex-col border-r border-slate-200 bg-white md:flex lg:w-64">
        {renderSidebar(false)}
      </aside>

      <div
        className={
          isDrawerOpen
            ? "fixed inset-0 z-50 md:hidden"
            : "hidden"
        }
        hidden={!isDrawerOpen}
      >
        <button
          aria-label="Tutup menu"
          className="absolute inset-0 size-full cursor-default bg-[#142331]/45"
          onClick={() => setIsDrawerOpen(false)}
          tabIndex={-1}
          type="button"
        />
        <aside
          aria-label="Menu admin"
          aria-modal={isDrawerOpen ? "true" : undefined}
          className="relative flex h-full w-[min(84vw,300px)] flex-col bg-white shadow-2xl"
          id="admin-mobile-menu"
          ref={drawerRef}
          role={isDrawerOpen ? "dialog" : undefined}
        >
          <div className="absolute right-3 top-3">
            <button
              aria-label="Tutup menu"
              className="flex size-11 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-[#b74e0d]"
              onClick={() => setIsDrawerOpen(false)}
              ref={closeButtonRef}
              type="button"
            >
              <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
          {renderSidebar(true)}
        </aside>
      </div>

      <div className="flex min-h-screen min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex min-h-[76px] items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              aria-controls="admin-mobile-menu"
              aria-expanded={isDrawerOpen}
              aria-label={isDrawerOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
              className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-[#142331] hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#b74e0d] md:hidden"
              onClick={() => setIsDrawerOpen(true)}
              ref={menuButtonRef}
              type="button"
            >
              <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="min-w-0">
              <p className="hidden text-xs font-medium text-slate-500 sm:block">
                Panel pengelolaan BENE
              </p>
              <h1 className="truncate text-lg font-semibold text-[#142331] sm:mt-0.5 sm:text-xl">
                {title}
              </h1>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="max-w-48 truncate text-sm font-semibold text-[#142331]">
                {user.name}
              </p>
              <p className="max-w-48 truncate text-xs text-slate-500">Admin</p>
            </div>
            <span
              aria-label={`Inisial ${user.name}`}
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#fff1e8] text-sm font-bold text-[#8e3c09]"
            >
              {user.name
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase()}
            </span>
          </div>
        </header>

        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {authError && (
            <p className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
              {authError}
            </p>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
