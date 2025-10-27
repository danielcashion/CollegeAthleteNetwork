import type { ReactNode } from "react";
import AdminSidebar from "@/components/AdminSidebar/AdminSidebar";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";

export default async function Layout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen flex overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 h-screen overflow-y-scroll">{children}</div>
    </div>
  );
}
