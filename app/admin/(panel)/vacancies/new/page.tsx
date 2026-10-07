import type { Metadata } from "next";

import { AdminPageHeader } from "@/components/admin/page-header";
import { VacancyForm } from "@/components/admin/vacancy-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add Vacancy",
};

export default async function NewVacancyPage() {
  return (
    <div className="space-y-7">
      <AdminPageHeader
        title="Add Vacancy"
        description="Create a new position. The vacancy ID is generated automatically by the recruitment backend."
      />
      <VacancyForm />
    </div>
  );
}
