import Web3 from "web3";

let provider = Web3.givenProvider;
const givenProvider = Web3.givenProvider;

if (givenProvider?.chainId !== "0x38") {
  //provider not is BSC mainnet
  provider = "https://bsc-dataseed1.binance.org";
}

const web3 = new Web3(
  provider ||
    Web3.givenProvider ||
    "https://bsc-dataseed1.binance.org" ||
    "http://localhost:8545"
);

const web3Matic = new Web3("https://rpc-mainnet.maticvigil.com");

export { web3, web3Matic };
