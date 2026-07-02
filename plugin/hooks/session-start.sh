#!/usr/bin/env bash
# AGDF Session Start Hook
# Loads the AGDF constitution into the agent session.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONSTITUTION="${SCRIPT_DIR}/../meta/agdf-constitution.md"

if [ -f "$CONSTITUTION" ]; then
    cat "$CONSTITUTION"
fi
