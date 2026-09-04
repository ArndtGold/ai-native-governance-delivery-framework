import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  executeReleaseVersionBump,
  planReleaseVersionBump,
  recoverReleaseVersionBump,
  releaseBumpTargetPaths,
} from "../lib/release/version-bump.js";
import { WRITABLE_RELEASE_VERSION_SURFACES } from "../lib/release/version-coherence.js";
import { runReleaseBumpCommand } from "./release-bump.js";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = resolve(packageRoot, "..");
const currentVersion = JSON.parse(
  readFileSync(join(repoRoot, "plugin/meta/agdf-plugin.definition.json"), "utf8"),
).version;
const currentVersionMatch = currentVersion.match(/^(\d+)\.(\d+)\.(\d+)(?:-|$)/);
assert.ok(currentVersionMatch, `repository version must be semver, got ${currentVersion}`);
const nextPatchVersion = `${currentVersionMatch[1]}.${currentVersionMatch[2]}.${Number(currentVersionMatch[3]) + 1}`;
const nextPrereleaseVersion = `${nextPatchVersion}-beta.1`;
const roots = [];

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "agdf-release-bump-"));
  roots.push(root);
  for (const relativePath of releaseBumpTargetPaths()) {
    mkdirSync(dirname(join(root, relativePath)), { recursive: true });
    cpSync(join(repoRoot, relativePath), join(root, relativePath));
  }
  const cataloguePath = join(root, "plugin/meta/distribution-profile-history.json");
  const catalogue = JSON.parse(readFileSync(cataloguePath, "utf8"));
  delete catalogue.releases[currentVersion];
  writeFileSync(cataloguePath, `${JSON.stringify(catalogue, null, 2)}\n`);
  mkdirSync(join(root, ".agdf"), { recursive: true });
  return root;
}

function bytes(root) {
  return Object.fromEntries(releaseBumpTargetPaths().map((path) => [path, readFileSync(join(root, path), "utf8")]));
}

function assertBytes(root, expected) {
  assert.deepEqual(bytes(root), expected);
}

function digest(content) {
  return createHash("sha256").update(content).digest("hex");
}

function readCatalogue(root) {
  return JSON.parse(readFileSync(join(root, "plugin/meta/distribution-profile-history.json"), "utf8"));
}

function executeFixtureBump(options) {
  return executeReleaseVersionBump({ tagExists: () => true, ...options });
}

function planFixtureBump(options) {
  return planReleaseVersionBump({ tagExists: () => true, ...options });
}

function symlinkCreationAvailable() {
  const probeRoot = mkdtempSync(join(tmpdir(), "agdf-release-bump-symlink-probe-"));
  try {
    symlinkSync(join(probeRoot, "probe-target"), join(probeRoot, "probe-link"));
    return true;
  } catch (error) {
    if (error?.code !== "EPERM") throw error;
    return false;
  } finally {
    rmSync(probeRoot, { recursive: true, force: true });
  }
}

try {
  assert.throws(
    () => runReleaseBumpCommand({ args: ["not-semver"], recover() {}, checkNpmVersion: () => assert.fail("npm called"), execute: () => assert.fail("write called") }),
    (error) => error.code === "release_version_bump_invalid",
  );
  assert.throws(
    () => runReleaseBumpCommand({
      args: [nextPatchVersion],
      recover() {},
      checkNpmVersion() { throw Object.assign(new Error("published"), { code: "release_version_bump_invalid" }); },
      execute: () => assert.fail("write called"),
      output() {},
    }),
    (error) => error.code === "release_version_bump_invalid",
  );

  const repairRoot = fixture();
  const beforeRepair = bytes(repairRoot);
  const repairPlan = executeFixtureBump({ repoRoot: repairRoot, nextVersion: currentVersion });
  assert.equal(repairPlan.mode, "reconcile_current");
  assert.ok(readCatalogue(repairRoot).releases[currentVersion]);
  for (const path of releaseBumpTargetPaths().filter((path) => path !== "plugin/meta/distribution-profile-history.json")) {
    assert.equal(readFileSync(join(repairRoot, path), "utf8"), beforeRepair[path]);
  }
  for (const surface of WRITABLE_RELEASE_VERSION_SURFACES) {
    assert.equal(surface.readContent(readFileSync(join(repairRoot, surface.relativePath), "utf8")), currentVersion);
  }
  assert.throws(
    () => executeFixtureBump({ repoRoot: repairRoot, nextVersion: currentVersion }),
    (error) => error.code === "release_version_bump_invalid",
  );

  assert.throws(
    () => executeReleaseVersionBump({ repoRoot: repairRoot, nextVersion: nextPatchVersion, tagExists: () => false }),
    (error) => error.code === "release_version_bump_invalid" && /has no exact tag/.test(error.message),
  );
  const forwardPlan = executeFixtureBump({ repoRoot: repairRoot, nextVersion: nextPatchVersion });
  assert.equal(forwardPlan.mode, "forward_bump");
  assert.ok(readCatalogue(repairRoot).releases[nextPatchVersion]);
  for (const surface of WRITABLE_RELEASE_VERSION_SURFACES) {
    assert.equal(surface.readContent(readFileSync(join(repairRoot, surface.relativePath), "utf8")), nextPatchVersion);
  }

  const prereleaseRoot = fixture();
  executeFixtureBump({ repoRoot: prereleaseRoot, nextVersion: currentVersion });
  const prereleasePlan = executeFixtureBump({ repoRoot: prereleaseRoot, nextVersion: nextPrereleaseVersion });
  assert.equal(prereleasePlan.nextVersion, nextPrereleaseVersion);
  assert.ok(readCatalogue(prereleaseRoot).releases[nextPrereleaseVersion]);

  const changedRoot = fixture();
  executeFixtureBump({ repoRoot: changedRoot, nextVersion: currentVersion });
  const changedDefinitionPath = join(changedRoot, "plugin/meta/agdf-plugin.definition.json");
  const changedDefinition = JSON.parse(readFileSync(changedDefinitionPath, "utf8"));
  changedDefinition.distributionProfiles.profiles["future-profile"] = {
    runtime: "absent",
    installable: false,
    machineValidation: "unavailable",
  };
  writeFileSync(changedDefinitionPath, `${JSON.stringify(changedDefinition, null, 2)}\n`);
  const beforeReview = bytes(changedRoot);
  let proposedDigest;
  assert.throws(
    () => planFixtureBump({ repoRoot: changedRoot, nextVersion: nextPatchVersion }),
    (error) => {
      proposedDigest = error.proposedDigest;
      return error.code === "profile_history_contract_review_required" && /^[a-f0-9]{64}$/.test(proposedDigest);
    },
  );
  assertBytes(changedRoot, beforeReview);
  assert.throws(
    () => executeFixtureBump({ repoRoot: changedRoot, nextVersion: nextPatchVersion, acceptedContractDigest: "0".repeat(64) }),
    (error) => error.code === "profile_history_contract_review_required",
  );
  assertBytes(changedRoot, beforeReview);
  executeFixtureBump({ repoRoot: changedRoot, nextVersion: nextPatchVersion, acceptedContractDigest: proposedDigest });
  assert.ok(Object.values(readCatalogue(changedRoot).contracts).some((contract) => contract.contract_digest === proposedDigest));

  const rollbackRoot = fixture();
  executeFixtureBump({ repoRoot: rollbackRoot, nextVersion: currentVersion });
  const beforeFailure = bytes(rollbackRoot);
  assert.throws(
    () => executeFixtureBump({
      repoRoot: rollbackRoot,
      nextVersion: nextPatchVersion,
      hooks: { afterReplacement({ index }) { if (index === 2) throw new Error("injected replacement failure"); } },
    }),
    (error) => error.code === "release_version_bump_write_failed",
  );
  assertBytes(rollbackRoot, beforeFailure);

  const recoveryRoot = fixture();
  executeFixtureBump({ repoRoot: recoveryRoot, nextVersion: currentVersion });
  const recoveryOriginal = bytes(recoveryRoot);
  const interruptedPlan = planFixtureBump({ repoRoot: recoveryRoot, nextVersion: nextPatchVersion });
  const journalEntries = interruptedPlan.entries.map((entry) => ({
    relative_path: entry.relativePath,
    stage_path: `${entry.relativePath}.agdf-release-bump-stage`,
    backup_path: `${entry.relativePath}.agdf-release-bump-backup`,
    original_digest: entry.originalDigest,
    target_digest: entry.targetDigest,
  }));
  for (const entry of interruptedPlan.entries) {
    writeFileSync(join(recoveryRoot, `${entry.relativePath}.agdf-release-bump-stage`), entry.targetContent);
  }
  writeFileSync(join(recoveryRoot, ".agdf/release-bump-transaction.json"), `${JSON.stringify({
    schema_version: 1,
    transaction_id: randomUUID(),
    entries: journalEntries,
  }, null, 2)}\n`);
  const first = interruptedPlan.entries[0];
  renameSync(join(recoveryRoot, first.relativePath), join(recoveryRoot, `${first.relativePath}.agdf-release-bump-backup`));
  renameSync(join(recoveryRoot, `${first.relativePath}.agdf-release-bump-stage`), join(recoveryRoot, first.relativePath));
  assert.throws(
    () => recoverReleaseVersionBump({ repoRoot: recoveryRoot }),
    (error) => error.code === "release_version_bump_recovery_required" && error.recovered === true,
  );
  assertBytes(recoveryRoot, recoveryOriginal);

  const unsafeRoot = fixture();
  const unsafePlan = planFixtureBump({ repoRoot: unsafeRoot, nextVersion: currentVersion });
  const unsafeOriginal = bytes(unsafeRoot);
  const unsafeEntries = unsafePlan.entries.map((entry) => ({
    relative_path: entry.relativePath,
    stage_path: `${entry.relativePath}.agdf-release-bump-stage`,
    backup_path: `${entry.relativePath}.agdf-release-bump-backup`,
    original_digest: digest(entry.originalContent),
    target_digest: digest(entry.targetContent),
  }));
  unsafeEntries[0].relative_path = "../outside";
  writeFileSync(join(unsafeRoot, ".agdf/release-bump-transaction.json"), `${JSON.stringify({
    schema_version: 1,
    transaction_id: randomUUID(),
    entries: unsafeEntries,
  })}\n`);
  assert.throws(
    () => recoverReleaseVersionBump({ repoRoot: unsafeRoot }),
    (error) => error.code === "release_version_bump_recovery_invalid",
  );
  assertBytes(unsafeRoot, unsafeOriginal);

  rmSync(join(unsafeRoot, ".agdf/release-bump-transaction.json"));
  const symlinkEntries = unsafePlan.entries.map((entry) => ({
    relative_path: entry.relativePath,
    stage_path: `${entry.relativePath}.agdf-release-bump-stage`,
    backup_path: `${entry.relativePath}.agdf-release-bump-backup`,
    original_digest: entry.originalDigest,
    target_digest: entry.targetDigest,
  }));
  if (symlinkCreationAvailable()) {
    const symlinkStage = join(unsafeRoot, symlinkEntries[0].stage_path);
    symlinkSync(join(unsafeRoot, symlinkEntries[0].relative_path), symlinkStage);
    writeFileSync(join(unsafeRoot, ".agdf/release-bump-transaction.json"), `${JSON.stringify({
      schema_version: 1,
      transaction_id: randomUUID(),
      entries: symlinkEntries,
    })}\n`);
    assert.throws(
      () => recoverReleaseVersionBump({ repoRoot: unsafeRoot }),
      (error) => error.code === "release_version_bump_recovery_invalid",
    );
    assertBytes(unsafeRoot, unsafeOriginal);
  } else {
    console.log("Skipped release-bump symlink recovery fixture: symlink creation is unavailable on this host (EPERM).");
  }

  console.log(`Release bump passed (${releaseBumpTargetPaths().length} transactional files; repair, forward, review, rollback and recovery)`);
} finally {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
}
