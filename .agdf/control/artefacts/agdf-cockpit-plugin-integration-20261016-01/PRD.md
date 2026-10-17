# PRD: Cockpit included in the AGDF plugin for Codex

Status: draft
Gate: PRD
Gate approval: open
Based on: approved UR
Date: 2026-10-16
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

Deliver the existing Cockpit as part of the normal AGDF plugin installation in Codex. The user installs or updates AGDF and asks to open Cockpit for an established project; no separate Cockpit build, MCP registration or project configuration is required. The visible feature name is **Cockpit**, identified as part of AGDF where its host surface supports that identification. Technical tool/server identifiers remain an SD compatibility decision.

Installation and opening must distinguish supplied, enabled, connected and actually working states. A confirmed project is required for reading project data. Existing local users get a controlled transition, with verified replacement before retirement of a positively owned old connection. The product does not promise that host trust, permission or restart requirements disappear.

First scope is Codex, including bounded local installation and fresh-host verification. Existing Claude work remains separate. Reuse the existing Cockpit content views and read/context semantics; no redesign is included.

## 2. UX Intent And Success

- ui_ux_impact: medium
- ux_intent_definition: UX_INTENT_DEFINITION.md; ready analytical input recorded by operation 5df7c8fb-4ef2-44a7-8fdd-3f14d1e62630
- primary_user_intent: Install AGDF once and open its Cockpit without setting up another server.
- success_signal: In a fresh Codex session, the installed plugin opens the Cockpit and displays canonical data for the intended project, with a verified single effective Cockpit path after legacy transition.
- primary_decision_or_action: Ask to open Cockpit; supply a project only when the conversation has not already established one unambiguously.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Clean install or update | Plugin supplies compatible Cockpit assets; discovery may require a fresh session | Installed, reconnect needed, available, preparation failed | Host installation/activation and existing AGDF runtime verification | Existing installer output and Codex plugin/MCP management |
| Open for confirmed project | A checked project binding and current source reads are established | Cockpit ready for named project, opening failed | Existing AGDF target and canonical read services | Cockpit tool result and existing view |
| Project unresolved or unavailable | No project data can be presented as a valid binding | Project needed, project unavailable, retry available | Existing AGDF target validation | Cockpit tool result; concise chat clarification only when needed |
| Owned legacy setup | Old route remains effective until verified replacement and retirement | Transition pending, reconnect needed, transition complete, rollback/repair needed | Existing registration ownership and lifecycle verification | Existing lifecycle output, with Cockpit opening result for actual readiness |
| Foreign or uncertain registration | User configuration remains intact; clean transition cannot be asserted | Conflict with named next action | Existing ownership/registration inspection | Existing lifecycle output |
| Disabled plugin or failed runtime | Plugin route is unavailable; any retained legacy route remains separately identified | Disabled, unavailable, retry/repair needed | Host activation and existing runtime/connection verification | Host plugin management and opening/lifecycle result |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Normal plugin installation/update supplies the feature. Opening binds the intended project and uses existing host permissions. Disabling/removing AGDF disables/removes its Cockpit capability according to the host lifecycle; preserved foreign or legacy connections are explicitly separate.
- blockers_and_visible_next_actions: Missing project asks for that project once; ambiguity asks which project; invalid/unavailable source reports its identity and correction/retry; missing UI support reports the actual limitation and established fallback. Incompatible assets or failed update report the concrete repair path. Foreign/unknown local registration blocks its mutation and names the conflict without silently declaring setup complete.
- recovery_paths: Transient opening/read errors provide a visible retry without repeating setup. A needed restart/reconnect is stated once. Failed replacement retains or restores the prior verified installation/owned local route and reports what remains effective; it never removes the last known working route first. No successful transition is asserted until its observed checks complete.
- relevant_state_transitions: installation -> configured/reconnect-needed -> available; opening -> checked project -> ready; no project -> deliberate project choice -> ready or explicit failure; owned legacy -> verified replacement -> legacy retired; failed replacement -> prior state retained/restored; enabled -> disabled -> unavailable; failed read -> deliberate retry -> fresh result or explicit failure. View selection does not advance any delivery gate.

## 5. Acceptance Criteria

The following stable IDs are the sole product acceptance source for later SD, TP and QA mappings.

- criterion_id: AC-001
  - working_mode: Clean installation
  - source_state: no separate Cockpit configured
  - trigger_action: Install the supported AGDF plugin and start a fresh Codex session
  - expected_effective_state: Cockpit tools and UI resource are supplied through the plugin; visible feature name Cockpit, associated with AGDF
  - visible_feedback: Cockpit tools and UI resource are supplied through the plugin; visible feature name Cockpit, associated with AGDF
  - failure_behavior: Failed preparation or missing discovery is explicitly incomplete, not ready
  - recovery_next_action: Existing installation repair or required reconnect; no extra Cockpit setup command
  - observable_success: User opens the existing Cockpit without manual build, MCP registration or project config
  - required_evidence: Actual packaged assets/declaration, installed payload and fresh Codex opening/render evidence

- criterion_id: AC-002
  - working_mode: Opening
  - source_state: confirmed or unresolved project
  - trigger_action: Ask to open Cockpit, with any requested run preserved
  - expected_effective_state: Confirmed project is checked; displayed identity and data match it. A missing/ambiguous project yields one understandable project request
  - visible_feedback: Confirmed project is checked; displayed identity and data match it. A missing/ambiguous project yields one understandable project request
  - failure_behavior: Invalid target or unknown run does not silently select another project/run; cwd/recency alone gives no authority
  - recovery_next_action: Correct the named project/run; retry when the source becomes available
  - observable_success: Correct project data or explicit actionable refusal, with no hardcoded distributed repository path
  - required_evidence: Binding/negative tests and visible project identity in installed-host evidence

- criterion_id: AC-003
  - working_mode: Ready view
  - source_state: current canonical project sources
  - trigger_action: Inspect runs/documents and use existing contextual-question actions
  - expected_effective_state: Existing canonical read, source/revision, bounded session and context behavior remain effective; selection alone grants no approval
  - visible_feedback: Existing canonical read, source/revision, bounded session and context behavior remain effective; selection alone grants no approval
  - failure_behavior: Stale/unavailable sources retain existing explicit failure behavior; no invented current data or writer authority
  - recovery_next_action: Existing refresh/context recovery; a later delivery request follows canonical binding/gates
  - observable_success: Existing Cockpit journey works and preserves non-authorizing reads and regular AGDF operations
  - required_evidence: Relevant existing regressions, no-control-write checks for UI-only actions, and final installed journey

- criterion_id: AC-004
  - working_mode: Owned legacy local connection active
  - source_state: Final integration awaiting qualification
  - trigger_action: Update/install integrated plugin and perform verified transition
  - expected_effective_state: Replacement is verified before owned legacy retirement; final effective tool offering has one Cockpit path; transition status is explicit
  - visible_feedback: Replacement is verified before owned legacy retirement; final effective tool offering has one Cockpit path; transition status is explicit
  - failure_behavior: Failed/unverified replacement prevents retirement and complete-success reporting
  - recovery_next_action: Retain/restore prior working route; explicit reconnect or lifecycle repair
  - observable_success: Existing user reaches plugin Cockpit without duplicate effective tools or lost working access
  - required_evidence: Ownership, duplicate, cutover/rollback tests and fresh-session transition evidence

- criterion_id: AC-005
  - working_mode: Foreign, modified or ownership-uncertain registration
  - source_state: Final integration awaiting qualification
  - trigger_action: Inspect or attempt legacy transition
  - expected_effective_state: Foreign/unrecognized registration and unrelated settings remain unchanged; visible conflict names one bounded next action
  - visible_feedback: Foreign/unrecognized registration and unrelated settings remain unchanged; visible conflict names one bounded next action
  - failure_behavior: No deletion based on server name alone; no unconditional cleanup or silent takeover
  - recovery_next_action: Resolve the specific ownership/configuration conflict through existing lifecycle controls
  - observable_success: Byte-preserved foreign state and truthful incomplete-transition result
  - required_evidence: Negative ownership/configuration tests with foreign-state canaries

- criterion_id: AC-006
  - working_mode: Installed plugin
  - source_state: update, disablement or removal pending
  - trigger_action: Use normal supported AGDF plugin lifecycle
  - expected_effective_state: Compatible UI/runtime assets update together; plugin-provided Cockpit follows enable/disable/removal; retained external routes are identified separately
  - visible_feedback: Compatible UI/runtime assets update together; plugin-provided Cockpit follows enable/disable/removal; retained external routes are identified separately
  - failure_behavior: Partial failure is explicit; incompatible assets do not become a working-ready claim
  - recovery_next_action: Existing rollback/retry/repair path preserves unrelated settings and shared runtime ownership
  - observable_success: Lifecycle readback agrees with observed state and restart requirements
  - required_evidence: Package/provenance checks, lifecycle fault tests and supported local host readback

- criterion_id: AC-007
  - working_mode: Project opening/read transiently fails or host cannot render UI
  - source_state: Final integration awaiting qualification
  - trigger_action: Open/read, then invoke available recovery
  - expected_effective_state: Project identity, actual limitation and one useful next action are visible; transient failure offers retry
  - visible_feedback: Project identity, actual limitation and one useful next action are visible; transient failure offers retry
  - failure_behavior: Configuration presence or protocol success alone never implies rendered/working UI
  - recovery_next_action: Visible retry, correction, reconnect or existing browser/text fallback according to the observed cause
  - observable_success: Recovery produces fresh checked data or an explicit remaining limitation without repeated server setup
  - required_evidence: Failure/retry scenarios and visible host evidence for claimed behavior

- criterion_id: AC-008
  - working_mode: Integration qualification and handoff
  - source_state: Final integration awaiting qualification
  - trigger_action: Assess the final build and documentation
  - expected_effective_state: Normal setup documents plugin-provided Cockpit; evidence distinguishes source, package, installed payload and live Codex results
  - visible_feedback: Normal setup documents plugin-provided Cockpit; evidence distinguishes source, package, installed payload and live Codex results
  - failure_behavior: Missing fresh-host or transition proof remains open; other-host support and release readiness are not inferred
  - recovery_next_action: Execute the missing named scenario before claiming integration complete
  - observable_success: All applicable criteria have evidence; docs match the observed Codex capability
  - required_evidence: Traceable final test/host records, documentation review, QA and user acceptance

## 6. Non-Goals

New Cockpit functions, UI redesign, new approval writers, altered control state/gate semantics, automatic delivery continuation, a parallel runtime/installer/lifecycle owner, new host integrations, public publication/release, Git commit or push. The shared-checkout recovery is documented operational evidence, not a new deletion-prevention product feature or claim about a proven deleting actor.

## 7. Users And Roles

The AGDF user installs/updates the plugin, opens Cockpit and makes deliberate project or gate decisions. Arndt Gold is the PRD owner and accepts product behavior. Existing Core owners retain target/control/read semantics; CLI/build/lifecycle owners deliver installation and migration; the host retains permissions and rendering. SD assigns concrete technical responsibilities; QA evaluates delivery evidence and UAT remains a separate human decision.

## 8. Constraints

Reuse existing canonical plugin, package, launcher, lifecycle, Core and UI owners. Do not hardcode the current repository into a distributed plugin. Preserve read-only view behavior and existing explicit context/gate authority. Existing unrelated modifications, foreign configuration and shared-runtime references are outside cleanup scope. Install/update verification must respect the host's trust and restart behavior. Local final-tuple evidence is required; no claim of other-host compatibility follows.

## 9. Evidence Requirements

TP must map every criterion and SD decision to executable positive/negative scenarios. Evidence covers clean install, checked/missing/invalid project and run, unchanged control/read semantics, owned legacy transition, uncertain/foreign preservation, partial update/rollback, disable/remove behavior, retry and unsupported UI outcomes. Preserve source/payload digests and final installed identities. Record a fresh Codex render/read journey and the existing-user transition after the final applicable build; mocks and a successful tool declaration do not satisfy those claims. QA/UAT retain missing evidence explicitly.

## 10. Risks And Open Questions

The current Cockpit is startup-directory-bound; the regular plugin already has a bounded reader and Decision App composition. A naive manifest addition may create tool collisions, shared-session leaks or project misbinding. Package growth changes provenance/budgets, and old local registrations have distinct ownership. SD must define compatible composition, project/session lifetime, migration verification and rollback. TP must select exact test entrypoints and native observation steps. These later technical choices do not change the user-facing acceptance above.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Product name and first surface | before_prd | resolved | Visible name Cockpit; first integration is the Codex AGDF plugin, as approved in UR | Arndt Gold, PRD owner |
| Separate setup and legacy outcome | before_prd | resolved | No additional Cockpit setup; verify plugin replacement before retiring a positively owned legacy route; foreign state preserved | Arndt Gold, PRD owner |
| Completion evidence and release boundary | before_prd | resolved | Final installed Codex render/read and migration evidence required; public release and Git actions excluded | Arndt Gold, PRD owner |
| Runtime composition and checked project binding | later_sd | open | Select through existing Core/CLI/MCP owners with compatible tool/session boundaries | SD owner |
| Provenance and migration/rollback mechanism | later_sd | open | Define exact build/lifecycle transaction and verification sequence using existing owners | SD owner |
| Concrete automated/native scenario plan | later_tp | open | Map all acceptance IDs to commands, expected outcomes and actual-host evidence | TP owner |

## 11. Next Step

Review this PRD and approve only with `Approval: PRD` for its presented revision. Approval permits Solution Design preparation; it does not authorize implementation, installation replacement or legacy retirement before the subsequent applicable gates.

## AGDF Approval Summary (de; source=en)

- Ziel: AGDF einmal installieren und das vorhandene **Cockpit** direkt in Codex öffnen können.
- Umfang: Das Plugin liefert Oberfläche und passende Laufzeit mit. Öffnen, Updates und Entfernung gehören zum normalen Plugin-Ablauf; die bestehende lokale Verbindung wird erst nach geprüftem Ersatz abgelöst. Zunächst gilt dies für Codex.
- AC-001: Eine saubere Plugin-Installation bietet Cockpit ohne zusätzlichen Build, MCP-Eintrag oder Einrichtungsbefehl.
- AC-002: Das richtige Projekt wird geprüft; fehlt es oder ist es mehrdeutig, folgt eine verständliche Auswahl. Kein stiller Wechsel zu einem anderen Projekt oder Run.
- AC-003: Bestehende Ansichten, Quellenprüfung und Kontextübergabe bleiben erhalten. Lesen und Auswahl erteilen keine Freigabe.
- AC-004: Die eigene alte Verbindung wird erst nach verifiziertem Ersatz stillgelegt; danach gibt es genau einen wirksamen Cockpit-Zugang. Bei Fehlern bleibt der bisher funktionierende Weg erhalten oder wird wiederhergestellt.
- AC-005: Fremde oder unklar zugeordnete Einträge und sonstige Einstellungen bleiben erhalten; Konflikte werden konkret benannt.
- AC-006: Update, Deaktivierung und Entfernung verwalten das Plugin-Cockpit konsistent. Teilfehler bleiben sichtbar und erhalten einen Wiederherstellungsweg.
- AC-007: Öffnungs- und Lesefehler zeigen eine nächste Aktion, bei vorübergehenden Fehlern eine Wiederholung. Fehlende Oberflächenunterstützung wird ehrlich ausgewiesen.
- AC-008: Abschluss erst mit passenden Paket-, Installations- und frischen Codex-Nachweisen einschließlich Übergang vom alten Setup; Dokumentation entspricht dem geprüften Verhalten.
- Entscheidungen: Name, Codex-Umfang, sichere Ablösung und Nachweispflicht sind aus der freigegebenen Anforderung übernommen. Technische Projektbindung, Laufzeitaufteilung und Wiederherstellung entscheidet das anschließende Design; der Testplan legt die konkreten Szenarien fest. Neue Cockpit-Funktionen, andere Hosts, Veröffentlichung, Release und Git-Aktionen bleiben ausgeschlossen. Risiken sind doppelte Werkzeuge, falsche Projektbindung sowie unpassende UI-/Laufzeitversionen. `Approval: PRD` erlaubt als Nächstes das Lösungsdesign, noch keine Umsetzung.
