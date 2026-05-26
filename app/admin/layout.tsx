import { AdminMobileNav } from "@/components/admin/mobile-nav";
import { AdminSidebar } from "@/components/admin/sidebar";
import { AdminTopBar } from "@/components/admin/admin-top-bar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <AdminTopBar />
        <main className="flex-1 overflow-x-hidden p-4 pb-24 md:p-6 md:pb-6">
          {children}
        </main>
        <AdminMobileNav />
      </div>
    </div>
  );
}
