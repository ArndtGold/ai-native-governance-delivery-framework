import { createHash } from "node:crypto";

const SHA256 = /^[a-f0-9]{64}$/;
const RELEASE_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/;
const TOP_LEVEL_KEYS = ["contracts", "releases", "schema_version"];
const CONTRACT_KEYS = ["contract_digest", "distribution_profiles"];
const RELEASE_KEYS = ["contract_id", "entry_digest", "profile_id", "provenance_schema_version", "status"];

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]),
    );
  }
  return value;
}

function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

function digest(value) {
  return createHash("sha256").update(canonicalJson(value)).digest("hex");
}

function exactKeys(value, expected) {
  return value && typeof value === "object" && !Array.isArray(value)
    && JSON.stringify(Object.keys(value).sort()) === JSON.stringify(expected);
}

function sortedKeys(value) {
  const keys = Object.keys(value);
  return JSON.stringify(keys) === JSON.stringify([...keys].sort());
}

function invalid(reason) {
  return { status: "invalid", reason };
}

export function canonicalDistributionProfileDigest(distributionProfiles) {
  return digest(distributionProfiles);
}

export function canonicalDistributionProfileEntryDigest({
  version,
  contract_id,
  contract_digest,
  provenance_schema_version = 1,
  profile_id = "runtime-plugin",
  status = "supported",
}) {
  return digest({
    version,
    contract_id,
    contract_digest,
    provenance_schema_version,
    profile_id,
    status,
  });
}

export function validateDistributionProfileHistory(catalogue) {
  if (!exactKeys(catalogue, TOP_LEVEL_KEYS)
      || catalogue.schema_version !== 1
      || !catalogue.contracts || typeof catalogue.contracts !== "object" || Array.isArray(catalogue.contracts)
      || !catalogue.releases || typeof catalogue.releases !== "object" || Array.isArray(catalogue.releases)
      || !sortedKeys(catalogue.contracts)
      || !sortedKeys(catalogue.releases)
      || Object.keys(catalogue.contracts).length === 0
      || Object.keys(catalogue.releases).length === 0) {
    return invalid("profile_history_invalid");
  }

  const contractDigests = new Set();
  for (const contract of Object.values(catalogue.contracts)) {
    if (!exactKeys(contract, CONTRACT_KEYS)
        || !contract.distribution_profiles
        || typeof contract.distribution_profiles !== "object"
        || Array.isArray(contract.distribution_profiles)
        || !SHA256.test(contract.contract_digest ?? "")
        || canonicalDistributionProfileDigest(contract.distribution_profiles) !== contract.contract_digest) {
      return invalid("profile_history_invalid");
    }
    if (contractDigests.has(contract.contract_digest)) return invalid("profile_history_invalid");
    contractDigests.add(contract.contract_digest);
  }

  const referencedContracts = new Set();
  for (const [version, release] of Object.entries(catalogue.releases)) {
    const contract = catalogue.contracts[release?.contract_id];
    if (!RELEASE_VERSION.test(version)
        || !exactKeys(release, RELEASE_KEYS)
        || !contract
        || release.provenance_schema_version !== 1
        || release.profile_id !== "runtime-plugin"
        || release.status !== "supported"
        || !SHA256.test(release.entry_digest ?? "")) {
      return invalid("profile_history_invalid");
    }
    referencedContracts.add(release.contract_id);
    const expectedDigest = canonicalDistributionProfileEntryDigest({
      version,
      contract_id: release.contract_id,
      contract_digest: contract.contract_digest,
      provenance_schema_version: release.provenance_schema_version,
      profile_id: release.profile_id,
      status: release.status,
    });
    if (release.entry_digest !== expectedDigest) return invalid("profile_history_invalid");
  }
  if (referencedContracts.size !== Object.keys(catalogue.contracts).length) {
    return invalid("profile_history_invalid");
  }

  return { status: "matched", reason: "profile_history_valid" };
}

export function classifyHistoricalDistributionProfile({ catalogue, version, distributionProfiles }) {
  const validation = validateDistributionProfileHistory(catalogue);
  if (validation.status !== "matched") {
    return {
      status: "invalid",
      reason: "profile_history_invalid",
      release_version: null,
      contract_id: null,
      contract_digest: null,
      entry_digest: null,
    };
  }
  const release = Object.hasOwn(catalogue.releases, version) ? catalogue.releases[version] : null;
  if (!release) {
    return {
      status: "unsupported",
      reason: "historical_contract_unsupported",
      release_version: null,
      contract_id: null,
      contract_digest: null,
      entry_digest: null,
    };
  }
  const contract = catalogue.contracts[release.contract_id];
  if (!distributionProfiles || typeof distributionProfiles !== "object" || Array.isArray(distributionProfiles)) {
    return {
      status: "invalid",
      reason: "historical_contract_invalid",
      release_version: version,
      contract_id: release.contract_id,
      contract_digest: contract.contract_digest,
      entry_digest: release.entry_digest,
    };
  }
  const observedDigest = canonicalDistributionProfileDigest(distributionProfiles);
  if (observedDigest !== contract.contract_digest
      || canonicalJson(distributionProfiles) !== canonicalJson(contract.distribution_profiles)) {
    return {
      status: "invalid",
      reason: "historical_contract_invalid",
      release_version: version,
      contract_id: release.contract_id,
      contract_digest: contract.contract_digest,
      entry_digest: release.entry_digest,
    };
  }
  return {
    status: "matched",
    reason: "historical_contract_matched",
    release_version: version,
    contract_id: release.contract_id,
    contract_digest: contract.contract_digest,
    entry_digest: release.entry_digest,
  };
}
