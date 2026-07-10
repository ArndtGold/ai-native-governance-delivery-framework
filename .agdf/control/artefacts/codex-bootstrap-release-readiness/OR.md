# Orchestration Report: Surface Bootstrap and Registry Readiness

## Status

- status: completed
- report_mode: OR-full
- gate: OR
- created_at: 2026-07-10

## Outcome

The delivery slice passed QA and received `Approval: UAT` on 2026-07-10. The implementation is ready for an explicit commit instruction, but no commit, push, PR, release, tag or publish has been performed.

## Delivered

- Codex global bootstrap now refreshes the AGDF marketplace before plugin add and verifies the installed `agdf@agdf` version against the expected plugin definition version.
- Claude Code global bootstrap now uses supported marketplace add/update plus `plugin install agdf@agdf` or `plugin update agdf@agdf`; it verifies version when exposed and reports a clear limitation when not exposed.
- Copilot repository bootstrap can rerun safely by refreshing AGDF-owned generated files, preserving existing language config, preserving user-owned root `AGENTS.md`, and refreshing `AGENTS.agdf.md`.
- The publish workflow now waits after both publish steps until `create-agdf@<version>` and `@agdf/cli@<version>` are resolvable from npm, bounded by retry limits and actionable diagnostics.
- Focused smoke coverage now verifies global CLI command sequences, version mismatch behavior, Copilot rerun ownership and publish workflow readiness shape.

## Intentionally Not Delivered

- No package publish, tag, release, push, PR or commit was performed.
- No changes were made to Codex CLI, Claude Code CLI or npm registry behavior.
- No second bootstrap executable, second release workflow or parallel generated-source authority was introduced.

## Evidence

| Evidence | Result |
|---|---|
| TP Review | T01-T10 fully done |
| Clean Implementation Review | pass |
| Code Review | pass, no findings |
| QA Gate | pass |
| UAT | `Approval: UAT` provided on 2026-07-10 |
| `npm --prefix create-agdf run smoke-test` | pass |
| `npm --prefix agdf run smoke-test` | pass |
| `node plugin/scripts/check-runtime-integrity.mjs` | pass |
| `npx --yes @agdf/cli@latest doctor --json` | pass, 0 findings |
| `git diff --check` | pass |

## Missing Evidence

- The new GitHub Actions npm readiness step has not run in a live tagged publish workflow. It is statically covered by smoke tests and should be observed on the next release.

## Risks

- Codex and Claude Code CLI list output can evolve. The parser is intentionally tolerant and covered by stubbed executable tests, but future CLI output changes may require adapter adjustment.
- npm readiness polling proves exact version resolvability after publish; it does not change npm propagation behavior.

## Retained Fallbacks

- Claude no-version reporting is retained as a transparency path when the external CLI does not expose plugin version metadata. Exit condition: if Claude Code exposes stable version metadata, the adapter can enforce exact verification like Codex.

## Context Graph

- context_graph_impact: link_only
- context_graph_refs: CG-DELIVERY-PATH-SEARCH
- context_graph_reconciliation: resolved
- context_graph_required_action: link
- context_graph_gate_effect: none
- context_graph_evidence: This slice implements the concrete cross-surface delivery reliability line already represented by `CG-DELIVERY-PATH-SEARCH`; no new node is required.

## Required Next Step

Explicit user instruction is required for any Git operation. Recommended next operational step: commit the completed delivery slice.

## Quality Outlook

No further technical follow-up is required for the approved implementation scope before commit. Release-time observation of the npm readiness step remains useful on the next tagged publish.
