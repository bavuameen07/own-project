"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { StatusControl } from "@/components/admin/status-control";
import { WhatsAppButton } from "@/components/admin/whatsapp-button";
import { StatusBadge, WhatsAppBadge } from "@/components/ui/badge";
import { buttonClassName } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchIcon } from "@/components/ui/icons";
import { pluralize } from "@/lib/format";
import {
  CANDIDATE_STATUSES,
  type Candidate,
  type RecruitmentGroup,
} from "@/lib/types";

interface CandidateDirectoryProps {
  groups: RecruitmentGroup[];
  initialVacancy?: string;
}

interface Filters {
  query: string;
  vacancy: string;
  status: string;
  whatsapp: string;
}

function matchesCandidate(candidate: Candidate, query: string): boolean {
  if (!query) return true;
  return [
    candidate.FullName,
    candidate.CandidateID,
    candidate.Phone,
    candidate.Email,
    candidate.VacancyTitle,
    candidate.Experience,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

export function CandidateDirectory({
  groups,
  initialVacancy = "",
}: CandidateDirectoryProps) {
  const [filters, setFilters] = useState<Filters>({
    query: "",
    vacancy: initialVacancy,
    status: "",
    whatsapp: "",
  });

  const totalCandidates = useMemo(
    () => groups.reduce((count, group) => count + group.candidates.length, 0),
    [groups],
  );

  const vacancyOptions = useMemo(
    () =>
      groups
        .filter((group) => group.candidates.length > 0)
        .map((group) => ({
          value: group.vacancy.VacancyID,
          label: `${group.vacancy.Title || group.vacancy.VacancyID} (${group.candidates.length})`,
        })),
    [groups],
  );

  const visibleGroups = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return groups
      .filter(
        (group) =>
          !filters.vacancy || group.vacancy.VacancyID === filters.vacancy,
      )
      .map((group) => ({
        group,
        candidates: group.candidates.filter((candidate) => {
          if (!matchesCandidate(candidate, query)) return false;
          if (
            filters.status &&
            candidate.Status.trim().toLowerCase() !== filters.status.toLowerCase()
          ) {
            return false;
          }
          if (filters.whatsapp) {
            const isSent =
              candidate.WhatsAppSent.trim().toLowerCase() === "yes";
            if (filters.whatsapp === "Yes" && !isSent) return false;
            if (filters.whatsapp === "No" && isSent) return false;
          }
          return true;
        }),
      }))
      .filter((entry) => entry.candidates.length > 0);
  }, [groups, filters]);

  const matchCount = visibleGroups.reduce(
    (count, entry) => count + entry.candidates.length,
    0,
  );

  const hasFilters =
    filters.query.trim() !== "" ||
    filters.vacancy !== "" ||
    filters.status !== "" ||
    filters.whatsapp !== "";

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  function reset() {
    setFilters({ query: "", vacancy: "", status: "", whatsapp: "" });
  }

  if (totalCandidates === 0) {
    return (
      <EmptyState
        title="No applications found"
        description="Applications submitted through the public website will appear here, grouped by vacancy."
        action={{ label: "View vacancies", href: "/admin/vacancies" }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="card animate-fade-in p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_14rem_11rem_11rem_auto] lg:items-end">
          <div>
            <label htmlFor="candidate-search" className="field-label">
              Search
            </label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                id="candidate-search"
                type="search"
                className="field-input pl-10"
                placeholder="Name, phone, email or candidate ID"
                value={filters.query}
                onChange={(event) => update("query", event.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="vacancy-filter" className="field-label">
              Vacancy
            </label>
            <select
              id="vacancy-filter"
              className="field-input"
              value={filters.vacancy}
              onChange={(event) => update("vacancy", event.target.value)}
            >
              <option value="">All vacancies</option>
              {vacancyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status-filter" className="field-label">
              Status
            </label>
            <select
              id="status-filter"
              className="field-input"
              value={filters.status}
              onChange={(event) => update("status", event.target.value)}
            >
              <option value="">All statuses</option>
              {CANDIDATE_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="whatsapp-filter" className="field-label">
              WhatsApp
            </label>
            <select
              id="whatsapp-filter"
              className="field-input"
              value={filters.whatsapp}
              onChange={(event) => update("whatsapp", event.target.value)}
            >
              <option value="">Any</option>
              <option value="Yes">Sent</option>
              <option value="No">Not sent</option>
            </select>
          </div>

          <div className="flex items-center gap-3 lg:pb-0.5">
            <p aria-live="polite" className="whitespace-nowrap text-sm text-ink-soft">
              {pluralize(matchCount, "application")}
            </p>
            {hasFilters ? (
              <button
                type="button"
                onClick={reset}
                className={buttonClassName("ghost", "sm")}
              >
                Reset
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {visibleGroups.length === 0 ? (
        <EmptyState
          title="No applications found"
          description="No candidate matches the current search and filters."
          icon={<SearchIcon className="h-6 w-6" />}
        />
      ) : (
        <div className="space-y-6">
          {visibleGroups.map(({ group, candidates }) => (
            <section
              key={group.vacancy.VacancyID}
              className="card animate-fade-up overflow-hidden"
              aria-labelledby={`vacancy-${group.vacancy.VacancyID}`}
            >
              <header className="flex flex-col gap-3 border-b border-line bg-canvas px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <div className="min-w-0">
                  <h2
                    id={`vacancy-${group.vacancy.VacancyID}`}
                    className="truncate text-sm font-semibold uppercase tracking-[0.1em] text-ink"
                  >
                    {group.vacancy.Title || "Untitled vacancy"}
                  </h2>
                  <p className="mt-1 truncate text-xs text-ink-faint">
                    {group.vacancy.VacancyID}
                    {group.vacancy.Location ? ` · ${group.vacancy.Location}` : ""}
                    {` · ${pluralize(group.vacancy.Openings, "opening")}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-xs font-medium text-ink-soft">
                    {pluralize(candidates.length, "candidate")}
                  </span>
                  <Link
                    href={`/admin/vacancies/${encodeURIComponent(group.vacancy.VacancyID)}`}
                    className={buttonClassName("secondary", "sm")}
                  >
                    View vacancy
                  </Link>
                </div>
              </header>

              <ul className="divide-y divide-line">
                {candidates.map((candidate) => (
                  <li
                    key={candidate.CandidateID}
                    className="grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <p className="text-[0.95rem] font-semibold text-ink">
                          {candidate.FullName || "Unnamed candidate"}
                        </p>
                        <span className="font-mono text-xs text-ink-faint">
                          {candidate.CandidateID}
                        </span>
                        <StatusBadge status={candidate.Status} />
                        <WhatsAppBadge value={candidate.WhatsAppSent} />
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-soft">
                        {candidate.Phone ? <span>{candidate.Phone}</span> : null}
                        {candidate.Email ? (
                          <a
                            href={`mailto:${candidate.Email}`}
                            className="transition-colors hover:text-accent-deep"
                          >
                            {candidate.Email}
                          </a>
                        ) : null}
                        {candidate.Experience ? (
                          <span>{candidate.Experience}</span>
                        ) : null}
                      </div>

                      {candidate.Message ? (
                        <p className="mt-2 line-clamp-2 max-w-3xl text-sm text-ink-faint">
                          {candidate.Message}
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-col gap-3 lg:items-end">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/admin/candidates/${encodeURIComponent(candidate.CandidateID)}`}
                          className={buttonClassName("primary", "sm")}
                        >
                          View Candidate
                        </Link>
                        <StatusControl
                          candidateId={candidate.CandidateID}
                          status={candidate.Status}
                        />
                      </div>
                      <WhatsAppButton
                        candidateId={candidate.CandidateID}
                        candidateName={candidate.FullName}
                        phone={candidate.Phone}
                        vacancyTitle={
                          candidate.VacancyTitle || group.vacancy.Title
                        }
                        whatsappSent={candidate.WhatsAppSent}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
