import { useWeb3React as useWeb3ReactCore } from "@web3-react/core";

export function useActiveWeb3React() {
  // replace with address to impersonate
  const impersonate = false;
  const context = useWeb3ReactCore();
  const contextNetwork = useWeb3ReactCore("NETWORK");
  return context.active
    ? { ...context, account: impersonate || context.account }
    : { ...contextNetwork, account: impersonate || contextNetwork.account };
}

export default useActiveWeb3React;
