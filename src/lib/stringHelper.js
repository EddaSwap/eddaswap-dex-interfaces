export function truncateAddress(str) {
  const length = str.length;
  return str.substr(0, 6) + "..." + str.substr(length - 4, length - 1);
}

export function shortenAddress(str) {
  const length = str.length;
  return str.substr(0, 10) + "..." + str.substr(length - 7, length - 1);
}
