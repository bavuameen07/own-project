"use client";

import { useMemo, useState } from "react";

import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchIcon } from "@/components/ui/icons";
import type { Vacancy } from "@/lib/types";

interface JobsDirectoryProps {
  vacancies: Vacancy[];
}

interface Filters {
  query: string;
  jobType: string;
  location: string;
}

const EMPTY_FILTERS: Filters = { query: "", jobType: "", location: "" };

function uniqueSorted(values: string[]): string[] {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));
}

export function JobsDirectory({ vacancies }: JobsDirectoryProps) {
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);

  const jobTypes = useMemo(
    () => uniqueSorted(vacancies.map((vacancy) => vacancy.JobType)),
    [vacancies],
  );
  const locations = useMemo(
    () => uniqueSorted(vacancies.map((vacancy) => vacancy.Location)),
    [vacancies],
  );

  const filtered = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    return vacancies.filter((vacancy) => {
      if (filters.jobType && vacancy.JobType !== filters.jobType) return false;
      if (filters.location && vacancy.Location !== filters.location) return false;
      if (!query) return true;

      const haystack = [
        vacancy.Title,
        vacancy.Location,
        vacancy.JobType,
        vacancy.VacancyID,
        vacancy.Description,
        vacancy.Salary,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [vacancies, filters]);

  const hasActiveFilters =
    filters.query.trim() !== "" || filters.jobType !== "" || filters.location !== "";

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  return (
    <div>
      <div className="card animate-fade-in p-4 sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:items-end">
          <div>
            <label htmlFor="job-search" className="field-label">
              Search
            </label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                id="job-search"
                type="search"
                className="field-input pl-10"
                placeholder="Search by title, location or keyword"
                value={filters.query}
                onChange={(event) => update("query", event.target.value)}
              />
            </div>
          </div>

          {jobTypes.length > 1 ? (
            <div className="lg:w-52">
              <label htmlFor="job-type-filter" className="field-label">
                Job type
              </label>
              <select
                id="job-type-filter"
                className="field-input"
                value={filters.jobType}
                onChange={(event) => update("jobType", event.target.value)}
              >
                <option value="">All job types</option>
                {jobTypes.map((jobType) => (
                  <option key={jobType} value={jobType}>
                    {jobType}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {locations.length > 1 ? (
            <div className="lg:w-52">
              <label htmlFor="location-filter" className="field-label">
                Location
              </label>
              <select
                id="location-filter"
                className="field-input"
                value={filters.location}
                onChange={(event) => update("location", event.target.value)}
              >
                <option value="">All locations</option>
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div className="flex items-center gap-3 lg:pb-0.5">
            <p aria-live="polite" className="whitespace-nowrap text-sm text-ink-soft">
              {filtered.length}{" "}
              {filtered.length === 1 ? "role" : "roles"}
            </p>
            {hasActiveFilters ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters(EMPTY_FILTERS)}
              >
                Reset
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-8">
        {filtered.length === 0 ? (
          <EmptyState
            title={
              hasActiveFilters
                ? "No jobs match your search"
                : "No open positions available"
            }
            description={
              hasActiveFilters
                ? "Try a different keyword or clear the filters to see every open role."
                : "There are no live roles right now. Check back soon for new openings."
            }
            action={
              hasActiveFilters
                ? undefined
                : { label: "Back to home", href: "/" }
            }
            icon={
              <SearchIcon className="h-6 w-6" />
            }
          />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((vacancy, index) => (
              <JobCard
                key={vacancy.VacancyID}
                vacancy={vacancy}
                index={index % 4}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
