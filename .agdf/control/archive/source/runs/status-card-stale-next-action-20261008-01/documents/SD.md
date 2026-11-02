# SD: Stale next step after internal step recording

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-08
Owner: Arndt Gold
Run: status-card-stale-next-action-20261008-01
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

One rule decides whether the stored next step still applies. Read paths and the write path apply that same rule, and the dispatcher keeps its existing continuation logic. Four changes in `packages/core/lib` implement it. The design is prepared, not implemented.

1. **Shared rule.** A new helper module `control-evaluation/next-action.js` decides whether the stored `next_allowed_action` still applies. It applies when it is filled, unless it is stale: the run is active, the evaluated gate lies after the stored `current_gate` in the canonical gate order (a forward move), and the stored text is a registered canonical operational value of the English locale pack in `plugins/agdf/meta/agdf-interaction-locales.json` that differs from the evaluated text. Hand-authored texts, same, earlier or unknown stored gates and backward moves keep the stored text (fail closed).
2. **Read paths.** `gate-check.js` and `delivery-map.js` use the helper instead of their inline "stored unless placeholder" rule. Gate-check keeps its existing Verified Change and source-revision exceptions in front. `continuePostTpWork` compares the effective next step, not the raw stored one.
3. **Write path.** `run-update` (`recordRunRevision`) refreshes the derived control fields before sealing an edited active run whose stored next step is stale by the same rule: `current_gate`, `next_allowed_action` and the derived Current Control State rows. Same-gate, backward-moved, hand-authored and non-active runs are written exactly as authored.
4. **Dispatcher literal.** The implementation continuation in `skill-dispatch/service.js` keeps its equality check, because equality signals that no run-specific decision is pending. The compared literal comes from one constant exported by `gate-policy.js` instead of a duplicated string.

The cockpit and the dispatcher need no further change, because both consume the gate-check report. Generated runtime copies follow through the existing `sync-package-assets` script.

## 2. Ownership And Source Of Truth

| Concern | Authoritative owner | Change |
|---|---|---|
| Gate decision and standard next-step texts | `packages/core/lib/control-evaluation/gate-policy.js` (`transitionDecisionForRunState`) | Export the CD+Tests next-step text as a constant; the text is unchanged |
| Whether a stored next step applies | New `packages/core/lib/control-evaluation/next-action.js` | New single owner of the precedence rule |
| Gate-check report, status card next step | `control-evaluation/gate-check.js` | Uses the helper; `continuePostTpWork` uses the effective value |
| Delivery-map report and its status card | `control-evaluation/delivery-map.js` | Uses the helper |
| Recording an edited run | `control-state/run-recording.js` (`recordRunRevision`) | Refreshes derived fields for active runs whose gate moved forward |
| Implementation continuation | `skill-dispatch/service.js` | Imports the constant; logic unchanged |
| Cockpit evaluation | `control-inspect/cockpit.js` | No change; consumes the gate-check report. The labeled `persisted` block keeps showing the stored values. |
| Doctor | `control-evaluation/doctor.js` | No change |
| Generated runtime copies | `scripts/sync-package-assets.js` | Re-run; no manual edit of copies |

## 3. Architecture Decisions

- SDD-01: Add the new module `control-evaluation/next-action.js` with two functions. `storedNextActionStale(runState, decision)` is true only when the run's `lifecycle` (read via `extractField`) is `active`, both the stored `current_gate` (backticks and whitespace removed) and `decision.current_gate` occur in the canonical order UR, Brownfield Review, Mode/Slice Decision, Quick Task Execution, Verified Change Execution, PRD, SD, TP, Brownfield Analysis, CD+Tests, CR, QA, UAT, OR with the evaluated gate after the stored one, and the stored text is one of the English `operationalValues` of the existing locale registry (`interactionLocales` from `resources/context.js`, read through `localePack`) while differing from `decision.next_allowed_action`. `storedNextActionApplies(runState, decision)` is false for a placeholder value or a stale text and true otherwise. `effectiveNextAllowedAction(runState, decision)` returns the stored value when it applies and `decision.next_allowed_action` otherwise. The module imports `isPlaceholderValue` (`shared.js`), `extractField` (`verified-change.js`), `interactionLocales` (`resources/context.js`) and `localePack` (`interaction-presentation.js`); none of them imports gate-check, delivery-map or run-recording, so no import cycle arises; rationale: one owner for a rule that two read paths, the writer and the dispatcher depend on; the scan evidence shows that a forward move with a canonical policy text separates the stale case from deliberate text (1 versus 5 active runs), completed runs must keep their text, the existing safety test in `artefact-recording-test.js:254-258` requires that a backward move keeps stopping automatic implementation, and the existing smoke scenario in `smoke-test.js` (gate-check presentation scenarios) requires that a hand-authored next step stays visible even when the stored gate lags; the locale registry is the existing single source of all canonical operational texts; consequence: the rule is testable in isolation, both read paths and the writer change together, and an unknown stored gate fails closed.
- SDD-02: In `gate-check.js` the existing ternary keeps its first branch, so Verified Change mode or recorded source revisions still use the evaluated text. The fallback becomes `effectiveNextAllowedAction(runState, transitionDecision)`. `continuePostTpWork` replaces `runState.next_allowed_action === transitionDecision.next_allowed_action` with `effectiveNextAllowedAction(runState, transitionDecision) === transitionDecision.next_allowed_action`; rationale: a gate-moved run then renders exactly like a run whose text was never stale, including the localized CD+Tests next step, while same-gate custom text still differs and keeps today's card; consequence: the later blocker-specific overrides of `nextAllowedAction` in gate-check stay unchanged and keep precedence.
- SDD-03: `delivery-map.js` replaces its inline rule with `effectiveNextAllowedAction(runState, gateDecision)` and does not adopt gate-check's Verified Change and source-revision exceptions; rationale: this limits the change to the stale case; consequence: delivery-map output for Verified Change and source-revision runs stays unchanged.
- SDD-04: In `recordRunRevision` (`run-update`), only on the existing content-changed path (seal `content_changed`), parse the edited content and compute `transitionDecisionForRunState`. If `storedNextActionStale` (SDD-01) reports a stale stored next step, rewrite `current_gate`, `next_allowed_action` and the Current Control State rows "What is approved?", "What is missing?", "What is the next allowed action?" and "What is explicitly forbidden right now?". Use the existing `replaceFirstScalar` and `upsertTableRow` helpers and the wording of the approval writer in `run-recording.js:180-192`. "What is known?" stays as authored. Write through the existing `writeRunWithBacklog` with `expectedContent` set to the read content and `allowContentChange: true`. Valid-seal runs and all runs whose stored next step is not stale are written or skipped exactly as today. A dedicated internal-step `run-step` kind is rejected because it would add CLI surface and a second recording path for the same content; rationale: the existing canonical writer already performs this refresh for approvals and run steps, so `run-update` becomes consistent with them; consequence: a stale run such as the cockpit run is refreshed at its next content-changing `run-update`, not by a no-op call.
- SDD-05: `gate-policy.js` exports `CD_TESTS_NEXT_ALLOWED_ACTION` with the unchanged text "Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR." and uses it in its CD+Tests decision. `service.js` imports the constant for its existing equality check, and the other conditions of that check stay unchanged. A purely state-based condition is rejected because it would start implementation over a pending same-gate decision; rationale: the equality deliberately encodes that no run-specific decision is pending (the PRD decision on pending same-gate decisions), and a shared constant removes the silent-drift risk of the duplicated literal; consequence: dispatcher behavior is unchanged except that gate-moved runs now pass through SDD-02.
- SDD-06: `cockpit.js` stays unchanged and inherits SDD-02 through the gate-check report, while its `persisted` block keeps the stored values as an audit view; rationale: the cockpit already separates evaluated and persisted state; consequence: no cockpit code or test change beyond a regression check.
- SDD-07: After the core change, run `npm run sync-package-assets` to regenerate the runtime copies (for example `packages/cli/runtime/core/lib/**` and the generated plugin runtimes). Copies are never edited by hand, and hosts get the behavior after the existing local plugin reinstall; rationale: the repository's existing propagation owner keeps copies consistent; consequence: the installed host runs the old behavior until reinstall.
- SDD-08: Add no new doctor finding and make no change to `doctor.js`; rationale: the PRD decision requires `doctor` to stay `pass` for existing runs; consequence: stale stored text is corrected through display, routing and the next write, not reported.

## 4. Integration Points

- `gate-check.js` → `next-action.js` (new import).
- `delivery-map.js` → `next-action.js` (new import).
- `run-recording.js` → `gate-policy.js` (already imported) and `run-state-parser.js` (already imported) for the refresh.
- `service.js` → `gate-policy.js` (new import of the constant only).
- Consumers of the gate-check report are unchanged: the dispatcher control snapshot (`service.js:195`), the cockpit evaluation and the CLI text output.

## 5. Constraints And Compatibility

- **Evaluated next-step texts.** No text changes; the constant carries the identical string.
- **Current, same-gate, backward and hand-authored runs.** Active runs whose stored next step equals the evaluated one, whose stored gate equals the evaluated gate, whose evaluated gate moved backward or is unknown, or whose stored next step is hand-authored produce identical output. Completed runs produce identical output.
- **Seals and approvals.** Approval seals are untouched, and the content seal is recomputed by the existing writer. Edits that change approvals stay rejected (`approvals_unrecorded`).
- **Public interfaces.** No CLI flag, JSON field or schema changes. The values of existing fields change only for active runs whose gate moved forward while the stored next step is a canonical policy text of an earlier gate.
- **Residual cases.** A hand edit that updates the stored gate but not the stored next step is not detected; canonical writers always set both together, and the observed defect is the opposite case. A backward move keeps the stored text by design: it fails closed and leaves the decision to the human.

## 6. Test And Evidence Strategy

- **Unit tests** for `next-action.js`:
  - placeholder;
  - completed run;
  - active run with the same gate;
  - active run with a forward-moved gate;
  - active run with a backward-moved gate (stored QA, evaluated CD+Tests);
  - unknown stored gate;
  - forward move with a hand-authored stored text (kept);
  - backtick-quoted gate.
- **Writer tests** for `recordRunRevision`:
  - forward-moved active edit refreshes the header and the four rows;
  - backward-moved active edit leaves the stored text unchanged;
  - forward-moved edit with a hand-authored stored text leaves it unchanged;
  - same-gate edit leaves the text byte-identical;
  - completed-run edit leaves the text unchanged;
  - an approval change is still rejected.
- **Read tests:**
  - gate-check text and JSON plus the status card for a stale fixture, matching a never-stale fixture;
  - delivery-map for the same fixture;
  - cockpit evaluation;
  - same-gate custom fixture unchanged.
- **Dispatcher tests:**
  - `continue_delivery` returns `implementation` for stale and current stored text;
  - same-gate custom CD+Tests returns the status card;
  - the existing backward-move safety case in `artefact-recording-test.js` stays terminal;
  - the existing hand-authored scenario in `smoke-test.js` (gate-check presentation scenarios) stays unchanged and passes.
- **Repository comparison:** displayed next step before and after for all runs in this repository. Only active runs whose gate moved forward with a canonical earlier-gate text change.
- **Existing suites:** core, CLI, skill-dispatch and smoke suites, plus `doctor`.
- **Live observation:** `agdf-cockpit-claude-host-20261008-01` status and `continue_delivery` with the updated runtime.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | `run-update` refreshes gate, next step and derived control rows when the evaluated gate moved | `run-recording.js` `recordRunRevision`; `gate-policy.js` | SDD-04 | The refresh must not touch approvals or other sealed sections |
| AC-002 | No refresh when the stored gate equals the evaluated gate or lies after it | `run-recording.js` `recordRunRevision` | SDD-04 | A residual hand-edit case remains (see Constraints) |
| AC-003 | Gate-check, delivery-map and cockpit show the evaluated next step for active runs whose gate moved forward; `continuePostTpWork` uses the effective value | `next-action.js`; `gate-check.js`; `delivery-map.js`; `cockpit.js` | SDD-01, SDD-02, SDD-03, SDD-06 | Blocker overrides in gate-check keep precedence |
| AC-004 | Same-gate stored text applies unchanged | `next-action.js` | SDD-01 | none beyond the rule itself |
| AC-005 | Non-active runs keep the stored text | `next-action.js` | SDD-01 | Delivery-map keeps its current exceptions, so its completed Verified Change output is unchanged |
| AC-006 | The effective next step equals the CD+Tests constant for stale and current runs, so the existing continuation fires | `gate-check.js`; `service.js`; `gate-policy.js` constant | SDD-02, SDD-05 | The other continuation conditions stay unchanged |
| AC-007 | Same-gate custom text and backward-moved stored text differ from the constant, so no implementation continuation | `service.js`; `next-action.js` | SDD-01, SDD-05 | Same as today |
| AC-008 | Read rule applies to the stored cockpit run once the synced runtime is active | `next-action.js`; sync script; installed plugin | SDD-01, SDD-07 | Requires sync and reinstall, or the repository CLI |
| AC-009 | No doctor change; generated copies regenerated; existing suites run | `doctor.js`; `scripts/sync-package-assets.js` | SDD-07, SDD-08 | Stale generated copies would fail integrity checks until synced |

## 8. Risks And Open Questions

- Refreshing inside `run-update` changes the content that gets sealed. Writer tests must prove that approval and binding validation still pass after the refresh.
- The gate-check precedence code also runs under blockers and readiness overrides. Tests cover a stale fixture with an open blocker to show that the blocker text still wins.
- Generated copies must be regenerated after the change, or integrity checks fail.
- The residual hand-edit case is accepted as documented and not designed for in this slice.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Owner of the stored-versus-evaluated precedence rule | before_sd | resolved | SDD-01: new `control-evaluation/next-action.js`; the evaluated next step applies only to active runs whose evaluated gate lies after the stored gate in the canonical order and whose stored text is a registered canonical operational value differing from the evaluated text; all other cases keep the stored text | Arndt Gold, SD Owner |
| Gate-check integration | before_sd | resolved | SDD-02: keep the Verified Change and source-revision exceptions; use the helper as fallback and in `continuePostTpWork` | Arndt Gold, SD Owner |
| Delivery-map integration | before_sd | resolved | SDD-03: helper only, without the gate-check exceptions | Arndt Gold, SD Owner |
| Write path for internal steps | before_sd | resolved | SDD-04: `run-update` refreshes derived fields only when the stored next step is stale by SDD-01; no new `run-step` kind | Arndt Gold, SD Owner |
| Backward or unknown stored gate | before_sd | resolved | SDD-01: keep the stored text (fail closed); preserves the existing safety case in `artefact-recording-test.js:254-258` | Arndt Gold, SD Owner |
| Hand-authored stored next step with a lagging stored gate | before_sd | resolved | SDD-01: keep it; only registered canonical operational values from the locale registry can be stale; preserves the existing smoke scenario in `smoke-test.js` | Arndt Gold, SD Owner |
| Exact-text dispatch check | before_sd | resolved | SDD-05: keep the equality semantics; source the literal from one exported constant | Arndt Gold, SD Owner |
| Cockpit and doctor | before_sd | resolved | SDD-06 and SDD-08: no change; the cockpit inherits from the gate-check report | Arndt Gold, SD Owner |
| Propagation | before_sd | resolved | SDD-07: `npm run sync-package-assets`; no hand-edited copies | Arndt Gold, SD Owner |
| Test fixtures, comparison harness and cockpit-run verification path | later_tp | open | Map every criterion and SDD to tests and evidence, including the sync and reinstall order | TP author through gate-check |

## 9. Next Step

Review this SD and approve only with `Approval: SD`. Valid approval permits Task/Test Plan drafting; implementation still requires TP approval and implementation-preparation Brownfield Analysis.

## Source and Derivation Evidence

- Second late source revision `d59fbd2f-8251-4653-9a2b-0f70e780d675` (`SOURCE_REVISION-02.json`): the forward-only rule replaced the hand-authored stored next step in the existing smoke scenario (`packages/cli/scripts/smoke-test.js`, gate-check presentation scenarios). This revision adds the canonical-text condition from the locale registry (`plugins/agdf/meta/agdf-interaction-locales.json`, 281 English operational values; the cockpit run's stale text is registered, `Draft PRD.` is not).
- Late source revision `c197a5b8-48a2-4224-97c2-5383be039112` (`SOURCE_REVISION-01.json`) reopened this SD at CD+Tests: the equality rule broke the existing backward-move safety case in `packages/core/test/artefact-recording-test.js:254-258` (`test:control-state`). This revision changes SDD-01 and SDD-04 to a forward-only rule; the PRD stays approved.
- Approved PRD (`PRD.md`, sha256:5a6706f51fe3c78e8f6ab2b8e7704e2f871df87365af49a4b9a644a005322a43) and `BROWNFIELD_REVIEW.md` of this run, including `evidence/NEXT_ACTION_DIVERGENCE_SCAN.md`.
- Inspected code:
  - `control-evaluation/gate-check.js:320-337`, `:440-452`;
  - `control-evaluation/delivery-map.js:212-243`;
  - `control-evaluation/gate-policy.js:238-261`;
  - `control-evaluation/shared.js`, `verified-change.js` (imports);
  - `control-state/run-recording.js:84-114`, `:160-192`;
  - `control-state/run-steps.js:28`, `:244-257`;
  - `control-state/run-backlog-writer.js:46-66`;
  - `control-state/run-seal.js:140-161`;
  - `skill-dispatch/service.js:1-16`, `:470-512`;
  - `control-inspect/cockpit.js:50-110`.

## AGDF Approval Summary (de; source=en)

Das Lösungsdesign legt eine einzige Regel fest, wann ein gespeicherter nächster Schritt noch gilt. Lese- und Schreibpfad wenden diese Regel an, und die bestehende Fortsetzungslogik des Dispatchers bleibt erhalten. Es ist vorbereitet, aber noch nicht umgesetzt.

- Regel (SDD-01): Ein neues Modul `next-action.js` entscheidet. Der gespeicherte Text gilt, solange er gefüllt ist. Er gilt nur dann als veraltet, wenn der Run aktiv ist, das ausgewertete Gate in der Gate-Reihenfolge nach dem gespeicherten liegt (Sprung nach vorn) und der gespeicherte Text ein registrierter Systemtext aus der bestehenden Locale-Registry ist, der vom ausgewerteten abweicht. Dann gilt der ausgewertete Text. Handgeschriebene Texte, gleiches, früheres oder unbekanntes gespeichertes Gate und Rücksprünge behalten den gespeicherten Text. So bleiben der bestehende Sicherheitstest für den Rücksprung und der bestehende Smoke-Fall mit handgeschriebenem Text unverändert gültig. Das trennt laut Scan den einen veralteten Run von den fünf Runs mit bewusst eigenem Text, und abgeschlossene Runs behalten ihren Text.
- Gate-Check (SDD-02): Die bestehenden Ausnahmen für Verified Change und Quellrevisionen bleiben vorn. Sonst gilt die neue Regel, auch beim Folgeschritt nach CD+Tests. Ein veralteter Run sieht damit genauso aus wie ein Run, dessen Text nie veraltet war. Blocker behalten Vorrang.
- Delivery-Map (SDD-03): Hier gilt nur die neue Regel, ohne die Gate-Check-Ausnahmen, damit sich sonst nichts ändert.
- Schreibpfad (SDD-04): `run-update` frischt bei einem bearbeiteten aktiven Run, dessen gespeicherter Text nach dieser Regel veraltet ist, Gate, nächsten Schritt und die abgeleiteten Zeilen der Kontrolltabelle auf. Das ist die Wortwahl des Freigabe-Schreibers. Die Zeile „What is known?“ bleibt unverändert. In allen anderen Fällen bleibt alles wie geschrieben. Freigaben bleiben unberührt; Siegel und Backlog ergeben sich aus dem geschriebenen Inhalt. Einen eigenen `run-step` für interne Schritte gibt es bewusst nicht, um keine neue CLI-Fläche zu schaffen.
- Dispatcher (SDD-05): Der Gleichheitsvergleich bleibt, weil er signalisiert, dass keine offene Entscheidung im selben Gate vorliegt. Der verglichene Text kommt künftig aus einer exportierten Konstante in `gate-policy.js`, statt doppelt im Code zu stehen.
- Cockpit und Doctor (SDD-06, SDD-08): Keine Änderung. Das Cockpit übernimmt das Ergebnis aus dem Gate-Check-Bericht.
- Verteilung (SDD-07): Die generierten Kopien entstehen mit `npm run sync-package-assets` neu. Hosts erhalten das Verhalten nach der bestehenden lokalen Plugin-Neuinstallation.
- Nachweise: Es gibt Unit-Tests für die Regel, Schreibtests für `run-update`, Lesetests für Gate-Check, Delivery-Map und Cockpit, Dispatcher-Tests für veraltet, aktuell und eigenen Text bei CD+Tests, einen Vorher-Nachher-Vergleich über alle Runs, die bestehenden Suiten und eine Beobachtung des Cockpit-Runs.
- Zuordnung: AC-001 bis AC-009 sind je genau einmal Designentscheidungen zugeordnet. Offen für den TP bleiben Fixtures, Vergleichswerkzeug und die Reihenfolge von Synchronisierung und Neuinstallation.
- Restrisiko: Eine Handbearbeitung, die nur das Gate, nicht aber den nächsten Schritt ändert, wird nicht erkannt. Kanonische Schreiber setzen beide immer zusammen.
- Revision: Diese Fassung ersetzt die zweite SD-Freigabe. Die Regel greift jetzt nur bei einem Sprung nach vorn mit einem registrierten Systemtext, weil ein bestehender Sicherheitstest den Rücksprung und ein bestehender Smoke-Fall den handgeschriebenen Text absichert.
