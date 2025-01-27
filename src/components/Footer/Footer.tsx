"use client";

import React, { useEffect, useState } from "react";
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

const Footer = styled("footer")(() => ({
  color: "#ED2327", // `${theme.palette.primary.main}`,
  background: "#1C315F", // `${theme.palette.primary.main}`,
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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Footer>
      <ConstrainedWidth>
        <FooterContainer>
          <MuiBoxRoot>
            <MenuList>
              <MenuListItemLeft>
                <MenuItemText href="/privacy-policy" target="_blank">
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
              <Image
                src={Logo}
                height={110}
                width={110}
                alt="Logo"
                priority={true}
              />
              <MenuListItemRight>
                <MenuItemText href="mailto:support@collegeathletenetwork.org">
                  <ListItemText primary="Support" />
                </MenuItemText>
                <MenuItemText
                  href="https://www.collegeathletenetwork.org/about/"
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
                <LocationOnIcon />
                <InfoText variant="body1">
                  One World Trade Center, Suite 8500, New York NY 10007
                </InfoText>
              </Box>
              <Box display="flex" alignItems="center">
                <PhoneIcon />
                <InfoText variant="body1">+1.212.377.7020</InfoText>
              </Box>
              <Box display="flex" alignItems="center">
                <MailIcon />
                <InfoText variant="body1">
                  <MenuItemText href="mailto:info@collegeathletenetwork.org">
                    info@collegeathletenetwork.org
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
