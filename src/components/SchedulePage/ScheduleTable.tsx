"use client";
import React, { useState } from "react";
import { RefreshCw, Trash2 } from "lucide-react";
import dayjs from "dayjs";
import DeleteScheduleModal from "./DeleteScheduleModal";

type ScheduleTableProps = {
  schedules: any[];
  loading: boolean;
  onRefresh: () => void;
};

export default function ScheduleTable({
  schedules,
  loading,
  onRefresh,
}: ScheduleTableProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<any | null>(null);

  const handleDeleteClick = (schedule: any) => {
    setScheduleToDelete(schedule);
    setDeleteModalOpen(true);
  };

  const handleDeleteSuccess = () => {
    onRefresh();
  };

  // Format date with relative time
  const formatDate = (date: dayjs.Dayjs) => {
    const now = dayjs();
    const diffDays = date.diff(now, "day");
    
    if (diffDays === 0) {
      return { primary: "Today", secondary: date.format("MMM D, YYYY") };
    } else if (diffDays === 1) {
      return { primary: "Tomorrow", secondary: date.format("MMM D, YYYY") };
    } else if (diffDays === -1) {
      return { primary: "Yesterday", secondary: date.format("MMM D, YYYY") };
    } else if (diffDays > 0 && diffDays <= 7) {
      return { primary: `In ${diffDays} days`, secondary: date.format("MMM D, YYYY") };
    } else {
      return { primary: date.format("MMM D, YYYY"), secondary: date.format("dddd") };
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12">
        <div className="flex flex-col justify-center items-center py-20">
          <div className="w-16 h-16 bg-gradient-to-r from-[#1C315F] to-[#243a66] rounded-2xl flex items-center justify-center mb-4 shadow-xl">
            <RefreshCw className="w-8 h-8 text-white animate-spin" />
          </div>
          <p className="text-gray-600 text-lg font-medium">
            Loading schedules...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Refresh Button Section */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{schedules.length}</span>{" "}
            scheduled campaign{schedules.length !== 1 ? "s" : ""} found
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-[#1C315F] text-white rounded-lg hover:bg-[#243a66] transition-all duration-200 font-semibold shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-20 px-8">
        <div className="w-20 h-20 bg-gradient-to-r from-[#1C315F] to-[#243a66] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <RefreshCw className="w-10 h-10 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          No Scheduled Campaigns Found
        </h3>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          No campaigns are currently scheduled. Create a campaign and schedule it to see it here.
        </p>
        <a
          href="/admin/campaigns"
          className="inline-flex items-center space-x-2 px-6 py-3 bg-[#1C315F] text-white rounded-xl hover:bg-[#243a66] transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
        >
          <span>Go to Campaigns</span>
        </a>
      </div>
      ) : (
        <div className="relative">
          <div className="overflow-x-auto max-h-[75vh] overflow-y-auto pb-20">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Scheduled Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Scheduled Time
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {schedules.map((schedule) => {
                  const scheduledDate = dayjs(schedule.scheduled_at);
                  const isPast = scheduledDate.isBefore(dayjs());
                  const status = isPast ? "Sent" : "Pending";

                  const hours24 = scheduledDate.hour();
                  const hours12 = hours24 % 12 || 12;
                  const minutes = scheduledDate
                    .minute()
                    .toString()
                    .padStart(2, "0");
                  const ampm = hours24 >= 12 ? "PM" : "AM";

                  return (
                    <tr
                      key={schedule.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="font-semibold text-gray-900 hover:text-[#1C315F] transition-colors duration-200">
                            {schedule.campaign_name || "Untitled Campaign"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{formatDate(scheduledDate).primary}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {formatDate(scheduledDate).secondary}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{`${hours12}:${minutes} ${ampm}`}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            status === "Sent"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteClick(schedule)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                          title="Delete schedule"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteScheduleModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setScheduleToDelete(null);
        }}
        schedule={scheduleToDelete}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  );
}

