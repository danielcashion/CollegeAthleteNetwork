"use client";

import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { FaUserGraduate, FaUsers, FaBullhorn } from "react-icons/fa";

type FAQ = {
  question: string;
  answer: string;
};

type Persona = {
  id: string;
  label: string;
  icon: JSX.Element;
  faqs: FAQ[];
};

const personas: Persona[] = [
  {
    id: "students",
    label: "Student-Athletes",
    icon: <FaUserGraduate size={24} />,
    faqs: [
      {
        question: "What is the College Athlete Network, and how does it help me?",
        answer:
          "The College Athlete Network gives you instant access to your school's complete athlete and alumni network—without you having to build it yourself. We map your university's athletes and alumni to their public professional data so you can see who alumni are, where they work, what roles they hold, and what in-network opportunities are available.\n\nThe goal is simple: help you secure internships, jobs, and professional connections faster—using a network that already exists.",
      },
      {
        question: "Do I have to create and maintain my own profile?",
        answer:
          "No. Unlike traditional platforms, the network is fully pre-populated when your school launches. Alumni and career data are refreshed automatically every 60 days, so the network stays accurate without requiring athletes or alumni to manually update profiles.",
      },
      {
        question: "Is this just for my sport, or all athletes?",
        answer:
          "It includes all sports at your university. Career networks don't stop at team boundaries, and neither do professional opportunities. The College Athlete Network connects athletes and alumni across every sport to maximize reach and access.",
      },
      {
        question: "Does this cost me anything?",
        answer:
          "No. Student-athletes at participating universities use the platform at no cost.",
      },
    ],
  },
  {
    id: "alumni",
    label: "Alumni",
    icon: <FaUsers size={24} />,
    faqs: [
      {
        question: "Why would I use the College Athlete Network?",
        answer:
          "The platform makes it easy to give back in meaningful ways—by hiring athletes, offering advice, or sharing opportunities—without being overwhelmed by ad-hoc emails, spreadsheets, or one-off requests.\n\nIt also serves as a focused, school-specific professional network. If you're exploring new opportunities or expanding business connections, this is a curated \"mini-LinkedIn\" built around the strongest network you already belong to: your university's athletes and alumni.",
      },
      {
        question: "Do I need to actively update my information?",
        answer:
          "No. Professional data is automatically refreshed every 60 days, ensuring the network remains current even if you're not actively logging in.",
      },
      {
        question: "How is my information used and protected?",
        answer:
          "The College Athlete Network is a private, school-specific platform. Data is used solely to support athlete outcomes and alumni engagement. Information is never sold or made public.",
      },
      {
        question: "My company is hiring—can I post opportunities?",
        answer:
          "Yes. Alumni can post job opportunities or indicate availability to help athletes. There is no cost to post, and opportunities are visible to athletes and the athletic department. Hiring within your university's athlete network keeps talent—and impact—within the community.",
      },
    ],
  },
  {
    id: "coaches",
    label: "Coaches & Administrators",
    icon: <FaBullhorn size={24} />,
    faqs: [
      {
        question:
          "How is this different from spreadsheets, LinkedIn groups, or team-specific alumni lists?",
        answer:
          "Those approaches fail because they rely on manual upkeep, fragmented ownership, and inconsistent participation. The College Athlete Network launches with 100% coverage across all sports and stays current through automated data refreshes.\n\nBy centralizing and professionalizing what is often managed informally by coaches or alumni groups, the department gains quality control over its most valuable long-term asset: the athlete and alumni network.",
      },
      {
        question: "How much work is required from our staff to maintain the network?",
        answer:
          "None. There is no ongoing administrative burden. Data population, updates, and infrastructure are handled centrally so staff can focus on athlete development—not data management.",
      },
      {
        question: "What outcomes should we expect?",
        answer:
          "Schools using the platform see measurable improvements in:\n\n• Alumni engagement and donor participation\n• Cross-sport collaboration\n• Internship and full-time job placement\n• Corporate and alumni relationship activation\n\nThe network becomes a living asset, not a static directory.",
      },
      {
        question: "Who pays for this?",
        answer:
          "Typically, the platform is funded by a corporate sponsor or an alumni association whose goal is to support both current athletes and alumni. The College Athlete Network is directly aligned with that mission.",
      },
    ],
  },
];

export default function FAQsPage() {
  const [activeTab, setActiveTab] = useState<string>("students");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const activePersona = personas.find((p) => p.id === activeTab) || personas[0];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="text-white pt-28 bg-gradient-to-r from-[#1C315F] to-[#ED3237] pb-16">
          <div className="container mx-auto px-4 text-center flex flex-col">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-xl mb-6 max-w-2xl mx-auto">
              Find answers to common questions about The College Athlete Network
            </p>
          </div>
        </section>

        {/* Tabs Section */}
        <section className="py-12 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Tab Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
                {personas.map((persona) => (
                  <button
                    key={persona.id}
                    onClick={() => {
                      setActiveTab(persona.id);
                      setOpenIndex(null);
                    }}
                    className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold transition-all duration-200 ${
                      activeTab === persona.id
                        ? "bg-[#1C315F] text-white shadow-lg scale-105"
                        : "bg-white text-[#1c315f] shadow-md hover:shadow-lg hover:scale-102"
                    }`}
                  >
                    <span className="hidden sm:block">{persona.icon}</span>
                    <span className="text-sm sm:text-base">{persona.label}</span>
                  </button>
                ))}
              </div>

              {/* FAQ Accordion */}
              <div className="space-y-4">
                {activePersona.faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-lg"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full px-6 py-5 flex items-start justify-between text-left gap-4 hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="text-lg font-semibold text-[#1c315f] flex-1">
                        {faq.question}
                      </h3>
                      <div className="flex-shrink-0 text-[#ED3237] mt-1">
                        {openIndex === index ? (
                          <FaChevronUp size={20} />
                        ) : (
                          <FaChevronDown size={20} />
                        )}
                      </div>
                    </button>
                    {openIndex === index && (
                      <div className="px-6 pb-5 text-[#1c315f]/90 text-base leading-relaxed border-t border-gray-100 pt-4">
                        {faq.answer.split("\n").map((paragraph, i) => (
                          <p key={i} className={i > 0 ? "mt-3" : ""}>
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-[#1c315f] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4" role="heading" aria-level={2}>
              Still Have Questions?
            </h2>
            <p className="text-xl mb-6 max-w-2xl mx-auto">
              Our team is here to help you understand how The College Athlete
              Network can support your goals.
            </p>
            <a
              href="/contact-us"
              className="inline-block bg-white text-[#1C315F] text-lg font-medium px-8 py-3 rounded-full font-semibold hover:bg-[#ED3237] hover:text-white transition duration-300"
            >
              Contact Us
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
