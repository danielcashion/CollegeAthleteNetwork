"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
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

  return (
    <div className="container mx-auto py-16">
      <h2 className="text-5xl font-bold text-center mb-4 text-[#ED3237] tracking-wider small-caps">
        Actual Data on a Few Sample Universities
      </h2>
      <h5 className="text-xl font-bold text-center mb-8 text-[#ED3237] tracking-wider small-caps">
        As of Jan 2025
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
              <TableCell
                align="center"
                sx={{
                  color: "white",
                  fontSize: "medium",
                  fontWeight: "bold",
                }}
              >
                Total No. Sports
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: "white",
                  fontSize: "medium",
                  fontWeight: "bold",
                }}
              >
                No. of Athletes
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: "white",
                  fontSize: "medium",
                  fontWeight: "bold",
                }}
              >
                No. of LinkedIn Profiles
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: "white",
                  fontSize: "medium",
                  fontWeight: "bold",
                }}
              >
                % Covered
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: "white",
                  fontSize: "medium",
                  fontWeight: "bold",
                }}
              >
                No. of Rosters
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: "white",
                  fontSize: "medium",
                  fontWeight: "bold",
                }}
              >
                First year
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  color: "white",
                  fontSize: "medium",
                  fontWeight: "bold",
                }}
              >
                Last year
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
