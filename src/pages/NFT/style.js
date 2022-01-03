import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles({
  actionContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
  },
  actionButton: {
    width: 150,
  },
});

export const useNFTCardStyles = makeStyles((theme) => ({
  cardRoot: {
    width: "285px",
    margin: "10px 5px",
    position: "relative",
    transition: "transform .2s",
    cursor: "pointer",
    "&:hover": {
      transform: "scale(1.05)",
    },
  },
  cardHeaderTitle: {
    fontSize: "15px",
    fontWeight: "500",
    overflow: "hidden",
  },
  cardHeaderSubheader: {
    fontSize: "10px",
    textTransform: "uppercase",
    fontWeight: "400",
    letterSpacing: "2px",
  },
  cardMedia: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "380",
    minHeight: "380px",
    paddingTop: "56.25%", // 16:9
  },
  cardAvatar: {},
  cardContent: {
    fontSize: "14px",
    fontWeight: "400",
    padding: "0 4px",
    height: "40px",
    textAlign: "center",
  },
  cardActions: {
    justifyContent: "space-between",
    padding: "5px 15px 5px 15px",
    fontSize: "14px",
    fontWeight: "500",
  },
  cardArtist: {
    justifyContent: "flex-start",
    padding: "0px 15px 15px 15px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#870FE5",
  },
  artistName: {
    paddingRight: "8px",
  },
  socialContainer: {
    lineHeight: 0,
    transition: "all .2s ease-in-out",

    "&:hover": {
      transform: "scale(1.5)",
    },
  },
  socialIcon: {
    paddingLeft: "5px",
    paddingRight: "5px",
    width: "28px",
    height: "28px",
  },
  redeemButton: {
    backgroundColor: "#E0CCFC",
    borderColor: "#E0CCFC",
    fontSize: "14px",
    width: "120px",
  },

  redeemLabel: {
    fontSize: "14px",
    color: "#6202EE",
    fontWeight: "400",
  },

  cardSupplyRow: {
    maxHeight: "40px",
    display: "flex",
    marginTop: "-40px",
    justifyContent: "center",
    position: "absolute",
    width: "285px",
  },
  cardSupplyBlock: {
    fontSize: "12px",
    lineHeight: "12px",
    fontWeight: "400",
    display: "flex",
    color: "#f0f0f0",
  },
  cardSupplyMax: {
    width: "90px",
    height: "40px",
    background: "#E6007A",
    textAlign: "center",
    borderRadius: "5px 0 0 0",
  },
  cardSupplyToken: {
    width: "90px",
    height: "40px",
    background: "#870FE5",
    textAlign: "center",
    borderRadius: "0 5px 0 0",
  },
  cardSupplyValue: {
    fontSize: "14px",
    fontWeight: "bold",
    lineHeight: "18px",
    paddingTop: "4px",
    color: "#ffffff",
  },
  animationModal: {
    width: "100%",
    height: "100%",
  },
  volume: {
    position: "absolute",
    top: 10,
    left: 10,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    height: 30,
    borderRadius: 5,
    cursor: "pointer",
  },
  resize: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    width: 30,
    height: 30,
    borderRadius: 5,
    cursor: "pointer",
  },
  modal: {
    height: "90%",
    position: "fixed",
    top: "0%",
    left: "0%",
    // transform: "translate((-50%, -50%))",
    background: "#000",
    zIndex: 9999,
    borderRadius: "10px",

    "@media (max-width: 900px)": {
      height: "70%",
    },

    "&__close": {
      position: "absolute",
      top: 10,
      right: 10,
      width: 50,
      height: 50,
      background: "transparent",
      cursor: "pointer",
      border: "none",
      zIndex: 9999,
    },
  },

  modalWrapper: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
  },
}));

export const useConfirmRedeemStyles = makeStyles((theme) => ({
  bodyContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
}));
