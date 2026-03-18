"use client";

import React, { useRef, useEffect, useMemo, useState } from "react";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController,
  ChartEvent,
  ActiveElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  BarController
);

interface TrafficDataPoint {
  city: string;
  state: string;
  date: string;
  visits: number;
}

interface DailyVisitorsChartProps {
  data: TrafficDataPoint[];
  selectedDates: Set<string>;
  onDateClick: (dates: Set<string>) => void;
}

export default function DailyVisitorsChart({ 
  data, 
  selectedDates,
  onDateClick 
}: DailyVisitorsChartProps) {
  const chartRef = useRef<ChartJS | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Track mount state to prevent chart initialization before DOM is ready
  useEffect(() => {
    // Reset mount state when data changes significantly
    setIsMounted(false);
    
    // Destroy existing chart before remounting with new data
    if (chartRef.current) {
      try {
        chartRef.current.destroy();
        chartRef.current = null;
      } catch (error) {
        console.warn("Chart pre-cleanup error:", error);
      }
    }
    
    const timer = setTimeout(() => {
      // Ensure container exists before mounting
      if (containerRef.current) {
        setIsMounted(true);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [data.length, selectedDates.size]);

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        try {
          chartRef.current.destroy();
        } catch (error) {
          console.warn("Chart cleanup error:", error);
        }
        chartRef.current = null;
      }
    };
  }, [data]);

  const { sortedDates, dailyVisits } = useMemo(() => {
    if (!data || data.length === 0) return { sortedDates: [], dailyVisits: {} };

    // Group by date and sum visits
    const visits: Record<string, number> = data.reduce((acc, item) => {
      acc[item.date] = (acc[item.date] || 0) + item.visits;
      return acc;
    }, {} as Record<string, number>);

    // Sort dates
    const dates = Object.keys(visits).sort();

    return { sortedDates: dates, dailyVisits: visits };
  }, [data]);

  const chartData = useMemo(() => {
    if (!data || data.length === 0 || sortedDates.length === 0) return null;

    const visitCounts = sortedDates.map((date) => dailyVisits[date]);

    // Format dates for display (e.g., "Mar 17")
    const formattedLabels = sortedDates.map((date) => {
      const d = new Date(date);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    });

    // Create background colors based on selection
    const backgroundColors = sortedDates.map((date) =>
      selectedDates.has(date)
        ? "rgba(28, 49, 95, 0.8)"
        : "rgba(156, 163, 175, 0.3)"
    );

    const borderColors = sortedDates.map((date) =>
      selectedDates.has(date) ? "#1C315F" : "#9CA3AF"
    );

    return {
      labels: formattedLabels,
      datasets: [
        {
          label: "Daily Visitors",
          data: visitCounts,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 2,
          hoverBackgroundColor: "#ED3237",
          hoverBorderColor: "#ED3237",
        },
      ],
    };
  }, [data, sortedDates, dailyVisits, selectedDates]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      onClick: (event: ChartEvent, elements: ActiveElement[]) => {
        if (elements.length > 0) {
          const elementIndex = elements[0].index;
          const clickedDate = sortedDates[elementIndex];

          // Toggle the date selection
          const newSelectedDates = new Set(selectedDates);
          if (newSelectedDates.has(clickedDate)) {
            newSelectedDates.delete(clickedDate);
          } else {
            newSelectedDates.add(clickedDate);
          }

          onDateClick(newSelectedDates);
        }
      },
      plugins: {
        legend: {
          display: true,
          position: "top" as const,
          labels: {
            font: {
              size: 14,
              weight: "bold" as const,
            },
            color: "#1C315F",
          },
        },
        title: {
          display: true,
          text: "Daily Website Visitors (Click bars to filter OUT from table)",
          font: {
            size: 18,
            weight: "bold" as const,
          },
          color: "#1C315F",
          padding: {
            bottom: 20,
          },
        },
        tooltip: {
          backgroundColor: "rgba(28, 49, 95, 0.95)",
          titleColor: "#fff",
          bodyColor: "#fff",
          padding: 12,
          borderColor: "#ED3237",
          borderWidth: 2,
          displayColors: false,
          callbacks: {
            label: function (context: any) {
              const value = context.parsed.y;
              return `Total Visits: ${value.toLocaleString()}`;
            },
            afterLabel: function (context: any) {
              const value = context.parsed.y;
              if (value > 5000) {
                return `(Value exceeds chart maximum of 5,000)`;
              }
              return "Click to filter table";
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
          ticks: {
            color: "#1C315F",
            font: {
              size: 12,
            },
          },
        },
        y: {
          beginAtZero: true,
          max: 5000,
          grid: {
            color: "rgba(28, 49, 95, 0.1)",
          },
          ticks: {
            color: "#1C315F",
            font: {
              size: 12,
            },
            callback: function (value: any) {
              return value.toLocaleString();
            },
          },
          title: {
            display: true,
            text: "Number of Visits (max: 5,000)",
            color: "#1C315F",
            font: {
              size: 14,
              weight: "bold" as const,
            },
          },
        },
      },
    }),
    [sortedDates, selectedDates, onDateClick]
  );

  if (!chartData || !isMounted) {
    return (
      <div 
        ref={containerRef}
        className="flex items-center justify-center h-96 bg-gray-50 rounded-lg border border-gray-200"
      >
        <p className="text-gray-500 text-lg">
          {!isMounted ? "Loading chart..." : "No data available"}
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 relative overflow-hidden animate-fadeIn">
      {/* Accent Border */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#1C315F] to-[#ED3237]"></div>
      
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-gradient-to-br from-[#1C315F] to-transparent"></div>
      
      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-gradient-to-b from-[#1C315F] to-[#ED3237] rounded-full"></div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1C315F] to-[#ED3237] bg-clip-text text-transparent">
              📊 Daily Trends
            </h2>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg shadow-sm">
          <p className="text-sm text-[#1C315F]">
            <span className="font-semibold">💡 Interactive Chart:</span> Click on any bar to add/remove that date from the table filter below. Selected dates are shown in blue, unselected in gray.
          </p>
        </div>
        
        <div className="h-96">
          {isMounted && chartData && (
            <Chart ref={chartRef} type="bar" data={chartData} options={options} />
          )}
        </div>
      </div>
    </div>
  );
}
