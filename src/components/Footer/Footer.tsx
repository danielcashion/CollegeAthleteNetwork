"use client";

import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  Divider as MUIDivider,
  Typography,
  Box,
} from "@mui/material";
import { LocationOn, Phone, Mail } from "@mui/icons-material";
import Image from "next/image";
import { styled } from "@mui/system";

import ConstrainedWidth from "../ConstrainedWidth";
import Logo from "../../../public/Logos/CANLogo1200x1200White.png";


const Footer = styled("footer")(({ theme }) => ({
  color: "#ED2327", // `${theme.palette.primary.main}`,
  background: "#1C315F",// `${theme.palette.primary.main}`,
  marginTop: "118px",
}));

const FooterContainer = styled("div")({
  width: "100%",
  flexShrink: 0,
  padding: "15px 10px",
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
});

const MenuList = styled(List)({
  display: "flex",
  flexDirection: "row",
  width: "100%",
  alignItems: "center",
  justifyContent: "space-between",
});

const MenuListItemLeft = styled(ListItem)({
  flexDirection: "column",
  alignItems: "flex-start",
});

const MenuListItemRight = styled(ListItem)({
  flexDirection: "column",
  alignItems: "flex-end",
});

const LogoImage = styled(Image)({
  width: "121px",
  height: "108px",
});

const MenuItemText = styled("a")({
  color: "white",
  textDecoration: "none",
  "& .MuiListItemText-root": {
    margin: 0,
  },
});

const FooterInfo = styled("div")(({ theme }) => ({
  width: "100%",
  marginBottom: "10px",
  marginTop: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  [theme.breakpoints.down("lg")]: {
    flexDirection: "column",
  },
}));

const MuiBoxRoot = styled("div")({
  width: "100%",
});

const InfoText = styled(Typography)({
  color: "white",
});

const CopyRightText = styled(Typography)({
  color: "white",
  textAlign: "center",
});

const Divider = styled(MUIDivider)({
  backgroundColor: "white !important",
  "&.MuiDivider-root": {
    borderColor: "white !important",
  },
});

const LocationOnIcon = styled(LocationOn)({
  color: "white",
  marginRight: "8px !important",
});

const PhoneIcon = styled(Phone)({
  color: "white",
  marginRight: "8px !important",
});

const MailIcon = styled(Mail)({
  color: "white",
  marginRight: "8px !important",
});

const AppFooter: React.FC = () => {
  return (
    <Footer>
      <ConstrainedWidth>
        <FooterContainer>
          <MuiBoxRoot>
            <MenuList>
              <MenuListItemLeft>
                <MenuItemText
                  href="https://www.tourneymaster.org/privacy-policy/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ListItemText primary="Privacy Policy" />
                </MenuItemText>
                <MenuItemText
                  href="https://www.tourneymaster.org/terms-of-service/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ListItemText primary="Terms of Service" />
                </MenuItemText>
              </MenuListItemLeft>
              <LogoImage src={Logo.src} height={120} width={120} alt="Logo" />
              <MenuListItemRight>
                <MenuItemText href="mailto:support@clublacrosse.org">
                  <ListItemText primary="Support" />
                </MenuItemText>
                <MenuItemText
                  href="https://www.tourneymaster.org/about/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ListItemText primary="About" />
                </MenuItemText>
              </MenuListItemRight>
            </MenuList>
            <Divider />
            <FooterInfo>
              <Box display="flex" alignItems="center">
                <LocationOnIcon
                  sx={{
                    color: "white",
                    marginRight: 8,
                  }}
                />
                <InfoText variant="body1">
                  One World Trade Center, Suite 8500, New York NY 10007
                </InfoText>
              </Box>
              <Box display="flex" alignItems="center">
                <PhoneIcon
                  sx={{
                    color: "white",
                    marginRight: 8,
                  }}
                />
                <InfoText variant="body1">+1.212.377.7020</InfoText>
              </Box>
              <Box display="flex" alignItems="center">
                <MailIcon
                  sx={{
                    color: "white",
                    marginRight: 8,
                  }}
                />
                <InfoText variant="body1">
                  <MenuItemText href="mailto:support@clublacrosse.org">
                    support@clublacrosse.org
                  </MenuItemText>
                </InfoText>
              </Box>
            </FooterInfo>
            <CopyRightText variant="body1">
              The College Athlete Network, LLC &copy; 2025
            </CopyRightText>
          </MuiBoxRoot>
        </FooterContainer>
      </ConstrainedWidth>
    </Footer>
  );
};

export default AppFooter;
