/**
=========================================================
* Material Dashboard 2 PRO React - v2.2.1
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-pro-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// Material Dashboard 2 PRO React base styles
import boxShadows from "@/theme/base/boxShadows";
import typography from "@/theme/base/typography";
import colors from "@/theme/base/colors";
import borders from "@/theme/base/borders";

// Material Dashboard 2 PRO React helper functions
import pxToRem from "@/theme/functions/pxToRem";

const { lg } = boxShadows;
const { size } = typography;
const { text, white } = colors;
const { borderRadius } = borders;

const menu = {
  defaultProps: {
    disableAutoFocusItem: true,
  },

  styleOverrides: {
    paper: {
      minWidth: pxToRem(160),
      boxShadow: lg,
      padding: `${pxToRem(16)} ${pxToRem(8)}`,
      fontSize: size.sm,
      color: text.main,
      textAlign: "left",
      backgroundColor: white.main,
      borderRadius: borderRadius.md,
    },
  },
};

export default menu;
