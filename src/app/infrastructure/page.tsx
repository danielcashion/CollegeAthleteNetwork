import Image from "next/image";
import Link from "next/link";
import { FaSitemap, FaClipboardCheck, FaLayerGroup, FaShield } from "react-icons/fa6";
import InfrastructureImage from "../../../public/images/college-athletes-6.jpg";

export default function InfrastructurePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="pt-28 pb-16 bg-gradient-to-r from-[#1C315F] to-[#ED3237]">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-10 items-center text-white">
              <div className="text-center lg:text-left">
                <p className="uppercase tracking-[0.25em] text-sm font-semibold text-white/80 mb-4">
                  Infrastructure
                </p>
                <h1 className="text-4xl md:text-5xl font-bold mb-5">
                  Productionalize Alumni Engagement Across Every Sport
                </h1>
                <p className="text-xl mb-8 text-white/90">
                  We replace spreadsheets, manual lists, and disconnected
                  “Friends” groups with a centralized system that delivers
                  consistent, compliant, and professional engagement.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    href="/contact-us"
                    className="bg-white text-[#1C315F] text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-[#1c315f] hover:text-white transition duration-200"
                  >
                    Talk to Our Team
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/10 rounded-3xl blur-xl" />
                <div className="absolute -bottom-8 -right-6 w-28 h-28 bg-white/10 rounded-3xl blur-xl" />
                <Image
                  src={InfrastructureImage}
                  alt="Athletic department collaboration and engagement"
                  className="rounded-2xl shadow-2xl border border-white/20"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Metrics Band */}
        <section className="bg-white">
          <div className="container mx-auto px-4 py-10">
            <div className="grid md:grid-cols-3 gap-6 text-[#1c315f]">
              {[
                {
                  label: "Source of Truth",
                  value: "1",
                  detail: "Unified platform for every alumni program",
                },
                {
                  label: "Quality Standard",
                  value: "100%",
                  detail: "Consistent engagement and policy compliance",
                },
                {
                  label: "Program Coverage",
                  value: "All Sports",
                  detail: "Friends groups aligned under one system",
                },
              ].map((metric, index) => (
                <div
                  key={index}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center"
                >
                  <p className="text-sm uppercase tracking-[0.2em] text-[#1c315f]/70 mb-2">
                    {metric.label}
                  </p>
                  <p className="text-4xl font-bold mb-2">{metric.value}</p>
                  <p className="text-lg text-[#1c315f]/80">{metric.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Problem + Friends Group Reality */}
        <section className="py-16 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-10 items-start">
              <div>
                <h2
                  className="text-4xl font-bold mb-6 text-[#1c315f]"
                  role="heading"
                  aria-level={2}
                >
                  Fragmented Groups Create Uneven Alumni Experiences
                </h2>
                <p className="text-lg text-[#1c315f] mb-6">
                  Many schools rely on “Friends of Soccer” or “Friends of
                  Football” groups that plan their own events and outreach. The
                  result is inconsistent quality, limited oversight, and a lack
                  of accountability to university policies.
                </p>
                <p className="text-lg text-[#1c315f]">
                  Athletic departments want infrastructure that lets them
                  centrally manage production and professionalism for every
                  athlete network, while still empowering each sport to engage
                  its alumni.
                </p>
              </div>
              <div className="space-y-4">
                {[
                  {
                    title: "Friends Group Silos",
                    description:
                      "Events and communications run independently with no shared standards.",
                  },
                  {
                    title: "No Quality Assurance",
                    description:
                      "Messaging, branding, and follow-up are inconsistent.",
                  },
                  {
                    title: "Policy Risk",
                    description:
                      "Lack of centralized oversight increases compliance exposure.",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-xl shadow-md border border-gray-200"
                  >
                    <h3
                      className="text-xl font-semibold text-[#1c315f] mb-2"
                      role="heading"
                      aria-level={3}
                    >
                      {item.title}
                    </h3>
                    <p className="text-[#1c315f]/80">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Infrastructure Stack */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-[#ED3237] text-white p-3 rounded-xl">
                    <FaLayerGroup size={28} />
                  </div>
                  <div>
                    <h3
                      className="text-2xl font-semibold text-[#1c315f] mb-2"
                      role="heading"
                      aria-level={3}
                    >
                      Centralized Data & Workflows
                    </h3>
                    <p className="text-lg text-[#1c315f]/80">
                      Replace spreadsheets with structured records, shared
                      templates, and repeatable workflows.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-[#ED3237] text-white p-3 rounded-xl">
                    <FaClipboardCheck size={28} />
                  </div>
                  <div>
                    <h3
                      className="text-2xl font-semibold text-[#1c315f] mb-2"
                      role="heading"
                      aria-level={3}
                    >
                      Built-In QA & Approvals
                    </h3>
                    <p className="text-lg text-[#1c315f]/80">
                      Ensure every communication and event meets brand and
                      policy requirements before it goes live.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-[#ED3237] text-white p-3 rounded-xl">
                    <FaSitemap size={28} />
                  </div>
                  <div>
                    <h3
                      className="text-2xl font-semibold text-[#1c315f] mb-2"
                      role="heading"
                      aria-level={3}
                    >
                      Network-Wide Consistency
                    </h3>
                    <p className="text-lg text-[#1c315f]/80">
                      Align every sport and Friends group under one professional
                      engagement standard.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="bg-[#ED3237] text-white p-3 rounded-xl">
                    <FaShield size={28} />
                  </div>
                  <div>
                    <h3
                      className="text-2xl font-semibold text-[#1c315f] mb-2"
                      role="heading"
                      aria-level={3}
                    >
                      Compliance & Governance
                    </h3>
                    <p className="text-lg text-[#1c315f]/80">
                      Maintain oversight, data privacy, and brand integrity
                      across the full alumni ecosystem.
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 shadow-md">
                <h3
                  className="text-2xl font-semibold text-[#1c315f] mb-4"
                  role="heading"
                  aria-level={3}
                >
                  What Athletic Departments Gain
                </h3>
                <ul className="space-y-4 text-lg text-[#1c315f]/90">
                  <li>Single source of truth for engagement programs.</li>
                  <li>Unified quality standards across all sports.</li>
                  <li>Visibility into every outreach, event, and campaign.</li>
                  <li>Scalable infrastructure as alumni networks grow.</li>
                </ul>
                <Link
                  href="/contact-us"
                  className="inline-flex mt-8 bg-[#ED3237] text-white text-lg font-medium px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-[#ED3237] transition duration-200"
                >
                  Build Your Infrastructure
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Process Timeline */}
        <section className="py-16 bg-[#f9faf8]">
          <div className="container mx-auto px-4">
            <h2
              className="text-4xl font-bold mb-10 text-center text-[#1c315f]"
              role="heading"
              aria-level={2}
            >
              From Fragmented to Fully Operational
            </h2>
            <div className="max-w-4xl mx-auto">
              {[
                {
                  title: "Assess & Consolidate",
                  description:
                    "Map current Friends groups, lists, and workflows into one view.",
                },
                {
                  title: "Standardize & Automate",
                  description:
                    "Deploy templates, approvals, and QA across every program.",
                },
                {
                  title: "Coordinate & Scale",
                  description:
                    "Enable each sport to engage confidently with shared standards.",
                },
              ].map((step, index) => (
                <div key={index} className="flex gap-6 pb-8">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-[#ED3237] text-white flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    {index < 2 && (
                      <div className="w-px bg-[#1c315f]/20 h-full mt-2" />
                    )}
                  </div>
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex-1">
                    <h3
                      className="text-2xl font-semibold text-[#1c315f] mb-2"
                      role="heading"
                      aria-level={3}
                    >
                      {step.title}
                    </h3>
                    <p className="text-lg text-[#1c315f]/80">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-[#1c315f] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6" role="heading" aria-level={2}>
              Centralize Alumni Engagement with Confidence
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
              Deliver consistent, professional engagement across every sport.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
