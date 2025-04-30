"use client";
import { useState, useRef } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

import EmailUi from "./EmailUi";
import { EmailCommunicationSteps } from "@/utils/EmailCommunicationSteps";

const EmailSteps = () => {
  const [openSteps, setOpenSteps] = useState<number[]>([0]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);

  const toggleStep = (index: number) => {
    setOpenSteps((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="w-full flex py-20 px-4">
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">
        {EmailCommunicationSteps.map((step: any, i: number) => {
          const isOpen = openSteps.includes(i);

          return (
            <div key={i} className=" rounded-lg overflow-hidden">
              <button
                onClick={() => toggleStep(i)}
                className="w-full border rounded-lg flex items-center justify-between p-4 bg-gray-100"
              >
                <h2 className="text-lg font-medium">
                  Step {step.step}: {step.title}
                </h2>
                {isOpen ? (
                  <FiChevronUp size={20} />
                ) : (
                  <FiChevronDown size={20} />
                )}
              </button>

              <div
                ref={(el: HTMLDivElement | null) => {
                  contentRefs.current[i] = el;
                }}
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: isOpen ? "650px" : "0",
                  opacity: isOpen ? 1 : 0,
                  padding: isOpen ? "1rem 1rem 1rem 1rem" : "0 1rem 0 1rem",
                  visibility: isOpen ? "visible" : "hidden",
                }}
              >
                <EmailUi data={step} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmailSteps;
