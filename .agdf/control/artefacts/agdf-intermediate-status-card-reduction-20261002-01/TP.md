# TP: Fewer intermediate status cards and bounded relationship correction

Status: draft
Gate: TP
Gate approval: open
Based on: approved PRD Revision 2 and approved SD
Date: 2026-10-03
Owner: Codex
Run: agdf-intermediate-status-card-reduction-20261002-01
Traceability contract: criteria-chain-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Capture exact source/worktree and approved-artefact baseline; secure and freeze the eligible before workflow and measurement inputs before any production edit | Codex | TP approval and completed implementation-preparation Brownfield Analysis |
| T-002 | Extract the existing single relationship registry and implement prospective current-gate readiness shared by evaluation, presentation and approval; preserve absent-artefact preparation and exemptions | Codex | T-001 eligibility/evidence prerequisite satisfied |
| T-003 | Add strict typed binding evidence and current-gate artefact recording to existing run-step/CLI/writer; publish pointer, proof and relationship together with historical evidence and protected approvals | Codex | T-001 and T-002 |
| T-004 | Integrate one exact-proof correction into authorized bound dispatch before terminal output; revalidate, audit and preserve read-only paths, permissions and terminal behavior | Codex | T-002 and T-003 |
| T-005 | Reconcile canonical interaction/output guidance, affected skill consumers and localized messages; reuse existing renderer and synchronize generated projections | Codex | T-001 and the relevant T-002–T-004 interface decisions |
| T-006 | Execute the matched comparison, integrated boundary/failure scenarios, all-locale rendered cases and actual Codex observation; record separate evidence lanes, diff/owner review and required quality reviews | Codex | T-002–T-005; frozen T-001 baseline |

No task is marked executed by this plan. TP approval permits implementation preparation first; code starts only after its Brownfield Analysis and the positive T-001 baseline prerequisite. Existing installation-repair hook deletions remain a separate baseline delta.

## 2. Verification Traceability

The product requirements remain in PRD.md. Each row maps an approved criterion/SD decision to a scenario and concrete evidence; it does not redefine acceptance.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-006 | SCN-001 | Frozen W-01 has fewer framework intermediate cards and fewer card characters after change; no protected event is removed | evidence/card-comparison.json and evidence/transcripts/W-01-before.md/W-01-after.md |
| AC-001 | SDD-006 | T-001 | SCN-002 | Observed eligible baseline has a positive redundant-card count; identical goal/inputs/allowed state and source digest are frozen before production edits | BASELINE.md and evidence/baseline-manifest.json |
| AC-002 | SDD-001 | T-005 | SCN-003 | W-03 event variants appear before dependent work; target/run/permission and changed-resumption cases retain fresh binding and stop rules | evidence/protected-events.json and instruction/dispatch transcripts |
| AC-002 | SDD-005 | T-005 | SCN-004 | Every protected event/decision/blocker presentation remains correctly localized and canonical in every registered language | evidence/rendered-locales.json and rendered event blocks |
| AC-003 | SDD-001 | T-005 | SCN-005 | W-02 repeats no unchanged internal card; explicit status always returns fresh full status; unchanged and changed resumption follow their respective event paths | evidence/repeat-status-resume.json and W-02 transcripts |
| AC-003 | SDD-004 | T-004 | SCN-006 | Explicit status, doctor, gate evaluation, delivery-map and run-present leave files/revisions/approvals unchanged even when an eligible missing-row proof exists | evidence/read-only-snapshots.json and dispatcher/control-state tests |
| AC-004 | SDD-002 | T-002 | SCN-007 | Missing current relationship prevents presentation/approval; absent current artefact remains draftable; existing exact approval negatives remain rejected | prospective-ready and approval scenarios in control-state/CLI gate tests |
| AC-004 | SDD-003 | T-003 | SCN-008 | Recording cannot set approval or decide QA; current approved bytes and Approval Operations remain unchanged; unproven draft-change boundary rejects recording | evidence/recording-authority.json and control-state test cases |
| AC-004 | SDD-004 | T-004 | SCN-009 | Correction rejects stale/foreign bindings and altered approved bytes without advancing approval authority or using an old presentation | evidence/correction-negatives.json and approval/dispatch test cases |
| AC-005 | SDD-001 | T-006 | SCN-010 | Matched workflow still executes every required control/evidence checkpoint despite reduced visible routine output | evidence/control-evidence-parity.json and paired operation traces |
| AC-005 | SDD-003 | T-003 | SCN-011 | Faults before commit retain old accepted control; post-commit faults preserve committed revision/audit and recover or visibly block; no partial pointer/chain publication passes readiness | evidence/transaction-faults.json and run-step-transaction fault cases |
| AC-005 | SDD-004 | T-004 | SCN-012 | One correction records proof and old/new revision, then freshly evaluates; unrelated blocker remains visible; repeated/current-row invocation adds no duplicate | evidence/correction-audit.json and one-attempt dispatch cases |
| AC-005 | SDD-006 | T-006 | SCN-013 | Baseline/after inventories explain revision/time differences; all retained checks and evidence are accounted for; total framework text is measured as well as card text | IMPLEMENTATION_EVIDENCE.md and evidence/card-comparison.json/control-evidence-parity.json |
| AC-006 | SDD-005 | T-005 | SCN-014 | Registry-driven case/state matrix renders all affected progress/result/blocker/status/decision cases, including new correction messages, in every registered locale | evidence/rendered-locales.json and interaction/localization tests |
| AC-006 | SDD-006 | T-006 | SCN-015 | Actual Codex visible sequence identifies runtime digest, loaded instructions and session/host identity and demonstrates the matched reduction; missing observation remains an evidence gap | HOST_EVIDENCE.md and evidence/transcripts/Codex-before.md/Codex-after.md |
| AC-007 | SDD-001 | T-005 | SCN-016 | Diff and instruction inspection find one event-policy owner and no persistent last-card cache, extra approval owner or new dispatcher outcome | OWNERSHIP_REVIEW.md and affected instruction/dispatcher diff |
| AC-007 | SDD-002 | T-002 | SCN-017 | Evaluation/recording share one registry including QA_REPORT-tests-TP and UR's existing approval relation; no caller-local duplicated map | registry consumer tests and OWNERSHIP_REVIEW.md |
| AC-007 | SDD-003 | T-003 | SCN-018 | Existing CLI adapter delegates artefact step to Core; strict grammar is confined to that step and sealed provenance stays subordinate evidence | command-registry/control-command/local-validator tests and package-boundary reports |
| AC-007 | SDD-004 | T-004 | SCN-019 | CLI and MCP dispatch use the same Core correction owner; pure evaluators do not import a mutation route and transport adds no independent endpoint | dispatcher/Core boundary tests and OWNERSHIP_REVIEW.md |
| AC-007 | SDD-005 | T-005 | SCN-020 | Canonical/generated instruction consumers agree; repeated sync is idempotent and runtime/skill integrity passes | evidence/projection-checks.json and runtime-integrity/conformance results |
| AC-008 | SDD-002 | T-002 | SCN-021 | Registry variants enforce relationship evidence before affected gate readiness, preserve not_applicable exemptions and avoid preparation/redrafting loops | evidence/prospective-registry-matrix.json and intake/CLI gate scenarios |
| AC-008 | SDD-003 | T-003 | SCN-022 | Valid PRD/SD/TP/QA recording commits pointer/binding/chain together; missing mapping, bad status, write fault and concurrent revision cannot produce readiness | evidence/recording-matrix.json and recording/transaction/lock tests |
| AC-009 | SDD-003 | T-003 | SCN-023 | Strict binding codec handles explicit supersession/history; malformed/unknown/duplicate/conflicting receipts, legacy absent proof and evidence-file drift are ineligible | evidence/binding-matrix.json and new binding cases within Core control-state tests |
| AC-009 | SDD-004 | T-004 | SCN-024 | Exact sealed proof yields one audited correction before output; unsealed/content_changed, stale/foreign/conflicting/multiple-row/missing-proof/changed-byte/concurrent/write-failure variants reject without loops | evidence/correction-matrix.json and dispatcher/control-state/lock tests |
| AC-009 | SDD-005 | T-005 | SCN-025 | Successful correction appears in the next concise result and fresh explicit status; failed correction preserves a localized concrete blocker; terminal bytes remain verbatim | evidence/rendered-locales.json/correction-visible-output.json and dispatcher/presentation tests |

## 3. Test Plan

### 3.1 Frozen comparison workflows

T-001 records full Git HEAD plus tracked/untracked source/worktree snapshot, approved UR/PRD/SD digests and baseline runtime/instruction digests. Current dirty paths are recorded; installation-repair changes must not be silently included as this feature's improvement. Store owned, isolated control fixtures and comparison inputs beneath this run's evidence directory. Fixture approvals are explicitly synthetic non-authorizing test data; no test writes into another live run or changes real user approvals.

- W-01: One selected already permitted internal step performs source inspection, a required validation and evidence maintenance with no new decision, blocker, uncertainty, scope/binding change or significant intermediate result. The inputs, checkpoint order and expected control obligations are identical before/after. Capture actual emitted/rendered framework output, not an after-only invented transcript.
- W-02: Within the same permission, repeat the same internal evaluation, explicitly request status, interrupt/resume unchanged, then interrupt/resume with a material binding/state change. Keep those phases separate when classifying output. Explicit status and changed-binding output are protected rather than counted as noise.
- W-03: Inject required input, blocker, relevant risk/uncertainty, target/run/scope/permission change and significant reviewable result, one at a time. Record the event and visible next action before dependent work; preserve bound decision rendering and approval negatives.
- W-04: Use the exact selected-run missing-relationship symptom. Newly recorded artefacts prevent the omission; an existing omitted row with a previously sealed exact reviewed binding exercises correction. A legacy missing row with only prose, without that typed proof, remains blocked. This maintenance comparison complements W-01 and must not replace its no-event baseline.

Every transcript event is classified as intermediate framework card, protected decision/status/event, brief progress, consolidated result or host tool block. Counts include separate rendered character totals for intermediate cards, all framework text and host blocks. Normalize only irrelevant timestamps/revision identities for comparison; retain the originals and explain differences. Never remove a control checkpoint, insert needless status calls, label a genuine blocker as noise or select a zero-card baseline to satisfy reduction.

The pre-code prerequisite is a reproducible positive eligible W-01 baseline reflecting an actual existing workflow/consumer. Source-backed deterministic emission is identified as such; host behavior is not inferred from it. If no eligible positive baseline is observed, T-001 stops production edits and records the gap for scope/evidence re-evaluation; this TP does not authorize weakening AC-001 or substituting W-04. The current planning turn has not yet captured or passed that baseline.

### 3.2 Recording and correction fixture families

Use all existing registry relationships and their applicability rules. UR-approved_by remains approval-owned; the new recording step cannot manufacture it. Cover each applicable PRD/SD/TP/QA destination and not_applicable exemptions. Test missing current artefact, recorded current artefact without relationship, evidenced valid relationship, empty evidence and conflicting/duplicate rows before presentation and before approval. The preparation route must not repeat when the issue is only a relationship.

Recording variants include valid exact reviewed mapping, unsupported status or gate, unknown input fields/version, missing source/destination, path escape/symlink, mismatched digest, stale target/run/revision, approved-source drift and an explicit draft update whose other artefacts cannot be proven unchanged. Assert no approved status can enter through run-step, QA result is not synthesized, the receipt/chain are covered by the Run seal and current approval receipts are preserved byte-for-byte.

Binding variants include strict canonical encoding/digest, absent legacy section, invalid/unknown section, duplicate IDs, contradictory active bindings, explicit allowed draft supersession, old retained receipt, changed proof file and truncated approval-digest-only proof. Prose alone is never consumed as machine proof. Legacy valid operative rows are not regraded or automatically migrated.

Correction variants include one exact eligible omission, already-complete row, foreign/stale/current revision, ambiguous or multiple missing rows, missing typed proof, evidence-file drift, source/destination drift, invalid seal/content_changed/pending transaction, unrelated blocker and unknown required approval-integrity proof. Successful repair has one attempt and one fresh evaluation. Further blockers are surfaced normally; failed/competing operations never loop into another revision. Explicit status, doctor, delivery-map, evaluator and run-present must not write even with an eligible proof.

Fault injection covers before publication, both sides of Run's commit point and backlog/journal completion when applicable. Capture old/new accepted control snapshots, binding/history, approvals, journal state and concrete error/recovery. A pre-commit failure must not leave a readiness-accepted partial pointer/row; a post-commit failure cannot claim that nothing changed. Two writers compete for the same expected revision: one valid result or a concrete lock/stale rejection, no duplicate chain or binding.

### 3.3 Automated owners and commands

Extend relevant existing tests rather than mirror each implementation function with a trivial test. Keep production expectations in the scenario table. New typed-binding scenarios belong to the Core control-state test owner; recording/commit-point/concurrency evidence uses existing transaction/lock owners; prospective readiness and command cases use existing control/gate owners.

Run canonical asset preparation once before consumers that require generated resources. After the implementation is stable, execute these scoped suites once; repeat only affected suites after further changes or failures:

- `npm run sync-package-assets`
- `npm --prefix packages/cli run test:control-state`
- `npm --prefix packages/cli run test:run-step-transaction`
- `npm --prefix packages/cli run test:run-lock`
- `npm --prefix packages/cli run test:run-recovery`
- `npm --prefix packages/cli run test:control-command`
- `npm --prefix packages/cli run test:cli-gates`
- `npm --prefix packages/cli run test:prd-readiness`
- `npm --prefix packages/cli run test:run-revision`
- `node packages/cli/scripts/intake-continuation-test.js`
- `npm --prefix packages/cli run test:skill-dispatch`
- `npm --prefix packages/cli run test:local-validator`
- `npm --prefix packages/cli run test:interaction-presentation`
- `npm --prefix packages/cli run test:operational-localization`
- `npm --prefix packages/cli run test:artifact-language`
- `npm --prefix packages/cli run test:agent-skills-conformance`
- `npm --prefix packages/cli run test:runtime-integrity-layout`
- `npm --prefix packages/cli run test:runtime-integrity-negative`
- `node scripts/check-package-boundaries.mjs`
- `node scripts/test-provider-boundaries.mjs`
- `git diff --check`

Registry-driven locale tests render each affected case/state and message for all registered packs, not only check translation-key presence. Check unsupported-language fallback and concrete presentation failures through existing owners. Perform a second sync only to prove idempotence, recording content hashes rather than treating a second sync as an extra behavioral test. No broad release/install/native probe is silently included in these commands.

### 3.4 Actual Codex evidence and review

T-006 records an actual human-visible Codex comparison for the same frozen goal/inputs, retaining before/after framework output, tool observations and control/evidence references. Identify host/session, observed loaded instruction source, runtime version/digest and execution path. Use the current session with explicitly identified candidate instructions/runtime when it can provide valid observation; do not call that a restarted installed-plugin session. A source replay, CLI stdout, deterministic rendering or installed-file hash alone is insufficient actual host/model evidence.

If a separate fresh host/model run is needed, obtain explicit authorization for that run rather than creating another thread or agent solely from this TP. The existing native Codex harness is reference for isolated environment and evidence capture, not permission to start an additional model or modify the user's installation. Preserve genuine runtime/discovery failures and first attempts. No default model override, account-copying or user-plugin replacement is part of this task plan.

HOST_EVIDENCE.md distinguishes source, generated candidate, installed bytes, protocol execution and actual host/model output. Record other hosts and native OS lanes as unverified unless independently observed. Missing actual Codex reduction remains an evidence gap under AC-006; it cannot support QA pass. Capture host tool-block counts separately from framework-card reduction.

After code and tests are recorded, run mandatory Code Review and the task-plan/clean-implementation evidence reviews. Reuse QA's existing sole decision owner; record applicable normalized gaps and UX Intent Fidelity. A failed protected boundary or open required evidence gap routes to its earliest owner; no QA pass, UAT or release is inferred from task completion. Reports stay in this run's artefact directory; chat remains concise.

## 4. Brownfield Scope

After TP approval, brownfield-analysis in pre_implementation_analysis mode rechecks approved scope, current worktree baseline and package boundaries. Inspect interaction.md/quality.md/affected skill consumers and locale registry; shared relationship semantics in delivery-map/gate-check/gate-policy; run-steps/run-recording/run-revision, containment/seals/approval receipts and state writer/transaction; dispatcher and its CLI/MCP adapters; command grammar/help and generated inclusion. Use the existing Context Graph interaction and executable-dispatch owners. No new node or retained technical debt is preselected.

Stop for mismatched approved artefacts, changed ownership/authority, unavailable exact evidence or newly discovered full-depth impacts not covered by SD. Record the analysis before CD+Tests, then collect T-001 evidence before production edits. Keep unrelated dirty files isolated; do not stage or commit them.

## 5. Out Of Scope

General repair of artefacts, seals, schemas, approvals or semantic derivation; automatic creation of missing source files; contradictory-row replacement; generic reapproval; gate bypass; persistent visibility cache; general approval-card redesign; independent repair or presentation authority; changes to request activation/run selection; unrelated Quick Task closeout/install/commit/MCP fixes.

No automatic commit/push/PR/release/installation, separate agent/thread/model run, credentials copy or host-registration mutation. Existing installation repair remains separate. QA/UAT/OR and their approvals retain their canonical steps; this TP cannot authorize them in advance.

## 6. Risks And Blockers

- No eligible positive baseline: blocks production edits at T-001; record evidence and re-evaluate scope rather than invent improvement.
- Missing actual Codex observation: blocks the affected visible-behavior acceptance claim and QA pass; deterministic evidence remains separately useful.
- Missing exact source/approval proof, invalid seal or ambiguous relationship: blocks automatic correction; use explicit existing evidence/maintenance route.
- Concurrent writers or fault after publication: retain committed evidence and the exact recovery state; no invisible retry or claim of rollback without proof.
- New receipt/prospective readiness causes legacy regression, preparation loop or package/locale drift: revise at the responsible implementation/design owner.
- Any changed approval authority, hidden required event, lost control/evidence or open applicable review/UX evidence gap: cannot pass QA.

These are execution conditions, not assertions that the planned tests have passed. No new product or architecture decision is deferred in this plan.

## 7. Next Step

Review and deliberately approve with `Approval: TP`, revise or decline. Approval permits implementation-preparation Brownfield Analysis, then T-001 evidence capture and code only when those prerequisites pass. It does not replace later QA/UAT approval or authorize VCS, release, installation or additional agents.

## AGDF Approval Summary (de; source=en)

- Aufgaben: T-001 sichert Quell-/Worktree-/Artefaktstand und einen geeigneten positiven Vorher-Ablauf vor Codeänderungen. T-002 vereinheitlicht die Beziehungsliste und prüft Freigabereife vor Präsentation/Freigabe. T-003 ergänzt vollständige Artefakterfassung und versiegelte Quellbindung im bestehenden Schreibpfad. T-004 integriert die einmalige belegte Korrektur vor terminaler Ausgabe. T-005 stimmt Sichtbarkeitsregeln, Skill-Verbraucher, lokalisierte Ausgaben und Projektionen ab. T-006 führt Vergleich, Grenz-/Fehlerprüfungen, tatsächliche Codex-Beobachtung und erforderliche Reviews durch. Zuständig ist jeweils Codex; Abhängigkeiten sind im Plan festgelegt.
- Reihenfolge: Nach TP-Freigabe kommt zuerst die vorbereitende Brownfield-Analyse. Anschließend muss T-001 einen reproduzierbaren vorhandenen Ablauf mit tatsächlich redundanten Zwischenkarten belegen. Ohne positiven geeigneten Ausgangsfall beginnen keine Produktionsänderungen. Bisher ist diese Messung geplant und noch nicht bestanden; ein Null-Karten-Ablauf oder absichtlich hinzugefügte Statusaufrufe beweisen keine Verbesserung.
- Vergleich: W-01 prüft Quellenprüfung, Validierung und Nachweispflege innerhalb desselben erlaubten Schritts ohne relevantes neues Ereignis. W-02 prüft unveränderte Wiederholung, expliziten Status und geänderte/ungeänderte Wiederaufnahme. W-03 prüft Entscheidungen, Blocker, Risiken sowie Ziel-/Run-/Scope-/Berechtigungswechsel und wesentliche Ergebnisse. W-04 prüft Vorbeugung und belegte Korrektur fehlender Beziehungen; es ersetzt nicht den erforderlichen W-01-Vergleich.
- Messung und Abdeckung: Alle neun PRD-Kriterien und alle sechs SD-Entscheidungen sind auf konkrete Aufgaben, 25 Szenarien, beobachtbare Ergebnisse und Nachweisdateien abgebildet. Kartenanzahl, Kartenzeichen, gesamter Framework-Text und Host-Tool-Blöcke werden getrennt gemessen. Kontroll-/Evidenzpflichten bleiben vollständig; Revisions-/Zeitunterschiede werden erklärt. Geschützte Status-, Entscheidungs- und Ereignisausgaben werden nicht als Rauschen gewertet.
- Erfassung und Freigaben: Alle bestehenden Beziehungstypen einschließlich QA_REPORT-tests-TP und Ausnahmen werden geprüft. Fehlende aktuelle Artefakte bleiben entwerfbar; erfasste Artefakte mit unvollständiger Beziehung erreichen keine Präsentation/Freigabe. Erfassung kann keine Freigabe setzen, QA entscheiden oder genehmigte Bytes verändern. Unzulässige Eingaben, fremde/veraltete Bindung, Pfad-/Symlinkprobleme, fehlende Zuordnung und Schreibfehler dürfen keine akzeptierten Teilzustände erzeugen.
- Autoreparatur: Positive exakte Quellbindung, bereits vollständige Zeile und frische Nachprüfung werden gegen fehlende/nur textliche, fremde, veraltete, widersprüchliche oder mehrere fehlende Beziehungen geprüft. Ungültige/ungeprüfte Siegel, geänderte Artefakt-/Nachweisbytes, fehlende genaue Freigabeintegrität, ausstehende Transaktion und unabhängige Blocker bleiben sichtbar. Höchstens ein Versuch; Wiederholung/Konkurrenz erzeugt keine Duplikate oder Schleifen. Doctor, Status, Auswertung, Delivery Map und run-present bleiben auch bei geeignetem Beleg lesend.
- Transaktion und Altbestand: Fehler vor/nach dem Run-Commit sowie Journal-/Backlogabschluss werden gezielt injiziert. Vor Commit bleibt alter akzeptierter Zustand; nach Commit bleiben Revision und Audit erhalten und offene Reparatur wird sichtbar. Zwei konkurrierende Schreiber dürfen nur einen gültigen Commit oder konkrete Lock-/Stale-Ablehnung erzeugen. Historische gültige Beziehungszeilen bleiben gültig; fehlende strikte Bindungsbelege berechtigen nicht zur automatischen Migration oder Korrektur.
- Tests: Bestehende Kontroll-, Transaktions-, Lock-, Recovery-, CLI-/Gate-, Dispatcher-, Locale-/Renderer-, Skill- und Runtime-Integritätsprüfungen werden gezielt ergänzt. Generierte Ressourcen werden vor ihren Verbrauchern vorbereitet. Jede betroffene Darstellung/Zustand und neue Nachricht wird in jeder registrierten Sprache tatsächlich gerendert. Paketgrenzen, Projektionskohärenz, Sync-Idempotenz, unveränderte Freigabebelege und wortgetreue terminale Ausgaben werden geprüft. Nach stabiler Umsetzung laufen die passenden Suiten; Wiederholung erfolgt nur bei Änderung, Fehler oder offenem Befund.
- Hostnachweis: Ein tatsächlich sichtbarer Codex-Vorher-/Nachher-Ablauf muss denselben Zweck und dieselben Eingaben verwenden sowie Session/Host, geladene Anweisungen, Runtime-Version/-Digest und Ausführungspfad benennen. Quellwiedergabe, CLI-Ausgabe, Rendererprüfung oder installierte Bytes allein sind kein Modell-/Hostnachweis. Die aktuelle Session mit klar benanntem Kandidaten ist kein behaupteter Neustart des installierten Plugins. Ein zusätzlicher Host-/Modelllauf benötigt ausdrückliche Autorisierung; aus dieser TP-Freigabe wird kein weiterer Agent oder Thread gestartet. Andere Hosts/OS-Lanes bleiben ohne eigene Beobachtung unverifiziert.
- Reviews und Grenzen: Nach Umsetzung folgen Code Review sowie Plan- und Strukturprüfungen; QA bleibt alleiniger finaler Entscheider. Offene relevante Befunde und fehlender UX-/Hostnachweis erlauben keinen QA-Pass. Testfixtures sind isolierte, synthetische Daten ohne reale Freigabewirkung. Bestehende Installationsreparaturen werden im Worktree getrennt erfasst; keine Änderung anderer Live-Runs oder fremder Freigaben.
- Abgrenzung: Keine allgemeine Artefakt-/Schema-/Siegel-/Freigabereparatur, keine erfundene fachliche Ableitung, keine automatische Erstellung fehlender Quellen oder widersprüchliche Zeilenüberschreibung. Kein neues Gate, Cache oder Presentation-/Reparatur-Owner; keine Aktivierungs-/Run-Auswahländerung und kein allgemeines Kartenredesign. Keine automatische Installation, Veröffentlichung, Git-Aktion, weiterer Agent/Thread/Modelllauf, Credential-Kopie oder Hostregistrierungsänderung. Separate Quick-Task-, Installations-, Commit- und MCP-Themen bleiben separat.
- Risiken: Fehlender geeigneter Ausgangsfall blockiert Codebeginn. Fehlende tatsächliche Codex-Beobachtung blockiert die entsprechende Abnahme/QA-Aussage. Unklare Belege, Siegel-/Freigabedrift, Konkurrenz-/Commitfehler, Altbestandsregression, Vorbereitungsschleifen und Locale-/Paketdrift werden mit konkretem nächsten Schritt behandelt. Kein geplanter Test gilt bereits als bestanden und keine neue Produkt-/Architekturentscheidung wird still vertagt.
- Nächster Schritt: `Approval: TP` erlaubt zuerst die vorbereitende Brownfield-Analyse, danach Messung und bei erfüllten Voraussetzungen Implementierung. Spätere QA-/UAT-Freigaben und Voraussetzungen bleiben erforderlich. Überarbeitung oder Ablehnung sind möglich.
