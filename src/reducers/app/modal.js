const initialState = {
  modalToggle: false,
  header: "",
  className: "",
};

export default function modal(state = initialState, action) {
  switch (action.type) {
    case "OPEN_MODAL": {
      return {
        ...state,
        modalToggle: true,
        header: action.data.header,
        body: action.data.body,
        className: action.data.className,
      };
    }
    case "CLOSE_MODAL": {
      return {
        ...initialState,
      };
    }
    default:
      return state;
  }
}
