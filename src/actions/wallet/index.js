import { SUPPORTED_WALLETS } from "constants/supportWallet";
import { UnsupportedChainIdError } from "@web3-react/core";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

export const loadConnectedWallet = (web3Context) => {
  const { activate, error } = web3Context;

  const tryActivation = async (connector) => {
    let conn = typeof connector === "function" ? await connector() : connector;

    // if the connector is walletconnect and the user has already tried to connect, manually reset the connector
    if (
      conn instanceof WalletConnectConnector &&
      conn.walletConnectProvider?.wc?.uri
    ) {
      conn.walletConnectProvider = undefined;
    }

    if (conn && !(error instanceof UnsupportedChainIdError)) {
      try {
        await activate(conn);
      } catch (error) {
        if (error instanceof UnsupportedChainIdError) {
          // activate(conn); // a little janky...can't use setError because the connector isn't set
        } else {
          console.error("error", error);
        }
      }
    }
  };

  const WalletList = Object.values(SUPPORTED_WALLETS);
  const connectedWalletName = localStorage.getItem("edda-user-wallet");

  const connectedWallet = WalletList.find(
    (item) => item.name === connectedWalletName
  );

  if (connectedWallet) {
    return new Promise(async (resolve, reject) => {
      try {
        await tryActivation(connectedWallet.connector);
        resolve();
      } catch (error) {
        reject();
      }
    });
  }
};
