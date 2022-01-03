import { createMuiTheme } from '@material-ui/core/styles';
import PoppinsTTF from 'assets/fonts/poppins-v15-latin-regular.ttf';

const WorkSans = {
  fontFamily: 'Poppins',
  fontStyle: 'normal',
  fontDisplay: 'swap',
  fontWeight: 400,
  src: `
    local('Poppins'),
    local('Poppins'),
    url(${PoppinsTTF}) format('truetype')
  `,
  unicodeRange:
    'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF',
};

// A custom theme for this app
const theme = createMuiTheme({
  palette: {
    common: {
      darkBlack: '#425466', //used
      grey: '#aeaeae',
      light: '#f9fafb',
      darkGrey: '##777E90',
    },
    primary: {
      main: '#fff',
    },
    secondary: {
      main: '#F7FAFC',
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
    fontFamily: ['Poppins', 'sans-serif'].join(','),
    a: {
      textDecoration: 'none',
    },
  },
  type: 'light',
  overrides: {
    MuiCssBaseline: {
      '@global': {
        '@font-face': [WorkSans],
      },
    },
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
      elevation1: {
        boxShadow: 'none',
      },
      rounded: {
        borderRadius: 10,
      },
    },
    MuiButton: {
      root: {
        padding: '5px 0px',
        minWidth: 20, //for icon only button
      },
      outlined: {
        padding: '5px 0px',
      },
      text: {
        padding: '8px 24px',
      },
      label: {
        textTransform: 'none',
        fontSize: '16px',
      },
      contained: {
        borderRadius: 100,
        padding: '10px 24px',
      },
    },
    MuiSwitch: {
      switchBase: {
        '&$checked + $track': {
          opacity: 1,
        },
      },
    },
    MuiAccordionSummary: {
      root: {
        borderRadius: 16,
      },
    },
    MuiAccordionDetails: {
      root: {
        borderRadius: 16,
        marginTop: 20,
      },
    },
    MuiAlert: {
      filledSuccess: {
        backgroundColor: '#D1ECDF',
        border: '1px solid #A9DCC4',
        boxSizing: 'border-box',
        borderRadius: 3,
        color: '#52B987',
        '& .MuiAlert-icon': {
          '& .MuiSvgIcon-root': {
            color: '#52B987',
          },
        },
        '& .MuiAlert-action': {
          '& .MuiSvgIcon-root': {
            color: '#52B987',
          },
        },
      },
      filledError: {
        backgroundColor: '#F7DBDE',
        border: '1px solid #EDBAC0',
        boxSizing: 'border-box',
        borderRadius: 3,
        color: '#D45863',
        '& .MuiAlert-icon': {
          '& .MuiSvgIcon-root': {
            color: '#D45863',
          },
        },
        '& .MuiAlert-action': {
          '& .MuiSvgIcon-root': {
            color: '#D45863',
          },
        },
      },
    },
  },
});

export default theme;
