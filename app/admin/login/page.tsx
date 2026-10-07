import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LoginForm } from "@/components/admin/login-form";
import { BrandMark } from "@/components/site-header";
import { isAuthenticated, safeNextPath } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Admin Sign In",
  description: "Sign in to the OpenRoles recruitment admin panel.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

interface LoginPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  if (await isAuthenticated()) redirect("/admin");

  const params = await searchParams;
  const rawNext = typeof params.next === "string" ? params.next : undefined;
  const nextUrl = safeNextPath(rawNext) ?? "/admin";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-5 py-12">
      <Link href="/" className="flex items-center gap-2.5">
        <BrandMark />
        <span className="text-[1.05rem] font-semibold tracking-tight text-ink">
          OpenRoles
        </span>
      </Link>

      <main className="mt-8 w-full max-w-md">
        <div className="card animate-fade-up p-7 sm:p-9">
          <span className="eyebrow">Restricted area</span>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">
            Admin sign in
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Sign in to manage vacancies and candidate applications.
          </p>

          <div className="mt-7">
            <LoginForm nextUrl={nextUrl} />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-ink-faint">
          Authorised personnel only. Sessions expire automatically.
        </p>
      </main>
    </div>
  );
}
