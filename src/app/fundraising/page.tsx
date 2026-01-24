import Image from "next/image";
import Link from "next/link";
import {
  FaChartLine,
  FaUsers,
  FaHeartCircleBolt,
  FaRankingStar,
} from "react-icons/fa6";
import NetworkImage from "../../../public/images/network.png";
import UniversityImage from "../../../public/images/StanfordWaterPolo.jpg";

export default function FundraisingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="text-white pt-28 bg-gradient-to-r from-[#1C315F] to-[#ED3237] pb-16">
          <div className="container mx-auto px-4 text-center flex flex-col">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 mx-auto w-full max-w-[860px]">
              Increased Fundraising for Athletic Departments; Be Where your Donors Are.
            </h1>
            <p className="text-xl mb-10 max-w-3xl mx-auto">
              Meet alumni where they are, create more ways to engage, and
              energize giving with a present-day strategy that gamifies and
              celebrates participation.
            </p>
            <div className="flex flex-col md:flex-row mx-auto gap-4">
              <Link
                href="/contact-us"
                className="bg-white text-[#1C315F] text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-[#1c315f] hover:text-white transition duration-200"
              >
                Talk to Our Team
              </Link>
              <Link
                href="/contact-us"
                className="bg-[#ED3237] text-white text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-[#ED3237] transition duration-200"
              >
                Request a Demo
              </Link>
            </div>
          </div>
        </section>

        {/* Why Traditional Fundraising Stalls */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2
              className="text-4xl font-bold mb-6 text-center text-[#1c315f]"
              role="heading"
              aria-level={2}
            >
              Reaching Alumni Requires New Approaches
            </h2>
            <p className="text-xl ml-5 mr-5 mb-10 text-center text-[#1c315f]">
              Athletic departments can only go back to the well so many times.
              Repeated asks without innovation drive fatigue. The market now
              rewards creative, direct engagement that makes alumni feel seen
              and invested in the program’s future.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-[#1c315f]">
              {[
                {
                  title: "Meet Alumni Where They Are",
                  description:
                    "Engage across channels and life stages, not just annual calls.",
                  icon: <FaUsers size={36} />,
                },
                {
                  title: "More Ways to Participate",
                  description:
                    "Micro-campaigns, challenges, and milestones widen the path to giving.",
                  icon: <FaHeartCircleBolt size={36} />,
                },
                {
                  title: "Gamify Momentum",
                  description:
                    "Leaderboards and progress goals spark friendly competition.",
                  icon: <FaRankingStar size={36} />,
                },
                {
                  title: "Proven Lift in Donations",
                  description:
                    "Direct engagement and innovation consistently increase giving.",
                  icon: <FaChartLine size={36} />,
                },
              ].map((point, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="mb-3 text-[#1c315f]">{point.icon}</div>
                  <h3
                    className="text-xl font-semibold mb-2"
                    role="heading"
                    aria-level={3}
                  >
                    {point.title}
                  </h3>
                  <p>{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Solution */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2
              className="text-3xl font-bold mb-4 text-center text-[#1c315f]"
              role="heading"
              aria-level={2}
            >
              A Modern Fundraising Engine Built for Engagement
            </h2>
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-lg mb-4 text-[#1c315f]">
                  Our solution directly engages the entire network — it is not a
                  distribution list or a phone-calling campaign. We modernize the
                  alumni experience and surface the real reasons alumni choose to
                  donate: impact, belonging, and pride in the program.
                </p>
                <p className="text-lg mb-6 text-[#1c315f]">
                  Departments can launch targeted challenges, spotlight stories,
                  and create participation loops that reward consistent support.
                  The result is a donation strategy that feels personal, timely,
                  and meaningful.
                </p>
                <div className="text-center lg:text-left mt-6">
                  <Link
                    href="/contact-us"
                    className="bg-[#ED3237] text-white text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-[#ED3237] transition duration-200"
                  >
                    See the Engagement Platform
                  </Link>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-md">
                <div className="relative mx-auto w-full max-w-md">
                  <Image
                    src={NetworkImage}
                    alt="Network engagement visualization"
                    className="w-full rounded-xl opacity-50"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full border-4 border-white shadow-lg overflow-hidden bg-white/90 p-1">
                      <Image
                        src={UniversityImage}
                        alt="University spotlight"
                        className="rounded-full w-24 h-24 object-cover"
                      />
                    </div>
                  </div>
                </div>
                <p className="text-sm text-[#1c315f]/70 mt-4 text-center">
                  Visualizing the full alumni network to activate every node.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What Departments Gain */}
        <section className="pb-8 pt-4 bg-gray-100">
          <div className="container mx-auto px-4">
            <FaRankingStar size={60} className="mx-auto text-[#1c315f] mb-2" />
            <h2
              className="text-3xl font-bold mb-4 text-center text-[#1c315f]"
              role="heading"
              aria-level={2}
            >
              Outcomes That Drive Giving
            </h2>
            <div className="max-w-3xl mx-auto">
              <ul className="text-[#1c315f] list-disc pl-6 mb-6 space-y-2 text-lg">
                <li>Higher participation by activating the full alumni base.</li>
                <li>Repeat engagement through fresh, creative campaigns.</li>
                <li>Clear metrics on momentum, conversion, and impact.</li>
                <li>Donations aligned to the stories alumni care about most.</li>
              </ul>
              <div className="text-center">
                <Link
                  href="/contact-us"
                  className="bg-[#ED3237] text-white pt-2 text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-[#ED3237] transition duration-200"
                >
                  Talk Fundraising Strategy
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2
              className="text-[#1c315f] text-5xl font-bold mb-8 text-center"
              role="heading"
              aria-level={2}
            >
              How It Works
            </h2>
            <div className="grid md:grid-cols-4 gap-8 md:gap-12 text-[#1c315f]">
              {[
                {
                  title: "Activate Your Network",
                  description:
                    "Bring alumni into a modern platform built around connection and pride.",
                },
                {
                  title: "Launch Smart Campaigns",
                  description:
                    "Create targeted challenges, giving milestones, and momentum pushes.",
                },
                {
                  title: "Celebrate Participation",
                  description:
                    "Highlight donors, teams, and classes that lead the way.",
                },
                {
                  title: "Sustain Long-Term Giving",
                  description:
                    "Keep engagement fresh so alumni return with purpose, not fatigue.",
                },
              ].map((step, index) => (
                <div key={index} className="text-center">
                  <div className="bg-[#ED3237] text-white w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                    {index + 1}
                  </div>
                  <h3
                    className="text-2xl font-semibold mb-2"
                    role="heading"
                    aria-level={3}
                  >
                    {step.title}
                  </h3>
                  <p className="text-lg">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-[#1c315f] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6" role="heading" aria-level={2}>
              Build the Next Generation of Alumni Giving
            </h2>
            <div className="space-x-4">
              <Link
                href="/contact-us"
                className="bg-white text-[#1C315F] text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-[#1c315f] hover:text-white transition duration-300"
              >
                Get Started
              </Link>
            </div>
            <p className="mt-4 text-xl">
              We help athletic departments modernize engagement and grow
              donations across the entire network.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
