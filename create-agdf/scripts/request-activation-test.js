import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  REQUEST_ACTIVATION_MARKERS,
  computeRequestActivationGuardFingerprint,
  getRuntimeContractModulePaths,
  parseRequestActivationOperationCatalog,
  syncRequestActivationProjections,
} from "./sync-request-activation-projections.js";
import { syncPackageAssets, toOpenCodeInstructionsRouter } from "./sync-package-assets.js";

const repoRoot = fileURLToPath(new URL("../..", import.meta.url));
const pluginRoot = join(repoRoot, "plugin");
const definitionPath = join(pluginRoot, "meta", "agdf-plugin.definition.json");
const contractPath = join(pluginRoot, "meta", "contracts", "request-activation.md");
const taskTargetContractPath = join(pluginRoot, "meta", "contracts", "task-target-resolution.md");
const interactionContractPath = join(pluginRoot, "meta", "contracts", "interaction.md");
const modesContractPath = join(pluginRoot, "meta", "contracts", "modes.md");
const gateTransitionContractPath = join(pluginRoot, "meta", "contracts", "gate-transition.md");
const gateCheckSkillPath = join(pluginRoot, "skills", "gate-check", "SKILL.md");
const routerPath = join(pluginRoot, "meta", "agdf-agent-router.md");
const manifestPath = join(pluginRoot, "meta", "agdf-runtime-contract.md");

function read(path) {
  return readFileSync(path, "utf8").replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function normalizeProse(content) {
  return readText(content).replace(/\s+/g, " ").trim();
}

function readText(content) {
  return content.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
}

function extractBlock(content, start, end) {
  assert.equal(content.split(start).length - 1, 1, `${start} must occur exactly once`);
  assert.equal(content.split(end).length - 1, 1, `${end} must occur exactly once`);
  const startIndex = content.indexOf(start);
  const endIndex = content.indexOf(end, startIndex) + end.length;
  assert.ok(endIndex > startIndex, `${start} must precede ${end}`);
  return content.slice(startIndex, endIndex);
}

function removeBlock(content, start, end) {
  const block = extractBlock(content, start, end);
  return content.replace(`${block}\n\n`, "").replace(block, "");
}

function stripMarkers(content, start, end) {
  return content.replace(`${start}\n`, "").replace(`${end}\n`, "").replace(end, "");
}

function copyProjectionFixture() {
  const fixtureRoot = mkdtempSync(join(tmpdir(), "agdf-request-activation-projection-"));
  cpSync(join(pluginRoot, "meta"), join(fixtureRoot, "plugin", "meta"), { recursive: true });
  cpSync(join(pluginRoot, "skills"), join(fixtureRoot, "plugin", "skills"), { recursive: true });
  cpSync(
    join(repoRoot, "create-agdf", "lib", "cli", "command-registry.js"),
    join(fixtureRoot, "create-agdf", "lib", "cli", "command-registry.js"),
    { recursive: true },
  );
  return fixtureRoot;
}

function digestPath(root) {
  const hash = createHash("sha256");
  function visit(path, relativePath = "") {
    const stats = statSync(path);
    if (stats.isDirectory()) {
      for (const name of readdirSync(path).sort()) visit(join(path, name), join(relativePath, name));
      return;
    }
    hash.update(relativePath.replaceAll("\\", "/"));
    hash.update("\0");
    hash.update(readFileSync(path));
    hash.update("\0");
  }
  visit(root);
  return hash.digest("hex");
}

const definition = JSON.parse(read(definitionPath));
const contract = read(contractPath);
const taskTargetContract = read(taskTargetContractPath);
const interactionContract = read(interactionContractPath);
const modesContract = read(modesContractPath);
const gateTransitionContract = read(gateTransitionContractPath);
const gateCheckSkill = read(gateCheckSkillPath);
const router = read(routerPath);
const manifest = read(manifestPath);

const expectedModules = [
  "meta/contracts/request-activation.md",
  "meta/contracts/task-target-resolution.md",
  "meta/contracts/gate-transition.md",
  "meta/contracts/interaction.md",
  "meta/contracts/modes.md",
  "meta/contracts/quality.md",
  "meta/contracts/context-graph.md",
  "meta/contracts/control-scaffold.md",
  "meta/contracts/closeout.md",
];
assert.deepEqual(getRuntimeContractModulePaths(definition), expectedModules);
for (const modulePath of expectedModules) assert.equal(statSync(join(pluginRoot, modulePath)).isFile(), true);

for (const mutate of [
  (value) => ({ ...value, runtimeContract: { ...value.runtimeContract, schemaVersion: 2 } }),
  (value) => ({ ...value, runtimeContract: { ...value.runtimeContract, manifestPath: "meta/other.md" } }),
  (value) => ({ ...value, runtimeContract: { ...value.runtimeContract, modules: [] } }),
  (value) => ({ ...value, runtimeContract: { ...value.runtimeContract, modules: [...value.runtimeContract.modules, value.runtimeContract.modules[0]] } }),
  (value) => ({ ...value, runtimeContract: { ...value.runtimeContract, modules: [value.runtimeContract.modules[1], value.runtimeContract.modules[0], ...value.runtimeContract.modules.slice(2)] } }),
  (value) => ({ ...value, runtimeContract: { ...value.runtimeContract, modules: ["unknown.md", ...value.runtimeContract.modules.slice(1)] } }),
]) {
  assert.throws(() => getRuntimeContractModulePaths(mutate(structuredClone(definition))), /runtimeContract/);
}

const guard = extractBlock(
  contract,
  REQUEST_ACTIVATION_MARKERS.guardStart,
  REQUEST_ACTIVATION_MARKERS.guardEnd,
);
const fingerprint = computeRequestActivationGuardFingerprint(guard);
assert.match(fingerprint, /^sha256:[0-9a-f]{64}$/);
assert.ok(guard.includes(`- \`guard_fingerprint\`: \`${fingerprint}\``));
assert.equal(
  extractBlock(router, REQUEST_ACTIVATION_MARKERS.guardStart, REQUEST_ACTIVATION_MARKERS.guardEnd),
  guard,
);
assert.ok(router.indexOf("## Request Activation") < router.indexOf("## Task Target Resolution"));
assert.ok(router.indexOf("## Task Target Resolution") < router.indexOf("## Mode Selection"));
assert.match(manifest, /Request Activation[\s\S]*Task Target Resolution[\s\S]*Gate Transition/);
const openCodeRouter = toOpenCodeInstructionsRouter(router);
assert.equal((openCodeRouter.match(/<!-- AGDF-REQUEST-ACTIVATION-GUARD:START -->/g) ?? []).length, 1);
assert.equal((openCodeRouter.match(/<!-- AGDF-REQUEST-ACTIVATION-GUARD:END -->/g) ?? []).length, 1);
assert.equal(
  extractBlock(openCodeRouter, REQUEST_ACTIVATION_MARKERS.guardStart, REQUEST_ACTIVATION_MARKERS.guardEnd),
  guard,
  "OpenCode router must preserve the byte-identical canonical Request Activation guard",
);
assert.throws(
  () => toOpenCodeInstructionsRouter(router.replace(REQUEST_ACTIVATION_MARKERS.guardStart, "")),
  /requires exactly one .*AGDF-REQUEST-ACTIVATION-GUARD:START/,
);

const taskTargetProse = normalizeProse(taskTargetContract);
assert.ok(
  taskTargetProse.includes("After positive Request Activation, resolve the user's primary work target"),
  "target-bound preflight must remain downstream of positive Request Activation",
);
assert.ok(
  taskTargetProse.includes("Automatic selection alone is not positive activation; on silent abstention this preflight is not run."),
  "automatic skill selection must not trigger target preflight",
);

const modesProse = normalizeProse(modesContract);
assert.ok(modesProse.includes("Request Activation precedes Mode Selection."));
assert.ok(
  modesProse.includes("read-only handling and are not Quick Tasks."),
  "ordinary read-only work must remain outside Quick Task",
);
assert.ok(
  modesProse.includes("it is never an activation fallback."),
  "Quick Task must not become an activation fallback",
);

const interactionProse = normalizeProse(interactionContract);
assert.ok(
  interactionProse.includes("Silent Request Activation abstention for an ordinary read-only request renders no AGDF orientation, status or other AGDF-visible text."),
  "ordinary read-only abstention must remain silent",
);
assert.ok(
  interactionProse.includes("After positive Request Activation selects a target-bound route, render the target orientation"),
  "target orientation must remain post-activation",
);
assert.ok(
  interactionContract.indexOf("`control_setup` is a non-gate envelope")
    < interactionContract.indexOf("Before presenting `gate_approval`"),
  "control setup must be defined before gate approval presentation",
);
assert.ok(interactionProse.includes("It renders no approval value, native gate control or synthetic selected run."));

const gateRulesProse = normalizeProse(gateTransitionContract.match(/## Gate Rules\r?\n([\s\S]*?)(?=\r?\n## )/)?.[1] ?? "");
const gateRulesSearch = gateRulesProse.toLowerCase();
const missingControlRuleStart = gateRulesSearch.indexOf("- after positive request activation and task-target resolution, missing control files");
const missingControlRuleEnd = gateRulesSearch.indexOf("- `approval: ur` permits", missingControlRuleStart);
const missingControlRule = missingControlRuleStart >= 0 && missingControlRuleEnd > missingControlRuleStart
  ? gateRulesSearch.slice(missingControlRuleStart, missingControlRuleEnd)
  : "";
const setupIndex = missingControlRule.indexOf("obtain explicit setup or link authority");
const persistenceIndex = missingControlRule.indexOf("persist", setupIndex);
const approvalIndex = missingControlRule.indexOf("approval: ur", persistenceIndex);
assert.ok(
  missingControlRule
    && setupIndex < persistenceIndex
    && persistenceIndex < approvalIndex,
  "missing-control flow must obtain setup authority and persist control before Approval: UR",
);
assert.ok(
  !missingControlRule.includes("then request `approval: ur`. this branch is unreachable for `target_unresolved`. initialize or write `.agdf/control/`"),
  "missing-control flow must not request Approval: UR before setup",
);

const gateCheckProse = normalizeProse(gateCheckSkill);
assert.deepEqual(gateCheckSkill.match(/^## .+$/gm), [
  "## Purpose",
  "## Request Activation",
  "## Route Boundary",
  "## Executable Dispatch",
  "## Declared `instruction_only` Fallback",
]);
for (const focusedContract of [
  "task-target-resolution.md",
  "gate-transition.md",
  "interaction.md",
  "control-scaffold.md",
  "modes.md",
  "quality.md",
]) assert.equal((gateCheckSkill.match(new RegExp(focusedContract.replace(".", "\\."), "g")) ?? []).length, 1);
assert.ok(
  !/## Native Interaction Path|## Repository Activation Diagnosis|## OpenCode Passive Hook Boundary|\| State \| Current gate or step \|/u.test(gateCheckSkill),
  "gate-check must keep detailed fallback handbooks out of the selected skill",
);
assert.ok(
  !gateCheckProse.includes("the default first action is to draft the minimal UR in the response and request `Approval: UR`."),
  "gate-check must not request Approval: UR before control setup and persistence",
);

const catalog = parseRequestActivationOperationCatalog(contract);
const expectedOperationIds = [
  "assist.agdf_help",
  "assist.agdf_suitability",
  "delivery.start",
  "lifecycle.control.init",
  "lifecycle.repository.activate.codex",
  "lifecycle.repository.activate.opencode",
  "lifecycle.repository.disable",
  "lifecycle.plugin.install.codex",
  "lifecycle.plugin.install.claude",
  "lifecycle.plugin.install.copilot",
  "lifecycle.plugin.install.opencode",
  "lifecycle.plugin.uninstall",
  "status.installation.codex",
  "status.installation.claude",
  "status.installation.copilot",
  "status.installation.opencode",
  "status.overview",
  "status.repository_delivery",
  "status.opencode_repository",
  "runtime.checks",
  "control.doctor",
  "control.delivery_map",
  "run.create",
  "run.migrate",
  "run.render_legacy",
  "continuation.current",
];
assert.deepEqual(catalog.operations.map(({ operation_id: operationId }) => operationId), expectedOperationIds);
assert.deepEqual(catalog.derived_operations, [{
  operation_id_pattern: "skill.<slug>",
  route_family: "direct_skill",
  derive_from: "pluginDefinition.skillSet",
  target_boundary: "dispatcher_v1",
  control_boundary: "dispatcher_v1",
  owner_kind: "dispatcher",
  owner: "skill-dispatch-v1",
}]);
assert.doesNotMatch(contract, /activation_trigger/);
assert.match(contract, /no raw prompt or derived request classification is written/);
assert.match(contract, /no network request, remote classifier, repository read, tool call, or dispatcher call/);

const sourceCheck = syncRequestActivationProjections({ repoRoot, mode: "check" });
assert.deepEqual(sourceCheck.changed, []);
assert.equal(sourceCheck.guard_fingerprint, fingerprint);
assert.deepEqual(sourceCheck.derived_skill_operations, definition.skillSet.map(({ slug }) => `skill.${slug}`));

for (const skill of definition.skillSet) {
  const skillPath = join(pluginRoot, "skills", skill.slug, "SKILL.md");
  const skillContent = read(skillPath);
  assert.equal((skillContent.match(/^## Request Activation$/gm) ?? []).length, 1, `${skill.slug} must contain exactly one Request Activation heading`);
  assert.equal(
    extractBlock(skillContent, REQUEST_ACTIVATION_MARKERS.guardStart, REQUEST_ACTIVATION_MARKERS.guardEnd),
    guard,
  );
  assert.ok(skillContent.indexOf(REQUEST_ACTIVATION_MARKERS.guardEnd) < skillContent.indexOf("## Executable Dispatch"));
  const descriptionLine = skillContent.match(/^description:.*$/m)?.[0];
  assert.ok(descriptionLine?.startsWith(`description: ${JSON.stringify(`Use this skill for this scope: ${skill.useFor}. Boundary: ${skill.boundary}. `).slice(0, -1)}`));
}

{
  const fixtureRoot = copyProjectionFixture();
  try {
    const path = join(fixtureRoot, "plugin", "skills", "gate-check", "SKILL.md");
    write(path, stripMarkers(
      read(path),
      REQUEST_ACTIVATION_MARKERS.guardStart,
      REQUEST_ACTIVATION_MARKERS.guardEnd,
    ));
    const before = digestPath(fixtureRoot);
    assert.throws(
      () => syncRequestActivationProjections({ repoRoot: fixtureRoot, mode: "write" }),
      /request activation guard start marker must occur exactly once|unowned Request Activation residue/,
    );
    assert.equal(digestPath(fixtureRoot), before, "residue rejection must not mutate any projection source");
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

{
  const fixtureRoot = copyProjectionFixture();
  try {
    const fixtureRouterPath = join(fixtureRoot, "plugin", "meta", "agdf-agent-router.md");
    const fixtureManifestPath = join(fixtureRoot, "plugin", "meta", "agdf-runtime-contract.md");
    let fixtureRouter = removeBlock(
      read(fixtureRouterPath),
      REQUEST_ACTIVATION_MARKERS.guardStart,
      REQUEST_ACTIVATION_MARKERS.guardEnd,
    );
    fixtureRouter = stripMarkers(
      fixtureRouter,
      REQUEST_ACTIVATION_MARKERS.skillRoutingStart,
      REQUEST_ACTIVATION_MARKERS.skillRoutingEnd,
    ).replace("## Role\n", "## Role\n<!-- NON-OWNED-SENTINEL -->\n");
    write(fixtureRouterPath, fixtureRouter);
    write(
      fixtureManifestPath,
      stripMarkers(
        read(fixtureManifestPath),
        REQUEST_ACTIVATION_MARKERS.runtimeModulesStart,
        REQUEST_ACTIVATION_MARKERS.runtimeModulesEnd,
      ),
    );
    for (const skill of definition.skillSet) {
      const skillPath = join(fixtureRoot, "plugin", "skills", skill.slug, "SKILL.md");
      write(skillPath, removeBlock(
        read(skillPath),
        REQUEST_ACTIVATION_MARKERS.guardStart,
        REQUEST_ACTIVATION_MARKERS.guardEnd,
      ));
    }
    assert.throws(
      () => syncRequestActivationProjections({ repoRoot: fixtureRoot, mode: "check" }),
      /ownership markers are missing|marker must occur exactly once/,
    );
    const before = digestPath(fixtureRoot);
    assert.throws(
      () => syncRequestActivationProjections({ repoRoot: fixtureRoot, mode: "write" }),
      /ownership markers are missing|marker must occur exactly once/,
    );
    assert.equal(digestPath(fixtureRoot), before, "missing ownership markers must fail closed with zero writes");
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

for (const breakFixture of [
  (fixtureRoot) => {
    const path = join(fixtureRoot, "plugin", "meta", "agdf-agent-router.md");
    write(path, read(path).replace(REQUEST_ACTIVATION_MARKERS.guardStart, ""));
  },
  (fixtureRoot) => {
    const path = join(fixtureRoot, "plugin", "meta", "agdf-agent-router.md");
    write(path, read(path).replace(REQUEST_ACTIVATION_MARKERS.guardEnd, ""));
  },
  (fixtureRoot) => {
    const path = join(fixtureRoot, "plugin", "meta", "agdf-agent-router.md");
    write(path, `${read(path)}\n${REQUEST_ACTIVATION_MARKERS.guardStart}\n`);
  },
  (fixtureRoot) => {
    const path = join(fixtureRoot, "plugin", "meta", "agdf-agent-router.md");
    write(path, `${read(path)}\n${REQUEST_ACTIVATION_MARKERS.guardEnd}\n`);
  },
  (fixtureRoot) => {
    const path = join(fixtureRoot, "plugin", "meta", "agdf-agent-router.md");
    write(path, read(path)
      .replace(REQUEST_ACTIVATION_MARKERS.guardStart, "<!-- AGDF-REQUEST-ACTIVATION-GUARD:TEMP -->")
      .replace(REQUEST_ACTIVATION_MARKERS.guardEnd, REQUEST_ACTIVATION_MARKERS.guardStart)
      .replace("<!-- AGDF-REQUEST-ACTIVATION-GUARD:TEMP -->", REQUEST_ACTIVATION_MARKERS.guardEnd));
  },
  (fixtureRoot) => {
    const path = join(fixtureRoot, "plugin", "meta", "agdf-agent-router.md");
    write(path, read(path).replace("Decide effect from loaded instructions", "Decide the effect from loaded instructions"));
  },
  (fixtureRoot) => {
    const path = join(fixtureRoot, "plugin", "meta", "agdf-agent-router.md");
    write(path, read(path).replace(fingerprint, `sha256:${"f".repeat(64)}`));
  },
  (fixtureRoot) => {
    const path = join(fixtureRoot, "plugin", "skills", "gate-check", "SKILL.md");
    const withoutGuard = removeBlock(read(path), REQUEST_ACTIVATION_MARKERS.guardStart, REQUEST_ACTIVATION_MARKERS.guardEnd);
    write(path, withoutGuard.replace("## Executable Dispatch", "## Executable Dispatch\n\n## Executable Dispatch"));
  },
]) {
  const fixtureRoot = copyProjectionFixture();
  try {
    breakFixture(fixtureRoot);
    const before = digestPath(fixtureRoot);
    assert.throws(
      () => syncRequestActivationProjections({ repoRoot: fixtureRoot, mode: "write" }),
      /marker must occur exactly once|partial or duplicate|out of order|stale|manually changed or fingerprint-mismatched|exactly one approved operational bootstrap anchor/,
    );
    assert.equal(digestPath(fixtureRoot), before, "invalid marker or manual drift must fail closed with zero writes");
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

for (const [from, to, expected] of [
  ['"owner": "doctor"', '"owner": "not-a-command"', /unknown commandRegistry owner/],
  ['"operation_id": "control.doctor"', '"operation_id": "unknown"', /missing or unknown operation_id/],
]) {
  const fixtureRoot = copyProjectionFixture();
  try {
    const fixtureContractPath = join(fixtureRoot, "plugin", "meta", "contracts", "request-activation.md");
    write(fixtureContractPath, read(fixtureContractPath).replace(from, to));
    assert.throws(() => syncRequestActivationProjections({ repoRoot: fixtureRoot, mode: "check" }), expected);
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

for (const unsafeSlug of ["../outside", "skill/name", "skill\\name", "/absolute-skill"]) {
  const fixtureRoot = copyProjectionFixture();
  try {
    const fixtureDefinitionPath = join(fixtureRoot, "plugin", "meta", "agdf-plugin.definition.json");
    const fixtureDefinition = JSON.parse(read(fixtureDefinitionPath));
    fixtureDefinition.skillSet[0].slug = unsafeSlug;
    write(fixtureDefinitionPath, `${JSON.stringify(fixtureDefinition, null, 2)}\n`);
    const before = digestPath(fixtureRoot);
    assert.throws(
      () => syncRequestActivationProjections({ repoRoot: fixtureRoot, mode: "write" }),
      /invalid skill slug/,
    );
    assert.equal(digestPath(fixtureRoot), before, `unsafe slug ${unsafeSlug} must cause zero projection mutations`);
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

{
  const fixtureRoot = copyProjectionFixture();
  const externalSkillRoot = mkdtempSync(join(tmpdir(), "agdf-request-activation-external-skill-"));
  try {
    const fixtureSkillRoot = join(fixtureRoot, "plugin", "skills", "gate-check");
    write(join(externalSkillRoot, "SKILL.md"), read(join(fixtureSkillRoot, "SKILL.md")));
    rmSync(fixtureSkillRoot, { recursive: true, force: true });
    let symlinkCreated = false;
    try {
      symlinkSync(externalSkillRoot, fixtureSkillRoot, process.platform === "win32" ? "junction" : "dir");
      symlinkCreated = true;
    } catch (error) {
      if (error?.code !== "EPERM") throw error;
      console.log("Skipped projection symlink fixture: symlink creation is unavailable on this host (EPERM).");
    }
    if (symlinkCreated) {
      const externalBefore = digestPath(externalSkillRoot);
      assert.throws(
        () => syncRequestActivationProjections({ repoRoot: fixtureRoot, mode: "write" }),
        /must not traverse symbolic links/,
      );
      assert.equal(digestPath(externalSkillRoot), externalBefore, "symlink rejection must not mutate the external target");
    }
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
    rmSync(externalSkillRoot, { recursive: true, force: true });
  }
}

{
  const fixtureRoot = copyProjectionFixture();
  try {
    const fixtureContractPath = join(fixtureRoot, "plugin", "meta", "contracts", "request-activation.md");
    const fixtureRegistryPath = join(fixtureRoot, "create-agdf", "lib", "cli", "command-registry.js");
    write(
      fixtureContractPath,
      read(fixtureContractPath).replace('"owner": "doctor"', '"owner": "comment-only-command"'),
    );
    write(
      fixtureRegistryPath,
      `${read(fixtureRegistryPath)}\n// command("comment-only-command", {})\nconst commandExample = 'command("comment-only-command", {})';\nconst commandTemplate = \`\ncommand("comment-only-command", {})\n\`;\n`,
    );
    assert.throws(
      () => syncRequestActivationProjections({ repoRoot: fixtureRoot, mode: "check" }),
      /unknown commandRegistry owner comment-only-command/,
    );
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

const mutationRoots = [
  join(pluginRoot, ".codex-plugin"),
  join(pluginRoot, ".claude-plugin"),
  join(repoRoot, "create-agdf", "generated"),
];
const beforeMutationGuard = mutationRoots.map(digestPath);
assert.throws(
  () => syncPackageAssets({ projectionCheck: () => { throw new Error("projection check rejected"); } }),
  /projection check rejected/,
);
assert.deepEqual(mutationRoots.map(digestPath), beforeMutationGuard, "failed projection check must cause zero package mutations");

console.log("Request activation projection tests passed");
