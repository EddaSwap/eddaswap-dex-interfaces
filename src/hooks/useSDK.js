import * as EDDA_BSC_SDK from "@eddaswap/sdk";
import * as EDDA_POLYGON_SDK from "@eddaswap/sdk-polygon";
import { useWeb3React } from "@web3-react/core";
import { useState, useEffect } from "react";
import { ChainId } from "@sushiswap/sdk";

export function useSDK() {
  const { chainId } = useWeb3React();
  const [sdk, setSDK] = useState();

  const sdks = {
    [ChainId.BSC]: EDDA_BSC_SDK,
    [ChainId.MATIC]: EDDA_POLYGON_SDK,
  };

  useEffect(() => {
    if (chainId) {
      setSDK(sdks[chainId]);
    } else {
      setSDK(EDDA_BSC_SDK);
    }
  }, [chainId]);

  return sdk;
}
