"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FaPlay, FaTimes } from "react-icons/fa";
import AthleteImage from "../../public/images/college-athletes-7.jpg";

export default function HeroVideo() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const openVideoModal = () => {
    setIsVideoModalOpen(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
  };

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
      <button
        type="button"
        onClick={openVideoModal}
        aria-label="Play introduction video"
        className="group relative w-full overflow-hidden rounded-lg shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/50"
      >
        <Image
          src={AthleteImage}
          alt="College Athletes"
          className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="bg-[#ED3237] text-white p-5 sm:p-6 rounded-full shadow-2xl group-hover:bg-[#1C315F] group-hover:scale-110 transition-all duration-300">
            <FaPlay size={28} className="translate-x-0.5" />
          </div>
          <span className="text-white font-semibold text-base sm:text-lg drop-shadow-lg">
            Watch Intro Video
          </span>
        </div>
      </button>

      {isVideoModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={closeVideoModal}
        >
          <div
            className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeVideoModal}
              className="absolute top-4 right-4 z-10 bg-[#ED3237] text-white p-3 rounded-full hover:bg-[#1C315F] transition-colors shadow-lg"
              aria-label="Close video"
            >
              <FaTimes size={20} />
            </button>

            <div className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] text-white px-6 py-4">
              <h2 className="text-xl sm:text-2xl font-bold">
                The College Athlete Network - Introduction
              </h2>
            </div>

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
