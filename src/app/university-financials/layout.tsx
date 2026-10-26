import type { Metadata } from "next";
import type { ReactNode } from "react";
import { noIndexMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = noIndexMetadata({
  title: "University financial model",
  description:
    "Internal financial contributions model for athletic departments. Not intended for public search indexing.",
});

export default function UniversityFinancialsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
