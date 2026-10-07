import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplyForm } from "@/components/apply-form";
import { Badge } from "@/components/ui/badge";
import { ErrorState } from "@/components/ui/error-state";
import { JobMeta, jobHref } from "@/components/job-card";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon } from "@/components/ui/icons";
import { getVacancy, isNotFound, toUserMessage } from "@/lib/recruitment-api";
import { isOpenVacancy } from "@/lib/types";

export const revalidate = 60;

interface ApplyPageProps {
  params: Promise<{ vacancyId: string }>;
}

export async function generateMetadata({
  params,
}: ApplyPageProps): Promise<Metadata> {
  const { vacancyId } = await params;
  try {
    const vacancy = await getVacancy(vacancyId);
    return {
      title: `Apply — ${vacancy.Title || vacancy.VacancyID}`,
      description: `Submit your application for the ${vacancy.Title} position.`,
      robots: { index: false, follow: true },
    };
  } catch {
    return { title: "Apply", robots: { index: false, follow: true } };
  }
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { vacancyId } = await params;

  let vacancy: Awaited<ReturnType<typeof getVacancy>> | null = null;
  let loadError: unknown = null;

  try {
    vacancy = await getVacancy(vacancyId);
  } catch (error) {
    if (isNotFound(error)) notFound();
    loadError = error;
  }

  if (loadError) {
    return (
      <div className="page-container py-16 sm:py-24">
        <ErrorState
          title="Unable to load this application"
          message={toUserMessage(loadError, "Unable to load this position.")}
        />
      </div>
    );
  }

  if (!vacancy) notFound();

  const open = isOpenVacancy(vacancy);

  return (
    <div className="page-container py-12 sm:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/jobs" className="transition-colors hover:text-ink">
              Jobs
            </Link>
          </li>
          <li aria-hidden="true" className="text-ink-faint">
            /
          </li>
          <li>
            <Link
              href={jobHref(vacancy.VacancyID)}
              className="transition-colors hover:text-ink"
            >
              {vacancy.Title || vacancy.VacancyID}
            </Link>
          </li>
          <li aria-hidden="true" className="text-ink-faint">
            /
          </li>
          <li aria-current="page" className="font-medium text-ink">
            Apply
          </li>
        </ol>
      </nav>

      <header className="animate-fade-up mt-8 border-b border-line pb-8">
        <span className="eyebrow">Applying for</span>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-[2.3rem]">
            {vacancy.Title || "Untitled position"}
          </h1>
          <Badge tone="neutral">{vacancy.VacancyID}</Badge>
        </div>
        <div className="mt-4">
          <JobMeta vacancy={vacancy} />
        </div>
      </header>

      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
        <section aria-labelledby="application-form-heading" className="animate-fade-up">
          <div className="card p-6 sm:p-8">
            <h2
              id="application-form-heading"
              className="text-lg font-semibold tracking-tight text-ink"
            >
              Your details
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Fields marked with <span className="text-danger">*</span> are required.
            </p>

            <div className="mt-7">
              {open ? (
                <ApplyForm
                  vacancyId={vacancy.VacancyID}
                  vacancyTitle={vacancy.Title || "this position"}
                />
              ) : (
                <div
                  role="status"
                  className="rounded-2xl border border-line-strong bg-surface-muted px-5 py-6 text-sm text-ink-soft"
                >
                  <p className="font-medium text-ink">
                    This position is currently closed.
                  </p>
                  <p className="mt-1">
                    Applications are no longer being accepted for this role.
                  </p>
                  <ButtonLink href="/jobs" variant="secondary" className="mt-5">
                    Browse other positions
                    <ArrowRightIcon className="h-4 w-4" />
                  </ButtonLink>
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="animate-fade-up stagger-2 lg:sticky lg:top-28">
          <div className="card p-6">
            <h2 className="text-sm font-semibold tracking-tight text-ink">
              Position summary
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              {[
                { label: "Vacancy", value: vacancy.VacancyID },
                { label: "Location", value: vacancy.Location || "Not specified" },
                { label: "Job type", value: vacancy.JobType || "Not specified" },
                { label: "Salary", value: vacancy.Salary || "Not specified" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between gap-4">
                  <dt className="text-ink-faint">{row.label}</dt>
                  <dd className="text-right font-medium text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-ink-faint">
              Your application is sent directly to the hiring team through our
              secure recruitment system.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
