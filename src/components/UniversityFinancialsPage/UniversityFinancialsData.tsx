"use client";
import React, { useState } from "react";
import { ArrowUp, ArrowDown, Search } from "lucide-react";
import { FaFilter } from "react-icons/fa";
import { NetworkSizeScaler } from "@/types/UniversityFinancials";
import { UniversityTeam } from "@/types/University";
import NetworkSizeScalerFilters from "./NetworkSizeScalerFilters";

interface UniversityFinancialsDataProps {
  teams: UniversityTeam[];
}

type SortKey = "team_name" | "gender_id" | "num_athletes";
type SortOrder = "asc" | "desc";

export default function UniversityFinancialsData({
  teams,
}: UniversityFinancialsDataProps) {
  const [sortKey, setSortKey] = useState<SortKey>("team_name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [scalerValues, setScalerValues] = useState<NetworkSizeScaler>({
    networkSizePercentage: 100,
    jobPlacementPerAlumPercentage: 5,
    avgFte: 150000,
    standardHeadHunterFeePercentage: 33,
    companyWillingToPayPercentage: 33,
    participationRate: 75,
    hiresPerYear: 3,
  });

  //   Calculative Consts
  const resultingHeadHunterFee: number =
    scalerValues.avgFte * (scalerValues.standardHeadHunterFeePercentage / 100);

  const resultingContribution: number =
    resultingHeadHunterFee * (scalerValues.companyWillingToPayPercentage / 100);

  const cashSavingsPerHirePerCompany: number =
    resultingHeadHunterFee - resultingContribution;

  const cashSavings: number =
    cashSavingsPerHirePerCompany * scalerValues.hiresPerYear;

  const getGenderText = (genderId: number) => {
    return genderId === 1 ? "Men" : genderId === 2 ? "Women" : "-";
  };

  const handleResetFilters = () => {
    setScalerValues({
      networkSizePercentage: 100,
      jobPlacementPerAlumPercentage: 5,
      avgFte: 150000,
      standardHeadHunterFeePercentage: 33,
      companyWillingToPayPercentage: 33,
      participationRate: 75,
      hiresPerYear: 3,
    });
  };

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const handleFiltersChange = (newFilters: NetworkSizeScaler) => {
    setScalerValues(newFilters);
  };

  const filteredTeams = teams.filter(
    (team) =>
      team.team_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getGenderText(team.gender_id)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const sortedTeams = [...filteredTeams].sort((a, b) => {
    let aVal: string | number;
    let bVal: string | number;

    switch (sortKey) {
      case "team_name":
        aVal = a.team_name.toLowerCase();
        bVal = b.team_name.toLowerCase();
        break;
      case "gender_id":
        aVal = getGenderText(a.gender_id).toLowerCase();
        bVal = getGenderText(b.gender_id).toLowerCase();
        break;
      case "num_athletes":
        aVal = a.num_athletes;
        bVal = b.num_athletes;
        break;
      default:
        aVal = a.team_name.toLowerCase();
        bVal = b.team_name.toLowerCase();
    }

    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    } else {
      return sortOrder === "asc"
        ? aVal.toString().localeCompare(bVal.toString())
        : bVal.toString().localeCompare(aVal.toString());
    }
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
    <div className="w-full flex py-8 px-4 min-h-[60vh]">
      <div className="w-full flex flex-col mx-auto w-full max-w-6xl">
        {/* Search Bar */}
        <div className="mb-6 w-full mx-auto flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search teams..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blueMain focus:border-transparent"
            />
          </div>

          <button
            onClick={() => setShowFilters(true)}
            className="bg-gradient-to-r text-center from-[#1C315F] to-[#ED3237] text-white px-6 py-2 rounded-md flex flex-row items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <FaFilter size={20} />
            Network Size Scaler
          </button>
        </div>

        {/* Filters Modal */}
        {showFilters && (
          <NetworkSizeScalerFilters
            filters={scalerValues}
            onFiltersChange={handleFiltersChange}
            resultingHeadHunterFee={resultingHeadHunterFee}
            resultingContribution={resultingContribution}
            cashSavingsPerHirePerCompany={cashSavingsPerHirePerCompany}
            cashSavings={cashSavings}
            onClose={() => setShowFilters(false)}
            onReset={handleResetFilters}
          />
        )}

        {/* Mobile Version - Hidden on md and above */}
        <div className="md:hidden space-y-4">
          {/* Sort Controls */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex flex-col xs:flex-row justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Sort by:</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSort("team_name")}
                  className={`px-3 py-1 rounded ${
                    sortKey === "team_name"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100"
                  }`}
                >
                  Sport Name{" "}
                  {sortKey === "team_name" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
                <button
                  onClick={() => handleSort("gender_id")}
                  className={`px-3 py-1 rounded ${
                    sortKey === "gender_id"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-gray-100"
                  }`}
                >
                  Gender{" "}
                  {sortKey === "gender_id" && (sortOrder === "asc" ? "↑" : "↓")}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Cards */}
          {sortedTeams.map((team) => {
            const networkSize: number =
              team.num_athletes * (scalerValues.networkSizePercentage / 100);

            const jobPlacementsPeryear: number = Math.round(
              networkSize * (scalerValues.jobPlacementPerAlumPercentage / 100)
            );

            const cashDirectedTowardsTeam: number = Math.round(
              (jobPlacementsPeryear / 100) *
                (resultingContribution / 100) *
                (scalerValues.participationRate / 100)
            );

            return (
              <div
                key={team.team_id}
                className="bg-white rounded-lg shadow p-4 border border-gray-200"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-lg text-gray-900">
                    {team.team_name}
                  </h3>
                </div>
                <p className="text-gray-600 mt-1">
                  {getGenderText(team.gender_id)}
                </p>
                <p className="text-gray-500 mt-2 text-sm">
                  Network Size: {Math.round(networkSize)} athletes
                </p>
                <p className="text-gray-500 mt-1 text-sm">
                  Job Placements per Year: {Math.round(jobPlacementsPeryear)}
                </p>
                <p className="text-gray-500 mt-1 text-sm">
                  Cash Directed Toward Team: $
                  {Math.round(cashDirectedTowardsTeam).toLocaleString()}
                </p>
              </div>
            );
          })}

          {sortedTeams.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No teams found matching your search.
            </div>
          )}
        </div>

        {/* Desktop Table - Hidden below md */}
        <div className="hidden md:block overflow-x-auto rounded-xl shadow-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm text-left text-gray-700">
            <thead className="bg-blueMain text-white text-lg font-medium">
              <tr>
                <th
                  onClick={() => handleSort("team_name")}
                  className="px-6 py-4 cursor-pointer hover:text-blue-600"
                >
                  <div className="flex items-center gap-1">
                    Sport Name <SortIcon column="team_name" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("gender_id")}
                  className="px-6 py-4 cursor-pointer hover:text-blue-600"
                >
                  <div className="flex items-center gap-1">
                    Gender <SortIcon column="gender_id" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort("num_athletes")}
                  className="px-6 py-4 cursor-pointer hover:text-blue-600"
                >
                  <div className="flex items-center gap-1">
                    Network Size <SortIcon column="num_athletes" />
                  </div>
                </th>
                <th className="px-6 py-4">Job Placements per Year</th>
                <th className="px-6 py-4">Cash Directed Toward Team</th>
              </tr>
            </thead>
            <tbody>
              {sortedTeams.map((team, idx) => {
                const networkSize: number =
                  team.num_athletes *
                  (scalerValues.networkSizePercentage / 100);

                const jobPlacementsPeryear: number = Math.round(
                  networkSize *
                    (scalerValues.jobPlacementPerAlumPercentage / 100)
                );

                const cashDirectedTowardsTeam: number = Math.round(
                  jobPlacementsPeryear *
                    resultingContribution *
                    (scalerValues.participationRate / 100)
                );

                return (
                  <tr
                    key={team.team_id}
                    className={`${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition text-lg border-t`}
                  >
                    <td className="px-6 py-2 hover:text-blue-600">
                      {team.team_name}
                    </td>
                    <td className="px-6 py-2 hover:text-blue-600">
                      {getGenderText(team.gender_id)}
                    </td>
                    <td className="px-6 py-2 hover:text-blue-600 text-center">
                      {Math.round(networkSize)}
                    </td>
                    <td className="px-6 py-2 text-center">
                      {Math.round(jobPlacementsPeryear)}
                    </td>
                    <td className="px-6 py-2 text-center">
                      ${Math.round(cashDirectedTowardsTeam).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {sortedTeams.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No teams found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
