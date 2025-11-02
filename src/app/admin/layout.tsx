import type { ReactNode } from "react";
import AdminSidebar from "@/components/AdminPanel/AdminSidebar/AdminSidebar";

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex overflow-hidden font-open-sans">
      <AdminSidebar />
      <div className="flex-1 h-screen overflow-y-scroll p-10">{children}</div>
    </div>
  );
}
