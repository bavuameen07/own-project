import type { Metadata } from "next";
import Link from "next/link";

import { StatusControl } from "@/components/admin/status-control";
import { WhatsAppButton } from "@/components/admin/whatsapp-button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RefreshButton } from "@/components/admin/refresh-button";
import { StatusBadge, WhatsAppBadge } from "@/components/ui/badge";
import { ButtonLink, buttonClassName } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { DocumentIcon, ExternalLinkIcon } from "@/components/ui/icons";
import { isValidHttpUrl } from "@/lib/validation";
import {
  getCandidate,
  isNotFound,
  toUserMessage,
} from "@/lib/recruitment-api";
import type { Candidate } from "@/lib/types";

export const dynamic = "force-dynamic";

interface CandidateDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CandidateDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return { title: `Candidate ${id}` };
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-line py-4 last:border-none last:pb-0">
      <dt className="text-xs font-medium uppercase tracking-wider text-ink-faint">
        {label}
      </dt>
      <dd className="mt-1.5 break-words text-sm text-ink">{value}</dd>
    </div>
  );
}

export default async function CandidateDetailPage({
  params,
}: CandidateDetailPageProps) {
  const { id } = await params;

  let candidate: Candidate | null = null;
  let missing = false;
  let loadError: unknown = null;

  try {
    candidate = await getCandidate(id);
  } catch (error) {
    if (isNotFound(error)) missing = true;
    else loadError = error;
  }

  if (loadError) {
    return (
      <div className="space-y-8">
        <AdminPageHeader title="Candidate" />
        <ErrorState
          title="Unable to load this candidate"
          message={toUserMessage(loadError, "Unable to load this candidate.")}
        />
      </div>
    );
  }

  if (!candidate || missing) {
    return (
      <div className="space-y-8">
        <AdminPageHeader title="Candidate" />
        <EmptyState
          title="Candidate not found"
          description="This candidate ID does not exist in the recruitment sheet, or it has been removed."
          action={{ label: "Back to candidates", href: "/admin/candidates" }}
        />
      </div>
    );
  }

  const resumeIsValid = isValidHttpUrl(candidate.ResumeLink);

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title={candidate.FullName || "Unnamed candidate"}
        description={`${candidate.CandidateID} · Applied for ${candidate.VacancyTitle || candidate.VacancyID}`}
        action={
          <>
            <RefreshButton />
            <ButtonLink href="/admin/candidates" variant="secondary" size="sm">
              Back to candidates
            </ButtonLink>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={candidate.Status} />
        <WhatsAppBadge value={candidate.WhatsAppSent} />
        <Link
          href={`/admin/vacancies/${encodeURIComponent(candidate.VacancyID)}`}
          className="text-xs font-medium text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline"
        >
          View vacancy {candidate.VacancyID}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <section className="card animate-fade-up p-6 sm:p-7">
          <h2 className="text-base font-semibold tracking-tight text-ink">
            Candidate details
          </h2>

          <dl className="mt-3">
            <DetailRow label="Candidate ID" value={candidate.CandidateID} />
            <DetailRow label="Full Name" value={candidate.FullName || "—"} />
            <DetailRow label="Phone" value={candidate.Phone || "—"} />
            <DetailRow label="Email" value={candidate.Email || "—"} />
            <DetailRow
              label="Vacancy"
              value={`${candidate.VacancyTitle || "—"}${
                candidate.VacancyID ? ` (${candidate.VacancyID})` : ""
              }`}
            />
            <DetailRow label="Experience" value={candidate.Experience || "—"} />
            <DetailRow label="Status" value={candidate.Status} />
            <DetailRow label="WhatsApp Sent" value={candidate.WhatsAppSent} />
          </dl>

          <div className="mt-6 border-t border-line pt-5">
            <h3 className="text-xs font-medium uppercase tracking-wider text-ink-faint">
              Resume
            </h3>
            {resumeIsValid ? (
              <a
                href={candidate.ResumeLink}
                target="_blank"
                rel="noopener noreferrer"
                className={`${buttonClassName("secondary", "sm")} mt-3`}
              >
                <DocumentIcon className="h-4 w-4" />
                View Resume
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </a>
            ) : (
              <p className="mt-2 text-sm text-ink-soft">No resume provided.</p>
            )}
            {resumeIsValid ? (
              <p className="mt-2 text-xs text-ink-faint">
                Opens in a new tab.
              </p>
            ) : null}
          </div>

          <div className="mt-6 border-t border-line pt-5">
            <h3 className="text-xs font-medium uppercase tracking-wider text-ink-faint">
              Message
            </h3>
            {candidate.Message ? (
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                {candidate.Message}
              </p>
            ) : (
              <p className="mt-2 text-sm text-ink-soft">
                No message provided by the candidate.
              </p>
            )}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="card animate-fade-up stagger-1 p-6">
            <h2 className="text-sm font-semibold tracking-tight text-ink">
              Change status
            </h2>
            <p className="mt-1 text-xs text-ink-faint">
              New, Shortlisted, Interview, Selected or Rejected.
            </p>
            <div className="mt-4">
              <StatusControl
                candidateId={candidate.CandidateID}
                status={candidate.Status}
              />
            </div>
          </section>

          <section className="card animate-fade-up stagger-2 p-6">
            <h2 className="text-sm font-semibold tracking-tight text-ink">
              Contact candidate
            </h2>
            <p className="mt-1 text-xs text-ink-faint">
              Opens WhatsApp with a pre-filled message. Nothing is sent
              automatically.
            </p>
            <div className="mt-4">
              <WhatsAppButton
                candidateId={candidate.CandidateID}
                candidateName={candidate.FullName}
                phone={candidate.Phone}
                vacancyTitle={candidate.VacancyTitle}
                whatsappSent={candidate.WhatsAppSent}
              />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
