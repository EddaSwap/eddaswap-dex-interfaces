import EDDA_ABI from "./edda.json";
import WBNB_ABI from "./wbnb.json";
import EDDA_CONTRACT_ABI from "./eddaContract.json";
import EDDA_CONTRACT_v2_ABI from "./eddaRouterv2.json";
import EDDA_LP_TOKEN_ABI from "./lpToken.json";
import ERC20_ABI from "./ERC20.json";
import EDDA_LP_NFT_ABI from "./eddaLPNFT.json";
import EDDA_NFT_POOL from "./eddaNFTPool.json";
import EDDA_POOL from "./eddaPool.json";
import EDDA_UNI_REWARD_ABI from "./eddaUNIRewards.json";
import EDDA_STAKING_NFT_ABI from "./stakingNFT.json";
import EDDA_ETH_LP_TOKEN from "./eddaETHLpToken.json";
import EDDA_VESTING from "./eddaVesting.json";
import EDDA_NFT from "./nft.json";
import WMATIC_ABI from "./wmatic.json";

import { ROUTER_VERSION } from "../constants";

export {
  EDDA_ABI,
  WBNB_ABI,
  EDDA_CONTRACT_ABI,
  EDDA_CONTRACT_v2_ABI,
  EDDA_LP_TOKEN_ABI,
  ERC20_ABI,
  EDDA_LP_NFT_ABI,
  EDDA_NFT_POOL,
  EDDA_POOL,
  EDDA_UNI_REWARD_ABI,
  EDDA_STAKING_NFT_ABI,
  EDDA_ETH_LP_TOKEN,
  EDDA_VESTING,
  EDDA_NFT,
  WMATIC_ABI,
};

export const EDDA_ROUTER_ABI = {
  [ROUTER_VERSION.v1]: EDDA_CONTRACT_ABI,
  [ROUTER_VERSION.v2]: EDDA_CONTRACT_v2_ABI,
};
