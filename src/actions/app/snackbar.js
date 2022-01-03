export function closeSnackbar() {
  return (dispatch) => {
    dispatch({
      type: "CLOSE_SNACKBAR",
    });
  };
}
export function openSnackbar(type, message, txHash) {
  return (dispatch) => {
    dispatch({
      type: "OPEN_SNACKBAR",
      data: {
        type: type,
        message: message,
        txHash: txHash,
      },
    });
  };
}
