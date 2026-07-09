# SD: Human-readable AGDF Master Backlog

Status: approved
Gate: SD
Gate approval: `Approval: SD`
Based on: `.agdf/control/artefacts/master-backlog-human-readable/PRD.md`
Date: 2026-07-09
Owner: agent

## 1. Solution Overview

Keep one canonical Markdown backlog and one CLI parsing path. The template switches to the compact human-facing tables. The CLI detects the table layout from normalized header names, adapts either compact or legacy rows into the existing `backlog_pointers` object and normalizes links and statuses at that boundary.

## 2. Ownership And Source Of Truth

- Markdown structure and human labels: `plugin/control/templates/MASTER_BACKLOG.md`
- Runtime presentation/compatibility rule: `plugin/meta/agdf-runtime-contract.md`
- Skill maintenance behavior: `plugin/skills/gate-check/SKILL.md` and `plugin/skills/release-or/SKILL.md`
- Parser and normalized JSON: `create-agdf/bin/create-agdf.js`
- Generated assets: `create-agdf/scripts/sync-package-assets.js`
- Regression evidence: `plugin/scripts/check-runtime-integrity.mjs` and `create-agdf/scripts/smoke-test.js`

Generated copies remain derived output and must not be edited directly.

## 3. Architecture Decisions

### 3.1 Header-driven adapter

Add one backlog-section parser that:

1. reads the first non-separator table row as the header,
2. normalizes header names,
3. selects `compact` or `legacy_wide`,
4. converts every data row to the existing normalized pointer shape.

Unknown layouts produce a visible finding; they are not guessed by column count.

### 3.2 Markdown-link normalization

Use one helper that accepts either:

- `[Label](repository/relative/path.md)`, returning the target path, or
- a legacy raw path, returning it unchanged.

The compact Artefacts cell is split only on the documented ` · ` separator. Recognized labels map to `ur`, `brownfield_review`, `prd`, `sd`, `tp`, `qa` and `or`. Unknown or duplicate labels create findings.

### 3.3 Status normalization

Use one case-insensitive mapping from PRD-approved human labels to stable snake_case values. Legacy snake_case values remain accepted. Unknown values remain visible in source but create a finding and are not silently normalized.

### 3.4 Stable JSON

Keep the current `backlog_pointers` fields:

`prio`, `key`, `title`, `status`, `ur`, `brownfield_review`, `prd`, `sd`, `tp`, `qa`, `or`, `current_spec`, `notes`.

For compact rows, `Next step` maps to `notes`. No new parallel response object is introduced.

## 4. Integration Points

- `evaluateDoctor` validates recognized layout, status and link labels.
- `readBacklogPointers` delegates to the header-driven adapter.
- `delivery-map --json` and `gate-check --json` consume only normalized pointers.
- Package sync distributes the changed canonical template and skill/runtime sources.

## 5. Constraints And Compatibility

- Existing 13-column Active/Planned rows remain supported.
- Existing raw relative paths remain supported.
- Existing snake_case statuses remain supported.
- Compact Markdown becomes the default only for newly generated scaffolds.
- No automatic migration or rewrite of consumer repositories.
- Markdown targets must remain relative to `MASTER_BACKLOG.md`; the parser resolves them to repository-relative JSON paths. External URLs and absolute paths are invalid backlog artefact targets.

## 6. Test And Evidence Strategy

- Unit-style smoke fixtures for compact rows, legacy rows and mixed status inputs.
- Assert Markdown link syntax never appears in normalized JSON path fields and document-relative targets resolve to repository-relative paths.
- Assert every approved human label normalizes correctly.
- Assert unknown layouts, labels, duplicate artefacts and invalid paths produce findings.
- Assert generated templates match the canonical source.
- Run runtime integrity, create-agdf smoke test and routing render test.

## 7. Risks And Open Questions

- `Next step` mapping to the existing `notes` field is intentionally compatibility-first; a future schema version may expose `next_step` separately.
- Markdown link parsing is deliberately narrow and does not attempt to implement a general Markdown parser.
- The compact Artefacts cell may wrap visually, but remains navigable and materially shorter than raw path columns.

## 8. Next Step

Review this solution design and approve only with:

`Approval: SD`
