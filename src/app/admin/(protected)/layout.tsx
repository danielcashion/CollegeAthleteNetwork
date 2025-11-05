import type { ReactNode } from "react";
import AdminSidebar from "@/components/AdminPanel/AdminSidebar/AdminSidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { redirect } from "next/navigation";

// Force dynamic rendering for this layout
export const dynamic = 'force-dynamic';

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);
  
  // If no session, redirect to login
  if (!session) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen flex overflow-hidden font-open-sans">
      <AdminSidebar />
      <div className="flex-1 h-screen overflow-y-scroll p-10">{children}</div>
    </div>
  );
}