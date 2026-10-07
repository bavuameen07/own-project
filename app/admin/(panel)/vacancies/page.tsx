import type { Metadata } from "next";
import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/page-header";
import { RefreshButton } from "@/components/admin/refresh-button";
import { StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PlusIcon } from "@/components/ui/icons";
import { getRecruitmentList, toUserMessage } from "@/lib/recruitment-api";
import type { RecruitmentGroup } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Vacancies",
};

export default async function AdminVacanciesPage() {
  let groups: RecruitmentGroup[];

  try {
    groups = await getRecruitmentList();
  } catch (error) {
    return (
      <div className="space-y-8">
        <AdminPageHeader
          title="Vacancies"
          description="Every vacancy published on the site."
        />
        <ErrorState
          title="Unable to load vacancies"
          message={toUserMessage(error, "Unable to load vacancies.")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Vacancies"
        description={`${groups.length} ${groups.length === 1 ? "vacancy" : "vacancies"} published on the recruitment sheet.`}
        action={
          <>
            <RefreshButton />
            <ButtonLink href="/admin/vacancies/new" size="sm">
              <PlusIcon className="h-4 w-4" />
              Add Vacancy
            </ButtonLink>
          </>
        }
      />

      {groups.length === 0 ? (
        <EmptyState
          title="No vacancies found"
          description="Create your first vacancy to start receiving applications."
          action={{ label: "Add vacancy", href: "/admin/vacancies/new" }}
        />
      ) : (
        <div className="table-shell animate-fade-in">
          <table className="data-table">
            <caption className="sr-only">List of vacancies</caption>
            <thead>
              <tr>
                <th scope="col">Vacancy ID</th>
                <th scope="col">Title</th>
                <th scope="col">Location</th>
                <th scope="col">Job Type</th>
                <th scope="col">Openings</th>
                <th scope="col">Status</th>
                <th scope="col">Candidates</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.vacancy.VacancyID}>
                  <td className="font-mono text-xs text-ink">
                    {group.vacancy.VacancyID}
                  </td>
                  <td className="font-medium text-ink">
                    <Link
                      href={`/admin/vacancies/${encodeURIComponent(group.vacancy.VacancyID)}`}
                      className="rounded transition-colors hover:text-accent-deep"
                    >
                      {group.vacancy.Title || "Untitled vacancy"}
                    </Link>
                  </td>
                  <td>{group.vacancy.Location || "—"}</td>
                  <td>{group.vacancy.JobType || "—"}</td>
                  <td>{group.vacancy.Openings}</td>
                  <td>
                    <StatusBadge status={group.vacancy.Status} />
                  </td>
                  <td>
                    <Link
                      href={`/admin/candidates?vacancy=${encodeURIComponent(group.vacancy.VacancyID)}`}
                      className="rounded font-medium text-ink transition-colors hover:text-accent-deep"
                    >
                      {group.candidateCount}
                    </Link>
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/admin/vacancies/${encodeURIComponent(group.vacancy.VacancyID)}`}
                      className="inline-flex items-center rounded-full border border-line-strong px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-ink hover:bg-surface-muted"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="rounded-2xl border border-line bg-surface px-5 py-4">
        <h2 className="text-sm font-semibold text-ink">Editing vacancies</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
          The current recruitment API supports creating and viewing vacancies
          only. Editing, closing and deleting a vacancy require new actions in
          the Google Apps Script backend (<code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">
            updateVacancy</code>, <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">closeVacancy</code>,{" "}
          <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">deleteVacancy</code>) and are
          intentionally not shown here.
        </p>
      </div>
    </div>
  );
}
