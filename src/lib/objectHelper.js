export function objectIsEmpty(obj) {
  for (let prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      return false;
    }
  }

  return JSON.stringify(obj) === JSON.stringify({});
}

export function arrayofObjectToObject(array, key) {
  try {
    let convertedObject = {};
    for (const [index, value] of array.entries()) {
      convertedObject[array[index][key]] = array[index];
    }
    return convertedObject;
  } catch (error) {
    console.error("Failed to convert array of object to object", error);
    return {};
  }
}

export function arrayofObjectToObjectTwoKeys(array, key1, key2) {
  try {
    let convertedObject = {};
    for (const [index, value] of array.entries()) {
      convertedObject[array[index][key1][key2]] = array[index];
    }
    return convertedObject;
  } catch (error) {
    console.error("Failed to convert array of object to object", error);
    return {};
  }
}
