"use client";
import React, { useState } from "react";
import { ArrowUp, ArrowDown, ChevronUp, ChevronDown } from "lucide-react";
import { NetworkSizeScaler } from "@/types/UniversityFinancials";
import { UniversityTeam } from "@/types/University";
import NetworkSizeScalers from "./NetworkSizeScalerFilters";
import Tooltip from "@mui/material/Tooltip";

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
  const [scalerValues, setScalerValues] = useState<NetworkSizeScaler>({
    networkSizePercentage: 150,
    jobPlacementPercentage: 20,
    avgFte: 135000,
    standardHeadHunterFeePercentage: 30,
    companyWillingToPayPercentage: 50,
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
    return genderId === 1 ? "M" : genderId === 2 ? "W" : "-";
  };

  const handleResetFilters = () => {
    setScalerValues({
      networkSizePercentage: 150,
      jobPlacementPercentage: 20,
      avgFte: 135000,
      standardHeadHunterFeePercentage: 30,
      companyWillingToPayPercentage: 50,
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

  const handleNetworkSizeChange = (
    field: keyof NetworkSizeScaler,
    value: string
  ) => {
    const parsed = parseFloat(value);
    let clampedValue = isNaN(parsed) ? 0 : parsed;

    // Apply max limit for network size percentage
    clampedValue = Math.min(clampedValue, 400);
    // Apply minimum of 0
    clampedValue = Math.max(clampedValue, 0);

    setScalerValues({
      ...scalerValues,
      [field]: clampedValue,
    });
  };

  const handleNetworkSizeIncrement = (
    field: keyof NetworkSizeScaler,
    step: number
  ) => {
    const currentValue = scalerValues[field];
    let newValue = currentValue + step;

    // Apply max limit for network size percentage
    newValue = Math.min(newValue, 400);

    setScalerValues({
      ...scalerValues,
      [field]: newValue,
    });
  };

  const handleNetworkSizeDecrement = (
    field: keyof NetworkSizeScaler,
    step: number
  ) => {
    const currentValue = scalerValues[field];
    const newValue = Math.max(0, currentValue - step);
    setScalerValues({
      ...scalerValues,
      [field]: newValue,
    });
  };

  const sortedTeams = [...teams].sort((a, b) => {
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

  const percentTurnover = 0.2; // 20% turnover per year

  // Calculate totals for numerical columns
  const totals = sortedTeams.reduce(
    (acc, team) => {
      const networkSize: number =
        team?.num_athletes * (scalerValues.networkSizePercentage / 100);

      const jobPlacementsPeryear: number =
        networkSize *
        ((scalerValues.jobPlacementPercentage * percentTurnover) / 100);

      const cashDirectedTowardsTeam: number =
        Math.round(jobPlacementsPeryear) *
        resultingContribution *
        (scalerValues.participationRate / 100);

      return {
        totalAthletes: acc.totalAthletes + networkSize,
        totalJobPlacements: acc.totalJobPlacements + jobPlacementsPeryear,
        totalCash: acc.totalCash + cashDirectedTowardsTeam,
      };
    },
    { totalAthletes: 0, totalJobPlacements: 0, totalCash: 0 }
  );

  return (
    <div className="w-full flex py-8 px-4 min-h-[60vh]">
      <div className="flex flex-col-reverse md:flex-row items-start gap-6 w-full max-w-7xl mx-auto">
        {/* Network Size Scaler Bar */}
        <div className="w-full flex flex-col">
          {/* Single row with 4 columns above the table */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex w-full md:flex-row gap-4">
              {/* Column 1: Total Athlete Network Size Label */}
              <div className="w-full md:w-2/5 flex items-center">
                <Tooltip
                  title="Adjusts the total size of Athletes in the Network (e.g. 150% = 150% of the university's website rosters size, 200% = double the size). University websites only go back so far, but we can go back further..."
                  placement="top"
                  slotProps={{
                    popper: {
                      modifiers: [
                        {
                          name: "offset",
                          options: {
                            offset: [0, 10], // optional spacing
                          },
                        },
                      ],
                    },
                    tooltip: {
                      sx: {
                        fontSize: "1rem",
                        backgroundColor: "rgba(28, 49, 95, 0.75)", // 90% opacity
                        color: "#fff",
                      },
                    },
                    arrow: {
                      sx: {
                        color: "rgba(28, 49, 95, 0.9)", // match arrow background
                      },
                    },
                  }}
                >
                  <label className="block text-2xl font-medium text-[#1C315F]">
                    Athlete Network Size Scaler
                  </label>
                </Tooltip>
              </div>
              {/* Column 2: Input Box with Increment/Decrement Buttons */}
              <div className="w-full md:w-1/6 flex items-center">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative shadow-md">
                    <input
                      type="text"
                      value={
                        scalerValues.networkSizePercentage !== null &&
                        scalerValues.networkSizePercentage !== undefined
                          ? `${Number(
                              scalerValues.networkSizePercentage
                            ).toLocaleString("en-US")}%`
                          : ""
                      }
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/[^0-9]/g, "");
                        const numValue = rawValue ? Number(rawValue) : "";
                        handleNetworkSizeChange(
                          "networkSizePercentage",
                          numValue === "" ? "" : String(numValue)
                        );
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blueMain focus:border-transparent text-center bg-white"
                      placeholder="0%"
                    />
                  </div>
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() =>
                        handleNetworkSizeIncrement("networkSizePercentage", 5)
                      }
                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors min-w-[28px] min-h-[20px] flex items-center justify-center"
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleNetworkSizeDecrement("networkSizePercentage", 5)
                      }
                      className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors min-w-[28px] min-h-[20px] flex items-center justify-center"
                    >
                      <ChevronDown size={14} />
                    </button>
                  </div>
                </div>
              </div>
              {/* Column 3: Scale Instruction Text */}
              <div className="w-full md:w-2/5 flex items-center">
                <label className="block text-sm font-medium text-[#1C315F]">
                  Hint: Scale up/down to match what you think the true total
                  size of the network is
                </label>
              </div>
              {/* Column 4: Reset Button */}
              <div className="w-full md:w-1/5 flex items-center">
                <button
                  onClick={() => handleResetFilters()}
                  className="bg-gradient-to-r text-center from-[#1C315F] to-[#ED3237] text-white px-6 py-2 rounded-md hover:opacity-90 transition-opacity w-full h-10 flex items-center justify-center"
                >
                  Reset Values
                </button>
              </div>
            </div>
          </div>

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
                    Sport{" "}
                    {sortKey === "team_name" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
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
                    {sortKey === "gender_id" &&
                      (sortOrder === "asc" ? "↑" : "↓")}
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Cards */}
            {sortedTeams.map((team) => {
              const networkSize: number =
                team?.num_athletes * (scalerValues.networkSizePercentage / 100);

              const jobPlacementsPeryear: number =
                networkSize *
                ((scalerValues.jobPlacementPercentage * percentTurnover) / 100);

              const cashDirectedTowardsTeam: number =
                Math.round(jobPlacementsPeryear) *
                resultingContribution *
                (scalerValues.participationRate / 100);
              return (
                <div
                  key={team?.team_id}
                  className="bg-white rounded-lg shadow p-4 border border-gray-200"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium text-lg ml-1 text-gray-900">
                      {team?.team_name}
                    </h3>
                  </div>
                  <p className="text-gray-600 mt-1">
                    {getGenderText(team?.gender_id)}
                  </p>
                  <p className="text-gray-500 mt-2 text-sm">
                    # : {Math.round(networkSize)} athletes
                  </p>
                  <p className="text-gray-500 mt-1 text-sm">
                    Job Placements/Year: {Math.round(jobPlacementsPeryear)}
                  </p>
                  <p className="text-gray-500 mt-1 text-sm">
                    Team Contribution: $
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
                      Sport <SortIcon column="team_name" />
                    </div>
                  </th>
                  <Tooltip
                    title={`The number of athletes from the university's public rosters multiplied by the above Athlete Network Size Scaler (${scalerValues.networkSizePercentage}%)`}
                    placement="top"
                    arrow
                    slotProps={{
                      popper: {
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [0, 10], // optional spacing
                            },
                          },
                        ],
                      },
                      tooltip: {
                        sx: {
                          fontSize: "1rem",
                          backgroundColor: "rgba(28, 49, 95, 0.75)", // 90% opacity
                          color: "#fff",
                        },
                      },
                      arrow: {
                        sx: {
                          color: "rgba(28, 49, 95, 0.9)", // match arrow background
                        },
                      },
                    }}
                  >
                    <th className="px-6 py-4 cursor-pointer hover:text-blue-600">
                      <div className="flex items-center gap-1"># Athletes</div>
                    </th>
                  </Tooltip>
                  <Tooltip
                    title={`The AVG duration of employment is 5 years, implying 20% change jobs each year.`}
                    placement="top"
                    arrow
                    slotProps={{
                      popper: {
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [0, 10], // optional spacing
                            },
                          },
                        ],
                      },
                      tooltip: {
                        sx: {
                          fontSize: "1rem",
                          backgroundColor: "rgba(28, 49, 95, 0.75)", // 90% opacity
                          color: "#fff",
                        },
                      },
                      arrow: {
                        sx: {
                          color: "rgba(28, 49, 95, 0.9)", // match arrow background
                        },
                      },
                    }}
                  >
                    <th># Changing Jobs (est.)</th>
                  </Tooltip>
                  <Tooltip
                    title={`The number of job placements per year based on the network size scaler (${scalerValues.networkSizePercentage}%) and job placement percentage (${scalerValues.jobPlacementPercentage}%)`}
                    placement="top"
                    arrow
                    slotProps={{
                      popper: {
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [0, 10], // optional spacing
                            },
                          },
                        ],
                      },
                      tooltip: {
                        sx: {
                          fontSize: "1rem",
                          backgroundColor: "rgba(28, 49, 95, 0.75)", // 90% opacity
                          color: "#fff",
                        },
                      },
                      arrow: {
                        sx: {
                          color: "rgba(28, 49, 95, 0.9)", // match arrow background
                        },
                      },
                    }}
                  >
                    <th>Job Placements/Year</th>
                  </Tooltip>
                  <Tooltip
                    title={`The estimated cash to the team based on the setting within this model.`}
                    placement="top"
                    arrow
                    slotProps={{
                      popper: {
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [0, 10], // optional spacing
                            },
                          },
                        ],
                      },
                      tooltip: {
                        sx: {
                          fontSize: "1rem",
                          backgroundColor: "rgba(28, 49, 95, 0.75)", // 90% opacity
                          color: "#fff",
                        },
                      },
                      arrow: {
                        sx: {
                          color: "rgba(28, 49, 95, 0.9)", // match arrow background
                        },
                      },
                    }}
                  >
                    <th>$ Contributions</th>
                  </Tooltip>
                </tr>
              </thead>
              <tbody>
                {/* Totals Row */}
                <tr className="bg-gray-100 font-bold text-lg border-t">
                  <td className="px-6 py-2">Totals</td>
                  <Tooltip
                    title={
                      <span>
                        Website athletes across all teams Xs the above{" "}
                        <strong
                          style={{
                            fontWeight: "bold",
                            color: "#0df333ff",
                          }}
                        >
                          Athlete Network Size Scaler
                        </strong>
                        .
                      </span>
                    }
                    placement="bottom"
                    arrow
                    slotProps={{
                      popper: {
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [0, 10], // optional spacing
                            },
                          },
                        ],
                      },
                      tooltip: {
                        sx: {
                          fontSize: "1rem",
                          backgroundColor: "rgba(28, 49, 95, 0.75)", // 90% opacity
                          color: "#fff",
                        },
                      },
                      arrow: {
                        sx: {
                          color: "rgba(28, 49, 95, 0.9)", // match arrow background
                        },
                      },
                    }}
                  >
                    <td className="px-6 py-2 text-center">
                      {Math.round(totals.totalAthletes).toLocaleString()}
                    </td>
                  </Tooltip>
                  <Tooltip
                    title={`# of Athletes changing jobs each year (historical norm of 20%).`}
                    placement="bottom"
                    arrow
                    slotProps={{
                      popper: {
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [0, 10], // optional spacing
                            },
                          },
                        ],
                      },
                      tooltip: {
                        sx: {
                          fontSize: "1rem",
                          backgroundColor: "rgba(28, 49, 95, 0.75)", // 90% opacity
                          color: "#fff",
                        },
                      },
                      arrow: {
                        sx: {
                          color: "rgba(28, 49, 95, 0.9)", // match arrow background
                        },
                      },
                    }}
                  >
                    <td className="px-6 py-2 text-gray-500 text-center">
                      {Math.round(
                        totals.totalAthletes * percentTurnover
                      ).toLocaleString()}
                    </td>
                  </Tooltip>
                  <Tooltip
                    title={
                      <span>
                        How many you expect to place from the{" "}
                        {Math.round(
                          totals.totalAthletes * percentTurnover
                        ).toLocaleString()}{" "}
                        (column to the left) job changers each year. Scale this
                        up/down based on your network&apos;s activity using the{" "}
                        <strong style={{
                            fontWeight: "bold",
                            color: "#0df333ff",
                          }}>% of Changing Jobs you Hope to Place</strong> input on the right.
                      </span>
                    }
                    placement="bottom"
                    arrow
                    slotProps={{
                      popper: {
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [0, 10], // optional spacing
                            },
                          },
                        ],
                      },
                      tooltip: {
                        sx: {
                          fontSize: "1rem",
                          backgroundColor: "rgba(28, 49, 95, 0.75)", // 90% opacity
                          color: "#fff",
                        },
                      },
                      arrow: {
                        sx: {
                          color: "rgba(28, 49, 95, 0.9)", // match arrow background
                        },
                      },
                    }}
                  >
                    <td className="px-6 py-2 text-center">
                      {Math.round(totals.totalJobPlacements).toLocaleString()}
                    </td>
                  </Tooltip>
                  <Tooltip
                    title={`The total cash directed towards all teams based on the your settings.`}
                    placement="bottom"
                    arrow
                    slotProps={{
                      popper: {
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [0, 10], // optional spacing
                            },
                          },
                        ],
                      },
                      tooltip: {
                        sx: {
                          fontSize: "1rem",
                          backgroundColor: "rgba(28, 49, 95, 0.75)", // 90% opacity
                          color: "#fff",
                        },
                      },
                      arrow: {
                        sx: {
                          color: "rgba(28, 49, 95, 0.9)", // match arrow background
                        },
                      },
                    }}
                  >
                    <td className="px-6 py-2 text-center">
                      ${Math.round(totals.totalCash).toLocaleString()}
                    </td>
                  </Tooltip>
                </tr>

                {/* Individual Team Rows */}
                {sortedTeams.map((team, idx) => {
                  const networkSize: number =
                    team?.num_athletes *
                    (scalerValues.networkSizePercentage / 100);

                  const jobPlacementsPeryear: number =
                    networkSize * (scalerValues.jobPlacementPercentage / 100);

                  const cashDirectedTowardsTeam: number =
                    Math.round(jobPlacementsPeryear * percentTurnover) *
                    resultingContribution *
                    (scalerValues.participationRate / 100);

                  return (
                    <tr
                      key={team?.team_id}
                      className={`${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-90"
                      } hover:bg-blue-50 transition text-lg border-t`}
                    >
                      <td className="px-6 py-2 ml-1 hover:text-blue-600">
                        {team?.team_name} ({getGenderText(team?.gender_id)})
                      </td>
                      {/* <td className="px-6 py-2 hover:text-blue-600">
                      {getGenderText(team?.gender_id)}
                    </td> */}
                      <Tooltip
                        title={`Approximate # of athletes in this sport's student and alumni network.`}
                        placement="left"
                        arrow
                        slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: "offset",
                                options: {
                                  offset: [0, 10], // optional spacing
                                },
                              },
                            ],
                          },
                          tooltip: {
                            sx: {
                              fontSize: ".8rem",
                              backgroundColor: "rgba(28, 49, 95, 0.75)", // 90% opacity
                              color: "#fff",
                            },
                          },
                          arrow: {
                            sx: {
                              color: "rgba(28, 49, 95, 0.9)", // match arrow background
                            },
                          },
                        }}
                      >
                        <td className="px-6 py-2 hover:text-blue-600 text-center">
                          {Math.round(networkSize).toLocaleString()}
                        </td>
                      </Tooltip>
                      <Tooltip
                        title={`With ${Math.round(
                          networkSize
                        ).toLocaleString()} athletes and 20% changing jobs each year (5 year AVG job duration), about ${Math.round(
                          networkSize * percentTurnover
                        ).toLocaleString()} will change jobs this year.`}
                        placement="right"
                        arrow
                        slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: "offset",
                                options: {
                                  offset: [0, 10], // optional spacing
                                },
                              },
                            ],
                          },
                          tooltip: {
                            sx: {
                              fontSize: ".8rem",
                              backgroundColor: "rgba(28, 49, 95, 0.75)", // 90% opacity
                              color: "#fff",
                            },
                          },
                          arrow: {
                            sx: {
                              color: "rgba(28, 49, 95, 0.9)", // match arrow background
                            },
                          },
                        }}
                      >
                        <td className="px-6 py-2 hover:text-blue-600 text-gray-400 text-center">
                          {Math.round(
                            networkSize * percentTurnover
                          ).toLocaleString()}
                        </td>
                      </Tooltip>
                      <Tooltip
                        title={
                          <span>
                            Of those{" "}
                            {Math.round(
                              networkSize * percentTurnover
                            ).toLocaleString()}{" "}
                            to the left, this is how many you would hope to
                            place in network. Fine-tune this number by scaling
                            +/- the{" "}
                            <strong style={{ color: "#0df333ff" }}>
                              &quot;% of Changing Jobs you Hope to Place&quot;
                            </strong>{" "}
                            on the right!
                          </span>
                        }
                        placement="right"
                        arrow
                        slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: "offset",
                                options: {
                                  offset: [0, 10], // optional spacing
                                },
                              },
                            ],
                          },
                          tooltip: {
                            sx: {
                              fontSize: ".8rem",
                              backgroundColor: "rgba(28, 49, 95, 0.75)", // 90% opacity
                              color: "#fff",
                            },
                          },
                          arrow: {
                            sx: {
                              color: "rgba(28, 49, 95, 0.9)", // match arrow background
                            },
                          },
                        }}
                      >
                        <td className="px-6 py-2 text-center">
                          {Math.round(jobPlacementsPeryear * percentTurnover)}
                        </td>
                      </Tooltip>
                      <Tooltip
                        title={
                          <span>
                            Results in:{" "}
                            <strong style={{ color: "#0df333ff" }}>
                              {Math.round(
                                jobPlacementsPeryear * percentTurnover
                              )}{" "}
                            </strong>{" "}
                            <span style={{ color: "#a6c6feff" }}>
                              Job Placements/Year
                            </span>{" "}
                            Xs a{" "}
                            <span style={{ color: "#a6c6feff" }}>
                              Company Contribution
                            </span>{" "}
                            <span>of </span>
                            <strong style={{ color: "#0df333ff" }}>
                              ${resultingContribution.toLocaleString()}
                            </strong>{" "}
                            Xs a{" "}
                            <span style={{ color: "#a6c6feff" }}>
                              Company Participation Rate
                            </span>{" "}
                            <span>of </span>
                            <strong style={{ color: "#0df333ff" }}>
                              {scalerValues.participationRate}%
                            </strong>{" "}
                            = $
                            {Math.round(
                              cashDirectedTowardsTeam
                            ).toLocaleString()}
                          </span>
                        }
                        placement="right"
                        arrow
                        slotProps={{
                          popper: {
                            modifiers: [
                              {
                                name: "offset",
                                options: {
                                  offset: [0, 10], // optional spacing
                                },
                              },
                            ],
                          },
                          tooltip: {
                            sx: {
                              fontSize: ".8rem",
                              backgroundColor: "rgba(28, 49, 95, 0.75)", // 90% opacity
                              color: "#fff",
                            },
                          },
                          arrow: {
                            sx: {
                              color: "rgba(28, 49, 95, 0.9)", // match arrow background
                            },
                          },
                        }}
                      >
                        <td className="px-6 py-2 text-center">
                          $
                          {Math.round(cashDirectedTowardsTeam).toLocaleString()}
                        </td>
                      </Tooltip>
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
        <div className="w-full md:w-[300px] min-w-[300px]">
          <NetworkSizeScalers
            filters={scalerValues}
            onFiltersChange={handleFiltersChange}
            resultingHeadHunterFee={resultingHeadHunterFee}
            resultingContribution={resultingContribution}
            cashSavingsPerHirePerCompany={cashSavingsPerHirePerCompany}
            cashSavings={cashSavings}
          />
        </div>
      </div>
    </div>
  );
}
