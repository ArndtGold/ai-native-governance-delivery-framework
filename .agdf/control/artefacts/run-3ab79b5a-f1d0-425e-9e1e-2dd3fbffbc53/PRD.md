# PRD: Versioned defaults with immediate MCP input relief

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-30
Owner: Repository maintainer
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver the approved plugin-defaults capability and the associated reduction of repeated MCP input in the same change. The plugin distributes one versioned JSON source for configurable defaults; the existing .agdf/control/config.json remains the project setting surface. Existing locale text, protocol constants, target resolution, operation validation and receipt owners retain their responsibilities. A JSON-only delivery followed by a separate future MCP simplification does not meet this PRD.

The initial user-configurable settings are:

| setting | plugin default | project override | behavior |
|---|---|---|---|
| chat_language | en | Existing chat_language | Presentation language when the caller has not supplied a valid explicit request-specific language. Existing locale-pack selection and complete-English fallback for a syntactically valid unsupported locale remain. |
| artifact_language | en | Existing artifact_language | Default for new artefact authoring; stored project values and already approved artefacts retain their language. A presentation-language override never changes the artefact language. |
| presentation_route | markdown | New optional setting in existing config.json | Preference for presentation.deliver: markdown, automatic or fallback under the existing delivery owner. No change to UI capability checks or approval authority. |
| gate_check_variant | null | New optional setting in existing config.json | null preserves the current report behavior; status-card or approval-envelope selects an existing agdf_inspect gate-check representation. It never initiates an approval or applies to unrelated read operations. |

These shipped values preserve the existing English fallback and default Markdown delivery. They are the product proposal presented for PRD approval, not a claim of an earlier human decision about every key. Exact physical layout/schema and packaging integration belong to SD. No additional configuration file under .agdf, host-specific preference hierarchy or duplicate translation catalogue is introduced.

Precedence for an eligible setting is valid explicit request/call value > applicable project value > plugin default. A request-specific language choice is conveyed as an explicit call override. The current request and skill guidance must explain when an override is needed; callers do not have to repeat values that the resolved configuration already supplies. Existing explicit setup-language choices remain supported. Existing complete project configurations remain valid; adding optional preferences does not redefine canonical control activation or make an incomplete legacy control file active.

MCP input relief in this delivery covers presentation_language on the existing core tools; schema_version and assurance on the seven command groups; route on presentation.deliver; and working_directory where a supported adapter can supply a trustworthy execution context. Fixed schema_version and cooperative_local assurance remain contract/adapter constants, never user preferences or independent human proof. Cockpit open may reuse a trustworthy execution directory; its target and session bindings remain explicit. Existing optional inspect variant can inherit the configured representation only for gate-check. Other operation-specific inputs remain explicit.

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: Directly defined low-impact semantics from the completed Brownfield Review; no new primary action, working mode or interactive preview.
- primary_user_intent: Set stable preferences once and use existing AGDF operations without repeatedly transmitting known technical values.
- success_signal: In the same delivered candidate, a supported omitted-input call reaches the same validated Core operation/effective state as its explicit equivalent; configuration source and actionable errors are understandable.
- primary_decision_or_action: The maintainer chooses project preferences; the agent invokes the existing read, prepare, record or decision operation. Gate approval remains a separate deliberate human action.

The following scenarios define visible behavior. Their acceptance criteria are listed below; these are planned observations, not executed tests.

| scenario | working_mode | source_state | trigger/action | expected effective state | visible feedback | blocker/failure behavior | recovery/next action | observable success and evidence |
|---|---|---|---|---|---|---|---|---|
| UX-S1 | configured/defaulted call | Valid project, missing stable call inputs | Agent invokes an existing operation | Resolved project values, otherwise plugin defaults, supply only eligible inputs; ordinary Core checks continue | Existing result/help exposes the effective setting and source | Invalid applicable config or unavailable required context blocks execution | Correct the named setting or supply context, then retry safely | Equivalent explicit/defaulted results and configuration provenance; protocol and actual Codex CLI discovery evidence |
| UX-S2 | explicit override | Valid config with another preference | Caller supplies a valid explicit value | That value is used for the one operation; project file remains unchanged | Provenance identifies explicit selection | Invalid explicit values are rejected and never replaced with defaults | Correct the explicit value; no automatic re-execution | Override and invalid-input cases, unchanged project bytes |
| UX-S3 | representation preference | Prepared decision or read-only gate-check | Deliver or read without a representation selector | Existing delivery/status owner selects the configured supported representation | Existing canonical presentation/result appears once | UI availability remains authoritative; no readonly request becomes an approval request | Use existing supported fallback or a valid explicit selector | Markdown/status cases and preserved approval/presentation identity |
| UX-S4 | configuration error/recovery | Malformed recognized settings or missing control | Agent calls an existing operation | No mutation or implicit activation occurs | Bounded diagnostic identifies source/field and one corrective action | A present invalid value is not treated as omission; defaults cannot activate absent control | User corrects configuration or explicitly sets up missing control; retry observes fresh state | Negative cases plus source/Run/config snapshots showing no unexpected effect |

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| configured/defaulted call | Validated effective preferences plus original operation bindings | Selected values/source; existing operation outcome | Existing Core configuration and operation owners | Existing MCP result and inspect/help surfaces |
| explicit override | One-call value replaces the applicable preference | Explicit source plus existing outcome | Existing input validation and Core operation owner | Same operation result; no second state card |
| configuration error/recovery | No eligible operation effect until the named input issue is resolved | Configuration/context diagnostic or unchanged missing-control state | Existing configuration/control eligibility and operation writer | Existing error/recovery response |
| immutable replay/decision | Original operation or presentation keeps its bound effective values | Original receipt/presentation and separate current-state observation | Existing receipt, replay and presentation owners | Existing operation-status/read/presentation surface |

Technical storage and context transport belong to SD. These modes describe existing operations with settings, not new gate or authorization modes.

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Plugin defaults are available with the matching runtime. Project preferences apply only to the confirmed project under the existing control classification; their presence creates no Run or approval. Removing an optional preference restores the lower-priority value. No installation or migration is performed by a normal read or settings resolution.
- blockers_and_visible_next_actions: Invalid explicit input, malformed recognized project/default settings, invalid locale registry, ambiguous/unavailable required execution context and ordinary target/Run/revision blockers remain actionable failures. Source and field are identified without exposing secrets. A syntactically valid unsupported presentation locale continues to use one complete English pack; malformed tags or resources are errors.
- recovery_paths: Correct the identified setting or supply the missing explicit context. Revalidate before a new operation. After uncertain execution inspect the original UUID through the existing status/recovery owner; never invent a fresh UUID or execute a write again merely because configuration changed. Recoverable transient resource reads report a visible retry path with no automatic write.
- relevant_state_transitions: A normal new call resolves current applicable preferences before its effect; an explicit override changes one call only; a subsequent new call sees current project settings. Existing prepared presentations, original-operation replays and historical receipts retain original values and identities. A settings change does not reopen, regenerate or approve a decision.

## 5. Acceptance Criteria

- criterion_id: AC-001
  - observable_success: One versioned plugin JSON source supplies the four configurable settings in Product Scope; existing project config is the only project override surface. Defaults reach the candidate through existing generators, with one owner per setting/locale/constant.
  - required_evidence: Resource/schema validation, generated-package content checks and ownership review.

- criterion_id: AC-002
  - observable_success: Explicit/project/plugin precedence follows Product Scope and UX-S1/UX-S2. Chat and artefact languages remain distinct; supported locale semantics are preserved. All four configured settings have the stated shipped defaults.
  - required_evidence: Resolution matrix including no optional override, project override, explicit override, supported subtags and valid unsupported presentation locale.

- criterion_id: AC-003
  - observable_success: The same candidate makes eligible presentation_language, command schema_version/assurance and delivery route omittable in model-facing MCP schemas and execution. An old explicit call and its equivalent shortened call reach the same validated effective operation. Unknown fields and invalid explicit constants/values remain rejected.
  - required_evidence: Before/after required-field inventory; SDK/protocol pairs for each affected group; Codex CLI captures showing reduced required inputs. UX-S1/UX-S2 success with no implementation deferred to another Run.

- criterion_id: AC-004
  - observable_success: working_directory may be omitted only where the supported adapter supplies a trustworthy execution context. Otherwise the call returns an actionable context-required error before an effect. It is never filled from primary_target, the plugin installation directory or a guessed project.
  - required_evidence: Host-context and unavailable-context cases, explicit-directory cases and multi-project isolation; SD identifies the supported source. UX-S1/UX-S4.

- criterion_id: AC-005
  - observable_success: presentation_route and gate_check_variant produce UX-S3 with their allowed values and operation scope. Explicit selectors win. UI capability, canonical fallback and deliberate gate decisions remain with existing owners; read-only inspection cannot become an approval request.
  - required_evidence: Presentation/status matrix, unsupported-UI fallback cases, exact current presentation identity and no-effect assertions.

- criterion_id: AC-006
  - observable_success: Present invalid applicable settings are distinguishable from omitted optional settings and identify source, field and recovery action. Missing or invalid canonical control stays missing or invalid, even with valid plugin defaults. No config repair/write or operation effect is implicit.
  - required_evidence: Malformed JSON/types/tags and missing/incomplete-control cases; before/after state snapshots. UX-S4.

- criterion_id: AC-007
  - observable_success: Existing inspection/help exposes effective configurable values and their source without making the agent repeat an extra configuration lookup for each ordinary call. Constants are identified as adapter/contract-owned. No secret data or caller-invented human proof is exposed.
  - required_evidence: Effective-value/provenance assertions for each precedence level, help/discovery checks and a representative shortened call sequence. UX-S1/UX-S2.

- criterion_id: AC-008
  - observable_success: Target/provenance, Run/revision, presentation/digest, original-operation identity, deliberate replies and operation-specific command restrictions retain their authority checks. None becomes configurable or automatically selected. Core receives a complete validated envelope.
  - required_evidence: Negative authority/binding cases plus existing command/approval/recovery regression coverage.

- criterion_id: AC-009
  - observable_success: Retrying the same operation after a configuration change preserves its original resolved values and at-most-once effect through the existing replay owner. A prepared/presented decision retains its language, material and identity; later config cannot silently change or approve it.
  - required_evidence: Replay after config change, same UUID/different logical request rejection, presentation read/delivery and receipt checks.

- criterion_id: AC-010
  - observable_success: Existing valid project values and explicit clients remain usable. Plugin update/package generation does not overwrite project settings. Separate projects/concurrent sessions cannot share a selected project's effective preferences. Removing an optional override restores the applicable default.
  - required_evidence: Legacy valid configs, preserved project bytes, two-project/concurrency cases and optional override removal. UX-S1/UX-S2.

- criterion_id: AC-011
  - observable_success: Documentation, runtime guidance and model-visible schemas agree on omitted inputs, explicit overrides, supported context and error behavior. The candidate remains within existing hard budgets. Repository/SDK evidence, actual Codex CLI observation and untested host/UI behavior are reported separately.
  - required_evidence: Source/generated parity, schema/budget checks and bounded native Codex CLI metadata plus representative call evidence; visible limits for other tuples.

- criterion_id: AC-012
  - observable_success: Delivery is accepted only when defaults resolution and actual MCP input relief coexist in the same candidate with all applicable criteria above fulfilled. A defaults file, green aggregate CI, or a smaller schema alone is insufficient. No performance/task-success improvement is claimed without measurement.
  - required_evidence: QA maps this criterion and the preceding criteria to one exact candidate identity and actual results; mandatory reviews and ordinary human gates remain.

## 6. Non-Goals

No new approval/target authority, automatic technical permissions, configurable hard safety limits, independent human-proof claim, implicit project initialization, setting-derived Run selection, new configuration UI, Cockpit redesign, unrelated installer work, release/publication, installation or VCS action. No automatic rewriting of existing project files or approved artefacts. No broad agent benchmark or cross-host qualification campaign; evaluate only concrete affected claims. No requested preview exists or is required.

## 7. Users And Roles

The maintainer owns project preferences and PRD approval. Coding agents consume settings and explicit overrides while preserving returned bindings. Existing Core, CLI/MCP adapter, plugin resource, generator and review/QA owners remain accountable for their respective surfaces. No additional operator or decision authority is introduced. Codex authors this proposed specification; maintainer acceptance remains pending.

## 8. Constraints

- Preserve the approved UR, existing governance semantics and separation of host permission from deliberate AGDF approval.
- Use .agdf/control/config.json; preserve existing control activation/validity and stored language values. Optional preference inheritance must not reinterpret an incomplete control file as active. No parallel runtime/user/project configuration hierarchy.
- Keep locale fallback/text in the existing registry, protocol version/assurance with their contract owners and all runtime machine semantics unchanged.
- Resolve project preferences only after the appropriate confirmed target is established; targetless operations may use plugin defaults without acquiring project authority.
- Preserve explicit invalid-input rejection, resource confinement, revision checks and original-UUID replay. Audit/receipt changes, if required, use existing writers and belong to SD.
- Respect existing discovery, transport, material, Worker, UI and timing limits. Any incompatibility or required migration discovered in SD must be exposed before dependent implementation, not silently worked around.
- Existing unrelated staged/unstaged installer and control work remains excluded. Current branch or installation does not grant VCS or release authority.

## 9. Evidence Requirements

Plan focused deterministic coverage from the criteria, reusing existing language, dispatch/inspect, Core command, decision/replay and MCP contract/protocol suites. Add meaningful negative cases for every new omission/error rule and applicable old-client compatibility. Exercise the reduced schemas through both supported SDK protocol eras. Capture the actual model-visible definitions from a fresh candidate-bound Codex CLI context; verify at least one representative defaulted read and one confined synthetic write against its explicit equivalent. No live repository gate is approved as a test.

Use original before/after field inventories and exact source/candidate identities. Distinguish descriptor size, model input shape, validation behavior and completed-task success; no numeric latency/token savings are promised. Installation, Desktop/UI interaction and other-host support require their own observations and remain unclaimed when absent. This PRD contains requirements and planned checks; implementation and verification have not occurred.

## 10. Risks And Open Questions

The SDK validates before executing a handler, so optional public schemas and strict internal validation must be designed together. Missing-control classification and legacy language fallback currently have different low-level behavior. Context provenance may differ by host, and the existing skill guidance requires explicit presentation language; all affected guidance must evolve consistently. Defaults included in sealed operation effects must not destabilize replay after config changes. Fixed discovery budgets have little headroom. These are SD/TP obligations with the product outcomes above fixed; no material product question remains hidden in a later stage.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Configuration location and precedence | before_prd | resolved | Approved UR: versioned plugin JSON, existing project config, valid explicit > project > plugin. This PRD specifies the initial settings and preserves existing control validity. | Repository maintainer |
| Immediate MCP relief and protected inputs | before_prd | resolved | Approved UR Goal/Scope and confirmed clarification require simultaneous relief. Product Scope and AC-003/AC-004 fix the affected inputs; AC-008 protects authority/state. | Repository maintainer |
| Shipped preference values and representation scope | before_prd | resolved | This specification proposes current English fallback, Markdown delivery and null/current status behavior; optional project overrides use the existing representations. Approval of this PRD accepts these proposed values; no earlier separate human acceptance is claimed. | Repository maintainer |
| Acceptance and release boundary | before_prd | resolved | The same candidate must satisfy all criteria including compatibility, replay and actual reduced MCP inputs. No release, installation, Git action or general host qualification is authorized. | Repository maintainer |
| JSON/schema placement and shared resolver integration | later_sd | open | Select exact resource/schema paths, project configuration keys/layout and existing Core/transport integration consistent with Product Scope; retain one owner per value. | Solution Design owner |
| Trustworthy context and replay/provenance transport | later_sd | open | Identify supported execution-context sources and integrate effective-value binding with existing operation/presentation writers. Unavailable context must require explicit input. | Solution Design owner |
| Exact fixtures, consumer checks and native evidence procedure | later_tp | open | Map every criterion to tasks, expected negative/positive results and candidate-bound evidence, preserving the proportional quality contract. | Task/Test Plan owner |

## 11. Next Step

Review the proposed settings, same-change MCP relief and acceptance criteria. Approval: PRD accepts this product specification and permits Solution Design only. SD and TP approvals plus required preparation still precede implementation. No approved source is rewritten and no later approval is inferred.

## AGDF Approval Summary (de; source=en)

- Ziel: Plugin-Defaults und Projektwerte werden gemeinsam mit einer tatsächlichen Entlastung der MCP-Aufrufe geliefert. Die notwendigen Governance-Bindungen bleiben erhalten.
- Umfang: Eine versionierte JSON-Quelle im Plugin und die vorhandene .agdf/control/config.json. Vorgeschlagene Vorgaben: Chat- und Artefaktsprache Englisch, Darstellungsroute markdown, Statusvariante null für das bisherige Verhalten. Vorhandene Projektwerte wie Chat Deutsch und Artefakte Englisch bleiben erhalten. Gültige explizite Angaben haben Vorrang vor Projektwerten und Plugin-Defaults.
- Entscheidungen: Geeignete Sprachangaben, schema_version, assurance und die Darstellungsroute sollen im selben Kandidaten entfallen können. Das Arbeitsverzeichnis wird nur bei vertrauenswürdigem Adapterkontext ergänzt; andernfalls bleibt eine ausdrückliche Angabe nötig. Ziele, Runs, Revisionen, Digests und Freigaben werden niemals aus Konfiguration ausgewählt. Die vorgeschlagenen Einzelwerte werden mit dieser PRD entschieden; SD klärt die technische Einbindung.
- AC-001: Eine kanonische, validierte Defaults-Quelle wird über bestehende Generatoren ausgeliefert; Projektkonfiguration, Locale-Registry und Vertragskonstanten behalten eindeutige Owner.
- AC-002: Explizite Angabe, Projektwert und Plugin-Default werden in dieser Reihenfolge aufgelöst; Chat- und Artefaktsprache bleiben getrennt.
- AC-003: Dieselbe Lieferung vereinfacht sichtbare MCP-Pflichteingaben und tatsächliche Ausführung. Bestehende explizite Aufrufe bleiben kompatibel; ungültige Werte werden weiter abgewiesen.
- AC-004: Das Arbeitsverzeichnis wird ausschließlich aus vertrauenswürdigem Ausführungskontext übernommen. Ohne diesen Kontext erfolgt eine handlungsleitende Fehlermeldung vor jeder Wirkung.
- AC-005: Darstellungs- und Statuspräferenzen verwenden die bestehenden Owner und Fallbacks. Eine lesende Abfrage erzeugt keine Freigabeanfrage.
- AC-006: Ungültige Einstellungen werden mit Quelle, Feld und Korrekturschritt gemeldet. Fehlende oder ungültige Projektsteuerung wird durch Defaults nicht aktiviert oder repariert.
- AC-007: Wirksame Einstellungen und ihre Herkunft sind über vorhandene Hilfe-/Inspektionsflächen nachvollziehbar; ein zusätzlicher Konfigurationsaufruf vor jeder Operation ist nicht erforderlich.
- AC-008: Ziel-, Run-, Revisions-, Präsentations-, Digest-, UUID- und Freigabeprüfungen bleiben verbindlich. Der Core erhält vollständige validierte Eingaben.
- AC-009: Replay und vorbereitete Entscheidungen behalten ihre ursprünglich gebundenen Werte und Identitäten auch nach einer Konfigurationsänderung; keine doppelte Schreibwirkung.
- AC-010: Gültige Alt-Konfigurationen, vorhandene Projektwerte und explizite Clients bleiben nutzbar. Projekte und parallele Sitzungen sind getrennt; Updates überschreiben keine Projektwerte.
- AC-011: Dokumentation, Anleitung, sichtbare Schemata und Fehlerverhalten stimmen überein. Bestehende Grenzen bleiben erhalten; Repository-, Codex-CLI- und UI-/Host-Nachweise werden getrennt bewertet.
- AC-012: Abnahme nur mit Defaults-Auflösung und tatsächlicher MCP-Entlastung im selben geprüften Kandidaten. Eine JSON-Datei oder grüne CI allein genügt nicht; Effizienzgewinne werden nur bei Messung behauptet.
- Grenzen: Keine neue Konfigurationsoberfläche, erweiterten Rechte, automatische Projektaktivierung, Cockpit-Neugestaltung, fremden Installer-Änderungen, Installation, Git-Aktionen oder Veröffentlichung. Umsetzung und Prüfungen sind noch nicht erfolgt.
- Nächster Schritt: Approval: PRD erlaubt das Solution Design. Die weiteren erforderlichen Freigaben und Prüfungen bleiben bestehen.
