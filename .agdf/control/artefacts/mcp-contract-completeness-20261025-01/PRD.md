# PRD: Complete existing MCP contracts with compatible capability errors

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-25
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver one coherent improvement to the existing local AGDF MCP interface. Clients and coding agents must understand the five existing command tools from discovery and existing operation help, receive AGDF results with usable declared schemas, and distinguish a required missing client capability from an invalid request or a domain rejection. Published capability and version information must agree with actual supported behavior.

The five tools remain agdf_prepare, agdf_record, agdf_approve, agdf_revise and agdf_closeout, with the same command groups and effects. A command still requires exact target, Run, revision and operation identity. Capability checks, descriptions and schemas provide neither permission nor evidence of a human decision.

The approved UR is the product source. The completed Brownfield Review selects structured_delivery for an external_contract_depth impact and identifies the existing ownership and compatibility boundaries. This PRD adds no tool, effect, permission, deployment or host-support promise.

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: directly defined low-impact semantics from the approved UR and Brownfield Review; existing actions, roles, activation and recovery meanings remain unchanged, with no requested preview.
- primary_user_intent: An agent can identify the right existing command, obtain authoritative bindings, submit a valid request and accurately explain its result or supported correction to the user.
- success_signal: Discovery and help explain all exposed command arguments; declared results are checked; actual STDIO exchanges distinguish missing capability, malformed metadata, tool failure and success; a focused native task demonstrates use without an AGDF CLI detour or manually injected missing technical arguments.
- primary_decision_or_action: Select and execute an already-supported operation or correct its missing prerequisite. Only the human's deliberate response decides a gate; an execution permission or schema match does not.

No visual preview is required. The review basis is the behavior and acceptance defined here. UI-capable hosts retain the existing App resource and delivery path; non-UI clients retain the existing text behavior wherever the operation does not require UI.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Discover existing command | Supported tool definition and detailed operation contract | Meaning, applicability, authoritative binding source and expected result | Existing Core command contract | MCP tool discovery and existing operation-contract help |
| Execute supported command | Accepted, already applied, rejected, recovery required or effect unknown | Existing public outcome, reason, receipt/binding where available, correction and effect limits | Existing Core command/family owner | Existing MCP domain result and bounded guidance |
| Modern request requires undeclared UI capability | Protected operation not executed | Protocol error -32021 and data.requiredCapabilities | MCP capability contract and request's declared capabilities | Existing JSON-RPC error channel |
| Legacy request lacks UI support | Existing legacy denial or supported text behavior | Existing 2025-11-25 result/error behavior | Existing legacy protocol and Core capability checks | Existing legacy MCP response |
| Uncertain dispatched operation | Effect remains unconfirmed until observed by its owner | Original operation UUID, effect limit and status/recovery guidance | Existing operation/receipt owner | Existing operation-status read and bounded MCP guidance |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Existing host configuration, tool visibility and enabled command groups continue to determine availability. Request-local capability declarations apply to that request; no capability is inferred from a prior unrelated request or from a host name. This scope adds no automatic activation, install or network operation.
- blockers_and_visible_next_actions: Malformed mandatory modern metadata remains an invalid request with -32602. A syntactically valid request needing an undeclared capability is rejected with -32021 and the required capability information. Unknown tools and SDK input validation keep their existing protocol/tool distinctions. Stale or foreign target, revision, presentation or source values remain domain rejections with supported correction guidance.
- recovery_paths: A missing capability requires a client that actually supports and declares it, not a forged value or a blind retry. Valid input errors may be corrected from the advertised help and current authoritative bindings. A pre-dispatch rejection may be retried after its prerequisite changes. Timeout, cancellation after handoff or lost delivery never proves rollback; retain the original UUID and exact payload and use operation-status/recovery through its current owner.
- relevant_state_transitions: Discovery changes no governance state. A denied capability request performs no protected operation. A valid command follows its existing Core transition once; replay retains the original identity and receipt semantics. Invalid producer output becomes a bounded failure rather than success and cannot cause another command execution. Existing App/text delivery and deliberate approval transitions remain intact.

## 5. Acceptance Criteria

- criterion_id: AC-001
  - working_mode: modern required-capability denial
  - source_state: Valid 2026-07-28 metadata without the UI capability required by the requested operation.
  - action: Invoke each affected UI-dependent tool/resource route through actual STDIO.
  - expected_effective_state: No protected operation executes; JSON-RPC error code is -32021 and data.requiredCapabilities accurately identifies the missing capability.
  - visible_feedback: A protocol error, not an AGDF domain rejection or an isError-only substitute, with the required capability data.
  - blocker_failure_behavior: Malformed mandatory metadata remains distinguishable as -32602; supported capability declarations do not enter the denial branch.
  - recovery_next_action: Use a supporting client with truthful request-local capability declaration; no approval or implicit capability is inferred.
  - observable_success: Both tool and resource exchanges have the correct wire-level error and zero protected executions.
  - evidence: Actual SDK STDIO request/response assertions for missing, invalid and supported capability states, with a protected-execution counter or equivalent effect proof.

- criterion_id: AC-002
  - working_mode: supported modern and legacy caller compatibility
  - source_state: Existing valid requests under 2025-11-25 and 2026-07-28, including UI-capable and non-UI clients.
  - action: Discover and invoke the existing tools and resources with their supported arguments.
  - expected_effective_state: Existing tool names, command kinds, valid inputs, domain outcome meanings, public result fields, configured visibility and App/text delivery remain supported. Modern capability correction is confined to its specified condition; legacy denial retains its existing behavior.
  - visible_feedback: Existing successful results, SDK input errors, unknown-tool errors and legacy denial stay in their proper existing channels.
  - blocker_failure_behavior: Invalid or unsupported requests remain rejected. Capability declaration alone never authorizes a command or enables an unqualified decision action.
  - recovery_next_action: Use existing truthful capability and binding correction; no shell workaround or new tool name is required.
  - observable_success: Both protocol eras pass affected positive and negative scenarios without changed domain effects or suppressed validation.
  - evidence: Actual STDIO compatibility matrix and relevant decision/cockpit, package and generation regressions.

- criterion_id: AC-003
  - working_mode: command discovery and request preparation
  - source_state: Agent/client has ordinary task context and the server's advertised interface, without manually injected missing technical arguments.
  - action: Discover each of the five command tools and consult its existing detailed operation contract as needed.
  - expected_effective_state: Every exposed top-level field and supported command payload is meaningfully described. Help states purpose, applicability and authoritative source/reuse for target, Run, revision, presentation, source digest and operation identifiers; cooperative_local is explained as assurance, not authorization. Input schema, examples, help and validation agree.
  - visible_feedback: Descriptions guide a caller to current binding values and exact original-operation reuse rather than guessing IDs, taking recency as authority or blindly retrying a write.
  - blocker_failure_behavior: Unknown/malformed/stale combinations remain rejected through existing checks; documentation must not broaden accepted effects.
  - recovery_next_action: Read the existing appropriate contract/status, correct the identified prerequisite and retain the exact original UUID/payload when required.
  - observable_success: All five discovered definitions contain the required help, and representative examples conform to their corresponding supported runtime contract.
  - evidence: Actual tools/list assertions, contract/example validation and the native task evidence in AC-008.

- criterion_id: AC-004
  - working_mode: consume command result or malformed producer output
  - source_state: Any supported AGDF command outcome, including fallback, uncertainty and postprocessed presentation results.
  - action: Execute and consume a result from each of the five tools; exercise malformed producer and delivery-boundary cases.
  - expected_effective_state: All five advertise valid compact outputSchema declarations for their supported AGDF results. AGDF successful and failed results are checked against the appropriate existing result contract, including isError paths skipped by the SDK. Valid existing response variants remain representable; invalid output cannot become success.
  - visible_feedback: Preserve structured domain results, public fields, actionable bounded guidance, receipts/bindings where actually available and honest known/unknown effect state.
  - blocker_failure_behavior: SDK-owned input/protocol errors retain their own behavior and are not forced into a fabricated domain envelope. Schema/check failure after dispatch never proves rollback or triggers another execution.
  - recovery_next_action: Use existing failure and original-operation observation rules; no new effect or decision authority is introduced.
  - observable_success: Positive and negative outcomes from every family and adapter fallback conform, while malformed results are rejected without replaying a command.
  - evidence: Client-side schema checks plus server-side negative-result assertions, boundary fault injection and single-execution/effect-uncertainty checks.

- criterion_id: AC-005
  - working_mode: inspect capability and distribution information
  - source_state: Current source manifests, generated/package metadata and installation-facing MCP statements.
  - action: Inspect the read-only claim for agdf_dispatch and current-version statements relevant to MCP distribution.
  - expected_effective_state: Claims agree with the canonical command behavior and current package/version source; historical release statements remain clearly historical.
  - visible_feedback: The bounded continuation write is accurately described; version alone is not presented as complete payload identity or host qualification.
  - blocker_failure_behavior: Mechanically testable renewed disagreement fails the relevant existing check instead of being silently published.
  - recovery_next_action: Correct the authoritative source and regenerate through the existing owner; do not maintain a parallel metadata registry.
  - observable_success: Capability hints, manifest and relevant documentation have no current-behavior contradiction, and targeted checks catch deliberately inconsistent fixtures.
  - evidence: Focused contract/documentation/build assertions and review of the generated/package projection.

- criterion_id: AC-006
  - working_mode: execute or recover an existing governance command
  - source_state: Valid, stale, foreign, replayed or uncertain command binding with existing cooperative authority.
  - action: Run the affected command and error paths.
  - expected_effective_state: Existing target, Run, revision, source, immutable presentation, human-decision and original-operation checks remain effective. Discovery, schemas, permission and App availability alone never approve a gate. No writer, generic shell/network operation or broader effect is introduced.
  - visible_feedback: Known non-execution and uncertain dispatched effects remain distinguishable; original operation and current state are reported honestly.
  - blocker_failure_behavior: Stale/foreign/disabled/unqualified requests stay denied; failed or unconfirmed worker termination retains protected capacity/lock behavior.
  - recovery_next_action: Existing bound status/recovery or a new deliberate human decision where actually needed; no substitute UUID or approval transfer.
  - observable_success: Relevant Core, error, generation, shutdown, lock and safety regressions pass without weakened assertions or changed authority.
  - evidence: Existing targeted suites and additional scenarios required by the approved design, against the exact assembled candidate.

- criterion_id: AC-007
  - requirement: Existing definition, response and fixed-fixture performance limits remain satisfied for ordinary and decision-enabled compositions. Record per-tool and aggregate definition bytes, response limits and the existing 20-sample cold/warm p95 measurements with candidate, Node, OS and fixture identity. Do not raise or remove thresholds, omit tests or claim native agent latency from this synthetic measurement.
  - observable_success: Current budgets pass, generated/package contracts pass, and measurements preserve their actual environment and qualification limits.
  - evidence: Existing definition-budget assertions, package/generated checks and unchanged fixed-fixture performance test; any failure remains visible until resolved or governed at its proper owner.

- criterion_id: AC-008
  - working_mode: native agent uses a command contract
  - source_state: Disposable bound task fixture and exact candidate; no manually supplied missing technical command arguments or access to live governance decisions.
  - action: A real agent discovers the interface and completes a focused existing command task through MCP, using supported contract/binding reads and any required correction.
  - expected_effective_state: The deterministic verifier confirms the intended fixture result and preserved safety constraints; the agent uses no AGDF CLI workaround and invents no authority or binding.
  - visible_feedback: Report task success/failure, invalid-argument calls, total calls, response/token measurements and exact host/model/candidate provenance; retain failed attempts.
  - blocker_failure_behavior: Unavailable native evidence remains an open acceptance obligation. Scripted protocol success cannot replace it, and a different host/environment cannot be claimed as a directly comparable historical improvement.
  - recovery_next_action: Follow the TP-bound evidence plan and its cost/availability boundary; never rerun, install, alter credentials or broaden spending silently after a failure.
  - observable_success: The bounded native scenario completes with a checked transcript and fixture outcome under its predeclared task, repetition and stopping rules.
  - evidence: Existing MCP ergonomics infrastructure with a focused task/verifier extension where needed; exact execution configuration, transcript, deterministic verifier and metrics.

## 6. Non-Goals

No tool splitting/renaming or regrouping, new command effects, new human-origin authentication, approval bypass, remote transport/OAuth, OS sandbox, general performance redesign, UI preview/redesign, installation, release or VCS actions. No changes to the predecessor inspection Run or its UAT; no rewriting completed error-contract or historical baseline evidence. Focused acceptance does not establish complete MCP conformance or cross-host support.

## 7. Users And Roles

The coding agent selects existing operations and conveys results. The MCP client discovers definitions and handles their appropriate result/error channels. Existing Core owners decide state and eligibility. The human retains deliberate gate decisions. Maintainers own consistent source/generated distribution and evidence interpretation. Arndt Gold is the PRD owner; authoring and technical verification create no approval.

## 8. Constraints

- Preserve supported valid callers, current public domain fields, command effects and both protocol eras; distinguish the intended modern error correction from unrelated behavior changes.
- Use existing Core and projection owners rather than an additional registry, dispatcher, SDK fork, result policy or independent validation authority. Detailed mechanism and schema representation belong to SD.
- Keep agdf-tool-result/1, producing-generation ownership, exact original UUID/payload recovery, output sanitization and existing limits effective.
- New output schemas are a requested product improvement; MCP does not mandate outputSchema for every tool. Once advertised, supported structured results must conform.
- Additional host installation, credentials, external paid API use, production-state changes or publication require their own authority; this PRD grants none.

## 9. Evidence Requirements

QA must map all eight criteria to the approved SD and TP and their actual candidate-bound evidence. Protocol proof must exercise real STDIO for both eras rather than only direct function calls. Domain/adapter coverage must include normal and minimal negative envelopes, oversized-result and executor fallback, uncertain effects, decision postprocessing and producing-generation delivery where applicable.

Use existing package, safety, provenance, generation and fixed-fixture performance owners. Reuse the historical ergonomics baseline without overwriting it. Native evidence is required for the focused agent task and must name exact host/model/version, OS, candidate digests, task/verifier version, repetitions, metrics, failed attempts and stopping reason. A supported synthetic fixture outcome is not a real human approval, production rollout or general success-rate claim.

The implementation path is rechecked through implementation-preparation Brownfield Analysis after TP approval. Semantic source derivation and independent review remain separate from authoring-check success or cooperative recording attestation.

## 10. Risks And Open Questions

The SDK converts high-level tool-handler exceptions to isError and skips outputSchema checking on errors. SD must choose a supported seam preserving existing validation and encoding, not merely throw another exception. Legitimate domain, fallback and postprocessed result shapes must be represented without making invalid success acceptable. Definition growth must fit existing limits; detail placement and factoring are SD decisions.

TP must bind the available native host/model and exact task/verifier/repetitions before execution. If the required native evidence cannot be obtained within existing authorization, it remains open; there is no automatic paid fallback or substitute conformance claim. No material product/acceptance decision remains unanswered; the specific technical and execution decisions below remain with SD and TP.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Scope and compatibility boundary | before_prd | resolved | Existing five tools, effects and authority remain; correct only the specified modern capability condition, complete contracts and reconcile metadata; preserve valid legacy behavior and the predecessor Run | Arndt Gold, approved UR |
| Result contract and error acceptance | before_prd | resolved | Accurate advertised AGDF schemas and server-side checking include negative/fallback results; preserve existing public fields, effects and SDK-owned protocol/input errors; invalid output cannot cause success or replay | Arndt Gold, approved UR |
| Qualification and release scope | before_prd | resolved | Real STDIO plus focused native agent evidence are required; local synthetic tests do not establish complete conformance, host support, production rollout or human-origin proof; no release/install/VCS scope | Arndt Gold, approved UR |
| SDK capability seam and compact schema/help projection | later_sd | deferred | Select supported existing boundary before high-level exception conversion; preserve validators/codec and Core ownership, covering all legitimate result variants within current budgets | Codex sd-definition |
| Native execution and verifier plan | later_tp | deferred | Bind exact candidate, available host/model, task, repetitions and stopping/cost rules before execution; use existing authorization only, leave unavailable evidence open and obtain explicit additional authority if required | Codex tp-definition |

## 11. Next Step

Review this PRD and approve only with:

`Approval: PRD`

Approval confirms this behavior, scope and acceptance and permits Solution Design preparation. It does not approve implementation, technical design, native execution configuration, publication or any other gate.

## AGDF Approval Summary (de; source=en)

- Ziel: Bestehende MCP-Befehle sind verständlich beschrieben, ihre Ergebnisse überprüfbar und fehlende benötigte Capabilities korrekt erkennbar. Core und Mensch behalten ihre bisherigen Zuständigkeiten.
- Umfang: Die fünf vorhandenen Schreibwerkzeuge, moderne Capability-Fehler, Legacy-Kompatibilität, konsistente Metadaten und begrenzte Protokoll-, Sicherheits-, Paket-, Leistungs- und Agentennachweise. Keine neue Werkzeugaufteilung, Rechteausweitung, UI-Vorschau, Installation, Veröffentlichung oder Änderung der offenen Inspect-UAT.
- AC-001: Unter 2026-07-28 liefern betroffene UI-Aufrufe bei fehlender benötigter Capability den Protokollfehler -32021 samt requiredCapabilities, ohne geschützte Ausführung. Fehlerhafte Pflichtmetadaten bleiben -32602.
- AC-002: Gültige moderne und Legacy-Aufrufe, bisherige Befehle, Felder, Ergebnisbedeutungen und App-/Textwege bleiben unterstützt; SDK-Fehler und Legacy-Abweisungen behalten ihre jeweiligen Grenzen.
- AC-003: Alle fünf Werkzeuge erklären ihre Eingabefelder und unterstützten Payloads einschließlich Herkunft und Wiederverwendung der Bindungen. Discovery, Beispiele, Detailhilfe und Validierung stimmen überein.
- AC-004: Alle fünf Werkzeuge veröffentlichen gültige kompakte Ausgabeschemas. Auch negative und minimale Adapter-/Fallback-Ergebnisse bleiben geprüft; ungültige Ergebnisse werden kein Erfolg und lösen keine Wiederholung aus.
- AC-005: Read-only-Metadaten und aktuelle Versionsaussagen stimmen mit den maßgeblichen Quellen überein. Gezielte bestehende Prüfungen erkennen erneute Widersprüche.
- AC-006: Ziel-, Run-, Revisions-, Quellen-, Präsentations-, Freigabe- und Wiederholungsgrenzen sowie sichere Beendigung und Lock-Behandlung bleiben wirksam; keine neue Autorität entsteht.
- AC-007: Bestehende Definitions-, Antwort- und Leistungsbudgets gelten unverändert, einschließlich gewöhnlicher und Decision-Komposition. Größen und p95-Messungen nennen Kandidat, Umgebung und Grenzen.
- AC-008: Ein echter Agent löst eine begrenzte Befehlsaufgabe ausschließlich über MCP, ohne manuell ergänzte fehlende technische Argumente oder AGDF-CLI-Ausweichweg. Transkript, deterministisches Ergebnis, Fehlaufrufe, Aufrufzahl und Tokenmessungen bleiben nachvollziehbar; fehlende Nachweise bleiben offen.
- Entscheidungen: Der genehmigte Umfang, die Kompatibilitäts- und Ergebnisgrenzen sowie die begrenzte Nachweisaussage sind festgelegt. SDK-Einstiegspunkt und Schemadarstellung entscheidet SD. Den konkreten Host, das Modell, die Aufgabe, Wiederholungen und Ausführungsgrenzen bindet TP vor der Messung; zusätzliche Kosten oder Installationen sind nicht freigegeben.
- Risiken: Das SDK wandelt Handler-Ausnahmen in Tool-Fehler um und prüft negative Ausgaben nicht selbst gegen outputSchema. Design und Tests müssen diese Grenzen sowie alle bisherigen Ergebnisvarianten und Größenbudgets berücksichtigen. Skripttests ersetzen weder den geforderten Agentennachweis noch vollständige Konformität.
- Nächster Schritt: Nach Approval: PRD folgt Solution Design. Implementierung bleibt bis zu den dafür erforderlichen Freigaben und internen Prüfungen gesperrt.
