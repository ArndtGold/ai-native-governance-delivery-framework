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
  delete catalogue.releases["0.14.4"];
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

try {
  assert.throws(
    () => runReleaseBumpCommand({ args: ["not-semver"], recover() {}, checkNpmVersion: () => assert.fail("npm called"), execute: () => assert.fail("write called") }),
    (error) => error.code === "release_version_bump_invalid",
  );
  assert.throws(
    () => runReleaseBumpCommand({
      args: ["0.14.5"],
      recover() {},
      checkNpmVersion() { throw Object.assign(new Error("published"), { code: "release_version_bump_invalid" }); },
      execute: () => assert.fail("write called"),
      output() {},
    }),
    (error) => error.code === "release_version_bump_invalid",
  );

  const repairRoot = fixture();
  const beforeRepair = bytes(repairRoot);
  const repairPlan = executeReleaseVersionBump({ repoRoot: repairRoot, nextVersion: "0.14.4" });
  assert.equal(repairPlan.mode, "reconcile_current");
  assert.ok(readCatalogue(repairRoot).releases["0.14.4"]);
  for (const path of releaseBumpTargetPaths().filter((path) => path !== "plugin/meta/distribution-profile-history.json")) {
    assert.equal(readFileSync(join(repairRoot, path), "utf8"), beforeRepair[path]);
  }
  for (const surface of WRITABLE_RELEASE_VERSION_SURFACES) {
    assert.equal(surface.readContent(readFileSync(join(repairRoot, surface.relativePath), "utf8")), "0.14.4");
  }
  assert.throws(
    () => executeReleaseVersionBump({ repoRoot: repairRoot, nextVersion: "0.14.4" }),
    (error) => error.code === "release_version_bump_invalid",
  );

  const forwardPlan = executeReleaseVersionBump({ repoRoot: repairRoot, nextVersion: "0.14.5" });
  assert.equal(forwardPlan.mode, "forward_bump");
  assert.ok(readCatalogue(repairRoot).releases["0.14.5"]);
  for (const surface of WRITABLE_RELEASE_VERSION_SURFACES) {
    assert.equal(surface.readContent(readFileSync(join(repairRoot, surface.relativePath), "utf8")), "0.14.5");
  }

  const prereleaseRoot = fixture();
  executeReleaseVersionBump({ repoRoot: prereleaseRoot, nextVersion: "0.14.4" });
  const prereleasePlan = executeReleaseVersionBump({ repoRoot: prereleaseRoot, nextVersion: "0.14.5-beta.1" });
  assert.equal(prereleasePlan.nextVersion, "0.14.5-beta.1");
  assert.ok(readCatalogue(prereleaseRoot).releases["0.14.5-beta.1"]);

  const changedRoot = fixture();
  executeReleaseVersionBump({ repoRoot: changedRoot, nextVersion: "0.14.4" });
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
    () => planReleaseVersionBump({ repoRoot: changedRoot, nextVersion: "0.14.5" }),
    (error) => {
      proposedDigest = error.proposedDigest;
      return error.code === "profile_history_contract_review_required" && /^[a-f0-9]{64}$/.test(proposedDigest);
    },
  );
  assertBytes(changedRoot, beforeReview);
  assert.throws(
    () => executeReleaseVersionBump({ repoRoot: changedRoot, nextVersion: "0.14.5", acceptedContractDigest: "0".repeat(64) }),
    (error) => error.code === "profile_history_contract_review_required",
  );
  assertBytes(changedRoot, beforeReview);
  executeReleaseVersionBump({ repoRoot: changedRoot, nextVersion: "0.14.5", acceptedContractDigest: proposedDigest });
  assert.ok(Object.values(readCatalogue(changedRoot).contracts).some((contract) => contract.contract_digest === proposedDigest));

  const rollbackRoot = fixture();
  executeReleaseVersionBump({ repoRoot: rollbackRoot, nextVersion: "0.14.4" });
  const beforeFailure = bytes(rollbackRoot);
  assert.throws(
    () => executeReleaseVersionBump({
      repoRoot: rollbackRoot,
      nextVersion: "0.14.5",
      hooks: { afterReplacement({ index }) { if (index === 2) throw new Error("injected replacement failure"); } },
    }),
    (error) => error.code === "release_version_bump_write_failed",
  );
  assertBytes(rollbackRoot, beforeFailure);

  const recoveryRoot = fixture();
  executeReleaseVersionBump({ repoRoot: recoveryRoot, nextVersion: "0.14.4" });
  const recoveryOriginal = bytes(recoveryRoot);
  const interruptedPlan = planReleaseVersionBump({ repoRoot: recoveryRoot, nextVersion: "0.14.5" });
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
  const unsafePlan = planReleaseVersionBump({ repoRoot: unsafeRoot, nextVersion: "0.14.4" });
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

  console.log(`Release bump passed (${releaseBumpTargetPaths().length} transactional files; repair, forward, review, rollback and recovery)`);
} finally {
  for (const root of roots) rmSync(root, { recursive: true, force: true });
}
