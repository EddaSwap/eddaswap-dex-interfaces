const initialState = {
  liquidityList: [],
  lpTokenPairs: [],
  userLpTokensBalance: [],
  userBalances: [],
  importedPoolList: [],
};

export default function liquidityv2(state = initialState, action) {
  switch (action.type) {
    case 'LOADED_LPv2_TOKEN_PAIR': {
      return {
        ...state,
        lpTokenPairs: action.lpTokenPairs,
      };
    }
    case 'LOADED_LPv2_TOKENS_BALANCE': {
      return {
        ...state,
        userLpTokensBalance: action.lpTokensBalance,
        userBalances: action.userBalances,
      };
    }
    case 'INIT_USER_IMPORTED_POOL': {
      return {
        ...state,
        importedPoolList: action.importedPoolList,
      };
    }
    case 'LOADED_USER_IMPORTED_POOL': {
      return {
        ...state,
        importedPoolList: action.importedPoolList,
      };
    }
    default:
      return state;
  }
}
