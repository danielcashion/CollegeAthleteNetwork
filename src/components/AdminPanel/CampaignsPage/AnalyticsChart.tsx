"use client";
import React, { useRef, useEffect, useMemo, useState } from "react";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  LineController,
  BarController,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
  LineController,
  BarController
);

export interface TimelinePoint {
  day: number;
  sent: number;
  delivered: number;
  opens: number;
  clicks: number;
  bounces: number;
  complaints: number;
  deliveryDelayReject: number;
}

export interface ChartDisplayOptions {
  showDailyOpens: boolean;
  showDailyClicks: boolean;
  showCumulativeOpens: boolean;
  showCumulativeClicks: boolean;
}

interface AnalyticsChartProps {
  timeline: TimelinePoint[];
  displayOptions: ChartDisplayOptions;
  onPointClickAction?: (pointIndex: number, point: TimelinePoint) => void;
}

export default function AnalyticsChart({
  timeline,
  displayOptions,
  onPointClickAction,
}: AnalyticsChartProps) {
  const chartRef = useRef<ChartJS | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Track mount state to prevent chart initialization before DOM is ready
  useEffect(() => {
    // Small delay to ensure DOM is fully ready
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 100);

    return () => {
      clearTimeout(timer);
      setIsMounted(false);
    };
  }, []);

  // Cleanup chart on unmount and data changes to prevent memory leaks
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
  }, [timeline]);

  const chartData = useMemo(() => {
    if (!timeline || timeline.length === 0) return null;

    // Custom x-axis labels
    const labels = timeline.map((t, index) => {
      if (index === 0) return "Today";
      if (index === 1) return "Yesterday";
      if (index === 6) return ">= 6";
      return index.toString();
    });

    // Daily data for bars
    const dailyOpens = timeline.map((t) => t.opens);
    const dailyClicks = timeline.map((t) => t.clicks);

    // Cumulative data for lines
    const cumulativeOpens = timeline.reduce((acc, t, index) => {
      const cumSum = index === 0 ? t.opens : acc[index - 1] + t.opens;
      acc.push(cumSum);
      return acc;
    }, [] as number[]);

    const cumulativeClicks = timeline.reduce((acc, t, index) => {
      const cumSum = index === 0 ? t.clicks : acc[index - 1] + t.clicks;
      acc.push(cumSum);
      return acc;
    }, [] as number[]);

    const datasets = [];

    if (displayOptions.showDailyOpens) {
      datasets.push({
        type: "bar" as const,
        label: "Daily Opens",
        data: dailyOpens,
        backgroundColor: "rgba(37, 99, 235, 0.6)",
        borderColor: "rgb(37, 99, 235)",
        borderWidth: 1,
        yAxisID: "y",
      });
    }

    if (displayOptions.showDailyClicks) {
      datasets.push({
        type: "bar" as const,
        label: "Daily Clicks",
        data: dailyClicks,
        backgroundColor: "rgba(34, 197, 94, 0.6)",
        borderColor: "rgb(34, 197, 94)",
        borderWidth: 1,
        yAxisID: "y",
      });
    }

    if (displayOptions.showCumulativeOpens) {
      datasets.push({
        type: "line" as const,
        label: "Cumulative Opens",
        data: cumulativeOpens,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.1)",
        tension: 0.3,
        yAxisID: "y1",
        pointBackgroundColor: "#2563eb",
        pointBorderColor: "#2563eb",
        pointRadius: 4,
      });
    }

    if (displayOptions.showCumulativeClicks) {
      datasets.push({
        type: "line" as const,
        label: "Cumulative Clicks",
        data: cumulativeClicks,
        borderColor: "#16a34a",
        backgroundColor: "rgba(16,163,74,0.08)",
        tension: 0.3,
        yAxisID: "y1",
        pointBackgroundColor: "#16a34a",
        pointBorderColor: "#16a34a",
        pointRadius: 4,
      });
    }

    return {
      labels,
      datasets,
    };
  }, [timeline, displayOptions]);

  const handlePointClick = (evt: any, elements: any[]) => {
    if (!timeline || !onPointClickAction) return;
    if (!elements || elements.length === 0) return;

    const idx = elements[0].index;
    const point = timeline[idx];
    onPointClickAction(idx, point);
  };

  // Only render chart after mount and when container is attached to the document
  const containerAttached = !!(
    containerRef.current && containerRef.current.isConnected
  );

  if (!isMounted || !chartData || !containerAttached) {
    return (
      <div
        ref={containerRef}
        className="bg-white p-4 rounded shadow mb-4 h-80 flex items-center justify-center"
      >
        <div className="text-gray-500">
          {!isMounted ? "Loading chart..." : "No timeline data available"}
        </div>
      </div>
    );
  }

  // Error boundary to catch Chart.js runtime errors during mount/render
  class ChartErrorBoundary extends React.Component<
    {
      children: React.ReactNode;
    },
    { hasError: boolean }
  > {
    constructor(props: any) {
      super(props);
      this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
      return { hasError: true };
    }
    componentDidCatch(error: any, info: any) {
      console.error("Chart render error:", error, info);
    }
    render() {
      if (this.state.hasError) {
        return (
          <div className="bg-white p-4 rounded shadow mb-4 h-80 flex items-center justify-center text-gray-600">
            Chart unavailable
          </div>
        );
      }
      return this.props.children as any;
    }
  }

  return (
    <div
      ref={containerRef}
      className="bg-white p-4 rounded shadow mb-4"
      style={{ height: 320 }}
      role="img"
      aria-label="Chart displaying daily and cumulative opens/clicks over the campaign timeline"
      aria-describedby="chart-summary"
    >
      {isMounted && chartData && (
        <ChartErrorBoundary>
          <Chart
            ref={chartRef}
            type="bar"
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              onClick: handlePointClick,
              animation: { duration: 700, easing: "easeOutCubic" },
              interaction: {
                mode: "index",
                intersect: false,
              },
              plugins: {
                legend: {
                  display: false, // Hide legend since we have checkboxes
                },
              },
              scales: {
                x: {
                  display: true,
                  title: {
                    display: true,
                    text: "Days Ago",
                    color: "#1C315F",
                    font: {
                      size: 16,
                      weight: "bold",
                    },
                  },
                },
                y: {
                  type: "linear",
                  display: true,
                  position: "left",
                  beginAtZero: true,
                  min: 0,
                  title: {
                    display: true,
                    text: "Count (bars)",
                    color: "#1C315F",
                    font: {
                      size: 16,
                      weight: "bold",
                    },
                  },
                  ticks: {
                    precision: 0,
                    stepSize: 1,
                  },
                },
                y1: {
                  type: "linear",
                  display: true,
                  position: "right",
                  beginAtZero: true,
                  min: 0,
                  title: {
                    display: true,
                    text: "Cumulative Count (lines)",
                    color: "#1C315F",
                    font: {
                      size: 16,
                      weight: "bold",
                    },
                  },
                  ticks: {
                    precision: 0,
                    stepSize: 1,
                  },
                  grid: {
                    drawOnChartArea: false,
                  },
                },
              },
            }}
          />
        </ChartErrorBoundary>
      )}
    </div>
  );
}
