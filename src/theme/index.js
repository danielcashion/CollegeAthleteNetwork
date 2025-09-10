'use client'

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

// @mui material components
import { createTheme } from "@mui/material/styles";

// Material Dashboard 2 PRO React base styles
import colors from "@/theme/base/colors";
import breakpoints from "@/theme/base/breakpoints";
import typography from "@/theme/base/typography";
import boxShadows from "@/theme/base/boxShadows";
import borders from "@/theme/base/borders";
import globals from "@/theme/base/globals";

// Material Dashboard 2 PRO React helper functions
import boxShadow from "@/theme/functions/boxShadow";
import hexToRgb from "@/theme/functions/hexToRgb";
import linearGradient from "@/theme/functions/linearGradient";
import pxToRem from "@/theme/functions/pxToRem";
import rgba from "@/theme/functions/rgba";

// Material Dashboard 2 PRO React components base styles for @mui material components
import sidenav from "@/theme/components/sidenav";
import list from "@/theme/components/list";
import listItem from "@/theme/components/list/listItem";
import listItemText from "@/theme/components/list/listItemText";
import card from "@/theme/components/card";
import cardMedia from "@/theme/components/card/cardMedia";
import cardContent from "@/theme/components/card/cardContent";
import button from "@/theme/components/button";
import iconButton from "@/theme/components/iconButton";
import input from "@/theme/components/form/input";
import inputLabel from "@/theme/components/form/inputLabel";
import inputOutlined from "@/theme/components/form/inputOutlined";
import textField from "@/theme/components/form/textField";
import menu from "@/theme/components/menu";
import menuItem from "@/theme/components/menu/menuItem";
import switchButton from "@/theme/components/form/switchButton";
import divider from "@/theme/components/divider";
import tableContainer from "@/theme/components/table/tableContainer";
import tableHead from "@/theme/components/table/tableHead";
import tableCell from "@/theme/components/table/tableCell";
import linearProgress from "@/theme/components/linearProgress";
import breadcrumbs from "@/theme/components/breadcrumbs";
import slider from "@/theme/components/slider";
import avatar from "@/theme/components/avatar";
import tooltip from "@/theme/components/tooltip";
import appBar from "@/theme/components/appBar";
import tabs from "@/theme/components/tabs";
import tab from "@/theme/components/tabs/tab";
import stepper from "@/theme/components/stepper";
import step from "@/theme/components/stepper/step";
import stepConnector from "@/theme/components/stepper/stepConnector";
import stepLabel from "@/theme/components/stepper/stepLabel";
import stepIcon from "@/theme/components/stepper/stepIcon";
import select from "@/theme/components/form/select";
import formControlLabel from "@/theme/components/form/formControlLabel";
import formLabel from "@/theme/components/form/formLabel";
import checkbox from "@/theme/components/form/checkbox";
import radio from "@/theme/components/form/radio";
import autocomplete from "@/theme/components/form/autocomplete";
import flatpickr from "@/theme/components/flatpickr";
import container from "@/theme/components/container";
import popover from "@/theme/components/popover";
import buttonBase from "@/theme/components/buttonBase";
import icon from "@/theme/components/icon";
import svgIcon from "@/theme/components/svgIcon";
import link from "@/theme/components/link";
import dialog from "@/theme/components/dialog";
import dialogTitle from "@/theme/components/dialog/dialogTitle";
import dialogContent from "@/theme/components/dialog/dialogContent";
import dialogContentText from "@/theme/components/dialog/dialogContentText";
import dialogActions from "@/theme/components/dialog/dialogActions";

export default createTheme({
  breakpoints: { ...breakpoints },
  palette: { ...colors },
  typography: { ...typography },
  boxShadows: { ...boxShadows },
  borders: { ...borders },
  functions: {
    boxShadow,
    hexToRgb,
    linearGradient,
    pxToRem,
    rgba,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ...globals,
        ...flatpickr,
        ...container,
      },
    },
    MuiDrawer: { ...sidenav },
    MuiList: { ...list },
    MuiListItem: { ...listItem },
    MuiListItemText: { ...listItemText },
    MuiCard: { ...card },
    MuiCardMedia: { ...cardMedia },
    MuiCardContent: { ...cardContent },
    MuiButton: { ...button },
    MuiIconButton: { ...iconButton },
    MuiInput: { ...input },
    MuiInputLabel: { ...inputLabel },
    MuiOutlinedInput: { ...inputOutlined },
    MuiTextField: { ...textField },
    MuiMenu: { ...menu },
    MuiMenuItem: { ...menuItem },
    MuiSwitch: { ...switchButton },
    MuiDivider: { ...divider },
    MuiTableContainer: { ...tableContainer },
    MuiTableHead: { ...tableHead },
    MuiTableCell: { ...tableCell },
    MuiLinearProgress: { ...linearProgress },
    MuiBreadcrumbs: { ...breadcrumbs },
    MuiSlider: { ...slider },
    MuiAvatar: { ...avatar },
    MuiTooltip: { ...tooltip },
    MuiAppBar: { ...appBar },
    MuiTabs: { ...tabs },
    MuiTab: { ...tab },
    MuiStepper: { ...stepper },
    MuiStep: { ...step },
    MuiStepConnector: { ...stepConnector },
    MuiStepLabel: { ...stepLabel },
    MuiStepIcon: { ...stepIcon },
    MuiSelect: { ...select },
    MuiFormControlLabel: { ...formControlLabel },
    MuiFormLabel: { ...formLabel },
    MuiCheckbox: { ...checkbox },
    MuiRadio: { ...radio },
    MuiAutocomplete: { ...autocomplete },
    MuiPopover: { ...popover },
    MuiButtonBase: { ...buttonBase },
    MuiIcon: { ...icon },
    MuiSvgIcon: { ...svgIcon },
    MuiLink: { ...link },
    MuiDialog: { ...dialog },
    MuiDialogTitle: { ...dialogTitle },
    MuiDialogContent: { ...dialogContent },
    MuiDialogContentText: { ...dialogContentText },
    MuiDialogActions: { ...dialogActions },
  },
}, {
  palette: {
    background: {
      default: "#fafafa",
    },
    error: {
      main: "#ED3237",
    },
    primary: {
      main: "#1c315f",
    },
    secondary: {
      main: "#e9effb",
    },
    text: {
      primary: "#373737",
      secondary: "#757575",
    },
  },
  shape: {
    borderRadius: 9,
  },
  typography: {
    fontFamily: "Roboto, sansSerif !important",
    fontSize: 14,
    body1: {
      fontSize: 14,
      fontWeight: 500,
    },
    body2: {
      fontSize: 12,
      fontWeight: 500,
    },

    h1: {
      fontSize: 24,
      fontWeight: "bold",
    },
    h2: {
      fontSize: 24,
      fontWeight: 500,
    },
    h3: {
      fontSize: 18,
      fontWeight: "bold",
    },
    h4: {
      fontSize: 16,
      fontWeight: 900,
    },
    h5: {
      fontSize: 14,
    },
    h6: {
      fontSize: 12,
      fontWeight: "bold",
    },
  },
  components: {
    MuiCardContent: {
      styleOverrides: {
        root: {
          paddingLeft: "10px",
          paddingRight: "10px",
          paddingBottom: "10px",
          paddingTop: "unset",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "5px",
          width: "100px",
          // textAlign: 'left',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          border: "solid 1px #d4d4ce",
        },
        img: {
          backgroundColor: "transparent",
        },
      },
    },
  },
}, {
  palette: {
    accuracy: {
      main: "#f0ac2e",
    },
    event: {
      main: "#73d068",
    },
    player: {
      main: "#c777f2",
    },
    team: {
      main: "#31c2fd",
    },

    // Alert colors
    info: {
      main: "#2196f3",
    },
    success: {
      main: "#4caf50",
    },
    warning: {
      main: "#ff9800",
    },
  },
});
