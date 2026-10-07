import type { Metadata } from "next";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/page-header";
import { RefreshButton } from "@/components/admin/refresh-button";
import { StatusBadge, WhatsAppBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ArrowRightIcon, UsersIcon } from "@/components/ui/icons";
import { formatDate } from "@/lib/format";
import {
  getCandidatesByVacancy,
  getVacancy,
  isNotFound,
  toUserMessage,
} from "@/lib/recruitment-api";
import { isOpenVacancy, type Vacancy } from "@/lib/types";

export const dynamic = "force-dynamic";

interface VacancyDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: VacancyDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const vacancy = await getVacancy(id);
    return { title: `${vacancy.Title || vacancy.VacancyID} · Vacancy` };
  } catch {
    return { title: "Vacancy" };
  }
}

export default async function AdminVacancyDetailPage({
  params,
}: VacancyDetailPageProps) {
  const { id } = await params;

  let vacancy: Vacancy | null = null;
  let missing = false;
  let loadError: unknown = null;
  let candidatesError: unknown = null;
  let candidates: Awaited<ReturnType<typeof getCandidatesByVacancy>> = [];

  // Both reads run in parallel — the candidate list only needs the ID.
  const [vacancyResult, candidatesResult] = await Promise.allSettled([
    getVacancy(id),
    getCandidatesByVacancy(id),
  ]);

  if (vacancyResult.status === "fulfilled") {
    vacancy = vacancyResult.value;
  } else if (isNotFound(vacancyResult.reason)) {
    missing = true;
  } else {
    loadError = vacancyResult.reason;
  }

  if (candidatesResult.status === "fulfilled") {
    candidates = candidatesResult.value;
  } else if (!loadError && !missing) {
    candidatesError = candidatesResult.reason;
  }

  if (loadError) {
    return (
      <div className="space-y-8">
        <AdminPageHeader title="Vacancy" />
        <ErrorState
          title="Unable to load this vacancy"
          message={toUserMessage(loadError, "Unable to load this vacancy.")}
        />
      </div>
    );
  }

  if (!vacancy || missing) {
    return (
      <div className="space-y-8">
        <AdminPageHeader title="Vacancy" />
        <EmptyState
          title="Vacancy not found"
          description="This vacancy ID does not exist in the recruitment sheet, or it has been removed."
          action={{ label: "Back to vacancies", href: "/admin/vacancies" }}
        />
      </div>
    );
  }

  const created = formatDate(vacancy.CreatedAt);
  const open = isOpenVacancy(vacancy);

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title={vacancy.Title || "Untitled vacancy"}
        description={`${vacancy.VacancyID}${vacancy.Location ? ` · ${vacancy.Location}` : ""}${vacancy.JobType ? ` · ${vacancy.JobType}` : ""}`}
        action={
          <>
            <RefreshButton />
            <ButtonLink href="/admin/vacancies" variant="secondary" size="sm">
              Back to vacancies
            </ButtonLink>
            <ButtonLink href="/admin/vacancies/new" size="sm">
              Add Vacancy
            </ButtonLink>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={vacancy.Status} />
        {!open ? (
          <span className="text-xs text-ink-faint">
            This position is currently closed.
          </span>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section className="card animate-fade-up p-6 sm:p-7">
          <h2 className="text-base font-semibold tracking-tight text-ink">
            Description
          </h2>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-ink-soft">
            {vacancy.Description ? (
              vacancy.Description
                .split(/\n+/)
                .filter((line) => line.trim())
                .map((line, index) => <p key={index}>{line}</p>)
            ) : (
              <p>No description has been added to this vacancy yet.</p>
            )}
          </div>

          <dl className="mt-7 grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
            {[
              { label: "Vacancy ID", value: vacancy.VacancyID },
              { label: "Openings", value: String(vacancy.Openings) },
              { label: "Location", value: vacancy.Location || "Not specified" },
              { label: "Job type", value: vacancy.JobType || "Not specified" },
              { label: "Salary", value: vacancy.Salary || "Not specified" },
              { label: "Posted", value: created ?? "Not available" },
            ].map((row) => (
              <div key={row.label}>
                <dt className="text-xs font-medium uppercase tracking-wider text-ink-faint">
                  {row.label}
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <aside className="card animate-fade-up stagger-1 p-6">
          <h2 className="text-sm font-semibold tracking-tight text-ink">
            Applications
          </h2>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">
            {candidates.length}
          </p>
          <p className="mt-1 text-xs text-ink-faint">
            {candidates.length === 1 ? "candidate" : "candidates"} for this vacancy
          </p>
          <ButtonLink
            href={`/admin/candidates?vacancy=${encodeURIComponent(vacancy.VacancyID)}`}
            variant="secondary"
            size="sm"
            fullWidth
            className="mt-5"
          >
            View candidates
            <ArrowRightIcon className="h-4 w-4" />
          </ButtonLink>
        </aside>
      </div>

      <section aria-labelledby="vacancy-candidates-heading" className="card p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-muted text-ink-soft">
            <UsersIcon className="h-5 w-5" />
          </span>
          <h2
            id="vacancy-candidates-heading"
            className="text-base font-semibold tracking-tight text-ink"
          >
            Candidates
          </h2>
        </div>

        <div className="mt-5">
          {candidatesError ? (
            <ErrorState
              title="Unable to load candidates"
              message={toUserMessage(
                candidatesError,
                "Unable to load candidates for this vacancy.",
              )}
            />
          ) : candidates.length === 0 ? (
            <EmptyState
              title="No applications found"
              description="No candidate has applied for this vacancy yet."
            />
          ) : (
            <ul className="divide-y divide-line">
              {candidates.map((candidate) => (
                <li key={candidate.CandidateID}>
                  <Link
                    href={`/admin/candidates/${encodeURIComponent(candidate.CandidateID)}`}
                    className="flex flex-col gap-2 py-4 transition-colors hover:bg-canvas sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {candidate.FullName || "Unnamed candidate"}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-ink-faint">
                        {candidate.CandidateID} · {candidate.Phone || "no phone"} ·{" "}
                        {candidate.Email || "no email"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <WhatsAppBadge value={candidate.WhatsAppSent} />
                      <StatusBadge status={candidate.Status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
