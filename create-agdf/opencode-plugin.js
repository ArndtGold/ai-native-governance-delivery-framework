export const AGDFPlugin = async ({ directory, client }) => {
  const controlDir = `${directory}/.agdf/control`;

  return {
    event: async ({ event }) => {
      if (event?.type === "session.created") {
        await client.app.log({
          body: {
            service: "agdf",
            level: "info",
            message: "AGDF OpenCode surface active",
            extra: { controlDir },
          },
        });
      }
    },

    "shell.env": async (_input, output) => {
      output.env.AGDF_CONTROL_DIR = controlDir;
    },

    "experimental.session.compacting": async (_input, output) => {
      output.context.push([
        "## AGDF Runtime Reminder",
        "Use `.opencode/AGDF.md`, `.opencode/agents/` and `.agdf/control/` as the AGDF source for this OpenCode session.",
        "For new build/change intent or unclear approval, route first to `agdf-gate-check` before later artefacts or implementation.",
        "Use `npx --yes agdf@latest gate-check --json` only as deterministic proof, not as a replacement for AGDF judgement.",
      ].join("\n"));
    },
  };
};

export default AGDFPlugin;
