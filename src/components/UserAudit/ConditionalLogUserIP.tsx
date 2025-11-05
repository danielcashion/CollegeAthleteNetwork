"use client";

import { usePathname } from "next/navigation";
import LogUserIP from "./LogUserIP";

export default function ConditionalLogUserIP() {
  const pathname = usePathname();
  
  // Don't log IP for admin pages
  if (pathname.startsWith("/admin")) {
    return null;
  }
  
  return <LogUserIP />;
}