import type { Metadata } from "next";

import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdmin } from "@/lib/auth";
import { getRecruitmentList } from "@/lib/recruitment-api";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · Admin · OpenRoles" },
  description: "OpenRoles recruitment admin panel.",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  // Start the sheet read as early as possible: pages rendered underneath this
  // layout join the same in-flight request instead of starting their own.
  const recruitmentList = await getRecruitmentList().catch((error) => {
    // Log safe diagnostic on server — never exposed to client
    console.error(
      "[AdminPanel] Recruitment list fetch failed:",
      error instanceof Error ? error.message : String(error),
    );
    return null;
  });

  if (!recruitmentList) {
    // Dashboard cannot load without recruitment data — surface a clear message
    return (
      <div className="min-h-screen bg-canvas p-8 text-center">
        <h2 className="mb-4 text-xl font-semibold text-danger">
          Unable to load the dashboard
        </h2>
        <p className="text-text-soft">
          The recruitment service is not configured correctly. Please contact the
          site administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas">
      <AdminSidebar />
      <div className="lg:pl-64">
        <main id="admin-content" className="px-5 py-7 sm:px-8 sm:py-9 lg:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
