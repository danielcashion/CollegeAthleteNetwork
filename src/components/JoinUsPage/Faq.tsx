"use client";

import type React from "react";
import { useState } from "react";
import { faqs } from "@/utils/faqs";
import { FaAngleDown } from "react-icons/fa6";

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="pt-6 pb-12 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold mb-2 text-blueMain">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Find answers to common questions about The College Athlete Network.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={faq.id} className="mb-4">
              <button
                onClick={() => toggleFAQ(index)}
                className={`flex justify-between items-center w-full text-left p-5 bg-gray-200 hover:bg-gray-100 rounded-lg transition-colors ${
                  openIndex === index && "rounded-b-none"
                }`}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${faq.id}`}
              >
                <span className="font-medium text-lg">{faq.question}</span>

                <FaAngleDown
                  size={24}
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    openIndex === index ? "transform rotate-180" : ""
                  }`}
                />
              </button>

              <div
                id={`faq-answer-${faq.id}`}
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-5 border border-t-0 border-gray-200 rounded-b-lg bg-white">
                  <p className="text-gray-700 text-lg">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
