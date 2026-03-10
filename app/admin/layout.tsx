import { SidebarProvider } from "@/components/ui/sidebar";
import AdminSidebar from "./_components/sidebar";
import AdminHeader from "./_components/header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden h-screen">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-white">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
