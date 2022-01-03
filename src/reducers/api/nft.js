const initialState = {
  nftList: [],
};

export default function nft(state = initialState, action) {
  switch (action.type) {
    case "LOADED_NFTS": {
      return {
        ...state,
        nftList: action.nfts,
      };
    }
    default:
      return state;
  }
}
