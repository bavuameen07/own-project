import Link from "next/link";

import { BrandMark } from "@/components/site-header";

const YEAR = new Date().getFullYear();

const FOOTER_LINKS = {
  Explore: [
    { label: "Home", href: "/" },
    { label: "Open Positions", href: "/jobs" },
    { label: "Recruitment Process", href: "/#process" },
  ],
  Candidates: [
    { label: "Why Apply", href: "/#why-apply" },
    { label: "Browse Jobs", href: "/jobs" },
    { label: "Contact", href: "/#contact" },
  ],
};

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="page-container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <BrandMark />
            <span className="text-[1.05rem] font-semibold tracking-tight text-ink">
              OpenRoles
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
            A focused place to discover open roles and submit your application
            in minutes. Every listing you see is published in real time.
          </p>
        </div>

        {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
          <nav key={heading} aria-label={heading}>
            <h3 className="eyebrow">{heading}</h3>
            <ul className="mt-4 space-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ink-soft transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-line">
        <div className="page-container flex flex-col gap-2 py-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {YEAR} OpenRoles. All rights reserved.</p>
          <p>Applications are stored securely and reviewed by the hiring team.</p>
        </div>
      </div>
    </footer>
  );
}
