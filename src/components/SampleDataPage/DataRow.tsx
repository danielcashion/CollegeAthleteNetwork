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
  totalRoosters: number;
  firstYear: number;
  lastYear: number;
  sports: SportItem[];
}

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
        <TableCell align="left" sx={{ fontSize: "medium" }}>
          {row.totalSports}
        </TableCell>
        <TableCell align="left" sx={{ fontSize: "medium" }}>
          {row.totalAthletes}
        </TableCell>
        <TableCell align="left" sx={{ fontSize: "medium" }}>
          {row.totalLinkedInProfiles}
        </TableCell>
        <TableCell align="left" sx={{ fontSize: "medium" }}>
          {row.totalRoosters}
        </TableCell>
        <TableCell align="left" sx={{ fontSize: "medium" }}>
          {row.firstYear}
        </TableCell>
        <TableCell align="left" sx={{ fontSize: "medium" }}>
          {row.lastYear}
        </TableCell>
      </TableRow>

      {/* Collapsible row for sports under this university */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 2, width: "100%" }}>
              <p className="text-[18px]">Sports Categorized</p>
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
                      Total LinkedIn Profiles
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "medium",
                      }}
                    >
                      Total Roosters
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "medium",
                      }}
                    >
                      First Year
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        fontWeight: "bold",
                        fontSize: "medium",
                      }}
                    >
                      Last Year
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
