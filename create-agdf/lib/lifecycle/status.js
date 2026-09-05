import { existsSync } from "node:fs";
import { join } from "node:path";
import { evaluateDoctor } from "../control-evaluation/doctor.js";
import { evaluateGateCheck } from "../control-evaluation/gate-check.js";
import * as openCodeInstaller from "../installers/opencode.js";
import { evaluateOpenCodeRepositoryActivation } from "../installers/opencode-activation.js";
import { inspectPluginSurface, pluginBootstrapCommands } from "../installers/plugin-installers.js";
import { inspectCodexRepositoryStatus } from "../host-adapters/codex/plugin.js";
import { inspectOpenCodeInstallation, inspectOpenCodeRepositoryStatus } from "../host-adapters/opencode/status.js";
import { runtimeCheckStatus } from "../runtime-check-consent/service.js";
import { createOperationStatus } from "./result.js";

const SUPPORTED_SURFACES = Object.freeze(["codex", "claude", "copilot", "opencode"]);

export function inspectControlPresence(targetDir, dependencies = {}) {
  const pathExists = dependencies.existsSync ?? existsSync;
  return pathExists(join(targetDir, ".agdf", "control")) ? "candidate_present" : "absent";
}

function deliveryStatus(targetDir, selection, dependencies) {
  if (dependencies.inspectControlPresence(targetDir) === "absent") {
    return { status: "not_configured", run_id: null, current_gate: null, evidence: [] };
  }
  try {
    const doctor = dependencies.evaluateDoctor(targetDir, selection);
    const gate = dependencies.evaluateGateCheck(targetDir, selection);
    return {
      status: gate.status === "blocked" || doctor.status === "block" ? "blocked" : gate.status === "complete" ? "complete" : "open",
      run_id: selection.runId || null,
      current_gate: gate.current_gate || null,
      evidence: [`doctor:${doctor.status}`, `gate-check:${gate.status}`],
    };
  } catch (error) {
    return { status: "unknown", run_id: selection.runId || null, current_gate: null, evidence: [error.message] };
  }
}

function repositoryStatus(targetDir, surface, dependencies) {
  if (surface === "codex") {
    return inspectCodexRepositoryStatus(targetDir);
  }
  if (surface === "opencode") {
    return inspectOpenCodeRepositoryStatus(targetDir, dependencies.evaluateOpenCodeRepositoryActivation);
  }
  return { status: "unknown", scope: "repository", evidence: [] };
}

function inspectGlobalSurface(surface, options, dependencies) {
  if (surface === "opencode") {
    return inspectOpenCodeInstallation(options, dependencies.evaluateOpenCodeGlobalStatus);
  }
  if (SUPPORTED_SURFACES.includes(surface)) return dependencies.inspectPluginSurface(surface, dependencies.exec);
  return { status: "unknown", surface, version: null, evidence: [`unsupported_status_probe:${surface}`] };
}

export function inspectGlobalInstallationStatus(options = {}, dependencies = {}) {
  const deps = {
    evaluateOpenCodeGlobalStatus: dependencies.evaluateOpenCodeGlobalStatus
      ?? openCodeInstaller.evaluateOpenCodeGlobalStatus,
    inspectPluginSurface: dependencies.inspectPluginSurface ?? inspectPluginSurface,
    exec: dependencies.exec,
  };
  let surface = options.surface && options.surface !== "generic" ? options.surface : null;
  let installation;
  if (surface) {
    installation = inspectGlobalSurface(surface, options, deps);
  } else {
    const probes = SUPPORTED_SURFACES.map((candidate) => inspectGlobalSurface(candidate, options, deps));
    const observed = probes.filter((probe) => ["healthy", "degraded"].includes(probe.status));
    if (observed.length === 1) {
      installation = observed[0];
      surface = installation.surface;
    } else {
      surface = observed.length > 1 ? "multiple" : "generic";
      installation = {
        status: "unknown",
        surface,
        version: null,
        evidence: probes.flatMap((probe) => probe.evidence.map((item) => `${probe.surface}:${item}`)),
      };
    }
  }
  if (options.surface && options.surface !== "generic" && SUPPORTED_SURFACES.includes(options.surface)) {
    return installationStatusReport(installation);
  }
  return publicInstallationFacts(installation);
}

function publicInstallationFacts(installation) {
  const {
    schema_version: _schemaVersion,
    recommended_action: _recommendedAction,
    operation_status: _operationStatus,
    next_action: _nextAction,
    ...facts
  } = installation;
  return facts;
}

function installationStatusReport(installation) {
  const facts = publicInstallationFacts(installation);
  const nextAction = installation.recommended_action
    || (installation.status === "healthy"
      ? "No further installation action is required."
      : `Run ${bootstrapCommands(installation.surface).install} to install or repair AGDF.`);
  return Object.freeze({
    schema_version: 1,
    ...facts,
    operation_status: createOperationStatus({
      operationId: `status.installation.${installation.surface}`,
      outcome: "reported",
      targetScope: "global",
      plannedEffect: "read_only_status",
      excludedAuthority: ["target_inference", "run_creation", "gate_approval", "mutation"],
    }),
    next_action: Object.freeze({ kind: "action", text: nextAction }),
  });
}

function runtimeStatus(surface, options) {
  return SUPPORTED_SURFACES.includes(surface)
    ? runtimeCheckStatus(options.dataRoot, surface)
    : { requested: "unknown", effective: "unavailable", reason: "unsupported_host_capability" };
}

function nextStatusAction(installation, repository, delivery) {
  const surface = installation.surface;
  if (surface === "multiple") return "Multiple AGDF host surfaces were detected; rerun status with an explicit --surface.";
  if (surface === "generic") return "No installed AGDF host surface could be selected safely; rerun status with an explicit --surface.";
  if (installation.status !== "healthy") return `Run ${bootstrapCommands(surface).install} to install or repair AGDF.`;
  if (repository.status === "unresolved") return "Provide an explicit --dir to include repository and delivery status; cwd is not target authority.";
  if (repository.status === "disabled") return "Restart the host to apply the repository-local disable; the healthy global AGDF installation remains available.";
  if (repository.status === "degraded") return "The repository marketplace is incomplete or invalid; use the supported repository scaffold or the healthy durable global AGDF installation.";
  if (repository.status === "not_configured") return `Run ${bootstrapCommands(surface).repository} in this repository.`;
  if (delivery.status === "blocked") return "Resolve the reported delivery blocker without changing the healthy installation.";
  if (delivery.status === "not_configured") return "Start a new task; status created no run and requires no approval. Initialize durable control only when the repository needs it.";
  return "Continue with the reported delivery next step.";
}

function composeStatus({ operationId, targetDir = null, options, installation, dependencies }) {
  const surface = installation.surface;
  const repository = targetDir
    ? repositoryStatus(targetDir, surface, dependencies)
    : { status: "unresolved", scope: "repository", evidence: [] };
  const delivery = targetDir
    ? deliveryStatus(targetDir, { runId: options.runId }, dependencies)
    : { status: "unresolved", run_id: null, current_gate: null, evidence: [] };
  return {
    schema_version: 1,
    operation_status: createOperationStatus({
      operationId,
      outcome: "reported",
      targetScope: targetDir ? "repository" : "global",
      target: targetDir,
      plannedEffect: "read_only_status",
      excludedAuthority: ["target_inference", "run_creation", "gate_approval", "mutation"],
    }),
    installation,
    repository,
    delivery,
    runtime_checks: runtimeStatus(surface, options),
    next_action: { kind: "action", text: nextStatusAction(installation, repository, delivery) },
  };
}

function statusDependencies(dependencies) {
  return {
    evaluateDoctor: dependencies.evaluateDoctor ?? evaluateDoctor,
    evaluateGateCheck: dependencies.evaluateGateCheck ?? evaluateGateCheck,
    inspectControlPresence: dependencies.inspectControlPresence
      ?? ((targetDir) => inspectControlPresence(targetDir, dependencies)),
    evaluateOpenCodeRepositoryActivation: dependencies.evaluateOpenCodeRepositoryActivation
      ?? evaluateOpenCodeRepositoryActivation,
  };
}

export function evaluateGeneralStatus(targetDir, options = {}, dependencies = {}) {
  const installation = publicInstallationFacts(inspectGlobalInstallationStatus(options, dependencies));
  return composeStatus({
    operationId: "status.repository_delivery",
    targetDir,
    options,
    installation,
    dependencies: statusDependencies(dependencies),
  });
}

export function evaluateStatusOverview(options = {}, dependencies = {}) {
  const installation = publicInstallationFacts(inspectGlobalInstallationStatus(options, dependencies));
  const targetDir = typeof options.targetDir === "string" && options.targetDir ? options.targetDir : null;
  return composeStatus({
    operationId: "status.overview",
    targetDir,
    options,
    installation,
    dependencies: statusDependencies(dependencies),
  });
}

function bootstrapCommands(surface) {
  if (surface === "opencode") return openCodeInstaller.bootstrapCommands();
  return pluginBootstrapCommands(surface) ?? { install: `npx --yes @agdf/cli@latest ${surface}`, repository: `npx --yes @agdf/cli@latest ${surface}-repo` };
}
