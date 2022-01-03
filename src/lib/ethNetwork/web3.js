import Web3 from "web3";

const InfuraId = process.env.REACT_APP_INFURA_ID;

export const web3 = new Web3(`https://mainnet.infura.io/v3/${InfuraId}`);
