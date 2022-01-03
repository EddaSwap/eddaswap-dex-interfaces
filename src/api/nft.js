import axios from "lib/httpRequestHelper";

export const getNftByPoolId = async (poolId, pagination) => {
  try {
    return axios
      .get(`/nfts`)
      .then((response) => {
        return response.data?.data?.filter(
          (item) => item?.rarity === "Ultra Rare"
        );
      })
      .catch((err) => {
        return [];
      });
  } catch {
    return [];
  }
};

export const getNftDetail = async (cardID) => {
  return axios
    .get(`/nfts/${cardID}`)
    .then((response) => {
      return response.data;
    })
    .catch((err) => {
      return [];
    });
};
