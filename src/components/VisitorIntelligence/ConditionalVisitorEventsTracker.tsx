"use client";

import { usePathname } from "next/navigation";
import VisitorEventsTracker from "./VisitorEventsTracker";

/**
 * Skips visitor intelligence on admin routes (mirrors {@link ConditionalLogUserIP}).
 */
export default function ConditionalVisitorEventsTracker() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return null;
  }
  return <VisitorEventsTracker />;
}
