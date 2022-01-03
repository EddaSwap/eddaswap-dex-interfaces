const Web3 = require("web3");
const axios = require("axios").default;
const web3 = new Web3(
  new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/")
);
const eddaRouter = "0x9fb8ff47db2a57f43d3589ed8c16af4f5fccc5f8";
const apiKey = "C5EJGG7N95IABTVB5PBJYFHPGX3Z8T9XXU";

export const getTotalTradingVoloumn = async () => {
  let totalTradingVolum = 0;
  const currentBlockNum = await web3.eth.getBlockNumber();
  const url =
    "https://api.bscscan.com/api?module=account&action=txlist&address=" +
    eddaRouter +
    "&startblock=8607881&endblock=" +
    currentBlockNum +
    "&sort=asc&apikey=" +
    apiKey;

  const result = await axios.get(url);
  const txList = result.data.result;
  for (const tx of txList) {
    const { value, input } = tx;
    if (value != "0") {
      totalTradingVolum =
        Number(totalTradingVolum) + Number(web3.utils.fromWei(value, "ether"));
    }
  }
  return totalTradingVolum;
};
