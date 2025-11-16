"use client";
import React, { useState, useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Calendar } from "lucide-react";
import ScheduleCalendar from "@/components/SchedulePage/ScheduleCalendar";
import ScheduleTable from "@/components/SchedulePage/ScheduleTable";
import dayjs from "dayjs";

export default function SchedulePage() {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/campaign-schedules");
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      } else {
        console.error("Failed to fetch schedules:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (newDate: any) => {
    setSelectedDate(newDate);
  };

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
                    View and manage your scheduled engagements
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-8 py-8 space-y-8">
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
