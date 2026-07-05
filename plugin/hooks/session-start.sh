#!/usr/bin/env bash
# AGDF Session Start Hook
# Loads the AGDF plugin router and constitution into the agent session.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROUTER="${SCRIPT_DIR}/../meta/agdf-agent-router.md"
CONSTITUTION="${SCRIPT_DIR}/../meta/agdf-constitution.md"

if [ -f "$ROUTER" ]; then
    cat "$ROUTER"
    printf "\n\n"
fi

if [ -f "$CONSTITUTION" ]; then
    cat "$CONSTITUTION"
fi
