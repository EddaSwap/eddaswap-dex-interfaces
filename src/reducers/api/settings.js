const initialState = {
  slippage: 0.5,
  secondsTxDeadline: 120,
};

export default function settings(state = initialState, action) {
  switch (action.type) {
    case "SET_SLIPPAGE": {
      return {
        ...state,
        slippage: action.slippage,
      };
    }
    case "SET_TRANSACTION_DEADLINE": {
      return {
        ...state,
        secondsTxDeadline: action.secDeadline,
      };
    }
    case "UPDATE_LOCAL_STORAGE": {
      return {
        ...state,
        slippage: action.slippage || state.slippage,
        secondsTxDeadline: action.txDeadline || state.secondsTxDeadline,
      };
    }
    default:
      return state;
  }
}
