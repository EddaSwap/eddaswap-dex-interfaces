import { singleCallResult, generateTokenContract } from "lib/sdk/contract";

export async function fetchTokenAllowance(token, owner, spender) {
  try {
    const tokenContract = generateTokenContract(token?.address);
    return await singleCallResult(tokenContract, "allowance", [owner, spender]);
  } catch {}
}
