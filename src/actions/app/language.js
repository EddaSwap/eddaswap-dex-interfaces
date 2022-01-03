export function loadLanguage() {
  const language = localStorage.getItem("edda-language");
  if (language) {
    return (dispatch) => {
      dispatch({
        type: "UPDATE_STORAGE_LANGUAGE",
        language: language,
      });
    };
  } else {
    return (dispatch) => {};
  }
}

export function changeLanguage(language) {
  localStorage.setItem("edda-language", language);
  return (dispatch) => {
    dispatch({
      type: "UPDATE_STORAGE_LANGUAGE",
      language: language,
    });
  };
}

export function setLanguage(language) {
  return (dispatch) => {
    dispatch({
      type: "UPDATE_STORAGE_LANGUAGE",
      language: language,
    });
  };
}
