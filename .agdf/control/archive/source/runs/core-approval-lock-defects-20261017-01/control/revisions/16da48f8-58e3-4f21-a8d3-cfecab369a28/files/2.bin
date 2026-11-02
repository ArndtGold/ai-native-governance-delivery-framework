# PRD: Early detection and correct handling of four AGDF approval-chain defects

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-17
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver the approved bounded correction of four defects observed in run `mcp-ergonomics-baseline-20261016-01`, inside the existing Core evaluation, presentation and lock owners and the existing MCP dispatch worker adapter.

### D1 — Localized approval summary readable before approval

When a gate's approval needs a localized summary (artefact language differs from presentation language), the fields that a later gate reads from that summary must be readable already when the summary is authored and presented. Today these are:

- UR summary: the goal field (`Ziel` in German, `Goal` in English), read by UAT preparation.
- QA summary: the delivered result (`Ergebnis` / `Delivered result`), qualification limits (`Grenzen` / `Qualification limits`) and risks (`Risiken` / `Risks`), read by UAT preparation.

UR authoring readiness, artefact-readiness inspection and the UR presentation must judge readability with exactly the same reading rule and content predicate that UAT preparation uses; the same applies to the QA presentation. A summary whose required field cannot be read, or is empty or a placeholder, is not ready and produces no approval request. Its recovery names the gate, the field, the expected line form (for example `- Ziel:`) and the required heading. Additional labelled lines outside the recognised field set (for example `Problem (Messlücke):` or `Nicht-Ziele:`) must no longer cause a summary to pass presentation and then fail at UAT; whether such lines are skipped or end the reading is an SD decision, but readiness, presentation and UAT must always agree.

### D2 — Recorded review decisions in Quality Readiness

Quality Readiness rows for TP Review, Clean Implementation Review and Code Review (CR) show the decision that the canonical writer recorded. A row recorded as `done` (the writer's value for a confirmed `pass`) shows as passed; `revise` and `block` show as such; an absent row still shows missing evidence. The overall Quality Readiness status follows the existing aggregation over these rows.

### D3 — Locks of an abandoned MCP dispatch worker

When the MCP server abandons a dispatch worker (timeout, cancellation, unconfirmed or confirmed termination) and that worker has actually exited, run write locks (`RUN_STATE.md.lock`, `MASTER_BACKLOG.md.lock`) that this worker owned no longer block later writes for the lifetime of the server. A lock whose owner may still be writing — a worker that has not exited, another process, or a lock that cannot be proven to belong to the exited worker — stays protected exactly as today. The uncertain original operation keeps its existing recovery route (operation status by the original operation ID); releasing a lock never claims that operation succeeded or failed.

### D4 — Review requirement consistent between QA/UAT and closeout

On structured routes, OR closeout requires a recorded passed TP Review and Clean Implementation Review. That requirement must be consistent with the earlier gates: no run may reach a state in which QA and UAT are approved and closeout can never be recorded because one of these reviews is missing. A run that is already in that state (gate OR or UAT, UR to UAT approved, one or both reviews missing, as in run `mcp-ergonomics-baseline-20261016-01`) can record the missing reviews through the existing internal-step writer and then record its closeout, without a source revision and without renewed QA or UAT approval. A late-recorded review carries the decision its report states; a non-pass result is recorded as such and keeps closeout refused with a recovery naming the review. Whether the QA approval request is additionally withheld while either review is missing is an SD decision.

### Compatibility boundary

The lock owner record format, the cross-process stale-lock reclaim and the approval-summary heading format stay unchanged. Completed runs, their approvals and historical presentations are neither re-evaluated nor rewritten.

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: directly defined low-impact semantics; Brownfield Review records `ux_intent_definition_required: no` because only the content of two existing localized surfaces changes (Quality Readiness rows and the approval-summary recovery block)
- primary_user_intent: Approve a gate only once its summary is complete for every later use, and trust the status card and lock behaviour without manual intervention.
- success_signal: An unreadable required summary field is reported before the approval request with the exact field to fix; a finished Code Review shows as passed; a retry after an abandoned worker is not blocked by that worker's lock.
- primary_decision_or_action: The user approves or discusses gates as before; the agent corrects an unready unapproved summary through the existing authoring route before presenting it.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| UR or QA summary authoring and presentation | Ready only when every later-read field is readable and concrete | Ready presentation, or summary recovery naming gate, field, expected line and heading | Existing approval-summary readiness owner using the UAT reading rule | Existing readiness diagnostics and presentation recovery |
| UAT preparation | Reads the same fields; a summary that passed presentation does not fail on readability | UAT brief, or the existing decision-content gap for other causes | Existing decision-content readiness | Existing UAT presentation |
| Status between gates | Quality Readiness reflects recorded review decisions | Per-row passed, revise, block or missing evidence; overall status | Canonical RUN_STATE artefact rows written by the existing writer | Existing status card |
| Uncertain MCP operation after worker abandonment | Lock of the exited worker released; original operation still uncertain | Existing `effect_unknown` recovery; retries proceed past the lock | Existing lock owner rules and operation receipts | Existing MCP tool result and recovery text |
| Structured run at CR or QA without TP Review or Clean Implementation Review | Closeout requirement visible before QA approval; reviews recordable through the existing writer | Missing-review recovery or Quality Readiness rows naming the review | Existing gate evaluation and internal-step eligibility | Existing status card and QA presentation recovery |
| Structured run past QA or UAT approval with a missing review | Missing review recordable until closeout; closeout succeeds once both pass | Existing internal-step result, then closeout readiness | Existing internal-step writer and closeout readiness | Existing MCP and CLI results |
| Live writer or foreign lock | Lock protected | Existing `run_write_locked` / `dispatch_busy` / `lock_owner_unconfirmed` | Existing lock owner rules | Existing MCP and CLI results |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: D1 applies whenever a localized UR or QA summary is required (artefact language differs from presentation language); same-language gates keep their current behaviour. D2 applies whenever Quality Readiness is rendered. D3 applies only inside the MCP server's worker executor when an abandoned worker exits. D4 applies to structured routes (`structured_slice`, `structured_delivery`) from gate CR until closeout.
- blockers_and_visible_next_actions: An unreadable required summary field blocks readiness and presentation of that gate with a recovery naming field, expected line form and heading; the next action is to correct the unapproved draft through the existing writer and recheck. A protected lock keeps returning the existing lock results; the next action stays the existing operation-status check by the original operation ID. A missing TP Review or Clean Implementation Review names the review and the internal-step recording as next action.
- recovery_paths: Unready summary: correct the unapproved draft canonically and re-run readiness or presentation; approved sources use their existing revision route. Abandoned worker: after its exit the server releases only that worker's own locks; the caller retries or inspects operation status as today. Visible retry remains available for recoverable transient failures.
- relevant_state_transitions: Unreadable summary draft -> recovery -> corrected draft -> ready presentation -> approval. Worker abandoned -> worker exits -> its locks released -> retry proceeds or operation status resolves the uncertain effect. Worker abandoned and never exits -> lock and capacity stay protected -> existing termination-unconfirmed recovery. Structured run past UAT without a review -> review recorded -> closeout readiness re-evaluated -> OR recorded, or a non-pass review keeps closeout refused.

## 5. Acceptance Criteria

- criterion_id: AC-001
  - working_mode: UR summary authoring and presentation
  - source_state: Unapproved UR with a required localized summary whose goal field cannot be read by the UAT reading rule, including the exact observed shape (a `Problem (Messlücke):` line before `Ziel:`) whenever that shape leaves `Ziel` unreadable, a missing `Ziel` line, and an empty or placeholder `Ziel` value
  - action: Evaluate UR readiness, inspect artefact readiness, or prepare the UR presentation
  - expected_effective_state: The UR is not ready and no UR approval request is produced; a summary whose goal field is readable and concrete is ready
  - visible_feedback: Recovery names gate UR, field `Ziel` (or `Goal`), the expected line `- Ziel:` (or `- Goal:`) and the required heading
  - blocker_failure_behavior: Readiness and presentation refuse without changing any control file or receipt
  - recovery_next_action: Correct the unapproved UR draft through the existing writer and re-check the new revision
  - observable_success: No UR summary can pass presentation and then fail at UAT preparation because its goal field is unreadable
  - required_evidence: Core tests with the exact observed summary text through readiness, artefact readiness and presentation, plus a positive case

- criterion_id: AC-002
  - working_mode: Localized summary reading across readiness, presentation and UAT
  - source_state: Localized summaries containing additional labelled lines outside the recognised field set (qualified labels such as `Problem (Messlücke):`, unknown labels such as `Nicht-Ziele:` or `Abnahmesignale:`) before or after required fields
  - action: Read the summary for readiness, presentation and UAT preparation
  - expected_effective_state: All three use one reading rule and reach the same readable/unreadable result for every field; duplicate recognised fields remain invalid and a closed block is never reopened
  - visible_feedback: Either the required fields are read, or the AC-001/AC-003 recovery appears before approval
  - blocker_failure_behavior: Divergence between presentation and UAT is impossible by construction
  - recovery_next_action: As AC-001 or AC-003
  - observable_success: The observed run's original UR summary shape either yields a readable `Ziel` or is rejected before `Approval: UR`, according to the SD rule
  - required_evidence: Reader-level tests for qualified, unknown, duplicate and non-field lines, and an agreement test between presentation readiness and UAT observation

- criterion_id: AC-003
  - working_mode: QA summary presentation
  - source_state: QA report with a required localized summary whose delivered-result, limits or risks field is unreadable, empty or a placeholder by the UAT predicate
  - action: Prepare the QA presentation
  - expected_effective_state: No QA approval request is produced; a summary with all three fields readable and concrete is presented as today
  - visible_feedback: Recovery names gate QA, the first unreadable field and its expected line form (`- Ergebnis:`, `- Grenzen:`, `- Risiken:` or the English labels) and the heading
  - blocker_failure_behavior: Presentation refuses without changing control state or receipts
  - recovery_next_action: Correct the QA report source through the existing QA recording route and prepare again
  - observable_success: A QA summary cannot pass `Approval: QA` and then fail at UAT preparation for readability
  - required_evidence: Core test with a QA summary missing `Grenzen` and a positive case; existing QA presentation fixtures stay green

- criterion_id: AC-004
  - working_mode: Status between gates
  - source_state: RUN_STATE with TP Review, Clean Implementation Review and CR rows recorded by the canonical writer as `done`, `revise` or `block`, or absent
  - action: Render the status card and Quality Readiness
  - expected_effective_state: `done` maps to passed, `revise` and `block` map to themselves, absent maps to missing evidence; the overall status follows the existing aggregation
  - visible_feedback: `Code-Qualität` and the other rows show the recorded decision instead of `Nachweis fehlt`
  - blocker_failure_behavior: Rows with unrecognised status keep today's behaviour
  - recovery_next_action: none
  - observable_success: A run whose reviews all passed shows Quality Readiness passed before QA
  - required_evidence: Core test of `qualityReadinessForRunState` with recorded rows, including the observed CR row text

- criterion_id: AC-005
  - working_mode: Uncertain MCP operation after worker abandonment
  - source_state: In the MCP server a dispatch worker holds `RUN_STATE.md.lock` and/or `MASTER_BACKLOG.md.lock`, is abandoned (timeout, cancellation, unconfirmed or confirmed termination) and then actually exits
  - action: The next write to the same run through the same server process
  - expected_effective_state: The exited worker's locks are released; the next write is not refused with `run_write_locked` because of them; the abandoned operation remains uncertain until its operation status is inspected
  - visible_feedback: The existing `effect_unknown` recovery for the abandoned call; later calls proceed normally
  - blocker_failure_behavior: Release happens only for locks proven to belong to the exited worker
  - recovery_next_action: Inspect operation status with the original operation ID, as today
  - observable_success: Reproduces the observed incident without restarting the server and without `run_write_locked`
  - required_evidence: MCP server test with a real worker thread that acquires a lock and is terminated, plus executor tests for timeout and late exit

- criterion_id: AC-006
  - working_mode: Live writer or foreign lock
  - source_state: A lock held by a worker that has not exited, by another process, by another token, or with an unreadable owner record
  - action: Abandon a worker, or attempt another write
  - expected_effective_state: The lock is not removed; existing results (`run_write_locked`, `dispatch_busy`, `lock_owner_unconfirmed`) are unchanged; the lock owner record format and cross-process reclaim are unchanged
  - visible_feedback: Existing lock and busy results
  - blocker_failure_behavior: No forced release, no lock-file rewrite
  - recovery_next_action: Existing recovery texts
  - observable_success: Existing lock tests stay green and new negative tests prove protection
  - required_evidence: Core lock tests and MCP executor tests for hung worker, foreign token and foreign PID

- criterion_id: AC-008
  - working_mode: Structured run from CR to closeout
  - source_state: Structured run with CD+Tests and CR recorded, and TP Review or Clean Implementation Review missing
  - action: Continue through QA, UAT and OR closeout using the existing gates and writers
  - expected_effective_state: Every reachable state keeps closeout satisfiable: either the QA approval request is withheld until both reviews are recorded, or both reviews remain recordable until closeout; the SD selects one or both
  - visible_feedback: A recovery or status row that names the missing review and its internal-step recording
  - blocker_failure_behavior: No state exists in which QA and UAT are approved and closeout is impossible only because a review is missing
  - recovery_next_action: Record the missing review through the existing internal-step writer
  - observable_success: A regression test drives a structured run without the reviews and shows it can always reach a recordable closeout
  - required_evidence: Core test of the dead-end sequence through the actual gate evaluation, internal-step writer and closeout readiness

- criterion_id: AC-009
  - working_mode: Recovery of a run already in the dead end
  - source_state: Structured run at gate OR (or UAT) with UR to UAT approved, TP Review and Clean Implementation Review missing, and report sources with `Decision: pass`, as in run `mcp-ergonomics-baseline-20261016-01`
  - action: Record both reviews with step `internal`, then record the closeout
  - expected_effective_state: Both recordings are accepted; closeout readiness passes when all other conditions hold; no source revision and no renewed QA or UAT approval are needed
  - visible_feedback: The existing recorded internal-step result, then the existing closeout result
  - blocker_failure_behavior: A report whose decision is not pass is recorded as such and keeps closeout refused with `closeout_review_result_unconfirmed` for that review; an existing recorded review is not replaced by this path
  - recovery_next_action: For a non-pass review, the existing correction routes apply; nothing is hidden behind the earlier approval
  - observable_success: The observed reproduction shape (two `internal_step_not_ready` rejections at gate OR) succeeds after the fix
  - required_evidence: Core test that reproduces the observed state and records both reviews and the closeout, plus a negative case with a non-pass review

- criterion_id: AC-007
  - working_mode: Verification
  - source_state: The implemented change on branch `fix/agdf-core-approval-defects-20261017`
  - action: Run the verification suites
  - expected_effective_state: `npm run test:verification`, the CLI smoke suite that carries the Core tests, and the mcp-server suite pass; changed recovery text renders in English and German
  - visible_feedback: Test output
  - blocker_failure_behavior: A failing suite blocks CR and QA pass
  - recovery_next_action: Fix and re-run
  - observable_success: All named suites pass and each defect has its own regression test
  - required_evidence: Recorded command results in CD+Tests

## 6. Non-Goals

No change to the completed run `mcp-ergonomics-baseline-20261016-01`; no change to which fields UAT requires, which gates need a localized summary, or the summary heading format; no implementation of review findings F02 or F09; no lock record format change, lock lease or general lock redesign; no migration of existing runs; no reinstall of the plugin, release, commit, push or pull request.

## 7. Users And Roles

The user approves gates and decides scope. Coding agents author summaries, run recovery and record results through existing writers. Core owns summary reading, readiness, Quality Readiness mapping and lock rules; the MCP server owns the worker lifecycle. The owner commits the change.

## 8. Constraints

Reuse the existing reader, readiness, presentation, status and lock owners; no second summary parser or lock registry file. Older installed runtimes must still read the lock files written by the new code. Core must not import process-starting or network modules. Generated runtime copies are refreshed only through the existing build steps. Readiness and status evaluation stay non-mutating.

## 9. Evidence Requirements

Tests exercise the real reader, readiness, presentation, executor, internal-step writer and closeout paths rather than mirroring helpers. They include the exact observed summary text, qualified and unknown labels, duplicates, QA summary gaps, recorded review rows with the observed note text, a real worker thread holding a lock while being terminated, a hung worker, a foreign token and a foreign PID, and the closeout dead end with pass and non-pass review sources. CD+Tests records the command results of the named suites.

## 10. Risks And Open Questions

A stricter summary check can reject in-flight drafts and existing test fixtures; this is intended, and the recovery must say exactly what to fix. Lock release is safety-critical; only proven ownership allows it. Worker messages could be lost if a worker dies between acquiring a lock and reporting it; the SD must close that window or show it is closed. Recording reviews after a human QA or UAT decision must not create the impression that the decision covered them; the closeout report discloses when they were recorded.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Fields guarded before approval | before_prd | resolved | UR goal field and the three QA fields that UAT reads; same reading rule and predicate as UAT; no new required fields | Arndt Gold, PRD owner |
| Worker that never exits | before_prd | resolved | Its lock and capacity stay protected as a live writer; no forced removal; existing termination-unconfirmed recovery | Arndt Gold, PRD owner |
| Runs already past QA or UAT approval without the reviews | before_prd | resolved | They can record both reviews through the existing writer and then close, without source revision or renewed QA/UAT approval; a non-pass review keeps closeout refused | Arndt Gold, PRD owner |
| Verification scope | before_prd | resolved | Source and package suites named in AC-007 with new regression tests; no reinstall or native host re-run in this run | Arndt Gold, PRD owner |
| Unknown or qualified key: skip or end the block | later_sd | open | SD decides the reading rule; readiness, presentation and UAT must agree | Existing Core design owner (SD) |
| Mechanism for releasing an exited worker's locks | later_sd | open | SD decides inside the Core lock owner and MCP worker adapter without changing the lock record format | Existing Core and MCP design owner (SD) |
| Whether the QA approval request is additionally withheld while either review is missing | later_sd | open | SD decides inside gate evaluation, consistent with AC-008 and AC-009 | Existing Core design owner (SD) |
| Test mapping | later_tp | open | TP maps every criterion to concrete tests and suites | Existing task and test plan owner |

Resolved rows are the concrete proposal for this PRD decision, not an approval or claim of previous human selection.

## 11. Next Step

Review this bounded PRD and approve only with `Approval: PRD`. It permits the SD stage, not implementation.

## AGDF Approval Summary (de; source=en)

- Ziel: Freigabe-Zusammenfassungen sind schon bei der Vorlage für jede spätere Verwendung lesbar, die Quality Readiness zeigt erfasste Review-Entscheidungen, Sperren eines beendeten, aufgegebenen MCP-Workers blockieren spätere Schreibvorgänge nicht mehr, und ein strukturierter Run kann nicht mehr in einem Closeout steckenbleiben, den fehlende Reviews unmöglich machen.
- Umfang: D1: Bereitschaft, Artefaktprüfung und Vorlage von UR und QA lesen die lokalisierte Zusammenfassung mit derselben Regel wie die UAT-Vorbereitung; geprüft werden `Ziel` (UR) sowie `Ergebnis`, `Grenzen` und `Risiken` (QA). D2: Für TP Review, Clean Implementation Review und CR wird `done` als bestanden angezeigt, `revise` und `block` entsprechend, ein fehlender Eintrag weiter als fehlender Nachweis. D3: Nach dem tatsächlichen Ende eines aufgegebenen Workers gibt der Server nur die Sperren frei, die nachweislich diesem Worker gehören; Sperrformat und prozessübergreifende Rückgewinnung bleiben unverändert. D4: TP Review und Clean Implementation Review werden zwischen QA, UAT und OR-Closeout konsistent verlangt; ein Run, der schon in der Sackgasse steckt, kann beide Reviews nachtragen und abschließen.
- AC-001: Eine UR-Zusammenfassung mit nicht lesbarem, leerem oder Platzhalter-`Ziel`, auch in der exakt beobachteten Form, ist nicht bereit und erzeugt keine Freigabeanfrage; die Meldung nennt Gate, Feld, erwartete Zeile `- Ziel:` und die Überschrift.
- AC-002: Bereitschaft, Vorlage und UAT nutzen eine Leseregel für zusätzliche oder qualifizierte Zeilen wie `Problem (Messlücke):` oder `Nicht-Ziele:` und kommen immer zum selben Ergebnis; doppelte Felder bleiben ungültig.
- AC-003: Eine QA-Zusammenfassung mit nicht lesbarem `Ergebnis`, `Grenzen` oder `Risiken` erzeugt keine QA-Freigabeanfrage; die Meldung nennt das Feld und die erwartete Zeile.
- AC-004: In der Quality Readiness erscheinen mit `done` erfasste Reviews als bestanden, `revise` und `block` entsprechend, fehlende als fehlender Nachweis; der Gesamtstatus folgt der bestehenden Zusammenführung.
- AC-005: Nach dem Ende eines aufgegebenen Workers blockieren seine Sperren auf RUN_STATE.md und MASTER_BACKLOG.md spätere Schreibvorgänge im selben Serverprozess nicht mehr; die unsichere Operation wird weiter über ihren Operationsstatus geklärt.
- AC-006: Sperren eines noch laufenden Workers, eines anderen Prozesses, mit fremdem Token oder unlesbarem Eintrag bleiben geschützt; bestehende Ergebnisse und Sperrformat bleiben unverändert.
- AC-008: Kein über die Gates erreichbarer Zustand lässt QA und UAT freigegeben und den Closeout nur wegen eines fehlenden Reviews unmöglich; fehlende Reviews werden mit dem Erfassungsweg benannt; ein Regressionstest fährt die Sackgasse nach.
- AC-009: Ein Run am Gate OR mit Freigaben bis UAT und fehlenden Reviews, wie der beobachtete Run, kann beide Reviews ohne Quellrevision und ohne erneute QA- oder UAT-Freigabe erfassen und danach abschließen; ein nicht bestandenes Review wird so erfasst und hält den Closeout mit Benennung des Reviews an.
- AC-007: `npm run test:verification`, die CLI-Smoke-Suite mit den Core-Tests und die mcp-server-Suite bestehen; jeder Fehler hat einen eigenen Regressionstest; geänderte Meldungen gibt es auf Englisch und Deutsch.
- Entscheidungen: Geprüft werden genau die Felder, die UAT liest. Ein nie endender Worker behält Sperre und Kapazität. Nachweis über Quell- und Paket-Suites ohne Neuinstallation. Runs nach QA- oder UAT-Freigabe ohne Reviews dürfen beide nachtragen und abschließen. Offen für das SD: ob ein unbekannter Schlüssel übersprungen wird oder den Block beendet, der Mechanismus zur Freigabe der Sperren des beendeten Workers und ob die QA-Vorlage ohne beide Reviews zusätzlich zurückgehalten wird. Offen für den TP: die Testzuordnung.
- Abgrenzung: Keine Änderung am abgeschlossenen Run, an den von UAT verlangten Feldern, am Überschriftenformat oder am Sperrformat; keine Umsetzung von F02 und F09; keine Migration, Neuinstallation, Git-Aktion oder Veröffentlichung.
- Nächster Schritt: Diese PRD prüfen und nur mit `Approval: PRD` freigeben; danach folgt das SD, noch keine Implementierung.
