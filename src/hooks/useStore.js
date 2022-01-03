import { useSelector } from "react-redux";

export function useApiStore() {
  return useSelector((state) => state.api);
}
