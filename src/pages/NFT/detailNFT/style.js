import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  root: {
    flex: 1,
    flexDirection: "column",
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "center",
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  investedContainer: {
    display: "flex",
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    minWidth: "100%",
    marginBottom: "90px",

    [theme.breakpoints.up("md")]: {
      marginTop: "40px",
      minWidth: "900px",
    },
  },
  container: {
    display: "flex",
    flexFlow: "wrap",

    justifyContent: "center",
    [theme.breakpoints.up("md")]: {
      flexDirection: "row",
      justifyContent: "normal",
    },
  },
  title: {
    color: "black",
    marginBottom: "20px",
  },
  desc: {
    color: "black",
    fontWeight: "normal",
    fontStyle: "italic",
    marginTop: "5px",
    fontSize: "25px",
    marginBottom: "30px",
  },
  artist: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingTop: "10px",
    paddingBottom: "20px",
  },
  artistAvatar: {
    backgroundColor: "#870FE5",
    marginRight: "10px",
    width: "30px",
    height: "30px",
  },
  artistName: {
    color: "#E6007A",
    fontWeight: 500,
    fontSize: "medium",
  },
  seriesContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: "10px",
  },
  seriesIntro: {
    color: "black",
    fontStyle: "normal",
  },
  seriesName: {
    color: "870FE5",
    fontStyle: "italic",
    fontWeight: 600,
  },
  point: {
    color: "#870FE5",
  },
  attrContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  linkContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: "5px",
    paddingBottom: "5px",
  },
  linkSubContainer: {},
  IPFSLinkContainer: {
    paddingLeft: "20px",
  },
  buttonContainer: {
    marginTop: "20px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-begin",
  },
  sharingContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-begin",
  },
  titleText: {
    color: "grey",
    fontWeight: "bold",
    display: "inline",
  },

  viewText: {
    color: "white",
    fontWeight: "bold",
  },
  viewerContainer: {
    height: "40px",
    padding: "2px",
    margin: "2px",
    width: "96px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1890ff",
    borderRadius: "15px",

    transition: "all .2s ease-in-out",

    "&:hover": {
      transform: "scale(1.2)",
    },
  },
  attrText: {
    color: "black",
    display: "inline",
    fontWeight: 500,
  },
  totalText: {
    color: "grey",
    fontWeight: "bold",
  },
  cardSupplyRow: {
    maxHeight: "40px",
    justifyContent: "center",
    width: "285px",
  },
  cardSupplyBlock: {
    fontSize: "14px",
    lineHeight: "25px",
    fontWeight: "400",
    display: "flex",
    color: "#f0f0f0",
  },
  cardSupplyMax: {
    width: "200px",
    height: "50px",
    background: "#E6007A",
    textAlign: "center",
    borderRadius: "15px 0px 0px 15px",
  },
  cardSupplyToken: {
    width: "200px",
    height: "50px",
    background: "#870FE5",
    textAlign: "center",
    borderRadius: "0 15px 15px 0",
  },
  cardSupplyValue: {
    fontSize: "18px",
    fontWeight: "bold",
    lineHeight: "18px",
    paddingTop: "4px",
    color: "#ffffff",
  },
  icon: {
    transition: "all .2s ease-in-out",

    "&:hover": {
      transform: "scale(1.2)",
    },
  },
  shareText: {
    color: "grey",
    fontWeight: "bold",
    display: "inline",
    paddingLeft: "5px",
  },
  shareTextContainer: {
    paddingRight: "10px",
    height: "40px",
  },
  ipfsText: {
    color: "grey",
    fontWeight: "bold",
    display: "inline",
  },
  ipfsTextContainer: {
    height: "40px",
  },
  openSeaIcon: {
    width: "20px",
    height: "20px",
  },
  openSeaButton: {
    margin: 0,

    display: "flex",
    alignItems: "center",
    background: "rgb(255, 255, 255)",
    borderRadius: "15px",
    boxShadow: "rgba(37, 41, 46, 0.1) 0px 4px 12px",
    color: "rgba(60, 66, 82, 0.8)",
    height: "32px",
    width: "120px",
    marginBottom: "10px",
    marginRight: "10px",
    padding: "0px 10px 2px 6px",
    fontSize: "16px",
    fontWeight: 800,
    transition: "all 0.125s ease 0s",
    willChange: "transform",
  },
  redeemButton: {
    width: "fit-content",
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));
