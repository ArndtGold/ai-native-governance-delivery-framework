# SD: Early detection and correct handling of four AGDF approval-chain defects

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-17
Owner: Arndt Gold
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

The approved PRD is solved inside the existing owners, one defect at a time:

- D1: the localized-summary reader skips unknown or qualified labelled lines instead of stopping, and one shared Core function decides whether the fields a later gate reads are readable. UR readiness, artefact-readiness inspection and the UR and QA presentations call that function and fail early with the reason `approval_summary_field_unreadable`, naming the field and the expected line.
- D2: the Quality Readiness mapping treats the canonical recorded status `done` as passed.
- D3: Core announces lock ownership on a Node diagnostics channel; the MCP worker forwards those announcements to the server, which releases exactly the exited worker's own locks through a new guarded Core release function before freeing executor capacity.
- D4: gate evaluation withholds the QA approval request on structured routes until TP Review and Clean Implementation Review are recorded; for runs that were already approved past QA without them, the two reviews stay recordable until closeout, and the approval-material and QA-association checks tolerate exactly this late addition.

## 2. Ownership And Source Of Truth

| Responsibility | Authoritative owner | Consumption and boundary |
|---|---|---|
| Product need and acceptance | Approved UR (revision 9) and PRD | Read only; this SD records technical realization |
| Localized summary reading | `packages/core/lib/control-evaluation/report-decision.js` (`readAuthoredContent`) | Sole reader for localized summaries; non-localized profiles unchanged |
| Readability of later-read fields | `packages/core/lib/control-evaluation/decision-content-readiness.js` | New exported `localizedDecisionFieldGaps`; used by UAT observation and by presentation/readiness; no second parser |
| Summary readiness, presentation and recovery text | `packages/core/lib/control-state/run-presentation-render.js` (`requiredLocalizedSummary`, `evaluateApprovalSummaryReadiness`, `renderApprovalSummaryIssue`), `ur-readiness.js`, `control-inspect/artifact-readiness.js` | Consume the shared gaps; existing reason/heading recovery format |
| Quality Readiness mapping | `packages/core/lib/control-evaluation/gate-check.js` (`statusFromReviewArtefact`) with `interaction-presentation.js` (`buildQualityReadiness`) | Mapping only; aggregation unchanged |
| Lock rules and release | `packages/core/lib/control-state/run-state-writer.js` | Owner record format unchanged; new announcement channel and guarded release function |
| Worker lifecycle | `packages/mcp-server/src/worker.js`, `worker-entry.js`, `server.js` | Tracks announced tokens per worker and calls the Core release after actual exit |
| Runtime export to the MCP adapter | `packages/cli/lib/mcp-dispatch-runtime.js` | Re-exports the Core release function; the adapter imports nothing else from Core |
| Gate order and review requirement | `packages/core/lib/control-evaluation/gate-policy.js`; `closeout-readiness.js`; `control-state/run-operation-proof.js` (`internalStepEligibility`) | One shared list of the reviews closeout requires |
| Approval-material and evidence integrity | `control-state/presentation-decision.js` (`approvedMaterialFindings`), `control-state/evidence-bindings.js`, `closeout-readiness.js` | Narrow late-review exception only; every other change still invalidates |
| Operational wording | `agdf-interaction-locales.json` locale packs (en, de) | New next-step and recovery strings get reviewed entries in both languages |

## 3. Architecture Decisions

- SDD-001: In the localized profile of `readAuthoredContent`, a labelled line (`- Label: value` or `- Label (qualifier): value`) whose label is unknown or carries a parenthesised qualifier is skipped and keeps the block open; a recognised plain label is read; a second recognised label still invalidates the whole summary; any non-label line, heading, fence boundary or markup still closes the block for good; rationale: the ur-definition contract prescribes no labels, so field order must not decide whether `Ziel` is readable, and the observed line `Problem (Messlücke):` is a labelled line, not prose; consequence: the reader accepts more summaries, while the closed-block and duplicate guarantees and all non-localized profiles stay unchanged.
- SDD-002: `decision-content-readiness.js` exports `localizedDecisionFieldGaps(gate, text, { locale, sourceLanguage, path })`, which returns the UAT gaps for the UR goal field and the QA result, limits and risks fields with exactly the predicates UAT uses today; `observeDecisionContent` calls it, and `requiredLocalizedSummary` calls it for gates UR and QA whenever the UAT locale (de when the presentation language starts with de, otherwise en) differs from the artefact language, throwing `approval_summary_field_unreadable` with diagnostics `{ field, expected }`; rationale: readiness, presentation and UAT agree by construction because they run the same code; consequence: stricter UR and QA presentation, and fixtures with incomplete localized summaries must gain the missing lines.
- SDD-003: `statusFromReviewArtefact` keeps its keyword scan and, when the scan decides nothing, maps the exact canonical status `done` to `pass`; rationale: the canonical writer writes `done` only for a pass decision confirmed against the report, so this is the recorded decision, and keeping the scan first preserves existing results for hand-written rows; consequence: recorded reviews show as passed and the overall Quality Readiness no longer drops to revise because of them.
- SDD-004: `withOwnedFileLock` publishes `{ phase: 'intent' }` before it stages and publishes the owner record and `{ phase: 'released' }` after it removed its own record, each with `lock_path` and `token`, on the `node:diagnostics_channel` channel `agdf:owned-file-lock`; `worker-entry.js` subscribes and forwards every event synchronously to the parent with `postMessage`; rationale: no lock record change, no Core dependency on worker threads or the MCP SDK, announcing before publication closes the window in which a published lock could be unknown to the parent, and Node drains messages a worker posted before it emits `exit`; consequence: the worker protocol gains one message type, and a publication without subscribers costs nothing.
- SDD-005: `createWorkerDispatchExecutor` records announced tokens per worker, including messages that arrive after the call settled, and when the worker has actually exited (exit event or confirmed termination) calls the injected Core function `releaseAbandonedOwnedLock(lockPath, token)` for every token not reported as released, before it frees capacity; the Core function takes the existing reclaim guard, requires a regular bounded owner record with exactly this token and `pid === process.pid`, re-reads the bytes before unlinking, syncs the directory and removes only this token's staging file; a worker that never exits keeps its locks and capacity; rationale: only a lock proven to belong to a thread that no longer runs is released, so a live writer can never lose its lock; consequence: a stale reclaim guard left by a killed worker remains a residual risk, as today.
- SDD-006: `closeout-readiness.js` exports `STRUCTURED_REQUIRED_REVIEWS = ['TP Review', 'Clean Implementation Review']`; on structured routes, after CR is satisfied and while QA is not approved, gate policy keeps the run at gate QA with `missing_approval: none` and a next action naming the missing review whenever one of these reviews is not satisfied (status `done`, or TP Review `revise` with eligible QA deviation acceptance, as closeout accepts); a QA report with a non-pass decision keeps the existing revise and block routing; rationale: the qa-gate rule already forbids a QA pass without review evidence and closeout already requires both reviews, so enforcing it before the QA approval request removes the dead end at its source; consequence: agents meet the reviews before QA, and structured fixtures that present QA without reviews must record them.
- SDD-007: `internalStepEligibility` additionally allows recording `TP Review` or `Clean Implementation Review` when the route is structured, the run is active, TP is approved, CD+Tests is done, QA is approved, the current gate is UAT or OR, the step row is absent, and the QA approval receipt's material sources do not contain that type; every other internal step after QA or UAT approval stays refused and no recorded review can be replaced through this path; the recorded decision is the one the report states, as the writer already checks; rationale: closes the observed dead end without a source revision and keeps the late path unusable once the approval did see a review; consequence: evidence can be added after a human decision, and its receipt and evidence row show when.
- SDD-008: `approvedMaterialFindings` and the closeout QA-association check treat a required review that is absent from the QA or UAT approval receipt's material sources, and recorded as missing in the QA evidence binding, as a permitted late addition: the comparison excludes exactly those late types and still requires every source the approval or binding saw to be unchanged; closeout still requires each late review to have a current association and a pass decision, so a non-pass late review keeps closeout refused with `closeout_review_result_unconfirmed`; rationale: PRD AC-009 requires closing without renewed QA or UAT approval, and without this exception the late recording would block the run with `approved_material_sources_changed`; consequence: a narrow, documented exception in two integrity checks that never covers material the approval saw.
- SDD-009: Verification uses the existing suites only: Core tests through the CLI smoke chain, the mcp-server suite and `npm run test:verification`, with new regression tests per defect inside existing test files or new files wired into the existing scripts; rationale: the PRD verification scope excludes reinstall and native host runs; consequence: installed-runtime behaviour is not observed in this run.

## 4. Integration Points

### D1 reading and readiness

- `readAuthoredContent(text, 'localized', ...)`: label pattern `^(?:- )?(label)(?:[\t ]*\([^()\n]*\))?:[\t ]*(value)$`; qualified or unknown labels continue the loop; plain recognised labels fill `fields`.
- `localizedDecisionFieldGaps`: UR uses key `ziel` (de) or `goal` (en) with `concreteDecisionContent`; QA uses `ergebnis`/`grenzen`/`risiken` (de) or `delivered result`/`qualification limits`/`risks` (en) with `deliveredContent` for the result (title from the report, path from the QA artefact row) and `concreteDecisionContent(..., { allowNone: true })` for the others.
- `requiredLocalizedSummary(gate, markdown, languages)` gains an optional `path`; `artifactSummary` passes the artefact row path from `renderReviewableApproval`. The thrown error carries `diagnostics: [{ field, expected }]`, which `evaluateApprovalSummaryReadiness` already forwards; `renderApprovalSummaryIssue` renders `expected` (for example `- Ziel:`) next to the heading. The presentation catch block passes the diagnostics through.
- `ur-readiness.js` keeps reporting the required heading as the open item and adds the reason and expected line from the summary result so gate-check output names the field.

### D2 status mapping

- `statusFromReviewArtefact(artefact)`: after the keyword loop, `if (/^`?done`?$/iu.test(status)) return 'pass'`.

### D3 lock ownership

- Core: `import diagnostics from 'node:diagnostics_channel'`; channel `agdf:owned-file-lock`; publish `intent` before `publishOwnedLock`, `released` after the token-matching unlink in `finally` and after the cleanup unlink of a failed handoff.
- Core: `export function releaseAbandonedOwnedLock(lockPath, token)` returns `released | absent | foreign | guarded | unknown` and never throws for those outcomes.
- `packages/cli/lib/mcp-dispatch-runtime.js` re-exports `releaseAbandonedOwnedLock`; `packages/mcp-server/src/server.js` passes it to `createWorkerDispatchExecutor({ releaseOwnedLock })`.
- `worker-entry.js` subscribes before creating the runtime and forwards `{ type: 'lock', phase, lock_path, token }`.
- `worker.js`: lock messages are handled before the `settled` guard; the held-token map is drained inside `release()`, which already runs only after actual exit or confirmed termination; the existing `onEvent` phases gain `locks_released` with a count only.

### D4 review requirement

- `gate-policy.js`: new branch after the CR check and the QA non-pass branch, before the QA approval request; next action text has en/de locale entries.
- `run-operation-proof.js`: late-recording branch as in SDD-007, reading the QA approval receipt through the existing approval-operations reader.
- `presentation-decision.js`: `approvedMaterialFindings` recomputes the version over sources minus late required-review types absent from the receipt's material sources before reporting a change.
- `evidence-bindings.js` exports the per-source comparison used by `evidenceApplicability`, with an option to skip late required-review sources recorded as missing; `closeout-readiness.js` uses it only for the QA association check.

## 5. Constraints And Compatibility

- Lock owner record keys stay `{schema_version, pid, token, started_at}`; older runtimes keep reading and reclaiming exactly as before. Cross-process stale-lock reclaim is unchanged.
- The approval-summary heading format, the gates that need a summary and the fields UAT requires are unchanged.
- Completed runs and historical presentations are not re-evaluated or rewritten; the D4 late path only applies to active runs.
- Core keeps the package-boundary rules: no process, network or MCP imports; `node:diagnostics_channel` is a built-in module.
- New operational strings get reviewed locale entries in en and de, so the operational-localization test keeps passing.
- Generated runtime copies (`packages/cli/runtime/core`, `dist/npm`) are refreshed only through the existing build stages.

## 6. Test And Evidence Strategy

TP maps each criterion and decision to tests:

- D1: reader cases (exact observed UR summary text, qualified and unknown labels before and after `Ziel`, duplicate `Ziel`, prose line closing the block); readiness, artefact-readiness and UR presentation refusal with field and expected line; QA presentation refusal for a missing `Grenzen` line; agreement test that a summary accepted by presentation yields the same field to `observeDecisionContent`.
- D2: `qualityReadinessForRunState` with rows `done` (observed CR note text), `revise`, `block` and absent.
- D3: Core tests for the channel events and every `releaseAbandonedOwnedLock` outcome; MCP executor tests with fake workers for timeout, late exit, hung worker and foreign token; one test with a real worker thread that acquires the lock, is terminated while holding it, and leaves no lock behind once it exited, followed by a successful write.
- D4: gate-policy test that a structured run at QA without reviews gets no QA approval request and names the review; a dead-end reproduction (QA and UAT approved without reviews, gate OR) that records both reviews and the closeout; a negative case with a non-pass late review; a test that any other changed approved source still yields `approved_material_sources_changed`.
- Suites: `npm run test:verification`, `npm --prefix packages/cli run smoke-test` (or its affected sub-scripts during iteration) and `npm --prefix packages/mcp-server test`.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Shared readability function refuses an unreadable, empty or placeholder UR goal field in readiness, artefact readiness and presentation with field and expected line | `decision-content-readiness.js`, `run-presentation-render.js`, `ur-readiness.js` | SDD-001, SDD-002 | In-flight UR drafts with incomplete summaries become unready; recovery names the fix |
| AC-002 | Skip rule for unknown and qualified labels in the one localized reader used by all three consumers | `report-decision.js` | SDD-001, SDD-002 | Reader accepts more summaries; duplicate and closed-block rules preserved |
| AC-003 | Same readability function refuses unreadable QA result, limits or risks before the QA approval request | `decision-content-readiness.js`, `run-presentation-render.js` | SDD-002 | QA fixtures with incomplete German summaries must gain lines |
| AC-004 | Canonical `done` maps to passed after the keyword scan | `gate-check.js` | SDD-003 | Hand-written rows keep keyword results |
| AC-005 | Announced tokens are released after the worker actually exited, before capacity is freed | `run-state-writer.js`, `worker.js`, `worker-entry.js` | SDD-004, SDD-005 | Additive worker message; lock format unchanged |
| AC-006 | Release requires exact token, same PID, guard and unchanged bytes; hung workers keep locks | `run-state-writer.js`, `worker.js` | SDD-005 | Residual stale reclaim guard risk unchanged |
| AC-007 | Regression tests per defect inside the existing suites | Existing test scripts | SDD-009 | No installed-runtime observation |
| AC-008 | QA approval request withheld until both reviews are recorded; late path keeps legacy runs closable | `gate-policy.js`, `closeout-readiness.js`, `run-operation-proof.js` | SDD-006, SDD-007 | Agents meet reviews before QA; structured fixtures may need review rows |
| AC-009 | Late recording of absent reviews at UAT or OR and a narrow integrity exception let closeout succeed; non-pass keeps it refused | `run-operation-proof.js`, `presentation-decision.js`, `evidence-bindings.js`, `closeout-readiness.js` | SDD-007, SDD-008 | Evidence after a human decision; exception limited to absent review types |

## 8. Risks And Open Questions

- The skip rule could hide a mistyped label such as `Zeil:`; the readability check then reports the missing `Ziel` before approval, so the failure stays early.
- Stricter QA presentation and the review requirement before QA can break existing fixtures; TP plans the fixture updates and keeps assertions intact.
- The integrity exception must never apply to a review the approval saw; tests cover a changed seen source.
- Message delivery before `exit` is a Node runtime property; the real-thread test observes it on the supported Node versions in CI.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| D1 unknown or qualified key: skip or end the block | before_sd | resolved | Skip labelled lines with unknown or qualified labels; non-label lines still close the block; readiness and presentation enforce readability through the shared function | Arndt Gold, SD owner |
| D3 release mechanism for an exited worker's locks | before_sd | resolved | Diagnostics-channel ownership announcement before publication, forwarded by the worker; guarded exact-token Core release after actual exit; lock format unchanged | Arndt Gold, SD owner |
| D4 consistency option | before_sd | resolved | Both: withhold the QA approval request until both reviews are recorded, and allow late recording of absent reviews at UAT or OR with a narrow integrity exception | Arndt Gold, SD owner |
| Test file placement and fixture updates | later_tp | deferred | TP names the files and the fixture changes per criterion | Existing task and test plan owner |

## 9. Next Step

Review this solution design and approve only with `Approval: SD`. It permits the Task/Test Plan, not implementation.

## AGDF Approval Summary (de; source=en)

- Ziel: Die vier Fehler werden innerhalb der bestehenden Zuständigkeiten behoben, jeweils mit Tests: lokalisierte Zusammenfassungen sind schon vor der Freigabe lesbar, die Quality Readiness zeigt erfasste Reviews als bestanden, Sperren eines beendeten Workers werden freigegeben und strukturierte Runs laufen nicht mehr in eine Closeout-Sackgasse.
- Lösung: D1: Der Leser überspringt Zeilen mit unbekanntem oder qualifiziertem Feldnamen wie `Problem (Messlücke):`, statt abzubrechen; eine gemeinsame Core-Funktion prüft die später gelesenen Felder, und UR-Bereitschaft, Artefaktprüfung sowie UR- und QA-Vorlage lehnen mit `approval_summary_field_unreadable`, Feld und erwarteter Zeile ab. D2: Der kanonische Status `done` gilt als bestanden. D3: Core meldet Sperrbesitz über einen Diagnosekanal, der Worker leitet das an den Server weiter, und nach dem tatsächlichen Worker-Ende gibt der Server nur dessen eigene Sperren über eine abgesicherte Core-Funktion frei. D4: Ohne TP Review und Clean Implementation Review gibt es keine QA-Freigabeanfrage; Runs, die schon ohne sie freigegeben wurden, können sie bei UAT oder OR nachtragen und abschließen.
- Entscheidungen: SDD-001 Überspringen statt Abbrechen. SDD-002 eine gemeinsame Lesbarkeitsprüfung für Bereitschaft, Vorlage und UAT. SDD-003 `done` als bestanden. SDD-004 und SDD-005 Besitzmeldung vor dem Sperren und abgesicherte Freigabe nach Worker-Ende, Sperrformat unverändert. SDD-006 QA-Freigabe erst nach beiden Reviews. SDD-007 Nachtragen fehlender Reviews nach QA- oder UAT-Freigabe, nur wenn die Freigabe sie nicht gesehen hat. SDD-008 enge Ausnahme in der Material- und QA-Zuordnungsprüfung für genau diese nachgetragenen Reviews. SDD-009 Nachweis über die bestehenden Suites.
- Verträglichkeit: Sperrformat, Überschriftenformat, von UAT verlangte Felder und abgeschlossene Runs bleiben unverändert; ältere Laufzeiten lesen die Sperren weiter. Neue Meldungen gibt es auf Englisch und Deutsch.
- Risiken: Strengere Vorlagen und die Review-Pflicht vor QA können bestehende Test-Fixtures brechen. Die Integritätsausnahme darf nie ein von der Freigabe gesehenes Material abdecken. Ein von einem beendeten Worker hinterlassener Wächter der Sperrrückgewinnung bleibt wie heute ein Restrisiko.
- Nächster Schritt: Dieses SD prüfen und nur mit `Approval: SD` freigeben; danach folgt der Task-/Testplan, noch keine Implementierung.
