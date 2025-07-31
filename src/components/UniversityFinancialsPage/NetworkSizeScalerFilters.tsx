"use client";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { NetworkSizeScaler } from "@/types/UniversityFinancials";
import { Tooltip } from "@mui/material";

interface NetworkSizeScalerFiltersProps {
  filters: NetworkSizeScaler;
  onFiltersChange: (filters: NetworkSizeScaler) => void;
  resultingHeadHunterFee: number;
  resultingContribution: number;
  cashSavingsPerHirePerCompany: number;
  cashSavings: number;
}

export default function NetworkSizeScalers({
  filters,
  onFiltersChange,
  resultingHeadHunterFee,
  resultingContribution,
  cashSavingsPerHirePerCompany,
  cashSavings,
}: NetworkSizeScalerFiltersProps) {
  const handleInputChange = (field: keyof NetworkSizeScaler, value: string) => {
    const parsed = parseFloat(value);
    let clampedValue = isNaN(parsed) ? 0 : parsed;

    // Apply max limits based on field type
    if (field === "networkSizePercentage") {
      clampedValue = Math.min(clampedValue, 400);
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
      newValue = Math.min(newValue, 400);
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
    <div className="w-full bg-white shadow-lg rounded-lg border border-gray-200">
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
      <div className="w-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 bg-white-50">
          <h2 className="text-xl font-bold text-center text-[#1C315F]">
            Athlete Network Financial Model Settings
          </h2>
        </div>

        {/* Content */}
        <div className="flex bg-gray-50 flex-col p-4">
          {/* Settings */}
          <div className="w-full">
            <h3 className="text-2xl font-semibold text-[#1C315F] mb-2">
              Model Details
            </h3>
            <div className="space-y-4 pb-4 border-b border-gray-600">
              {/* Average FTE 1st Year Comp */}
              <div className="">
                <Tooltip
                  title="Average total compensation for Full Time Hires in the network. This is NOT just recent graduates, but includes experienced hires."
                  placement="right"
                  arrow
                  slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: 'offset',
                                options: {
                                  offset: [0, 10], // optional spacing
                                },
                              },
                            ],
                          },
                          tooltip: {
                            sx: {
                              fontSize: '1rem',
                              backgroundColor: 'rgba(28, 49, 95, 0.9)', // 90% opacity
                              color: '#fff',
                            },
                          },
                          arrow: {
                            sx: {
                              color: 'rgba(28, 49, 95, 0.9)', // match arrow background
                            },
                          },
                        }}
                      >
                  <label className="block text-sm font-medium text-gray-700">
                    AVG Hire&apos;s 1st Year Total Comp ($)
                  </label>
                </Tooltip>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative shadow-md">
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
              {/* Job Placement For Each Alum */}
              <div className="">
                <Tooltip
                  title="The AVG tenure of a hire in the network is about 4 years. This results in 25% turnover/year. It is typical to keep 3% in network. Scale up/down based upon the activity of your network."
                  placement="right"
                  arrow
                  slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: 'offset',
                                options: {
                                  offset: [0, 10], // optional spacing
                                },
                              },
                            ],
                          },
                          tooltip: {
                            sx: {
                              fontSize: '1rem',
                              backgroundColor: 'rgba(28, 49, 95, 0.9)', // 90% opacity
                              color: '#fff',
                            },
                          },
                          arrow: {
                            sx: {
                              color: 'rgba(28, 49, 95, 0.9)', // match arrow background
                            },
                          },
                        }}
                >
                  <label className="block text-sm font-medium text-gray-700">
                    Job Placement For Each Alum
                  </label>
                </Tooltip>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative shadow-md">
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
                        const rawValue = e.target.value.replace(/[^0-9]/g, "");
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

              {/* Standard Head Hunter Fee */}
              <div className="">
                <Tooltip
                  title="Standard recruiter fees range between 20% and 35% of the first year total compensation. Lower for large pay packages, higher for lower pay packages."
                  placement="right"
                  arrow
                  slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: 'offset',
                                options: {
                                  offset: [0, 10], // optional spacing
                                },
                              },
                            ],
                          },
                          tooltip: {
                            sx: {
                              fontSize: '1rem',
                              backgroundColor: 'rgba(28, 49, 95, 0.9)', // 90% opacity
                              color: '#fff',
                            },
                          },
                          arrow: {
                            sx: {
                              color: 'rgba(28, 49, 95, 0.9)', // match arrow background
                            },
                          },
                        }}
                >
                  <label className="block text-sm font-medium text-gray-700">
                    Recruiter Fee (% of 1st Year Total Comp)
                  </label>
                </Tooltip>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative shadow-md">
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

              {/* resulting head hunter fee */}
              <div className="p-4 rounded-lg bg-white shadow-lg border border-gray-200 text-center">
                <Tooltip
                  title="This is the fee the head hunter will charge based on the first year total compensation and the standard head hunter fee percentage"
                  placement="right"
                  arrow
                  slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: 'offset',
                                options: {
                                  offset: [0, 10], // optional spacing
                                },
                              },
                            ],
                          },
                          tooltip: {
                            sx: {
                              fontSize: '1rem',
                              backgroundColor: 'rgba(28, 49, 95, 0.9)', // 90% opacity
                              color: '#fff',
                            },
                          },
                          arrow: {
                            sx: {
                              color: 'rgba(28, 49, 95, 0.9)', // match arrow background
                            },
                          },
                        }}
                >
                  <div className="text-md text-gray-600 mb-1">
                    Resulting Head Hunter Fee
                  </div>
                </Tooltip>
                <div className="text-2xl font-bold text-gray-900">
                  ${resultingHeadHunterFee.toLocaleString()}
                </div>
              </div>
            </div>

            <h3 className="text-2xl font-semibold text-[#1C315F] mb-2 mt-2">
              Hiring Company
            </h3>
            <div className="space-y-4 pb-4 border-b border-gray-600">
              {/* Fee Company Willing To Pay */}
              <div className="">
                <Tooltip
                  title="If the company is willing to contribute 50% of what the recruiter would charge, set this to 50%"
                  placement="right"
                  arrow
                 slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: 'offset',
                                options: {
                                  offset: [0, 10], // optional spacing
                                },
                              },
                            ],
                          },
                          tooltip: {
                            sx: {
                              fontSize: '1rem',
                              backgroundColor: 'rgba(28, 49, 95, 0.9)', // 90% opacity
                              color: '#fff',
                            },
                          },
                          arrow: {
                            sx: {
                              color: 'rgba(28, 49, 95, 0.9)', // match arrow background
                            },
                          },
                        }}
                  >
                  <label className="block text-sm font-medium text-gray-700">
                    % of Fee the Company is Willing To Pay
                  </label>
                </Tooltip>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative shadow-md">
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

              {/* Resulting Contribution */}
              <Tooltip
                title="This is the contribution the company will make based on the first year total compensation and the company willing to pay percentage"
                placement="right"
                arrow
                slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: 'offset',
                                options: {
                                  offset: [0, 10], // optional spacing
                                },
                              },
                            ],
                          },
                          tooltip: {
                            sx: {
                              fontSize: '1rem',
                              backgroundColor: 'rgba(28, 49, 95, 0.9)', // 90% opacity
                              color: '#fff',
                            },
                          },
                          arrow: {
                            sx: {
                              color: 'rgba(28, 49, 95, 0.9)', // match arrow background
                            },
                          },
                        }}
                >
                <div className="p-4 rounded-lg bg-white shadow-lg border border-gray-200 text-center">
                  <div className="text-sm text-gray-600 mb-1">
                    Resulting Contribution to Athletic Program
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    ${resultingContribution.toLocaleString()}
                  </div>
                </div>
              </Tooltip>
              {/* Participation Rate */}
              <div className="">
                <Tooltip
                  title="Not all companies will agree to contribute. This is the percentage of companies that you estimate agree to contribute."
                  placement="right"
                  arrow
                slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: 'offset',
                                options: {
                                  offset: [0, 10], // optional spacing
                                },
                              },
                            ],
                          },
                          tooltip: {
                            sx: {
                              fontSize: '1rem',
                              backgroundColor: 'rgba(28, 49, 95, 0.9)', // 90% opacity
                              color: '#fff',
                            },
                          },
                          arrow: {
                            sx: {
                              color: 'rgba(28, 49, 95, 0.9)', // match arrow background
                            },
                          },
                        }}
                  >
                  <label className="block text-sm font-medium text-gray-700">
                    Company Participation Rate
                  </label>
                </Tooltip>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative shadow-md">
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
            </div>

            <Tooltip
              title="Hiring company benefits based on the above settings. Strictly informational."
              placement="right"
              arrow
            slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: 'offset',
                                options: {
                                  offset: [0, 10], // optional spacing
                                },
                              },
                            ],
                          },
                          tooltip: {
                            sx: {
                              fontSize: '1rem',
                              backgroundColor: 'rgba(28, 49, 95, 0.9)', // 90% opacity
                              color: '#fff',
                            },
                          },
                          arrow: {
                            sx: {
                              color: 'rgba(28, 49, 95, 0.9)', // match arrow background
                            },
                          },
                        }}
                >
              <h3 className="text-2xl font-semibold text-[#1C315F] mb-2 mt-2">
                Hiring Company Benefits
              </h3>
            </Tooltip>
            <div className="space-y-4 pb-2 ">
              {/* Cash Savings Per Hire */}
              <div className="p-4 rounded-lg bg-white shadow-lg border border-gray-200 text-center">
                <Tooltip
                  title="Versus paying the recruiters fee"
                  placement="right"
                  arrow
                  slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: 'offset',
                                options: {
                                  offset: [0, 10], // optional spacing
                                },
                              },
                            ],
                          },
                          tooltip: {
                            sx: {
                              fontSize: '1rem',
                              backgroundColor: 'rgba(28, 49, 95, 0.9)', // 90% opacity
                              color: '#fff',
                            },
                          },
                          arrow: {
                            sx: {
                              color: 'rgba(28, 49, 95, 0.9)', // match arrow background
                            },
                          },
                        }}
                >
                  <div className="text-sm text-gray-600 mb-1">
                    Cash Savings Per Hire for Hiring Company
                  </div>
                </Tooltip>
                <div className="text-2xl font-bold text-blue-600">
                  ${cashSavingsPerHirePerCompany.toLocaleString()}
                </div>
              </div>
              {/* Hires Per Year */}
              <div className="">
                <Tooltip
                  title="How many hires the company expects to make per year using this network"
                  placement="right"
                  arrow
                  slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: 'offset',
                                options: {
                                  offset: [0, 10], // optional spacing
                                },
                              },
                            ],
                          },
                          tooltip: {
                            sx: {
                              fontSize: '1rem',
                              backgroundColor: 'rgba(28, 49, 95, 0.9)', // 90% opacity
                              color: '#fff',
                            },
                          },
                          arrow: {
                            sx: {
                              color: 'rgba(28, 49, 95, 0.9)', // match arrow background
                            },
                          },
                        }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Hires Per Year
                    </label>
                  </div>
                </Tooltip>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative shadow-md">
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

              {/* Total Cash Savings */}
              <div className="p-4 rounded-lg bg-white shadow-lg border border-gray-200 text-center">
                <Tooltip
                  title="Annuel cash savings vs paying the recruiters fee"
                  placement="right"
                  arrow
                  slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: 'offset',
                                options: {
                                  offset: [0, 10], // optional spacing
                                },
                              },
                            ],
                          },
                          tooltip: {
                            sx: {
                              fontSize: '1rem',
                              backgroundColor: 'rgba(28, 49, 95, 0.9)', // 90% opacity
                              color: '#fff',
                            },
                          },
                          arrow: {
                            sx: {
                              color: 'rgba(28, 49, 95, 0.9)', // match arrow background
                            },
                          },
                        }}
                >
                  <div className="text-sm text-gray-600 mb-1">
                    Cash Savings From Network Hires
                  </div>
                </Tooltip>

                <div className="text-2xl font-bold text-purple-600">
                  ${cashSavings.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
