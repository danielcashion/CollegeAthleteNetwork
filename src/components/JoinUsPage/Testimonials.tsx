"use client";

import React, { useState, useEffect } from "react";
import { testimonials, type Testimonial } from "@/utils/testimonialsData";
import { FaAngleRight, FaAngleLeft } from "react-icons/fa6";

const Testimonials: React.FC = () => {
  const [visibleCount, setVisibleCount] = useState(3);
  const [maxIndex, setMaxIndex] = useState(testimonials.length - visibleCount);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Update visible count and max index based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        // Mobile: 1 testimonial
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        // Tablet: 2 testimonials
        setVisibleCount(2);
      } else {
        // Desktop: 3 testimonials
        setVisibleCount(3);
      }
    };

    // Initial setup
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update max index when visible count changes
  useEffect(() => {
    setMaxIndex(testimonials.length - visibleCount);
    // Reset current index if it's out of bounds after resize
    if (currentIndex > testimonials.length - visibleCount) {
      setCurrentIndex(0);
    }
  }, [visibleCount, currentIndex]);

  const goToNext = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
    }
  };

  const goToPrevious = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
    }
  };

  useEffect(() => {
    const interval = setInterval(goToNext, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <section className="py-12 flex px-4">
      <div className="container mx-auto ">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold mb-2 text-blueMain">
            What Our Community Says
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Hear from athletes who have found success through The College
            Athlete Network.
          </p>
        </div>

        <div className="relative w-full">
          <div className="overflow-hidden">
            <div
              className={`flex transition-transform duration-500 ease-in-out ${
                isTransitioning ? "opacity-70" : "opacity-100"
              }`}
              style={{
                transform: `translateX(-${
                  (currentIndex * 100) / visibleCount
                }%)`,
              }}
            >
              {testimonials.map((testimonial: Testimonial) => (
                <div
                  key={testimonial.id}
                  className={`flex-none px-3 py-4 ${
                    visibleCount === 1
                      ? "w-full"
                      : visibleCount === 2
                      ? "w-1/2"
                      : "w-1/3"
                  }`}
                >
                  <TestimonialCard testimonial={testimonial} />
                </div>
              ))}
            </div>
          </div>

          {/* On desktop, buttons appear on the sides */}
          <button
            onClick={goToPrevious}
            className="lg:absolute lg:left-0 lg:top-1/2 lg:-translate-y-1/2 lg:-translate-x-4 lg:md:-translate-x-8 bg-blueMain text-white p-2 rounded-full shadow-md hover:shadow-lg transition-shadow z-10 hidden lg:block"
            aria-label="Previous testimonial"
          >
            <FaAngleLeft size={22} />
          </button>

          <button
            onClick={goToNext}
            className="lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-4 lg:md:translate-x-8 bg-blueMain text-white p-2 rounded-full shadow-md hover:shadow-lg transition-shadow z-10 hidden lg:block"
            aria-label="Next testimonial"
          >
            <FaAngleRight size={22} />
          </button>

          {/* On mobile and tablet, buttons appear below the slides */}
          <div className="flex justify-center mt-6 space-x-4 lg:hidden">
            <button
              onClick={goToPrevious}
              className="bg-blueMain text-white p-3 rounded-full shadow-md hover:shadow-lg transition-shadow"
              aria-label="Previous testimonial"
            >
              <FaAngleLeft size={20} />
            </button>

            <button
              onClick={goToNext}
              className="bg-blueMain text-white p-3 rounded-full shadow-md hover:shadow-lg transition-shadow"
              aria-label="Next testimonial"
            >
              <FaAngleRight size={20} />
            </button>
          </div>

          {/* <div className="flex justify-center mt-6 space-x-2">
            {testimonials.map((_, index: number) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 w-2 rounded-full transition-colors ${
                  currentIndex === index ? "bg-blue-600" : "bg-gray-300"
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div> */}
        </div>
      </div>
    </section>
  );
};

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({
  testimonial,
}) => {
  return (
    <div className="bg-white h-full rounded-lg shadow-[0px_0px_8px_2px_#00000022] p-8 flex flex-col items-center text-center">
      <blockquote className="mb-4 text-gray-700 italic">
        "{testimonial.quote}"
      </blockquote>

      <div className="mt-auto">
        <p className="font-semibold text-gray-900">{testimonial.name}</p>
        <p className="text-sm text-gray-600">{testimonial.role}</p>
        <p className="text-sm text-blue-600">{testimonial.university}</p>
      </div>
    </div>
  );
};

export default Testimonials;
