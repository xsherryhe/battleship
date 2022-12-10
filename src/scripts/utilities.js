export function capitalize(string) {
  return string[0].toUpperCase() + string.slice(1);
}

export function includesArray(array, nestedArray) {
  return nestedArray.some((arrayItem) =>
    arrayItem.every((item, i) => item === array[i])
  );
}

export function equalsArray(array1, array2) {
  return array1.every((elem, i) => array2[i] === elem);
}
