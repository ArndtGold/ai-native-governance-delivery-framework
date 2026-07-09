# TP: Human-readable AGDF Master Backlog

Status: approved
Gate: TP
Gate approval: `Approval: TP`
Based on: `.agdf/control/artefacts/master-backlog-human-readable/SD.md`
Date: 2026-07-09
Owner: agent

## 1. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| T1 | Replace the canonical Active, Planned and Completed backlog templates with the approved compact human-facing tables. | PRD AC 1; compact shapes in PRD sections 2–3 | Source diff and generated-template comparison |
| T2 | Add Runtime Contract and skill guidance for readable labels, relative links, canonical ownership and generated-output discipline. | PRD AC 2, 8; PRD section 6 | Runtime integrity assertions and source diff |
| T3 | Implement the header-driven compact/legacy adapter, Markdown-link extraction, artefact-label mapping and status normalization in the existing CLI parser. | PRD AC 3–5, 7; SD sections 3–5 | Focused smoke fixtures and normalized JSON output |
| T4 | Emit deterministic doctor findings for unknown layouts, statuses, link labels, duplicate artefact labels and invalid link targets. | PRD AC 6; SD sections 3.1–3.3 | Negative smoke fixtures with finding codes |
| T5 | Synchronize all derived package assets from canonical sources. | PRD AC 2, 8 | Sync command and runtime-integrity result |
| T6 | Convert the live `.agdf/control/MASTER_BACKLOG.md` to the compact linked format without changing its governed meaning. | PRD outcome and AC 1–5 | Manual inspection plus delivery-map output |
| T7 | Run targeted and broad regression checks and record TP coverage. | PRD AC 3–8 | Runtime integrity, create-agdf smoke test, routing test and diff review |

## 2. Test Plan

Automated:

- Compact Active row returns normalized `backlog_pointers` fields and link targets.
- Compact Planned row normalizes `Needs UR`.
- Legacy 13-column row returns the same JSON contract as before.
- Every approved human status label maps to its specified snake_case value.
- Legacy snake_case statuses remain accepted.
- Unknown table layout produces a visible finding.
- Unknown or duplicate Artefacts labels produce visible findings.
- Absolute paths, external URLs and malformed Markdown links produce visible findings.
- Generated templates match canonical control, skill and runtime sources.

Commands:

```bash
node plugin/scripts/check-runtime-integrity.mjs
npm --prefix create-agdf run smoke-test
```

Inspection:

- Review compact Markdown at normal editor width.
- Confirm no raw long paths are visible where a Markdown link is available.
- Confirm `delivery-map --json` contains plain relative paths, never Markdown syntax.

## 3. Brownfield Scope

Inspect and reuse:

- `plugin/control/templates/MASTER_BACKLOG.md`
- `plugin/meta/agdf-runtime-contract.md`
- `plugin/skills/gate-check/SKILL.md`
- `plugin/skills/release-or/SKILL.md`
- `create-agdf/bin/create-agdf.js`
- `create-agdf/scripts/smoke-test.js`
- `create-agdf/scripts/sync-package-assets.js`
- `plugin/scripts/check-runtime-integrity.mjs`

Implementation must extend `tableRows`, `readBacklogPointers` and `evaluateDoctor` ownership rather than introduce a separate parser or backlog model.

## 4. Out Of Scope

- Automatic migration of consumer repositories
- JSON schema version change
- Web-based backlog UI
- General-purpose Markdown parser
- Gate-order or approval changes
- Commit, push, PR or publishing

## 5. Risks And Blockers

| Condition | QA impact |
|---|---|
| Legacy wide backlog no longer parses identically | block |
| Markdown syntax appears in normalized JSON paths | block |
| Human label has no deterministic machine mapping | block |
| Unknown or invalid compact data passes silently | revise |
| Generated assets drift from canonical sources | block |
| Compact table hides Current Spec or next action | revise |
| Artefacts cell wraps at narrow widths but remains readable | warn |

## Pre-Implementation Brownfield Analysis

- mode: `pre_implementation_analysis`
- decision: pass
- approved_scope: T1–T7
- existing_owners: canonical template, Runtime Contract, gate-check/release-or skills, existing CLI table parser, package sync and smoke/integrity tests
- current_coverage: legacy wide parsing is fully present; compact layout, link normalization, readable-status normalization and validation findings are not implemented
- reuse_strategy: extend `tableRows`, `readBacklogPointers` and `evaluateDoctor`; do not add a second parser or schema
- compatibility_boundary: resolve backlog-relative Markdown targets against `.agdf/control/` while preserving legacy repository-relative raw paths
- regression_risk: fixed-column assumptions and legacy output drift
- evidence_plan: compact/legacy positive fixtures, invalid-layout/status/link negative fixtures, runtime integrity and package smoke test
- context_graph_impact: link_only
- required_next_step: implement T1–T7 and run the approved evidence plan

## 6. Next Step

Review this task and test plan and approve only with:

`Approval: TP`
