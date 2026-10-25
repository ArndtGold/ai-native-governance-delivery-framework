# PRD: Reliable Codex MCP inspection and bound approval navigation

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-25
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver the approved UR outcome through the existing inspection and approval tools: Codex can see the supported input contract, receive exact advisory read arguments and record a deliberate response to an already presented UR without avoidable invalid calls or a shell workaround.

The product interface retains the current tool names, eleven inspection operations and fourteen input fields. Successful explicitly bound gate-check results may include an optional `navigation` envelope with `presentation_catalog` and ordered `next_calls`. Every call identifies the existing read-only `agdf_inspect` tool and a complete `arguments` object using its existing contract. Navigation neither executes an operation nor grants permission to approve. The canonical report, human presentation and command effects remain unchanged.

This is a current-workflow aid, not a new document-selection authority. The catalog exposes its actual scope and completeness. An exact presentation binding already established in the conversation takes precedence over a suggested current-gate document. A filtered unique result must not be represented as uniqueness outside that filter. Historical-document requests continue through the existing exact read interface; this slice adds no gate selector to gate-check and cannot reinterpret the user's reply for a different gate or version.

The existing single-in-flight execution boundary is preserved. Agents are told to execute the suggested read calls sequentially and to follow document continuation cursors when necessary. The four-call acceptance below applies to the normal short-document T7 fixture, not to arbitrary multipage or recovery workflows.

## 2. UX Intent And Success

- ui_ux_impact: none
- ux_intent_definition: not_applicable; Brownfield Review records no change to human working modes, approval interaction, presentation, activation or recovery authority
- primary_user_intent: Have the exact deliberate response to the presented UR recorded once against that version.
- success_signal: The normal MCP-only task records exactly one intended approval, with no invalid or busy call and with authoritative bindings retrieved through MCP.
- primary_decision_or_action: The human supplies the deliberate gate response; the agent requests the existing approval command for that exact binding. Core independently validates the request and reports its actual effect.

No new preview is required. The pre-implementation prototype is technical feasibility evidence, not a human-interface preview or delivered product.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Inspect the named workflow | Read-only current state with optional advisory read navigation | Existing report and presentation; optional catalog scope, availability and next-call data | Existing Core target, Run and gate evaluators | Existing inspection response and host presentation rules |
| Read an exact prepared document | Immutable document under its original binding, possibly historical | Existing content, applicability, digest and cursor fields | Existing Core presentation/document owner | Existing document-read result; agent follows ordered pages |
| Record the user's response | Exactly one accepted or rejected command with existing receipt/recovery semantics | Existing command outcome, receipt, current state or actionable error | Existing Core approval and transaction owners | Existing command result and established chat flow |
| Missing or ambiguous guidance | Read state remains authoritative; no implicit document choice or write permission | Existing report plus unavailable/ambiguous catalog information, or omitted optional navigation | Existing Core validation and presentation owners | Existing read response; agent explains the specific unresolved binding |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Use the existing tool invocation and explicit target provenance. Navigation is available only from the explicitly bound request and does not create per-connection current-context authority. Existing calls that do not qualify for navigation retain their prior read behavior.
- blockers_and_visible_next_actions: Missing or foreign target/Run/revision, an invalid seal or record, ambiguous selection and invalid cursors remain rejected or explicitly unresolved through the existing owner. Guidance must not create a replacement presentation or choose by timestamp. A human gate response is never inferred from tool permission, preparation or prior unrelated approval.
- recovery_paths: Keep an exact known conversation binding when valid. Otherwise use validated catalog scope/completeness and explicit selection; request clarification only where selection is genuinely unresolved. For a transient no-effect read failure, follow existing safe retry guidance. After uncertain command dispatch, inspect/recover the original operation identity rather than creating a new command. Optional navigation failure must not convert an otherwise valid legacy read into a failed state evaluation.
- relevant_state_transitions: Inspection and navigation do not mutate governance state. An accepted deliberate approval uses the existing transaction and advances only its bound gate; rejection or stale/foreign binding creates no approval. The result/receipt remains the source of the command's actual effect. No new state machine, human decision or retry authority is added.

## 5. Acceptance Criteria

- criterion_id: AC-001
  - observable_success: The bound Codex host displays all fourteen inspection parameters and eleven supported operations with meaningful applicability and provenance guidance, rather than losing them in unknown schema intersections. The model-visible and runtime contracts describe the same supported calls.
  - evidence_required: Installed-host rendering observation without a model call, current discovery definition/digest and actual native invocation trace bound to the candidate.

- criterion_id: AC-002
  - observable_success: Existing valid input combinations remain accepted and invalid combinations remain rejected. The 247,003-case comparison, retained invalid-call replay and focused Core argument conversion checks show no acceptance relaxation. SDK validation and detailed output validation remain active; no private SDK patch or parallel schema/operation registry is introduced.
  - evidence_required: Candidate/baseline schema comparison with zero differences, invalid-call replay, Core conversion checks and affected contract tests.

- criterion_id: AC-003
  - observable_success: Optional navigation contains only read-tool calls with complete arguments derived from existing validated owners for the explicit target and Run. It identifies catalog scope/completeness and directs sequential execution. It never executes a call, authorizes a write, silently selects another context or overrides an exact conversation presentation binding. Current-workflow hints cannot establish broader uniqueness than their declared catalog scope.
  - evidence_required: Actual MCP results, validation of returned arguments, unbound/foreign/ambiguous cases and explicit existing-binding precedence checks.

- criterion_id: AC-004
  - observable_success: Unique complete discovery or an exact known selection preserves immutable presentation identity. Document reads use the selected record's original revision, while current operation contracts use the current revision. Missing, corrupt, stale, foreign and invalid-cursor requests fail safely, and ambiguous catalogs do not select by recency or prepare replacements. Existing ordered multipage retrieval remains compatible.
  - evidence_required: Positive and negative catalog/document scenarios, historical-versus-current revision checks, refused approval attempts and control-state mutation checks.

- criterion_id: AC-005
  - observable_success: At least two genuine final-candidate sessions complete the unchanged normal T7 task using gpt-6.1-sol with Reasoning low. Each records exactly one intended UR approval through MCP, has a complete trace accepted by the unchanged strict audit, uses at most four MCP calls, and has zero SDK input errors, zero other error results and no forbidden shell/tool detour. Failed or incomplete sessions remain failed observations; they are not replaced by scripted success or weakened predicates.
  - evidence_required: Fresh raw events, rollouts, model/effort observations, original and strict task predicates, call/error metrics and protected-setting comparisons for every planned session.

- criterion_id: AC-006
  - observable_success: All existing ceilings remain unchanged and satisfied: Inspect definition 5,000 bytes; command definition 8,192 bytes each; existing command/decision aggregate 24,576 bytes; input/output 65,536/1,048,576 bytes; fixed-fixture cold/warm p95 1,500/1,000 ms; Copilot 397 files and 3,509,461 bytes. Normal generated-package checks verify actual outputs without excluding required files or hiding growth behind a test-only budget.
  - evidence_required: Canonical size/budget outputs, normal package/profile verification, fixed-fixture timing measurements with declared methodology and unchanged limit sources.

- criterion_id: AC-007
  - observable_success: Existing CLI report and presentation parity, successful blocked-state reads, supported modern/legacy MCP protocol behavior, read-only inspection, command receipts and error/recovery behavior remain compatible. Navigation is additive envelope metadata and cannot alter report truth, human approval text or permission. Unavailable guidance is contained without inventing an alternative document or suppressing existing errors.
  - evidence_required: Existing parity/read-only/preview tests, real STDIO protocol and command suites, blocked-state/advisory-failure regressions and source/diff review.

- criterion_id: AC-008
  - observable_success: Original evaluation successes and failures are retained byte-for-byte with verified manifests and kept separate from fresh delivery evidence. Final evidence identifies candidate/source digests, exact CLI/model/effort tuple, task version, every attempted session, metrics, timing and qualification limits. Protected global settings, credentials, foreign worktree files and prior Runs are preserved; no broader host or release qualification is claimed.
  - evidence_required: Immutable retention manifest, candidate provenance, complete session ledger and before/after isolation checks linked from the selected Run.

## 6. Non-Goals

No new tool or operation, tool renaming, input selector, approval authority, authenticated human proof, automatic approval, replacement presentation, target/Run inference, concurrency redesign, private SDK patch, relaxed validation, persistence migration, UI redesign, installation or release. Prior completed and separately pending Runs remain untouched. Commit, push, PR and merge actions require their own later user instruction.

## 7. Users And Roles

- Human decision owner: Arndt Gold; approval of the exact presented material remains deliberate and separate at every required gate.
- Agent: discovers and consumes read results, preserves explicit scope and identity, and forwards the exact human response through the existing command interface.
- Core owners: decide validation, state, catalog/document eligibility, approval effect and recovery. Navigation is subordinate to these owners.
- Maintainer/reviewer: evaluates compatibility, budget, source and evidence integrity; qa-gate remains the sole final quality-readiness decision owner.

## 8. Constraints

The approved UR is authoritative. Brownfield Review selects structured_delivery because a public MCP contract is affected. Use existing Core, CLI/MCP projection, test, assembly and profile owners. Keep the fourteen input fields, eleven inspection operations, input acceptance, CLI report and existing approval semantics compatible. Add optional navigation without requiring legacy consumers to adopt it.

Use gpt-6.1-sol and Reasoning low through the existing ChatGPT account. No API-key fallback, copied credentials, plugin installation, changed protected global configuration or unbounded retry/resume loop. The approved TP must specify a finite session budget and stop rules before new model execution. The PRD requires at least two successful normal T7 sessions; it does not authorize those executions now.

Technical implementation and propagation choices belong to SD. Executable checks, exact candidate/CLI binding, session count within the approved budget and execution scheduling belong to TP. Existing limits are hard ceilings; prototype measurements are reference observations rather than permission to increase them.

## 9. Evidence Requirements

The approved UR and completed Brownfield Review are the derivation sources. The isolated study at main 5046858826f3bca7922c14ef402b095feca8b6fb, /private/tmp/agdf-inspect-evaluation/REPORT.md and its summary/manifest establish feasibility only. It contains five fresh sessions: the first guided prototype failed strict qualification; the final prototype passed four sessions, two normal prompts and two predeclared wording variants. The earlier schema-only candidate also failed. All these outcomes remain unchanged.

Semantic derivation was reviewed against the exact approved UR and completed Brownfield Review. This mapping records provenance, not another acceptance authority:

| PRD criterion | Approved UR source | Analytical treatment |
|---|---|---|
| AC-001 | CGI-01; Scope 1 | Native schema visibility, existing inventory and meaningful guidance |
| AC-002 | CGI-02; Non-Goals | Equivalent acceptance and unchanged validation authority |
| AC-003 | CGI-03; Scope 2-3 | Exact binding precedence and disclosed advisory catalog scope resolve the Brownfield product question |
| AC-004 | CGI-03/06 | Original versus current revision, safe selection and document compatibility |
| AC-005 | CGI-04/07; Scope 5 | Two-session minimum and four-call normal-scenario ceiling turn the evaluated reference into explicit product acceptance; TP binds execution |
| AC-006 | CGI-05 | Preserve every existing definition, payload and timing ceiling |
| AC-007 | CGI-06; Scope 2 | Preserve report truth, blocked reads and command effects; SD decides advisory-failure containment |
| AC-008 | CGI-07; Scope 4-5 | Preserve all original evidence and require fresh candidate provenance and isolation |

Before delivery review, retain the referenced original bytes and verify their manifests under the selected Run. Build and qualify the later implementation candidate independently; verify which Core source and assembled payload the tests actually load rather than relying on a package version or copied workspace dependency. Retain all native attempts, including failures, original host warnings, call/error counters and token/time measurements. Distinguish normal-scenario acceptance from deliberate negative-test errors. Scripted protocol success, reused UI build assets and a previous prototype do not prove fresh native execution, full clean-release build, other-host compatibility or human viewing.

## 10. Risks And Open Questions

- Small definition/payload headroom may require clean reuse or concise equivalent help. This cannot justify increasing a ceiling or dropping a protected behavior.
- Optional navigation may encounter unavailable data or historical/ambiguous presentations. Its failures and advisory scope must remain separate from legacy state truth and human intent.
- Native agents vary and account/host availability may change. Unavailable evidence remains unresolved; do not install, authenticate, change providers or rerun indefinitely to manufacture success.
- The unchanged normal T7 task covers one short-document approval workflow. Deterministic compatibility scenarios do not expand its native-host qualification.

No material before-PRD product question remains open. The owner-bound SD/TP questions below concern implementation and execution details within the specified behavior.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Intended delivery outcome and supported boundary | before_prd | resolved | Transfer the evaluated visibility and advisory navigation approach into existing tools; keep human decisions, tool inventory, persistent state and CLI report unchanged. | Arndt Gold |
| Exact binding precedence and catalog scope | before_prd | resolved | Exact conversation bindings take precedence; current-gate hints are advisory within their disclosed scope and cannot infer another document, gate or approval. | Arndt Gold |
| Native acceptance strength | before_prd | resolved | Require at least two final-candidate unchanged normal T7 sessions, each strict success, at most four MCP calls and zero SDK or other errors using gpt-6.1-sol/low. Earlier prototype sessions do not fulfill this obligation. | Arndt Gold |
| Budgets and compatibility acceptance | before_prd | resolved | Preserve every UR ceiling and legacy report/command behavior; reject growth or relaxed validation used to make a test pass. | Arndt Gold |
| Human interface, preview and release scope | before_prd | resolved | No human UI change or preview; no installation, release, publication or Git handoff in this scope. | Arndt Gold |
| Core implementation, advisory-failure containment and projection | later_sd | open | Decide the exact existing-owner composition, eligibility, failure isolation and regression design while preserving AC-001 through AC-008. | sd-definition |
| Evidence retention, test commands and bounded native execution | later_tp | open | Bind immutable retention, exact candidate/CLI tuple, finite sessions satisfying the two-session minimum, no retry/resume policy, per-session deadline and existing-account isolation before execution. | tp-definition |

## 11. Next Step

Review this PRD and approve only with:

`Approval: PRD`

Approval adopts the specified behavior and acceptance criteria and permits the existing SD stage. It does not approve SD, TP, implementation, native execution, QA, UAT or release. Gate-check owns readiness and fresh bound presentation.

## AGDF Approval Summary (de; source=en)

- Ziel: Die bewusste Antwort zur vorgelegten UR zuverlässig über MCP erfassen; der Agent erhält verständliche Eingaben und genaue Leseangaben aus den bestehenden Core-Ownern.
- Umfang: Alle vierzehn Eingabefelder und elf Operationen bleiben erhalten. Optionale navigation-Daten liefern Katalog und geordnete Leseaufrufe. Bericht, Präsentation, Schreibwirkungen und menschliche Freigabe bleiben unverändert. Eine vorhandene exakte Dokumentbindung hat Vorrang vor aktuellen Folgehinweisen.
- Entscheidungen: Mindestens zwei neue echte T7-Läufe am Implementierungskandidaten müssen jeweils streng bestanden sein, höchstens vier MCP-Aufrufe benötigen und ohne SDK- oder sonstige Fehler bleiben. Modell ist gpt-6.1-sol mit Reasoning low. Alle bestehenden MCP- und Copilot-Grenzen gelten weiter. Die Vorstudie ersetzt diese Abnahme nicht. Technische Ausgestaltung und begrenzter Ausführungsplan folgen in SD und TP; es gibt keine offene Produktfrage und keine neue Vorschau oder Veröffentlichung.
- AC-001: Codex zeigt alle Felder und Operationen mit verständlicher Anwendbarkeit und Herkunft; die Signatur verliert keine Eingaben hinter unbekannten Schemaanteilen.
- AC-002: Gültige und ungültige Eingaben behalten ihre Annahme beziehungsweise Ablehnung. Die bestehende Vergleichsmatrix, Fehlerwiedergabe und Core-Prüfung bleiben maßgeblich; keine abgeschaltete Validierung oder SDK-Privatpatches.
- AC-003: Folgehinweise enthalten nur vollständige, ausdrücklich gebundene Leseaufrufe und legen Katalogumfang und Vollständigkeit offen. Sie laufen nacheinander, wählen keinen anderen Kontext und erteilen keine Schreib- oder Freigaberechte.
- AC-004: Dokumente behalten ihre ursprüngliche Revision; aktuelle Vertragsabfragen nutzen die aktuelle Revision. Fremde, veraltete, beschädigte oder mehrdeutige Bindungen und ungültige Cursor bleiben sicher behandelt; keine Ersatzpräsentation oder Auswahl nach Zeitstempel.
- AC-005: Mindestens zwei neue echte Codex-Läufe erfüllen die unveränderte normale T7-Aufgabe mit genau einer beabsichtigten UR-Freigabe, vollständiger strenger Spur, höchstens vier MCP-Aufrufen und null Fehlern ohne Shell-Umweg.
- AC-006: Definitionen, Eingaben, Ausgaben, Leistung und Pakete bleiben innerhalb der unveränderten Grenzen; insbesondere höchstens 5.000 Byte für Inspect sowie 397 Dateien und 3.509.461 Byte für Copilot.
- AC-007: CLI-Bericht, menschliche Präsentation, erfolgreiche gesperrte Zustandsabfragen, Protokolle, Schreibfreiheit und vorhandene Befehls-/Fehlerregeln bleiben kompatibel. Fehlende optionale Navigation verfälscht keinen bestehenden Zustand.
- AC-008: Erfolgreiche und fehlgeschlagene Originalbeobachtungen bleiben unverändert mit Hashes erhalten und von neuen Nachweisen getrennt. Kandidat, Modell, Ausführung und Grenzen sind nachvollziehbar; globale Einstellungen, Zugangsdaten, fremde Dateien und frühere Runs bleiben geschützt.
- Risiken und nächster Schritt: Größenreserven und Workflow-Abdeckung sind begrenzt; fehlende Nachweise bleiben offen. Nach Approval: PRD folgt SD, danach der freizugebende TP. Produktcode und neue Agentenläufe bleiben bis zu den dafür erforderlichen Freigaben gesperrt.
