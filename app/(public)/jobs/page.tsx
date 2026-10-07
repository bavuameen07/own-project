import type { Metadata } from "next";

import { JobsDirectory } from "@/components/jobs-directory";
import { ErrorState } from "@/components/ui/error-state";
import { getOpenVacancies, toUserMessage } from "@/lib/recruitment-api";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Open Positions",
  description:
    "Browse every open position and apply directly. Search and filter roles by job type and location.",
};

export default async function JobsPage() {
  let vacancies: Awaited<ReturnType<typeof getOpenVacancies>>;

  try {
    vacancies = await getOpenVacancies();
  } catch (error) {
    return (
      <div className="page-container py-16 sm:py-24">
        <ErrorState
          title="Unable to load jobs"
          message={toUserMessage(error, "Unable to load open positions.")}
        />
      </div>
    );
  }

  return (
    <div className="page-container py-14 sm:py-20">
      <header className="max-w-2xl">
        <span className="eyebrow">Careers</span>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-[2.4rem]">
          Open positions
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">
          Every listing below is live right now. Use the search and filters to
          find the role that fits you, then apply in a couple of minutes.
        </p>
      </header>

      <div className="mt-10">
        <JobsDirectory vacancies={vacancies} />
      </div>
    </div>
  );
}
