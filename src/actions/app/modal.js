export function closeModal() {
  return (dispatch) => {
    dispatch({
      type: "CLOSE_MODAL",
    });
  };
}
export function openModal(body, className) {
  return (dispatch) => {
    dispatch({
      type: "OPEN_MODAL",
      data: {
        body: body,
        className: className,
      },
    });
  };
}
