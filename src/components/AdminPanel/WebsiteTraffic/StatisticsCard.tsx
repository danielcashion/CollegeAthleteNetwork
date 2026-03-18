"use client";

import React, { useMemo, useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Activity, Download } from "lucide-react";

interface TrafficDataPoint {
  city: string;
  state: string;
  date: string;
  visits: number;
}

interface StatisticsCardProps {
  data: TrafficDataPoint[];
  selectedDates: Set<string>;
}

export default function StatisticsCard({ data, selectedDates }: StatisticsCardProps) {
  const [animatedValues, setAnimatedValues] = useState({
    total: 0,
    average: 0,
    max: 0,
    min: 0,
    mode: 0,
  });

  const statistics = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        total: 0,
        average: 0,
        max: 0,
        min: 0,
        mode: 0,
      };
    }

    // Filter data for selected dates and group by date
    const dailyTotals: Record<string, number> = {};
    
    data.forEach((item) => {
      if (selectedDates.has(item.date)) {
        dailyTotals[item.date] = (dailyTotals[item.date] || 0) + item.visits;
      }
    });

    const values = Object.values(dailyTotals);

    if (values.length === 0) {
      return {
        total: 0,
        average: 0,
        max: 0,
        min: 0,
        mode: 0,
      };
    }

    // Calculate statistics
    const total = values.reduce((sum, val) => sum + val, 0);
    const average = Math.round(total / values.length);
    const max = Math.max(...values);
    const min = Math.min(...values);

    // Calculate mode (most frequent value)
    const frequency: Record<number, number> = {};
    values.forEach((val) => {
      frequency[val] = (frequency[val] || 0) + 1;
    });
    
    const mode = Number(
      Object.entries(frequency).sort((a, b) => b[1] - a[1])[0]?.[0] || 0
    );

    return {
      total,
      average,
      max,
      min,
      mode,
    };
  }, [data, selectedDates]);

  // Animate numbers on load
  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);

      setAnimatedValues({
        total: Math.round(statistics.total * easeOutQuad),
        average: Math.round(statistics.average * easeOutQuad),
        max: Math.round(statistics.max * easeOutQuad),
        min: Math.round(statistics.min * easeOutQuad),
        mode: Math.round(statistics.mode * easeOutQuad),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setAnimatedValues(statistics);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [statistics]);

  const exportStats = () => {
    const csvContent = [
      "Metric,Value",
      `Total,${statistics.total}`,
      `Average,${statistics.average}`,
      `Max,${statistics.max}`,
      `Min,${statistics.min}`,
      `Mode,${statistics.mode}`,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `statistics-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statCards = [
    {
      label: "Total",
      value: animatedValues.total,
      icon: <Activity size={24} className="text-white" />,
      description: "Sum of all daily visits",
      gradient: "from-blue-500 to-blue-600",
      color: "text-blue-600",
    },
    {
      label: "Average",
      value: animatedValues.average,
      icon: <TrendingUp size={24} className="text-white" />,
      description: "Mean visits per day",
      gradient: "from-green-500 to-green-600",
      color: "text-green-600",
    },
    {
      label: "Max",
      value: animatedValues.max,
      icon: <TrendingUp size={24} className="text-white" />,
      description: "Highest daily visits",
      gradient: "from-red-500 to-red-600",
      color: "text-red-600",
    },
    {
      label: "Min",
      value: animatedValues.min,
      icon: <TrendingDown size={24} className="text-white" />,
      description: "Lowest daily visits",
      gradient: "from-purple-500 to-purple-600",
      color: "text-purple-600",
    },
    {
      label: "Mode",
      value: animatedValues.mode,
      icon: <Activity size={24} className="text-white" />,
      description: "Most frequent daily value",
      gradient: "from-amber-500 to-amber-600",
      color: "text-amber-600",
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-gradient-to-b from-[#1C315F] to-[#ED3237] rounded-full"></div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#1C315F] to-[#ED3237] bg-clip-text text-transparent">
            📈 Key Metrics
          </h2>
        </div>
        <button
          onClick={exportStats}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-[#1C315F] hover:text-white transition-all duration-200 font-medium shadow-sm hover:shadow-md"
          title="Export statistics as CSV"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat, index) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-xl border-2 border-gray-100 hover:border-transparent transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
            
            {/* Content */}
            <div className="relative p-5 bg-white group-hover:bg-transparent transition-colors duration-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600 group-hover:text-white transition-colors">
                  {stat.label}
                </span>
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  {stat.icon}
                </div>
              </div>
              <div className={`text-3xl font-extrabold ${stat.color} group-hover:text-white mb-2 transition-colors tabular-nums`}>
                {stat.value.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 group-hover:text-white/90 transition-colors font-medium">
                {stat.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
