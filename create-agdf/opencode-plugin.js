import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import process from "node:process";
import { evaluateOpenCodeRepositoryActivation } from "./lib/installers/opencode-activation.js";
import { executeOpenCodeAutomaticRuntimeCheck } from "./lib/runtime-check-consent/service.js";

const packageJson = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

const readValidatorExpectedVersion = () => {
  try {
    const validatorPath = new URL("../../agdf/bin/agdf-local.js", import.meta.url);
    if (!existsSync(validatorPath)) return null;
    const content = readFileSync(validatorPath, "utf8");
    const match = content.match(/expectedVersion["']?\s*[:=]\s*["']([^"']+)["']/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
};

export const AGDFPlugin = async ({ directory, client }, dependencies = {}) => {
  const controlDir = `${directory}/.agdf/control`;
  const activation = () => evaluateOpenCodeRepositoryActivation(directory);
  const status = () => {
    const repositoryActivation = activation();
    return {
    active: repositoryActivation.active,
    version: packageJson.version,
    controlDir,
    repositoryActivation: repositoryActivation.state,
    repositorySurface: repositoryActivation.legacy_surface,
    };
  };
  const validatorPath = fileURLToPath(new URL("../../agdf/bin/agdf-local.js", import.meta.url));
  const dispatcherGuidance = `AGDF dispatcher binding: ${JSON.stringify({
    schema_version: "1",
    executable: process.execPath,
    argv_prefix: [validatorPath, "skill-dispatch", "--json", "--surface", "opencode"],
    expected_version: packageJson.version,
    activation_trigger: "invoked_skill_or_matching_delivery_intent",
    ordinary_conversation: "ignore_agdf_context",
    runtime_mention: "only_when_user_requests_agdf",
    pre_dispatch_output: "none",
    terminal_output: "host_action.text_verbatim_only",
    authorizes: false,
  })}. Ignore this AGDF context completely for ordinary conversation or a language preference alone: do not mention AGDF, runtime availability, tasks, repositories, runs, evidence, approvals or skills. For an invoked AGDF skill, emit no pre-dispatch prose: invoke this binding first with --language matching the current conversation, --working-directory, and explicit target/run evidence only when available. Obey result.host_action exactly. When terminal is true, output host_action.text byte-for-byte and stop.`;

  const activeGuidance = [
    "## AGDF Runtime Reminder",
    dispatcherGuidance,
    "This repository is AGDF-active through `.agdf/control/config.json`; use the globally installed AGDF runtime surface.",
    "For new build/change intent or unclear approval, load the native `agdf-global-gate-check` skill before later artefacts or implementation.",
    "Use the config-local `agdf/bin/agdf-local.js gate-check --status-card` for compact interactive status. Use `--json` only as deterministic proof for automation or audit evidence, and summarize it instead of mirroring full JSON into chat.",
  ].join("\n");

  const inactiveGuidance = [
    "## AGDF Plugin Notice",
    dispatcherGuidance,
    "The AGDF OpenCode npm plugin is loaded, but this repository has no valid `.agdf/control/config.json`.",
    "Do not apply AGDF gates from the global plugin alone. Create or repair durable AGDF control state with `npx --yes @agdf/cli@latest opencode-repo` when governance should be active here.",
  ].join("\n");

  const appendGuidance = async (output, key) => {
    if (!output || !Array.isArray(output[key])) {
      try {
        await safeLog({
          service: "agdf",
          level: "warn",
          message: `AGDF OpenCode guidance degraded: ${key} output is unavailable`,
          extra: { key, repositoryActivation: activation().state },
        });
      } catch {}
      return;
    }
    output[key].push(activation().active ? activeGuidance : inactiveGuidance);
  };

  const safeToast = async (message, variant) => {
    try {
      if (client?.tui?.showToast) await client.tui.showToast({ body: { message, variant } });
    } catch {}
  };

  const safeLog = async (body) => {
    try {
      const response = await client?.app?.log?.({ body });
      if (response?.error) await client?.app?.log?.(body);
    } catch {
      try { await client?.app?.log?.(body); } catch {}
    }
  };

  let automaticCheck;
  const currentAutomaticCheck = () => {
    automaticCheck ??= (dependencies.executeAutomaticRuntimeCheck ?? executeOpenCodeAutomaticRuntimeCheck)({ directory });
    return automaticCheck;
  };

  return {
    event: async ({ event }) => {
      if (event?.type === "session.created") {
        const currentStatus = status();
        const runtimeCheck = currentAutomaticCheck();
        await safeLog({
          service: "agdf",
          level: "info",
          message: currentStatus.active ? "AGDF OpenCode active through durable control" : "AGDF OpenCode global hook active without durable control",
          extra: { ...currentStatus, automatic_runtime_check: { effective: runtimeCheck.effective, reason: runtimeCheck.reason, ran: runtimeCheck.ran } },
        });
        if (!currentStatus.active) {
          await safeToast(
            "AGDF: No valid .agdf/control/config.json. Run npx --yes @agdf/cli@latest opencode-repo to activate governance.",
            "warning",
          );
        }
        const validatorVersion = readValidatorExpectedVersion();
        if (validatorVersion && validatorVersion !== packageJson.version) {
          await client.app.log({
            body: {
              service: "agdf",
              level: "warn",
              message: `AGDF version drift: plugin ${packageJson.version} vs validator ${validatorVersion}`,
              extra: { plugin_version: packageJson.version, validator_version: validatorVersion },
            },
          });
          await safeToast(
            `AGDF version drift: plugin ${packageJson.version} vs validator ${validatorVersion}. Run npx --yes @agdf/cli@latest opencode-repo to repair.`,
            "warning",
          );
        }
      }
    },

    "shell.env": async (_input, output) => {
      const currentStatus = status();
      output.env.AGDF_PLUGIN_ACTIVE = currentStatus.active ? "1" : "0";
      output.env.AGDF_PLUGIN_VERSION = currentStatus.version;
      output.env.AGDF_CONTROL_DIR = controlDir;
      output.env.AGDF_OPENCODE_REPOSITORY_SURFACE = currentStatus.repositorySurface ? "1" : "0";
      output.env.AGDF_OPENCODE_REPOSITORY_ACTIVATION = currentStatus.repositoryActivation;
    },

    "experimental.chat.system.transform": async (_input, output) => {
      await appendGuidance(output, "system");
      const runtimeCheck = currentAutomaticCheck();
      if (runtimeCheck.ran && runtimeCheck.output && Array.isArray(output?.system)) output.system.push(runtimeCheck.output);
    },

    "experimental.session.compacting": async (_input, output) => {
      await appendGuidance(output, "context");
    },
  };
};

export default AGDFPlugin;
