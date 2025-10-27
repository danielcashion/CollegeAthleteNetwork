"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";

const CanVideoModal = () => {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const modalUniqueId = "CANElectricity-2025-05-21";
  const videoSrc =
    "https://collegeathletenetwork.s3.us-east-1.amazonaws.com/Videos/CollegeAthleteNetworkLogoElectricity.mp4";

  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasModalBeenPlayed = localStorage.getItem(modalUniqueId);
      if (!hasModalBeenPlayed) {
        setShowModal(true);
        setIsVisible(true);
      }
    }
  }, [modalUniqueId]);

  const handleVideoEnd = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(modalUniqueId, "true");
    }
    setIsVisible(false);
    setTimeout(() => setShowModal(false), 300);
  };

  useEffect(() => {
    if (showModal && videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Autoplay was prevented:", error);
        // Close modal if video can't be played for any reason
        setIsVisible(false);
        setTimeout(() => setShowModal(false), 300);
      });
    }
  }, [showModal]);

  const handleVideoLoaded = () => {
    setIsLoading(false);
  };

  if (!showModal) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        ref={modalRef}
        className={`rounded-xl shadow-2xl w-full max-w-6xl overflow-hidden transition-all duration-500 transform
    ${
      isVisible
        ? "scale-100 opacity-100 translate-x-0 translate-y-0"
        : "scale-50 opacity-0 -translate-x-[40vw] -translate-y-[40vh]"
    }
  `}
      >
        <div className="relative">
          <div className="bg-gradient-to-r text-center from-[#1C315F] to-[#ED3237] text-white p-4 flex justify-center items-center">
            <div className="flex items-center gap-4">
              <Image
                src="/Logos/CANLogo1200x1200White.png"
                alt="CAN logo"
                width={80}
                height={80}
                className="w-[80px] h-[80px] object-contain"
              />

              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Our Data Powers Successful College Athlete Networks. Period.
              </h2>
            </div>
          </div>

          <div className="relative w-full aspect-video bg-black">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <video
              ref={videoRef}
              src={videoSrc}
              onEnded={handleVideoEnd}
              onLoadedData={handleVideoLoaded}
              onError={() => {
                console.error("Video failed to load");
                setIsVisible(false);
                setTimeout(() => setShowModal(false), 300);
              }}
              muted
              playsInline
              className="w-full h-full object-contain"
            />
          </div>

          <div className="p-2 bg-gray-50 text-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} The College Athlete Network, LLC
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanVideoModal;
