"use client";
import React, { useEffect, useRef } from "react";
import Image from "next/image";

const Carousel = () => {
  const brandImages = [
    {
      src: "/images/college-athletes-1.jpg",
    },
    {
      src: "/images/college-athletes-3.png",
    },
    {
      src: "/images/college-athletes-4.png",
    },
    {
      src: "/images/college-athletes-5.png",
    },
    {
      src: "/images/college-athletes-6.png",
    },
  ];

  const scrollRef = useRef<HTMLDivElement>(null);

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

    scrollContainer.style.animation = "scroll 40s linear infinite";

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);

  return (
    <div className="mb-[25px] w-full overflow-hidden md:mt-[40px]">
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
    </div>
  );
};

export default Carousel;
