"use client";

import { useState, useEffect } from "react";
import DailyVisitorsChart from "@/components/AdminPanel/WebsiteTraffic/DailyVisitorsChart";
import StatisticsCard from "@/components/AdminPanel/WebsiteTraffic/StatisticsCard";
import LocationPivotTable from "@/components/AdminPanel/WebsiteTraffic/LocationPivotTable";
import { RefreshCw, Calendar } from "lucide-react";

interface TrafficDataPoint {
  city: string;
  state: string;
  date: string;
  visits: number;
}

export default function WebsiteTrafficPage() {
  const [trafficData, setTrafficData] = useState<TrafficDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [daysLookback, setDaysLookback] = useState(14);
  
  // Shared state for cross-filtering between chart and table
  const [selectedDates, setSelectedDates] = useState<Set<string>>(new Set());
  const [excludeHighVisitDates, setExcludeHighVisitDates] = useState(false);

  const fetchTrafficData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.tourneymaster.org/publicprod/nightly_reporting?task=daily_CAN_user_locations&days_lookback=${daysLookback}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data = await response.json();

      // The API returns nested arrays: [[{...}]]
      // Extract the first element which contains the actual data array
      let flattenedData: TrafficDataPoint[] = [];
      
      if (Array.isArray(data) && data.length > 0) {
        // Check if data[0] is an array
        if (Array.isArray(data[0])) {
          flattenedData = data[0];
        } else {
          // If data itself is the array of objects
          flattenedData = data;
        }
      }

      console.log("Traffic data loaded:", flattenedData.length, "records");
      setTrafficData(flattenedData);
      setLastUpdated(new Date());
      
      // Initialize selectedDates with all unique dates
      const uniqueDates = Array.from(new Set(flattenedData.map(item => item.date)));
      setSelectedDates(new Set(uniqueDates));
    } catch (err) {
      console.error("Failed to fetch traffic data:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrafficData();
  }, [daysLookback]);

  const handleRefresh = () => {
    fetchTrafficData();
  };

  // Calculate daily totals to identify dates with >5000 visits
  const dailyTotals = trafficData.reduce((acc, item) => {
    acc[item.date] = (acc[item.date] || 0) + item.visits;
    return acc;
  }, {} as Record<string, number>);

  // Get dates that exceed 5000 visits
  const highVisitDates = Object.entries(dailyTotals)
    .filter(([, visits]) => visits > 5000)
    .map(([date]) => date);

  // Filter data based on exclude checkbox
  const filteredTrafficData = excludeHighVisitDates
    ? trafficData.filter((item) => {
        const dailyTotal = dailyTotals[item.date] || 0;
        return dailyTotal <= 5000;
      })
    : trafficData;

  // Adjust selected dates when checkbox changes
  useEffect(() => {
    if (excludeHighVisitDates) {
      setSelectedDates((prev) => {
        const newSet = new Set(prev);
        highVisitDates.forEach((date) => newSet.delete(date));
        return newSet;
      });
    }
  }, [excludeHighVisitDates]);

  const totalVisits = filteredTrafficData.reduce(
    (sum, item) => sum + item.visits,
    0
  );
  const uniqueDates = new Set(trafficData.map((item) => item.date)).size;
  const uniqueLocations = new Set(
    trafficData.map((item) => `${item.city}, ${item.state}`)
  ).size;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#1C315F] mb-2">
                Website Traffic Analytics
              </h1>
              <p className="text-gray-600">
                Monitor visitor traffic and geographic distribution
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Days Lookback Selector */}
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-[#1C315F]" />
                <select
                  value={daysLookback}
                  onChange={(e) => setDaysLookback(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-[#1C315F] font-medium focus:ring-2 focus:ring-[#ED3237] focus:border-transparent"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={14}>Last 14 days</option>
                  <option value={30}>Last 30 days</option>
                  <option value={60}>Last 60 days</option>
                  <option value={90}>Last 90 days</option>
                </select>
              </div>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-[#1C315F] text-white rounded-lg hover:bg-[#ED3237] transition disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md"
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
            </div>
          </div>

          {/* Last Updated */}
          {lastUpdated && !loading && (
            <div className="mt-2 text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleString()}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Total Visits
                  </p>
                  <p className="text-3xl font-bold text-[#1C315F] mt-1">
                    {totalVisits.toLocaleString()}
                  </p>
                </div>
                <div className="bg-[#1C315F]/10 p-3 rounded-full">
                  <svg
                    className="w-8 h-8 text-[#1C315F]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Days Tracked
                  </p>
                  <p className="text-3xl font-bold text-[#1C315F] mt-1">
                    {uniqueDates}
                  </p>
                </div>
                <div className="bg-[#ED3237]/10 p-3 rounded-full">
                  <Calendar className="w-8 h-8 text-[#ED3237]" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">
                    Unique Locations
                  </p>
                  <p className="text-3xl font-bold text-[#1C315F] mt-1">
                    {uniqueLocations.toLocaleString()}
                  </p>
                </div>
                <div className="bg-[#1C315F]/10 p-3 rounded-full">
                  <svg
                    className="w-8 h-8 text-[#1C315F]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="text-center">
              <RefreshCw
                size={48}
                className="animate-spin text-[#1C315F] mx-auto mb-4"
              />
              <p className="text-lg text-gray-600 font-medium">
                Loading traffic data...
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-red-800 font-semibold">
                  Failed to load traffic data
                </p>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Charts and Table */}
        {!loading && !error && trafficData.length > 0 && (
          <>
            {/* Exclude High Visit Dates Checkbox */}
            <div className="mb-4 bg-white rounded-lg shadow-md p-4 border border-gray-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={excludeHighVisitDates}
                  onChange={(e) => setExcludeHighVisitDates(e.target.checked)}
                  className="w-5 h-5 text-[#1C315F] border-gray-300 rounded focus:ring-[#ED3237] cursor-pointer"
                />
                <div className="flex-1">
                  <span className="text-[#1C315F] font-semibold">
                    Exclude dates with &gt;5,000 visits
                  </span>
                  {highVisitDates.length > 0 && (
                    <span className="ml-2 text-sm text-gray-600">
                      ({highVisitDates.length} {highVisitDates.length === 1 ? 'date' : 'dates'} affected)
                    </span>
                  )}
                </div>
              </label>
              {excludeHighVisitDates && highVisitDates.length > 0 && (
                <div className="mt-2 text-sm text-gray-600 pl-8">
                  Excluded dates: {highVisitDates.map(date => {
                    const d = new Date(date);
                    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  }).join(", ")}
                </div>
              )}
            </div>

            {/* Daily Visitors Chart */}
            <div className="mb-6">
              <DailyVisitorsChart 
                key={excludeHighVisitDates ? 'filtered' : 'unfiltered'}
                data={filteredTrafficData} 
                selectedDates={selectedDates}
                onDateClick={setSelectedDates}
              />
            </div>

            {/* Statistics Card */}
            <div className="mb-6">
              <StatisticsCard 
                data={filteredTrafficData}
                selectedDates={selectedDates}
              />
            </div>

            {/* Location Pivot Table */}
            <div>
              <LocationPivotTable 
                data={filteredTrafficData}
                selectedDates={selectedDates}
                onSelectedDatesChange={setSelectedDates}
              />
            </div>
          </>
        )}

        {/* No Data State */}
        {!loading && !error && trafficData.length === 0 && (
          <div className="flex items-center justify-center h-96 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-lg text-gray-600 font-medium">
                No traffic data available
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Try selecting a different time range
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
