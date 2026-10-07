import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { applyHref, JobMeta } from "@/components/job-card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ArrowRightIcon, ClockIcon } from "@/components/ui/icons";
import { ErrorState } from "@/components/ui/error-state";
import { SITE_NAME } from "@/lib/env";
import { formatDate } from "@/lib/format";
import { getVacancy, isNotFound, toUserMessage } from "@/lib/recruitment-api";
import { isOpenVacancy } from "@/lib/types";

export const revalidate = 60;

interface JobDetailsPageProps {
  params: Promise<{ vacancyId: string }>;
}

export async function generateMetadata({
  params,
}: JobDetailsPageProps): Promise<Metadata> {
  const { vacancyId } = await params;
  try {
    const vacancy = await getVacancy(vacancyId);
    const location = vacancy.Location ? ` in ${vacancy.Location}` : "";
    return {
      title: `${vacancy.Title || "Job"}${location}`,
      description: vacancy.Description
        ? vacancy.Description.slice(0, 155)
        : `Apply for the ${vacancy.Title} position at ${SITE_NAME}.`,
    };
  } catch {
    return { title: "Job details" };
  }
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const { vacancyId } = await params;

  let vacancy: Awaited<ReturnType<typeof getVacancy>> | null;
  let loadError: unknown = null;

  try {
    vacancy = await getVacancy(vacancyId);
  } catch (error) {
    if (isNotFound(error)) notFound();
    vacancy = null;
    loadError = error;
  }

  if (loadError) {
    return (
      <div className="page-container py-16 sm:py-24">
        <ErrorState
          title="Unable to load this job"
          message={toUserMessage(loadError, "Unable to load this position.")}
        />
      </div>
    );
  }

  if (!vacancy) notFound();

  const open = isOpenVacancy(vacancy);
  const created = formatDate(vacancy.CreatedAt);

  return (
    <div className="page-container py-10 sm:py-16">
      <nav aria-label="Breadcrumb" className="text-sm text-ink-soft">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="transition-colors hover:text-ink">
              Home
            </Link>
          </li>
          <li aria-hidden="true" className="text-ink-faint">
            /
          </li>
          <li>
            <Link href="/jobs" className="transition-colors hover:text-ink">
              Jobs
            </Link>
          </li>
          <li aria-hidden="true" className="text-ink-faint">
            /
          </li>
          <li aria-current="page" className="font-medium text-ink">
            {vacancy.VacancyID}
          </li>
        </ol>
      </nav>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <article className="animate-fade-up">
          <header className="border-b border-line pb-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neutral">{vacancy.VacancyID}</Badge>
              {vacancy.JobType ? (
                <Badge tone="neutral">{vacancy.JobType}</Badge>
              ) : null}
              {open ? <Badge tone="success">Open</Badge> : <Badge tone="neutral">Closed</Badge>}
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-[2.5rem] sm:leading-[1.1]">
              {vacancy.Title || "Untitled position"}
            </h1>

            <div className="mt-5">
              <JobMeta vacancy={vacancy} />
            </div>

            {created ? (
              <p className="mt-5 inline-flex items-center gap-2 text-xs text-ink-faint">
                <ClockIcon className="h-4 w-4" />
                Posted on {created}
              </p>
            ) : null}
          </header>

          <section aria-labelledby="description-heading" className="pt-8">
            <h2
              id="description-heading"
              className="text-lg font-semibold tracking-tight text-ink"
            >
              About this role
            </h2>
            <div className="mt-4 space-y-4 text-[0.95rem] leading-relaxed text-ink-soft">
              {vacancy.Description ? (
                vacancy.Description
                  .split(/\n+/)
                  .filter((line) => line.trim())
                  .map((paragraph, index) => <p key={index}>{paragraph}</p>)
              ) : (
                <p>
                  The hiring team has not added a description for this position
                  yet. You are welcome to apply and introduce yourself.
                </p>
              )}
            </div>
          </section>

          {!open ? (
            <div
              role="status"
              className="mt-8 rounded-2xl border border-line-strong bg-surface-muted px-5 py-4 text-sm text-ink-soft"
            >
              This position is currently closed.
            </div>
          ) : null}
        </article>

        <aside className="animate-fade-up stagger-2 lg:sticky lg:top-28">
          <div className="card p-6">
            <h2 className="text-sm font-semibold tracking-tight text-ink">
              Role summary
            </h2>

            <dl className="mt-5 space-y-4 text-sm">
              {[
                { label: "Vacancy ID", value: vacancy.VacancyID },
                { label: "Location", value: vacancy.Location || "Not specified" },
                { label: "Job type", value: vacancy.JobType || "Not specified" },
                { label: "Salary", value: vacancy.Salary || "Not specified" },
                {
                  label: "Openings",
                  value: String(vacancy.Openings || 0),
                },
                ...(created ? [{ label: "Posted", value: created }] : []),
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-baseline justify-between gap-4 border-b border-line pb-3 last:border-none last:pb-0"
                >
                  <dt className="text-ink-faint">{row.label}</dt>
                  <dd className="text-right font-medium text-ink">{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 space-y-3">
              {open ? (
                <ButtonLink href={applyHref(vacancy.VacancyID)} fullWidth size="lg">
                  Apply Now
                  <ArrowRightIcon className="h-4 w-4" />
                </ButtonLink>
              ) : (
                <p
                  role="status"
                  className="rounded-full bg-surface-muted px-4 py-3 text-center text-sm font-medium text-ink-soft"
                >
                  This position is currently closed.
                </p>
              )}
              <ButtonLink href="/jobs" variant="secondary" fullWidth>
                Back to Jobs
              </ButtonLink>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
