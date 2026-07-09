import { existsSync } from "node:fs";

export const AGDFPlugin = async ({ directory, client }) => {
  const controlDir = `${directory}/.agdf/control`;
  const hasRepositorySurface = () => existsSync(`${directory}/.opencode/AGDF.md`) && existsSync(`${directory}/.opencode/agents`);

  return {
    event: async ({ event }) => {
      if (event?.type === "session.created") {
        const repositorySurface = hasRepositorySurface();
        await client.app.log({
          body: {
            service: "agdf",
            level: "info",
            message: repositorySurface ? "AGDF OpenCode surface active" : "AGDF OpenCode plugin loaded without repository surface",
            extra: { controlDir, repositorySurface },
          },
        });
      }
    },

    "shell.env": async (_input, output) => {
      output.env.AGDF_CONTROL_DIR = controlDir;
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
