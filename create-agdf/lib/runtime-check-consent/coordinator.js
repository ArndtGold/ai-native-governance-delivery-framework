export const RUNTIME_CHECK_DECISIONS = Object.freeze(["enable", "manual", "cancel"]);

export function resolveRuntimeCheckDecision({ explicitValue, interactive = false, ask }) {
  if (explicitValue !== undefined) {
    if (!RUNTIME_CHECK_DECISIONS.includes(explicitValue)) throw new Error("AGDF_RUNTIME_CHECK_DECISION_INVALID");
    return explicitValue;
  }
  if (!interactive || typeof ask !== "function") return "manual";
  const answer = ask({
    question: "Allow this AGDF installation to run narrow local read-only checks automatically?",
    options: [...RUNTIME_CHECK_DECISIONS],
    default: null,
  });
  if (!RUNTIME_CHECK_DECISIONS.includes(answer)) return "cancel";
  return answer;
}

export function consentDisclosure(surface) {
  const permissionOwner = surface === "codex" ? "Codex native hook trust"
    : surface === "claude" ? "Claude Code user permission settings"
    : "OpenCode plugin and explicit permission configuration";
  return Object.freeze({
    surface,
    installation_scope: "global user installation",
    runs: "one argument-free local session check",
    when: "at session start",
    executable: "runtime/agdf-session-check.js inside the installed AGDF runtime",
    reads: "AGDF runtime identity and .agdf/control state in the current repository",
    writes: "one AGDF-owned intent receipt and, only where supported, one exact host permission rule",
    network: "none",
    permission_owner: permissionOwner,
    renewal: "material command, runtime, source, scope or adapter identity change requires renewed consent",
    revocation: `npx --yes @agdf/cli@latest runtime-checks manual --surface ${surface}`,
    gate_authority: "none",
    choices: [...RUNTIME_CHECK_DECISIONS],
  });
}
