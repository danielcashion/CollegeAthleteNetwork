import type { ReactNode } from "react";
import AdminSidebar from "@/components/AdminPanel/AdminSidebar/AdminSidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/auth";
import { redirect } from "next/navigation";

// Force dynamic rendering for this layout
export const dynamic = 'force-dynamic';

export default async function ProtectedLayout({ children }: { children: ReactNode }) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log("Protected layout - session check:", !!session);
    
    // If no session, redirect to login
    if (!session) {
      console.log("No session found, redirecting to /admin");
      redirect("/admin");
    }

    return (
      <div className="min-h-screen flex overflow-hidden font-open-sans">
        <AdminSidebar />
        <div className="flex-1 h-screen overflow-y-scroll p-10">{children}</div>
      </div>
    );
  } catch (error) {
    console.error("Error in protected layout:", error);
    redirect("/admin");
  }
}