"use client";

import { usePathname } from "next/navigation";
import { Analytics } from "@vercel/analytics/react";
import { GoogleAnalytics } from "nextjs-google-analytics";

export default function GoogleAnalyticsClient() {
  const pathname = usePathname() || "";
  if (pathname === "/confirm" || pathname.startsWith("/confirm/")) return null;
  return (
    <>
      <Analytics />
      <GoogleAnalytics trackPageViews gaMeasurementId="G-KKM0XYQD3D" />
    </>
  );
}
