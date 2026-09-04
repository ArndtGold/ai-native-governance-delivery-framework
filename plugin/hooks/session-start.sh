#!/usr/bin/env bash
# AGDF Session Start Hook
# Activates a compact AGDF runtime reminder for the agent session.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLUGIN_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
META_DIR="$(cd "${SCRIPT_DIR}/../meta" && pwd)"
ROUTER="${META_DIR}/agdf-agent-router.md"
CONSTITUTION="${META_DIR}/agdf-constitution.md"
RUNTIME_CONTRACT="${META_DIR}/agdf-runtime-contract.md"
CONFIG_PATH="${PWD}/.agdf/control/config.json"
LOCAL_RUNTIME="${PLUGIN_DIR}/runtime/agdf-local.js"

RUNTIME_HINT="AGDF runtime: profile=source-development evidence=source_checkout machine_validation=unavailable provenance=not_applicable."
if [[ -f "${PLUGIN_DIR}/.agdf-installation.json" && ! -f "${LOCAL_RUNTIME}" ]]; then
  RUNTIME_HINT="AGDF runtime: profile=runtime-plugin evidence=installed_plugin_root machine_validation=unavailable provenance=unverified. Use the supported AGDF install/update command, then restart the host and retry in a fresh session."
fi
if [[ -f "${LOCAL_RUNTIME}" ]]; then
  RUNTIME_HINT="AGDF runtime: profile=runtime-plugin evidence=unverified machine_validation=unavailable provenance=unverified. Retry the surface-local runtime probe or use the supported AGDF install/update command."
  RUNTIME_JSON="$(AGDF_SURFACE="${AGDF_SURFACE:-plugin}" node "${LOCAL_RUNTIME}" --resolve-only --json 2>/dev/null || true)"
  RUNTIME_RENDERED="$(RUNTIME_JSON="${RUNTIME_JSON}" node <<'NODE' 2>/dev/null || true
try {
  const value = JSON.parse(process.env.RUNTIME_JSON || "{}");
  const profile = value.distribution_profile || "runtime-plugin";
  const evidence = value.evidence_plane || "unverified";
  const version = value.plugin_version || value.observed_version || value.expected_version || "unknown";
  const provenance = value.provenance_status || "unverified";
  const validation = value.machine_validation || "unavailable";
  const root = value.plugin_root || "unavailable";
  console.log(`AGDF runtime: profile=${profile} evidence=${evidence} version=${version} provenance=${provenance} machine_validation=${validation} root=${root}.`);
} catch {
  console.log("AGDF runtime: profile=runtime-plugin evidence=unverified machine_validation=unavailable provenance=invalid. Retry the surface-local runtime probe or use the supported AGDF install/update command.");
}
NODE
)"
  if [[ -n "${RUNTIME_RENDERED}" ]]; then
    RUNTIME_HINT="${RUNTIME_RENDERED}"
  fi
fi

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
  console.log("Project config: .agdf/control/config.json exists but is not valid JSON. Run the surface-local AGDF validator's doctor command.");
}
NODE
)"
fi

cat <<EOF
Silent internal AGDF context. Ignore it unless the user invokes AGDF or expresses matching delivery intent.

${RUNTIME_HINT}

Use the installed AGDF skills as workflow controls.
For a new build, change, extension, refactor, CLI, app, fix with product semantics, unclear approval, or unclear next step, use gate-check before implementation or later-gate artefacts.
${CONFIG_HINT}

Do not print the full router or constitution unless the user asks for them.
Source of truth:
- ${ROUTER}
- ${CONSTITUTION}
- ${RUNTIME_CONTRACT}
EOF
