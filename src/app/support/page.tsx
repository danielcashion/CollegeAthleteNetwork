import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import SupportForm from "@/components/SupportPage/SupportForm";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get help with The College Athlete Network. Email, phone, frequently asked questions, and a form to send a question.",
};

const channels = [
  {
    title: "Email Support",
    text: "Get a reply from our team within 24 hours.",
    action: "support@collegeathletenetwork.org",
    href: "mailto:support@collegeathletenetwork.org",
  },
  {
    title: "FAQs",
    text: "Browse answers about networks, profiles, and how schools use the platform.",
    action: "Visit FAQs",
    href: "/faqs",
  },
  {
    title: "Send a Message",
    text: "Use the form on this page for an account, network, or website question.",
    action: "Ask a question",
    href: "#ask",
  },
  {
    title: "Phone",
    text: "Call the New York office if you would rather speak with someone.",
    action: "+1 212 377 7020",
    href: "tel:+12123777020",
  },
];

const topics = [
  {
    title: "School networks",
    text: "Rosters, alumni data, and what a school sees after launch.",
    topic: "School network",
  },
  {
    title: "Account access",
    text: "Signing in, invitations, and who can use a school network.",
    topic: "Account access",
  },
  {
    title: "Billing",
    text: "Invoices, sponsorships, and questions about an existing agreement.",
    topic: "Billing",
  },
  {
    title: "Website issues",
    text: "A page that will not load, a broken link, or something that looks wrong.",
    topic: "Website issue",
  },
];

const faqs: { question: string; answer: ReactNode }[] = [
  {
    question: "I do not see my school. How can I get it added?",
    answer: (
      <>
        We want to know who to call at your school. Fill out the{" "}
        <Link href="/contact-us" className="font-semibold text-[#1C315F] underline underline-offset-4">
          Contact Us
        </Link>{" "}
        form and tell us the school and the person we should reach.
      </>
    ),
  },
  {
    question: "Do athletes have to build their own profiles?",
    answer:
      "No. Unlike traditional platforms, the network is fully pre-populated when a school launches. Alumni and career data are refreshed automatically every 60 days, so the network stays accurate without requiring athletes or alumni to manually update profiles.",
  },
  {
    question: "Does this cost a student-athlete anything?",
    answer: "No. Student-athletes at participating universities use the platform at no cost.",
  },
  {
    question: "Is the network only for one sport?",
    answer:
      "It includes all sports at a university. Career networks do not stop at team boundaries, and neither do professional opportunities.",
  },
  {
    question: "How is information used?",
    answer:
      "The College Athlete Network is a private, school-specific platform. Data is used to support athlete outcomes and alumni engagement. Information is not sold or made public.",
  },
];

export default async function SupportPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;

  return (
    <div className="min-h-screen bg-[#f7f8fb]">
      <header className="bg-gradient-to-r from-[#1C315F] to-[#3d4f86] px-6 pb-16 pt-32 text-center text-white md:pt-36">
        <p className="mx-auto inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]">
          Support
        </p>
        <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight md:text-5xl">
          How Can We Help?
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/80">
          Our team helps schools, athletes, and partners with setup, school
          networks, accounts, and the website.
        </p>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <ul className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
          {channels.map((channel) => (
            <li
              key={channel.title}
              className="flex h-full flex-col rounded-2xl border border-[#e4e8f0] bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-[#1C315F]">{channel.title}</h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-[#3d4d66]">{channel.text}</p>
              <Link
                href={channel.href}
                className="mt-5 block min-h-12 text-sm font-semibold leading-6 text-[#ED3237] hover:underline"
              >
                {channel.href.startsWith("mailto:") ? (
                  <>
                    support@
                    <br />
                    collegeathletenetwork.org
                  </>
                ) : (
                  channel.action
                )}
              </Link>
            </li>
          ))}
        </ul>

        <section className="mt-8">
          <div className="rounded-2xl border border-[#f3d4d5] bg-[#fff8f8] p-6">
            <h2 className="text-lg font-semibold text-[#1C315F]">Before you write</h2>
            <p className="mt-2 text-sm leading-6 text-[#3d4d66]">
              Check the{" "}
              <Link href="/faqs" className="font-semibold text-[#1C315F] underline underline-offset-4">
                FAQs
              </Link>
              . Many questions about profiles, cost, and how a school network works are already answered there.
              Sales and partnership inquiries belong on the{" "}
              <Link href="/contact-us" className="font-semibold text-[#1C315F] underline underline-offset-4">
                contact page
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-[#1C315F]">
            Common Support Topics
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {topics.map((item) => (
              <li key={item.title}>
                <Link
                  href={`/support?topic=${encodeURIComponent(item.topic)}#ask`}
                  className="block h-full rounded-2xl border border-[#e4e8f0] bg-white p-6 shadow-sm transition hover:border-[#1C315F]"
                >
                  <h3 className="text-lg font-semibold text-[#1C315F]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#3d4d66]">{item.text}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mx-auto mt-14 max-w-3xl">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-[#1C315F]">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 divide-y divide-[#e4e8f0] overflow-hidden rounded-2xl border border-[#e4e8f0] bg-white">
            {faqs.map((item) => (
              <details key={item.question} className="group px-6 py-4">
                <summary className="cursor-pointer list-none text-base font-semibold text-[#1C315F] [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-4">
                    {item.question}
                    <span className="text-[#ED3237] group-open:rotate-45" aria-hidden="true">
                      +
                    </span>
                  </span>
                </summary>
                <p className="pt-3 text-sm leading-7 text-[#3d4d66]">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="ask" className="mt-14 scroll-mt-28 rounded-2xl border border-[#e4e8f0] bg-white p-6 shadow-sm sm:p-10">
          <h2 className="text-3xl font-semibold tracking-tight text-[#1C315F]">Send a Message</h2>
          <p className="mb-8 mt-2 max-w-2xl text-[#3d4d66]">
            Tell us what you were trying to do and which school or account is involved.
            We reply to the email address on the form.
          </p>
          <SupportForm initialTopic={topic} />
        </section>

        <section className="mt-14 rounded-2xl bg-[#1C315F] px-6 py-12 text-center text-white">
          <h2 className="text-3xl font-semibold tracking-tight">Still Have Questions?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-white/80">
            Reach out and we will get back to you within 24 hours.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="mailto:support@collegeathletenetwork.org"
              className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[#1C315F]"
            >
              Email support@collegeathletenetwork.org
            </a>
            <a
              href="#ask"
              className="rounded-lg border border-white/40 px-5 py-3 text-sm font-semibold text-white"
            >
              Send a message
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
