# SD: Companion shows planned URs instead of an empty state

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-11-16
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

The Core run view (`run-view/1`) gains an additive `planned` list built from the existing planned-UR inventory. The Claude companion host template maps that list into its snapshot, picks one planned UR when it shows no Run, and renders it through the existing panel, figure, status-line and terminal paths with new catalog texts. Change detection extends the existing refresh fingerprint so that a new or changed planned UR triggers one run-view read. Nothing is written; the companion keeps launching only the read-only `run-view` command.

Data flow: `.agdf/control/planned/plan-<uuid>/UR.md` -> `projectPlannedInventory` (Core, title and coverage) -> `readPlannedView` (Core run view, adds goal and last change) -> `run-view` JSON `planned[]` -> `snapshotFromRunView` (`companionPlan`) -> `pickPlan` (assignment) -> `buildPanelView` planned branch (view) -> pane, figure, terminal; `observedRun`/`statusText` (notice) -> status line.

## 2. Ownership And Source Of Truth

- Planned-UR existence, title and coverage: Core planned inventory `packages/core/lib/control-state/planned-inventory.js` (`projectPlannedInventory`). Unchanged, consumed read-only.
- Goal of a UR (localized summary first, authored goal second) and UR heading: Core run view `packages/core/lib/companion/run-view.js`, one shared reader for registered Run URs and planned URs.
- Run-view output contract: `packages/core/lib/companion/run-view.js` (`projectRunView`, `readRunView`), exposed by the existing CLI read command `run-view`.
- Selection of what the pane shows: companion host template `plugins/agdf/host-templates/claude/companion/assignment.mjs`.
- Presentation: `view.mjs` (view model), `register.mjs` (pane, figure options, fingerprint), `notice.mjs` (status line), `figure.mjs` unchanged (existing UR clipboard rule).
- Texts: `plugins/agdf/meta/agdf-interaction-locales.json` (`companion.planned`, `companion.statusStates.planned`), validated by `packages/core/lib/interaction-catalog-validation.js`.
- Accountable owner: Arndt Gold.

## 3. Architecture Decisions

- SDD-001: `run-view/1` gets an additive optional field `planned`, an array of `{plan_id, title, coverage, goal, last_change}` for every planned-inventory entry whose coverage is not `transferred`; rationale: the companion host template may only read Core facts through the one read-only `run-view` process and must not parse planning files itself; consequence: one more read per run-view call, bounded by the inventory and the 128 KiB UR read limit; consumers that ignore unknown fields are unaffected and the schema version stays `run-view/1`.
- SDD-002: Planned URs are read in their own captured snapshot only when the run store read succeeded, and any failure yields `planned: []`; rationale: the planning list is an addition and must never hide or break the Run view (PRD AC-006); consequence: a planning-store failure is silent in the pane and only visible as the absence of planned URs.
- SDD-003: One shared Core function `readUrFacts(root, path, language)` returns heading, localized goal, authored goal and change time for any UR path under `.agdf/control/`, used by both `readRunNaming` and `readPlannedView`; rationale: Brownfield Review forbids a second goal parser; the existing safety checks (contained regular file, no symlink component, size limit, source_changed propagation) apply to both; consequence: the Run naming path is refactored, so existing run-view tests must keep passing unchanged.
- SDD-004: The host template selects with `pickPlan(planned, {sessionStartedAt, hasOpenRuns})`: sort by `updatedAt` descending, take the newest, show it when it changed at or after session start or when no Run is open, and return the count of open planned URs; it is consulted only when no Run is shown; rationale: implements the PRD selection decision without a selection UI; consequence: an older planned UR beside open Runs stays hidden until it changes.
- SDD-005: The panel view model renders a planned UR through the existing no-run branch of `buildPanelView` as a run-like view with mood `laeuft`, figure reason gate `UR`, `workGate: 'UR'`, a `resting` flag when no turn runs or the UR is not a draft, `planId` instead of `runId`, route `companion.planned.route`, gate bar `companion.planned.bar`, a note from `companion.planned.doneRuns`/`more`, and state line and who-is-next texts by coverage (draft: existing `activity.draft` texts; ready: `planned.ready`/`handoff`/`handoffHint`; recovery_required, unconfirmed or unavailable: `planned.unclear`, the matching entry of `planned.states` and `clarifyHint`); rationale: reuses the PR #75 activity and figure rules for the UR gate so the clipboard and writing animation need no new figure code; consequence: the planned view depends on the activity catalog keys for `draft`.
- SDD-006: The refresh fingerprint in `register.mjs` adds the sorted names of `.agdf/control/planned/` entries and, for each planned UR already in the snapshot, the file listing (names and modification times) of its folder; rationale: detects a new or changed planned UR with directory listings only, without an extra process (PRD AC-008); consequence: a change inside a planned folder not yet in the snapshot is caught by the folder-name part on the next tick.
- SDD-007: The status line gets a new observed kind `planned` (`AGDF · UR planning`), and the catalog validation adds `planned` to the exact `companion.statusStates` key set; rationale: the status line must match the pane (PRD AC-007) and the validation lists keys exactly; consequence: catalog, validation and the generated catalog copy must change together through the existing change chain.

## 4. Integration Points

- CLI read command `run-view` (Core) and its JSON output: additive field.
- Claude companion host template: snapshot mapping, assignment, view model, pane, terminal, status line, fingerprint.
- Interaction catalog and its generated copies: MCP UI build (`packages/control-ui`, `npm run build:mcp`), `scripts/sync-package-assets.js`, exact `plugins/agdf/meta/copilot-payload-baseline.json`, `scripts/host-compatibility/run.mjs record`.
- No change to the cockpit, the Codex companion or Copilot behaviour.

## 5. Constraints And Compatibility

- Read-only: no writes to `.agdf/control/`; the host template keeps importing only its own modules plus the one `run-view` process.
- Backward compatible: `run-view/1` consumers without `planned` handling ignore the field; `snapshotFromRunView` treats a missing field as an empty list.
- Language: texts from the catalog in the chat language; UR titles stay in the artefact language; the goal prefers the localized approval summary.
- Readiness rule of planned URs unchanged (follows the display language).
- Motion-off setting keeps the figure still as before.

## 6. Test And Evidence Strategy

Reuse the existing suites; add focused cases only where behaviour is new.

- Core (`packages/core/test/companion-run-view-test.js`): planned draft listed with title, coverage and goal; ready planned UR; transferred UR left out after create-from-planned; unreadable planning store yields `planned: []` with Runs intact. Existing naming cases cover the refactored shared reader.
- Host template unit (`packages/cli/scripts/claude-companion-test.js`): `pickPlan` rules; view model texts for draft, ready and the three unclear coverages in de and en; status line; snapshot mapping; German view has no English catalog text.
- Adapter (`packages/cli/scripts/claude-companion-adapter-test.js`): pane shows the planned UR instead of empty states; one extra run-view read per new or changed planned UR and none without change; figure writes during a turn and rests after.
- Contract checks: `interaction-catalog-test`, `payload-budget-test`, `copilot-profile-test`, `package-contents-test`, `run-view-command-test`, `test:operational-localization`, `test:interaction-presentation`, `host-compatibility-test`, `node scripts/host-compatibility/run.mjs check`, `npm run build:prepare`, control-ui typecheck and unit tests.
- All checks run locally in this Run before CR; CI on the PR repeats them. The live Claude pane is not exercised; rendered images from the real code path serve as visual evidence and the gap stays stated.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | planned list in run view, selection, planned view branch with route, goal, who-is-next, gate bar, plan id; terminal text | run-view.js, assignment.mjs, view.mjs, register.mjs | SDD-001, SDD-004, SDD-005 | none — new branch only taken when no Run is shown |
| AC-002 | `resting` false during a draft turn; figure gate UR uses existing clipboard writing rule | view.mjs, register.mjs, figure.mjs | SDD-005 | none — figure rule reused unchanged |
| AC-003 | coverage `ready` texts in the planned branch | view.mjs, catalog | SDD-005 | readiness follows display language (PRD risk) |
| AC-004 | coverage-specific unclear texts | view.mjs, catalog | SDD-005 | none — texts only |
| AC-005 | transferred entries filtered in `readPlannedView` | run-view.js, planned inventory | SDD-001 | none — relies on unchanged inventory coverage |
| AC-006 | separate captured read with empty fallback | run-view.js | SDD-002 | failure silent in the pane; accepted per PRD |
| AC-007 | observed kind `planned`, status text, note line, catalog in de/en with validation | notice.mjs, register.mjs, catalog, interaction-catalog-validation.js | SDD-005, SDD-007 | catalog change chain must be run in order |
| AC-008 | fingerprint covers planned folder names and planned folder files | register.mjs | SDD-006 | small extra directory listings per tick |
| AC-009 | shared UR reader keeps run naming behaviour; no-run branch untouched when no planned UR is picked | run-view.js, view.mjs, notice.mjs | SDD-003, SDD-004 | refactor risk covered by existing suites |

## 8. Risks And Open Questions

- An uncommitted candidate implementation on `feat/companion-planned-ur` matches this design closely; TP and Brownfield Analysis must check it task by task rather than accept it wholesale.
- The live Claude pane is not verified.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Shape of the planned field in run-view/1 | before_sd | resolved | Additive array of {plan_id, title, coverage, goal, last_change}, transferred entries excluded (SDD-001) | Arndt Gold |
| Change detection for planned URs | before_sd | resolved | Directory listings in the existing fingerprint, no extra process (SDD-006) | Arndt Gold |
| Reuse of the existing candidate code | later_tp | deferred | TP decides per task whether the candidate code is kept, corrected or replaced, with evidence | Arndt Gold |

## 9. Next Step

Review this solution design and approve only with:

`Approval: SD`

## AGDF Approval Summary (de; source=en)

- Ziel: Technische Umsetzung der freigegebenen PRD-Anforderungen: Der Begleiter zeigt eine geplante UR statt einer Leer-Meldung.
- Umfang: Die Run-Ansicht des Core bekommt ein zusätzliches Feld `planned` (Plan-ID, Titel, Abdeckung, Ziel, letzte Änderung; übergebene URs fehlen), gelesen in einem eigenen Schnappschuss mit leerer Liste bei Fehler. Ein gemeinsamer Leser liefert Überschrift und Ziel für Run-URs und geplante URs. Der Begleiter wählt mit `pickPlan` die neueste geplante UR, zeigt sie über den bestehenden Zweig ohne Run mit Klemmbrett-Regel für das UR-Gate, Statuszeile „AGDF · UR-Planung“ und neuen Katalogtexten in de und en. Der Fingerabdruck für die Aktualisierung erfasst Planungsordner und deren Dateien. Nichts wird geschrieben; Cockpit, Codex und Copilot bleiben unverändert.
- Entscheidungen: Feldform und Änderungserkennung sind festgelegt (SDD-001, SDD-006); ob der vorhandene Kandidatencode übernommen, korrigiert oder ersetzt wird, entscheidet der TP je Aufgabe.
- Prüfung: bestehende Testsuiten plus gezielte Fälle in Core-, Begleiter- und Adapter-Tests sowie Katalog-, Paket- und Kompatibilitätsprüfungen; das echte Claude-Panel wird nicht geprüft, gerenderte Bilder dienen als Sichtnachweis.
