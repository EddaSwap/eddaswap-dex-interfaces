import { reducer } from "reducers";
import { applyMiddleware, createStore } from "redux";
import thunk from "redux-thunk";
import { loadState, saveState } from "./storage";

const persistedState = loadState();

const store = createStore(reducer, persistedState, applyMiddleware(thunk));

store.subscribe(() => {
  saveState({
    lists: store.getState().lists,
  });
});

export default store;
