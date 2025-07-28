import React from "react";
import { NetworkSizeScaler } from "@/types/UniversityFinancials";

interface NetworkSizeScalerFiltersProps {
  filters: NetworkSizeScaler;
  onFiltersChange: (filters: NetworkSizeScaler) => void;
}

export default function NetworkSizeScalerFilters({
  filters,
  onFiltersChange,
}: NetworkSizeScalerFiltersProps) {
  const handleInputChange = (field: keyof NetworkSizeScaler, value: string) => {
    const numValue = parseFloat(value) || 0;
    onFiltersChange({
      ...filters,
      [field]: numValue,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        Network Size Scaler Settings
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Network Size Percentage */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Network Size Percentage (%)
          </label>
          <input
            type="number"
            min="0"
            max="200"
            step="1"
            value={filters.networkSizePercentage}
            onChange={(e) =>
              handleInputChange("networkSizePercentage", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Job Placement Per Alum Percentage */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Job Placement Per Alum (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={filters.jobPlacementPerAlumPercentage}
            onChange={(e) =>
              handleInputChange("jobPlacementPerAlumPercentage", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Average FTE */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Average FTE ($)
          </label>
          <input
            type="number"
            min="0"
            step="1000"
            value={filters.avgFte}
            onChange={(e) => handleInputChange("avgFte", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Standard Head Hunter Fee Percentage */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Standard Head Hunter Fee (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={filters.standardHeadHunterFeePercentage}
            onChange={(e) =>
              handleInputChange(
                "standardHeadHunterFeePercentage",
                e.target.value
              )
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Company Willing To Pay Percentage */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Company Willing To Pay (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={filters.companyWillingToPayPercentage}
            onChange={(e) =>
              handleInputChange("companyWillingToPayPercentage", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Participation Rate */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Participation Rate (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={filters.participationRate}
            onChange={(e) =>
              handleInputChange("participationRate", e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Hires Per Year */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Hires Per Year
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={filters.hiresPerYear}
            onChange={(e) => handleInputChange("hiresPerYear", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Section */}
      <div className="mt-6 p-4 bg-gray-50 rounded-md">
        <h4 className="text-sm font-medium text-gray-700 mb-2">
          Calculated Values:
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Resulting Head Hunter Fee: </span>
            <span className="font-medium">
              $
              {(
                (filters.avgFte * filters.standardHeadHunterFeePercentage) /
                100
              ).toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Resulting Contribution: </span>
            <span className="font-medium">
              $
              {(
                (((filters.avgFte * filters.standardHeadHunterFeePercentage) /
                  100) *
                  filters.companyWillingToPayPercentage) /
                100
              ).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
