"use client";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import type { NetworkSizeScaler } from "@/types/UniversityFinancials";
import { Tooltip } from "@mui/material";

interface NetworkSizeScalerFiltersProps {
  filters: NetworkSizeScaler;
  onFiltersChange: (filters: NetworkSizeScaler) => void;
  resultingHeadHunterFee: number;
  resultingContribution: number;
  cashSavingsPerHirePerCompany: number;
  cashSavings: number;
  onClose: () => void;
  onReset: () => void;
}

export default function NetworkSizeScalers({
  filters,
  onFiltersChange,
  resultingHeadHunterFee,
  resultingContribution,
  cashSavingsPerHirePerCompany,
  cashSavings,
  onClose,
  onReset,
}: NetworkSizeScalerFiltersProps) {
  const handleInputChange = (field: keyof NetworkSizeScaler, value: string) => {
    const parsed = parseFloat(value);
    let clampedValue = isNaN(parsed) ? 0 : parsed;

    // Apply max limits based on field type
    if (field === "networkSizePercentage") {
      clampedValue = Math.min(clampedValue, 250);
    } else if (field.includes("Percentage") || field === "participationRate") {
      clampedValue = Math.min(clampedValue, 100);
    }

    // Apply minimum of 0 for all fields
    clampedValue = Math.max(clampedValue, 0);

    onFiltersChange({
      ...filters,
      [field]: clampedValue,
    });
  };

  const handleIncrement = (field: keyof NetworkSizeScaler, step: number) => {
    const currentValue = filters[field];
    let newValue = currentValue + step;

    // Apply max limits based on field type
    if (field === "networkSizePercentage") {
      newValue = Math.min(newValue, 250);
    } else if (field.includes("Percentage") || field === "participationRate") {
      newValue = Math.min(newValue, 100);
    }

    onFiltersChange({
      ...filters,
      [field]: newValue,
    });
  };

  const handleDecrement = (field: keyof NetworkSizeScaler, step: number) => {
    const currentValue = filters[field];
    const newValue = Math.max(0, currentValue - step);
    onFiltersChange({
      ...filters,
      [field]: newValue,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <style jsx>{`
        input[type="number"]::-webkit-outer-spin-button,
        input[type="number"]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
      <div className="bg-white rounded-xl w-full max-w-sm sm:max-w-2xl lg:max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-3 sm:p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-800">
            Athlete Network Size Adjustment Wizard
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-gray-200 min-w-[32px] min-h-[32px] flex items-center justify-center"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Financial Metrics - Top on mobile, Left on desktop */}
          <div className="w-full lg:w-1/3 p-3 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b lg:border-b-0 lg:border-r border-gray-200 flex-shrink-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-6 flex items-center gap-2">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>
              Financial Metrics
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 sm:gap-4">
              <div className="bg-white p-3 sm:p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                  Resulting Head Hunter Fee
                </div>
                <div className="text-lg sm:text-2xl font-bold text-gray-900">
                  ${resultingHeadHunterFee.toLocaleString()}
                </div>
              </div>
              <div className="bg-white p-3 sm:p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                  Resulting Contribution
                </div>
                <div className="text-lg sm:text-2xl font-bold text-green-600">
                  ${resultingContribution.toLocaleString()}
                </div>
              </div>
              <div className="bg-white p-3 sm:p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                  Cash Savings Per Hire
                </div>
                <div className="text-lg sm:text-2xl font-bold text-blue-600">
                  ${cashSavingsPerHirePerCompany.toLocaleString()}
                </div>
              </div>
              <div className="bg-white p-3 sm:p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                  Total Cash Savings
                </div>
                <div className="text-lg sm:text-2xl font-bold text-purple-600">
                  ${cashSavings.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Filter Settings */}
          <div className="flex-1 p-3 sm:p-6 overflow-y-auto md:overflow-y-auto">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-6">
              Model Settings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
              {/* Average FTE 1st Year Comp */}
              <div className="space-y-2">
                <Tooltip
                  title="Average first year total compensation for Full Time Employees (FTEs) in the network"
                  placement="top"
                >
                  <label className="block text-sm font-medium text-gray-700">
                    Average Hire&apos;s 1st Year Total Comp ($)
                  </label>
                </Tooltip>

                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={
                        filters.avgFte !== null && filters.avgFte !== undefined
                          ? `$${Number(filters.avgFte).toLocaleString("en-US")}`
                          : ""
                      }
                      onChange={(e) => {
                        // Remove non-numeric characters ($, commas) and convert to number
                        const rawValue = e.target.value.replace(/[^0-9]/g, "");
                        const numValue = rawValue ? Number(rawValue) : "";
                        handleInputChange(
                          "avgFte",
                          numValue === "" ? "" : String(numValue)
                        );
                      }}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center bg-white text-sm sm:text-base"
                      placeholder="$0"
                    />
                  </div>
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => handleIncrement("avgFte", 10000)}
                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors min-w-[28px] min-h-[20px] flex items-center justify-center"
                    >
                      <ChevronUp size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecrement("avgFte", 10000)}
                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors min-w-[28px] min-h-[20px] flex items-center justify-center"
                    >
                      <ChevronDown size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Standard Head Hunter Fee */}
              <div className="space-y-2">
                <Tooltip
                  title="Standard recruiter fees range between 20% and 35% of the first year total compensation. Lower for large pay packages, higher for lower pay packages."
                  placement="top"
                >
                  <label className="block text-sm font-medium text-gray-700">
                    Recruiter Fee (% of 1st Year Total Comp)
                  </label>
                </Tooltip>

                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={
                        filters.standardHeadHunterFeePercentage !== null &&
                        filters.standardHeadHunterFeePercentage !== undefined
                          ? `${Number(
                              filters.standardHeadHunterFeePercentage
                            ).toLocaleString("en-US")}%`
                          : ""
                      }
                      onChange={(e) => {
                        // Remove non-numeric characters (%, commas) and convert to number
                        const rawValue = e.target.value.replace(/[^0-9]/g, "");
                        const numValue = rawValue ? Number(rawValue) : "";
                        handleInputChange(
                          "standardHeadHunterFeePercentage",
                          numValue === "" ? "" : String(numValue)
                        );
                      }}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center bg-white text-sm sm:text-base"
                      placeholder="0%"
                    />
                  </div>
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() =>
                        handleIncrement("standardHeadHunterFeePercentage", 1)
                      }
                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors min-w-[28px] min-h-[20px] flex items-center justify-center"
                    >
                      <ChevronUp size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDecrement("standardHeadHunterFeePercentage", 1)
                      }
                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors min-w-[28px] min-h-[20px] flex items-center justify-center"
                    >
                      <ChevronDown size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Fee Company Willing To Pay */}
              <div className="space-y-2">
                <Tooltip
                  title="If the company is willing to contribute 50% of what the recruiter would charge, set this to 50%"
                  placement="top"
                >
                  <label className="block text-sm font-medium text-gray-700">
                    % of Fee the Company is Willing To Pay
                  </label>
                </Tooltip>

                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={
                        filters.companyWillingToPayPercentage !== null &&
                        filters.companyWillingToPayPercentage !== undefined
                          ? `${Number(
                              filters.companyWillingToPayPercentage
                            ).toLocaleString("en-US")}%`
                          : ""
                      }
                      onChange={(e) => {
                        // Remove non-numeric characters (%, commas) and convert to number
                        const rawValue = e.target.value.replace(/[^0-9]/g, "");
                        const numValue = rawValue ? Number(rawValue) : "";
                        handleInputChange(
                          "companyWillingToPayPercentage",
                          numValue === "" ? "" : String(numValue)
                        );
                      }}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center bg-white text-sm sm:text-base"
                      placeholder="0%"
                    />
                  </div>
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() =>
                        handleIncrement("companyWillingToPayPercentage", 5)
                      }
                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors min-w-[28px] min-h-[20px] flex items-center justify-center"
                    >
                      <ChevronUp size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDecrement("companyWillingToPayPercentage", 5)
                      }
                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors min-w-[28px] min-h-[20px] flex items-center justify-center"
                    >
                      <ChevronDown size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Participation Rate */}
              <div className="space-y-2">
                <Tooltip
                  title="Adjusts if not all companies agree to contribute for each hire"
                  placement="top"
                >
                  <label className="block text-sm font-medium text-gray-700">
                    Company Participation Rate
                  </label>
                </Tooltip>

                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={
                        filters.participationRate !== null &&
                        filters.participationRate !== undefined
                          ? `${Number(filters.participationRate).toLocaleString(
                              "en-US"
                            )}%`
                          : ""
                      }
                      onChange={(e) => {
                        // Remove non-numeric characters (%, commas) and convert to number
                        const rawValue = e.target.value.replace(/[^0-9]/g, "");
                        const numValue = rawValue ? Number(rawValue) : "";
                        handleInputChange(
                          "participationRate",
                          numValue === "" ? "" : String(numValue)
                        );
                      }}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center bg-white text-sm sm:text-base"
                      placeholder="0%"
                    />
                  </div>
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => handleIncrement("participationRate", 5)}
                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors min-w-[28px] min-h-[20px] flex items-center justify-center"
                    >
                      <ChevronUp size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecrement("participationRate", 5)}
                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors min-w-[28px] min-h-[20px] flex items-center justify-center"
                    >
                      <ChevronDown size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Job Placement For Each Alum */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Job Placement For Each Alum
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={
                          filters.jobPlacementPerAlumPercentage !== null &&
                          filters.jobPlacementPerAlumPercentage !== undefined
                            ? `${Number(
                                filters.jobPlacementPerAlumPercentage
                              ).toLocaleString("en-US")}%`
                            : ""
                        }
                        onChange={(e) => {
                          // Remove non-numeric characters (%, commas) and convert to number
                          const rawValue = e.target.value.replace(
                            /[^0-9]/g,
                            ""
                          );
                          const numValue = rawValue ? Number(rawValue) : "";
                          handleInputChange(
                            "jobPlacementPerAlumPercentage",
                            numValue === "" ? "" : String(numValue)
                          );
                        }}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center bg-white text-sm sm:text-base"
                        placeholder="0%"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() =>
                        handleIncrement("jobPlacementPerAlumPercentage", 1)
                      }
                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors min-w-[28px] min-h-[20px] flex items-center justify-center"
                    >
                      <ChevronUp size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDecrement("jobPlacementPerAlumPercentage", 1)
                      }
                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors min-w-[28px] min-h-[20px] flex items-center justify-center"
                    >
                      <ChevronDown size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Hires Per Year */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Hires Per Year
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={filters.hiresPerYear || ""}
                      onChange={(e) =>
                        handleInputChange("hiresPerYear", e.target.value)
                      }
                      className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center bg-white text-sm sm:text-base"
                    />
                  </div>
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => handleIncrement("hiresPerYear", 1)}
                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors min-w-[28px] min-h-[20px] flex items-center justify-center"
                    >
                      <ChevronUp size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDecrement("hiresPerYear", 1)}
                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors min-w-[28px] min-h-[20px] flex items-center justify-center"
                    >
                      <ChevronDown size={14} className="sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 p-3 sm:p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex gap-2 sm:gap-3 order-2 sm:order-1">
            <button
              onClick={onReset}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium text-sm sm:text-base"
            >
              Reset Values
            </button>
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
            >
              Close
            </button>
          </div>

          <button
            onClick={onClose}
            className="order-1 sm:order-2 px-4 sm:px-6 py-2 bg-gradient-to-r text-center from-[#1C315F] to-[#ED3237] text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
