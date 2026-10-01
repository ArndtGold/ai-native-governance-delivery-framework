export const CODEX_REGISTRATION_REVISION = 1;

function semverBase(version) {
  return version.split("+")[0];
}

export function codexLocalInstallVersion(version, sourceDigest) {
  if (!/^[a-f0-9]{64}$/.test(sourceDigest)) throw new Error("AGDF local source digest must be a deterministic SHA-256 value.");
  return `${semverBase(version)}+codex.local-${sourceDigest.slice(0, 12)}`;
}

export function isCodexLocalInstallVersion(version, candidate, sourceDigest = "") {
  if (typeof candidate !== "string") return false;
  if (sourceDigest) return candidate === codexLocalInstallVersion(version, sourceDigest);
  const escaped = semverBase(version).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped}\\+codex\\.local-[a-f0-9]{12}$`).test(candidate);
}

export const marketplaceEntries = parsed => parsed?.marketplaces;
