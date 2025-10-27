"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Home, LayoutDashboard, Mail } from "lucide-react";
import Logo from "../../../public/Logos/CANLogo-horizontal-white.png";
import Image from "next/image";

const adminSidebarItems = [
  {
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    href: "/admin/e-comms",
    icon: Mail,
    label: "HuddleUp",
  },
];

export default function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  if (!pathname.startsWith("/admin") || pathname === "/admin") {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/admin");
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-blueMain to-blue-900 text-white min-h-screen py-6 px-4 flex flex-col">
      <div className="mb-8">
        <Image src={Logo} alt="CAN Logo" className="w-40 mb-6" />
        <h2 className="text-xl font-bold">ADMIN PANEL</h2>
      </div>

      <nav className="flex-1">
        <ul className="space-y-1">
          {adminSidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-auto pt-6 border-t border-white/20">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200 w-full mb-1"
        >
          <Home className="h-5 w-5" />
          <span>Back to Home Page</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors duration-200 w-full text-left"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
