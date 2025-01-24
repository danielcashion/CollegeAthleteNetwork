"use client";
import * as React from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

interface SportItem {
  sport: string;
  num_total: number;
  num_found: number;
  num_rosters: number;
  first_roster: string;
  max_roster: string;
}

interface UniversityRow {
  universityName: string;
  totalSports: number;
  totalAthletes: number;
  totalLinkedInProfiles: number;
  totalRosters: number;
  firstYear: number;
  lastYear: number;
  sports: SportItem[];
}

const formatNumber = (num: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(num);


function DataRow({ row }: { row: UniversityRow }) {
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      {/* Main row for the university */}
      <TableRow
        sx={{
          "& > *": { borderBottom: "unset" },
          margin: 2,
          backgroundColor: "#F2F5F7",
        }}
      >
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontSize: "medium" }}>{row.universityName}</TableCell>
        <TableCell align="center" sx={{ fontSize: "medium" }}>
          {row.totalSports}
        </TableCell>
        <TableCell align="center" sx={{ fontSize: "medium" }}>
          {formatNumber(row.totalAthletes)}
        </TableCell>
        <TableCell align="center" sx={{ fontSize: "medium" }}>
          {formatNumber(row.totalLinkedInProfiles)}
        </TableCell>
        <TableCell align="center" sx={{ fontSize: "medium" }}>
          {((row.totalLinkedInProfiles / row.totalAthletes)*100).toFixed(1)}%
        </TableCell>
        <TableCell align="center" sx={{ fontSize: "medium" }}>
          {formatNumber(row.totalRosters)}
        </TableCell>
        <TableCell align="center" sx={{ fontSize: "medium" }}>
          {row.firstYear}
        </TableCell>
        <TableCell align="center" sx={{ fontSize: "medium" }}>
          {row.lastYear}
        </TableCell>
      </TableRow>

      {/* Collapsible row for sports under this university */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, width: "100%" }}>
              {/* <p className="text-[18px]">Sports </p> */}
              <Table size="medium" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell
                      align="left"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "medium",
                      }}
                    >
                      Sport
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "medium",
                      }}
                    >
                      Total Athletes
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "medium",
                      }}
                    >
                      Mapped LinkedIn Profiles
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "medium",
                      }}
                    >
                      # of Roster Years
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "medium",
                      }}
                    >
                      First Roster Year
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "medium",
                      }}
                    >
                      Most Recent Roster Year
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.sports.map((sportItem, index) => (
                    <TableRow key={`${sportItem.sport}-${index}`}>
                      <TableCell />
                      <TableCell align="left" sx={{ fontSize: "medium" }}>
                        {sportItem.sport}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "medium" }}>
                        {sportItem.num_total}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "medium" }}>
                        {sportItem.num_found}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "medium" }}>
                        {sportItem.num_rosters}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "medium" }}>
                        {sportItem.first_roster}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "medium" }}>
                        {sportItem.max_roster}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default DataRow;
