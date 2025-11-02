"use client";
import React from "react";

export interface ChartDisplayOptions {
  showDailyOpens: boolean;
  showDailyClicks: boolean;
  showCumulativeOpens: boolean;
  showCumulativeClicks: boolean;
}

interface ChartControlsProps {
  options: ChartDisplayOptions;
  onOptionsChangeAction: (options: ChartDisplayOptions) => void;
}

export default function ChartControls({
  options,
  onOptionsChangeAction,
}: ChartControlsProps) {
  const handleCheckboxChange = (
    key: keyof ChartDisplayOptions,
    checked: boolean
  ) => {
    onOptionsChangeAction({
      ...options,
      [key]: checked,
    });
  };

  const controls = [
    { key: "showDailyOpens" as const, label: "Daily Opens" },
    { key: "showDailyClicks" as const, label: "Daily Clicks" },
    { key: "showCumulativeOpens" as const, label: "Cumulative Opens" },
    { key: "showCumulativeClicks" as const, label: "Cumulative Clicks" },
  ];

  return (
    <div className="bg-white p-4 rounded shadow mb-4">
      <h4 className="text-sm font-semibold text-primary mb-3">
        Campaign Engagement By Day
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {controls.map((control) => (
          <label
            key={control.key}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={options[control.key]}
              onChange={(e) =>
                handleCheckboxChange(control.key, e.target.checked)
              }
              className="appearance-none bg-white shrink-0 w-5 h-5 border border-primary rounded cursor-pointer checked:bg-primary checked:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none"
            />
            <span className="text-sm text-gray-700">{control.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
