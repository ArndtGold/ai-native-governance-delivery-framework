#!/usr/bin/env bash
# Compatibility transport only. Host manifests execute the generated runtime directly.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SESSION_CHECK="${SCRIPT_DIR}/../runtime/agdf-session-check.js"

if [[ -f "${SESSION_CHECK}" ]]; then
  exec node "${SESSION_CHECK}"
fi

printf '%s\n' "AGDF SessionStart transport unavailable: generated runtime entrypoint not found."
