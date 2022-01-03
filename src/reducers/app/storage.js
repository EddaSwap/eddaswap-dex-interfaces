const initialState = {
  language: "en",
  theme: "default",
};

export default function storage(state = initialState, action) {
  switch (action.type) {
    case "UPDATE_LOCAL_STORAGE": {
      return {
        ...state,
        theme: action["theme"],
      };
    }
    case "UPDATE_STORAGE_LANGUAGE": {
      return {
        ...state,
        language: action.language,
      };
    }
    default:
      return state;
  }
}
