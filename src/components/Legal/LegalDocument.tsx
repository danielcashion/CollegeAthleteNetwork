"use client";

import Link from "next/link";

export type LegalTocItem = {
  href: string;
  label: string;
  children?: LegalTocItem[];
};

type RelatedDocument = {
  href: string;
  label: string;
};

type LegalDocumentProps = {
  title: string;
  summary: string;
  effectiveDate: string;
  toc?: LegalTocItem[];
  related?: RelatedDocument[];
  children: React.ReactNode;
};

function TocList({
  items,
  nested = false,
}: {
  items: LegalTocItem[];
  nested?: boolean;
}) {
  return (
    <ol className={nested ? "mt-1 space-y-1 border-l border-[#d5dbe6] pl-3" : "space-y-2"}>
      {items.map((item) => (
        <li key={item.href}>
          <a
            href={item.href}
            className={
              nested
                ? "text-[13px] leading-snug text-[#3d4d66] hover:text-[#1C315F]"
                : "text-sm font-medium leading-snug text-[#1C315F] hover:text-[#9d1f24]"
            }
          >
            {item.label}
          </a>
          {item.children ? <TocList items={item.children} nested /> : null}
        </li>
      ))}
    </ol>
  );
}

export default function LegalDocument({
  title,
  summary,
  effectiveDate,
  toc,
  related,
  children,
}: LegalDocumentProps) {
  return (
    <div className="min-h-screen bg-[#eef1f6]">
      <header className="border-b-[3px] border-[#c4282c] bg-[#1C315F] text-white">
        <div className="mx-auto max-w-6xl px-6 pb-10 pt-32 md:pt-36">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/65">
            The College Athlete Network LLC
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-white md:text-[2.5rem] md:leading-tight">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/80">{summary}</p>
          <p className="mt-6 text-sm text-white/70">
            <span className="font-medium text-white">Effective date</span>
            <span className="mx-2 text-white/40" aria-hidden="true">
              |
            </span>
            {effectiveDate}
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl items-start gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[15.5rem_minmax(0,1fr)] lg:px-8">
        {toc && toc.length > 0 ? (
          <nav aria-label="Contents" className="lg:sticky lg:top-24">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5c6b82]">
              Contents
            </p>
            <TocList items={toc} />
          </nav>
        ) : (
          <div className="hidden lg:block" />
        )}
        <article className="legal-doc bg-white px-5 py-8 shadow-[0_1px_2px_rgba(28,49,95,0.06)] ring-1 ring-[#d7dee8] sm:px-10 sm:py-10">
          {children}
          {related && related.length > 0 ? (
            <footer className="legal-doc-related mt-12 border-t border-[#e3e8f0] pt-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5c6b82]">
                Related documents
              </p>
              <ul className="mt-3 flex list-none flex-col gap-2 p-0 sm:flex-row sm:gap-6">
                {related.map((document) => (
                  <li key={document.href} className="list-none p-0">
                    <Link href={document.href}>{document.label}</Link>
                  </li>
                ))}
              </ul>
            </footer>
          ) : null}
        </article>
      </div>
    </div>
  );
}
