import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseRequestActivationOperationCatalog } from "./sync-request-activation-projections.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const manifest = JSON.parse(readFileSync(join(repoRoot, "evals", "request-activation", "manifest.json"), "utf8"));
const definition = JSON.parse(readFileSync(join(repoRoot, "plugin", "meta", "agdf-plugin.definition.json"), "utf8"));
const contract = readFileSync(join(repoRoot, "plugin", "meta", "contracts", "request-activation.md"), "utf8");
const catalog = parseRequestActivationOperationCatalog(contract);
const callbacks = manifest.callback_vocabulary;
const callbackSet = new Set(callbacks);
const operations = new Map(catalog.operations.map((operation) => [operation.operation_id, operation]));
const skillSlugs = new Set(definition.skillSet.map(({ slug }) => slug));

function createRecorder({ baseline = {}, failuresBeforeSuccess = {} } = {}) {
  const counts = Object.fromEntries(callbacks.map((name) => [name, baseline[name] ?? 0]));
  const before = { ...counts };
  const trace = [];
  const attempts = Object.fromEntries(callbacks.map((name) => [name, 0]));

  async function invoke(name, { retryOnce = false } = {}) {
    assert.ok(callbackSet.has(name), `unknown SD callback ${name}`);
    const maximumAttempts = retryOnce ? 2 : 1;
    for (let attempt = 0; attempt < maximumAttempts; attempt += 1) {
      attempts[name] += 1;
      counts[name] += 1;
      trace.push(name);
      if (attempts[name] > (failuresBeforeSuccess[name] ?? 0)) return true;
    }
    return false;
  }

  return {
    invoke,
    snapshot(extra = {}) {
      return {
        baseline: before,
        counts: { ...counts },
        delta: Object.fromEntries(callbacks.map((name) => [name, counts[name] - before[name]])),
        trace: [...trace],
        attempts: { ...attempts },
        ...extra,
      };
    },
  };
}

function operationFor(operationId) {
  if (operationId?.startsWith("skill.")) {
    const slug = operationId.slice("skill.".length);
    assert.ok(skillSlugs.has(slug), `unknown derived skill operation ${operationId}`);
    return { operation_id: operationId, route_family: "direct_skill" };
  }
  const operation = operations.get(operationId);
  assert.ok(operation, `unknown catalog operation ${operationId}`);
  return operation;
}

// Test-only executor. Applicability and operation_id are already decided by the case;
// this function never receives or classifies natural-language request text.
async function executePreclassifiedRequest({
  decision,
  operationId = null,
  controlContext = "not_applicable",
  targetMatches = true,
  setupAuthorized = false,
  revisionMatches = true,
  approvalMatches = true,
  targetProvided = false,
  retryOwnerOnce = false,
}, recorder) {
  let approvalRequests = 0;
  let durableControl = controlContext === "active_run";
  let persistedUr = controlContext === "active_run";

  const finish = (outcome) => recorder.snapshot({ outcome, approvalRequests, durableControl, persistedUr });
  const render = () => recorder.invoke("agdf_renderer");
  const requireTarget = async () => {
    await recorder.invoke("target_resolver");
    if (targetMatches) return true;
    await render();
    return false;
  };

  if (["abstain", "clarify"].includes(decision)) return finish(decision);
  const operation = operationFor(operationId);

  if (operation.route_family === "direct_skill") {
    await recorder.invoke("dispatcher_v1");
    return finish("dispatched");
  }

  if (operation.route_family === "control_independent_help") {
    await recorder.invoke("help_suitability_owner");
    return finish("reported");
  }

  if (operation.route_family === "global_installation_status") {
    await recorder.invoke("installation_status_owner");
    await render();
    return finish("reported");
  }

  if (operation.route_family === "status_overview") {
    await recorder.invoke("installation_status_owner");
    if (targetProvided) {
      if (!await requireTarget()) return finish("target_mismatch");
      await recorder.invoke("repository_status_owner");
    }
    await render();
    return finish("reported");
  }

  if (operation.route_family === "repository_status") {
    if (!await requireTarget()) return finish("target_mismatch");
    await recorder.invoke("repository_status_owner");
    await render();
    return finish("reported");
  }

  if (["global_plugin_lifecycle", "global_runtime_lifecycle"].includes(operation.route_family)) {
    const ownerSucceeded = await recorder.invoke("lifecycle_owner", { retryOnce: retryOwnerOnce });
    await render();
    return finish(ownerSucceeded ? "succeeded" : "failed");
  }

  if (["repository_control_lifecycle", "repository_surface_lifecycle", "run_lifecycle"].includes(operation.route_family)) {
    if (!await requireTarget()) return finish("target_mismatch");
    if (operation.route_family === "repository_surface_lifecycle") await recorder.invoke("repository_activation");
    await recorder.invoke("lifecycle_owner");
    if (operation.operation_id === "lifecycle.control.init") {
      await recorder.invoke("canonical_init");
      durableControl = true;
    }
    await render();
    return finish("succeeded");
  }

  if (operation.route_family === "deterministic_control_inspection") {
    if (!await requireTarget()) return finish("target_mismatch");
    await recorder.invoke("control_evaluator");
    await render();
    return finish("reported");
  }

  if (operation.route_family === "governed_delivery_intake") {
    if (!await requireTarget()) return finish("target_mismatch");
    await recorder.invoke("control_presence");
    if (controlContext !== "active_run") {
      if (!setupAuthorized) {
        await render();
        return finish("control_setup_required");
      }
      await recorder.invoke("canonical_init");
      durableControl = true;
      persistedUr = true;
      await recorder.invoke("dispatcher_v1");
      await recorder.invoke("control_evaluator");
      await render();
      if (revisionMatches) approvalRequests += 1;
      return finish(revisionMatches ? "approval_ready" : "stale_revision");
    }
    await recorder.invoke("dispatcher_v1");
    await render();
    return finish("gate_result");
  }

  if (operation.route_family === "active_run_continuation") {
    if (!await requireTarget()) return finish("target_mismatch");
    await recorder.invoke("run_selector");
    await recorder.invoke("control_evaluator");
    await render();
    if (revisionMatches && approvalMatches) approvalRequests += 1;
    return finish(!revisionMatches ? "stale_revision" : approvalMatches ? "continued" : "approval_mismatch");
  }

  assert.fail(`uncovered catalog route family ${operation.route_family}`);
}

const nonZeroSessionStartBaseline = Object.fromEntries(callbacks.map((name, index) => [name, index + 3]));
for (const decision of ["abstain", "clarify"]) {
  const result = await executePreclassifiedRequest({ decision }, createRecorder({ baseline: nonZeroSessionStartBaseline }));
  assert.deepEqual(result.trace, []);
  assert.equal(Object.values(result.delta).every((count) => count === 0), true, `${decision} must have zero request-caused callback delta`);
}

let result = await executePreclassifiedRequest(
  { decision: "activate_named_operation", operationId: "skill.gate-check" },
  createRecorder({ baseline: nonZeroSessionStartBaseline }),
);
assert.deepEqual(result.trace, ["dispatcher_v1"], "direct skill must dispatch first and perform no pre-probe");

result = await executePreclassifiedRequest(
  { decision: "activate_delivery_intake", operationId: "delivery.start", controlContext: "active_run" },
  createRecorder(),
);
assert.deepEqual(result.trace, ["target_resolver", "control_presence", "dispatcher_v1", "agdf_renderer"]);
assert.equal(result.trace.indexOf("control_evaluator"), -1, "delivery intake must not evaluate control before dispatcher revalidation");

result = await executePreclassifiedRequest(
  { decision: "activate_delivery_intake", operationId: "delivery.start", controlContext: "no_control" },
  createRecorder(),
);
assert.deepEqual(result.trace, ["target_resolver", "control_presence", "agdf_renderer"]);
assert.equal(result.approvalRequests, 0);
assert.equal(result.delta.canonical_init, 0, "delivery intent alone must not authorize control initialization");

result = await executePreclassifiedRequest(
  { decision: "activate_delivery_intake", operationId: "delivery.start", controlContext: "no_control", setupAuthorized: true },
  createRecorder(),
);
assert.deepEqual(result.trace, ["target_resolver", "control_presence", "canonical_init", "dispatcher_v1", "control_evaluator", "agdf_renderer"]);
assert.equal(result.durableControl, true);
assert.equal(result.persistedUr, true);
assert.equal(result.approvalRequests, 1, "exactly one approval may be requested after durable setup and revalidation");

result = await executePreclassifiedRequest(
  { decision: "activate_delivery_intake", operationId: "delivery.start", controlContext: "no_control", setupAuthorized: true, revisionMatches: false },
  createRecorder(),
);
assert.equal(result.outcome, "stale_revision");
assert.equal(result.approvalRequests, 0, "stale revision must stop before approval");

for (const [scenario, expectedTrace] of [
  [{ decision: "activate_named_operation", operationId: "status.installation.opencode" }, ["installation_status_owner", "agdf_renderer"]],
  [{ decision: "activate_named_operation", operationId: "status.overview" }, ["installation_status_owner", "agdf_renderer"]],
  [{ decision: "activate_named_operation", operationId: "status.repository_delivery" }, ["target_resolver", "repository_status_owner", "agdf_renderer"]],
  [{ decision: "activate_named_operation", operationId: "lifecycle.repository.activate.opencode" }, ["target_resolver", "repository_activation", "lifecycle_owner", "agdf_renderer"]],
  [{ decision: "activate_named_operation", operationId: "control.doctor" }, ["target_resolver", "control_evaluator", "agdf_renderer"]],
  [{ decision: "activate_continuation", operationId: "continuation.current" }, ["target_resolver", "run_selector", "control_evaluator", "agdf_renderer"]],
]) {
  result = await executePreclassifiedRequest(scenario, createRecorder());
  assert.deepEqual(result.trace, expectedTrace, scenario.operationId);
}

result = await executePreclassifiedRequest(
  { decision: "activate_continuation", operationId: "continuation.current", revisionMatches: false },
  createRecorder(),
);
assert.equal(result.outcome, "stale_revision");
assert.equal(result.approvalRequests, 0);
assert.equal(result.delta.canonical_init, 0);

result = await executePreclassifiedRequest(
  { decision: "activate_continuation", operationId: "continuation.current", approvalMatches: false },
  createRecorder(),
);
assert.equal(result.outcome, "approval_mismatch");
assert.equal(result.approvalRequests, 0, "a wrong gate approval must stop after revalidation without approval effect");
assert.deepEqual(result.trace, ["target_resolver", "run_selector", "control_evaluator", "agdf_renderer"]);

result = await executePreclassifiedRequest(
  { decision: "activate_continuation", operationId: "continuation.current", targetMatches: false },
  createRecorder(),
);
assert.deepEqual(result.trace, ["target_resolver", "agdf_renderer"]);
assert.equal(result.delta.run_selector, 0);
assert.equal(result.delta.control_evaluator, 0);
assert.equal(result.approvalRequests, 0);

result = await executePreclassifiedRequest(
  { decision: "activate_named_operation", operationId: "runtime.checks", retryOwnerOnce: true },
  createRecorder({ failuresBeforeSuccess: { lifecycle_owner: 1 } }),
);
assert.deepEqual(result.trace, ["lifecycle_owner", "lifecycle_owner", "agdf_renderer"]);
assert.equal(result.attempts.lifecycle_owner, 2, "transient recovery must make at most one retry");
assert.equal(result.outcome, "succeeded");

result = await executePreclassifiedRequest(
  { decision: "activate_named_operation", operationId: "runtime.checks", retryOwnerOnce: true },
  createRecorder({ failuresBeforeSuccess: { lifecycle_owner: 2 } }),
);
assert.equal(result.attempts.lifecycle_owner, 2, "persistent failure must stop after one bounded retry");
assert.equal(result.outcome, "failed");

console.log("Request Activation callback and ordering integration tests passed");
