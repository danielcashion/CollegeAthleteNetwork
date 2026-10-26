import Link from "next/link";
import JsonLd from "@/lib/seo/JsonLd";
import { absoluteUrl } from "@/lib/seo/site";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };

  return (
    <>
      <JsonLd data={jsonLd} />
      <nav aria-label="Breadcrumb" className="container mx-auto px-4 pt-24 pb-2">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-[#1C315F]/80">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                {index > 0 ? <span aria-hidden="true">/</span> : null}
                {item.href && !isLast ? (
                  <Link href={item.href} className="hover:text-[#ED3237] underline-offset-2 hover:underline">
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? "font-semibold text-[#1C315F]" : undefined}>
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
