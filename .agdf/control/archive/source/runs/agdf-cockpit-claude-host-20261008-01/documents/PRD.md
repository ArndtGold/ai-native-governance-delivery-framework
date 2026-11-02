# PRD: AGDF Cockpit MCP App in Claude Code

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-08
Owner: Arndt Gold
Run: agdf-cockpit-claude-host-20261008-01
Traceability contract: criteria-chain-v1

## 1. Product Scope

Make the existing AGDF cockpit MCP app available in Claude Code through the AGDF plugin. Plugin installation provides a separate cockpit connection next to the regular AGDF connection. In a Claude host that supports MCP app UI, the user opens the existing cockpit for an explicitly named run. In a host without that support, the cockpit tools are not offered. The Claude desktop Code tab on Windows is verified live; the observed result is documented honestly. The cockpit UI, its read services and the Codex cockpit path are reused unchanged.

## 2. UX Intent And Success

- primary_user_intent: With the AGDF plugin installed in Claude Code, open the existing cockpit for a named run and inspect its control state and registered sources, without a separate setup step.
- success_signal: In a real Claude desktop Code tab session, the cockpit connection is present after installation and restart. The recorded outcome is one of: the embedded cockpit for the named run is shown, or the tools are not offered because the host does not support MCP app UI, or startup failed with a named reason.
- primary_decision_or_action: Open the cockpit for a run. Reading, selection and context actions never approve a gate or authorize implementation.
- deviation_from_ux_input: The UX Intent Definition proposed a plain-language text result for hosts without UI. By user decision on 2026-10-08, such hosts get no cockpit tools instead (see Approval Decisions).

## 3. Working Modes And Effective State

| Mode | Effective state | Visible state types | Effective state authority | Primary state presentation owner |
|---|---|---|---|---|
| Availability | Cockpit connection started by the plugin, separate from the regular AGDF connection | Connected; failed to start with reason; not installed | Plugin installation and the started cockpit server | Claude's MCP server status view |
| Embedded view | Host supports MCP app UI; existing cockpit for the requested run, or the overview when none was requested | Same as the Codex cockpit: loading, current, partial, invalid, missing, stale, unsupported action | Core cockpit services and canonical control files | The embedded cockpit, unchanged |
| Hidden | Host does not support MCP app UI; the cockpit connection offers no cockpit tools and creates no read session | Connection listed without cockpit tools | Host capability as declared by the host at connection start | Claude's MCP server status view; documentation states the host requirement |
| Binding or startup failure | No usable project, control tree or UI resource | Project not bound; control absent; UI resource invalid; capacity reached | Cockpit server validation | Claude's MCP status view (startup) or the tool result (per call) |
| Browser fallback | Existing local browser cockpit for the same project, unchanged | Available with its existing start path | Existing Core reads and browser session contract | Existing browser cockpit and documentation |

## 4. Activation, Blockers, Recovery And Transitions

- Activation: installing the AGDF plugin and restarting Claude provides the cockpit connection; there is no separate opt-in preparation. The user opens the cockpit by naming a run or continuing an unambiguously established run. The run is never inferred from directory, recency or inventory (existing tool rule).
- Blockers and recovery:
  - The cockpit fails to start: the reason is visible in Claude's MCP status and the regular AGDF connection is unaffected. Recovery: reinstall the plugin and restart.
  - No project binding or no control tree: the result is explicit and names the received project identity. Recovery: open Claude in the intended project.
  - Unknown run: the requested identity is named. Recovery: name an existing run or open the overview.
  - Capacity reached or session expired: the condition is named. Recovery: close another view or reopen with the same run.
  - Host without UI support: no cockpit tools are offered. Recovery: the documented browser cockpit and the existing AGDF inspection.
  - Host without context or message capability: the existing cockpit disables those actions with its explanation.
- Transitions:
  - Plugin installed and Claude restarted → connected, or failed with reason.
  - Connected in a UI host → tools offered → open with run → embedded view for that run, or the unknown-run result.
  - Connected in a non-UI host → no cockpit tools.
  - Plugin uninstalled → the cockpit connection is removed with the plugin.

## 5. Acceptance Criteria

### Separate cockpit connection

- criterion_id: AC-001
- working_mode: Availability
- source_state: AGDF plugin installed from this repository in Claude Code; Claude restarted.
- action: Inspect the connected MCP servers and their tools.
- expected_effective_state: A cockpit connection exists separately from the regular AGDF connection. The regular connection still offers only `agdf_dispatch` and `agdf_inspect`.
- visible_feedback: Claude's MCP status lists both connections; a cockpit startup failure is shown with its reason.
- blocker_failure_behavior: A failing cockpit connection leaves the regular AGDF connection and its tools usable.
- recovery_next_action: Reinstall the plugin and restart Claude.
- observable_success: Both connections appear with the expected tool sets.
- required_evidence: Live Code-tab observation plus a protocol test of both server configurations.

### Embedded cockpit in a UI-capable host

- criterion_id: AC-002
- working_mode: Embedded view
- source_state: A host that declares MCP app UI support is connected to the cockpit.
- action: Open the cockpit for an explicitly named run.
- expected_effective_state: `agdf_cockpit`, `agdf_cockpit_read` and the cockpit UI resource are offered. The existing cockpit opens bound to the requested run; an unknown run is reported with its requested identity and no other run is selected.
- visible_feedback: The existing cockpit views. Context and question actions appear only where the host demonstrably supports them; otherwise the existing explanation is shown.
- blocker_failure_behavior: Read, capacity and expiry failures use the existing cockpit messages.
- recovery_next_action: Existing retry, reopen and browser fallback paths.
- observable_success: The named run's cockpit is displayed in the host.
- required_evidence: A protocol test with a UI-capable client. Live display evidence only if the Code tab declares and renders UI (see AC-008).

### No cockpit tools in hosts without UI support

- criterion_id: AC-003
- working_mode: Hidden
- source_state: A host that does not declare MCP app UI support is connected to the cockpit.
- action: List the cockpit connection's tools.
- expected_effective_state: No cockpit tools are offered. No read session is created and no control file is read on behalf of a cockpit call. The regular AGDF tools remain available.
- visible_feedback: The connection is listed without cockpit tools; the documentation states that the cockpit requires a host with MCP app UI support.
- blocker_failure_behavior: There is no textual cockpit fallback and no claim of availability.
- recovery_next_action: Use the documented local browser cockpit or the existing AGDF inspection.
- observable_success: A non-UI client sees no cockpit tools.
- required_evidence: A protocol test with a client without UI capability; the live Code-tab observation if the Code tab does not declare UI support.

### Explicit project binding

- criterion_id: AC-004
- working_mode: Binding or startup failure
- source_state: Claude starts the cockpit connection for a project.
- action: Open the cockpit, or start the connection with a missing or invalid project.
- expected_effective_state: The cockpit reads only the `.agdf/control/` of the project root the host provides for the session. A missing or invalid project, or an absent control tree, yields an explicit failure that names the received identity.
- visible_feedback: The failure is shown in the MCP status or in the tool result.
- blocker_failure_behavior: The cockpit never falls back to another directory, the working directory alone or a previous project.
- recovery_next_action: Open Claude in the intended project.
- observable_success: The bound project matches the Claude project; invalid bindings fail visibly.
- required_evidence: Protocol tests for valid, missing and invalid bindings; the live Code-tab project identity.

### Read-only and non-authorizing

- criterion_id: AC-005
- working_mode: All modes
- source_state: The cockpit connection exists in a Claude session.
- action: Open, read, fail, reconnect.
- expected_effective_state: No control file changes; no approval is recorded or implied.
- visible_feedback: The existing non-authorizing wording of the cockpit.
- blocker_failure_behavior: Failures change no state.
- recovery_next_action: none
- observable_success: Control files are byte-identical over the measured host test window.
- required_evidence: A byte-identical control-tree comparison during the live Code-tab test, plus existing read-boundary tests.

### Plugin lifecycle and payload

- criterion_id: AC-006
- working_mode: Availability
- source_state: The plugin is installed, uninstalled or reinstalled through the existing Claude plugin lifecycle.
- action: Install, uninstall and reinstall the plugin.
- expected_effective_state: Installation provides the cockpit connection and its UI payload. Uninstallation leaves no cockpit server, payload or data directory behind.
- visible_feedback: The existing installer output names the required restart.
- blocker_failure_behavior: An incomplete payload prevents cockpit startup with a named reason and does not disable the regular connection.
- recovery_next_action: Reinstall the plugin.
- observable_success: Clean uninstall. The payload growth is measured and reviewed, and plugin profiles for other hosts keep their reviewed payload budgets.
- required_evidence: An isolated install/uninstall test, payload measurements and budget checks.

### Unchanged existing paths

- criterion_id: AC-007
- working_mode: All modes
- source_state: The existing Codex cockpit preparation, regular MCP dispatch/inspection and browser cockpit.
- action: Run their existing checks after the change.
- expected_effective_state: Their behavior is unchanged, including the Codex profile `agdf-cockpit-local`.
- visible_feedback: none
- blocker_failure_behavior: Any regression blocks acceptance.
- recovery_next_action: Fix the regression within scope.
- observable_success: The affected existing suites pass.
- required_evidence: Results of the affected MCP, cockpit, plugin, UI and browser suites.

### Live Code-tab verification and documentation

- criterion_id: AC-008
- working_mode: Availability, Embedded view or Hidden as observed
- source_state: The plugin is installed from this repository; a real Claude desktop Code tab session on Windows is open in this repository.
- action: Inspect the cockpit connection and, if tools are offered, open the cockpit for an explicitly named run.
- expected_effective_state: The outcome is recorded as rendered, hidden or failed, with the observed host capabilities.
- visible_feedback: Documentation (cockpit architecture page and UI README) states the evidenced Claude status. The terminal is described as not live-verified, with only protocol evidence and official documentation as sources.
- blocker_failure_behavior: Claude support is never claimed beyond the observed outcome.
- recovery_next_action: none
- observable_success: Evidence and documentation agree with the observation.
- required_evidence: A dated live observation record from the Code tab; documentation diff.

## 6. Non-Goals

- No new approval writer, approval by selection or click, automatic run continuation or changed gate semantics.
- No new cockpit features and no textual cockpit fallback or text status summary.
- No changes to the Codex cockpit profile `agdf-cockpit-local` or the Codex cockpit behavior.
- No support for Claude Desktop chat, claude.ai connectors, remote MCP servers, GitHub Copilot or OpenCode.
- No live verification of the Claude Code terminal in this scope.
- No public distribution, npm publication, release, Git commit or push.
- No transfer of approvals from `agdf-cockpit-mcp-app-20261005-01`.

## 7. Users And Roles

The AGDF maintainer working in Claude Code on Windows with the AGDF plugin installed from this repository. They are the product owner and the human approver of gates.

## 8. Constraints

- Reuse the existing cockpit contract, Core read services and React UI resource; there is no second cockpit implementation or UI packaging format.
- Keep Claude state in plugin-owned locations so that plugin uninstallation removes it.
- The task-target rule remains: the working directory alone is not target authority.
- The cockpit UI resource is about 1 MB; payload budgets and provenance digests apply.
- Claude must be restarted after reinstallation.

## 9. Evidence Requirements

- Protocol tests: a UI-capable client, a client without UI capability, the regular connection, and valid, missing and invalid project bindings.
- Isolated install and uninstall test, plus payload measurement.
- Affected existing suites (MCP, cockpit, plugin, UI, browser).
- One dated live Claude desktop Code tab observation on Windows with a byte-identical control-tree check.
- Documentation diff separating live, protocol and automated evidence.

## 10. Risks And Open Questions

- Official Claude documentation says Claude Code does not render MCP app UI. If the Code tab does not declare UI support, the tools stay hidden and the outcome is a documented limitation rather than a working embedded cockpit. Such an outcome counts as an acceptable, honest result under this PRD.
- A host might declare UI support without rendering it, or render it without declaring it. Only the live observation settles this; detection behavior is an SD decision.
- Whether the host-provided project root (`${CLAUDE_PROJECT_DIR}`) is a sufficient binding is an SD decision.
- The reused Codex cockpit run has not yet passed UAT; later changes there may require re-verification.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Behavior in hosts without MCP app UI support | before_prd | resolved | Hide the cockpit tools; no textual fallback; document the host requirement (user decision 2026-10-08) | Arndt Gold, PRD Owner |
| Acceptance-relevant Claude surfaces | before_prd | resolved | Only the Claude desktop Code tab on Windows is verified live; the terminal remains without live evidence (user decision 2026-10-08) | Arndt Gold, PRD Owner |
| Activation | before_prd | resolved | Plugin installation provides the cockpit connection without separate opt-in, derived from the approved UR | Arndt Gold, PRD Owner |
| Context and question actions | before_prd | resolved | Only where the host demonstrably supports them; otherwise the existing explanation | Arndt Gold, PRD Owner |
| Acceptance and distribution boundary | before_prd | resolved | An honest observed outcome (rendered, hidden or failed) is acceptable; local plugin installation only; no publication, release or Git action | Arndt Gold, PRD Owner |
| Capability detection, cockpit launch contract and project binding mechanism | later_sd | open | Choose within approved behavior; keep the Codex path unchanged | SD author through sd-definition |
| UI payload placement per plugin profile, provenance and budgets | later_sd | open | Bounded payload without a second UI packaging format | SD author through sd-definition |
| Early host probe sequence and concrete scenarios | later_tp | open | Probe the Code tab early; map all criteria and SD decisions to evidence | TP author through gate-check |

## 11. Next Step

Review the current PRD and approve only with `Approval: PRD`. Valid approval permits Solution Design authoring; implementation still requires its applicable later prerequisites.

## AGDF Approval Summary (de; source=en)

- Nutzerziel: Mit installiertem AGDF-Plugin in Claude Code das vorhandene Cockpit für einen genannten Run öffnen, ohne gesonderten Einrichtungsschritt.
- Umfang: Das Plugin bringt eine eigene Cockpit-Verbindung neben der regulären AGDF-Verbindung mit. In Hosts mit MCP-App-UI-Unterstützung öffnet sich das unveränderte Cockpit für den genannten Run. Hosts ohne diese Unterstützung bekommen keine Cockpit-Werkzeuge. Live geprüft wird nur der Code-Tab der Claude-Desktop-App unter Windows. Cockpit-UI, Lesedienste und Codex-Pfad bleiben unverändert.
- AC-001: Nach Installation und Neustart gibt es eine eigene Cockpit-Verbindung. Die reguläre AGDF-Verbindung bietet weiter nur `agdf_dispatch` und `agdf_inspect`. Ein Startfehler des Cockpits ist mit Grund sichtbar und lässt die reguläre Verbindung nutzbar.
- AC-002: In einem Host mit UI-Unterstützung werden `agdf_cockpit`, `agdf_cockpit_read` und die UI-Ressource angeboten. Das Cockpit öffnet für den genannten Run; ein unbekannter Run wird mit seiner Kennung gemeldet, kein anderer wird gewählt. Kontext- und Fragefunktionen gibt es nur bei nachgewiesener Host-Unterstützung.
- AC-003: In einem Host ohne UI-Unterstützung werden keine Cockpit-Werkzeuge angeboten, und es entsteht keine Lesesitzung. Die regulären AGDF-Werkzeuge bleiben verfügbar. Die Dokumentation nennt die Host-Voraussetzung.
- AC-004: Das Cockpit liest nur `.agdf/control/` des vom Host gelieferten Projekts. Fehlendes oder ungültiges Projekt bzw. fehlende Kontrolldaten werden ausdrücklich mit der erhaltenen Kennung gemeldet; es gibt keinen Rückgriff auf andere Verzeichnisse.
- AC-005: Öffnen, Lesen und Fehler ändern keine Kontrolldatei und geben nichts frei. Das wird im Live-Test byte-genau geprüft.
- AC-006: Die Installation bringt Verbindung und UI mit, die Deinstallation hinterlässt keine Reste. Der Größenzuwachs ist gemessen; Plugin-Profile anderer Hosts behalten ihre Budgets.
- AC-007: Codex-Cockpit samt Profil `agdf-cockpit-local`, MCP-Dispatch/-Inspektion und Browser-Cockpit bleiben unverändert und bestehen ihre Tests.
- AC-008: Im echten Code-Tab wird festgehalten, ob das Cockpit angezeigt, ausgeblendet oder fehlerhaft ist. Die Dokumentation gibt genau diesen Stand wieder; das Terminal gilt als nicht live geprüft.
- Entscheidungen: Laut deiner Entscheidung vom 2026-10-08 werden Cockpit-Werkzeuge in Hosts ohne UI ausgeblendet, statt einen Texthinweis zu liefern, und die Live-Abnahme umfasst nur den Code-Tab. Aktivierung erfolgt mit der Plugin-Installation. Ein ehrliches Ergebnis zählt als Abnahme: angezeigt, ausgeblendet oder Fehler. Offizielle Doku sagt, dass Claude Code keine MCP-App-UI rendert; dann ist eine dokumentierte Einschränkung das wahrscheinliche Ergebnis. Erkennung der Host-Fähigkeit, Startvertrag, Projektbindung sowie Platzierung und Budgets der UI-Nutzlast entscheidet SD; frühe Host-Probe und Szenarien legt der TP fest.
