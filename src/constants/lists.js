export const DEFAULT_TOKEN_LIST_URL = `${window.location.origin}/eddaswap-default.tokenlist.json`;

export const DEFAULT_LIST_OF_LISTS = [
  DEFAULT_TOKEN_LIST_URL,
  //get token list from public folder
  `${window.location.origin}/eddaswap-top100.tokenlist.json`,
  //   "t2crtokens.eth", // kleros
  //   "tokens.1inch.eth", // 1inch
  //   "synths.snx.eth",
  //   "tokenlist.dharma.eth",
  //   "defi.cmc.eth",
  //   "erc20.cmc.eth",
  //   "stablecoin.cmc.eth",
  //   'tokenlist.zerion.eth',
  //   'tokenlist.aave.eth',
  //   "https://tokens.pancakeswap.finance/pancakeswap-extended.json",
  //   "https://raw.githubusercontent.com/compound-finance/token-list/master/compound.tokenlist.json",
];

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS = [DEFAULT_TOKEN_LIST_URL];
