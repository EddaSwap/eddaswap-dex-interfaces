import { web3 as web3Bsc, web3Matic } from "services/Web3Service";
import { ChainId } from "@sushiswap/sdk";

const initialState = {
  loadedData: false,
  web3: web3Bsc,
};

export default function common(state = initialState, action) {
  switch (action.type) {
    case "LOADED_DATA": {
      return {
        ...state,
        loadedData: action.success,
      };
    }
    case "SET_WEB3": {
      return {
        ...state,
        web3: action.chainId === ChainId.MATIC ? web3Matic : web3Bsc,
      };
    }
    default: {
      return state;
    }
  }
}
