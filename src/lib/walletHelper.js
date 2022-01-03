export function onCorrectNetwork() {
  try {
    if (window && window.ethereum) {
      window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x38`,
            chainName: "Binance Smart Chain",
            nativeCurrency: {
              name: "BNB",
              symbol: "BNB",
              decimals: 18,
            },
            rpcUrls: ["https://bsc-dataseed.binance.org/"],
            blockExplorerUrls: ["https://bscscan.com"],
          },
        ],
      });
    }
  } catch (error) {
    console.log("error", error);
  }
}

export function onSwitchBSCNetwork() {
  try {
    if (window && window.ethereum) {
      window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x38`,
            chainName: "Binance Smart Chain",
            nativeCurrency: {
              name: "BNB",
              symbol: "BNB",
              decimals: 18,
            },
            rpcUrls: ["https://bsc-dataseed.binance.org/"],
            blockExplorerUrls: ["https://bscscan.com"],
          },
        ],
      });
    }
  } catch (error) {
    console.log("error", error);
  }
}

export function onSwitchPolygonNetwork() {
  try {
    if (window && window.ethereum) {
      window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: `0x89`,
            chainName: "Matic Mainnet",
            nativeCurrency: {
              name: "MATIC",
              symbol: "MATIC",
              decimals: 18,
            },
            rpcUrls: ["https://rpc-mainnet.maticvigil.com/"],
            blockExplorerUrls: ["https://explorer.matic.network/"],
          },
        ],
      });
    }
  } catch (error) {
    console.log("error", error);
  }
}
