# UR: Backlog OR Status Label

Status: approved
Gate: UR
Gate approval: `Approval: UR` accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation.
Revision: 1
Date: 2026-07-21
Owner: agent

## 1. Problem

Every run that reaches UAT approval and awaits OR production cannot be represented in `MASTER_BACKLOG.md` with a canonical status label. The natural label "Awaiting OR" triggers `AGDF_BACKLOG_STATUS_UNKNOWN` from `doctor`. The only available post-UAT label is "Completed", but the backlog lifecycle rules require the OR to state the final outcome before an item may be marked "Completed" — so there is a real gap between UAT approval and OR production.

Observed 2026-07-21 in run `agdf-scope-classification-card`: after UAT approval, the backlog row used "Awaiting OR", doctor reported `AGDF_BACKLOG_STATUS_UNKNOWN`, and the label had to be replaced with "Completed" before the OR was even produced.

## 2. Goal

Add a canonical `awaiting_or` status label to the backlog vocabulary so the post-UAT, pre-OR state is representable without a doctor finding. The parser (`shared.js`) accepts the label; the template mirror documents it; a regression test proves it.

## 3. Scope

After the required approvals, deliver the smallest safe change that:

1. adds `["awaiting or", "awaiting_or"]` to `backlogStatusLabels` in `create-agdf/lib/control-evaluation/shared.js`;
2. updates the mirror list in `plugin/control/templates/MASTER_BACKLOG.md` rule 12 to include `Awaiting OR`;
3. adds a regression test proving `normalizeBacklogStatus("Awaiting OR")` returns `awaiting_or` without a finding;
4. updates generated surfaces via the canonical sync owner if the template propagates.

## 4. Non-Goals

- No change to gate order, approval formula, or the Gate Transition Model.
- No change to the backlog lifecycle rules (Completed still requires OR to state the final outcome).
- No new gate, no new CLI command, no schema-version bump.
- No VCS actions, release or reinstall.
- Not retroactive for historical backlog rows.

## 5. Acceptance Signals

1. `normalizeBacklogStatus("Awaiting OR")` returns `awaiting_or` and produces no `AGDF_BACKLOG_STATUS_UNKNOWN` finding.
2. `plugin/control/templates/MASTER_BACKLOG.md` rule 12 lists `Awaiting OR` among the canonical labels.
3. `doctor --json` passes for a run whose backlog row uses `Awaiting OR`.
4. Runtime Integrity and the existing control-state tests pass unchanged in shape.

## 6. Existing Source Of Truth

- `create-agdf/lib/control-evaluation/shared.js` — `backlogStatusLabels` map (authoritative parser vocabulary);
- `plugin/control/templates/MASTER_BACKLOG.md` — rule 12 mirror list;
- `create-agdf/scripts/control-state-test.js` — existing control-state tests;
- `plugin/scripts/check-runtime-integrity.mjs` — template assertions.

## 7. Risks And Unknowns

- Whether `awaiting_or` should also appear in the human-facing Run Status Card breadcrumb or delivery-map projection — Brownfield Review must check for other consumers of the status vocabulary.
- Whether the Copilot/OpenCode generated surfaces propagate the template change — verify via sync.

## 8. Next Step

Perform Brownfield Review and select the smallest safe delivery path before drafting later artefacts or implementation. Approve only with:

`Approval: UR`
