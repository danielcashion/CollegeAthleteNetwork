"use client";
import React, { useRef, useEffect } from "react";
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
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
        style={{ fontFamily: "var(--font-open-sans), sans-serif" }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-green-600 flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-600" />
            Message Sent Successfully!
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-green-800 font-semibold text-lg mb-2">
              Thanks! We will get in touch with you within the next 24 hours.
            </p>
            <p className="text-green-700 text-sm">
              Your message has been received and our team will review it promptly. 
              We appreciate your interest in The College Athlete Network.
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleOkClick}
            className="px-6 py-3 bg-gradient-to-r from-[#1C315F] to-[#2563eb] text-white rounded-lg hover:from-[#142244] hover:to-[#1d4ed8] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  );
}