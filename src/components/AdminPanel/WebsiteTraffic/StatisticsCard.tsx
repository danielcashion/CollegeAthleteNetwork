"use client";

import React, { useMemo } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

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

  const statCards = [
    {
      label: "Total",
      value: statistics.total,
      icon: <Activity size={24} className="text-[#1C315F]" />,
      description: "Sum of all daily visits",
    },
    {
      label: "Average",
      value: statistics.average,
      icon: <TrendingUp size={24} className="text-[#1C315F]" />,
      description: "Mean visits per day",
    },
    {
      label: "Max",
      value: statistics.max,
      icon: <TrendingUp size={24} className="text-[#ED3237]" />,
      description: "Highest daily visits",
    },
    {
      label: "Min",
      value: statistics.min,
      icon: <TrendingDown size={24} className="text-[#1C315F]" />,
      description: "Lowest daily visits",
    },
    {
      label: "Mode",
      value: statistics.mode,
      icon: <Activity size={24} className="text-[#1C315F]" />,
      description: "Most frequent daily value",
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-bold text-[#1C315F] mb-4">Statistics</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                {stat.label}
              </span>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-[#1C315F] mb-1">
              {stat.value.toLocaleString()}
            </div>
            <div className="text-xs text-gray-500">{stat.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
