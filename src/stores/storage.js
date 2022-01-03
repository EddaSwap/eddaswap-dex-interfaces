// localStorage.js
export const loadState = () => {
  try {
    const serializedState = localStorage.getItem("edda-state");
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

// localStorage.js
export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem("edda-state", serializedState);
  } catch (error) {
    console.log("save error", error);
    // ignore write errors
  }
};
