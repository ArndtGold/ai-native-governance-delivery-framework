# TP Review: Companion shows planned URs instead of an empty state

Gate: QA
Type: TP Review
Status: `done`

## Run

- run_id: run-9c609e83-5a41-4644-8892-3aed624a617d
- approved_tp: sha256:6254af66bc0d28ccac7c827da33d71fdb8d33323f71a584ac5a4617e657a2198
- reviewer: Claude (agent)
- reviewed_at: 2026-11-16

## Task Fulfilment

| task_id | Status | Evidence |
|---|---|---|
| T-001 | fulfilled | run-view.js `readUrFacts`, `readPlannedView`, `planned` field, captured read with `[]` fallback; Core tests pass |
| T-002 | fulfilled | catalog `companion.planned` (incl. `untitled` added in CR) and `statusStates.planned` in de/en; validation key set; interaction-catalog-test passes |
| T-003 | fulfilled | `companionPlan`, snapshot `planned`, `pickPlan`; claude-companion-test passes |
| T-004 | fulfilled | planned branch in `buildPanelView`, terminal lines, `shownId`, note line; `listCapacity` counts planned blocks (CR-02) |
| T-005 | fulfilled | `observedRun` kind `planned`, status text |
| T-006 | fulfilled | fingerprint over planned folders; reuse only with unchanged run and planned ids (CR-01) |
| T-007 | fulfilled | Core, companion and adapter cases incl. CR additions |
| T-008 | fulfilled | chain re-run after CR: build:mcp, sync, exact baseline 459 files / 4,826,070 bytes, compatibility record and check 0 failed, observation 54804015 referenced |
| T-009 | fulfilled | PNG from the real code path with four panels: draft working, draft resting, ready, needs clarification with note line and status line |

## Scenario Coverage

| scenario_id | criterion_id | Result | Evidence |
|---|---|---|---|
| SCN-001 | AC-001 | pass | test:companion-run-view |
| SCN-002 | AC-001 | pass | claude-companion-test pickPlan cases |
| SCN-003 | AC-001 | pass | claude-companion-test and adapter test |
| SCN-004 | AC-002 | pass | adapter test turn start/end figure markup |
| SCN-005 | AC-003 | pass | Core ready entry and companion texts |
| SCN-006 | AC-004 | pass | three coverage labels in claude-companion-test |
| SCN-007 | AC-005 | pass | Core handover case |
| SCN-008 | AC-006 | pass | missing store and store-as-file cases |
| SCN-009 | AC-007 | pass | note and language-purity cases |
| SCN-010 | AC-007 | pass | status line and catalog tests |
| SCN-011 | AC-008 | pass | adapter process counts, incl. read once not twice |
| SCN-012 | AC-009 | pass | Core naming cases, run-view-command-test |
| SCN-013 | AC-009 | pass | full TP check list green after CR fixes |

## UX Intent Fidelity

| prd_criterion | working_mode_state | task_id | visible_evidence | fidelity_status | gap_type |
|---|---|---|---|---|---|
| AC-001 | UR planning, draft, idle | T-004 | PNG panel 2: title, "UR-Planung · noch kein Run", goal, "Als Nächstes", gate bar, plan id; adapter test pane texts in en | fulfilled | none |
| AC-002 | UR planning, draft, Claude turn active | T-004 | PNG panel 1: "schreibt am UR-Entwurf", "Einen Augenblick", clipboard with pen; adapter test `dur="9s"` during turn | fulfilled | none |
| AC-003 | UR planning, ready | T-004 | PNG panel 3: "UR bereit zur Übergabe", "Übergabe in einen Run" with hint | fulfilled | none |
| AC-004 | UR planning, unclear | T-004 | PNG panel 4: "UR-Planung braucht Klärung", "Wiederherstellung erforderlich", clarify hint; the other two coverage labels in companion tests | fulfilled | none |
| AC-005 | Run shown | T-001 | Core handover test; pane path for Runs unchanged | fulfilled | none |
| AC-006 | any, store unreadable | T-001 | Core tests (no visible change by design) | fulfilled | none |
| AC-007 | UR planning (all variants) | T-005 | PNG status line "AGDF · UR-Planung" under each panel; panel 4 note "Abgeschlossene Runs: 1 · Weitere URs in Planung: 1" | fulfilled | none |
| AC-008 | any, planning folder changes | T-006 | adapter process-count test (behaviour, no visible element) | fulfilled | none |
| AC-009 | Run shown and project without AGDF | T-007 | existing suites unchanged and green | fulfilled | none |

Limit: visible evidence is rendered from the real code path (Core run view, snapshot, view model, figure, status text) outside Claude; panel 4 uses the draft snapshot with coverage set to recovery_required and an added completed run. The live Claude pane remains unverified, as stated since PRD.

## Missing Evidence

- Live Claude companion pane not exercised.

## Decision

- decision: pass
