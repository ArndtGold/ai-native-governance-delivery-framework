import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
  applyCopilotRepositoryDisable,
  planCopilotRepositoryDisable,
  verifyCopilotRepositoryDisabled,
} from "../installers/copilot-settings.js";
import {
  evaluateOpenCodeGlobalStatus as inspectOpenCodeGlobalStatus,
  planOpenCodeGlobalUninstall,
  verifyOpenCodeGlobalUninstall,
} from "../installers/opencode.js";
import { inspectPluginSurface } from "../installers/plugin-installers.js";
import { planCodexRepositoryDisable, verifyCodexRepositoryDisabled, uninstallCommand as codexUninstallCommand } from "../host-adapters/codex/plugin.js";
import { uninstallCommand as claudeUninstallCommand } from "../host-adapters/claude/plugin.js";
import { uninstallCommand as copilotUninstallCommand } from "../host-adapters/copilot/plugin.js";

export function planRepositoryDisable(targetDir, surface, { shared = false, exec = execFileSync } = {}) {
  if (surface === "copilot") {
    const settings = planCopilotRepositoryDisable({ targetDir, shared, exec });
    return Object.freeze({
      operation: "disable",
      surface,
      scope: "repository",
      audience: settings.audience,
      mutations: Object.freeze(settings.changed
        ? [{ kind: "copilot_settings", path: settings.path, settings }]
        : []),
      retained: Object.freeze([join(targetDir, ".agdf", "control"), "global AGDF plugin availability", "independent repository instructions"]),
      expected: Object.freeze({ repository_status: "configured_disabled", activation_status: "pending_restart", settings_path: settings.path }),
    });
  }
  if (surface !== "codex" || shared) {
    throw new Error(`Repository disable is not supported safely for ${surface}; no files were changed.`);
  }
  return planCodexRepositoryDisable(targetDir);
}

export function verifyRepositoryDisabled(targetDir, surface = "codex", { shared = false } = {}) {
  if (surface === "copilot") return verifyCopilotRepositoryDisabled(targetDir, { shared });
  if (surface !== "codex") return { status: "failed", evidence: [`unsupported_surface:${surface}`] };
  return verifyCodexRepositoryDisabled(targetDir);
}

export function verifyGlobalUninstall(plan, _targetDir, {
  configDir,
  exec,
  inspect = inspectPluginSurface,
  evaluateOpenCodeGlobalStatus = inspectOpenCodeGlobalStatus,
} = {}) {
  if (plan.surface === "opencode") {
    return verifyOpenCodeGlobalUninstall(plan, configDir, evaluateOpenCodeGlobalStatus);
  }
  const report = inspect(plan.surface, exec);
  return report.status === "not_installed"
    ? { status: "healthy", evidence: report.evidence }
    : { status: "failed", evidence: [...report.evidence, `observed:${report.status}`] };
}

export function planGlobalUninstall(surface, { configDir } = {}) {
  if (surface === "opencode") return planOpenCodeGlobalUninstall(configDir);
  const command = surface === "codex" ? codexUninstallCommand()
    : surface === "claude" ? claudeUninstallCommand()
      : surface === "copilot" ? copilotUninstallCommand() : null;
  if (!command) throw new Error(`Global uninstall is not supported for ${surface}.`);
  return nativeUninstallPlan(surface, command.executable, command.args);
}

function nativeUninstallPlan(surface, executable, args) {
  return Object.freeze({
    operation: "uninstall",
    surface,
    scope: "global",
    mutations: Object.freeze([{ kind: "command", executable, args: Object.freeze(args) }]),
    retained: Object.freeze(["repository AGDF files", ".agdf/control", "ambiguous configuration"]),
    expected: Object.freeze({ installation_status: "not_installed" }),
  });
}

export function applyLifecyclePlan(plan, { exec = execFileSync, applyCopilotSettings = applyCopilotRepositoryDisable } = {}) {
  const completed = [];
  for (const mutation of plan.mutations) {
    try {
      if (mutation.kind === "write") {
        mkdirSync(dirname(mutation.path), { recursive: true });
        writeFileSync(mutation.path, mutation.content, "utf8");
        completed.push({ kind: "write", path: mutation.path });
      } else if (mutation.kind === "copilot_settings") {
        const result = applyCopilotSettings(mutation.settings);
        completed.push({ kind: "copilot_settings", path: mutation.path, status: result.status });
      } else if (mutation.kind === "remove") {
        rmSync(mutation.path);
        completed.push({ kind: "remove", path: mutation.path });
      } else if (mutation.kind === "command") {
        exec(mutation.executable, mutation.args, { cwd: mutation.cwd, stdio: "inherit" });
        completed.push({ kind: "command", executable: mutation.executable, args: mutation.args });
      }
    } catch (error) {
      return { status: completed.length ? "partial" : "failed", completed, error, retained: [...plan.retained] };
    }
  }
  return { status: "success", completed, error: null, retained: [...plan.retained] };
}
