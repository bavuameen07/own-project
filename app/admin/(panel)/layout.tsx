import type { Metadata } from "next";

import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdmin } from "@/lib/auth";

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
