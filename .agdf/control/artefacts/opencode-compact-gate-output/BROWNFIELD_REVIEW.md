# Brownfield Review: OpenCode Compact Gate Output

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done

## Run

- run_id: opencode-compact-gate-output
- related_ur: .agdf/control/artefacts/opencode-compact-gate-output/UR.md
- current_gate: Quick Task Execution
- reviewer: agent
- reviewed_at: 2026-07-09

## Objective

Size and route a bounded improvement that reduces noisy AGDF CLI output in interactive OpenCode use while preserving full machine-readable JSON for automation.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Gate-check CLI | `create-agdf/bin/create-agdf.js` | Existing `gate-check --json` emits full report with `status_card` embedded | medium |
| OpenCode hook reminders | `create-agdf/opencode-plugin.js` | Hook currently references `gate-check --json` as deterministic proof | low |
| Generated OpenCode instructions | `create-agdf/scripts/sync-package-assets.js` | Generated `.opencode/AGDF.md` includes CLI validator guidance | low |
| Smoke coverage | `create-agdf/scripts/smoke-test.js` | Existing smoke covers gate-check JSON behavior and OpenCode status behavior | low |
| User docs | `README.md`; `INSTALL.md`; `create-agdf/README.md` | Docs describe status card but not a compact CLI output mode | low |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| `status_card` already exists in `gate-check --json` | CLI output | warn if a second status model is invented | Render the existing `status_card` compactly |
| Full JSON is needed for automation | Existing `--json` behavior and smoke tests | block if removed or changed incompatibly | Keep `--json` unchanged |
| OpenCode shell output is highly visible | observed session behavior | warn if instructions still encourage raw JSON in chat | Update OpenCode reminders and generated instructions |

## Mode / Slice Decision

- decision: quick_task
- required_next_gate: none
- scope_reason: The approved scope is a small output-mode and OpenCode guidance change using an existing `status_card` data structure. It preserves full JSON behavior and does not alter gate semantics.
- evidence: The existing CLI already computes `status_card`; affected files and validation surfaces are known.
- transparency_note: PRD, SD and TP would add ceremony without reducing risk for this bounded CLI/output guidance change.

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: CG-OPENCODE-VISIBILITY
- context_graph_required_action: link closeout to existing OpenCode visibility context
- context_graph_gate_effect: none
- context_graph_evidence: This refines the interactive reporting layer without changing AGDF gate rules.

## Next Permissible Step

- next_allowed_action: Implement compact gate/status output and OpenCode guidance, then run focused smoke and runtime integrity checks.
- forbidden_until_then: Changing full JSON semantics, weakening evidence, changing non-OpenCode surfaces beyond shared docs.

## Quality Outlook

- quality_outlook: Keep the compact output as a projection of the existing status card, not a second source of truth.
