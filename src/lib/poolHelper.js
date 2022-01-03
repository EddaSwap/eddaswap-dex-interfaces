//poolBalances: list pool balances in reducers, token: object token data
export function getTokenPoolBalance(poolBalances, token) {
    try {
        return poolBalances[token.symbol?.toLowerCase()];
    }
    catch {
        return 0;
    }
}