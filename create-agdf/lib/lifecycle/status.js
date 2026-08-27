import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { pluginDefinition } from "../cli/runtime-context.js";
import { evaluateDoctor } from "../control-evaluation/doctor.js";
import { evaluateGateCheck } from "../control-evaluation/gate-check.js";
import { evaluateOpenCodeStatus } from "../installers/opencode.js";
import { inspectPluginSurface } from "../installers/plugin-installers.js";
import { inspectGeneratedRepositoryMarketplace } from "../runtime/plugin-provenance.js";
import { runtimeCheckStatus } from "../runtime-check-consent/service.js";

function deliveryStatus(targetDir, selection, dependencies) {
  const controlDir = join(targetDir, ".agdf", "control");
  const hasLiveControl = existsSync(join(controlDir, "runs"))
    || (existsSync(join(controlDir, "AGDF_RUN.md")) && existsSync(join(controlDir, "MASTER_BACKLOG.md")));
  if (!hasLiveControl) {
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

function repositoryStatus(targetDir, surface) {
  if (surface === "codex") {
    const repository = inspectGeneratedRepositoryMarketplace(targetDir);
    const marketplace = repository.marketplacePath;
    const disabled = join(targetDir, ".codex", "config.toml");
    const config = existsSync(disabled) ? readFileSync(disabled, "utf8") : "";
    const isDisabled = ["agdf@agdf-repo", "agdf@agdf"].some((selector) => {
      const escaped = JSON.stringify(selector).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const section = config.match(new RegExp(`\\[plugins\\.${escaped}\\][\\s\\S]*?(?=\\n\\[|$)`))?.[0] ?? "";
      return /^enabled\s*=\s*false\s*$/m.test(section);
    });
    return {
      status: isDisabled ? "disabled" : repository.status === "matched" ? "active" : repository.status === "invalid" ? "degraded" : "not_configured",
      scope: "repository",
      evidence: [marketplace, ...(repository.reason ? [repository.reason] : [])],
    };
  }
  if (surface === "opencode") {
    const instructions = join(targetDir, ".opencode", pluginDefinition.opencode.instructionsFileName);
    return { status: existsSync(instructions) ? "active" : "not_configured", scope: "repository", evidence: [instructions] };
  }
  return { status: "unknown", scope: "repository", evidence: [] };
}

function inspectInstallation(surface, targetDir, options, deps, exec) {
  if (surface === "opencode") {
    const report = deps.evaluateOpenCodeStatus(targetDir, options.configDir);
    return {
      status: report.status === "configured" && report.package.version_status === "current" ? "healthy" : report.status === "configured" ? "degraded" : "not_installed",
      surface,
      version: report.package.installed_version,
      evidence: [report.global_config.path],
    };
  }
  if (["codex", "claude"].includes(surface)) return deps.inspectPluginSurface(surface, exec);
  return { status: "unknown", surface, version: null, evidence: [`unsupported_status_probe:${surface}`] };
}

export function evaluateGeneralStatus(targetDir, options = {}, dependencies = {}) {
  const deps = {
    evaluateDoctor: dependencies.evaluateDoctor ?? evaluateDoctor,
    evaluateGateCheck: dependencies.evaluateGateCheck ?? evaluateGateCheck,
    evaluateOpenCodeStatus: dependencies.evaluateOpenCodeStatus ?? evaluateOpenCodeStatus,
    inspectPluginSurface: dependencies.inspectPluginSurface ?? inspectPluginSurface,
  };
  let surface = options.surface && options.surface !== "generic" ? options.surface : null;
  let installation;
  if (surface) {
    installation = inspectInstallation(surface, targetDir, options, deps, dependencies.exec);
  } else {
    const probes = ["codex", "claude", "opencode"].map((candidate) => inspectInstallation(candidate, targetDir, options, deps, dependencies.exec));
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
  const repository = repositoryStatus(targetDir, surface);
  const delivery = deliveryStatus(targetDir, { runId: options.runId }, deps);
  const runtimeChecks = ["codex", "claude", "opencode"].includes(surface)
    ? runtimeCheckStatus(options.dataRoot, surface)
    : { requested: "unknown", effective: "unavailable", reason: "unsupported_host_capability" };
  const nextText = surface === "multiple"
    ? "Multiple AGDF host surfaces were detected; rerun status with an explicit --surface."
    : surface === "generic"
    ? "No installed AGDF host surface could be selected safely; rerun status with an explicit --surface."
    : installation.status !== "healthy"
    ? `Run npx --yes @agdf/cli@latest ${surface} to install or repair AGDF.`
    : repository.status === "disabled"
    ? "Restart the host to apply the repository-local disable; the healthy global AGDF installation remains available."
    : repository.status === "degraded"
    ? "The repository marketplace is incomplete or invalid; use the supported repository scaffold or the healthy durable global AGDF installation."
    : repository.status === "not_configured"
    ? `Run npx --yes @agdf/cli@latest ${surface === "codex" ? "codex-repo" : `${surface}-repo`} in this repository.`
    : delivery.status === "blocked"
    ? "Resolve the reported delivery blocker without changing the healthy installation."
    : delivery.status === "not_configured"
    ? "Start a new task; status created no run and requires no approval. Initialize durable control only when the repository needs it."
    : "Continue with the reported delivery next step.";
  return { schema_version: 1, installation, repository, delivery, runtime_checks: runtimeChecks, next_action: { kind: "action", text: nextText } };
}
