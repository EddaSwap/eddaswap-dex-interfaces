import { createMuiTheme } from '@material-ui/core/styles';

export const colors = {
  darkBlack: '#23262f',
  white: '#fff',
  error: '#e6007a',
  pink: '#E6007A',
  dark: '#23262F',
  gray: '#EDF2F7',
  background: '#000',
  green: '#24B60C',
  tuna: '#353945',
  raven: '#777E90', //grey
  blue: '#4C6FFF',
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
      buttonColor: colors.white,
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
      color: colors.white,
    },
    h2: {
      color: colors.white,
    },
    h3: {
      color: colors.white,
    },
    h4: {
      color: colors.white,
    },
    h5: {
      color: colors.white,
    },
    body1: {
      color: colors.white,
    },
    body2: {
      color: colors.white,
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
        backgroundColor: colors.dark,
        color: colors.white,
      },
      elevation1: {
        boxShadow: 'none',
      },
    },
    MuiButton: {
      root: {
        // backgroundColor: colors.blue,
        color: colors.white,
      },
      outlined: {
        padding: '10px 24px',
        borderWidth: '2px !important',
      },
      text: {
        padding: '8px 24px',
        backgroundColor: 'initial',
      },
      label: {
        textTransform: 'none',
        fontSize: '16px',
      },
      contained: {
        backgroundColor: colors.pink,
        borderRadius: '6px',
        padding: '10px 24px',
        '&.Mui-disabled .MuiButton-label': {
          color: colors.raven,
        },
      },
    },
    MuiCircularProgress: {
      root: {
        color: `${colors.white} !important`,
      },
    },
    MuiTypography: {
      colorError: {
        color: `${colors.error} !important`,
      },
    },
    MuiSelect: {
      root: {
        color: colors.white,
      },
      icon: {
        color: colors.white,
      },
    },
    MuiSvgIcon: {
      root: {
        color: colors.white,
      },
    },
    MuiTabs: {
      root: {
        borderColor: colors.gray,
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
        backgroundColor: `${colors.gray} !important`,
      },
    },
    MuiAccordionSummary: {
      root: {
        backgroundColor: colors.dark,
        border: `1px solid ${colors.dark}`,
      },
    },
    MuiAccordionDetails: {
      root: {
        backgroundColor: colors.background,
        border: `1px solid ${colors.dark}`,
      },
    },
    MuiCard: {
      root: {
        backgroundColor: colors.dark,
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
