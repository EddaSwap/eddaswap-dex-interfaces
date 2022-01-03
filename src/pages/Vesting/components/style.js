import { makeStyles } from '@material-ui/core/styles';

export const useStyles = makeStyles((theme) => ({
  vestingCollapseContainer: {
    marginBottom: 24,
  },
  vestingPairTokenLogo: {
    marginRight: 10,
  },
  accordionSummary: {
    padding: theme.spacing(1, 5),
  },
  vestingCollapseBodyRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  vestingValueContainer: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    marginTop: 5,
    marginBottom: 5,
  },
  vestingButtonContainer: {
    justifyContent: 'flex-end',
    display: 'flex',
    paddingRight: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      justifyContent: 'center',
      paddingRight: 0,
      margin: theme.spacing(1, 0),
    },
  },
  vestingButton: {
    width: 190,
    padding: theme.spacing(1.5, 3),
  },
  tvlAmountContainer: {
    paddingRight: 20,
    display: 'flex',
    justifyContent: 'flex-end',
    [theme.breakpoints.down('md')]: {
      justifyContent: 'flex-start',
      paddingRight: 0,
      marginTop: 10,
    },
  },
  tvlAmountBox: {
    padding: theme.spacing(1, 2),
    textAlign: 'left',
    width: '100%',
  },
  tvlTitle: {
    color: `${theme.palette.common.raven} !important`,
    textTransform: 'uppercase',
    fontWeight: 600,
  },
  questionIcon: {
    marginLeft: 20,
  },
  unlockContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenContainer: {
    textAlign: 'left',
    display: 'flex',
    alignItems: 'center',
  },
  tokenSymbol: {
    marginLeft: theme.spacing(1),
  },
}));
