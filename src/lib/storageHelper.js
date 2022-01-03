export function setLocalStorageItem(key, value) {
    let stringValue = value;
    if(typeof value === "object") {
        stringValue = JSON.stringify(value);
    }
    try {
        localStorage.setItem(key, stringValue);
    }
    catch(error) {
        console.error("Failed to set item to local storage", error);
    }
}

export function getLocalStorageItem(key) {
    try {
        return localStorage.getItem(key)
    }
    catch(error) {
        console.error("Failed to get item to local storage", error);
    }
}