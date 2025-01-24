"use client";
import "../../styles/customStyles.css";
import * as React from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

function createData(
  universityName: string,
  sport: number,
  totalAthletes: number,
  totalLinkedInProfiles: number,
  totalRoosters: number,
  firstYear: string,
  lastYear: string
) {
  return {
    universityName,
    sport,
    totalAthletes,
    totalLinkedInProfiles,
    totalRoosters,
    firstYear,
    lastYear,
    history: [
      {
        sport: "Football",
        totalAthletes: 219,
        totalLinkedInProfiles: 10,
        totalRoosters: 10,
        firstYear: "2000",
        lastYear: "2024",
      },
      {
        sport: "Hockey",
        totalAthletes: 219,
        totalLinkedInProfiles: 10,
        totalRoosters: 10,
        firstYear: "2000",
        lastYear: "2024",
      },
      {
        sport: "Baseball",
        totalAthletes: 219,
        totalLinkedInProfiles: 10,
        totalRoosters: 10,
        firstYear: "2000",
        lastYear: "2024",
      },
    ],
  };
}

function Row(props: { row: ReturnType<typeof createData> }) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
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
          {row.sport}
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
                  {row.history.map((historyRow) => (
                    <TableRow key={historyRow.sport}>
                      <TableCell />
                      <TableCell align="left" sx={{ fontSize: "medium" }}>
                        {historyRow.sport}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "medium" }}>
                        {historyRow.totalAthletes}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "medium" }}>
                        {historyRow.totalLinkedInProfiles}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "medium" }}>
                        {historyRow.totalRoosters}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "medium" }}>
                        {historyRow.firstYear}
                      </TableCell>
                      <TableCell align="center" sx={{ fontSize: "medium" }}>
                        {historyRow.lastYear}
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

const rows = [
  createData("Middlebury", 11, 428, 376, 32, "2000", "2005"),
  createData("PENN", 11, 428, 376, 32, "2000", "2005"),
  createData("Harvard", 11, 428, 376, 32, "2000", "2005"),
  createData("Princeton", 11, 428, 376, 32, "2000", "2005"),
  createData("New York", 11, 428, 376, 32, "2000", "2005"),
  createData("MIT", 11, 428, 376, 32, "2000", "2005"),
];

export default function DataTables() {
  return (
    <div className="container mx-auto py-16">
      <h2 className="text-5xl font-bold text-center mb-8 text-[#ED3237] tracking-wider small-caps">
        Sample Data
      </h2>

      <TableContainer className="shadow-lg bg-white rounded-3xl">
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
                University Name
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  color: "white",
                  fontSize: "medium",
                  fontWeight: "bold",
                }}
              >
                Total Sports
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  color: "white",
                  fontSize: "medium",
                  fontWeight: "bold",
                }}
              >
                No. of Athletes
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  color: "white",
                  fontSize: "medium",
                  fontWeight: "bold",
                }}
              >
                No. of LinkedIn Profiles
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  color: "white",
                  fontSize: "medium",
                  fontWeight: "bold",
                }}
              >
                No. of Roosters
              </TableCell>
              <TableCell
                align="left"
                sx={{
                  color: "white",
                  fontSize: "medium",
                  fontWeight: "bold",
                }}
              >
                First year
              </TableCell>
              <TableCell
                align="left"
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
            {rows.map((row) => (
              <Row key={row.universityName} row={row} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
