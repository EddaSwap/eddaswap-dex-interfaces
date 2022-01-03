import { Web3Provider } from "@ethersproject/providers";

// import { SupportedChainId } from "constants/chains";

// const NETWORK_POLLING_INTERVALS: { [chainId: number]: number } = {
//   [SupportedChainId.ARBITRUM]: 1_000,
//   [SupportedChainId.ARBITRUM_TESTNET]: 1_000,
//   [SupportedChainId.HARMONY]: 15_000,
// };

export default function getLibrary(provider) {
  const library = new Web3Provider(
    provider,
    typeof provider.chainId === "number"
      ? provider.chainId
      : typeof provider.chainId === "string"
      ? parseInt(provider.chainId)
      : "any"
  );
  library.pollingInterval = 12000;

  return library;
}
