"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";

const CollegeLogosCarousel = () => {
  const CollegeLogos = [
    {
      src: "https://collegeathletenetwork.s3.us-east-1.amazonaws.com/Brown.png",
    },
    {
      src: "https://collegeathletenetwork.s3.us-east-1.amazonaws.com/Cornell.png",
    },
    {
      src: "https://collegeathletenetwork.s3.us-east-1.amazonaws.com/Harvard.png",
    },
    {
      src: "https://collegeathletenetwork.s3.us-east-1.amazonaws.com/Princeton.png",
    },
    {
      src: "https://collegeathletenetwork.s3.us-east-1.amazonaws.com/villanova.png",
    },
    {
      src: "https://collegeathletenetwork.s3.us-east-1.amazonaws.com/Yale.png",
    },
    {
      src: "https://collegeathletenetwork.s3.us-east-1.amazonaws.com/Middlebury.png",
    },
    {
      src: "https://collegeathletenetwork.s3.us-east-1.amazonaws.com/HobartWilliamSmith.png",
    },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    // Dynamically add keyframes for scrolling
    const keyframes = `
      @keyframes scroll {
        0% {
          transform: translateX(0);
        }
        100% {
          transform: translateX(-100%);
        }
      }
    `;
    const styleSheet = document.createElement("style");
    styleSheet.textContent = keyframes;
    document.head.appendChild(styleSheet);

    scrollContainer.style.animation = "scroll 100s linear infinite";

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <div className="mb-[10px] w-full overflow-hidden md:mt-[20px]">
      <div className="flex overflow-hidden">
        <div
          ref={scrollRef}
          className="flex flex-none gap-10"
          style={{
            display: "flex",
            whiteSpace: "nowrap",
          }}
        >
          {[...CollegeLogos, ...CollegeLogos].map((image, index) => (
            <div
              key={index}
              className="relative flex-shrink-0"
              style={{
                width: "150px",
                height: "auto",
              }}
            >
              <Image
                src={image.src}
                alt={`Logo of ${
                  image.src.split("/").pop()?.split(".")[0] ?? "college"
                }`}
                width={150}
                height={100}
                style={{
                  objectFit: "contain",
                }}
                priority={true}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CollegeLogosCarousel;
