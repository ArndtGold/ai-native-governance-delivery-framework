#!/usr/bin/env bash
# AGDF Session Start Hook
# Activates a compact AGDF runtime reminder for the agent session.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
META_DIR="$(cd "${SCRIPT_DIR}/../meta" && pwd)"
ROUTER="${META_DIR}/agdf-agent-router.md"
CONSTITUTION="${META_DIR}/agdf-constitution.md"

cat <<EOF
AGDF active.

Use the installed AGDF skills as workflow controls.
For a new build, change, extension, refactor, CLI, app, fix with product semantics, unclear approval, or unclear next step, use gate-check before implementation or later-gate artefacts.

Do not print the full router or constitution unless the user asks for them.
Source of truth:
- ${ROUTER}
- ${CONSTITUTION}
EOF
