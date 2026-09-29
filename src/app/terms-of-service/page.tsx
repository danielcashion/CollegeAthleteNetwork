import type { Metadata } from "next";
import TermsOfService from "@/components/TermsOfService/TermsOrService";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms that govern use of The College Athlete Network website, applications, and related services.",
};

export default function TermsPage() {
  return <TermsOfService />;
}
