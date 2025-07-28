"use client";
import { Plus, Minus } from "lucide-react";
import type { NetworkSizeScaler } from "@/types/UniversityFinancials";

interface NetworkSizeScalerFiltersProps {
  filters: NetworkSizeScaler;
  onFiltersChange: (filters: NetworkSizeScaler) => void;
  resultingHeadHunterFee: number;
  resultingContribution: number;
  cashSavingsPerHirePerCompany: number;
  cashSavings: number;
}

export default function NetworkSizeScalerFilters({
  filters,
  onFiltersChange,
  resultingHeadHunterFee,
  resultingContribution,
  cashSavingsPerHirePerCompany,
  cashSavings,
}: NetworkSizeScalerFiltersProps) {
  const handleInputChange = (field: keyof NetworkSizeScaler, value: string) => {
    const numValue = Number.parseFloat(value) || 0;
    onFiltersChange({
      ...filters,
      [field]: numValue,
    });
  };

  const handleIncrement = (
    field: keyof NetworkSizeScaler,
    step: number,
    max?: number
  ) => {
    const currentValue = filters[field];
    const newValue = currentValue + step;
    if (max && newValue > max) return;
    onFiltersChange({
      ...filters,
      [field]: newValue,
    });
  };

  const handleDecrement = (
    field: keyof NetworkSizeScaler,
    step: number,
    min = 0
  ) => {
    const currentValue = filters[field];
    const newValue = Math.max(min, currentValue - step);
    onFiltersChange({
      ...filters,
      [field]: newValue,
    });
  };

  const SliderWithInput = ({
    label,
    field,
    min,
    max,
    step,
    unit = "%",
  }: {
    label: string;
    field: keyof NetworkSizeScaler;
    min: number;
    max: number;
    step: number;
    unit?: string;
  }) => (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="space-y-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={filters[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleDecrement(field, step, min)}
            className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <Minus size={16} />
          </button>
          <div className="flex items-center gap-1 min-w-0 flex-1">
            <input
              type="number"
              min={min}
              max={max}
              step={step}
              value={filters[field]}
              onChange={(e) => handleInputChange(field, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
            />
            <span className="text-sm text-gray-500 min-w-fit">{unit}</span>
          </div>
          <button
            type="button"
            onClick={() => handleIncrement(field, step, max)}
            className="p-1 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>
    </div>
  );

  const InputWithButtons = ({
    label,
    field,
    step,
    unit = "",
    min = 0,
  }: {
    label: string;
    field: keyof NetworkSizeScaler;
    step: number;
    unit?: string;
    min?: number;
  }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleDecrement(field, step, min)}
          className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <Minus size={16} />
        </button>
        <div className="flex items-center gap-1 flex-1">
          <input
            type="number"
            min={min}
            step={step}
            value={filters[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
          />
          {unit && (
            <span className="text-sm text-gray-500 min-w-fit">{unit}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => handleIncrement(field, step)}
          className="p-2 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Main Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Network Size Percentage - Slider */}
        <SliderWithInput
          label="Network Size Percentage"
          field="networkSizePercentage"
          min={0}
          max={250}
          step={5}
          unit="%"
        />

        {/* Job Placement Per Alum Percentage - Slider */}
        <SliderWithInput
          label="Job Placement For Each Alum"
          field="jobPlacementPerAlumPercentage"
          min={0}
          max={100}
          step={5}
          unit="%"
        />

        {/* Standard Head Hunter Fee Percentage - Slider */}
        <SliderWithInput
          label="Standard Head Hunter Fee"
          field="standardHeadHunterFeePercentage"
          min={0}
          max={100}
          step={5}
          unit="%"
        />

        {/* Company Willing To Pay Percentage - Slider */}
        <SliderWithInput
          label="Fee Company Willing To Pay"
          field="companyWillingToPayPercentage"
          min={0}
          max={100}
          step={5}
          unit="%"
        />

        {/* Participation Rate - Slider */}
        <SliderWithInput
          label="Participation Rate"
          field="participationRate"
          min={0}
          max={100}
          step={5}
          unit="%"
        />

        {/* Average FTE - Input Only */}
        <InputWithButtons
          label="Average FTE 1st Year Comp"
          field="avgFte"
          step={10000}
          unit="$"
          min={0}
        />

        {/* Hires Per Year - Input Only */}
        <InputWithButtons
          label="Hires Per Year"
          field="hiresPerYear"
          step={1}
          min={0}
        />
      </div>

      {/* Summary Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          Calculated Financial Metrics
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">
              Resulting Head Hunter Fee
            </div>
            <div className="text-xl font-bold text-gray-900">
              ${resultingHeadHunterFee.toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">
              Resulting Contribution
            </div>
            <div className="text-xl font-bold text-green-600">
              ${resultingContribution.toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">
              Cash Savings Per Hire
            </div>
            <div className="text-xl font-bold text-blue-600">
              ${cashSavingsPerHirePerCompany.toLocaleString()}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">Total Cash Savings</div>
            <div className="text-xl font-bold text-purple-600">
              ${cashSavings.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider::-webkit-slider-track {
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(
            to right,
            #3b82f6 0%,
            #3b82f6 var(--value),
            #e5e7eb var(--value),
            #e5e7eb 100%
          );
        }

        .slider::-moz-range-track {
          height: 8px;
          border-radius: 4px;
          background: #e5e7eb;
        }
      `}</style>
    </div>
  );
}
