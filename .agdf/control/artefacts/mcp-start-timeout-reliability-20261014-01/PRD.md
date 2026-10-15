# PRD: Reliable MCP runtime and coherent Codex host setup

Status: draft
Gate: PRD
Gate approval: open
Based on: Approved UR, registered Brownfield Review and ready UX Intent Definition
Date: 2026-10-14
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver the approved causal repair and coherent observed Codex setup outcome. Identify and permanently correct required demonstrated startup/execution defects; preserve existing provenance, bounded execution/cancellation and canonical original-operation recovery. Reconcile supported product and owned diagnostic roles across plugin/project/user configuration using existing owners.

AGDF is the regular product entry. A separate AGDF Cockpit is permitted only when its existing project-bound read/open capability cannot be safely served by that entry within the evidenced host/runtime boundary. Technical feasibility and migration mechanics belong to SD; the product promise is preserved capability, clear role and no duplicate product declaration. Display names must remain truthful within actual host support; technical IDs/tool namespaces are compatibility identifiers.

Temporary diagnostic registrations require deliberate activation, explicit test identity, exact ownership, bounded use and safe completion/abort cleanup. The specifically observed local entries are candidates for reconciliation, not automatically disposable because of their names. Unknown ownership is retained with a concrete gap. Product/setup scope is Codex only; adjacent host integrations retain their existing behavior and must not regress.

A bounded derived setup/status projection distinguishes authoritative source, scope, actual runtime, role/lifecycle owner and declared versus host-observed settings. Configured/enabled, started, tools discovered and App rendered are distinct states. Disabled, registration removed, owned session ended and shared App data cleared are also distinct effects. Codex remains the authority for effective config, trust, permissions, discovery, rendering/session and shared browser data; AGDF retains only its existing package/lifecycle/Core/App responsibilities.

## 2. UX Intent And Success

- ui_ux_impact: high
- ux_intent_definition: .agdf/control/artefacts/mcp-start-timeout-reliability-20261014-01/UX_INTENT_DEFINITION.md; registered decision ready
- primary_user_intent: Use a coherent AGDF product and understand/recover its actual host setup without permanent diagnostic clutter, duplicate operations or false App success.
- success_signal: Product capability and scope are clear; each reported state has its own evidence; failed/unknown/stale state offers one safe existing next action.
- primary_decision_or_action: Use the product, deliberately activate bounded diagnostics, or perform the existing owned setup/update/removal action in the exact intended scope.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Regular product | Actual installed AGDF role, scope, runtime and connection | configured, started, discovered; rendered only if directly observed | Codex effective config/session; AGDF exact package and Core operation receipts | Existing AGDF setup/status output and Codex native settings |
| Optional justified Cockpit | Project-bound read/open capability with clear separate reason | available, unsupported, stale or unobserved | Existing Cockpit source/session and Codex rendering; no gate writer | Existing Cockpit output and native App container |
| Explicit diagnostics | Test owner, intended scope/lifetime and actual producer | inactive, active test, completed/aborted, cleanup complete or retained | Existing owned setup/probe lifecycle within host policy | Existing diagnostic/setup report |
| Disabled or removed | Disablement/registration/session/data effects reported separately | disabled, registration absent, session end confirmed/unobserved | Codex configuration/client/data; existing AGDF owned lifecycle | Existing lifecycle result and native host settings |
| Partial failure/stale/unknown | Known observed state plus missing current proof | failed phase, stale client, unavailable, uncertain effect | Host observation and canonical original-operation receipt | Existing compact error/status report with one next action |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Existing authorized installation/setup and exact project/user scope. No automatic second registration for plugin discovery. Tests are deliberately activated and explicitly temporary; disablement/removal never silently broaden scope or erase unrelated state.
- blockers_and_visible_next_actions: Ownership/identity, precedence/policy, collision, stale source/client or absent capability proof prevents affected mutation or stronger success claim; retain concrete reason and one supported next action.
- recovery_paths: Bounded visible retry only when eligible. Unknown effects first inspect the original UUID/receipt/status; exact replay must preserve identical effect. Partial setup reports exact changed/preserved state and existing recovery/rollback. Unsupported/unobserved App uses the existing text/document route with unchanged decision binding.
- relevant_state_transitions: Observe each configuration/start/discovery/rendering transition independently. Update may leave an old live session; report freshness/refresh instead of claiming current code. Diagnostic completion/abort enters owned cleanup. Registration removal does not imply process termination or shared App-data deletion.

## 5. Acceptance Criteria

These stable criteria derive from the corresponding approved UR acceptance signals; SD/TP/QA reference them without copying acceptance authority.

- criterion_id: AC-001
  - requirement: Causal assessment
  - working_mode: product and diagnostic investigation
  - source_state: Observed startup/timeout failure
  - trigger_action: Trace each failure family through actual phase observations and counterprobes
  - expected_effective_state: Each observed family has a supported cause or concrete counterevidence; an unresolved required failure remains a gap
  - visible_feedback: State observed fact, hypothesis, cause/counterevidence and unresolved limits separately
  - blocker_failure_behavior: Generic code or successful retry alone cannot establish cause
  - recovery_next_action: Continue the assigned bounded investigation before claiming repair
  - observable_success: Traceable assessment for both startup codes and dispatch_timeout; no fabricated root cause
  - required_evidence: Protected original logs, exact baseline/candidate and phase/exception/operation evidence

- criterion_id: AC-002
  - requirement: Durable regression repair
  - working_mode: scoped implementation verification
  - source_state: Confirmed baseline defect
  - trigger_action: Exercise the same isolated scenario before/after production correction
  - expected_effective_state: Confirmed required defect is corrected in its existing owner
  - visible_feedback: Report reproduced baseline failure and changed candidate outcome
  - blocker_failure_behavior: Test-only workaround, masked error or weakened guard is insufficient
  - recovery_next_action: Resolve defect and repeat affected tests
  - observable_success: Regression fails on protected original baseline and passes on corrected production path
  - required_evidence: Actual baseline/candidate regressions and concurrency/interruption cases

- criterion_id: AC-003
  - requirement: Measured bounded execution
  - working_mode: regular single/multiple clients
  - source_state: Known candidate and defined workload
  - trigger_action: Repeat cold/warm startup and real tool requests under approved normal/stress conditions
  - expected_effective_state: Measured requests complete within approved bounds; cancellation and overload remain bounded
  - visible_feedback: Separate startup, verification, operation and response timing with workload/limits
  - blocker_failure_behavior: One retry or unexplained deadline increase is not reliability proof
  - recovery_next_action: Report failed phase and supported next action
  - observable_success: Existing applicable performance guards pass; no confirmed required normal-path timeout remains
  - required_evidence: SD/TP-defined bounds, distributions, cold/warm and multi-client evidence

- criterion_id: AC-004
  - requirement: Protected uncertainty semantics
  - working_mode: mutating command, cancellation or mismatch
  - source_state: Valid original UUID/request or deliberately invalid runtime
  - trigger_action: Cancel, exceed deadline, lose response or attempt invalid claim/runtime
  - expected_effective_state: Committed effect is not undone/inferred from transport failure; invalid provenance remains refused
  - visible_feedback: Show unknown effect with original identity or a proven recorded/not-dispatched state
  - blocker_failure_behavior: Tampered/foreign/stale runtime cannot become usable by retry; timeout cannot create a second approval
  - recovery_next_action: Inspect original receipt/status and replay only exact original request/UUID when appropriate
  - observable_success: No duplicate write/revision/approval; integrity and bounded cancellation preserved
  - required_evidence: Negative provenance/claim cases and canonical status/replay/transaction evidence

- criterion_id: AC-005
  - requirement: Actionable safe diagnostics
  - working_mode: startup/execution failure
  - source_state: Failed phase or unavailable details
  - trigger_action: Return the supported failure output
  - expected_effective_state: Known safe phase/reason and one permitted recovery are visible; unknown facts remain unknown
  - visible_feedback: Readable failure consequence and next action with optional bounded technical evidence
  - blocker_failure_behavior: Secrets, full private payloads and speculative causes must not be emitted
  - recovery_next_action: Existing supported phase-specific recovery; bounded retry only if eligible
  - observable_success: Agent can distinguish failed start, unavailable tool and uncertain committed effect
  - required_evidence: Actual returned error outputs and sensitive-data exclusion checks

- criterion_id: AC-006
  - requirement: Exact installed qualification
  - working_mode: final supported local candidate
  - source_state: Final source/package qualified
  - trigger_action: Install via supported owner and invoke configured installed CLI/STDIO
  - expected_effective_state: Actual installed candidate matches frozen final source and passes required positive/negative/stress cases
  - visible_feedback: State exact identity and proof lane; keep synthetic/native limits explicit
  - blocker_failure_behavior: Old namespace/build or equal version alone cannot qualify candidate
  - recovery_next_action: Rebuild/reinstall/requalify only the affected exact candidate
  - observable_success: Byte/source identity, direct configured runtime and original UUID replay are established
  - required_evidence: Installation marker, package comparison and direct installed transcripts

- criterion_id: AC-007
  - requirement: Governed quality and scope
  - working_mode: delivery lifecycle
  - source_state: Approved scope and completed implementation tasks
  - trigger_action: Run required tests/build/reviews and present fresh QA/UAT
  - expected_effective_state: Required checks and sole QA decision bind current scope; new replies alone advance acceptance
  - visible_feedback: Preserve missing proof, technical result and approval/closeout distinctions
  - blocker_failure_behavior: No weakened payload/instruction assertions, prior approval transfer or automatic VCS
  - recovery_next_action: Resolve required gaps before fresh QA/UAT and OR
  - observable_success: Affected tests, normal build/budgets, mandatory reviews and exact accepted closeout
  - required_evidence: Bound CD/tests, reviews, QA/UAT material/receipts and OR

- criterion_id: AC-008
  - requirement: Coherent product entry
  - working_mode: regular product and optional Cockpit
  - source_state: Observed mixed registration topology
  - trigger_action: Install/update or reconcile supported AGDF entries
  - expected_effective_state: AGDF is regular entry; a separate AGDF Cockpit has a justified role; required control/read/open capabilities remain
  - visible_feedback: Product role, actual entry name, scope and reason for separation are clear
  - blocker_failure_behavior: Cosmetic renaming must not remove Cockpit opener or break technical IDs/tool namespaces
  - recovery_next_action: Use bounded compatibility migration or retain justified capability with explicit reason
  - observable_success: No duplicate product registration; current required capabilities remain reachable
  - required_evidence: Entry/capability before-after inventory, repeat setup and namespace compatibility proof

- criterion_id: AC-009
  - requirement: Temporary diagnostic lifecycle
  - working_mode: deliberate diagnostic use
  - source_state: Inactive or verified existing test registration
  - trigger_action: Activate, complete, abort or repeat owned cleanup
  - expected_effective_state: Test identity/owner/intended use are explicit; unintended persistent test registration is removed safely
  - visible_feedback: Show test role and actual cleanup outcome or retained reason
  - blocker_failure_behavior: Path/name alone is not ownership; foreign/shared/product entries cannot be adopted/deleted
  - recovery_next_action: Retain unproven target and report missing exact evidence
  - observable_success: Verified local remnants handled; completion/abort/repeat preserves unrelated state
  - required_evidence: Matched ownership descriptors/bytes, exact config diffs and cleanup regressions

- criterion_id: AC-010
  - requirement: Separated topology and deadlines
  - working_mode: installed investigation and qualification
  - source_state: Regular plugin plus observed diagnostic builds
  - trigger_action: Compare product alone, concurrent product clients and diagnostics separately
  - expected_effective_state: Each result binds actual producer/runtime; host start/tool and internal worker limits remain distinct
  - visible_feedback: Identify phase and producer; multi-client existence is not called a leak
  - blocker_failure_behavior: Diagnostic proof cannot stand for product qualification; raw defaults are not effective limits
  - recovery_next_action: Resolve exact identity/config evidence and rerun affected lane
  - observable_success: All relevant comparison lanes and deadline layers have attributed observations
  - required_evidence: Topology/source/producer inventory, timing lanes and unchanged-state refusal checks

- criterion_id: AC-011
  - requirement: Effective host setup evidence
  - working_mode: all setup/status modes
  - source_state: Authoritative plugin/project/user declarations and available host observations
  - trigger_action: Inspect existing effective AGDF setup
  - expected_effective_state: Bounded projection identifies source/scope/role/owner/runtime and independently evidenced configured/start/discovery/render states
  - visible_feedback: Distinguish declared, host-observed, stale and unavailable facts; redact secrets
  - blocker_failure_behavior: No writable mirror registry or inferred effective permission/UI state
  - recovery_next_action: Resolve authoritative observation or report unavailable with one supported action
  - observable_success: Every in-scope entry is attributable; no stage is falsely promoted
  - required_evidence: Source/effective readback comparison, unavailable/stale and redaction cases

- criterion_id: AC-012
  - requirement: Coherent owned lifecycle
  - working_mode: install/update/disable/reactivate/migrate/remove
  - source_state: Current applicable declarations and shared references
  - trigger_action: Perform existing authorized scoped lifecycle action
  - expected_effective_state: Idempotent result preserves foreign config, required capabilities, scope and host policy across applicable layers
  - visible_feedback: Show exact resulting state and partial-failure/rollback consequence
  - blocker_failure_behavior: Collision, stale ownership, shared reference or policy conflict cannot silently widen/adopt/overwrite
  - recovery_next_action: Existing bounded rollback/recovery or retain blocked entry with reason
  - observable_success: No duplicate registration, silent scope widening, foreign loss or capability loss
  - required_evidence: Lifecycle matrix including repeat, collision, interrupted/partial failure and shared references

- criterion_id: AC-013
  - requirement: Honest MCP App behavior
  - working_mode: App-capable, unsupported or unobserved host
  - source_state: Connected server with or without actual host UI support
  - trigger_action: Discover tools/resources, render or invoke existing text/document fallback
  - expected_effective_state: Only direct observation establishes rendered/interactive App; fallback preserves original decision semantics
  - visible_feedback: State tools available separately from App rendered, unsupported or unobserved
  - blocker_failure_behavior: HTML/resource or capability advertisement is not rendering/interaction proof
  - recovery_next_action: Use existing supported text/document path or obtain separately authorized native observation
  - observable_success: No false App success and no UI-derived approval authority
  - required_evidence: Capability/fallback tests and fresh native rendering/interaction proof for each native claim

- criterion_id: AC-014
  - requirement: Scoped teardown and session freshness
  - working_mode: disable/remove/update/test cleanup
  - source_state: Owned config plus potentially live/shared sessions and host App data
  - trigger_action: Change owned registration or end verified owned session
  - expected_effective_state: Registration, process/session and shared App data effects remain separate; old sessions after update remain detectable
  - visible_feedback: Report achieved state, old/new runtime observation and supported refresh requirement
  - blocker_failure_behavior: No blanket process kill, host restart or shared MCP-App cache purge
  - recovery_next_action: Retain shared/unproven state; report supported refresh/ownership recovery
  - observable_success: Foreign settings/storage and shared clients preserved; stale session never reported current
  - required_evidence: Before-after config/process ownership and host-data preservation; freshness/refusal/repeat tests

## 6. Non-Goals

No new MCP server/registry/lifecycle implementation or approval authority, general host settings redesign, connected-App/account change, new cross-host configuration format, arbitrary timeout inflation, weakened provenance/permission/transaction guards or unlimited execution. No automatic host restart, scope widening, mutating UUID replacement, blanket registration/process/temp-file deletion or shared MCP-App cache purge. No public release, commit/push/PR/deployment, other-Run repair, historical approved-source rewrite or unrelated UI documentation work. Existing guided activation journey is reused, not replaced.

## 7. Users And Roles

Coding agents are direct consumers; Arndt Gold is the accountable product/acceptance owner. Existing maintainers/AGDF owners supply supported declarations, scoped lifecycle and safe diagnostic evidence. Codex owns effective host settings, policy/trust, native client/discovery/UI and shared data. Core owns committed gate/operation state; host tool permission, a successful MCP call or UI presence never approves an AGDF gate.

## 8. Constraints

Retain exact-version/content provenance, contained non-symlink ownership, shared runtime/claim retention, original UUID/digest/revision identity, transactional recovery and the existing gates/formulas. Preserve foreign configuration and required current Cockpit capability. Do not infer effective values from raw config files, default documentation, generic native readback presence or process count. Existing payload/instruction/performance guards remain meaningful and cannot be disabled; legitimate measured growth needs exact rationale without spare budget.

Changes outside the workspace use the supported owner and normal host permission review. No broad cleanup is authorized. Missing native observations stay explicit. A final source or runtime change after qualification requires affected requalification.

## 9. Evidence Requirements

Record protected baseline and final candidate identities, concrete causal/counterevidence for each family, baseline-failing/candidate-passing regressions, cold/warm single/multiple-client and diagnostics lanes, bounded timing and interruption/response-loss observations. Preserve preliminary failures and unrelated approved bytes.

Verify supported build/install, exact source/package/cache identity and actual configured installed CLI/STDIO, not only version strings or test builds. Cover valid and invalid provenance, claims, concurrency, stale input/source, uncertain effects, same-UUID replay and refusal-state preservation. Preserve existing protocol variants in affected tests.

Lifecycle evidence must cover relevant plugin/project/user sources, repeat calls, disable/reactivate/migrate/remove, collisions, stale paths, shared references and partial failure/abort; show exact owned/foreign boundaries and final effective observation where available. Returned product/status/error states and registered languages need actual rendered-text checks. Native App rendering/interaction claims require fresh host evidence; synthetic capability/resources tests are explicitly separate.

SD/TP must define measured workload/bounds and causal phase instrumentation before production implementation. Required confirmed defects or required evidence gaps prevent a technical QA pass. Unsupported/unobserved native capability can be reported honestly as such with the preserved fallback; it cannot be called working native App qualification. Mandatory reviews and sole QA consume the exact candidate; only new deliberate QA/UAT replies authorize later acceptance/closeout.

## 10. Risks And Open Questions

Known startup codes suppress underlying exceptions; claims/publication and worker fresh-runtime checks are investigation seams, not proved root causes. Deadline termination can follow a committed effect. Multiple ordinary clients can explain process multiplicity. Legacy diagnostic descriptors/markers may not prove current wrapper ownership. Product consolidation may remove a separately bound Cockpit opener or encounter host namespace/permission differences. Effective managed settings and old client sessions can differ from declarations. Shared host App data extends beyond this product.

These risks require assigned SD/TP decisions and evidence; no deliberate unresolved debt is accepted. A confirmed boundary change outside approved intent requires the existing upstream assessment/revision owner before implementation.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Product entry and preserved capability policy | before_prd | resolved | AGDF regular entry; separate AGDF Cockpit only with evidenced technical necessity. Preserve control/read/open capability and technical namespace compatibility; cosmetic cleanup is insufficient. | Arndt Gold |
| Configuration and authority boundary | before_prd | resolved | Existing plugin/lifecycle/host owners only. Codex remains authoritative for effective settings/permissions/session/UI/data; derive read-only evidence without another registry. | Arndt Gold |
| Diagnostic activation and removal policy | before_prd | resolved | Deliberate explicit test use; exact ownership before targeted cleanup; retain unknown/foreign/shared state with reason; completion/abort/repeat cleanup required. | Arndt Gold |
| Accepted proof and release scope | before_prd | resolved | Required exact installed CLI/STDIO and host-setup evidence; native UI claims only with direct fresh proof, otherwise explicit unavailable/unsupported/fallback. No native/other-host inference, automatic restart or VCS/release. | Arndt Gold |
| Cause, timeout/execution and publication/claim design | later_sd | deferred | Existing runtime/lifecycle owners establish measured cause or concrete counterevidence and bounded design; required unknown defect cannot become QA pass. | sd-definition |
| Product consolidation, ID migration and safe lifecycle mechanics | later_sd | deferred | Preserve current capabilities, host policy and shared references through existing owner; no new independent setup or registry. | sd-definition |
| Effective-host readback, redaction and session freshness mechanism | later_sd | deferred | Distinguish declared/observed/unavailable with safe bounded projection and existing ownership. | sd-definition |
| Workload, regression/stress and installed/native evidence matrix | later_tp | deferred | Bind exact baseline/candidate, defined measurement limits, affected guards, ownership/abort/refusal/replay and observed host lanes. | Task/Test Plan owner |

## 11. Next Step

Present this exact PRD with its resolved product policy and explicit downstream design/planning obligations. New Approval: PRD permits Solution Design only. Production code, host mutation and installation of a corrected candidate wait for approved SD/TP and implementation-preparation evidence.

## AGDF Approval Summary (de; source=en)

- Ziel: Start- und Timeout-Ursachen dauerhaft beheben und einen kohärenten Codex-Produktbetrieb schaffen. AGDF ist der reguläre Einstieg; separates AGDF Cockpit nur technisch begründet. Herkunft, Hostrechte, Transaktionen und ursprüngliche UUID bleiben erhalten.
- Umfang: Ursachenanalyse und dauerhafte Korrektur, klare Produkt-/Testrollen, bestehender Lifecycle für Plugin-/Projekt-/Benutzereinträge sowie abgeleitete Host-Zustandsnachweise. Diagnoseeinsatz und Cleanup sind bewusst und besitzgebunden. Finalen installierten Kandidaten tatsächlich prüfen.
- AC-001: Beide Startfehler und dispatch_timeout erhalten belegte Ursachen oder konkrete Gegenbeweise; unaufgeklärte erforderliche Fehler bleiben Lücken.
- AC-002: Bestätigte Defekte werden im bestehenden Produktionsowner behoben; dieselbe Regression versagt vorher und besteht danach.
- AC-003: Kalt-/Warmstart und wiederholte Einzel-/Mehrclient-Aufrufe halten vor Umsetzung festgelegte Messgrenzen ein; keine unbegründete Deadline-Erhöhung.
- AC-004: Herkunfts-/Claim-Prüfung, begrenzter Abbruch und Transaktionen bleiben erhalten; unklare Wirkung verlangt ursprüngliche UUID und Belegprüfung ohne zweite Änderung.
- AC-005: Fehler zeigen eine sichere Phase/Ursache und einen erlaubten nächsten Schritt; keine Geheimnisse oder erfundenen Ursachen.
- AC-006: Der unterstützt installierte finale Kandidat entspricht der eingefrorenen Quelle und besteht tatsächliche positive, negative, Stress- und Belegwiederholungsfälle.
- AC-007: Betroffene Tests, normaler Build und bestehende Budgets bestehen; Reviews, alleinige QA, neue QA/UAT-Freigaben und OR bleiben exakt gebunden.
- AC-008: AGDF ist der reguläre Einstieg; separates AGDF Cockpit nur begründet. Steuerung, Lesen und Cockpit-Öffnen bleiben erhalten; keine doppelte Produktregistrierung.
- AC-009: Diagnoseeinsatz ist bewusst, ausdrücklich als Test benannt und besitzgebunden. Abschluss, Abbruch und wiederholter Cleanup erhalten fremde und gemeinsam genutzte Zustände.
- AC-010: Produkt allein, mehrere Produktclients und Diagnoseaufbauten werden getrennt geprüft; Host-Start-, Host-Tool- und Workerlimit sowie Erzeuger bleiben unterscheidbar.
- AC-011: Eine abgeleitete Sicht zeigt Herkunft, Scope, Rolle, Owner und Laufzeit sowie getrennte Konfigurations-/Start-/Discovery-/App-Nachweise; unbekannte wirksame Werte bleiben unbekannt.
- AC-012: Bestehende Einrichtung, Update, Deaktivierung, Reaktivierung, Migration und Entfernung sind wiederholbar sicher; Konflikte, Teilfehler und gemeinsame Referenzen führen nicht zu Datenverlust oder Scope-Ausweitung.
- AC-013: Serververbindung und UI-Ressourcen beweisen keine App-Darstellung. Native Aussagen verlangen frische direkte Nachweise; Text-/Dokumentfallback erhält die Entscheidungsbindung.
- AC-014: Registrierung entfernen, Sitzung beenden und Host-App-Daten löschen sind getrennte Wirkungen. Alte Sitzungen bleiben sichtbar; kein automatischer Neustart oder gemeinsamer Cache-Purge.
- Entscheidungen: Produktrollen, Host-/AGDF-Zuständigkeit, gezielter Test-Cleanup und begrenzte Nachweis-/Releasewirkung sind aus der freigegebenen UR geklärt. SD entscheidet Ursachen-/Ausführungsdesign, sichere Zusammenführung/Migration und wirksame Hostbeobachtung; TP legt Messgrenzen und konkrete Test-/Nachweismatrix fest. Kein ungeklärter erforderlicher Defekt wird als bestanden behandelt.
- Grenzen und Risiken: Ursachen noch nicht nachgewiesen; mehrere Clients beweisen kein Leck. Cleanup braucht exakte Ownership. Wirksame Hostwerte und laufende alte Sitzungen können von Dateien abweichen. Keine zweite Registry, schwächere Schutzprüfung, breitere Rechte, automatische Neustarts, pauschale Löschung, gemeinsame App-Datenbereinigung oder Git-/Veröffentlichung.
- Nachweise: Brownfield Review und erforderliche UX-Analyse sind erfasst; der neue Fix ist noch nicht umgesetzt. Quellen-/Paket-/installierte Tests und native App-Nachweise bleiben getrennte spätere Belege.
- Nächster Schritt: Approval: PRD erlaubt die Solution Design für diese Fassung; Implementation und Hostbereinigung bleiben bis SD/TP und Vorbereitung gesperrt.
