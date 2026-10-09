"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { BrandMark } from "@/components/site-header";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: undefined },
  { label: "Vacancies", href: "/admin/vacancies", icon: undefined },
  { label: "Candidates", href: "/admin/candidates", icon: undefined },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({
  pathname,
  onNavigate,
}: {
  pathname: string;
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Admin" className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
              active ? "bg-ink text-white" : "text-ink-soft hover:bg-surface-muted hover:text-ink"
            }`}
          >
            <span className="h-4 w-4 rounded bg-surface/40 flex items-center justify-center mr-2">
              {" "}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({
  onNavigate,
  onLogout,
  loggingOut,
}: {
  onNavigate?: () => void;
  onLogout: () => void;
  loggingOut: boolean;
}) {
  return (
    <div className="mt-auto space-y-1 border-t border-line pt-4">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-muted hover:text-ink"
      >
        View site
      </Link>
      <button
        type="button"
        onClick={onLogout}
        disabled={loggingOut}
        className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-60"
      >
        Logout
      </button>
    </div>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  async function handleLogout() {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setLoggingOut(false);
      router.push("/");
      router.refresh();
    }
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-surface p-4 lg:flex">
        <Link
          href="/admin"
          className="mb-6 flex items-center gap-2.5 rounded-xl px-2 py-1.5"
        >
          <span className="block text-sm font-semibold tracking-tight text-ink">
            OpenRoles
          </span>
          <span className="block text-[0.7rem] uppercase tracking-[0.16em] text-ink-faint">
            Admin panel
          </span>
        </Link>

        <NavList pathname={pathname} />
        <SidebarFooter onLogout={handleLogout} loggingOut={loggingOut} />
      </aside>

      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-line bg-surface px-5 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span className="text-sm font-semibold tracking-tight text-ink">
            OpenRoles <span className="font-normal text-ink-faint">· Admin</span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="admin-mobile-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line-strong bg-canvas text-ink"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-5 w-5"
          >
            {open ? (
              <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
            ) : (
              <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/40"
          />
          <div className="animate-slide-in absolute inset-y-0 left-0 flex w-[17rem] max-w-[85vw] flex-col border-r border-line bg-surface p-4">
            <div className="mb-6 flex items-center justify-between gap-3">
<Link href="/admin" className="flex items-center gap-2.5">
                <span className="block text-sm font-semibold tracking-tight text-ink">
                  OpenRoles
                </span>
                <span className="block text-[0.7rem] uppercase tracking-[0.16em] text-ink-faint">
                  Admin panel
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line-strong"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                >
                  <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <NavList pathname={pathname} onNavigate={() => setOpen(false)} />
            <SidebarFooter
              onNavigate={() => setOpen(false)}
              onLogout={handleLogout}
              loggingOut={loggingOut}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}