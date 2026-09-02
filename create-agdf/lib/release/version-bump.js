import { createHash, randomUUID } from "node:crypto";
import {
  existsSync,
  lstatSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import {
  canonicalDistributionProfileDigest,
  canonicalDistributionProfileEntryDigest,
  classifyHistoricalDistributionProfile,
  validateDistributionProfileHistory,
} from "../runtime/distribution-profile-history.js";
import { WRITABLE_RELEASE_VERSION_SURFACES } from "./version-coherence.js";

const HISTORY_PATH = "plugin/meta/distribution-profile-history.json";
const JOURNAL_PATH = ".agdf/release-bump-transaction.json";
const COMMITTED_PATH = ".agdf/release-bump-transaction.committed.json";
const JOURNAL_SCHEMA_VERSION = 1;
const SEMVER = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/;

const defaultFs = {
  existsSync,
  lstatSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  writeFileSync,
};

function failure(code, detail, extra = {}) {
  const error = new Error(`${code}: ${detail}`);
  error.code = code;
  Object.assign(error, extra);
  return error;
}

function digestBytes(content) {
  return createHash("sha256").update(content).digest("hex");
}

function exactObjectKeys(value, keys) {
  return value && typeof value === "object" && !Array.isArray(value)
    && JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...keys].sort());
}

function sortedObject(value) {
  return Object.fromEntries(Object.entries(value).sort(([left], [right]) => left.localeCompare(right)));
}

function parseSemver(value) {
  const match = typeof value === "string" ? value.match(SEMVER) : null;
  if (!match) throw failure("release_version_bump_invalid", `invalid target version ${JSON.stringify(value)}`);
  return {
    raw: value,
    core: match.slice(1, 4).map(Number),
    prerelease: match[4]?.split(".") ?? [],
  };
}

function compareSemver(leftValue, rightValue) {
  const left = parseSemver(leftValue);
  const right = parseSemver(rightValue);
  for (let index = 0; index < 3; index += 1) {
    if (left.core[index] !== right.core[index]) return left.core[index] - right.core[index];
  }
  if (left.prerelease.length === 0 || right.prerelease.length === 0) {
    return left.prerelease.length === right.prerelease.length ? 0 : (left.prerelease.length === 0 ? 1 : -1);
  }
  const length = Math.max(left.prerelease.length, right.prerelease.length);
  for (let index = 0; index < length; index += 1) {
    const a = left.prerelease[index];
    const b = right.prerelease[index];
    if (a === undefined || b === undefined) return a === b ? 0 : (a === undefined ? -1 : 1);
    if (a === b) continue;
    const aNumeric = /^\d+$/.test(a);
    const bNumeric = /^\d+$/.test(b);
    if (aNumeric && bNumeric) return Number(a) - Number(b);
    if (aNumeric !== bNumeric) return aNumeric ? -1 : 1;
    return a.localeCompare(b);
  }
  return 0;
}

function groupedWritableSurfaces() {
  const grouped = new Map();
  for (const surface of WRITABLE_RELEASE_VERSION_SURFACES) {
    const list = grouped.get(surface.relativePath) ?? [];
    list.push(surface);
    grouped.set(surface.relativePath, list);
  }
  return grouped;
}

export function releaseBumpTargetPaths() {
  return [...groupedWritableSurfaces().keys(), HISTORY_PATH].sort();
}

function readRequired(fs, repoRoot, relativePath) {
  const path = join(repoRoot, relativePath);
  if (!fs.existsSync(path)) throw failure("release_version_bump_invalid", `missing required target ${relativePath}`);
  const stat = fs.lstatSync(path);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw failure("release_version_bump_invalid", `target is not a regular owned file: ${relativePath}`);
  }
  return fs.readFileSync(path, "utf8");
}

function applySurfaces(content, surfaces, currentVersion, nextVersion, relativePath) {
  let nextContent = content;
  for (const surface of surfaces) {
    let observed;
    try {
      observed = surface.readContent(nextContent);
    } catch (error) {
      throw failure("release_version_bump_invalid", `${relativePath} cannot be read: ${error.message}`);
    }
    if (observed !== currentVersion) {
      throw failure("release_version_bump_invalid", `${relativePath} has ${observed ?? "no version"}; expected ${currentVersion}`);
    }
    try {
      nextContent = surface.updateContent(nextContent, nextVersion);
    } catch (error) {
      throw failure("release_version_bump_invalid", `${relativePath} cannot be planned: ${error.message}`);
    }
  }
  for (const surface of surfaces) {
    if (surface.readContent(nextContent) !== nextVersion) {
      throw failure("release_version_bump_invalid", `${relativePath} target validation failed`);
    }
  }
  return nextContent;
}

function contractForProfiles(catalogue, distributionProfiles) {
  const contractDigest = canonicalDistributionProfileDigest(distributionProfiles);
  const match = Object.entries(catalogue.contracts)
    .find(([, contract]) => contract.contract_digest === contractDigest);
  return { contractDigest, contractId: match?.[0] ?? null };
}

function addReleaseRecord({ catalogue, version, distributionProfiles, acceptedContractDigest }) {
  if (Object.hasOwn(catalogue.releases, version)) {
    throw failure("release_version_bump_invalid", `release ${version} already exists in profile history`);
  }
  const next = structuredClone(catalogue);
  const { contractDigest, contractId: existingContractId } = contractForProfiles(next, distributionProfiles);
  let contractId = existingContractId;
  if (!contractId) {
    if (acceptedContractDigest !== contractDigest) {
      throw failure(
        "profile_history_contract_review_required",
        `changed distribution profile contract requires exact digest ${contractDigest}`,
        { proposedDigest: contractDigest },
      );
    }
    contractId = `profile-${contractDigest.slice(0, 16)}`;
    if (Object.hasOwn(next.contracts, contractId)) {
      throw failure("release_version_bump_invalid", `contract identifier collision at ${contractId}`);
    }
    next.contracts[contractId] = {
      distribution_profiles: structuredClone(distributionProfiles),
      contract_digest: contractDigest,
    };
  }
  const release = {
    contract_id: contractId,
    provenance_schema_version: 1,
    profile_id: "runtime-plugin",
    entry_digest: canonicalDistributionProfileEntryDigest({
      version,
      contract_id: contractId,
      contract_digest: contractDigest,
    }),
    status: "supported",
  };
  next.contracts = sortedObject(next.contracts);
  next.releases = sortedObject({ ...next.releases, [version]: release });
  if (validateDistributionProfileHistory(next).status !== "matched") {
    throw failure("release_version_bump_invalid", "planned profile history is invalid");
  }
  return next;
}

export function planReleaseVersionBump({
  repoRoot,
  nextVersion,
  acceptedContractDigest,
  fs = defaultFs,
} = {}) {
  repoRoot = resolve(repoRoot);
  parseSemver(nextVersion);
  const grouped = groupedWritableSurfaces();
  const originalContents = new Map();
  for (const relativePath of [...grouped.keys(), HISTORY_PATH]) {
    originalContents.set(relativePath, readRequired(fs, repoRoot, relativePath));
  }

  const definitionPath = "plugin/meta/agdf-plugin.definition.json";
  const currentDefinition = JSON.parse(originalContents.get(definitionPath));
  const currentVersion = currentDefinition.version;
  parseSemver(currentVersion);
  const comparison = compareSemver(nextVersion, currentVersion);
  if (comparison < 0) {
    throw failure("release_version_bump_invalid", `target ${nextVersion} is older than current ${currentVersion}`);
  }

  let catalogue;
  try {
    catalogue = JSON.parse(originalContents.get(HISTORY_PATH));
  } catch {
    throw failure("release_version_bump_invalid", "profile history is not valid JSON");
  }
  if (validateDistributionProfileHistory(catalogue).status !== "matched") {
    throw failure("release_version_bump_invalid", "existing profile history is invalid");
  }

  const currentClassification = classifyHistoricalDistributionProfile({
    catalogue,
    version: currentVersion,
    distributionProfiles: currentDefinition.distributionProfiles,
  });
  if (comparison === 0) {
    if (currentClassification.reason !== "historical_contract_unsupported") {
      throw failure("release_version_bump_invalid", `same-version target ${nextVersion} is not a missing-record repair`);
    }
  } else if (!Object.hasOwn(catalogue.releases, currentVersion)) {
    throw failure("release_version_bump_invalid", `current release ${currentVersion} must have a catalogue record before advancing`);
  }

  const plannedContents = new Map();
  for (const [relativePath, surfaces] of grouped) {
    const originalContent = originalContents.get(relativePath);
    if (comparison === 0) {
      for (const surface of surfaces) {
        if (surface.readContent(originalContent) !== currentVersion) {
          throw failure("release_version_bump_invalid", `${relativePath} is not coherent for same-version repair`);
        }
      }
      plannedContents.set(relativePath, originalContent);
    } else {
      plannedContents.set(
        relativePath,
        applySurfaces(originalContent, surfaces, currentVersion, nextVersion, relativePath),
      );
    }
  }
  const plannedDefinition = JSON.parse(plannedContents.get(definitionPath));
  const nextCatalogue = addReleaseRecord({
    catalogue,
    version: nextVersion,
    distributionProfiles: plannedDefinition.distributionProfiles,
    acceptedContractDigest,
  });
  plannedContents.set(HISTORY_PATH, `${JSON.stringify(nextCatalogue, null, 2)}\n`);

  const plannedClassification = classifyHistoricalDistributionProfile({
    catalogue: nextCatalogue,
    version: nextVersion,
    distributionProfiles: plannedDefinition.distributionProfiles,
  });
  if (plannedClassification.status !== "matched") {
    throw failure("release_version_bump_invalid", "planned current release snapshot does not match");
  }

  const entries = [...plannedContents.entries()]
    .filter(([relativePath, targetContent]) => targetContent !== originalContents.get(relativePath))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([relativePath, targetContent]) => ({
      relativePath,
      originalContent: originalContents.get(relativePath),
      targetContent,
      originalDigest: digestBytes(originalContents.get(relativePath)),
      targetDigest: digestBytes(targetContent),
    }));
  return {
    repoRoot,
    currentVersion,
    nextVersion,
    mode: comparison === 0 ? "reconcile_current" : "forward_bump",
    contractDigest: plannedClassification.contract_digest,
    contractId: plannedClassification.contract_id,
    entries,
  };
}

function ownedArtifactPaths(relativePath) {
  return {
    stagePath: `${relativePath}.agdf-release-bump-stage`,
    backupPath: `${relativePath}.agdf-release-bump-backup`,
  };
}

function containedRealParent(fs, repoRoot, relativePath) {
  if (isAbsolute(relativePath) || relativePath.split(/[\\/]/).includes("..")) return false;
  const root = fs.realpathSync(repoRoot);
  const parent = fs.realpathSync(dirname(join(repoRoot, relativePath)));
  const offset = relative(root, parent);
  return offset === "" || (!offset.startsWith(`..${sep}`) && offset !== ".." && !isAbsolute(offset));
}

function assertRegularIfPresent(fs, absolutePath, label) {
  if (!fs.existsSync(absolutePath)) return;
  const stat = fs.lstatSync(absolutePath);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw failure("release_version_bump_recovery_invalid", `${label} is not a regular file`);
  }
}

function journalPaths(repoRoot) {
  return {
    journal: join(repoRoot, JOURNAL_PATH),
    committed: join(repoRoot, COMMITTED_PATH),
    temporary: join(repoRoot, `${JOURNAL_PATH}.tmp`),
  };
}

function validateJournal({ repoRoot, journal, fs }) {
  if (!exactObjectKeys(journal, ["schema_version", "transaction_id", "entries"])
      || journal.schema_version !== JOURNAL_SCHEMA_VERSION
      || !/^[a-f0-9-]{36}$/.test(journal.transaction_id ?? "")
      || !Array.isArray(journal.entries)) {
    throw failure("release_version_bump_recovery_invalid", "journal schema is invalid");
  }
  const allowedTargets = releaseBumpTargetPaths();
  const observedTargets = journal.entries.map((entry) => entry.relative_path);
  if (observedTargets.length === 0
      || JSON.stringify(observedTargets) !== JSON.stringify([...new Set(observedTargets)].sort())
      || observedTargets.some((target) => !allowedTargets.includes(target))) {
    throw failure("release_version_bump_recovery_invalid", "journal target set is invalid");
  }
  for (const entry of journal.entries) {
    if (!exactObjectKeys(entry, [
      "relative_path", "stage_path", "backup_path", "original_digest", "target_digest",
    ])) throw failure("release_version_bump_recovery_invalid", "journal entry schema is invalid");
    const derived = ownedArtifactPaths(entry.relative_path);
    if (entry.stage_path !== derived.stagePath || entry.backup_path !== derived.backupPath
        || !/^[a-f0-9]{64}$/.test(entry.original_digest)
        || !/^[a-f0-9]{64}$/.test(entry.target_digest)
        || !containedRealParent(fs, repoRoot, entry.relative_path)) {
      throw failure("release_version_bump_recovery_invalid", `journal entry is unsafe: ${entry.relative_path}`);
    }
    for (const [path, label] of [
      [entry.relative_path, "target"], [entry.stage_path, "stage"], [entry.backup_path, "backup"],
    ]) assertRegularIfPresent(fs, join(repoRoot, path), `${label} ${path}`);
  }
  return journal;
}

function readJournal({ repoRoot, path, fs }) {
  assertRegularIfPresent(fs, path, "journal");
  let value;
  try {
    value = JSON.parse(fs.readFileSync(path, "utf8"));
  } catch {
    throw failure("release_version_bump_recovery_invalid", "journal is not valid JSON");
  }
  return validateJournal({ repoRoot, journal: value, fs });
}

function removeOwnedFile(fs, path) {
  if (fs.existsSync(path)) {
    assertRegularIfPresent(fs, path, path);
    fs.rmSync(path);
  }
}

function recoverJournal({ repoRoot, journal, committed, fs }) {
  for (const entry of journal.entries) {
    const target = join(repoRoot, entry.relative_path);
    const stage = join(repoRoot, entry.stage_path);
    const backup = join(repoRoot, entry.backup_path);
    if (committed) {
      if (!fs.existsSync(target) || digestBytes(fs.readFileSync(target)) !== entry.target_digest) {
        throw failure("release_version_bump_recovery_invalid", `committed target digest mismatch: ${entry.relative_path}`);
      }
      if (fs.existsSync(backup) && digestBytes(fs.readFileSync(backup)) !== entry.original_digest) {
        throw failure("release_version_bump_recovery_invalid", `backup digest mismatch: ${entry.relative_path}`);
      }
      removeOwnedFile(fs, backup);
      removeOwnedFile(fs, stage);
      continue;
    }
    if (fs.existsSync(backup)) {
      if (digestBytes(fs.readFileSync(backup)) !== entry.original_digest) {
        throw failure("release_version_bump_recovery_invalid", `backup digest mismatch: ${entry.relative_path}`);
      }
      removeOwnedFile(fs, target);
      fs.renameSync(backup, target);
    } else if (!fs.existsSync(target) || digestBytes(fs.readFileSync(target)) !== entry.original_digest) {
      throw failure("release_version_bump_recovery_invalid", `original target evidence missing: ${entry.relative_path}`);
    }
    removeOwnedFile(fs, stage);
  }
}

export function recoverReleaseVersionBump({ repoRoot, fs = defaultFs, requireFreshInvocation = true } = {}) {
  repoRoot = resolve(repoRoot);
  const paths = journalPaths(repoRoot);
  if (fs.existsSync(paths.journal) && fs.existsSync(paths.committed)) {
    throw failure("release_version_bump_recovery_invalid", "both active and committed journals exist");
  }
  const committed = fs.existsSync(paths.committed);
  const journalPath = committed ? paths.committed : paths.journal;
  if (!fs.existsSync(journalPath)) {
    if (fs.existsSync(paths.temporary)) removeOwnedFile(fs, paths.temporary);
    for (const relativePath of releaseBumpTargetPaths()) {
      const { stagePath, backupPath } = ownedArtifactPaths(relativePath);
      const stage = join(repoRoot, stagePath);
      const backup = join(repoRoot, backupPath);
      if (fs.existsSync(backup)) {
        throw failure("release_version_bump_recovery_invalid", `orphan backup without journal: ${backupPath}`);
      }
      removeOwnedFile(fs, stage);
    }
    return { recovered: false };
  }
  const journal = readJournal({ repoRoot, path: journalPath, fs });
  recoverJournal({ repoRoot, journal, committed, fs });
  removeOwnedFile(fs, journalPath);
  removeOwnedFile(fs, paths.temporary);
  if (requireFreshInvocation) {
    throw failure(
      "release_version_bump_recovery_required",
      `recovered interrupted ${committed ? "committed" : "active"} transaction; rerun the command`,
      { recovered: true },
    );
  }
  return { recovered: true };
}

function writeJournal({ repoRoot, journal, fs }) {
  const paths = journalPaths(repoRoot);
  removeOwnedFile(fs, paths.temporary);
  fs.writeFileSync(paths.temporary, `${JSON.stringify(journal, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
  fs.renameSync(paths.temporary, paths.journal);
}

export function executeReleaseVersionBump({
  repoRoot,
  nextVersion,
  acceptedContractDigest,
  fs = defaultFs,
  hooks = {},
} = {}) {
  repoRoot = resolve(repoRoot);
  recoverReleaseVersionBump({ repoRoot, fs });
  const plan = planReleaseVersionBump({ repoRoot, nextVersion, acceptedContractDigest, fs });
  const transactionId = randomUUID();
  const entries = plan.entries.map((entry) => ({
    relative_path: entry.relativePath,
    ...Object.fromEntries(Object.entries(ownedArtifactPaths(entry.relativePath)).map(([key, value]) => [
      key === "stagePath" ? "stage_path" : "backup_path", value,
    ])),
    original_digest: entry.originalDigest,
    target_digest: entry.targetDigest,
  }));
  const journal = { schema_version: JOURNAL_SCHEMA_VERSION, transaction_id: transactionId, entries };
  const paths = journalPaths(repoRoot);

  try {
    for (const entry of plan.entries) {
      if (!containedRealParent(fs, repoRoot, entry.relativePath)) {
        throw failure("release_version_bump_write_failed", `unsafe target parent: ${entry.relativePath}`);
      }
      const { stagePath, backupPath } = ownedArtifactPaths(entry.relativePath);
      const stage = join(repoRoot, stagePath);
      const backup = join(repoRoot, backupPath);
      if (fs.existsSync(stage) || fs.existsSync(backup)) {
        throw failure("release_version_bump_write_failed", `owned transaction file already exists for ${entry.relativePath}`);
      }
      fs.writeFileSync(stage, entry.targetContent, { encoding: "utf8", flag: "wx" });
      if (digestBytes(fs.readFileSync(stage)) !== entry.targetDigest) {
        throw failure("release_version_bump_write_failed", `staged digest mismatch: ${entry.relativePath}`);
      }
    }
    for (const entry of plan.entries) {
      const target = join(repoRoot, entry.relativePath);
      assertRegularIfPresent(fs, target, `target ${entry.relativePath}`);
      if (!fs.existsSync(target) || digestBytes(fs.readFileSync(target)) !== entry.originalDigest) {
        throw failure("release_version_bump_write_failed", `target changed after planning: ${entry.relativePath}`);
      }
    }
    writeJournal({ repoRoot, journal, fs });
    for (const [index, entry] of plan.entries.entries()) {
      const target = join(repoRoot, entry.relativePath);
      const { stagePath, backupPath } = ownedArtifactPaths(entry.relativePath);
      assertRegularIfPresent(fs, target, `target ${entry.relativePath}`);
      if (!fs.existsSync(target) || digestBytes(fs.readFileSync(target)) !== entry.originalDigest) {
        throw failure("release_version_bump_write_failed", `target changed during replacement: ${entry.relativePath}`);
      }
      fs.renameSync(target, join(repoRoot, backupPath));
      fs.renameSync(join(repoRoot, stagePath), target);
      hooks.afterReplacement?.({ index, entry });
    }
    for (const entry of plan.entries) {
      const target = join(repoRoot, entry.relativePath);
      if (digestBytes(fs.readFileSync(target)) !== entry.targetDigest) {
        throw failure("release_version_bump_write_failed", `post-write digest mismatch: ${entry.relativePath}`);
      }
    }
    fs.renameSync(paths.journal, paths.committed);
    recoverReleaseVersionBump({ repoRoot, fs, requireFreshInvocation: false });
    return plan;
  } catch (error) {
    try {
      if (fs.existsSync(paths.journal) || fs.existsSync(paths.committed)) {
        recoverReleaseVersionBump({ repoRoot, fs, requireFreshInvocation: false });
      } else {
        for (const entry of plan.entries) {
          removeOwnedFile(fs, join(repoRoot, ownedArtifactPaths(entry.relativePath).stagePath));
        }
      }
    } catch (recoveryError) {
      if (recoveryError.code === "release_version_bump_recovery_invalid") throw recoveryError;
      throw failure("release_version_bump_write_failed", `${error.message}; recovery failed: ${recoveryError.message}`);
    }
    if (error.code === "profile_history_contract_review_required"
        || error.code === "release_version_bump_invalid") throw error;
    throw failure("release_version_bump_write_failed", error.message);
  }
}
