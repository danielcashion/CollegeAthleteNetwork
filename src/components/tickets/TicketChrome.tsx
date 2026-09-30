"use client";

import { usePathname } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import Navbar from "@/components/Navbar/Navbar";
import Footer from "@/components/Footer/Footer";
import ConditionalLogUserIP from "@/components/UserAudit/ConditionalLogUserIP";
import ConditionalVisitorEventsTracker from "@/components/VisitorIntelligence/ConditionalVisitorEventsTracker";
import CanVideoModal from "@/components/Modals/CanVideoModal";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import FloatingActionButton from "@/components/FloatingActionButton";

export function TicketQr({ value }: { value: string }) {
  return (
    <div className="rounded-2xl bg-[#F6F1E7] p-4">
      <QRCodeSVG value={value} size={196} level="M" bgColor="#F6F1E7" fgColor="#1C315F" />
    </div>
  );
}

export function TicketActions({
  publicId,
  platform,
}: {
  publicId: string;
  platform: "ios" | "android" | "other";
}) {
  const apple = (
    <a key="apple" href={`/api/tickets/${publicId}/pkpass`} className="inline-flex">
      <img src="/images/AddtoAppleWallet.png" alt="Add to Apple Wallet" className="h-11 w-auto" />
    </a>
  );
  const google = (
    <a key="google" href={`/api/tickets/${publicId}/google`} className="inline-flex">
      <img src="/images/AddToGoogleWallet.png" alt="Add to Google Wallet" className="h-11 w-auto" />
    </a>
  );
  const buttons = platform === "ios" ? [apple] : platform === "android" ? [google] : [apple, google];
  return <div className="mt-6 flex flex-col gap-3">{buttons}</div>;
}

export function SiteFrame({ children }: { children: React.ReactNode }) {
  const path = usePathname() || "";
  const bare = path === "/t" || path.startsWith("/t/");
  if (bare) return <main id="main-content">{children}</main>;
  return (
    <>
      <nav id="site-navigation" aria-label="Site navigation" tabIndex={-1}>
        <Navbar />
      </nav>
      <main id="main-content" aria-label="Main content" role="main">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <footer id="site-footer" aria-label="Site footer" role="contentinfo">
        <Footer />
      </footer>
      <FloatingActionButton />
      <CanVideoModal />
      <ConditionalLogUserIP />
      <ConditionalVisitorEventsTracker />
    </>
  );
}
