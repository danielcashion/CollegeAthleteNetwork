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
    <div className="w-full flex flex-col py-10 px-4">
      <p className="text-center text-2xl text-[#1C315F] font-medium w-full max-w-5xl mx-auto mb-6">
        Our clients have seen great success by activating their network with
        these email campaigns templates. We have productionalized the process
        and provide it as a way to engage a university&apos;s network after it
        has been onboarded.
      </p>
      <p className="text-center text-xl text-[#1C315F] font-medium mb-2">
        Each step contains an email template for you to get started!
      </p>
      <p className="text-center text-xl text-[#1C315F] font-medium mb-6">
        Leverage ours or create your own! Here are some examples.
      </p>
      <div className="w-full max-w-5xl mx-auto flex flex-col gap-4">
        {EmailCommunicationSteps.map((step: any, i: number) => {
          const isOpen = openSteps.includes(i);

          return (
            <div key={i} className=" rounded-lg overflow-hidden">
              <button
                onClick={() => toggleStep(i)}
                className="w-full border rounded-lg flex items-center justify-between p-4 bg-gray-100"
              >
                <h2 className="text-lg text-[#1C315F] font-medium">
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
