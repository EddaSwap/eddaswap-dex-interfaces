export function uniqueArrayOfObject (arrayOfObject, key1, key2) {
    return arrayOfObject.filter((v,i,a)=>a.findIndex(t=>(t[key1][key2] === v[key1][key2]))===i);
    
}