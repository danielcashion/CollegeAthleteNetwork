/* eslint-disable react-hooks/exhaustive-deps */

"use client";
import React, { useState, useEffect, useRef } from "react";

type CountUpProps = {
  start?: number;
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
};

const CountUp: React.FC<CountUpProps> = ({
  start = 0,
  end,
  duration = 2,
  prefix = "",
  suffix = "",
}) => {
  const [currentValue, setCurrentValue] = useState<number>(start);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const elementRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    const range = end - start;
    const increment = range / ((duration * 1000) / 10);
    let current = start;

    const interval = setInterval(() => {
      current += increment;
      if (
        (increment > 0 && current >= end) ||
        (increment < 0 && current <= end)
      ) {
        current = end;
        clearInterval(interval);
      }
      setCurrentValue(current);
    }, 10);

    return () => clearInterval(interval);
  }, [hasStarted, start, end, duration]);

  return (
    <span ref={elementRef}>
      {prefix}
      {currentValue.toFixed(0)}
      {suffix}
    </span>
  );
};

export default CountUp;
