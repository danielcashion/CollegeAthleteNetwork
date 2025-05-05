"use client";
import React, { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, ChevronRight } from "lucide-react";
import { Job } from "@/utils/jobs";
import Drawer from "@mui/material/Drawer";
import JobDetails from "./JobDetails";

type SortKey = "position" | "location" | "shortDescription";
type SortOrder = "asc" | "desc";

type Props = {
  jobs: Job[];
};

const JobOpeningsTable: React.FC<Props> = ({ jobs }) => {
  const [sortKey, setSortKey] = useState<SortKey>("position");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    const aVal = a[sortKey].toLowerCase();
    const bVal = b[sortKey].toLowerCase();
    return sortOrder === "asc"
      ? aVal.localeCompare(bVal)
      : bVal.localeCompare(aVal);
  });

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (column !== sortKey) return null;
    return sortOrder === "asc" ? (
      <ArrowUp size={16} />
    ) : (
      <ArrowDown size={16} />
    );
  };

  if (isMobile) {
    return (
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Sort by:</h2>
            <div className="flex gap-2">
              <button
                onClick={() => handleSort("position")}
                className={`px-3 py-1 rounded ${
                  sortKey === "position"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100"
                }`}
              >
                Position{" "}
                {sortKey === "position" && (sortOrder === "asc" ? "↑" : "↓")}
              </button>
              <button
                onClick={() => handleSort("location")}
                className={`px-3 py-1 rounded ${
                  sortKey === "location"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100"
                }`}
              >
                Location{" "}
                {sortKey === "location" && (sortOrder === "asc" ? "↑" : "↓")}
              </button>
            </div>
          </div>
        </div>

        {sortedJobs.map((job: Job, idx: number) => (
          <div
            key={idx}
            onClick={() => setSelectedJob(job)}
            className="bg-white rounded-lg shadow p-4 cursor-pointer hover:bg-blue-50 transition border border-gray-200"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-medium text-lg text-gray-900">
                {job.position}
              </h3>
              <ChevronRight className="text-gray-400" />
            </div>
            <p className="text-gray-600 mt-1">{job.location}</p>
            <p className="text-gray-500 mt-2 text-sm">{job.shortDescription}</p>
          </div>
        ))}

        <Drawer
          anchor="right"
          open={!!selectedJob}
          onClose={() => setSelectedJob(null)}
        >
          <div className="w-full">
            <JobDetails job={selectedJob} setSelectedJob={setSelectedJob} />
          </div>
        </Drawer>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl shadow-xl border border-gray-200 bg-white">
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-200 text-gray-800 text-lg font-semibold">
          <tr>
            <th
              onClick={() => handleSort("position")}
              className="px-6 py-4 cursor-pointer hover:text-blue-600"
            >
              <div className="flex items-center gap-1">
                Position <SortIcon column="position" />
              </div>
            </th>
            <th
              onClick={() => handleSort("location")}
              className="px-6 py-4 cursor-pointer hover:text-blue-600"
            >
              <div className="flex items-center gap-1">
                Location <SortIcon column="location" />
              </div>
            </th>
            <th
              onClick={() => handleSort("shortDescription")}
              className="px-6 py-4 cursor-pointer hover:text-blue-600"
            >
              <div className="flex items-center gap-1">
                Short Description <SortIcon column="shortDescription" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedJobs.map((job: Job, idx: number) => (
            <tr
              key={idx}
              onClick={() => setSelectedJob(job)}
              className={`cursor-pointer ${
                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
              } hover:bg-blue-50 transition`}
            >
              <td className="px-6 py-4 text-lg">{job.position}</td>
              <td className="px-6 py-4 text-lg">{job.location}</td>
              <td className="px-6 py-4 text-lg">{job.shortDescription}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Drawer
        anchor="right"
        open={!!selectedJob}
        onClose={() => setSelectedJob(null)}
      >
        <div className="w-[600px]">
          <JobDetails job={selectedJob} setSelectedJob={setSelectedJob} />
        </div>
      </Drawer>
    </div>
  );
};

export default JobOpeningsTable;
