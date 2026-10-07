import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Application Submitted",
  description: "Your application has been received by the hiring team.",
  robots: { index: false, follow: false },
};

interface SuccessPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function read(value: string | string[] | undefined): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

export default async function ApplicationSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = await searchParams;

  const candidateId = read(params.candidateId);
  const vacancyId = read(params.vacancyId);
  const vacancyTitle = read(params.vacancyTitle);

  return (
    <div className="page-container py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="animate-fade-up inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-success/25 bg-success-soft text-success">
          <CheckIcon className="h-8 w-8" />
        </span>

        <h1 className="animate-fade-up stagger-1 mt-7 text-3xl font-semibold tracking-tight text-ink sm:text-[2.3rem]">
          Application Submitted Successfully
        </h1>

        <p className="animate-fade-up stagger-2 mx-auto mt-4 max-w-lg text-sm leading-relaxed text-ink-soft sm:text-base">
          Thank you for your interest. Your application has been received and
          the hiring team will review it shortly.
        </p>

        <div className="animate-fade-up stagger-3 card mx-auto mt-9 max-w-md p-6 text-left">
          <h2 className="text-sm font-semibold tracking-tight text-ink">
            Application summary
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
              <dt className="text-ink-faint">Application ID</dt>
              <dd className="font-mono text-base font-semibold tracking-tight text-ink">
                {candidateId ?? "Received"}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-ink-faint">Applied position</dt>
              <dd className="text-right font-medium text-ink">
                {vacancyTitle ?? "Your selected role"}
                {vacancyId ? (
                  <span className="ml-2 text-xs font-normal text-ink-faint">
                    {vacancyId}
                  </span>
                ) : null}
              </dd>
            </div>
          </dl>
          <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-faint">
            Keep this application ID for your records. Shortlisted candidates
            are contacted directly.
          </p>
        </div>

        <div className="animate-fade-up stagger-4 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <ButtonLink href="/jobs" size="lg">
            View More Jobs
            <ArrowRightIcon className="h-4 w-4" />
          </ButtonLink>
          <ButtonLink href="/" variant="secondary" size="lg">
            Back to Home
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
