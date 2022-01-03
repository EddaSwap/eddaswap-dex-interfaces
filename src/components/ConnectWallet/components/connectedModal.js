import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import Button from "components/Button";
import { FiExternalLink, FiCopy } from "react-icons/fi";
import { shortenAddress } from "lib/stringHelper";
import { isMobile, isTablet } from "react-device-detect";
import { useWeb3React } from "@web3-react/core";
import {
  EXPLORER_LINK_BY_CHAIN,
  EXPLORER_NAME_BY_CHAIN,
} from "constants/address";

const useStyles = makeStyles({
  title: {
    marginBottom: "1rem",
    "& span": {
      fontSize: 20,
      fontWeight: "bold",
    },
  },

  address: {
    wordWrap: "break-word",
  },
});

const ConnectedModal = (props) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { onDisconnect = () => {} } = props;

  const web3Context = useWeb3React();
  const { account, chainId } = web3Context;
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (textToCopy) => {
    // navigator clipboard api needs a secure context (https)
    if (navigator.clipboard && window.isSecureContext) {
      // navigator clipboard api method'
      return navigator.clipboard.writeText(textToCopy);
    } else {
      // text area method
      let textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      // make the textarea out of viewport
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      return new Promise((res, rej) => {
        // here the magic happens
        document.execCommand("copy") ? res() : rej();
        textArea.remove();
      });
    }
  };

  return (
    <div className="connected-modal">
      <div className={classes.title}>
        <span>{t("component.modal.yourWallet")}</span>
      </div>

      <div className="connected-address">
        <span className={classes.address}>
          {isTablet || isMobile ? shortenAddress(account) : account}
        </span>
      </div>

      <div className="connected-action-container">
        <a
          href={`${EXPLORER_LINK_BY_CHAIN[chainId]}/address/${account}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button
            text
            label={
              <div className="connected-button-container">
                <span className="connected-button">
                  {t("component.modal.viewBSCscan")}{" "}
                  {EXPLORER_NAME_BY_CHAIN[chainId]}
                </span>
                <FiExternalLink size={20} className="icons" />
              </div>
            }
          />
        </a>
        <div className="connected-button-container">
          <Button
            text
            label={
              <div className="connected-button-container">
                <span className="connected-button">
                  {copied
                    ? t("component.modal.copyAddress.copied")
                    : t("component.modal.copyAddress")}
                </span>
                <FiCopy size={20} className="icons" />
              </div>
            }
            onClick={() => {
              copyToClipboard(account).then(() => {
                setTimeout(() => {
                  setCopied(false);
                }, 3000);
                setCopied(true);
              });
            }}
          />
        </div>
      </div>
      <div className="disconnect-button-container">
        <Button
          label={t("header.connectWallet.deactivate")}
          onClick={() => onDisconnect()}
          className="btn-gradient"
        />
      </div>
    </div>
  );
};

export default ConnectedModal;
