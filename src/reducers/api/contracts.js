const initialState = {

}

export default function contracts(state = initialState, action) {
    switch (action.type) {
        case "SET_CONTRACT": {
           return {
               ...state,
               ...action.contracts
           }
        }
        default: {
            return state;
        }
    }
}