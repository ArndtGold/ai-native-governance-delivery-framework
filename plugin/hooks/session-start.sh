#!/usr/bin/env bash
# AGDF Session Start Hook
# Activates a compact AGDF runtime reminder for the agent session.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
META_DIR="$(cd "${SCRIPT_DIR}/../meta" && pwd)"
ROUTER="${META_DIR}/agdf-agent-router.md"
CONSTITUTION="${META_DIR}/agdf-constitution.md"
RUNTIME_CONTRACT="${META_DIR}/agdf-runtime-contract.md"
CONFIG_PATH="${PWD}/.agdf/control/config.json"

CONFIG_HINT="Project config: .agdf/control/config.json not found. Use npx --yes @agdf/cli@latest config --language de|en to persist the project language."
if [[ -f "${CONFIG_PATH}" ]]; then
  CONFIG_HINT="$(CONFIG_PATH="${CONFIG_PATH}" node <<'NODE' 2>/dev/null || true
const fs = require("node:fs");
const path = process.env.CONFIG_PATH;
try {
  const config = JSON.parse(fs.readFileSync(path, "utf8"));
  const artefacts = config.artifact_language || "unset";
  const chat = config.chat_language || "unset";
  const runtime = config.runtime_language || "en";
  console.log(`Project config: .agdf/control/config.json (artefacts=${artefacts}, chat=${chat}, runtime=${runtime}).`);
  if (artefacts !== "unset" || chat !== "unset") {
    console.log(`Language policy: write durable AGDF artefacts in ${artefacts} and user-facing responses in ${chat} unless the user explicitly asks otherwise. Runtime rules stay ${runtime}.`);
  }
} catch {
  console.log("Project config: .agdf/control/config.json exists but is not valid JSON. Run npx --yes @agdf/cli@latest doctor.");
}
NODE
)"
fi

cat <<EOF
AGDF active.

Use the installed AGDF skills as workflow controls.
For a new build, change, extension, refactor, CLI, app, fix with product semantics, unclear approval, or unclear next step, use gate-check before implementation or later-gate artefacts.
${CONFIG_HINT}

Do not print the full router or constitution unless the user asks for them.
Source of truth:
- ${ROUTER}
- ${CONSTITUTION}
- ${RUNTIME_CONTRACT}
EOF
