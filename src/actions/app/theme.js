export function loadTheme() {
    const theme = localStorage.getItem('edda-theme')
    if(theme){
        return (dispatch) => {
            dispatch({
                type: "UPDATE_LOCAL_STORAGE",
                "theme":theme
            });
        }
    }
    else {
        return (dispatch) => {
            
        }
    }
}

export function changeTheme(currentTheme) {
    let newTheme = currentTheme === 'default' ? 'dark' : 'default';
    localStorage.setItem('edda-theme', newTheme)
    return (dispatch) => {
        dispatch({
            type: "UPDATE_LOCAL_STORAGE",
            "theme":newTheme
        });
    }
}

export function setTheme(theme) {
    return (dispatch) => {
        dispatch({
            type: "UPDATE_LOCAL_STORAGE",
            "theme":theme
        });
    }
}

