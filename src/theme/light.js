import { createMuiTheme } from '@material-ui/core/styles';

export const colors = {
  darkBlack: '#272727', //used
  light: '#f9fafb',
  white: '#fff',
  blue: '#2f80ed',
  error: '#e6007a',
  gray: '#EDF2F7', //EDF2F7
  pink: '#E6007A',
  dark: '#23262F',
  lightGray: '#E6E8EC',
  tuna: '#353945',
  bg: '#f9fafb',
  raven: '#777E90', //grey
};

// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    common: colors,
    primary: {
      main: '#fff',
    },
    secondary: {
      main: '#F7FAFC', //colors.pink
      buttonColor: colors.dark,
    },
    error: {
      main: '#000',
    },
    background: {
      default: '#F7FAFC',
    },
  },
  shape: {
    borderRadius: 20,
  },
  typography: {
    h1: {
      color: colors.darkBlack,
    },
    h2: {
      color: colors.darkBlack,
    },
    h3: {
      color: colors.darkBlack,
    },
    h4: {
      color: colors.darkBlack,
    },
    h5: {
      color: colors.darkBlack,
    },
    body1: {
      color: colors.darkBlack,
    },
    body2: {
      color: colors.darkBlack,
    },
    a: {
      textDecoration: 'none',
    },
  },
  type: 'light',
  overrides: {
    MuiSnackbar: {
      root: {
        maxWidth: 'calc(100vw - 24px)',
      },
      anchorOriginBottomLeft: {
        bottom: '12px',
        left: '12px',
        '@media (min-width: 960px)': {
          bottom: '50px',
          left: '80px',
        },
      },
    },
    MuiSnackbarContent: {
      root: {
        backgroundColor: colors.white,
        padding: '0px',
        minWidth: 'auto',
        '@media (min-width: 960px)': {
          minWidth: '500px',
        },
      },
      message: {
        padding: '0px',
      },
      action: {
        marginRight: '0px',
      },
    },
    MuiInput: {
      underline: {
        '&:before': {
          //underline color when textfield is inactive
          borderBottom: 'none !important',
        },
        '&:after': {
          //underline color when textfield is inactive
          borderBottom: 'none !important',
        },
      },
    },
    MuiPaper: {
      root: {
        backgroundColor: colors.white,
        color: colors.darkBlack,
      },
      elevation1: {
        boxShadow: 'none',
      },
    },
    MuiButton: {
      root: {
        backgroundColor: colors.pink,
        '&:hover': {
          opacity: 0.8,
          transform: 'scale(1.02) perspective(1px)',
        },
      },
      outlined: {
        padding: '10px 24px',
        borderWidth: '2px !important',
      },
      text: {
        backgroundColor: 'initial',
        '&:hover': {
          backgroundColor: 'transparent !important',
          opacity: 0.8,
          transform: 'scale(1.02) perspective(1px)',
        },
        '& .MuiButton-label': {
          color: `${colors.darkBlack} !important`,
        },
      },
      label: {
        textTransform: 'none',
        fontSize: '16px',
        color: `${colors.white} !important`,
      },
      contained: {
        backgroundColor: colors.pink,
      },
    },
    MuiCircularProgress: {
      root: {
        color: `${colors.darkBlack} !important`,
      },
    },
    MuiTypography: {
      colorError: {
        color: `${colors.error} !important`,
      },
    },
    MuiSelect: {
      root: {
        color: colors.darkBlack,
      },
      icon: {
        color: colors.darkBlack,
      },
    },
    MuiSvgIcon: {
      root: {
        color: colors.darkBlack,
      },
    },
    MuiTabs: {
      root: {
        borderColor: '#aeaeae',
      },
    },
    MuiTab: {
      textColorInherit: {
        '&.Mui-selected': {
          backgroundColor: colors.blue,
        },
      },
    },
    MuiSwitch: {
      switchBase: {
        '&$checked + $track': {
          backgroundColor: `${colors.pink} !important`,
        },
      },
      track: {
        backgroundColor: `${colors.dark} !important`,
      },
      thumb: {
        color: `${colors.white} !important`,
      },
    },
    MuiAccordionSummary: {
      root: {
        backgroundColor: colors.white,
        border: `1px solid ${colors.lightGray}`,
      },
    },
    MuiAccordionDetails: {
      root: {
        backgroundColor: colors.white,
        border: `1px solid ${colors.lightGray}`,
      },
    },
    MuiCard: {
      root: {
        backgroundColor: colors.white,
      },
    },
    MuiDivider: {
      root: {
        backgroundColor: colors.tuna,
      },
    },
  },
});

export default theme;
