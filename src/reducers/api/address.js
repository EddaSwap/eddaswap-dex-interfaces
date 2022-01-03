const initialState = {
    contractAddressList: {}
}

export default function address(state = initialState, action) {
    switch (action.type) {
        case "UPDATE_CONTRACT_ADDRESS_LIST": {
           return {
               ...state,
               contractAddressList: action.contractAddressList
           }
        }
        default: {
            return state;
        }
    }
}