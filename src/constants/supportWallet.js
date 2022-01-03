import { ChainId } from "@sushiswap/sdk";
import { InjectedConnector } from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";

export const supportedChainIds = [
  // 1, // mainnet
  // 3, // ropsten
  // 4, // rinkeby
  // 5, // goreli
  // 42, // kovan
  // 250, // fantom
  // 4002, // fantom testnet
  137, // matic
  // 80001, // matic testnet
  // 100, // xdai
  56, // binance smart chain
  // 97, // binance smart chain testnet
  // 1287, // moonbase
  // 43114, // avalanche
  // 43113, // fuji
  // 128, // heco
  // 256, // heco testnet
  // 1666600000, // harmony
  // 1666700000, // harmony testnet
  // 66, // okex testnet
  // 65, // okex testnet
  // 42161, // arbitrum
  // 42220, // celo
];

export const RPC = {
  // TODO: change matic rpc
  [ChainId.MATIC]: "https://rpc-mainnet.maticvigil.com",
  // [ChainId.MATIC_TESTNET]: "https://rpc-mumbai.matic.today",
  [ChainId.BSC]: "https://bsc-dataseed1.binance.org",
  // [ChainId.BSC_TESTNET]: "https://data-seed-prebsc-1-s1.binance.org:8545/",
};

// CONNECTORS
export const injected = new InjectedConnector({
  supportedChainIds,
});

// mainnet only
export const walletconnect = new WalletConnectConnector({
  rpc: RPC,
  bridge: "https://bridge.walletconnect.org",
  qrcode: true,
  pollingInterval: 15000,
});

// WALLET CONFIG
export const SUPPORTED_WALLETS = {
  METAMASK: {
    connector: injected,
    name: "Metamask",
    logo: "/images/metamask-fox.svg",
    desc: "Connect to your MetaMask Wallet",
    href: null,
    color: "#E8831D",
    onConnectFunc: "connectMetaMask",
  },
  WALLET_CONNECT: {
    connector: walletconnect,
    name: "Wallet Connect",
    logo: "/images/wallet-connect.svg",
    desc: "Scan with WalletConnect to connect",
    href: null,
    color: "#4196FC",
    mobile: true,
    onConnectFunc: "connectWalletConnect",
  },
};
