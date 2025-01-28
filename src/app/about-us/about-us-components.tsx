import { Box, Typography, Button } from "@mui/material";
import Image from "next/image";
import CANColorLogo from "../../../public/Logos/CANLogo1200X1200Color.png";
// import CANColorLogo from "../../public/Logos/CANLogo1200X1200Color.png";


export const AboutUsSection = () => (
  <Box
    sx={{
      background: "linear-gradient(90deg, #1C315F, #142244)",
      color: "white",
      textAlign: "center",
      py: 10,
      px: 3,
    }}
  >
    <Typography variant="h2" gutterBottom sx={{ fontWeight: 700 }}>
      About Us
    </Typography>
    <Typography variant="h5" gutterBottom sx={{ fontWeight: 500, mb: 4 }}>
      Empowering Athletes, Building Futures
    </Typography>
    <Typography
      variant="body1"
      sx={{ maxWidth: "800px", margin: "0 auto", mb: 4 }}
    >
      At The College Athlete Network, we believe in empowering college athletes
      to succeed beyond the field, court, or track. Our journey began when we
      noticed a glaring problem: universities were relying on outdated, manual
      processes to connect their athletes with alumni for career opportunities.
      These processes often revolved around spreadsheets that quickly became
      outdated, leaving valuable connections untapped and athletes underserved.
      <br />
      <br />
      We saw an opportunity to make a difference. By introducing a professional
      workflow, we’ve taken the burden of maintaining and updating these
      networks off the shoulders of university administrations and placed it in
      the hands of a trusted partner — us. Our platform seamlessly maps present
      and historical team rosters with current LinkedIn profiles, including work
      histories, providing a dynamic and up-to-date networking solution.
      <br />
      <br />
      With cross-filters for industries, geographies, experience levels, and
      graduation years, we’ve made it easier than ever for athletes to find
      relevant connections and opportunities. Our mission is to ensure that
      every athlete has the tools they need to transition from collegiate sports
      to thriving professional careers, supported by a powerful alumni network.
      <br />
      <br />
      We’re proud to be revolutionizing the way universities support their
      athletes, turning what was once a tedious, manual task into an efficient
      and impactful solution. Together, we’re building stronger athlete networks
      and brighter futures.
    </Typography>
    <Button
      variant="contained"
      sx={{
        backgroundColor: "white",
        color: "#1C315F",
        borderRadius: "50px",
        px: 4,
        py: 1.5,
        fontWeight: "bold",
        ":hover": { backgroundColor: "#F2F5F7" },
      }}
    >
      Learn More
    </Button>
  </Box>
);

export const MissionSection = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: { xs: "column", md: "row" },
      alignItems: "center",
      gap: 6,
      py: 8,
      px: 3,
      maxWidth: "1200px",
      margin: "0 auto",
    }}
  >
    <Box sx={{ flex: 1 }}>
      <Image
        src={CANColorLogo}
        alt="Our Mission"
        style={{ width: "100%", borderRadius: "8px" }}
      />
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ fontWeight: 700, color: "#1C315F" }}
      >
        Our Mission
      </Typography>
      <Typography variant="body1" sx={{ color: "#555", lineHeight: 1.6 }}>
        Our mission is to empower student-athletes by providing them with the
        resources, mentorship, and opportunities they need to excel both on and
        off the field. We are dedicated to bridging the gap between collegiate
        athletics and professional careers, equipping athletes with the tools to
        succeed academically, athletically, and professionally.
        <br />
        <br />
        We believe in fostering a community that champions teamwork, leadership,
        and personal growth, ensuring that every student-athlete is prepared to
        thrive in their future endeavors. By connecting athletes with alumni and
        creating a strong support network, we aim to build lasting relationships
        that inspire success and drive meaningful impact.
      </Typography>
    </Box>
  </Box>
);
