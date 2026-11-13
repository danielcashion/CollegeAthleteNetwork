"use client";
import React, { useRef, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import { IoClose } from "react-icons/io5";
import { CheckCircle } from "lucide-react";

interface ContactSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactSuccessModal({
  isOpen,
  onClose,
}: ContactSuccessModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const router = useRouter();

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        isOpen &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (isOpen && event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOkClick = () => {
    onClose();
    router.push("/");
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-md mx-4 overflow-hidden rounded-2xl border border-[#1C315F]/10 bg-white p-8 text-center shadow-[0_20px_40px_rgba(28,49,95,0.15)]"
        style={{ fontFamily: "var(--font-open-sans), sans-serif" }}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#1C315F] via-[#2563eb] to-[#1C315F]" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]"
        >
          <IoClose size={22} />
        </button>

        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle className="h-8 w-8 text-emerald-600" />
        </div>

        <h2 id={titleId} className="text-2xl font-bold text-[#1C315F]">
          Message Sent Successfully!
        </h2>

        <div className="mt-4 space-y-2">
          <p className="text-lg font-semibold leading-snug text-slate-800">
            Thanks! We will get in touch with you within the next 24 hours.
          </p>
          <p className="text-sm leading-relaxed text-slate-500">
            Your message has been received and our team will review it promptly.
            We appreciate your interest in The College Athlete Network.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOkClick}
          className="mt-8 w-full rounded-xl bg-gradient-to-r from-[#1C315F] to-[#2563eb] py-3 font-semibold text-white shadow-md transition-all duration-300 hover:from-[#142244] hover:to-[#1d4ed8] hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb] focus-visible:ring-offset-2"
        >
          Ok
        </button>
      </div>
    </div>
  );
}
