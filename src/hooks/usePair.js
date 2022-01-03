import { useWeb3React } from '@web3-react/core';
import { BASES_TO_TRACK_LIQUIDITY_FOR } from 'constants/tokens';
import { arrayofObjectToObject } from 'lib/objectHelper';
import flatMap from 'lodash.flatmap';
import { useMemo } from 'react';
import { useAllTokens } from './useToken';

export function useTrackedTokenPairsB() {
  const { chainId } = useWeb3React();
  const tokens = arrayofObjectToObject(useAllTokens(), 'address');
  // pinned pairs
  // const pinnedPairs = useMemo(() => (chainId ? PINNED_PAIRS[chainId] ?? [] : []), [chainId])

  // pairs for every token against every base
  const generatedPairs = useMemo(
    () =>
      chainId
        ? flatMap(Object.keys(tokens), (tokenAddress) => {
            const token = tokens[tokenAddress];
            // for each token on the current chain

            return (
              // loop though all bases on the current chain
              (BASES_TO_TRACK_LIQUIDITY_FOR[chainId] ?? [])
                // to construct pairs of the given token with each base
                .map((base) => {
                  if (base.address === token.address) {
                    return null;
                  } else {
                    return [base, token];
                  }
                })
                .filter((p) => p !== null)
            );
          })
        : [],
    [tokens, chainId]
  );

  // pairs saved by users
  // const savedSerializedPairs = useSelector(({ user: { pairs } }) => pairs)

  // const userPairs = useMemo(() => {
  //   if (!chainId || !savedSerializedPairs) return []
  //   const forChain = savedSerializedPairs[chainId]
  //   if (!forChain) return []

  //   return Object.keys(forChain).map((pairId) => {
  //     return [deserializeToken(forChain[pairId].token0), deserializeToken(forChain[pairId].token1)]
  //   })
  // }, [savedSerializedPairs, chainId])

  const combinedList = useMemo(() => generatedPairs, [generatedPairs]);

  return useMemo(() => {
    // dedupes pairs of tokens in the combined list
    const keyed = combinedList.reduce((memo, [tokenA, tokenB]) => {
      const sorted = tokenA.sortsBefore(tokenB);
      const key = sorted
        ? `${tokenA.address}:${tokenB.address}`
        : `${tokenB.address}:${tokenA.address}`;
      if (memo[key]) return memo;
      memo[key] = sorted ? [tokenA, tokenB] : [tokenB, tokenA];
      return memo;
    }, {});

    return Object.keys(keyed).map((key) => keyed[key]);
  }, [combinedList]);
}

/**
 * Given two tokens return the liquidity token that represents its liquidity shares
 * @param tokenA one of the two tokens
 * @param tokenB the other token
 */
export function toLiquidityToken([tokenA, tokenB], SDK) {
  if (tokenA.chainId !== tokenB.chainId)
    throw new Error('Not matching chain IDs');
  if (tokenA.equals(tokenB)) throw new Error('Tokens cannot be equal');

  if (!SDK) return;
  const { Token, Pair } = SDK;
  console.log('SDK', SDK.computePairAddress);
  return new Token(
    tokenA.chainId,
    Pair.getAddress(tokenA, tokenB),
    18,
    'EDDA-LP',
    'EDDA LPs'
  );
}

// export async function getVestingTokenPairs(chainId) {
//   const nativeETH =
//     chainId === ChainId.MATIC ? ETHER[chainId] : ETHER[ChainId.BSC];
//   const nativeWETH =
//     chainId === ChainId.MATIC ? WETH[chainId] : WETH[ChainId.BSC];
//   try {
//     const allTokens = await generateAllTokensWithETH(chainId);
//     const allImportedPool = await generateAllImportPool();
//     let pairList = [...allImportedPool];

//     const allTokensWithoutBNBWBNB = allTokens.filter(
//       (item) => !_.isEqual(item, nativeETH) && !_.isEqual(item, nativeWETH)
//     );

//     allTokensWithoutBNBWBNB.forEach((token) => {
//       //for each token on the current chain (without BNB and WBNB)
//       BASES_TO_TRACK_LIQUIDITY_FOR[chainId].forEach((baseToken) => {
//         //to construct pairs of the given token with each base (WBNB, EDDA,...)
//         if (
//           token.address !== baseToken.address &&
//           !_.isEqual(token, nativeETH) &&
//           !_.isEqual(baseToken, nativeETH)
//         ) {
//           //find if this pair exist in pairList already
//           const tokenA = token.sortsBefore(baseToken) ? token : baseToken;
//           const tokenB = token.sortsBefore(baseToken) ? baseToken : token;

//           if (pairList.find((item) => _.isEqual(item, [tokenA, tokenB]))) {
//           }
//           //if non exist, push
//           else pairList.push([tokenA, tokenB]);
//         }
//       });
//     });
//     return pairList;
//   } catch (error) {
//     console.error('Fail to get tracked token pairs', error);
//     return [];
//   }
// }
