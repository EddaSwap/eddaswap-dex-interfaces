const initialState = {
  topToken: {},
  userAddedTokens: {},
  allTokens: [], //all default tokens with user added tokens
  prices: {},
};

export default function token(state = initialState, action) {
  switch (action.type) {
    case "UPDATE_TOKEN_LIST": {
      return {
        ...state,
        topToken: action.newTokenList,
      };
    }
    case "UPDATE_TOKEN_BALANCE": {
      return {
        ...state,
        topToken: action.newTokenList,
      };
    }
    case "INIT_USER_ADDED_TOKEN": {
      return {
        ...state,
        userAddedTokens: action.addedTokensList,
      };
    }
    case "USER_ADDED_TOKEN": {
      return {
        ...state,
        userAddedTokens: action.newTokenList,
      };
    }
    case "USER_REMOVE_TOKEN": {
      return {
        ...state,
        userAddedTokens: action.newTokenList,
      };
    }
    case "LOAD_ALL_TOKENS": {
      return {
        ...state,
        allTokens: action.tokens,
      };
    }
    case "FETCH_TOKENS_PRICE": {
      return {
        ...state,
        prices: action.prices,
      };
    }
    default:
      return state;
  }
}
