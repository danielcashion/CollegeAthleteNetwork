import type { Metadata } from "next";
import PrivacyPolicyComponent from "./_components/privacyPolicyComponent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How The College Athlete Network LLC collects, uses, and protects information.",
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyComponent />;
}
