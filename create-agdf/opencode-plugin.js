import { existsSync, readFileSync } from "node:fs";

const packageJson = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

export const AGDFPlugin = async ({ directory, client }) => {
  const controlDir = `${directory}/.agdf/control`;
  const hasRepositorySurface = () => existsSync(`${directory}/.opencode/AGDF.md`) && existsSync(`${directory}/.opencode/agents`);
  const status = () => ({
    active: true,
    version: packageJson.version,
    controlDir,
    repositorySurface: hasRepositorySurface(),
  });

  return {
    event: async ({ event }) => {
      if (event?.type === "session.created") {
        const currentStatus = status();
        await client.app.log({
          body: {
            service: "agdf",
            level: "info",
            message: currentStatus.repositorySurface ? "AGDF OpenCode active" : "AGDF OpenCode global hook active without repository surface",
            extra: currentStatus,
          },
        });
      }
    },

    "shell.env": async (_input, output) => {
      const currentStatus = status();
      output.env.AGDF_PLUGIN_ACTIVE = "1";
      output.env.AGDF_PLUGIN_VERSION = currentStatus.version;
      output.env.AGDF_CONTROL_DIR = controlDir;
      output.env.AGDF_OPENCODE_REPOSITORY_SURFACE = currentStatus.repositorySurface ? "1" : "0";
    },

    "experimental.session.compacting": async (_input, output) => {
      if (!hasRepositorySurface()) {
        output.context.push([
          "## AGDF Plugin Notice",
          "The AGDF OpenCode npm plugin is loaded, but this repository does not contain the AGDF OpenCode surface.",
          "Do not apply AGDF gates from the global plugin alone; repository instructions, subagents and control files are the source of truth.",
          "Run `npx --yes @agdf/cli@latest opencode-repo` in this repository when AGDF governance should be active here.",
        ].join("\n"));
        return;
      }

      output.context.push([
        "## AGDF Runtime Reminder",
        "Use `.opencode/AGDF.md`, `.opencode/agents/` and `.agdf/control/` as the AGDF source for this OpenCode session.",
        "For new build/change intent or unclear approval, route first to `agdf-gate-check` before later artefacts or implementation.",
        "Use `npx --yes @agdf/cli@latest gate-check --json` only as deterministic proof, not as a replacement for AGDF judgement.",
      ].join("\n"));
    },
  };
};

export default AGDFPlugin;
