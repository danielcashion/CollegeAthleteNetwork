import type { Metadata } from "next";
import Link from "next/link";
import {
  FaHandshake,
  FaShieldHalved,
  FaChartLine,
  FaUserTie,
  FaBuildingColumns,
  FaGears,
} from "react-icons/fa6";

const canonicalUrl = "https://www.collegeathletenetwork.org/personas/athletic-department-administration";

export const metadata: Metadata = {
  title: "Athletic Department Administration | Institutional Network Ownership",
  description:
    "Make the network institutional—not a coach's contact list. The College Athlete Network gives Athletic Directors, Deputy ADs, and External Affairs leadership continuity, measurable engagement, and a new fundraising narrative that avoids gift fatigue.",
  keywords:
    "athletic department administration, athletic director, alumni engagement, network continuity, fundraising sustainability, institutional ownership",
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: "Athletic Department Administration | Institutionalize Your Network",
    description:
      "Continuity, engagement, and outcomes. The College Athlete Network prevents network loss when coaches leave and creates year-over-year reasons to give.",
    type: "website",
    url: canonicalUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Athletic Department Administration | Institutional Network Ownership",
    description:
      "Continuity, engagement, and outcomes. The College Athlete Network prevents network loss when coaches leave and creates year-over-year reasons to give.",
  },
};

const PAIN_POINTS = [
  {
    pain: "Coach turnover = network loss (contacts on phones, informal lists, group texts)",
    solution:
      "Centralized, program-owned network map. Continuity across staff changes—the network stays with the institution, not the individual.",
  },
  {
    pain: "Gift fatigue for annual giving",
    solution:
      "New year-over-year value narrative tied to outcomes: jobs, internships, mentorship, hiring pipelines. Fund the infrastructure that delivers—not another ask without substance.",
  },
  {
    pain: "Nothing resonates year-over-year with alumni reps AND solves real problems",
    solution:
      "Alumni reps gain a practical tool: network map, targeted outreach, ways to help that aren't just donating. They can mentor, hire, advise—and the department sees the activity.",
  },
  {
    pain: "Coaches want engagement + employment solved, but it never gets operationalized",
    solution:
      "Lightweight workflows that make it easy for coaches to activate the network without owning the whole system. Encourage participation; Admin owns execution.",
  },
  {
    pain: "Alumni satisfaction is an AD KPI—disconnection drives donation decline",
    solution:
      "Improves alumni experience with always-on access, clear ways to contribute, and visible impact. Satisfaction correlates with giving.",
  },
  {
    pain: "Fragmented data across sport silos, alumni reps, and external relations",
    solution:
      "Unified ecosystem across teams, eras, and locations. One source of truth—no more competing spreadsheets.",
  },
  {
    pain: "Over-reliance on events with low conversion and high coordination cost",
    solution:
      "Always-on engagement engine; events become amplifiers, not the only channel. Reach alumni year-round without event dependency.",
  },
  {
    pain: "Difficulty proving impact to justify budget and align stakeholders",
    solution:
      "Measurable engagement and outcome signals—placements, mentorship matches, network growth. Evidence for budget and board conversations.",
  },
  {
    pain: "Brand/reputational risk when alumni feel ignored or athletes struggle post-graduation",
    solution:
      "Visible, structured career support and community continuity. Reduces risk by demonstrating the department cares beyond the uniform.",
  },
  {
    pain: "Recruiting and retention advantage depends on career outcomes",
    solution:
      "Strengthens the after-sport story for recruits and families. Positions the program as career infrastructure—without overpromising outcomes.",
  },
  {
    pain: "Staff bandwidth constraints / too many tools",
    solution:
      "Single platform that reduces manual list management, ad hoc intros, and repetitive outreach. Less busywork, more impact.",
  },
  {
    pain: "Donor segmentation and prospect identification is hard without network visibility",
    solution:
      "Surfaces alumni by industry, company, and geography for targeted activation. Feeds directly into Development Officer workflow.",
  },
];

const BENEFIT_CARDS = [
  {
    icon: <FaBuildingColumns size={40} />,
    title: "Institutional ownership",
    desc: "Network stays with the program—not on a coach's phone. Continuity when staff turn over.",
  },
  {
    icon: <FaChartLine size={40} />,
    title: "Always-on engagement",
    desc: "Year-round touchpoints that produce measurable career outcomes. No event dependency.",
  },
  {
    icon: <FaShieldHalved size={40} />,
    title: "Outcome visibility",
    desc: "Placements, mentorship matches, network growth. Evidence for stakeholders and budget.",
  },
  {
    icon: <FaHandshake size={40} />,
    title: "New reasons to give",
    desc: "Gift fatigue antidote: fund the infrastructure that delivers outcomes. Value-based narrative.",
  },
  {
    icon: <FaGears size={40} />,
    title: "Coach-light workflows",
    desc: "Coaches encourage participation; Admin owns the system. Minimal busywork for busy staff.",
  },
  {
    icon: <FaUserTie size={40} />,
    title: "Alumni rep enablement",
    desc: "Reps connect people, post opportunities, mentor. Practical tools that drive engagement.",
  },
];

const OPERATING_MODEL = [
  {
    role: "Coaches",
    responsibility: "Activate, encourage athletes/alumni to participate",
    notes: "Light touches—recommend the platform, don't own the workflows.",
  },
  {
    role: "Development",
    responsibility: "Leverage metrics, new donor narratives, prospect segmentation",
    notes: "Uses outcome data and network visibility for targeted outreach.",
  },
  {
    role: "Alumni reps / volunteers",
    responsibility: "Connect people, post opportunities, mentor",
    notes: "Practical ways to contribute without being the sole point of contact.",
  },
  {
    role: "Admin",
    responsibility: "Own the system, set expectations, track outcomes",
    notes: "Institutional ownership; minimal workflow burden with clear accountability.",
  },
];

const SUCCESS_OUTCOMES = [
  "Increased alumni engagement touchpoints year-round",
  "More warm intros leading to internships and jobs",
  "Reduced reliance on single staff relationships for network access",
  "Clear annual giving narrative tied to measurable outcomes",
  "Unified view of network across sports and eras",
  "Evidence for budget and stakeholder alignment",
];

type FAQItem = {
  q: string;
  a: string;
  linkHref?: string;
  linkText?: string;
};

const FAQ_ITEMS: FAQItem[] = [
  {
    q: "Why can't we just keep using spreadsheets and alumni reps?",
    a: "Spreadsheets fragment when staff leave and don't scale. Alumni reps are valuable but need tools—a network map, targeted outreach, and visibility into who can help. The College Athlete Network gives reps leverage without making them the bottleneck.",
  },
  {
    q: "How does The College Athlete Network prevent network loss when coaches leave?",
    a: "The network lives in a centralized, program-owned platform—not on phones or informal lists. When a coach transitions out, the contacts, relationships, and institutional memory stay with the department.",
  },
  {
    q: "How does this help with gift fatigue?",
    a: "The College Athlete Network creates a new narrative: donors fund the infrastructure that delivers career outcomes. Year-over-year, the story is about jobs, mentorship, and connectivity—not another generic ask. Value-based, not guilt-based.",
  },
  {
    q: "Who owns and manages The College Athlete Network internally (day-to-day)?",
    a: "Admin owns the system and sets expectations. Alumni Relations or External Affairs typically runs day-to-day—onboarding users, monitoring activity, and feeding outcomes to Development. Coaches and reps participate; they don't manage.",
  },
  {
    q: "How does The College Athlete Network support coaches without adding busywork?",
    a: "Coaches encourage athletes and alumni to join and use the platform. They don't maintain lists or run outreach. Light touches—recommend, remind, celebrate wins. The system does the heavy lifting.",
  },
  {
    q: "How does The College Athlete Network support Development without replacing fundraising systems?",
    a: "The College Athlete Network complements existing CRM and fundraising tools. It provides new engagement angles, outcome metrics, and prospect visibility. Development uses The College Athlete Network data to segment, personalize, and articulate ROI—without replacing their core systems.",
  },
  {
    q: "What does alumni engagement look like when it works?",
    a: "Alumni have <strong>always-on access</strong> to the network, can search and connect with purpose, and see clear ways to contribute (mentor, hire, advise). Engagement is measurable—activity, connections, outcomes—not just event attendance.",
  },
  {
    q: "How do we measure impact (without overstating claims)?",
    a: "Track engagement signals: new joins, connections made, opportunities posted, mentorship matches. Use placeholders for outcomes (e.g., 'internships facilitated') until you have program-specific data. Be transparent about what you're measuring.",
  },
  {
    q: "What about privacy and access control?",
    a: "Access and data use follow our privacy practices.",
    linkHref: "/privacy-policy",
    linkText: "See our Privacy Policy for details.",
  },
  {
    q: "How do we get started and what is the timeline?",
    a: "Timeline depends on program size and readiness. We work with athletic departments to onboard, configure, and launch.",
    linkHref: "/contact-us?source=athletic-admin",
    linkText: "Contact us to discuss.",
  },
];

function FaqStructuredData() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a + (item.linkHref && item.linkText ? ` ${item.linkText}` : ""),
      },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  );
}

function QuickNav() {
  return (
    <nav
      className="sticky top-20 z-40 bg-white/95 backdrop-blur-sm border-b border-[#CCCBCB] shadow-sm"
      aria-label="Page sections"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <a
            href="#continuity-risk"
            className="text-[#1C315F] hover:text-[#ED3237] font-medium transition-colors"
          >
            Continuity Risk
          </a>
          <a
            href="#pain-points"
            className="text-[#1C315F] hover:text-[#ED3237] font-medium transition-colors"
          >
            Pain Points & Solutions
          </a>
          <a
            href="#operating-model"
            className="text-[#1C315F] hover:text-[#ED3237] font-medium transition-colors"
          >
            Operating Model
          </a>
          <a
            href="#success"
            className="text-[#1C315F] hover:text-[#ED3237] font-medium transition-colors"
          >
            What Success Looks Like
          </a>
          <a
            href="#faq"
            className="text-[#1C315F] hover:text-[#ED3237] font-medium transition-colors"
          >
            FAQ
          </a>
          <a
            href="#final-cta"
            className="text-[#1C315F] hover:text-[#ED3237] font-medium transition-colors"
          >
            Schedule a Call
          </a>
        </div>
      </div>
    </nav>
  );
}

export default function AthleticDepartmentAdministrationPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <FaqStructuredData />
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="text-white pt-28 bg-gradient-to-r from-[#1C315F] to-[#ED3237] pb-16">
          <div className="container mx-auto px-4 text-center flex flex-col">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 mx-auto w-full max-w-[860px]">
              Make the Network Institutional—Not a Coach&apos;s Contact List
            </h1>
            <p className="text-xl mb-10 max-w-3xl mx-auto">
              Continuity when staff turn over. Always-on engagement that produces measurable career outcomes. A new fundraising narrative that avoids gift fatigue. The College Athlete Network gives Athletic Department leadership the infrastructure to own the network, not inherit its risks.
            </p>
            <div className="flex flex-col md:flex-row mx-auto gap-4">
              <Link
                href="/contact-us?source=athletic-admin"
                className="bg-white text-[#1C315F] text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-[#1c315f] hover:text-white transition duration-200"
              >
                Schedule a Call
              </Link>
              <Link
                href="https://www.youtube.com/watch?v=SWwTzuWM-EM"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#ED3237] text-white text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-[#ED3237] transition duration-200"
              >
                See the Platform
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Nav */}
        <QuickNav />

        {/* The Hidden Risk: Networks Walk Out the Door */}
        <section id="continuity-risk" className="py-16 bg-gray-100 scroll-mt-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C315F] text-center mb-6" role="heading" aria-level={2}>
              The Hidden Risk: Networks Walk Out the Door
            </h2>
            <p className="text-lg text-[#1C315F]/90 text-center max-w-3xl mx-auto mb-8">
              Coaches leave. Alumni reps turn over. Contacts live on phones, in informal lists, in group texts. When people go, the network goes with them—and the institution has no memory.
            </p>
            <ul className="max-w-2xl mx-auto space-y-2 text-[#1C315F]/90 text-lg list-disc pl-6 mb-8">
              <li>Coaches&apos; contacts on personal phones—gone when they leave</li>
              <li>Alumni rep turnover—no handoff of relationships</li>
              <li>No institutional memory of who knows whom, who can help, who hires</li>
              <li>Nobody wants to babysit the data—schools and network members don&apos;t have time</li>
            </ul>
            <div className="max-w-xl mx-auto space-y-6">
              <div className="bg-[#1C315F] text-white p-6 rounded-xl text-center">
                <p className="font-semibold text-lg">
                  Continuity is a revenue and reputation issue.
                </p>
                <p className="mt-2 text-white/90">
                  When the network walks out the door, giving suffers and alumni feel abandoned.
                </p>
              </div>
              <div className="bg-[#ED3237] text-white p-6 rounded-xl text-center">
                <p className="font-semibold text-lg">
                  We keep the data current. Not the school. Not the coaches. Not the alumni.
                </p>
                <p className="mt-2 text-white/90">
                  Nobody wants to babysit spreadsheets or update profiles. The College Athlete Network does. That&apos;s why it works when other approaches fail.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What Athletic Department Administration Needs */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C315F] text-center mb-12" role="heading" aria-level={2}>
              What Athletic Department Administration Needs
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 text-[#1c315f]">
              {BENEFIT_CARDS.map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md border border-[#CCCBCB]/50 text-center"
                >
                  <div className="mb-2 text-[#1c315f] flex justify-center">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2" role="heading" aria-level={3}>
                    {item.title}
                  </h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pain Points → How The College Athlete Network Solves It */}
        <section id="pain-points" className="py-16 bg-gray-100 scroll-mt-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C315F] text-center mb-4" role="heading" aria-level={2}>
              Pain Points → How The College Athlete Network Solves It
            </h2>
            <p className="text-lg text-[#1C315F]/80 text-center max-w-2xl mx-auto mb-12">
              Operational problems require operational solutions.
            </p>
            <div className="max-w-5xl mx-auto overflow-hidden rounded-xl border border-[#CCCBCB]/50 bg-white shadow-sm">
              <table className="w-full" role="table" aria-label="Pain points and solutions">
                <thead>
                  <tr>
                    <th scope="col" className="text-left px-6 py-4 bg-[#1C315F] text-white font-semibold text-sm uppercase tracking-wider">
                      Pain Point
                    </th>
                    <th scope="col" className="text-left px-6 py-4 bg-[#1C315F] text-white font-semibold text-sm uppercase tracking-wider border-l border-white/20">
                      How The College Athlete Network Solves It
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {PAIN_POINTS.map((item, index) => (
                    <tr
                      key={index}
                      className={index < PAIN_POINTS.length - 1 ? "border-b border-[#CCCBCB]/50" : ""}
                    >
                      <td className="align-top px-6 py-4">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#ED3237]/10 flex items-center justify-center">
                            <span className="text-[#ED3237] font-bold text-sm">{index + 1}</span>
                          </div>
                          <p className="text-[#1C315F]/90">{item.pain}</p>
                        </div>
                      </td>
                      <td className="align-top px-6 py-4 border-l border-[#CCCBCB]/50 bg-gray-50/50">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0">
                            <FaHandshake className="text-[#1C315F]/70 mt-0.5" size={18} />
                          </div>
                          <p className="text-[#1C315F]/90">{item.solution}</p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Operating Model: Who Uses It and How */}
        <section id="operating-model" className="py-16 bg-white scroll-mt-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C315F] text-center mb-4" role="heading" aria-level={2}>
              Operating Model: Who Uses It and How
            </h2>
            <p className="text-lg text-[#1C315F]/80 text-center max-w-2xl mx-auto mb-12">
              Minimal workflow burden. Clear ownership.
            </p>
            <div className="max-w-4xl mx-auto overflow-x-auto">
              <table className="w-full border border-[#CCCBCB] rounded-lg overflow-hidden">
                <thead>
                  <tr className="bg-[#1C315F] text-white">
                    <th className="text-left p-4 font-semibold">Role</th>
                    <th className="text-left p-4 font-semibold">Responsibility</th>
                    <th className="text-left p-4 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {OPERATING_MODEL.map((row, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                    >
                      <td className="p-4 font-semibold text-[#1C315F]">{row.role}</td>
                      <td className="p-4 text-[#1C315F]/90">{row.responsibility}</td>
                      <td className="p-4 text-[#1C315F]/80 text-sm">{row.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* What Success Looks Like */}
        <section id="success" className="py-16 bg-gray-100 scroll-mt-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C315F] text-center mb-4" role="heading" aria-level={2}>
              What Success Looks Like
            </h2>

            <ul className="max-w-2xl mx-auto space-y-3 text-[#1C315F]/90 text-lg list-disc pl-6">
              {SUCCESS_OUTCOMES.map((outcome, index) => (
                <li key={index}>{outcome}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 bg-white scroll-mt-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C315F] text-center mb-4" role="heading" aria-level={2}>
              FAQ for Athletic Department Leadership
            </h2>
            <p className="text-lg text-[#1C315F]/80 text-center mb-12">
              Answers for executives and operational leads.
            </p>
            <div className="max-w-3xl mx-auto space-y-4">
              {FAQ_ITEMS.map((item, index) => (
                <details
                  key={index}
                  className="group bg-gray-50 rounded-xl border border-[#CCCBCB]/50 overflow-hidden"
                >
                  <summary className="flex cursor-pointer list-none p-6 font-semibold text-[#1C315F] hover:bg-gray-100 transition-colors [&::-webkit-details-marker]:hidden">
                    <span className="flex-1">{item.q}</span>
                    <span className="ml-2 text-[#ED3237] group-open:rotate-180 transition-transform inline-block">
                      ▼
                    </span>
                  </summary>
                  <div className="px-6 pb-6 pt-0">
                    <p className="text-[#1C315F]/90 leading-relaxed">
                      {item.a}
                      {item.linkHref && item.linkText && (
                        <>{" "}
                          <Link href={item.linkHref} className="text-[#ED3237] hover:underline">
                            {item.linkText}
                          </Link>
                        </>
                      )}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Block */}
        <section
          id="final-cta"
          className="py-16 bg-[#1c315f] text-white scroll-mt-24"
        >
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6" role="heading" aria-level={2}>
              Institutionalize Your Network. Create Year-Over-Year Reasons to Give.
            </h2>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Link
                href="/contact-us?source=athletic-admin"
                className="bg-white text-[#1C315F] text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-[#1c315f] hover:text-white transition duration-300"
              >
                Schedule a Call
              </Link>
              <Link
                href="https://www.youtube.com/watch?v=SWwTzuWM-EM"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#ED3237] text-white text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-[#ED3237] transition duration-300"
              >
                See the Platform
              </Link>
            </div>
            <p className="mt-4 text-xl">
              Reduce continuity risk. Enable engagement. Deliver outcomes.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
