import axios from "axios";

const ETHEREUM_SUPPORTED_TOKENS_ADDRESS = {
  binancecoin: "BNB",
  busd: "BUSD",
  "pancakeswap-token": "Cake",
  ethereum: "ETH",
  bakerytoken: "BAKE",
  "binance-bitcoin": "BTCB",
  bdollar: "BDO",
  "binance-eth": "BETH",
  polkadot: "DOT",
  "usd-coin": "USDC",
  tether: "USDT",
  dai: "DAI",
  "true-usd": "TUSD",
  "hot-cross": "HOTCROSS",
  "pancake-bunny": "BUNNY",
  "trust-wallet-token": "TWT",
};
export function fetchTokenPrice() {
  return async (dispatch, getState) => {
    const tokensId = Object.keys(ETHEREUM_SUPPORTED_TOKENS_ADDRESS);

    const params = {
      ids: tokensId.join(","),
      vs_currencies: "usd",
    };
    const pricesResponse = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price`,
      { params }
    );

    let responseData = {};
    if (pricesResponse?.status === 200 && !!pricesResponse?.data) {
      responseData = pricesResponse?.data;
    }
    let prices = {};
    tokensId.forEach((item) => {
      prices[ETHEREUM_SUPPORTED_TOKENS_ADDRESS[item]] = responseData[item]?.usd;
    });
    dispatch({
      type: "FETCH_TOKENS_PRICE",
      prices,
    });
  };
}
