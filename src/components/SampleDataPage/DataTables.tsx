"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Tooltip from "@mui/material/Tooltip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import DataRow from "./DataRow";
import { prepareData } from "@/services/PrepareData";

export default function DataTables({ data }: { data: any[] }) {
  // Prepare the grouped data
  const rows = React.useMemo(() => {
    if (!data || data.length === 0) return [];
    return prepareData(data);
  }, [data]);

  const headerTooltips = {
    university: "The name of the university",
    totalSports:
      "Unique sports. If the schools has Men & Women teams, it is counted as one sport",
    athletes: "The number of unique athletes",
    linkedInProfiles: "The number of athletes we found with LinkedIn profiles",
    coverage: "The percentage of athletes covered on LinkedIn",
    rosters: "The total number of rosters",
    earliestRoster: "The year of the earliest roster",
    recentRoster: "The year of the most recent roster",
  };

  return (
    <div className="container mx-auto py-16 px-4">
      <h3 className="text-5xl font-bold text-center mb-4 text-[#ED3237] tracking-wider small-caps">
        Actual Data on a Few Sample Universities
      </h3>
      <h5 className="text-xl font-bold text-center mb-8 text-[#ED3237] tracking-wider small-caps">
        Data as of March 2025
      </h5>

      <TableContainer className="shadow-lg bg-white rounded-2xl">
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow
              sx={{
                margin: 2,
                backgroundColor: "#1C315F",
              }}
            >
              <TableCell
                sx={{
                  color: "white",
                  fontSize: "medium",
                  fontWeight: "bold",
                }}
              />
              <TableCell
                align="left"
                sx={{
                  color: "white",
                  fontSize: "medium",
                  fontWeight: "bold",
                }}
              >
                University
              </TableCell>
              <Tooltip
                title={
                  <span style={{ display: "block", textAlign: "center" }}>
                    {headerTooltips.totalSports}
                  </span>
                }
                placement="top"
              >
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontSize: "medium",
                    fontWeight: "bold",
                  }}
                >
                  Total # Sports (M&W)
                </TableCell>
              </Tooltip>
              <Tooltip
                title={
                  <span style={{ display: "block", textAlign: "center" }}>
                    {headerTooltips.totalSports}
                  </span>
                }
                placement="top"
              >
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontSize: "medium",
                    fontWeight: "bold",
                  }}
                >
                  # of Athletes
                </TableCell>
              </Tooltip>
              <Tooltip
                title={
                  <span style={{ display: "block", textAlign: "center" }}>
                    {headerTooltips.linkedInProfiles}
                  </span>
                }
                placement="top"
              >
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontSize: "medium",
                    fontWeight: "bold",
                  }}
                >
                  # of LinkedIn Profiles
                </TableCell>
              </Tooltip>
              <Tooltip
                title={
                  <span style={{ display: "block", textAlign: "center" }}>
                    {headerTooltips.coverage}
                  </span>
                }
                placement="top"
              >
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontSize: "medium",
                    fontWeight: "bold",
                  }}
                >
                  % Mapped
                </TableCell>
              </Tooltip>
              <Tooltip
                title={
                  <span style={{ display: "block", textAlign: "center" }}>
                    {headerTooltips.rosters}
                  </span>
                }
                placement="top"
              >
                <TableCell
                  align="center"
                  sx={{
                    color: "white",
                    fontSize: "medium",
                    fontWeight: "bold",
                  }}
                >
                  # of Rosters
                </TableCell>
              </Tooltip>
              <TableCell
                align="center"
                sx={{
                  color: "white",
                  fontSize: "medium",
                  fontWeight: "bold",
                }}
              >
                Earliest Roster
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: "white",
                  fontSize: "medium",
                  fontWeight: "bold",
                }}
              >
                Most Recent Roster
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row: any) => (
              <DataRow key={row.universityName} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
