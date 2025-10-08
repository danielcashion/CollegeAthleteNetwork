"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

const Carousel = () => {
  const brandImages = [
    {
      src: "/images/college-athletes-1.jpg",
    },
    {
      src: "/images/college-athletes-3.jpg",
    },
    {
      src: "/images/college-athletes-4.jpg",
    },
    {
      src: "/images/college-athletes-5.jpg",
    },
    {
      src: "/images/college-athletes-6.jpg",
    },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isReversed, setIsReversed] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchMoved = useRef(false);
  const hideTimer = useRef<number | null>(null);
  const animationDuration = 40; // seconds

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    scrollContainer.style.transform = "translateX(0)";

    const keyframes = `
      @keyframes scroll {
        from {
          transform: translateX(0);
        }
        to {
          transform: translateX(-50%);
        }
      }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = keyframes;
    document.head.appendChild(styleSheet);

    // set the initial animation (play state and direction will be applied by another effect)
    scrollContainer.style.animation = `scroll ${animationDuration}s linear infinite`;

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, [animationDuration]);

  // Update animation when play or direction changes
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    scrollContainer.style.animationPlayState = isPlaying ? "running" : "paused";
    scrollContainer.style.animationDirection = isReversed ? "reverse" : "normal";
  }, [isPlaying, isReversed]);

  // Touch handlers: detect tap vs swipe, show controls on tap, auto-hide
  const clearHideTimer = () => {
    if (hideTimer.current) {
      window.clearTimeout(hideTimer.current);
      hideTimer.current = null;
    }
  };

  const startHideTimer = (ms = 3000) => {
    clearHideTimer();
    hideTimer.current = window.setTimeout(() => setShowControls(false), ms) as unknown as number;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchMoved.current = false;
    touchStartX.current = e.touches?.[0]?.clientX ?? null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const startX = touchStartX.current;
    if (startX == null) return;
    const dx = Math.abs((e.touches?.[0]?.clientX ?? 0) - startX);
    if (dx > 10) touchMoved.current = true; // user is swiping
  };

  const onTouchEnd = () => {
    if (!touchMoved.current) {
      setShowControls((s) => {
        const next = !s;
        if (next) startHideTimer(3500);
        else clearHideTimer();
        return next;
      });
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="mb-[25px] w-full overflow-hidden md:mt-[40px] relative group"
      tabIndex={0}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onFocus={() => setShowControls(true)}
      onBlur={() => startHideTimer(500)}
    >
      <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent_5%,black_15%,black_85%,transparent_95%)]">
        <div ref={scrollRef} className="flex flex-none gap-40">
          <div className="flex gap-[30px] md:gap-[70px] lg:gap-[95px]">
            {[...brandImages, ...brandImages].map((image, index) => (
              <Image
                key={index}
                src={image.src}
                alt={"college athlete"}
                width={300}
                height={250}
                quality={40}
                className="h-[250px] object-cover rounded-lg"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Center controls: reverse + play/pause */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`opacity-0 group-hover:opacity-100 group-focus:opacity-100 ${showControls ? 'opacity-100 pointer-events-auto' : 'pointer-events-none'} transition-opacity duration-200 group-hover:pointer-events-auto group-focus:pointer-events-auto bg-white/70 backdrop-blur-sm rounded-full shadow-md p-2 flex items-center gap-2`}
          aria-hidden={!showControls && !isPlaying && !isReversed}
        >
          <button
            type="button"
            aria-label={isReversed ? "Set direction to forward" : "Set direction to reverse"}
            title={isReversed ? "Forward" : "Reverse"}
            onClick={() => setIsReversed((s) => !s)}
            className="p-2 rounded hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ED3237]"
          >
            {/* Reverse icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M20 12H8" stroke="#1C315F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 6L6 12L12 18" stroke="#1C315F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            type="button"
            aria-pressed={!isPlaying}
            aria-label={isPlaying ? "Pause carousel" : "Play carousel"}
            title={isPlaying ? "Pause" : "Play"}
            onClick={() => setIsPlaying((s) => !s)}
            className="p-2 rounded bg-white border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ED3237]"
          >
            {/* Play / Pause icon */}
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <rect x="6" y="5" width="4" height="14" fill="#1C315F" />
                <rect x="14" y="5" width="4" height="14" fill="#1C315F" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M5 3L19 12L5 21V3Z" fill="#1C315F" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Carousel;
