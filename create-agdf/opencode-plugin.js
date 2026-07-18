import { readFileSync } from "node:fs";
import { evaluateOpenCodeRepositoryActivation } from "./lib/installers/opencode-activation.js";

const packageJson = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

export const AGDFPlugin = async ({ directory, client }) => {
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

  const activeGuidance = [
    "## AGDF Runtime Reminder",
    "This repository is AGDF-active through `.agdf/control/config.json`; use the globally installed AGDF runtime surface.",
    "For new build/change intent or unclear approval, load the native `agdf-global-gate-check` skill before later artefacts or implementation.",
    "Use the config-local `agdf/bin/agdf-local.js gate-check --status-card` for compact interactive status. Use `--json` only as deterministic proof for automation or audit evidence, and summarize it instead of mirroring full JSON into chat.",
  ].join("\n");

  const inactiveGuidance = [
    "## AGDF Plugin Notice",
    "The AGDF OpenCode npm plugin is loaded, but this repository has no valid `.agdf/control/config.json`.",
    "Do not apply AGDF gates from the global plugin alone. Create or repair durable AGDF control state with `npx --yes @agdf/cli@latest opencode-repo` when governance should be active here.",
  ].join("\n");

  return {
    event: async ({ event }) => {
      if (event?.type === "session.created") {
        const currentStatus = status();
        await client.app.log({
          body: {
            service: "agdf",
            level: "info",
            message: currentStatus.active ? "AGDF OpenCode active through durable control" : "AGDF OpenCode global hook active without durable control",
            extra: currentStatus,
          },
        });
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
      output.system.push(activation().active ? activeGuidance : inactiveGuidance);
    },

    "experimental.session.compacting": async (_input, output) => {
      output.context.push(activation().active ? activeGuidance : inactiveGuidance);
    },
  };
};

export default AGDFPlugin;
