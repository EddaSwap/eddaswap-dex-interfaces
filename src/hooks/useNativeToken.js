import { ETHER, WETH } from "constants/tokens";
import { useWeb3React } from "@web3-react/core";
import { useState, useEffect } from "react";
import { ChainId } from "@sushiswap/sdk";

export function useNativeToken() {
  const { chainId } = useWeb3React();
  const [eth, setEther] = useState(ETHER[ChainId.BSC]);
  const [weth, setWeth] = useState(WETH[ChainId.BSC]);

  useEffect(() => {
    if (chainId) {
      setEther(ETHER[chainId]);
      setWeth(WETH[chainId]);
    } else {
      setEther(ETHER[ChainId.BSC]);
      setWeth(WETH[ChainId.BSC]);
    }
  }, [chainId]);

  return {
    ETHER: eth,
    WETH: weth,
  };
}
