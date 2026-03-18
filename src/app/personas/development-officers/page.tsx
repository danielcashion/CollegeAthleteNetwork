import type { Metadata } from "next";
import Link from "next/link";
import {
  FaHandshake,
  FaChartLine,
  FaUsers,
  FaGraduationCap,
  FaMapLocationDot,
} from "react-icons/fa6";

const canonicalUrl = "https://www.collegeathletenetwork.org/personas/development-officers";

export const metadata: Metadata = {
  title: "Development Officers | Athletic Department Fundraising",
  description:
    "The College Athlete Network helps Athletic Department Development Officers solve donor fatigue, articulate ROI, engage younger alumni, and grow year-over-year giving with measurable outcomes.",
  keywords:
    "athletic department fundraising, development officers, donor fatigue, alumni giving, college athlete network, fundraising ROI, younger alumni engagement",
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: "Development Officers | How The College Athlete Network Drives Athletic Fundraising",
    description:
      "Solve the top 10 pain points Development Officers face. Measurable outcomes, new engagement angles, and a utility-based network that grows giving.",
    type: "website",
    url: canonicalUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Development Officers | Athletic Department Fundraising",
    description:
      "Solve the top 10 pain points Development Officers face. Measurable outcomes, new engagement angles, and a utility-based network that grows giving.",
  },
};

const PAIN_POINTS = [
  {
    pain: "Same donors asked repeatedly (gift fatigue)",
    solution:
      "New engagement angles—hiring, mentorship, career outcomes—create fresh reasons to give beyond the annual ask.",
  },
  {
    pain: "Hard to articulate ROI",
    solution:
      "Measurable outcomes (jobs, internships, mentorship) reframe giving as an investment with tangible results.",
  },
  {
    pain: "Need fresh stories every cycle",
    solution:
      "Continuous story inventory: success trajectories, engagement metrics, and employer recognition—ready for every campaign.",
  },
  {
    pain: "Engagement drops after graduation",
    solution:
      "Utility-based network keeps alumni connected through career value, not nostalgia. Ongoing reason to participate.",
  },
  {
    pain: "Low visibility into alumni network",
    solution:
      "Mapped athlete/alumni ecosystem: employers, industries, geography—giving you a clear view of the full network.",
  },
  {
    pain: "Younger alumni rarely give",
    solution:
      "Non-monetary entry points first: mentor, hire, advise. Build relationship before the ask. Giving follows engagement.",
  },
  {
    pain: "Competes with academic fundraising",
    solution:
      "The College Athlete Network positions athletics as career accelerator and economic value creator—distinct narrative, complementary to academic story.",
  },
  {
    pain: "Lack year-round touchpoints",
    solution:
      "Always-on triggers: availabilities, updates, employer recognition. Stay top-of-mind without over-asking.",
  },
  {
    pain: "Donors want relevance, not obligation",
    solution:
      "Relevance through industry participation, influence, and outcomes. Donors engage because they see impact, not guilt.",
  },
  {
    pain: "Hard to differentiate from peer institutions",
    solution:
      "Unique 'network infrastructure' narrative + measurable impact. Stand out with data-driven differentiation.",
  },
];

const FAQ_ITEMS = [
  {
    q: "How does The College Athlete Network create new reasons to give year after year?",
    a: "The College Athlete Network unlocks engagement angles beyond traditional asks: hiring athletes, mentoring, advising, and celebrating career outcomes. Each creates a fresh value proposition and a new reason to contribute.",
  },
  {
    q: "Can this reduce donor fatigue?",
    a: "Yes. By diversifying how alumni participate (hire, mentor, advise) before asking for gifts, you spread touchpoints and give donors meaningful ways to engage without constant financial asks.",
  },
  {
    q: "How does The College Athlete Network improve donor conversations?",
    a: "You arrive with concrete data: placements, outcomes, employer involvement. Conversations shift from 'please give' to 'here's the impact your support enables'—investment, not donation.",
  },
  {
    q: "Does The College Athlete Network help engage younger alumni?",
    a: "Yes. Younger alumni often lack capacity to give but can mentor, offer internships, or make referrals. The College Athlete Network provides non-monetary entry points that build the relationship for future giving.",
  },
  {
    q: "How does The College Athlete Network strengthen long-term giving pipelines?",
    a: "Engagement before giving. Alumni who participate in hiring or mentorship develop deeper connections. When they're ready to give, the relationship is already established.",
  },
  {
    q: "Can The College Athlete Network help identify new donor prospects?",
    a: "Yes. The mapped network surfaces alumni by employer, industry, and influence. Development teams can prioritize high-potential prospects and tailor outreach based on participation and outcomes.",
  },
  {
    q: "How does The College Athlete Network differentiate athletics fundraising?",
    a: "The College Athlete Network frames athletics as career infrastructure—measurable job placement, employer partnerships, economic mobility. A narrative that stands apart from academic fundraising.",
  },
  {
    q: "Is The College Athlete Network a replacement for traditional fundraising?",
    a: "No. The College Athlete Network complements traditional efforts. It adds new engagement channels, data, and stories. Development officers still run campaigns—with better tools and content.",
  },
  {
    q: "What strategic advantage does The College Athlete Network give development teams?",
    a: "Data visibility into the network, continuous story inventory, and non-monetary entry points. Teams can personalize asks, reduce fatigue, and demonstrate ROI with metrics.",
  },
  {
    q: "Why do development officers find The College Athlete Network compelling?",
    a: "It directly addresses their biggest challenges: same-donor fatigue, ROI articulation, younger alumni engagement, and differentiation. Outcomes and relevance drive giving—The College Athlete Network delivers both.",
  },
];

const PROOF_METRICS = [
  { value: "165,000+", label: "Athletes In Network", sub: "" },
  { value: "2,500+", label: "Employers Represented", sub: "" },
  { value: "3x", label: "year-over-year engagement growth", sub: "" },
  { value: ">50%", label: "Alumni Monetary Participation", sub: "" },
];

function QuickNav() {
  return (
    <nav
      className="sticky top-20 z-40 bg-white/95 backdrop-blur-sm border-b border-[#CCCBCB] shadow-sm"
      aria-label="Page sections"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <a
            href="#pain-points"
            className="text-[#1C315F] hover:text-[#ED3237] font-medium transition-colors"
          >
            Pain Points & Solutions
          </a>
          <a
            href="#proof"
            className="text-[#1C315F] hover:text-[#ED3237] font-medium transition-colors"
          >
            Outcomes
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
            Get Started
          </a>
        </div>
      </div>
    </nav>
  );
}

function FaqStructuredData() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a + ("linkText" in item && item.linkText ? ` ${item.linkText}` : ""),
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

export default function DevelopmentOfficersPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <FaqStructuredData />
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="text-white pt-28 bg-gradient-to-r from-[#1C315F] to-[#ED3237] pb-16">
          <div className="container mx-auto px-4 text-center flex flex-col">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 mx-auto w-full max-w-[860px]">
              Grow Giving Year Over Year—Without Donor Fatigue
            </h1>
            <p className="text-xl mb-10 max-w-3xl mx-auto">
              The College Athlete Network gives Development Officers measurable outcomes, new engagement angles, and a utility-based alumni network. Alumni donate when they see value—The College Athlete Network delivers it.
            </p>
            <div className="flex flex-col md:flex-row mx-auto gap-4">
              <Link
                href="/contact-us?source=development-officers"
                className="bg-white text-[#1C315F] text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-[#1c315f] hover:text-white transition duration-200"
              >
                Request a Demo
              </Link>
              <Link
                href="https://www.youtube.com/watch?v=SWwTzuWM-EM"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#ED3237] text-white text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-[#ED3237] transition duration-200"
              >
                See How It Works
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Nav */}
        <QuickNav />

        {/* Pain Points → How The College Athlete Network Solves It */}
        <section id="pain-points" className="py-16 bg-gray-100 scroll-mt-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C315F] text-center mb-4" role="heading" aria-level={2}>
              Pain Points → How The College Athlete Network Solves It
            </h2>
            <p className="text-lg text-[#1C315F]/80 text-center max-w-2xl mx-auto mb-12">
              Every challenge you face has a direct solution in The College Athlete Network platform.
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
            <div className="max-w-3xl mx-auto mt-12 bg-[#ED3237] text-white p-6 rounded-xl text-center">
              <p className="font-semibold text-lg">
                We keep the data current. Not the school. Not the alumni.
              </p>
              <p className="mt-2 text-white/90">
                Schools and Alumni Volunteers don&apos;t have time to babysit spreadsheets or keep profiles fresh. The College Athlete Network maintains the data—so you get up-to-date stories, visibility, and engagement metrics without the workload. That&apos;s why it works.
              </p>
            </div>
          </div>
        </section>

        {/* Proof / Outcomes Band */}
        <section id="proof" className="py-12 bg-[#1C315F] text-white scroll-mt-24">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">
              Proof & Outcomes
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {PROOF_METRICS.map((metric, index) => (
                <div
                  key={index}
                  className="bg-white/10 rounded-xl p-6 text-center backdrop-blur-sm"
                >
                  <p className="text-3xl md:text-4xl font-bold mb-1">
                    {metric.value}
                  </p>
                  <p className="text-white/90 font-medium">{metric.label}</p>
                  <p className="text-white/60 text-xs mt-1">{metric.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How The College Athlete Network Works - Conversion Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C315F] text-center mb-12" role="heading" aria-level={2}>
              Why Development Teams Choose The College Athlete Network
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-[#1c315f]">
              {[
                {
                  icon: <FaChartLine size={40} />,
                  title: "Measurable ROI",
                  desc: "Jobs, internships, mentorship—quantifiable impact to share with donors.",
                },
                {
                  icon: <FaUsers size={40} />,
                  title: "New Donor Angles",
                  desc: "Hiring, mentoring, advising: participation before the ask.",
                },
                {
                  icon: <FaMapLocationDot size={40} />,
                  title: "Network Visibility",
                  desc: "See your athlete-alumni ecosystem by employer, industry, and geography.",
                },
                {
                  icon: <FaGraduationCap size={40} />,
                  title: "Story Inventory",
                  desc: "Fresh success stories and engagement data for every campaign cycle.",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg shadow-md text-center"
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

        {/* FAQ Section */}
        <section id="faq" className="py-16 bg-gray-100 scroll-mt-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C315F] text-center mb-4" role="heading" aria-level={2}>
              How We Help Development Officers
            </h2>
            <p className="text-lg text-[#1C315F]/80 text-center mb-12">
              Answers to the questions we hear most.
            </p>
            <div className="max-w-3xl mx-auto space-y-6">
              {FAQ_ITEMS.map((item, index) => (
                <article
                  key={index}
                  className="bg-white rounded-xl border border-[#CCCBCB]/50 p-6 shadow-sm"
                >
                  <h3 className="text-lg font-semibold text-[#1C315F] mb-3">
                    {item.q}
                  </h3>
                  <p className="text-[#1C315F]/90 leading-relaxed">{item.a}</p>
                </article>
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
              Ready to Transform Your Fundraising Strategy?
            </h2>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Link
                href="/contact-us?source=development-officers"
                className="bg-white text-[#1C315F] text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-[#1c315f] hover:text-white transition duration-300"
              >
                Request a Demo
              </Link>
              <Link
                href="https://www.youtube.com/watch?v=SWwTzuWM-EM"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#ED3237] text-white text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-[#ED3237] transition duration-300"
              >
                See How It Works
              </Link>
            </div>
            <p className="mt-4 text-xl">
              See how The College Athlete Network helps Development Officers increase giving without donor fatigue. Get metrics-driven outcomes your donors will invest in.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
