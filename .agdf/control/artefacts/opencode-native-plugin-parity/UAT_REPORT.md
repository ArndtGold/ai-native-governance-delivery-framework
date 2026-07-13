# UAT Report: OpenCode Native Plugin Parity

## Status

- decision: `pass`
- gate: `UAT`
- gate_approval: `Approval: UAT` provided on `2026-07-13`

## Acceptance Evidence

| Acceptance area | Result | Evidence |
|---|---|---|
| Native skill surface | pass | Fresh `opencode-repo` generation and installed OpenCode `1.17.13` discovery exposed all nine `agdf-*` skills through `opencode debug skill`. |
| No parallel AGDF agent surface | pass | Generated repository contains no `.opencode/agents` directory and `opencode agent list` exposes no generated `agdf-*` agent names. |
| Global/repository separation | pass | Fresh global `opencode` installation and repository `opencode-repo` generation produce configured status plus a present native repository surface when evaluated with the documented `OPENCODE_CONFIG_DIR` contract. |
| Status compatibility | pass | `opencode-status --json` reports `configured`, native repository presence, a valid `.opencode/skills/agdf-gate-check/SKILL.md` path, and equal schema-v1 `gate_check_agent`/`gate_check_skill` fields. |
| Permission boundary | pass | Generated `opencode.json` keeps `edit` and `bash` at `ask` and allows only the `agdf-*` skill pattern explicitly. |
| Capability honesty | pass | `enforcementForSurface("opencode")` remains `{ level: "instruction_only", evidence: [] }`; no tool-enforcement claim is made. |
| Documentation/runtime integrity | pass | Runtime integrity, package smoke tests, Pages checks, doctor and diff checks passed before UAT; UAT-specific native probes passed. |

## Findings

- UAT decision: `pass`.
- No acceptance defect remains.
- The initial isolated status probe omitted the required `OPENCODE_CONFIG_DIR` environment contract; the corrected probe passed. This was a test invocation issue, not a product defect, and is covered by the existing aggregate smoke test.

## Boundaries

- Cross-version OpenCode validation remains outside the approved slice.
- Model-independent tool enforcement remains unproven and is intentionally not claimed.
- No commit, push, pull request or release was performed.

## Required Next Step

Offer delivery closeout with a commit-ready handoff. Do not execute commit, push, PR or release automatically.
