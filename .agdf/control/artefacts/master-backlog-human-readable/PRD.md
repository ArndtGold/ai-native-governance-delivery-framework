# PRD: Human-readable AGDF Master Backlog

Status: approved
Gate: PRD
Gate approval: `Approval: PRD`
Date: 2026-07-09
Owner: agent
Derived from: `.agdf/control/artefacts/master-backlog-human-readable/UR.md`

## 1. Outcome

The Master Backlog is a compact human steering view. People see readable statuses and short artefact links; CLI consumers continue to receive stable normalized fields and raw repository-relative link targets.

## 2. Active And Planned Table

The canonical human-facing shape is:

| Priority | Key | Work item | Status | Artefacts | Current spec | Next step |
|---|---|---|---|---|---|---|
| P1 | `example-key` | Example title | Awaiting UAT | [UR](artefacts/example-key/UR.md) · [QA](artefacts/example-key/QA_REPORT.md) · [OR](artefacts/example-key/OR.md) | [QA](artefacts/example-key/QA_REPORT.md) | Request `Approval: UAT` |

Requirements:

- Paths are Markdown links relative to `MASTER_BACKLOG.md`, so they remain clickable in rendered Markdown.
- The stable key remains visible and machine-readable.
- Artefacts use the labels `UR`, `Brownfield`, `PRD`, `SD`, `TP`, `QA` and `OR`.
- Empty or not-applicable artefacts are omitted from the Artefacts cell.
- Current spec remains explicit and must not point to QA merely because QA is the newest evidence.
- Next step is one short process action, not a narrative notes field.

## 3. Completed And Superseded Table

The canonical historical shape is:

| Key | Work item | Final status | Historical record | Outcome |
|---|---|---|---|---|
| `example-key` | Example title | Completed | [OR](artefacts/example-key/OR.md) | UAT approved |

`Superseded` rows must name the replacement in Outcome.

## 4. Human Status Labels

Markdown uses readable labels. CLI JSON normalizes them to stable values:

| Markdown label | Normalized value |
|---|---|
| Needs UR | `needs_ur` |
| Awaiting Brownfield Review | `awaiting_brownfield_review` |
| Awaiting PRD | `awaiting_prd` |
| Awaiting PRD approval | `awaiting_prd_approval` |
| Awaiting SD | `awaiting_sd` |
| Awaiting SD approval | `awaiting_sd_approval` |
| Awaiting TP | `awaiting_tp` |
| Awaiting TP approval | `awaiting_tp_approval` |
| In progress | `in_progress` |
| Blocked | `blocked` |
| Awaiting QA | `awaiting_qa` |
| Awaiting UAT | `awaiting_uat` |
| Completed | `completed` |
| Superseded | `superseded` |
| Abandoned | `abandoned` |

Unknown labels remain visible in Markdown but produce a validation finding instead of silently inventing a normalized value.

## 5. Parser And Compatibility Contract

- Detect the backlog layout from its header, not column count alone.
- Continue parsing the existing 13-column Active/Planned format.
- Parse the compact format into the existing `backlog_pointers` JSON fields.
- Resolve Markdown link targets against `.agdf/control/` before returning repository-relative `ur`, `brownfield_review`, `prd`, `sd`, `tp`, `qa`, `or` and `current_spec` values.
- Never expose `[label](path)` syntax as a JSON path value.
- Preserve legacy raw repository-relative paths unchanged.
- Do not require automatic migration of existing repositories.

## 6. Skill And Runtime Guidance

`gate-check`, `release-or` and the Runtime Contract must require:

- readable Markdown labels rather than internal status codes
- relative Markdown links rather than visible raw paths
- one canonical Master Backlog format owned by the template
- stable machine normalization at the CLI parser boundary
- no manual edits to generated copies

## 7. Acceptance Criteria

1. Canonical template uses the compact tables.
2. Generated Copilot, OpenCode and plugin assets match the source template.
3. Compact links resolve to their target paths in CLI JSON.
4. Human statuses normalize to stable values.
5. Legacy wide rows still produce the same JSON fields.
6. Unknown status labels create a visible finding.
7. Gate-check and delivery-map continue to use the normalized state.
8. Runtime integrity, create-agdf smoke tests and routing tests pass.

## 8. Non-Goals

- No gate-order or approval change.
- No visual web application for backlog management.
- No automatic rewrite of existing project backlogs.
- No second parser or surface-specific backlog schema.

## 9. Risks

- Link-label typos could hide an artefact; integrity checks must reject unknown labels.
- A long Artefacts cell may wrap, but it remains shorter and more navigable than raw path columns.
- Existing external consumers relying on the literal Markdown table shape are outside the CLI compatibility guarantee.

## 10. Approval

Approve only with:

`Approval: PRD`
