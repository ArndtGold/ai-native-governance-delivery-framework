# UR: Human-readable AGDF Master Backlog

Status: approved
Gate: UR
Gate approval: `Approval: UR`
Date: 2026-07-09
Owner: agent

## 1. Problem

The Master Backlog exposes internal status codes and long raw artefact paths. It is technically usable but difficult for people to scan, especially around states such as `uat_pending`.

## 2. Goal

Make the Master Backlog compact and human-readable while preserving stable machine-readable CLI output and compatibility with existing backlog files.

## 3. Scope

- Introduce readable status labels in Markdown, such as `Awaiting UAT`.
- Replace visible raw artefact paths with relative Markdown links.
- Reduce the active backlog to a compact steering view.
- Align the canonical template, relevant skills and runtime guidance.
- Make CLI parsing link-aware and status-normalizing without breaking legacy rows.
- Add integrity and smoke-test coverage.

## 4. Non-Goals

- No change to AGDF gate order or approval semantics.
- No removal of machine-readable status fields from JSON.
- No migration requirement for existing repositories.
- No new parallel backlog format.

## 5. Acceptance Signals

- People can identify work item, status, artefacts and next step without reading raw paths or internal codes.
- Relative Markdown links resolve to the existing artefacts.
- CLI reports expose normalized stable values independent of the visible label.
- Legacy wide backlog rows remain readable by the CLI.
- Runtime integrity and create-agdf smoke tests pass.

## 6. Existing Source Of Truth

- `plugin/control/templates/MASTER_BACKLOG.md`
- `plugin/meta/agdf-runtime-contract.md`
- `plugin/skills/gate-check/SKILL.md`
- `plugin/skills/release-or/SKILL.md`
- `create-agdf/bin/create-agdf.js`
- `create-agdf/scripts/smoke-test.js`
- `create-agdf/scripts/sync-package-assets.js`

## 7. Risks And Unknowns

- Markdown links must not leak presentation syntax into JSON path values.
- Compact columns must retain the artefact-chain information needed for governance.
- Human status labels need one canonical mapping to stable machine values.

## 8. Next Step

Brownfield Review and Mode/Slice Decision are recorded in `BROWNFIELD_REVIEW.md`.
