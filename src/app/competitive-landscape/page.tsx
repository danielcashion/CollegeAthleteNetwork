import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Competitive Landscape | Athlete Career Networks",
  description:
    "A strategic analysis comparing Handshake, Athlete Network, and The College Athlete Network. Why athlete professional networks require specialized infrastructure—and why CAN delivers.",
  keywords:
    "competitive analysis, athlete career network, Handshake, Athlete Network, college athlete network, alumni engagement, athlete recruiting",
  alternates: {
    canonical: "https://www.collegeathletenetwork.org/competitive-landscape",
  },
  openGraph: {
    title: "Competitive Landscape: Athlete Career Networks",
    description:
      "Why The College Athlete Network is materially superior for universities, athletes, and alumni. Evidence-based platform comparison.",
    url: "https://www.collegeathletenetwork.org/competitive-landscape",
  },
};

export default function CompetitiveLandscapePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        {/* Hero */}
        <section className="text-white pt-28 pb-16 bg-gradient-to-r from-[#1C315F] to-[#ED3237]">
          <div className="container mx-auto px-4 text-center">
            <p className="uppercase tracking-[0.2em] text-sm font-semibold text-white/80 mb-4">
              Strategic Analysis
            </p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 max-w-4xl mx-auto">
              Competitive Landscape: Athlete Career Networks
            </h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              A comprehensive comparison of career and engagement platforms—and why The College Athlete Network is the only solution built around the athlete network graph.
            </p>
            <Link
              href="/contact-us?source=competitive-landscape"
              className="inline-block mt-8 bg-white text-[#1C315F] text-lg font-semibold px-8 py-3 rounded-full hover:bg-[#1c315f] hover:text-white transition duration-200"
            >
              Request a Demo
            </Link>
          </div>
        </section>

        {/* 1. Introduction */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-[#1C315F] mb-6" id="introduction">
              1. Introduction: The Athlete Career Network Opportunity
            </h2>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              Student-athletes represent a uniquely valuable talent pool: disciplined, coachable, and trained in leadership and teamwork. Yet the infrastructure to connect athletes with career opportunities—and to sustain that connection after graduation—remains fragmented. Most universities rely on general career platforms, engagement tools, or manual spreadsheets. None are designed around the athlete network graph.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              This analysis compares three approaches: Handshake (the dominant career-center job board), Athlete Network and UNITE (athletic department engagement platforms), and The College Athlete Network (athlete professional network infrastructure). The conclusion is clear: athlete career outcomes require a specialized network architecture that only CAN provides.
            </p>
          </div>
        </section>

        {/* 2. Current Landscape */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-[#1C315F] mb-6">
              2. The Current Landscape of Career Platforms
            </h2>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              Universities today face a patchwork of solutions. Career services deploy job boards and employer networks. Athletic departments deploy engagement platforms and alumni communication tools. Neither constructs a true athlete professional network—a roster-based graph that maps athletes to alumni, employers, and career outcomes.
            </p>
            <p className="text-lg text-[#1C315F]/90">
              The gap matters. Athletes change jobs every 3.1 years on average in the first 15 years post-graduation. For a network of 3,000 athletes, that means roughly 1,200 updates annually. No career office or athletic department has the bandwidth to maintain that data. The platforms that could help either don&apos;t provide the data or require the institution to supply it. The College Athlete Network is the exception: we provide the data. We maintain it. The institution gets the network.
            </p>
          </div>
        </section>

        {/* 3. Platform Overview: Handshake */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-[#1C315F] mb-6">
              3. Platform Overview: Handshake
            </h2>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              Handshake is the largest career network for higher education. It powers career offices at <strong>1,400+ universities</strong> and connects students with <strong>750,000+ employers</strong>. Approximately 20 million students and alumni use the platform. Schools joining Handshake see on average a 3x increase in employer network size and diversity.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>Target audience:</strong> Career centers, employers, and the general student population. Handshake is built for broad job-matching—not athlete-specific identity or alumni-athlete networks.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>Data model:</strong> Students self-report resume data, major, graduation year, skills, and job preferences. The platform provides job listings, employer events, and recruiting workflows. Data is self-reported and structurally flat—there is no institutional roster, no sport identity, and weak alumni persistence.
            </p>
            <p className="text-lg text-[#1C315F]/90">
              <strong>Strategic positioning:</strong> Handshake is a career-center job board. It excels at volume recruiting and employer access. It does not map athlete rosters, sport affiliation, or athlete-alumni career trajectories. For athletic departments seeking a dedicated athlete network, Handshake is the wrong tool.
            </p>
          </div>
        </section>

        {/* 4. Platform Overview: Athlete Network */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-[#1C315F] mb-6">
              4. Platform Overview: Athlete Network (UNITE)
            </h2>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              Athlete Network provides UNITE software—a digital engagement platform for current and former student-athletes. It serves athletic departments at colleges, universities, high schools, and associations. Programs including USC, Vanderbilt, Michigan, Penn State, Virginia Tech, Indiana, and Clemson use UNITE.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>Target audience:</strong> Athletic departments, alumni engagement teams, and athlete communities. UNITE is built for communication, events, and engagement—not for constructing a professional network graph.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>Features:</strong> Branded landing pages, career resources, mentorship programs, event management, e-learning, messaging, and analytics. The platform connects current and alumni athletes in communities and facilitates peer-to-peer networking.
            </p>
            <p className="text-lg text-[#1C315F]/90">
              <strong>Data model:</strong> Athlete participation, school affiliation, and community membership are required from users. The platform provides engagement content, mentoring workflows, and career resources. It is primarily <strong>communication infrastructure</strong>—not a data-provided network. The institution or users supply the data; UNITE organizes the experience.
            </p>
          </div>
        </section>

        {/* 5. Platform Overview: College Athlete Network */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-[#1C315F] mb-6">
              5. Platform Overview: The College Athlete Network
            </h2>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              The College Athlete Network builds cross-sport athlete professional networks inside universities. We source current and historic public athlete rosters, map athletes to third-party datasets (including LinkedIn), and refresh employer, title, and location data every 60 days. The result is an institutional athlete network graph that the university owns—without maintaining it.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>Target audience:</strong> Athletes, athlete alumni, athletic department leadership, development officers, and corporate employers seeking athlete talent. CAN is built exclusively for the athlete network.
            </p>
            <p className="text-lg text-[#1C315F]/90">
              <strong>Data model:</strong> CAN <strong>provides</strong> the data—official rosters, athlete identity, sport, team membership, alumni career data, and employer mapping. We do not ask users to build the network. We deliver it. This produces a true institutional athlete network graph that no other platform offers.
            </p>
          </div>
        </section>

        {/* 6. Structural Differences */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-[#1C315F] mb-6">
              6. Structural Differences in Network Design
            </h2>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>Handshake network structure:</strong> Student profile → employer job posting → job application. The graph is applicant-centric. There is no roster, no sport, no alumni-athlete identity.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>Athlete Network structure:</strong> Athlete community → communication hub → engagement programs. The graph is community-centric. It organizes people for engagement but does not map them to employers, career outcomes, or a searchable professional network.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>College Athlete Network structure:</strong> Athlete roster → sport → university → athlete alumni → companies → career outcomes. The graph is roster-based and institution-owned. Every node is mapped: who played what sport, where they work, what they do. The roster-based network graph is fundamentally stronger because it reflects institutional reality—not self-reported profiles or ad hoc communities.
            </p>
          </div>
        </section>

        {/* 7. Data Architecture */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-[#1C315F] mb-6">
              7. Data Architecture Comparison
            </h2>
            <div className="overflow-x-auto mb-8">
              <table className="w-full border border-[#CCCBCB] rounded-lg">
                <thead>
                  <tr className="bg-[#1C315F] text-white">
                    <th className="text-left p-4 font-semibold">Dimension</th>
                    <th className="text-left p-4 font-semibold">Handshake</th>
                    <th className="text-left p-4 font-semibold">Athlete Network</th>
                    <th className="text-left p-4 font-semibold">College Athlete Network</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#CCCBCB] bg-gray-50">
                    <td className="p-4 font-semibold">Data required from users</td>
                    <td className="p-4">Resume, major, graduation year, skills, preferences</td>
                    <td className="p-4">Athlete participation, school affiliation, community membership</td>
                    <td className="p-4">None—we provide the data</td>
                  </tr>
                  <tr className="border-b border-[#CCCBCB]">
                    <td className="p-4 font-semibold">Data provided by platform</td>
                    <td className="p-4">Job listings, employer events, recruiting</td>
                    <td className="p-4">Engagement content, mentoring, career resources</td>
                    <td className="p-4">Rosters, athlete identity, sport, alumni career data, employer mapping</td>
                  </tr>
                  <tr className="border-b border-[#CCCBCB] bg-gray-50">
                    <td className="p-4 font-semibold">Data structure</td>
                    <td className="p-4">Self-reported, limited structural identity</td>
                    <td className="p-4">Communication infrastructure</td>
                    <td className="p-4">Institutional athlete network graph</td>
                  </tr>
                  <tr className="border-b border-[#CCCBCB]">
                    <td className="p-4 font-semibold">Data maintenance</td>
                    <td className="p-4">User-maintained profiles</td>
                    <td className="p-4">Institution or user-supplied</td>
                    <td className="p-4">Platform-maintained, refreshed every 60 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-lg text-[#1C315F]/90">
              This distinction is critical. Handshake and Athlete Network require users or institutions to supply and maintain data. The College Athlete Network provides and maintains the data. Data curation is 99% of the problem—and CAN owns it. That is why the network works.
            </p>
          </div>
        </section>

        {/* 8. Network Effects */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-[#1C315F] mb-6">
              8. Network Effects and Growth Models
            </h2>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>Handshake:</strong> Universities → employers → job listings. Value accrues from employer density and job volume. Alumni persistence is weak; the platform optimizes for current-student recruiting.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>Athlete Network:</strong> Athletes → engagement → alumni communication. Value accrues from community participation and event attendance. The network is engagement-driven, not career-outcome-driven.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>College Athlete Network:</strong> Athletes → alumni athletes → corporate employers → career outcomes → stronger alumni engagement → stronger athletic programs. The athlete-to-athlete alumni network is uniquely powerful. Alumni athletes have stronger affinity bonds than general alumni. When they hire, mentor, or advise fellow athletes, the network compounds. Career outcomes drive engagement; engagement drives giving; giving strengthens the program.
            </p>
          </div>
        </section>

        {/* 9. Stakeholder Value */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-[#1C315F] mb-6">
              9. Stakeholder Value in Universities
            </h2>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>Handshake buyers:</strong> Career services. The platform serves the career center. Athletic departments are not the primary stakeholder.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>Athlete Network buyers:</strong> Athletic departments and alumni engagement teams. The platform serves communication and community.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>College Athlete Network buyers:</strong> Athletic directors, development officers, alumni relations, NIL leadership, and corporate partnership teams. CAN aligns with more powerful decision makers inside universities. It delivers institutional ownership, fundraising narrative, and career outcomes—all from one platform.
            </p>
          </div>
        </section>

        {/* 10. Why Athlete Networks Require Specialized Infrastructure */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-[#1C315F] mb-6">
              10. Why Athlete Networks Require Specialized Infrastructure
            </h2>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              Athletes and athlete alumni require a specialized network that general career platforms cannot provide. Reasons include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-lg text-[#1C315F]/90 mb-6">
              <li><strong>Roster-based identity:</strong> Athletes are defined by sport, team, and class year—not just major and graduation. General platforms don&apos;t map this.</li>
              <li><strong>Alumni-athlete affinity:</strong> Former athletes have stronger bonds with their program than general alumni. They hire, mentor, and give at higher rates when the network is athlete-specific.</li>
              <li><strong>Employer demand:</strong> Employers seek athletes for discipline, leadership, teamwork, and coachability. A dedicated athlete talent pool is higher-quality than a general applicant pool.</li>
              <li><strong>Data maintenance:</strong> Athlete career data changes constantly. No institution can maintain it. Only a specialized platform with productionized data curation can.</li>
            </ul>
          </div>
        </section>

        {/* 11. Why CAN Is Superior */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl font-bold text-[#1C315F] mb-6">
              11. Why The College Athlete Network Is the Superior Solution
            </h2>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              The College Athlete Network is materially better for student athletes, athlete alumni, athletic department leadership, development officers, and universities building alumni engagement because it is <strong>the only platform designed around the athlete network graph</strong>.
            </p>
            <ul className="list-disc pl-6 space-y-2 text-lg text-[#1C315F]/90 mb-6">
              <li><strong>We provide the data.</strong> Rosters, LinkedIn mapping, employer and title updates every 60 days. No babysitting. No spreadsheets.</li>
              <li><strong>Institutional ownership.</strong> The network stays with the university—not with a coach, a spreadsheet, or a departing staff member.</li>
              <li><strong>Cross-sport connectivity.</strong> Athletes connect with peers and alumni across all sports. One unified network.</li>
              <li><strong>Fundraising narrative.</strong> Development officers get measurable outcomes—jobs, internships, mentorship—and a new reason to give that avoids gift fatigue.</li>
              <li><strong>Employer access.</strong> Corporate partners get a curated athlete talent pool. Athletes get warm intros. Everyone wins.</li>
            </ul>
          </div>
        </section>

        {/* 12. Comparison Table */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4 max-w-5xl">
            <h2 className="text-3xl font-bold text-[#1C315F] mb-8 text-center">
              12. Competitive Comparison Table
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border border-[#CCCBCB] rounded-lg bg-white">
                <thead>
                  <tr className="bg-[#1C315F] text-white">
                    <th className="text-left p-4 font-semibold">Dimension</th>
                    <th className="text-left p-4 font-semibold">Handshake</th>
                    <th className="text-left p-4 font-semibold">Athlete Network</th>
                    <th className="text-left p-4 font-semibold">College Athlete Network</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#CCCBCB]">
                    <td className="p-4 font-semibold">Target users</td>
                    <td className="p-4">Career centers, employers, general students</td>
                    <td className="p-4">Athletic departments, athlete communities</td>
                    <td className="p-4 bg-[#ED3237]/5">Athletes, alumni, ADs, development, employers</td>
                  </tr>
                  <tr className="border-b border-[#CCCBCB] bg-gray-50">
                    <td className="p-4 font-semibold">Data structure</td>
                    <td className="p-4">Self-reported profiles</td>
                    <td className="p-4">User/institution-supplied</td>
                    <td className="p-4 bg-[#ED3237]/5">Platform-provided, institutional graph</td>
                  </tr>
                  <tr className="border-b border-[#CCCBCB]">
                    <td className="p-4 font-semibold">Network graph</td>
                    <td className="p-4">Student → job → employer</td>
                    <td className="p-4">Community → engagement</td>
                    <td className="p-4 bg-[#ED3237]/5">Roster → sport → alumni → employers → outcomes</td>
                  </tr>
                  <tr className="border-b border-[#CCCBCB] bg-gray-50">
                    <td className="p-4 font-semibold">Recruiting workflows</td>
                    <td className="p-4">Volume job matching</td>
                    <td className="p-4">Career resources, employer access</td>
                    <td className="p-4 bg-[#ED3237]/5">Athlete talent pool, warm intros, employer mapping</td>
                  </tr>
                  <tr className="border-b border-[#CCCBCB]">
                    <td className="p-4 font-semibold">Alumni engagement</td>
                    <td className="p-4">Weak persistence</td>
                    <td className="p-4">Communication, events</td>
                    <td className="p-4 bg-[#ED3237]/5">Identity by sport, career mapping, mentorship, hiring</td>
                  </tr>
                  <tr className="border-b border-[#CCCBCB] bg-gray-50">
                    <td className="p-4 font-semibold">Athlete identity mapping</td>
                    <td className="p-4">None</td>
                    <td className="p-4">Community membership</td>
                    <td className="p-4 bg-[#ED3237]/5">Roster, sport, team, alumni, employer</td>
                  </tr>
                  <tr className="border-b border-[#CCCBCB]">
                    <td className="p-4 font-semibold">Employer targeting</td>
                    <td className="p-4">Broad job postings</td>
                    <td className="p-4">National/regional employers</td>
                    <td className="p-4 bg-[#ED3237]/5">Athlete-specific talent, alumni at employers</td>
                  </tr>
                  <tr className="border-b border-[#CCCBCB] bg-gray-50">
                    <td className="p-4 font-semibold">Institutional value</td>
                    <td className="p-4">Career center tool</td>
                    <td className="p-4">Engagement platform</td>
                    <td className="p-4 bg-[#ED3237]/5">Athlete network infrastructure</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 13. Strategic Conclusion */}
        <section className="py-16 bg-[#1C315F] text-white">
          <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6">
              13. Strategic Conclusion
            </h2>
            <p className="text-xl mb-6 text-white/95">
              Handshake is a career-center job board. Athlete Network is an engagement platform. The College Athlete Network is <strong>athlete professional network infrastructure</strong>—the only solution built around the roster-based athlete network graph, with data provided and maintained by the platform.
            </p>
            <p className="text-xl mb-8 text-white/95">
              For universities serious about athlete career outcomes, alumni engagement, and fundraising sustainability, CAN is the materially superior choice. We don&apos;t ask you to build the network. We deliver it.
            </p>
            <Link
              href="/contact-us?source=competitive-landscape"
              className="inline-block bg-white text-[#1C315F] text-lg font-semibold px-8 py-3 rounded-full hover:bg-[#ED3237] hover:text-white transition duration-200"
            >
              Request a Demo
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
