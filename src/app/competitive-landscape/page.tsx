import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Competitive Landscape | Athlete Career Networks",
  description:
    "Handshake and others are generic job bulletin boards—no warm intro. CAN pioneered Availabilities & Opportunities: the Match.com for hiring within your network. Why athlete professional networks require specialized infrastructure.",
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
        <section className="relative text-white pt-28 pb-20 bg-gradient-to-br from-[#1C315F] via-[#1C315F] to-[#ED3237] overflow-hidden">
          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="container mx-auto px-4 text-center relative z-10">
            <p className="uppercase tracking-[0.25em] text-xs font-semibold text-white/90 mb-5 letter-spacing-wider">
              Strategic Analysis
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 max-w-4xl mx-auto leading-tight tracking-tight">
              Competitive Landscape: Athlete Career Networks
            </h1>
            <p className="text-xl md:text-2xl text-white/95 max-w-3xl mx-auto leading-relaxed">
              A comprehensive comparison of career and engagement platforms—and why The College Athlete Network is the only solution built around the athlete network graph.
            </p>
            <Link
              href="/contact-us?source=competitive-landscape"
              className="inline-flex items-center gap-2 mt-10 bg-white text-[#1C315F] text-lg font-semibold px-8 py-3.5 rounded-full hover:bg-[#1c315f] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Request a Demo
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>

        {/* 1. Introduction */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-start gap-4 mb-8">
              <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#1C315F] text-white font-bold text-lg flex items-center justify-center">
                1
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1C315F] leading-tight pt-1.5 border-l-4 border-[#ED3237] pl-4" id="introduction">
                Introduction: A University&apos;s Athlete Network Opportunity
              </h2>
            </div>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              Student-athletes represent a uniquely valuable talent pool: disciplined, coachable, and trained in leadership and teamwork. Yet the infrastructure to connect athletes with career opportunities—and to sustain that connection after graduation—remains fragmented. Most universities rely on general career platforms, one-way engagement tools (e.g., distribution lists and campaigns), or manual spreadsheets. None are designed around the athlete network graph.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              This analysis compares three approaches: Handshake (a well-known career-center job board), AthleteNetwork.com (athlete focused bring your own data platform), and The College Athlete Network (CAN). The conclusion is clear: athlete career outcomes require a specialized network approach that only CAN provides.
            </p>
          </div>
        </section>

        {/* 2. Current Landscape */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-gray-100/80">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-start gap-4 mb-8">
              <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#1C315F] text-white font-bold text-lg flex items-center justify-center">
                2
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1C315F] leading-tight pt-1.5 border-l-4 border-[#ED3237] pl-4">
                The Current Landscape of Career Platforms
              </h2>
            </div>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              Universities today face a patchwork of solutions. Career services deploy generic job bulletin boards—Handshake and others—where postings are not specific to a user&apos;s university and applications are cold. No one likes these: they lack the warmth and specificity of an in-network introduction. Athletic departments deploy engagement platforms and alumni communication tools. Neither constructs a true athlete professional network—a roster-based graph that maps athletes to alumni, employers, and career outcomes, and that enables warm intros and hiring within the network.
            </p>
            <p className="text-lg text-[#1C315F]/90">
              The gap matters. Athletes change jobs every 3.1 years on average in the first 15 years post-graduation. For a network of 3,000 athletes, that means roughly 1,200 updates annually. No career office or athletic department has the bandwidth to maintain that data. The platforms that could help either don&apos;t provide the data or require the institution to supply it. The College Athlete Network is the exception: we provide the data. We maintain it. The institution gets the network.
            </p>
          </div>
        </section>

        {/* 3. Platform Overview: Handshake */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-start gap-4 mb-8">
              <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#1C315F] text-white font-bold text-lg flex items-center justify-center">
                3
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1C315F] leading-tight pt-1.5 border-l-4 border-[#ED3237] pl-4">
                Platform Overview: Handshake
              </h2>
            </div>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              Handshake is the career network built board for higher education. It powers career offices at <strong>1,400+ universities</strong> and connects students with many employers. Many schools report being on the system, but few students or alums actually use it.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>Target audience:</strong> Career centers, employers, and the general student population. Handshake is built for broad job-matching—not athlete-specific identity or alumni-athlete networks.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>Data model:</strong> Students self-report resume data, major, graduation year, skills, and job preferences. The platform provides job listings, employer events, and recruiting workflows. Data is self-reported and structurally flat—there is no institutional roster, no sport identity, and weak alumni persistence.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>Strategic positioning:</strong> Handshake is a generic job bulletin board. Postings are not specific to a user&apos;s university or network. Students apply cold—no warm intro from a fellow alum or teammate. Employers get volume; students get noise. No one likes generic bulletin boards because they lack the specificity and trust of an in-network introduction.
            </p>
            <p className="text-lg text-[#1C315F]/90">
              For athletic departments seeking a dedicated athlete network with warm intros and university-specific matching, Handshake is the wrong tool.
            </p>
          </div>
        </section>

        {/* 4. Platform Overview: Athlete Network */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-gray-100/80">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-start gap-4 mb-8">
              <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#1C315F] text-white font-bold text-lg flex items-center justify-center">
                4
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1C315F] leading-tight pt-1.5 border-l-4 border-[#ED3237] pl-4">
                Platform Overview: Athlete Network (UNITE)
              </h2>
            </div>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              Athlete Network provides UNITE software—a digital engagement platform for current and former student-athletes. It serves athletic departments at colleges, universities, high schools, and associations. Programs including USC, Vanderbilt, Michigan, Penn State, Virginia Tech, Indiana, and Clemson use UNITE.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>Target audience:</strong> Athletic departments, alumni engagement teams, and athlete communities. UNITE is built for communication, events, and engagement—not for constructing a professional network graph.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>Features:</strong> Branded landing pages, career resources, mentorship programs, event management, e-learning, messaging, and analytics. The platform connects current and alumni athletes in communities and facilitates peer-to-peer networking.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>Data model:</strong> Athlete participation, school affiliation, and community membership are required from users. The platform provides engagement content, mentoring workflows, and career resources. It is primarily <strong>communication infrastructure</strong>—not a data-provided network. The institution or users supply the data; UNITE organizes the experience.
            </p>
            <p className="text-lg text-[#1C315F]/90">
              <strong>Recruiting model:</strong> Career resources and employer access are typically generic—not a university-specific matching system that produces warm intros from within the athlete network.
            </p>
          </div>
        </section>

        {/* 5. Platform Overview: College Athlete Network */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-start gap-4 mb-8">
              <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-[#1C315F] to-[#ED3237] text-white font-bold text-lg flex items-center justify-center shadow-md">
                5
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1C315F] leading-tight pt-1.5 border-l-4 border-[#ED3237] pl-4">
                Platform Overview: The College Athlete Network
              </h2>
            </div>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              The College Athlete Network builds cross-sport athlete professional networks inside universities. We source current and historic public athlete rosters, map athletes to third-party datasets (including LinkedIn), and refresh employer, title, and location data every 60 days. The result is an institutional athlete network graph that the university owns—without maintaining it.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>Availabilities &amp; Opportunities—pioneered by CAN:</strong> The College Athlete Network pioneered the matching of students and alumni posting &quot;Availabilities&quot; (what they&apos;re looking for—jobs, internships, mentorship, advice) with alumni posting &quot;Opportunities&quot; (what they&apos;re offering—roles, mentorship, intros). We are the Match.com for activating your network to hire within your network. Unlike generic job bulletin boards, every match is university-specific and network-native.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>Warm intros, not cold applications:</strong> CAN provides users the warm intro. Alumni at target employers can be identified; pathways through mutual connections are visible. Students don&apos;t apply into a void—they connect through a fellow athlete who can vouch for them. That is the difference between a bulletin board and a network.
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
        <section className="py-16 bg-gradient-to-b from-gray-50 to-gray-100/80">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-start gap-4 mb-8">
              <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#1C315F] text-white font-bold text-lg flex items-center justify-center">
                6
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1C315F] leading-tight pt-1.5 border-l-4 border-[#ED3237] pl-4">
                Structural Differences in Network Design
              </h2>
            </div>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>Handshake network structure:</strong> Student profile → employer job posting → job application. A generic bulletin board. Postings are not university-specific. Applications are cold. No warm intro. The graph is applicant-centric—there is no roster, no sport, no alumni-athlete identity.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>Athlete Network structure:</strong> Athlete community → communication hub → engagement programs. The graph is community-centric. It organizes people for engagement but does not map them to employers, career outcomes, or a searchable professional network. Career resources are typically generic, not network-native matching.
            </p>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              <strong>College Athlete Network structure:</strong> Athlete roster → sport → university → athlete alumni → companies → career outcomes. Plus: <strong>Availabilities</strong> (students/alumni post what they need) ↔ <strong>Opportunities</strong> (alumni post what they offer). CAN pioneered this matching model—the Match.com for hiring within your network. The graph is roster-based, institution-owned, and university-specific. Every match produces a warm intro path. The roster-based network graph is fundamentally stronger because it reflects institutional reality and enables in-network hiring—not cold applications to generic job boards.
            </p>
          </div>
        </section>

        {/* 7. Data Architecture */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-start gap-4 mb-8">
              <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#1C315F] text-white font-bold text-lg flex items-center justify-center">
                7
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1C315F] leading-tight pt-1.5 border-l-4 border-[#ED3237] pl-4">
                Data Architecture Comparison
              </h2>
            </div>
            <div className="overflow-x-auto mb-8 rounded-xl shadow-lg border border-[#CCCBCB]/50">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1C315F] text-white">
                    <th className="text-left p-4 font-semibold rounded-tl-lg">Dimension</th>
                    <th className="text-left p-4 font-semibold">Handshake</th>
                    <th className="text-left p-4 font-semibold">Athlete Network</th>
                    <th className="text-left p-4 font-semibold rounded-tr-lg border-l-2 border-white/20">College Athlete Network</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#CCCBCB]/60 bg-gray-50/80 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-[#1C315F]">Data required from users</td>
                    <td className="p-4 text-[#1C315F]/85">Resume, major, graduation year, skills, preferences</td>
                    <td className="p-4 text-[#1C315F]/85">Athlete participation, school affiliation, community membership</td>
                    <td className="p-4 border-l-2 border-[#ED3237]/30 bg-[#ED3237]/5 font-medium text-[#1C315F]">None—we provide the data</td>
                  </tr>
                  <tr className="border-b border-[#CCCBCB]/60 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-semibold text-[#1C315F]">Data provided by platform</td>
                    <td className="p-4 text-[#1C315F]/85">Job listings, employer events, recruiting</td>
                    <td className="p-4 text-[#1C315F]/85">Engagement content, mentoring, career resources</td>
                    <td className="p-4 border-l-2 border-[#ED3237]/30 bg-[#ED3237]/5 font-medium text-[#1C315F]">Rosters, athlete identity, sport, alumni career data, employer mapping</td>
                  </tr>
                  <tr className="border-b border-[#CCCBCB]/60 bg-gray-50/80 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-[#1C315F]">Data structure</td>
                    <td className="p-4 text-[#1C315F]/85">Self-reported, limited structural identity</td>
                    <td className="p-4 text-[#1C315F]/85">Communication infrastructure</td>
                    <td className="p-4 border-l-2 border-[#ED3237]/30 bg-[#ED3237]/5 font-medium text-[#1C315F]">Institutional athlete network graph</td>
                  </tr>
                  <tr className="border-b border-[#CCCBCB]/60 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-semibold text-[#1C315F]">Data maintenance</td>
                    <td className="p-4 text-[#1C315F]/85">User-maintained profiles</td>
                    <td className="p-4 text-[#1C315F]/85">Institution or user-supplied</td>
                    <td className="p-4 border-l-2 border-[#ED3237]/30 bg-[#ED3237]/5 font-medium text-[#1C315F]">Platform-maintained, refreshed every 60 days</td>
                  </tr>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-semibold text-[#1C315F] rounded-bl-lg">Matching / intro type</td>
                    <td className="p-4 text-[#1C315F]/85">Generic bulletin board, cold applications</td>
                    <td className="p-4 text-[#1C315F]/85">Generic career resources</td>
                    <td className="p-4 border-l-2 border-[#ED3237]/30 bg-[#ED3237]/5 font-medium text-[#1C315F] rounded-br-lg">Availabilities ↔ Opportunities, warm intros, university-specific</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex items-start gap-3 p-5 rounded-xl bg-[#1C315F]/5 border-l-4 border-[#ED3237] mb-8">
              <BarChart3 className="w-6 h-6 text-[#ED3237] flex-shrink-0 mt-0.5" />
              <p className="text-lg text-[#1C315F]/95 font-medium">
                This distinction is critical. Handshake and Athlete Network require users or institutions to supply and maintain data. The College Athlete Network provides and maintains the data. Data curation is 99% of the problem—and CAN owns it. That is why the network works.
              </p>
            </div>
          </div>
        </section>

        {/* 8. Network Effects */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-gray-100/80">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-start gap-4 mb-8">
              <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#1C315F] text-white font-bold text-lg flex items-center justify-center">
                8
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1C315F] leading-tight pt-1.5 border-l-4 border-[#ED3237] pl-4">
                Network Effects and Growth Models
              </h2>
            </div>
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
            <div className="flex items-start gap-4 mb-8">
              <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#1C315F] text-white font-bold text-lg flex items-center justify-center">
                9
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1C315F] leading-tight pt-1.5 border-l-4 border-[#ED3237] pl-4">
                Stakeholder Value in Universities
              </h2>
            </div>
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
        <section className="py-16 bg-gradient-to-b from-gray-50 to-gray-100/80">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-start gap-4 mb-8">
              <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#1C315F] text-white font-bold text-lg flex items-center justify-center">
                10
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1C315F] leading-tight pt-1.5 border-l-4 border-[#ED3237] pl-4">
                Why Athlete Networks Require Specialized Infrastructure
              </h2>
            </div>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              Athletes and athlete alumni require a specialized network that general career platforms cannot provide. Reasons include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-lg text-[#1C315F]/90 mb-6">
              <li><strong>Roster-based identity:</strong> Athletes are defined by sport, team, and class year—not just major and graduation. General platforms don&apos;t map this.</li>
              <li><strong>Warm intros vs. bulletin boards:</strong> Generic job boards are not university-specific. Students apply cold. No one likes them. Athlete networks need university-specific matching—Availabilities and Opportunities—that produces warm intros from within the network.</li>
              <li><strong>Alumni-athlete affinity:</strong> Former athletes have stronger bonds with their program than general alumni. They hire, mentor, and give at higher rates when the network is athlete-specific.</li>
              <li><strong>Employer demand:</strong> Employers seek athletes for discipline, leadership, teamwork, and coachability. A dedicated athlete talent pool is higher-quality than a general applicant pool.</li>
              <li><strong>Data maintenance:</strong> Athlete career data changes constantly. No institution can maintain it. Only a specialized platform with productionized data curation can.</li>
            </ul>
          </div>
        </section>

        {/* 11. Why CAN Is Superior */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="flex items-start gap-4 mb-8">
              <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-[#1C315F] to-[#ED3237] text-white font-bold text-lg flex items-center justify-center shadow-md">
                11
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1C315F] leading-tight pt-1.5 border-l-4 border-[#ED3237] pl-4">
                Why The College Athlete Network Is the Superior Solution
              </h2>
            </div>
            <p className="text-lg text-[#1C315F]/90 mb-4">
              The College Athlete Network is materially better for student athletes, athlete alumni, athletic department leadership, development officers, and universities building alumni engagement because it is <strong>the only platform designed around the athlete network graph</strong>.
            </p>
            <ul className="space-y-4 text-lg text-[#1C315F]/90 mb-6">
              {[
                { title: "We provide the data.", desc: "Rosters, LinkedIn mapping, employer and title updates every 60 days. No babysitting. No spreadsheets." },
                { title: "Availabilities & Opportunities—we pioneered it.", desc: "Students and alumni post Availabilities (what they need); alumni post Opportunities (what they offer). We are the Match.com for activating your network to hire within your network. Not a generic bulletin board—university-specific matching." },
                { title: "Warm intros, not cold applications.", desc: "We provide users the warm intro. Generic job boards don't. Alumni at target employers are visible; pathways through mutual connections are clear. Students connect through fellow athletes who can vouch for them." },
                { title: "Institutional ownership.", desc: "The network stays with the university—not with a coach, a spreadsheet, or a departing staff member." },
                { title: "Cross-sport connectivity.", desc: "Athletes connect with peers and alumni across all sports. One unified network." },
                { title: "Fundraising narrative.", desc: "Development officers get measurable outcomes—jobs, internships, mentorship—and a new reason to give that avoids gift fatigue." },
                { title: "Employer access.", desc: "Corporate partners get a curated athlete talent pool. Athletes get warm intros. Everyone wins." },
              ].map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#ED3237]/15 flex items-center justify-center mt-1">
                    <Check className="w-4 h-4 text-[#ED3237]" strokeWidth={2.5} />
                  </span>
                  <span><strong>{item.title}</strong> {item.desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 12. Comparison Table */}
        <section className="py-16 bg-gradient-to-b from-gray-50 to-gray-100/80">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex flex-col items-center mb-10">
              <span className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#1C315F] text-white font-bold text-lg flex items-center justify-center mb-4">
                12
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#1C315F] text-center">
                Competitive Comparison Table
              </h2>
            </div>
            <div className="overflow-x-auto rounded-xl shadow-lg border border-[#CCCBCB]/50 bg-white">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1C315F] text-white">
                    <th className="text-left p-4 font-semibold rounded-tl-lg">Dimension</th>
                    <th className="text-left p-4 font-semibold">Handshake</th>
                    <th className="text-left p-4 font-semibold">Athlete Network</th>
                    <th className="text-left p-4 font-semibold rounded-tr-lg border-l-2 border-white/20">College Athlete Network</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[#CCCBCB]/60 hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 font-semibold text-[#1C315F]">Target users</td>
                    <td className="p-4 text-[#1C315F]/85">Career centers, employers, general students</td>
                    <td className="p-4 text-[#1C315F]/85">Athletic departments, athlete communities</td>
                    <td className="p-4 border-l-2 border-[#ED3237]/30 bg-[#ED3237]/5 font-medium text-[#1C315F]">Athletes, alumni, ADs, development, employers</td>
                  </tr>
                  <tr className="border-b border-[#CCCBCB]/60 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-[#1C315F]">Data structure</td>
                    <td className="p-4 text-[#1C315F]/85">Self-reported profiles</td>
                    <td className="p-4 text-[#1C315F]/85">User/institution-supplied</td>
                    <td className="p-4 border-l-2 border-[#ED3237]/30 bg-[#ED3237]/5 font-medium text-[#1C315F]">Platform-provided, institutional graph</td>
                  </tr>
                  <tr className="border-b border-[#CCCBCB]/60 hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 font-semibold text-[#1C315F]">Network graph</td>
                    <td className="p-4 text-[#1C315F]/85">Student → job → employer</td>
                    <td className="p-4 text-[#1C315F]/85">Community → engagement</td>
                    <td className="p-4 border-l-2 border-[#ED3237]/30 bg-[#ED3237]/5 font-medium text-[#1C315F]">Roster → sport → alumni → employers → outcomes</td>
                  </tr>
                  <tr className="border-b border-[#CCCBCB]/60 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-[#1C315F]">Matching model</td>
                    <td className="p-4 text-[#1C315F]/85">Generic job bulletin board, cold applications</td>
                    <td className="p-4 text-[#1C315F]/85">Career resources, generic employer access</td>
                    <td className="p-4 border-l-2 border-[#ED3237]/30 bg-[#ED3237]/5 font-medium text-[#1C315F]">Availabilities ↔ Opportunities (pioneered by CAN), warm intros, hire within network</td>
                  </tr>
                  <tr className="border-b border-[#CCCBCB]/60 hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 font-semibold text-[#1C315F]">Recruiting workflows</td>
                    <td className="p-4 text-[#1C315F]/85">Volume job matching, not university-specific</td>
                    <td className="p-4 text-[#1C315F]/85">Career resources, employer access</td>
                    <td className="p-4 border-l-2 border-[#ED3237]/30 bg-[#ED3237]/5 font-medium text-[#1C315F]">Athlete talent pool, warm intros, employer mapping</td>
                  </tr>
                  <tr className="border-b border-[#CCCBCB]/60 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-[#1C315F]">Alumni engagement</td>
                    <td className="p-4 text-[#1C315F]/85">Weak persistence</td>
                    <td className="p-4 text-[#1C315F]/85">Communication, events</td>
                    <td className="p-4 border-l-2 border-[#ED3237]/30 bg-[#ED3237]/5 font-medium text-[#1C315F]">Identity by sport, career mapping, mentorship, hiring</td>
                  </tr>
                  <tr className="border-b border-[#CCCBCB]/60 hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 font-semibold text-[#1C315F]">Athlete identity mapping</td>
                    <td className="p-4 text-[#1C315F]/85">None</td>
                    <td className="p-4 text-[#1C315F]/85">Community membership</td>
                    <td className="p-4 border-l-2 border-[#ED3237]/30 bg-[#ED3237]/5 font-medium text-[#1C315F]">Roster, sport, team, alumni, employer</td>
                  </tr>
                  <tr className="border-b border-[#CCCBCB]/60 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-[#1C315F]">Employer targeting</td>
                    <td className="p-4 text-[#1C315F]/85">Broad job postings</td>
                    <td className="p-4 text-[#1C315F]/85">National/regional employers</td>
                    <td className="p-4 border-l-2 border-[#ED3237]/30 bg-[#ED3237]/5 font-medium text-[#1C315F]">Athlete-specific talent, alumni at employers</td>
                  </tr>
                  <tr className="hover:bg-gray-50/80 transition-colors">
                    <td className="p-4 font-semibold text-[#1C315F] rounded-bl-lg">Institutional value</td>
                    <td className="p-4 text-[#1C315F]/85">Career center tool</td>
                    <td className="p-4 text-[#1C315F]/85">Engagement platform</td>
                    <td className="p-4 border-l-2 border-[#ED3237]/30 bg-[#ED3237]/5 font-medium text-[#1C315F] rounded-br-lg">Athlete network infrastructure</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 13. Strategic Conclusion */}
        <section className="relative py-20 bg-[#1C315F] text-white overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Strategic Conclusion
            </h2>
            <p className="text-xl mb-6 text-white/95">
              Handshake and similar platforms are generic job bulletin boards—not university-specific, no warm intro. Athlete Network is an engagement platform. The College Athlete Network is <strong>athlete professional network infrastructure</strong>—the only solution built around the roster-based athlete network graph, with data provided and maintained by the platform.
            </p>
            <p className="text-xl mb-6 text-white/95">
              CAN pioneered Availabilities and Opportunities—the Match.com for activating your network to hire within your network. We provide users the warm intro. The others do not. No one likes generic bulletin boards. Everyone values a warm intro from within their network.
            </p>
            <p className="text-xl mb-10 text-white/95">
              For universities serious about athlete career outcomes, alumni engagement, and fundraising sustainability, CAN is the materially superior choice. We don&apos;t ask you to build the network. We deliver it—and we deliver the warm intro.
            </p>
            <Link
              href="/contact-us?source=competitive-landscape"
              className="inline-flex items-center gap-2 bg-white text-[#1C315F] text-lg font-semibold px-8 py-3.5 rounded-full hover:bg-[#ED3237] hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Request a Demo
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
