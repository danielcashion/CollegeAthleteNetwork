import type { Metadata } from "next";
import Link from "next/link";
import {
  FaHandshake,
  FaMapLocationDot,
  FaMagnifyingGlass,
  FaUserGroup,
  FaBriefcase,
  FaChartLine,
} from "react-icons/fa6";

const canonicalUrl = "https://www.collegeathletenetwork.org/personas/alumni-students";

export const metadata: Metadata = {
  title: "Alumni & Students | Athlete Network Map",
  description:
    "Stop networking by chance. The College Athlete Network gives alumni and student-athletes a searchable map of their university athlete network—by sport, industry, company, and location. Real career value, not distribution lists.",
  keywords:
    "alumni network, student-athletes, college athlete network, career networking, athlete alumni, job search, mentorship, internship",
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: "Alumni & Students | Use the Map of Your Athlete Network",
    description:
      "A searchable, actionable map of your athlete/alumni network. Direct discovery, structured outreach, and real career outcomes—without depending on luck or events.",
    type: "website",
    url: canonicalUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Alumni & Students | Athlete Network Map",
    description:
      "A searchable, actionable map of your athlete/alumni network. Direct discovery, structured outreach, and real career outcomes—without depending on luck or events.",
  },
};

const PAIN_POINTS = [
  {
    pain: "Near-zero visibility into the athlete/alumni network",
    solution:
      "Searchable map by sport, class year, industry, company, location, and role—so you can find the right people, fast.",
  },
  {
    pain: "Networking is luck-based (events + chance meetings)",
    solution:
      "Direct discovery and outreach paths that don't depend on being at the right event or meeting the right person by chance.",
  },
  {
    pain: "Distribution lists are noisy and ineffective",
    solution:
      "Targeted discovery: filter to the people who matter for your goal. Clear calls-to-action, no spam.",
  },
  {
    pain: "Alumni don't know who to contact for specific goals (job change, internship, advice)",
    solution:
      "Structured profiles plus clarity on who can help with what—so you reach the right person for your need.",
  },
  {
    pain: "Students struggle to get warm intros to employers",
    solution:
      "Reveals alumni at target employers and pathways through mutual connections—warm intros without cold outreach.",
  },
  {
    pain: "Alumni want to help, but don't know where they're needed",
    solution:
      "Opportunities and Availabilities surface real needs and ways to contribute—mentor, hire, advise, or refer.",
  },
  {
    pain: "Hard to stay engaged after graduation without a reason",
    solution:
      "Ongoing utility: career moves, hiring, mentorship, community. Identity stays alive through real engagement.",
  },
  {
    pain: "The network feels fragmented across teams, eras, and geography",
    solution:
      "One consolidated ecosystem that connects teams, eras, and geography—no more silos.",
  },
  {
    pain: "No way to see network momentum or outcomes (it feels abstract)",
    solution:
      "Visible activity and impact signals: new joins, connections, hires, mentorship wins—tangible proof.",
  },
  {
    pain: "Gift fatigue: donations feel repetitive and disconnected from personal value",
    solution:
      "A new reason to give: fund the infrastructure that directly delivers career outcomes. Give to keep the network strong and accessible—value-based, not guilt-based.",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    title: "Join / verify affiliation",
    description:
      "Verify your connection to the university and athletic program. Get access to your school's network on the platform.",
  },
  {
    title: "Explore the network map",
    description:
      "Search and filter by sport, class year, industry, company, location, or role. See who's in the network and how they can help.",
  },
  {
    title: "Reach out with purpose",
    description:
      "Mentor, advise, hire, or make introductions. Every outreach has a clear intent—no cold, vague asks.",
  },
  {
    title: "Post an Availability or Opportunity",
    description:
      "Alumni: post roles or mentorship offers. Students: post what you're looking for. Surface real needs and matches.",
  },
  {
    title: "Track outcomes",
    description:
      "Lightweight proof signals—connections made, intros facilitated, hires completed. See the impact.",
  },
];

const BENEFIT_CARDS = [
  {
    icon: <FaMagnifyingGlass size={40} />,
    title: "Search the network",
    desc: "Filter by sport, class year, industry, company, location, and role. Find the right people in seconds.",
  },
  {
    icon: <FaMapLocationDot size={40} />,
    title: "Discover paths",
    desc: "See alumni at target employers and how you're connected. Plan outreach with purpose.",
  },
  {
    icon: <FaUserGroup size={40} />,
    title: "Connect directly",
    desc: "Reach out for mentorship, advice, or intros. No waiting for the right event.",
  },
  {
    icon: <FaBriefcase size={40} />,
    title: "Mentor, hire, advise",
    desc: "Alumni contribute in ways that matter—post opportunities, offer mentorship, make referrals.",
  },
  {
    icon: <FaChartLine size={40} />,
    title: "Opportunities & Availabilities",
    desc: "Post what you need or what you offer. Real matches, real outcomes.",
  },
  {
    icon: <FaHandshake size={40} />,
    title: "Visible outcomes",
    desc: "See network momentum: new joins, connections, hires, mentorship wins.",
  },
];

type FAQItem = {
  q: string;
  a: string;
  linkHref?: string;
  linkText?: string;
};

const FAQ_ITEMS: FAQItem[] = [
  {
    q: "What is College Athlete Network?",
    a: "The College Athlete Network is a platform that maps your university's athlete and alumni network into a searchable, actionable system. Alumni and students can find each other by sport, industry, company, location, and role—and connect with purpose.",
  },
  {
    q: "How is this different from a distribution list or LinkedIn group?",
    a: "Distribution lists blast everyone; LinkedIn groups are broad and passive. The College Athlete Network is a structured map of your athletic network with filters, profiles, and clear ways to post and respond to Opportunities and Availabilities. You target the right people—and they can target you.",
  },
  {
    q: "How do I find the right people in the network?",
    a: "Use filters: sport, class year, industry, company, location, role. Search by what you need—a mentor in finance, an intro at a specific firm, someone hiring in your city. The map surfaces matches.",
  },
  {
    q: "Can I use this even if I can't attend events?",
    a: "Yes. The College Athlete Network is always-on and digital. Discovery and outreach don't depend on being at the right event. You connect from anywhere, anytime.",
  },
  {
    q: "How can alumni help if they're busy?",
    a: "Alumni post Opportunities (roles, mentorship, advice) and browse Availabilities (what students and peers need). They choose how to help—a quick intro, a 30-minute call, a referral. Low-lift, high-impact.",
  },
  {
    q: "What are Availabilities and Opportunities?",
    a: "Availabilities: students and alumni post what they're looking for (job, internship, advice, mentor). Opportunities: alumni and employers post what they offer (roles, mentorship, intros). The platform matches need with capacity.",
  },
  {
    q: "How does this help students get jobs or internships?",
    a: "Students see alumni at target employers, filter by industry and location, and reach out for warm intros. They can also post Availabilities so alumni and employers find them. Direct pathways replace cold applications.",
  },
  {
    q: "Why would I donate if gift fatigue is real?",
    a: "The College Athlete Network creates a new reason: you're funding the infrastructure that delivers real career outcomes. Your gift keeps the network strong and accessible—a value-based investment in your community, not a repetitive obligation.",
  },
  {
    q: "Is my data private / who can see my info?",
    a: "Your information is used within the network according to our privacy practices.",
    linkHref: "/privacy-policy",
    linkText: "See our Privacy Policy for details on data use and visibility.",
  },
  {
    q: "How do I get my athletic department to adopt The College Athlete Network?",
    a: "We work with athletic departments to onboard their programs.",
    linkHref: "/contact-us?source=alumni-students",
    linkText: "Contact us to explore bringing The College Athlete Network to your school.",
  },
];

const PROOF_METRICS = [
  { value: "4,500+", label: "Companies with Alumni in Network", sub: "Easily viewable in the network map" },
  { value: "900+", label: "Internships Created", sub: "Growing Daily" },
  { value: "600+", label: "Mentorship Matches", sub: "Employing Network Expertise" },
  { value: "450+", label: "Hires Facilitated", sub: "As of February 2026)" },
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
            href="#the-problem"
            className="text-[#1C315F] hover:text-[#ED3237] font-medium transition-colors"
          >
            The Problem
          </a>
          <a
            href="#pain-points"
            className="text-[#1C315F] hover:text-[#ED3237] font-medium transition-colors"
          >
            Pain Points & Solutions
          </a>
          <a
            href="#how-it-works"
            className="text-[#1C315F] hover:text-[#ED3237] font-medium transition-colors"
          >
            How It Works
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
            Join the Network
          </a>
        </div>
      </div>
    </nav>
  );
}

export default function AlumniStudentsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <FaqStructuredData />
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="text-white pt-28 bg-gradient-to-r from-[#1C315F] to-[#ED3237] pb-16">
          <div className="container mx-auto px-4 text-center flex flex-col">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 mx-auto w-full max-w-[860px]">
              Connections Here Happen by Design, Not by Chance.
            </h1>
            <p className="text-xl mb-2 max-w-3xl mx-auto">
              A searchable athlete/alumni network you can actually use. Find the right people by title, industry, company, and location.
            </p>
            <p className="text-xl mb-6 max-w-2xl mx-auto">
              Get career outcomes with <strong>always-on access</strong>.
            </p>
            <div className="flex flex-col md:flex-row mx-auto gap-4">
              <Link
                href="https://members.collegeathletenetwork.org/login"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-[#1C315F] text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-[#1c315f] hover:text-white transition duration-200"
              >
                Join the Network
              </Link>
              <Link
                href="https://www.youtube.com/watch?v=SWwTzuWM-EM"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#ED3237] text-white text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-[#ED3237] transition duration-200"
              >
                Explore How It Works
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Nav */}
        <QuickNav />

        {/* The Problem with Today's Network */}
        <section id="the-problem" className="py-16 bg-gray-100 scroll-mt-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C315F] text-center mb-6" role="heading" aria-level={2}>
              What Does Your University's Athlete Network Look Like?
            </h2>
            <p className="text-lg text-[#1C315F]/90 text-center max-w-2xl mx-auto mb-10">
              Most athlete/alumni networks are distribution lists and sporadic events. That creates near-zero visibility and missed connections—outcomes depend on luck.
            </p>
            <ul className="max-w-2xl mx-auto space-y-2 text-[#1C315F]/90 text-lg list-disc pl-6 mb-8">
              <li>Distribution lists that blast everyone, reach no one</li>
              <li>Occasional networking events—be there or miss out</li>
              <li>Zero map of who&apos;s in the network, where they work, what they do</li>
              <li>Connections happen by chance, not by design</li>
              <li>No one maintains the data—schools and alumni don&apos;t want to babysit spreadsheets</li>
            </ul>
            <div className="max-w-2xl mx-auto bg-[#1C315F] text-white p-6 rounded-xl text-center">
              <p className="font-semibold text-lg">
                We keep the data current. Not the school. Not the alumni.
              </p>
              <p className="mt-2 text-white/90">
                Networks fail because no one wants to own the data headache. The College Athlete Network does. You get a usable network without babysitting it. That&apos;s the difference. That&apos;s why it works.
              </p>
            </div>
          </div>
        </section>

        {/* What You Get with The College Athlete Network */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C315F] text-center mb-12" role="heading" aria-level={2}>
              What You Get with The College Athlete Network
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
              Every challenge alumni and students face has a direct solution.
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

        {/* How It Works */}
        <section id="how-it-works" className="py-16 bg-white scroll-mt-24">
          <div className="container mx-auto px-4">
            <h2 className="text-[#1c315f] text-4xl font-bold mb-8 text-center" role="heading" aria-level={2}>
              How It Works
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 text-[#1c315f] max-w-5xl mx-auto">
              {HOW_IT_WORKS_STEPS.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="bg-[#ED3237] text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold mb-2" role="heading" aria-level={3}>
                    {step.title}
                  </h3>
                  <p className="text-lg">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why This Creates a Better Reason to Give */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-[#1c315f] mb-6" role="heading" aria-level={2}>
              Why This Creates a Better Reason to Give
            </h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-[#1C315F]/90 mb-4">
                When you get real career value from the network, you&apos;re more likely to want to give back. But gift fatigue is real—donors need new, credible reasons to contribute year over year.
              </p>
              <p className="text-lg text-[#1C315F]/90 mb-6">
                The College Athlete Network creates that reason: donating sustains a value-producing career network. Your gift funds the infrastructure that directly delivers jobs, mentorship, and connections. Give to keep the network strong and accessible—measurable, personal utility, not guilt-based obligation.
              </p>
              <div className="text-center">
                <Link
                  href="/contact-us?source=alumni-students"
                  className="inline-block bg-[#ED3237] text-white text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-[#ED3237] transition duration-200"
                >
                  Get Your Program Onboarded
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Proof / Outcomes Band */}
        <section id="proof" className="py-12 bg-[#1C315F] text-white scroll-mt-24">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-4">
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

        {/* FAQ Section */}
        <section id="faq" className="py-16 bg-gray-100 scroll-mt-24">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1C315F] text-center mb-4" role="heading" aria-level={2}>
              Alumni & Students FAQ
            </h2>
            <p className="text-lg text-[#1C315F]/80 text-center mb-12">
              Answers to common questions.
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
              Use the Map. Get Real Outcomes.
            </h2>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <Link
                href="https://members.collegeathletenetwork.org/login"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-[#1C315F] text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-[#1c315f] hover:text-white transition duration-300"
              >
                Join the Network
              </Link>
              <Link
                href="https://www.youtube.com/watch?v=SWwTzuWM-EM"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#ED3237] text-white text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-[#ED3237] transition duration-300"
              >
                Explore How It Works
              </Link>
              <Link
                href="/contact-us?source=alumni-students"
                className="border-2 border-white text-white text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-[#1C315F] transition duration-300"
              >
                Get Your Program Onboarded
              </Link>
            </div>
            <p className="mt-4 text-xl">
              Stop depending on luck. Access your athlete network with purpose.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
