const initialState = {
  show: false,
  type: "",
  message: "",
  txHash: "",
};

export default function snackbar(state = initialState, action) {
  switch (action.type) {
    case "OPEN_SNACKBAR": {
      return {
        ...state,
        show: true,
        type: action.data.type,
        message: action.data.message,
        txHash: action.data.txHash,
      };
    }
    case "CLOSE_SNACKBAR": {
      return {
        ...initialState,
      };
    }
    default:
      return state;
  }
}
