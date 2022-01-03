import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";

export function useWrongNetwork() {
  const { error } = useWeb3React();

  return error instanceof UnsupportedChainIdError;
}
