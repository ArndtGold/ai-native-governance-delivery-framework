# Brownfield Review: Enforce Run Status Card in Claude Code

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `claude-run-status-card-enforcement`
- related_ur: `.agdf/control/artefacts/claude-run-status-card-enforcement/UR.md`
- current_gate: `Quick Task Execution`
- reviewer: agent
- reviewed_at: 2026-07-11

## Objective

Size the approved correction that makes the packaged Claude Code plugin validate cleanly and apply the canonical Run Status Card reliably without introducing Claude-specific gate semantics.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | `plugin/meta/agdf-runtime-contract.md` | Defines the canonical machine-readable and human-facing Run Status Card fields | low |
| Source of truth | `plugin/meta/agdf-runtime-contract.md`; `plugin/meta/agdf-plugin.definition.json` | Shared runtime semantics and cross-surface metadata already have canonical owners | low |
| Runtime path | `plugin/skills/gate-check/SKILL.md`; `plugin/hooks/hooks.json`; `plugin/hooks/session-start.sh` | Claude discovers nine skills and one SessionStart hook with `--plugin-dir`, but the gate-check output shape is narrower than the Runtime Contract | medium |
| UI / UX | Claude Code text output | No separate UI component exists; the status card is a readable text projection | low |
| Persistence / data | `.agdf/control/AGDF_RUN.md` and templates | Durable state already carries the complete projection; no migration is needed | none |
| Tests / QA | `plugin/scripts/check-runtime-integrity.mjs`; `create-agdf/scripts/smoke-test.js`; `claude plugin validate plugin` | Repository checks cover templates and CLI JSON but not Claude-compatible YAML parsing or skill-level status-card output alignment | medium |
| Release / operations | `plugin/.claude-plugin/plugin.json`; `.claude-plugin/marketplace.json` | Marketplace manifest validates; packaged plugin validation fails on unquoted `Approval: UR` in YAML frontmatter | medium |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Runtime Contract already owns the complete status-card semantics | `plugin/meta/agdf-runtime-contract.md` Run Status Card section | block if duplicated as a Claude-only schema | Strengthen shared skill reachability and output instructions; do not create a Claude adapter schema |
| Gate-check's immediate output shape can omit canonical fields | `plugin/skills/gate-check/SKILL.md` Output section | revise | Make the skill explicitly render the Runtime Contract's readable status-card projection while keeping detailed evidence outside the compact card |
| SessionStart names router and constitution but not Runtime Contract | `plugin/hooks/session-start.sh` | warn | Add the Runtime Contract to the source pointers without injecting its full body |
| Current integrity check regex accepts YAML that Claude rejects | `plugin/scripts/check-runtime-integrity.mjs`; failed `claude plugin validate plugin` | revise | Add a deterministic frontmatter-safety check that catches unquoted colon-space descriptions without requiring Claude in CI |

## Mode / Slice Decision

- decision: `quick_task`
- required_next_gate: `none`
- scope_reason: This is a narrow compatibility and contract-propagation correction. It adds no product semantics, gate state, persistence, architecture or new surface owner; all changes extend existing shared owners and their regression checks.
- evidence: The plugin already loads all intended components with `--plugin-dir`; the canonical Runtime Contract and status-card templates already exist; the concrete failures are one invalid YAML scalar, one narrow skill output shape and one missing source pointer.
- transparency_note: PRD, SD and TP are skipped because the approved UR already fixes expected behavior and the Brownfield evidence identifies a bounded reuse-only correction with deterministic validation. Implementation may proceed only within this boundary.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Can authenticated Claude render the final card end to end? | `none` | warn |

The authenticated probe is QA evidence, not an unresolved product or design decision. Structural validation must pass independently.

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-RUN-STATUS-CARD`
- context_graph_required_action: `link`
- context_graph_gate_effect: `none`
- context_graph_evidence: The existing node already owns the invariant; this run corrects Claude propagation and should link its final evidence without creating a new node.

## Next Permissible Step

- next_allowed_action: Implement the bounded shared-skill, hook-pointer and validation corrections, then run Claude plugin validation, runtime integrity and package smoke tests.
- forbidden_until_then: Broader Claude plugin redesign, new gate semantics, release, commit, push or PR.

## Quality Outlook

- quality_outlook: Prove the portable contract through package validation and deterministic cross-surface checks; treat an authenticated Claude probe as additional runtime evidence rather than the only enforcement mechanism.
