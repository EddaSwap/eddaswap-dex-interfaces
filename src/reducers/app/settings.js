export const initialState = {
    theme: "default",
};
 
 export default function settings(state = initialState, action) {
     switch (action.type) {
        case "CHANGE_THEME": {
            return {
                ...state,
                theme: action.data.theme
            }
        }
        case "SET_THEME": {
            return {
                ...state,
                theme: action.data.theme
            }
        }
        default:
            return state;
     }
 
 }