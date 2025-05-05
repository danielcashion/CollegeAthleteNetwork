"use client";
import React, { useState } from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

type JobOpening = {
  position: string;
  location: string;
  description: string;
};

type SortKey = "position" | "location" | "description";
type SortOrder = "asc" | "desc";

type Props = {
  jobs: JobOpening[];
};

const JobOpeningsTable: React.FC<Props> = ({ jobs }) => {
  const [sortKey, setSortKey] = useState<SortKey>("position");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

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

  return (
    <div className="overflow-x-auto rounded-2xl shadow-xl border border-gray-200 bg-white">
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100 text-gray-800 text-lg font-semibold">
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
              onClick={() => handleSort("description")}
              className="px-6 py-4 cursor-pointer hover:text-blue-600"
            >
              <div className="flex items-center gap-1">
                Short Description <SortIcon column="description" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedJobs.map((job, idx) => (
            <tr
              key={idx}
              className={`${
                idx % 2 === 0 ? "bg-white" : "bg-gray-50"
              } hover:bg-blue-50 transition`}
            >
              <td className="px-6 py-4 text-lg">{job.position}</td>
              <td className="px-6 py-4 text-lg">{job.location}</td>
              <td className="px-6 py-4 text-lg">{job.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JobOpeningsTable;
