"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { ButtonLink } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Jobs", href: "/jobs" },
  { label: "Process", href: "/#process" },
  { label: "Contact", href: "/#contact" },
];

export function BrandMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`${className} inline-flex shrink-0 items-center justify-center rounded-xl bg-ink text-white`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M5 16.5 12 5l7 11.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8.4 13.2h7.2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.55"
        />
      </svg>
    </span>
  );
}

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function isActive(href: string): boolean {
    if (href === "/") return pathname === "/";
    if (href.startsWith("/#")) return false;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 bg-canvas/85 backdrop-blur-md">
      <div className="page-container flex h-16 items-center justify-between gap-4 sm:h-[4.5rem]">
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg"
          aria-label={`${"OpenRoles"} home`}
        >
          <BrandMark />
          <span className="text-[1.05rem] font-semibold tracking-tight text-ink">
            OpenRoles
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-surface-muted text-ink"
                  : "text-ink-soft hover:bg-surface-muted hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink href="/jobs" size="sm" className="hidden sm:inline-flex">
            View Jobs
          </ButtonLink>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line-strong bg-surface text-ink transition-colors hover:bg-surface-muted md:hidden"
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
                <path
                  strokeLinecap="round"
                  d="M6 6l12 12M18 6 6 18"
                />
              ) : (
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-navigation"
          className="animate-fade-in border-t border-line bg-canvas md:hidden"
        >
          <nav aria-label="Mobile" className="page-container flex flex-col gap-1 py-4">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={`rounded-xl px-4 py-3 text-[0.95rem] font-medium transition-colors ${
                  isActive(item.href)
                    ? "bg-surface-muted text-ink"
                    : "text-ink-soft hover:bg-surface-muted hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <ButtonLink href="/jobs" size="md" fullWidth className="mt-2 sm:hidden">
              View Jobs
            </ButtonLink>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
