"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { FaQuestion, FaTimes, FaEnvelope, FaPlay } from "react-icons/fa";

export default function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const openVideoModal = () => {
    setIsVideoModalOpen(true);
    setIsOpen(false); // Close the FAB menu when opening video
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVideoModalOpen) {
        closeVideoModal();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isVideoModalOpen]);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {/* Menu Options - appear when open */}
        {isOpen && (
          <div className="flex flex-col gap-3 animate-fadeIn">
            {/* View Intro Video */}
            <button
              onClick={openVideoModal}
              className="flex items-center gap-3 bg-white text-[#1C315F] px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 group"
            >
              <span className="font-semibold text-sm sm:text-base whitespace-nowrap">
                View Intro Video
              </span>
              <div className="bg-[#ED3237] text-white p-2 rounded-full group-hover:bg-[#1C315F] transition-colors">
                <FaPlay size={16} />
              </div>
            </button>

            {/* Get In Touch */}
            <Link
              href="/contact-us"
              className="flex items-center gap-3 bg-white text-[#1C315F] px-5 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 group"
            >
              <span className="font-semibold text-sm sm:text-base whitespace-nowrap">
                Get In Touch
              </span>
              <div className="bg-[#ED3237] text-white p-2 rounded-full group-hover:bg-[#1C315F] transition-colors">
                <FaEnvelope size={16} />
              </div>
            </Link>
          </div>
        )}

        {/* Main FAB Button */}
        <button
          onClick={toggleMenu}
          className={`bg-gradient-to-r from-[#1C315F] to-[#ED3237] text-white p-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 ${
            isOpen ? "rotate-90" : ""
          }`}
          aria-label={isOpen ? "Close menu" : "Open help menu"}
        >
          {isOpen ? <FaTimes size={24} /> : <FaQuestion size={24} />}
        </button>
      </div>

      {/* Video Modal */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={closeVideoModal}
        >
          <div
            className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeVideoModal}
              className="absolute top-4 right-4 z-10 bg-[#ED3237] text-white p-3 rounded-full hover:bg-[#1C315F] transition-colors shadow-lg"
              aria-label="Close video"
            >
              <FaTimes size={20} />
            </button>

            {/* Video Title */}
            <div className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] text-white px-6 py-4">
              <h2 className="text-xl sm:text-2xl font-bold">
                The College Athlete Network - Introduction
              </h2>
            </div>

            {/* Video Player */}
            <div className="relative w-full pb-[56.25%] bg-black">
              <iframe
                src="https://www.youtube-nocookie.com/embed/SWwTzuWM-EM?autoplay=1"
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="College Athlete Network Introduction Video"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
