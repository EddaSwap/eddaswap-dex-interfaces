import { supportedTokens } from "constants/tokens";
import { getAddress } from "lib/addressHelper";
import { fromWei, truncate } from "lib/numberHelper";
import { getTokenBalance } from "lib/sdk/contract";
import { generateToken } from "lib/sdk/token";
import { web3 } from "services/Web3Service";
import { ABI } from "../../constants";

export const loadAddress = (dispatch, getState) =>
  new Promise(async (resolve, reject) => {
    const tokenList = supportedTokens;
    const newTokenList = await Promise.all(
      tokenList.map(async (token) => {
        const newToken = await generateToken(token.address);
        return {
          ...newToken,
          logoURI: token.logoURI,
        };
      })
    );
    dispatch({
      type: "UPDATE_TOKEN_LIST",
      newTokenList,
    });
    resolve();
  });

export const loadBalance = (dispatch, getState) =>
  new Promise(async (resolve, reject) => {
    const state = getState();
    const tokenList = state.api.token.topToken;
    const { account } = state.api.wallet;
    if (account) {
      const newTokenList = await Promise.all(
        tokenList.map(async (token) => {
          let balance;
          //get bnb balance
          if (token.symbol === "BNB") {
            let balanceInWei = await web3.eth.getBalance(account);
            balance = fromWei(balanceInWei);
          }
          //get erc20 token balance
          else {
            balance = await getTokenBalance(token.address, account);
          }
          const truncatedBalance = truncate(balance, 4);
          return {
            ...token,
            balance: truncatedBalance,
          };
        })
      );
      dispatch({
        type: "UPDATE_TOKEN_BALANCE",
        newTokenList,
      });
      resolve();
    }
    resolve();
  });

export const loadContractData = (dispatch, getState) =>
  new Promise((resolve, reject) => {
    const state = getState();
    const networkId = state.api.wallet.networkId;
    const ADDRESS = getAddress(networkId);
    const tokenList = state.api.token.topToken;
    const liquidityList = state.api.liquidity.liquidityList;
    const eddaContract = new web3.eth.Contract(ABI.EDDA_ABI, ADDRESS.EDDA);
    const eddaRouterContract = new web3.eth.Contract(
      ABI.EDDA_CONTRACT_ABI,
      ADDRESS.EDDA_ROUTER
    );
    const wbnbContract = new web3.eth.Contract(ABI.WBNB_ABI, ADDRESS.WBNB);
    const eddaLpTokenContract = new web3.eth.Contract(
      ABI.EDDA_LP_TOKEN_ABI,
      ADDRESS.EDDA_LP_TOKEN
    );
    let contracts = {
      eddaContract,
      wbnbContract,
      eddaRouterContract,
      eddaLpTokenContract,
    };
    tokenList.forEach((item) => {
      if (!["BNB", "WBNB", "EDDA"].includes(item.symbol)) {
        const tokenContract = new web3.eth.Contract(
          ABI.ERC20_ABI,
          ADDRESS[item.symbol]
        );
        contracts[`${item.symbol.toLowerCase()}Contract`] = tokenContract;
      }
    });
    liquidityList.forEach((item) => {
      const liquidityContract = new web3.eth.Contract(
        ABI.EDDA_LP_TOKEN_ABI,
        item.address
      );
      contracts[`${item.symbol.toLowerCase()}Contract`] = liquidityContract;
    });
    dispatch({
      type: "SET_CONTRACT",
      contracts,
    });
    resolve();
  });
