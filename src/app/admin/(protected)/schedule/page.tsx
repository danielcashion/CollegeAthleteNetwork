"use client";
import React, { useState, useEffect, useMemo } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Calendar, Clock, Send, AlertCircle } from "lucide-react";
import ScheduleCalendar from "@/components/SchedulePage/ScheduleCalendar";
import ScheduleTable from "@/components/SchedulePage/ScheduleTable";
import dayjs from "dayjs";

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/campaign-schedules");
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      } else {
        const errorText = `Failed to fetch schedules: ${response.statusText}`;
        setError(errorText);
        console.error(errorText);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate: any) => {
    setSelectedDate(newDate);
  };

  // Calculate summary statistics
  const stats = useMemo(() => {
    const now = dayjs();
    const total = schedules.length;
    const pending = schedules.filter((s) => dayjs(s.scheduled_at).isAfter(now)).length;
    const sent = schedules.filter((s) => dayjs(s.scheduled_at).isBefore(now)).length;
    const today = schedules.filter((s) => 
      dayjs(s.scheduled_at).isSame(now, "day")
    ).length;

    return { total, pending, sent, today };
  }, [schedules]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Enhanced Header Section */}
        <div className="bg-gradient-to-r from-[#1C315F] to-[#243a66] text-white shadow-xl">
          <div className="px-8 py-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    The College Athlete Network
                  </h1>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Scheduled Campaigns
                  </h1>
                  <p className="text-blue-100 mt-1">
                    View and manage your scheduled email campaigns
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 py-8 space-y-6">
          {/* Summary Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Scheduled</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Send className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Sent</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.sent}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Today</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && !loading && (
            <div className="bg-white rounded-2xl shadow-xl border border-red-200 p-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Error Loading Schedules
                  </h3>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
                <button
                  onClick={fetchSchedules}
                  className="px-4 py-2 bg-[#1C315F] text-white rounded-lg hover:bg-[#243a66] transition-all duration-200 font-semibold"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          <ScheduleCalendar
            selectedDate={selectedDate}
            onDateChange={handleDateChange}
            schedules={schedules}
          />
          <ScheduleTable
            schedules={schedules}
            loading={loading}
            onRefresh={fetchSchedules}
          />
        </div>
      </div>
    </LocalizationProvider>
  );
}
