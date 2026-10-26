"use client";

import { useState, type ReactNode } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import { FaUserGraduate, FaUsers, FaBullhorn } from "react-icons/fa";
import { personaFaqs } from "./faqs-data";

const personaIcons: Record<string, ReactNode> = {
  students: <FaUserGraduate size={24} />,
  alumni: <FaUsers size={24} />,
  coaches: <FaBullhorn size={24} />,
};

export default function FaqsClient() {
  const [activeTab, setActiveTab] = useState<string>("students");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const activePersona =
    personaFaqs.find((p) => p.id === activeTab) || personaFaqs[0];

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-grow">
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

        <section className="py-12 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
                {personaFaqs.map((persona) => (
                  <button
                    key={persona.id}
                    type="button"
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
                    <span className="hidden sm:block">
                      {personaIcons[persona.id]}
                    </span>
                    <span className="text-sm sm:text-base">{persona.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {activePersona.faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transition-all duration-200 hover:shadow-lg"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full px-6 py-5 flex items-start justify-between text-left gap-4 hover:bg-gray-50 transition-colors"
                    >
                      <h2 className="text-lg font-semibold text-[#1c315f] flex-1">
                        {faq.question}
                      </h2>
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

        <section className="py-16 bg-[#1c315f] text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
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
