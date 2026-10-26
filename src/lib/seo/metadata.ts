import type { Metadata } from "next";
import { DEFAULT_OG_IMAGE_PATH } from "./site";

export function marketingMetadata(options: {
  title: string;
  description: string;
  path: string;
  keywords?: string;
}): Metadata {
  const { title, description, path, keywords } = options;
  return {
    title,
    description,
    ...(keywords ? { keywords } : {}),
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type: "website",
      images: [{ url: DEFAULT_OG_IMAGE_PATH }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE_PATH],
    },
  };
}

export function noIndexMetadata(options: {
  title: string;
  description?: string;
  canonical?: string;
}): Metadata {
  return {
    title: options.title,
    description: options.description,
    robots: { index: false, follow: false },
    ...(options.canonical
      ? { alternates: { canonical: options.canonical } }
      : {}),
  };
}
