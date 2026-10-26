import FaqsClient from "./FaqsClient";
import { allFaqsForJsonLd } from "./faqs-data";
import JsonLd from "@/lib/seo/JsonLd";
import { marketingMetadata } from "@/lib/seo/metadata";

export const metadata = marketingMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers for student-athletes, alumni, and athletic department staff about The College Athlete Network, profiles, privacy, and outcomes.",
  path: "/faqs",
  keywords:
    "college athlete network FAQ, student-athlete network, alumni engagement, athletic department software",
});

export default function FAQsPage() {
  const faqPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: allFaqsForJsonLd().map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <>
      <JsonLd data={faqPageJsonLd} />
      <FaqsClient />
    </>
  );
}
