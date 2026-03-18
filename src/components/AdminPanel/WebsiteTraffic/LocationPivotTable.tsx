"use client";

import React, { useState, useMemo } from "react";
import { ChevronDown, ChevronRight, Calendar, X, Download } from "lucide-react";

interface TrafficDataPoint {
  city: string;
  state: string;
  date: string;
  visits: number;
}

interface LocationPivotTableProps {
  data: TrafficDataPoint[];
}

interface StateData {
  state: string;
  totalVisits: number;
  cities: Record<string, number>;
}

interface LocationPivotTableProps {
  data: TrafficDataPoint[];
  selectedDates: Set<string>;
  onSelectedDatesChange: (dates: Set<string>) => void;
}

export default function LocationPivotTable({ 
  data,
  selectedDates,
  onSelectedDatesChange
}: LocationPivotTableProps) {
  const [expandedStates, setExpandedStates] = useState<Set<string>>(new Set());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Get unique dates sorted in descending order (most recent first)
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(data.map((item) => item.date)));
    return dates.sort((a, b) => b.localeCompare(a)); // Descending order
  }, [data]);

  // Filter data based on selected dates
  const filteredData = useMemo(() => {
    if (selectedDates.size === 0) return data;
    return data.filter((item) => selectedDates.has(item.date));
  }, [data, selectedDates]);

  const pivotData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];

    // Group by state, then by city
    const stateMap: Record<string, StateData> = {};

    filteredData.forEach((item) => {
      if (!stateMap[item.state]) {
        stateMap[item.state] = {
          state: item.state,
          totalVisits: 0,
          cities: {},
        };
      }

      stateMap[item.state].totalVisits += item.visits;
      stateMap[item.state].cities[item.city] =
        (stateMap[item.state].cities[item.city] || 0) + item.visits;
    });

    // Convert to array and sort by total visits (descending)
    return Object.values(stateMap).sort(
      (a, b) => b.totalVisits - a.totalVisits
    );
  }, [filteredData]);

  const toggleState = (state: string) => {
    setExpandedStates((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(state)) {
        newSet.delete(state);
      } else {
        newSet.add(state);
      }
      return newSet;
    });
  };

  const toggleDate = (date: string) => {
    const newSelectedDates = new Set(selectedDates);
    if (newSelectedDates.has(date)) {
      newSelectedDates.delete(date);
    } else {
      newSelectedDates.add(date);
    }
    onSelectedDatesChange(newSelectedDates);
  };

  const selectAllDates = () => {
    onSelectedDatesChange(new Set(availableDates));
  };

  const clearAllDates = () => {
    onSelectedDatesChange(new Set());
  };

  const totalVisits = useMemo(() => {
    return pivotData.reduce((sum, state) => sum + state.totalVisits, 0);
  }, [pivotData]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const downloadCSV = () => {
    // Create CSV header
    const headers = ["Date", "State", "City", "Visits"];
    
    // Create CSV rows from filtered data
    const rows = filteredData.map((item) => [
      item.date,
      item.state,
      item.city,
      item.visits.toString(),
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `website-traffic-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-[#1C315F] mb-4">
          Visits by Location
        </h2>
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-500 text-lg">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <h2 className="text-xl font-bold text-[#1C315F]">
          Visits by Location
        </h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          {/* Download CSV Button */}
          <button
            onClick={downloadCSV}
            disabled={filteredData.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#ED3237] text-white rounded-lg hover:bg-[#1C315F] transition font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download filtered data as CSV"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Download Data</span>
            <span className="sm:hidden">CSV</span>
          </button>

          {/* Date Filter Button */}
          <div className="relative flex-1 sm:flex-none">
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1C315F] text-white rounded-lg hover:bg-[#ED3237] transition font-medium shadow-md w-full sm:w-auto justify-center"
            >
              <Calendar size={18} />
              <span>
                Filter Dates ({selectedDates.size}/{availableDates.length})
              </span>
              <ChevronDown
                size={16}
                className={`transition-transform ${
                  showDatePicker ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Date Picker Dropdown */}
            {showDatePicker && (
              <div className="absolute top-full mt-2 right-0 bg-white border border-gray-300 rounded-lg shadow-xl z-50 w-80 max-h-96 overflow-hidden">
                <div className="sticky top-0 bg-gradient-to-r from-[#1C315F] to-[#ED3237] text-white p-3 flex items-center justify-between">
                  <span className="font-semibold">Select Dates</span>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="hover:bg-white/20 rounded p-1 transition"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Select All / Clear All */}
                <div className="p-3 border-b border-gray-200 flex gap-2">
                  <button
                    onClick={selectAllDates}
                    className="flex-1 px-3 py-1.5 text-sm bg-[#1C315F] text-white rounded hover:bg-[#ED3237] transition font-medium"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearAllDates}
                    className="flex-1 px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition font-medium"
                  >
                    Clear All
                  </button>
                </div>

                {/* Date Checkboxes */}
                <div className="overflow-y-auto max-h-64">
                  {availableDates.map((date) => {
                    const isSelected = selectedDates.has(date);
                    return (
                      <label
                        key={date}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 cursor-pointer transition border-b border-gray-100 last:border-0"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleDate(date)}
                          className="w-4 h-4 text-[#1C315F] border-gray-300 rounded focus:ring-[#ED3237] cursor-pointer"
                        />
                        <span
                          className={`flex-1 ${
                            isSelected
                              ? "text-[#1C315F] font-medium"
                              : "text-gray-600"
                          }`}
                        >
                          {formatDate(date)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-600 whitespace-nowrap">
            Total Visits:{" "}
            <span className="font-semibold text-[#1C315F]">
              {totalVisits.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Selected Dates Summary */}
      {selectedDates.size > 0 && selectedDates.size < availableDates.length && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#1C315F]">
              <span className="font-semibold">Filtered:</span> Showing data for{" "}
              {selectedDates.size} of {availableDates.length} dates
            </p>
            <button
              onClick={selectAllDates}
              className="text-sm text-[#ED3237] hover:underline font-medium"
            >
              Show All
            </button>
          </div>
        </div>
      )}

      {pivotData.length === 0 ? (
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <p className="text-gray-600 text-lg font-medium">
              No data for selected dates
            </p>
            <button
              onClick={selectAllDates}
              className="mt-3 px-4 py-2 bg-[#1C315F] text-white rounded-lg hover:bg-[#ED3237] transition font-medium"
            >
              Select All Dates
            </button>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-[#1C315F] to-[#ED3237] text-white">
                <th className="text-left px-4 py-3 font-semibold">Location</th>
                <th className="text-right px-4 py-3 font-semibold">Visits</th>
                <th className="text-right px-4 py-3 font-semibold">
                  % of Total
                </th>
              </tr>
            </thead>
            <tbody>
              {pivotData.map((stateData, index) => {
                const isExpanded = expandedStates.has(stateData.state);
                const citiesArray = Object.entries(stateData.cities).sort(
                  ([, a], [, b]) => b - a
                );
                const percentOfTotal = (
                  (stateData.totalVisits / totalVisits) *
                  100
                ).toFixed(1);

                return (
                  <React.Fragment key={stateData.state}>
                    {/* State Row */}
                    <tr
                      className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                      onClick={() => toggleState(stateData.state)}
                    >
                      <td className="px-4 py-3 font-semibold text-[#1C315F]">
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown size={18} className="text-[#ED3237]" />
                          ) : (
                            <ChevronRight
                              size={18}
                              className="text-[#1C315F]"
                            />
                          )}
                          <span>{stateData.state}</span>
                          <span className="text-xs text-gray-500 font-normal">
                            ({citiesArray.length}{" "}
                            {citiesArray.length === 1 ? "city" : "cities"})
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#1C315F]">
                        {stateData.totalVisits.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-600">
                        {percentOfTotal}%
                      </td>
                    </tr>

                    {/* City Rows (when expanded) */}
                    {isExpanded &&
                      citiesArray.map(([city, visits]) => {
                        const cityPercent = ((visits / totalVisits) * 100).toFixed(
                          1
                        );
                        return (
                          <tr
                            key={`${stateData.state}-${city}`}
                            className="border-b border-gray-100 bg-gray-50 hover:bg-blue-50 transition"
                          >
                            <td className="px-4 py-2 pl-12 text-gray-700">
                              <span className="text-sm">└ {city}</span>
                            </td>
                            <td className="px-4 py-2 text-right text-gray-700 text-sm">
                              {visits.toLocaleString()}
                            </td>
                            <td className="px-4 py-2 text-right text-gray-500 text-sm">
                              {cityPercent}%
                            </td>
                          </tr>
                        );
                      })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 text-xs text-gray-500 text-center">
        Click on a state to expand/collapse city details
      </div>
    </div>
  );
}
