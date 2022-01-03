export function setSlippage(slippage) {
    localStorage.setItem("edda-slippage", slippage);
    return (dispatch) => {
        dispatch({
            type: "SET_SLIPPAGE",
            slippage
        });
    }
}

export function setTransactionDeadline(secDeadline) {
    localStorage.setItem("edda-deadline", secDeadline);
    return (dispatch) => {
        dispatch({
            type: "SET_TRANSACTION_DEADLINE",
            secDeadline
        });
    }
}