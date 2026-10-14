# PRD: Reliable compact execution continuation

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-14
Owner: Arndt Gold
Run: compact-execution-continuation-20261014-01
Traceability contract: criteria-chain-v1

## 1. Product Scope

Repair the transition from a canonically permitted compact execution state to actual agent work. In a bound active delivery request, Quick Task Execution and eligible Verified Change must yield an executable continuation instead of ending merely because the route is compact. The agent continues the approved work, its checks, evidence, required review and existing compact completion obligations until a genuine decision, concrete blocker or completed outcome.

The approved UR is the sole product source. BROWNFIELD_REVIEW.md supplies existing ownership and the structured_delivery route for this framework repair. Its executed installed-code baseline reproduces both terminal compact outcomes at disposable unit seams; it does not establish live repository eligibility or native-host behavior.

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: Directly defined low-impact restoration of permitted agent continuation; Brownfield Review marks a separate UX analysis not applicable because approval choices and product scope remain unchanged.
- primary_user_intent: Have the coding agent perform the explicitly requested compact work without repeatedly managing its internal handoffs.
- success_signal: Valid compact scenarios require zero additional continuation prompts solely to start already permitted implementation; genuine decisions and blockers remain visible.
- primary_decision_or_action: The user supplies existing required approvals or material decisions; the agent performs already permitted internal work and presents reviewable results.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Active Quick Task | Approved UR and completed valid routing permit bounded compact work; current applicable evidence determines unfinished obligations | Brief work progress, reviewable compact result, concrete blocker or genuine decision | Existing Core compact policy and canonical Run/evidence | Existing interaction renderer and coding-agent progress discipline |
| Verified Change preparation | Missing/draft record remains preparation; invalid/unproven scope cannot execute | Preparation progress or specific eligibility blocker/escalation | Existing Verified Change evaluator and canonical recording | Existing interaction renderer |
| Eligible Verified Change | Current validated record permits only declared source/derived paths and deterministic checks | Work progress, validation result or changed-baseline/scope blocker | Existing Core evaluator and current canonical record | Existing interaction renderer and coding-agent progress discipline |
| Read-only status | Current state is observed; no execution starts | Canonical localized status | Existing read-only evaluator | Existing interaction renderer |
| Completed compact Run | Completion is evidenced; no repeated work is due | Truthful completed status and any explicitly requested permitted handoff | Existing compact completion policy/writer | Existing interaction renderer |
| Structured delivery | Existing approved-TP continuation remains applicable | Existing progress, review, QA/UAT decisions and closeout | Existing structured Core policy | Existing interaction renderer |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Existing Request Activation and exact target/Run bindings remain authoritative. A read-only request never becomes active delivery. A compact classification alone is not permission; current canonical prerequisites must be satisfied.
- blockers_and_visible_next_actions: Missing approval, incompatible runtime, invalid integrity, changed scope/baseline, foreign/stale binding or missing eligibility evidence stops dependent execution with its actual reason and permitted recovery owner. A required decision remains a deliberate human response.
- recovery_paths: After interruption or a recoverable invocation/recording failure, revalidate current binding and evidence through existing owners. Offer the existing supported retry when appropriate; unchanged failure stops rather than looping. Resume only still-unfulfilled permitted work. No persistent secondary execution/retry store is introduced.
- relevant_state_transitions: An approved bound Quick Task becomes agent execution; Verified Change preparation becomes eligible execution only after canonical eligibility; observed results enter existing review/evidence/closeout; completed Runs become terminal status. A change invalidating eligibility returns to its current blocker or declared structured escalation. A read-only query remains terminal status.

## 5. Acceptance Criteria

- criterion_id: AC-001
  - working_mode: Active Quick Task
  - source_state: Canonical active Quick Task Execution with approved UR, completed valid Brownfield routing and current required integrity/source checks.
  - trigger: Explicitly requested bound delivery continuation.
  - expected_effective_state: Executable handoff for only the approved compact scope; no artificial user decision is inserted before implementation.
  - visible_feedback: Truthful brief agent progress, then a reviewable result or the actual decision/blocker.
  - blocker_failure_behavior: Missing prerequisites keep implementation stopped.
  - recovery_next_action: Existing owner resolves the specific missing prerequisite; revalidate this same Run before continuing.
  - observable_success: The agent starts permitted work without an extra continuation prompt; checks, evidence, mandatory review and compact closeout remain required.
  - required_evidence: Before/after dispatcher cases plus disposable complete-flow execution through the supported installed runtime.

- criterion_id: AC-002
  - working_mode: Verified Change preparation and eligible execution
  - source_state: A missing/draft, eligible, invalid/unproven or escalated compact record in the selected active Run.
  - trigger: Bound delivery continuation after fresh canonical record evaluation.
  - expected_effective_state: Missing/draft remains preparation; eligible supplies bounded implementation; invalid/unproven never enters that handoff; escalated uses the declared structured path.
  - visible_feedback: Preparation/work progress or the exact eligibility/escalation outcome.
  - blocker_failure_behavior: Missing Git/baseline, dirty candidate, changed scope, unsupported impact or unavailable required evidence remains a blocker or existing escalation.
  - recovery_next_action: Correct the record or use its declared structured owner; re-evaluate before execution.
  - observable_success: Only freshly eligible records execute declared paths and commands; preparation alone performs no implementation.
  - required_evidence: Positive eligible fixture and negative preparation, baseline, scope and escalation cases, including the installed path and supported-access limitations.

- criterion_id: AC-003
  - working_mode: All compact routes and read-only status
  - source_state: Read-only request or missing/stale/foreign approval/binding, ambiguous Run/target, invalid integrity or incompatible runtime.
  - trigger: Status inspection, dispatch, interrupted resumption or attempted continuation.
  - expected_effective_state: No compact execution handoff unless the exact current canonical state permits it; status remains read-only.
  - visible_feedback: Canonical localized status, deliberate decision or concrete blocker with its existing recovery.
  - blocker_failure_behavior: No Run substitution, authority inferred from progress, automatic approval or bypass of an unrelated blocker.
  - recovery_next_action: Existing clarification, approval, revision or runtime-repair boundary as applicable.
  - observable_success: Refusal scenarios create no execution and no unauthorized control changes.
  - required_evidence: Boundary matrix across source and installed invocation with before/after Run bytes where applicable.

- criterion_id: AC-004
  - working_mode: In-progress and completed compact work
  - source_state: Current permitted compact work with partial evidence, recorded review or evidenced completed lifecycle.
  - trigger: Evidence recording, interrupted re-entry, repeated continuation or closeout.
  - expected_effective_state: Existing canonical writers retain current revision/source/evidence binding; applicable recorded obligations are preserved and the next unfinished permitted obligation is followed. A completed Run does not yield execution.
  - visible_feedback: Reviewable result, remaining obligation/blocker or truthful completed status.
  - blocker_failure_behavior: Stale/conflicting evidence does not prove completion or allow replay; interrupted unconfirmed work requires revalidation.
  - recovery_next_action: Inspect current facts and use existing recording/recovery owners; do not claim durable exactly-once implementation.
  - observable_success: Completed outcomes and already fulfilled applicable checkpoints are not repeated; required review/closeout still executes. No implicit commit, push, PR or release is triggered.
  - required_evidence: Partial-work, review, stale-revision, completed-run and repeated-invocation scenarios with canonical receipts/evidence.

- criterion_id: AC-005
  - working_mode: Structured delivery, existing Verified Change preparation and all affected presentations
  - source_state: Existing approved-TP implementation or compact preparation/status/decision states.
  - trigger: Existing continuation and presentation calls after the repair.
  - expected_effective_state: Structured implementation and existing compact preparation keep their scope/approval behavior; no new skill, gate or parallel permission policy is created.
  - visible_feedback: Executing outcomes communicate agent work; terminal outcomes communicate a stop or decision accurately, in every registered language.
  - blocker_failure_behavior: Failed presentation remains explicit; no promise of autonomous work accompanies a terminal stop.
  - recovery_next_action: Existing contract/locale owner provides the supported correction.
  - observable_success: Existing structured/preparation regressions pass and changed localized output matches actual outcomes.
  - required_evidence: Affected existing regression suites plus every registered affected locale/card/state render.

- criterion_id: AC-006
  - working_mode: Local Codex installed-plugin qualification
  - source_state: Reviewed source/package candidate and separately identified current installation/running runtime.
  - trigger: Supported local Codex install followed by bound disposable verification scenarios.
  - expected_effective_state: Installed contents and launched runtime match the candidate build/digests; both compact handoffs and refusal boundaries are tested through available supported interfaces.
  - visible_feedback: Concise exact-build results distinguishing source, package, installed CLI/MCP and native host evidence.
  - blocker_failure_behavior: Stale running generation, unavailable host/required Git access or failed installation is reported concretely; no success is inferred from source tests or an older runtime.
  - recovery_next_action: Prepare the exact qualification sequence and candidate before any necessary supported reconnect/restart action; preserve valid evidence and mark outstanding native observations.
  - observable_success: Installed CLI demonstrates both eligible routes; actual installed MCP demonstrates supported continuation/refusal behavior, retaining a concrete evidence limitation where eligibility requires access that the MCP boundary forbids. Native/model observations are claimed only if actually performed.
  - required_evidence: Supported installer report, observed build and content digests, actual installed-launcher CLI/STDIO exchanges, scenario outcomes and any remaining native-host limitation.

## 6. Non-Goals

No gate/approval/eligibility relaxation, new execution authority, second state store, foreign-run repair, automatic global host restart, public release, Git publication or duplicate Delivery Map optimization. The framework repair has structured depth; the repaired workloads retain their compact modes.

## 7. Users And Roles

- Arndt Gold owns the product requirement and deliberate gate decisions.
- The coding agent performs approved preparation, implementation, checks and recording.
- Existing Core owners determine effective eligibility, state and permitted operations.
- Existing review/QA owners assess implementation and evidence; this PRD grants no QA/UAT result.

## 8. Constraints

Preserve approved UR and all unrelated control bytes. Keep one canonical criteria chain and policy authority. Existing exact gate, target, Run, revision, presentation and evidence bindings remain enforceable. Shared CLI/MCP behavior must respect each transport's actual access boundary. Installation uses the supported local Codex installer with the new content-derived build; source and native evidence remain separate.

## 9. Evidence Requirements

Retain the baseline reproduction and its explicit unit-seam limitations. Later tests cover policy, dispatcher, canonical compact execution/review/closeout and refusals. Package and installer checks identify actual contents. Installed invocation evidence uses the updated installation, disposable targets and the supported launcher rather than calling a source-only candidate an installed fix. Keep runtime/host observations tied to exact build and interfaces; no unobserved platform claims.

## 10. Risks And Open Questions

The compact Run can stay at one execution gate while work, review and closeout obligations progress. SD must preserve canonical evidence applicability and avoid deriving permission from arbitrary status prose. Verified Change access/eligibility must remain strict where an invocation boundary cannot observe Git. TP must provide safe disposable complete-flow and installed-launcher scenarios. A restored host connection may retain an older immutable runtime; any needed reconnect must be scoped to qualification. These are owned design/planning questions, not unresolved product scope.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Repair both compact implementation handoffs | before_prd | resolved | Approved UR requires Quick Task Execution and eligible Verified Change continuation without redundant user prompts. | Arndt Gold |
| Preserve authority, compact obligations and scope exclusions | before_prd | resolved | Existing exact approvals/eligibility/recording/review/closeout stay binding; duplicate-map optimization, foreign Runs and public/Git release remain excluded. | Arndt Gold |
| Installed evidence acceptance | before_prd | resolved | Approved UR requires the newly installed Codex build and supported CLI/MCP outcomes, with any unobserved native-host behavior expressly identified. | Arndt Gold |
| Handoff structure and in-progress evidence selection | later_sd | deferred | Use existing Core owners; determine the smallest handoff and re-entry design preserving applicable obligations. | Codex SD author |
| Installed transport and interrupted-flow scenario plan | later_tp | deferred | Define disposable scenarios and actual-access qualification for the exact updated build; unavailable observations remain explicit. | Codex TP author |

## 11. Next Step

Present this revision for a new deliberate `Approval: PRD`. Approval permits bound Solution Design only. Implementation remains disallowed until the approved Task Plan and applicable internal prerequisites permit it.

## AGDF Approval Summary (de; source=en)

- Ziel: Bereits erlaubte Quick Tasks und geeignete Verified Changes ohne zusätzlichen Weiterarbeits-Prompt ausführen und ihre bestehenden Prüf-, Nachweis-, Review- und Abschlussverpflichtungen erfüllen.
- Umfang: Beide kompakten Ausführungsübergänge über bestehende Core-Owner reparieren, tatsächliche Entscheidungen und Blockaden erhalten, fertige Runs vor Wiederholung schützen und den neuen lokalen Codex-Build über den unterstützten Installer prüfen.
- Entscheidungen: Der Umfang und alle Autoritätsgrenzen stammen aus der freigegebenen UR. Vorbereitung darf keine Umsetzung auslösen. Quell-, Paket-, installierte CLI-/MCP- und native Hostnachweise werden getrennt ausgewiesen; unbeobachtetes natives Verhalten bleibt ausdrücklich offen. Die Reparatur selbst verwendet den strukturierten Lieferweg, die betroffenen Aufgaben bleiben kompakt.
- AC-001: Ein gültiger gebundener Quick Task erhält einen ausführbaren Auftrag ohne weiteren Nutzerprompt. Umfang, Prüfungen, Nachweise, erforderliches Review und kompakter Abschluss bleiben verbindlich.
- AC-002: Verified-Change-Vorbereitung bleibt Vorbereitung. Nur aktuell geeignete Nachweise erlauben Ausführung der deklarierten Dateien und Prüfungen; unbewiesene oder ungültige Zustände blockieren, eskalierte folgen ihrem bestehenden strukturierten Weg.
- AC-003: Statusfragen, fehlende oder veraltete Freigaben, unklare oder fremde Bindungen, beschädigte Kontrolle und inkompatible Laufzeit starten keine kompakte Umsetzung. Die konkrete vorhandene Klärungs- oder Reparaturgrenze bleibt sichtbar.
- AC-004: Kanonische Writer erhalten aktuelle Revisions-, Quellen- und Nachweisbindung. Wiederaufnahme betrifft nur noch offene erlaubte Verpflichtungen. Erledigte Runs führen keine Arbeit erneut aus; ungeklärte Unterbrechungen werden neu geprüft. Keine implizite Git- oder Release-Aktion.
- AC-005: Strukturierte Umsetzung und vorhandene Verified-Change-Vorbereitung behalten ihr Verhalten. Ausführungs- und Stoppausgaben sind wahrheitsgemäß; betroffene Darstellungen werden in allen registrierten Sprachen geprüft.
- AC-006: Der tatsächlich neu installierte Codex-Build und seine gestartete Runtime werden identifiziert. Installierte CLI prüft beide geeigneten Wege; tatsächliches installiertes MCP prüft die dort unterstützten Fortsetzungen und Ablehnungen. Fehlender notwendiger Git-Zugriff oder nicht beobachtetes natives Hostverhalten bleibt ein konkreter Nachweisvorbehalt.
- Abgrenzung: Keine Änderung von Gate-Freigaben, Eignung oder Autorität; keine fremden Runs, zweite Zustandsquelle, Delivery-Map-Optimierung, automatische globale Host-Neustarts, Veröffentlichung, Commit, Push oder PR.
- Risiken: SD legt den kleinsten sicheren Übergabe- und Wiederaufnahmeweg fest; TP plant unterbrochene, fertige und abgelehnte Zustände sowie die konkrete Prüfung des installierten Builds. Alte laufende Generationen dürfen nicht als Nachweis der neuen Fassung gelten.
- Nächster Schritt: PRD-Freigabe erlaubt Solution Design; Umsetzung benötigt weiterhin die dafür gültigen Freigaben und internen Voraussetzungen.
