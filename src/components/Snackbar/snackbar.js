import React from "react";
import { useSelector, useDispatch } from "react-redux";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import { closeSnackbar } from "actions/app/snackbar";
import { useTranslation } from "react-i18next";
import { useWeb3React } from "@web3-react/core";
import {
  EXPLORER_LINK_BY_CHAIN,
  EXPLORER_NAME_BY_CHAIN,
} from "constants/address";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  snackbar: {
    marginTop: 40,
  },
}));

function Alert(props) {
  return (
    <MuiAlert
      elevation={6}
      variant="filled"
      {...props}
      style={{ borderRadius: 10 }}
    />
  );
}

function CustomSnackbar() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { chainId } = useWeb3React();

  const classes = useStyles();

  const { show, type, message, txHash } = useSelector(
    (state) => state.app.snackbar
  );

  const handleClose = () => {
    dispatch(closeSnackbar());
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      open={show}
      autoHideDuration={6000}
      onClose={handleClose}
      className={classes.snackbar}
    >
      <Alert onClose={handleClose} severity={type}>
        {message}
        <br />
        {type === "success" && txHash && (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`${EXPLORER_LINK_BY_CHAIN[chainId]}/tx/${txHash}`}
          >
            ({t("component.modal.viewBSCscan")}){" "}
            {EXPLORER_NAME_BY_CHAIN[chainId]}
          </a>
        )}
      </Alert>
    </Snackbar>
  );
}

export default CustomSnackbar;
