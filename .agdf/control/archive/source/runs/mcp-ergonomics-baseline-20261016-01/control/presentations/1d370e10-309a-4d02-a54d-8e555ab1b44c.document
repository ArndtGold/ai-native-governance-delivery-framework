# PRD: MCP ergonomics baseline evaluation

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-16
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver a repeatable MCP ergonomics evaluation for the current AGDF MCP interfaces and a committed
baseline produced by it. The interfaces themselves stay unchanged.

- **Protocol layer (deterministic).** A fixed, versioned call matrix runs through the existing MCP
  client against the provenance-matched AGDF MCP server on disposable fixture repositories. It covers
  the seven `agdf` tools (`agdf_dispatch`, `agdf_inspect`, `agdf_prepare`, `agdf_record`,
  `agdf_approve`, `agdf_revise`, `agdf_closeout`) with valid, schema-invalid and semantically failing
  calls, and the cockpit tools where the client's declared capabilities expose them. Per call it records
  tool, call class, AGDF outcome, `isError`, response bytes (text content and structured content
  separately), estimated tokens and latency. Per tool it records definition bytes and the share of
  documented input parameters.
- **Native layer (agent behavior).** Non-interactive Claude Code sessions on this Windows machine, in an
  isolated host home against disposable fixture repositories, with the models Opus 5.5
  (`claude-opus-5-5`) and Sonnet 5.5 (`claude-sonnet-5-5`), in two variants: with AGDF skills (current
  default) and MCP-only without AGDF skills or hooks. The versioned task set has six tasks:
  - T1 query the status of an active run (read-only);
  - T2 start the delivery intake for a new change up to the UR authoring step;
  - T3 approve a presented gate with the exact reply;
  - T4 read a presented document page by page;
  - T5 detect and correct an input error;
  - T6 detect a stale revision and recover cleanly.
  Each model, variant and task cell runs twice (48 sessions). Per session the layer records tool calls
  per tool, invalid-argument calls, `isError` results, AGDF failure outcomes, response tokens per tool,
  total tokens and cost where Claude Code reports them, wall time and task success against a
  deterministic success check. The native layer has a cost cap of 25 USD.
- **Baseline and report.** One machine-readable baseline file and one short human-readable report,
  both with provenance, at a tracked repository location, plus one documented command per layer and a
  re-run check that compares a fresh run with the committed baseline.
- **Findings mapping.** The report maps each of the twelve findings of the 2026-10-16 interface review
  to the metric that will show its improvement, or states why it is not measurable in this slice.

## 2. UX Intent And Success

- ui_ux_impact: none
- ux_intent_definition: not_applicable — Brownfield Review records `ui_ux_impact: none`; the slice adds
  maintainer tooling and data and changes no AGDF user-facing capability, state, feedback or recovery.
- primary_user_intent: As AGDF maintainer, know objectively and repeatably how well coding agents use
  the AGDF MCP tools today, so later interface changes can be judged against evidence.
- success_signal: A committed baseline exists, and re-running the documented commands on unchanged
  interfaces reproduces it (exactly for deterministic metrics, within the reported range for native
  metrics).
- primary_decision_or_action: Run the evaluation commands and compare the result with the baseline.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| M1 protocol measurement | protocol observations for every matrix call, aggregated per tool and call class | per-call result rows, per-tool aggregates, run status `complete | incomplete` | AGDF Core tool contracts and live server responses | evaluation report |
| M2 native measurement | session observations per model, variant, task and repetition, aggregated with range | per-session success/failure, per-model/variant aggregates, `not_measured` entries with reason, budget status | Claude Code session transcripts parsed by the evaluation owner; task success checks | evaluation report |
| M3 baseline re-run check | comparison of a fresh run with the committed baseline | per-metric `unchanged | changed | not_comparable` | committed baseline file | evaluation report |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: The maintainer starts each layer explicitly with its documented
  command. The protocol layer needs no credentials and may run offline. The native layer runs only on
  explicit invocation, never implicitly in CI, and needs Claude Code and its credentials.
- blockers_and_visible_next_actions: Missing Claude Code, missing credentials or an MCP-only variant
  that cannot be configured through host configuration alone yields a visible `not_measured` entry with
  reason and the action to resolve it; it is never silently skipped. Reaching the cost cap stops further
  native sessions and marks the run `incomplete` with the consumed amount. A fixture mutation outside
  allowed paths or any change to the real repository's control state invalidates the run.
- recovery_paths: A failed or `not_measured` model/variant can be re-run on its own and merged into the
  same run record. Transient host failures (timeout, rate limit) get a bounded, visible retry and are
  reported as retried.
- relevant_state_transitions: run started → observations recorded per call/session → aggregation →
  report and baseline candidate written to a working location → maintainer reviews and commits the
  baseline. A run that is `incomplete` or invalid is never committed as baseline without an explicit
  `incomplete` marker.

## 5. Acceptance Criteria

Each criterion lists its `criterion_id` and the observable fields used by SD, TP and QA.

- criterion_id: AC-001
  - title: Protocol call matrix coverage
  - observable_success: The protocol report lists, for each of the seven `agdf` tools, at least one valid call, one schema-invalid call and one semantically failing call where the tool can fail semantically, and lists cockpit tools as measured or as not exposed to the client with reason.
  - required_evidence: Protocol run output and versioned call-matrix definition.
- criterion_id: AC-002
  - title: Protocol metrics per call and per tool
  - observable_success: Each protocol call row shows tool, call class, AGDF outcome, `isError`, text-content bytes, structured-content bytes, estimated tokens and latency; each tool shows definition bytes and documented-parameter share.
  - required_evidence: Protocol run output; metric definition document.
- criterion_id: AC-003
  - title: Deterministic protocol reproducibility
  - observable_success: Two consecutive protocol runs on unchanged interfaces produce identical values for every non-timing metric; latency is reported as median and p95 and excluded from exact comparison.
  - required_evidence: Two protocol run outputs and their comparison result.
- criterion_id: AC-004
  - title: Error counting rule
  - observable_success: The report counts separately SDK input-validation errors (`isError`), AGDF failure outcomes (`invalid_input`, `evaluator_error`, `target_unresolved`, `rejected`, `effect_unknown`) and failure results returned without `isError`, following one written counting rule.
  - required_evidence: Metric definition document; protocol and native run outputs.
- criterion_id: AC-005
  - title: Versioned native task set
  - observable_success: The native task set is a versioned file with the six tasks T1 to T6, and every task has a fixture, a prompt, a deterministic success check and its allowed mutation paths.
  - required_evidence: Task-set file; review of each success check.
- criterion_id: AC-006
  - title: Native metrics per session
  - observable_success: Each native session record shows model, variant, task, repetition, tool calls per tool, invalid-argument calls, `isError` results, AGDF failure outcomes, response tokens per tool, total tokens and cost or `unavailable` with reason, wall time and success.
  - required_evidence: Native observation files.
- criterion_id: AC-007
  - title: Two variants for both models
  - observable_success: Claude Code runs the task set with Opus 5.5 and Sonnet 5.5, each with AGDF skills and MCP-only; the MCP-only variant uses host configuration alone and no AGDF product change, or the report shows `not_measured` with reason for that variant.
  - required_evidence: Native observation files; host configuration used per variant; product diff check from AC-014.
- criterion_id: AC-008
  - title: Repetitions and range
  - observable_success: Every model, variant and task cell runs two repetitions, and the report shows both values and their range per metric.
  - required_evidence: Native observation files; aggregated report.
- criterion_id: AC-009
  - title: Isolation of real state
  - observable_success: After a full evaluation, the real repository's `.agdf/control` state and the user's real Claude Code configuration directory are unchanged, fixtures show no mutation outside their allowed paths, and copied credentials are removed.
  - required_evidence: Before/after snapshots and mutation check output.
- criterion_id: AC-010
  - title: Redacted structured evidence
  - observable_success: Committed evaluation evidence contains only defined structured fields, with no absolute local paths, credentials or model prose beyond defined bounded excerpts.
  - required_evidence: Redaction check over committed evidence.
- criterion_id: AC-011
  - title: Provenance
  - observable_success: The baseline records AGDF version, MCP server and dispatcher digests, Claude Code version, models, platform, Node version, date and task-set and call-matrix versions.
  - required_evidence: Baseline file.
- criterion_id: AC-012
  - title: Committed baseline and commands
  - observable_success: The baseline file and report are committed at a tracked location, and the documented commands for each layer and for the re-run check work from a clean checkout.
  - required_evidence: Repository files; command run log.
- criterion_id: AC-013
  - title: Findings mapping
  - observable_success: The report maps each of the twelve review findings to at least one metric, or states for that finding why it is not measurable in this slice.
  - required_evidence: Report section.
- criterion_id: AC-014
  - title: Interfaces unchanged
  - observable_success: `tools/list` output (names, descriptions, schemas, annotations) of the `agdf` and `agdf-cockpit` servers is byte-identical before and after this run's changes, no product source outside the evaluation owner changes, and existing test suites still pass.
  - required_evidence: tools/list comparison; diff scope check; test run log.
- criterion_id: AC-015
  - title: Cost cap and session order
  - observable_success: The native layer runs repetition 1 for every model, variant and task cell before any repetition 2, stops starting sessions when 25 USD are consumed, and the report shows consumed cost per model and whether the cap was hit.
  - required_evidence: Native run output with session order and cost; report.

## 6. Non-Goals

- Any change to MCP interfaces, contracts, descriptions, annotations, error mapping or runtime
  behavior (Phases 1–3 of the plan).
- CI thresholds or regression budgets (Phase 4); the native layer does not run in CI.
- Native measurement on Codex, GitHub Copilot or OpenCode. Native Codex measurement is a follow-up slice
  that reuses this evaluation.
- An LLM-as-judge quality score.
- Any effect on the real repository's control state or the user's real Claude Code configuration.
- Publishing or releasing anything.

## 7. Users And Roles

- Arndt Gold: accountable owner; decided host, models, task set, repetitions and cost cap; reviews and
  commits the baseline.
- AGDF maintainers: run the evaluation and compare later phases against the baseline.
- Coding agents on Claude Code (Opus 5.5, Sonnet 5.5): measured subjects, not users of the evaluation
  output.

## 8. Constraints

- No AGDF product source, plugin payload, CLI or MCP behavior changes; additions stay in the evaluation
  owner, dev scripts and documentation.
- Reuse the existing MCP test client and owned-runtime fixture, the Claude native-probe host isolation,
  parsing and redaction, and the existing `evals/` layout (Brownfield Review findings).
- Native runs use an isolated Claude Code home and disposable fixtures; credentials are copied only for
  the session and deleted afterwards, as in the existing probe.
- Native runs happen on this Windows machine with Claude Code; the protocol layer must also run on macOS
  and Linux.
- Offline CI must stay green without Claude Code or credentials.
- Node 22 or later.
- Implementation starts from a clean branch, because the current working tree carries uncommitted
  changes on `feat/claude-install-fix`.

## 9. Evidence Requirements

- Two protocol run outputs and their comparison (AC-001 to AC-004).
- Task-set and call-matrix files with versions (AC-001, AC-005).
- Native observation files for every model, variant, task and repetition, including `not_measured`
  entries, session order and cost (AC-006 to AC-008, AC-015).
- Before/after isolation snapshots and mutation-check output (AC-009).
- Redaction check output over committed evidence (AC-010).
- Baseline file and report (AC-011 to AC-013).
- tools/list byte comparison, diff-scope check and existing test-suite results (AC-014).
- Code review of the evaluation owner.

## 10. Risks And Open Questions

- Two repetitions show only a range, not a robust spread; the report must say so rather than hide it.
- Opus sessions cost markedly more than Sonnet sessions; the 25 USD cap may stop the run after
  repetition 1, leaving an `incomplete` but fully covered baseline.
- Claude Code may not expose cost or token data per tool result; such metrics become `unavailable`
  with reason.
- The MCP-only variant may not be configurable without a product change; then it is `not_measured` and
  the Brownfield Review re-evaluation condition applies.
- Token estimation is an approximation; one fixed rule keeps runs comparable.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Native host and platform | before_prd | resolved | Claude Code only, on this Windows machine; native Codex measurement is a follow-up slice (user decision 2026-10-16; UR revised and re-approved). | Arndt Gold |
| Models | before_prd | resolved | Opus 5.5 and Sonnet 5.5 on Claude Code (user decision 2026-10-16). | Arndt Gold |
| Repetitions and cost cap | before_prd | resolved | Two repetitions per cell; native cost cap 25 USD; repetition 1 for all cells before repetition 2; on reaching the cap the run is marked incomplete (user decision 2026-10-16). | Arndt Gold |
| Native task set | before_prd | resolved | Six tasks T1 to T6 as listed in Product Scope (user decision 2026-10-16). | Arndt Gold |
| Accountable owner and release scope | before_prd | resolved | Arndt Gold; no release or publication in this run. | Arndt Gold |
| Harness reuse by import or shared extraction | later_sd | open | Decided in SD (Brownfield Review findings). | Arndt Gold |
| Baseline location and data format | later_sd | open | Decided in SD; outside gitignored `probe-results/`. | Arndt Gold |
| MCP-only configuration in Claude Code | later_sd | open | Decided in SD using host configuration only. | Arndt Gold |
| Token estimation rule and metric sources | later_sd | open | Decided in SD. | Arndt Gold |
| Exact call matrix, fixtures and success checks | later_tp | open | Fixed in TP with tests. | Arndt Gold |

## 11. Next Step

Present this PRD only after every `before_prd` row is `resolved` with a concrete answer and
the named PRD Owner is filled. Then review and approve only with:

`Approval: PRD`

## AGDF Approval Summary (de; source=en)

- Ziel: Es gibt eine wiederholbare MCP-Ergonomie-Messung für die heutigen AGDF-MCP-Schnittstellen und einen damit erzeugten, committeten Ausgangswert. Spätere Änderungen an den Schnittstellen lassen sich daran messen; die Schnittstellen selbst bleiben in diesem Run unverändert.
- Umfang: Erstens eine deterministische Protokollmessung: Eine feste, versionierte Aufrufmatrix läuft über den vorhandenen MCP-Client gegen den AGDF-MCP-Server auf Wegwerf-Fixtures und deckt die sieben `agdf`-Tools mit gültigen, schemaungültigen und fachlich scheiternden Aufrufen ab, dazu die Cockpit-Tools, soweit der Client sie sieht. Erfasst werden je Aufruf Ergebnis, `isError`, Antwortbytes, geschätzte Tokens und Latenz, je Tool die Definitionsgröße und der Anteil beschriebener Parameter. Zweitens eine native Messung nur mit Claude Code auf diesem Windows-Rechner, mit Opus 5.5 und Sonnet 5.5, jeweils mit AGDF-Skills und nur mit MCP, über sechs Aufgaben: T1 Status abfragen, T2 Delivery-Intake bis zur UR-Erstellung starten, T3 Gate mit exakter Antwort freigeben, T4 Dokument seitenweise lesen, T5 Eingabefehler erkennen und korrigieren, T6 veraltete Revision erkennen und sauber erholen. Jede Kombination läuft zweimal (48 Sitzungen), Kostendeckel 25 USD.
- Umfang (Ergebnis): Ein maschinenlesbarer Ausgangswert und ein kurzer Bericht mit Herkunftsangaben werden committet; je Messebene gibt es einen dokumentierten Befehl und eine Prüfung, die einen neuen Lauf mit dem Ausgangswert vergleicht. Der Bericht ordnet jedem der zwölf Review-Befunde eine Kennzahl zu oder begründet, warum er hier nicht messbar ist. Nicht enthalten: Änderungen an MCP-Schnittstellen, CI-Schwellwerte, native Messung auf Codex, Copilot oder OpenCode (Codex ist ein Folge-Slice), Bewertung durch ein LLM, Eingriffe in den echten Steuerungszustand oder die echte Claude-Konfiguration, Release.
- Entscheidungen: Nur Claude Code auf diesem Windows-Rechner; Codex wird Folge-Slice, die UR wurde dafür revidiert und neu freigegeben. Modelle: Opus 5.5 und Sonnet 5.5. Zwei Wiederholungen je Kombination, Kostendeckel 25 USD, zuerst Wiederholung 1 für alle Kombinationen, beim Erreichen des Deckels gilt der Lauf als unvollständig. Aufgabensatz T1 bis T6. Verantwortlich ist Arndt Gold, kein Release. Wiederverwendung der Testbausteine, Ablageort und Format, die Konfiguration „nur MCP“ sowie Token-Schätzregel und Datenquellen entscheidet das SD; Aufrufmatrix, Fixtures und Erfolgsprüfungen legt der TP fest.
- AC-001: Der Protokollbericht zeigt für jedes der sieben `agdf`-Tools mindestens einen gültigen, einen schemaungültigen und, wo möglich, einen fachlich scheiternden Aufruf; Cockpit-Tools erscheinen als gemessen oder mit Grund als nicht sichtbar.
- AC-002: Jede Protokollzeile zeigt Tool, Aufrufklasse, AGDF-Ergebnis, `isError`, Bytes von Text- und strukturiertem Inhalt, geschätzte Tokens und Latenz; je Tool Definitionsgröße und Anteil beschriebener Parameter.
- AC-003: Zwei aufeinanderfolgende Protokollläufe auf unveränderten Schnittstellen liefern identische Werte für alle Kennzahlen außer der Zeit; die Latenz erscheint als Median und p95 und ist vom exakten Vergleich ausgenommen.
- AC-004: Der Bericht zählt nach einer schriftlichen Regel getrennt: Validierungsfehler des SDK (`isError`), AGDF-Fehlerergebnisse (`invalid_input`, `evaluator_error`, `target_unresolved`, `rejected`, `effect_unknown`) und Fehlerergebnisse ohne `isError`.
- AC-005: Der Aufgabensatz ist eine versionierte Datei mit T1 bis T6; jede Aufgabe hat Fixture, Prompt, deterministische Erfolgsprüfung und erlaubte Änderungspfade.
- AC-006: Jede native Sitzung zeigt Modell, Variante, Aufgabe, Wiederholung, Aufrufe je Tool, ungültige Argumente, `isError`-Ergebnisse, AGDF-Fehlerergebnisse, Antworttokens je Tool, Gesamttokens und Kosten oder „nicht verfügbar“ mit Grund, Laufzeit und Erfolg.
- AC-007: Claude Code läuft mit Opus 5.5 und Sonnet 5.5 jeweils mit Skills und nur mit MCP; die Variante „nur MCP“ nutzt allein Host-Konfiguration ohne AGDF-Produktänderung, sonst zeigt der Bericht „nicht gemessen“ mit Grund.
- AC-008: Jede Kombination aus Modell, Variante und Aufgabe läuft zweimal; der Bericht zeigt beide Werte und ihre Spanne je Kennzahl.
- AC-009: Nach der Messung sind der echte `.agdf/control`-Zustand und die echte Claude-Code-Konfiguration unverändert, Fixtures haben nichts außerhalb erlaubter Pfade geändert, kopierte Zugangsdaten sind gelöscht.
- AC-010: Committete Evidenz enthält nur definierte strukturierte Felder, keine absoluten lokalen Pfade, keine Zugangsdaten und keine Modelltexte über definierte kurze Auszüge hinaus.
- AC-011: Der Ausgangswert enthält AGDF-Version, Digests von MCP-Server und Dispatcher, Claude-Code-Version, Modelle, Plattform, Node-Version, Datum sowie die Versionen von Aufgabensatz und Aufrufmatrix.
- AC-012: Ausgangswert und Bericht sind an einem versionierten Ort committet, und die dokumentierten Befehle für beide Messebenen und den Vergleich funktionieren in einem sauberen Checkout.
- AC-013: Der Bericht ordnet jedem der zwölf Review-Befunde mindestens eine Kennzahl zu oder begründet, warum der Befund hier nicht messbar ist.
- AC-014: Die `tools/list`-Ausgabe von `agdf` und `agdf-cockpit` ist vorher und nachher byte-gleich, außerhalb der Messkomponente ändert sich kein Produktcode, und die bestehenden Testsuiten laufen weiter grün.
- AC-015: Die native Messung führt Wiederholung 1 für alle Kombinationen vor jeder Wiederholung 2 aus, startet ab 25 USD Verbrauch keine Sitzung mehr und zeigt die Kosten je Modell und ob der Deckel erreicht wurde.
