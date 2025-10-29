"use client";
import React, { useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
  type ChartData,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import toast from "react-hot-toast";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Props = { values: number[]; labels?: string[] };

export default function FunnelChart({ values, labels }: Props) {
  const data: ChartData<"bar"> = {
    labels: labels ?? values.map((_, i) => `Step ${i + 1}`),
    datasets: [
      {
        label: "Count",
        data: values,
        backgroundColor: ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"].slice(
          0,
          values.length
        ),
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
    scales: {
      x: { beginAtZero: true },
    },
    animation: {
      duration: 700,
      easing: "easeOutCubic",
    },
  };
  const ref = useRef<any>(null);

  const handleClick = (event: any, elements: any[]) => {
    if (elements && elements.length > 0) {
      const el = elements[0];
      const idx = el.index;
      const label = (data.labels as string[])[idx];
      const val = (data.datasets[0].data as number[])[idx];
      toast(`${label}: ${val.toLocaleString()}`);
    }
  };

  const enhancedOptions: ChartOptions<"bar"> = {
    ...options,
    onHover: (event: any, elements: any[]) => {
      try {
        const target = event.native?.target as HTMLElement | undefined;
        if (target)
          target.style.cursor =
            elements && elements.length ? "pointer" : "default";
      } catch (e) {}
    },
    onClick: (event: any, elements: any[]) => handleClick(event, elements),
  };

  return (
    <div className="h-full">
      <Bar ref={ref} data={data} options={enhancedOptions} />
    </div>
  );
}
