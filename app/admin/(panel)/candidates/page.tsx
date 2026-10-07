import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/page-header";
import { RefreshButton } from "@/components/admin/refresh-button";
import { CandidateDirectory } from "@/components/admin/candidate-directory";
import { ErrorState } from "@/components/ui/error-state";
import { getRecruitmentList, toUserMessage } from "@/lib/recruitment-api";
import type { RecruitmentGroup } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Candidates",
};

interface CandidatesPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminCandidatesPage({
  searchParams,
}: CandidatesPageProps) {
  const params = await searchParams;
  const rawVacancy = typeof params.vacancy === "string" ? params.vacancy.trim() : "";

  let groups: RecruitmentGroup[];

  try {
    groups = await getRecruitmentList();
  } catch (error) {
    return (
      <div className="space-y-8">
        <AdminPageHeader
          title="Candidates"
          description="Applications grouped by vacancy."
        />
        <ErrorState
          title="Unable to load candidates"
          message={toUserMessage(error, "Unable to load applications.")}
        />
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Candidates"
        description="All applications grouped by vacancy, straight from the recruitment sheet."
        action={<RefreshButton />}
      />
      <CandidateDirectory groups={groups} initialVacancy={rawVacancy} />
    </div>
  );
}
