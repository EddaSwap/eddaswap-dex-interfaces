import { getNftByPoolId } from "api/nft";

export function fetchNFTsByPoolId() {
  return async (dispatch, getState) => {
    const nfts = await getNftByPoolId(2);
    dispatch({
      type: "LOADED_NFTS",
      nfts: nfts || [],
    });
  };
}
