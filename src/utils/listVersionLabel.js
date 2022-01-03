export default function listVersionLabel(version) {
  return `v${version.major}.${version.minor}.${version.patch}`;
}
