# Brownfield Review: AGDF Live Host Conformance Matrix

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `agdf-live-host-conformance-matrix`
- related_ur: `.agdf/control/artefacts/agdf-live-host-conformance-matrix/UR.md`
- current_gate: PRD
- reviewer: agent
- reviewed_at: 2026-07-28

## Objective

Vorhandene Host-/UAT-/Capability-Evidenz wiederverwenden, aktuelle Ausführbarkeit und
Authentifizierungsgrenzen ehrlich bestimmen und den kleinsten sicheren Pfad für zwölf direkte
Conformance-Beobachtungen wählen.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `none`
- ui_ux_impact_reason: Der Run beobachtet und klassifiziert bestehendes sichtbares Verhalten; er
  ändert keine Nutzerfähigkeit, Interaktion, Recovery oder State-Semantik.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

Ein später gefundener UX- oder Produkt-Gap benötigt einen eigenen UR-Scope und eine neue
Impact-Einstufung.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Task Target | `task-target-resolution.md`; Target-Run | HC-01 bis HC-07 sind deterministisch/replay-getestet, aber nicht live über Attachments/Mehrturn | high |
| Gate/Run | `gate-transition.md`; run-scoped Control State; `gate-check` | exakte Approval- und Multi-Run-Regeln besitzen Repository-Evidenz | medium |
| Interaction | `interaction.md`; Renderer; Surface-Native-Runs | Host UI und native Fragen wurden nur teilweise direkt beobachtet | high |
| Capability | Surface Capabilities; Delivery Path Search | Codex/Claude evaluatorseitig tool-enforced; OpenCode standardmäßig instruction-only und invocation-abhängig | high |
| OpenCode | Activation-/Hardening-/Honesty-Runs | Provider-401 verhindert aktuellen live `tool_enforced`-Nachweis; Subagent-Pfad bleibt audit-only | high |
| Redaction | vorhandene UAT-/Eval-Grenzen | Secrets und private Vollprompts sind bereits als unzulässige Persistenz abgegrenzt | medium |
| Tests | Skill Evals, Runtime Integrity, Host-Probes | starke Baseline, aber keine gemeinsame aktuelle 3×12-Matrix | high |

## Aktuelle Host-Verfügbarkeit

| Host | Lokal beobachtet | Frühere direkte Evidenz | Aktuelle Grenze |
|---|---|---|---|
| Codex | CLI `0.145.0` installiert | Codex `0.142.4` war authentifiziert; exact-text fallback wurde beobachtet | aktuelle Authentifizierung und interaktive native Darstellung noch nicht revalidiert |
| Claude Code | CLI `2.1.193` installiert | gleiche Version war im Surface-Native-Run unauthentifiziert | Authentifizierung weiterhin unverified |
| OpenCode | CLI `1.18.3` installiert | `1.17.13` hatte konfigurierte Credentials; späterer Evaluator erhielt 401 `No provider available` | aktuelle Provider-/Modell-Authentifizierung unverified |

CLI-Präsenz oder frühere Credentials werden nicht als aktuelle authentifizierte Conformance gewertet.

## Coverage vor diesem Run

| Fallgruppe | Coverage | Reuse |
|---|---|---|
| HC-01 bis HC-07 Target/Mehrturn/Attachment | `partially_done` | deterministische Fälle als Erwartungsbaseline, nicht als Live-Pass |
| HC-08 Aktivierung/Neustart | `partially_done` | Lifecycle-/Activation-Tests und frühere UAT-Grenzen |
| HC-09 mehrere Runs | `partially_done` | Resolver-/CLI-Regressionen; interaktiver Hostfall fehlt |
| HC-10/HC-11 Approval | `partially_done` | exakte Validatoren und aktueller Codex-Fallback; native Host-Transporte unvollständig |
| HC-12 Enforcement/Subagent | `partially_done` | OpenCode-Subagent-Grenze und Surface Capabilities; Cross-Surface-Beobachtung fehlt |
| gemeinsame redigierte 3×12-Matrix | `not_done` | neu als run-eigenes Evidenzartefakt |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Erwartungssemantik besitzt bereits kanonische Contracts | Target, Gate Transition, Interaction, Capabilities | block | Matrix referenziert Erwartungen; keine zweite Policy-Tabelle |
| Frühere Host-Evidenz ist versioniert und teilweise veraltet | Surface-Native-, OpenCode- und Target-Artefakte | revise | als Baseline nutzen, kritische Aussagen frisch beobachten |
| Host-Authentifizierung ist nicht einheitlich verfügbar | frühere Claude-Unverfügbarkeit und OpenCode-401 | revise | Preflight pro Host; `host_unavailable` statt simuliertem Pass |
| HC-08 kann Neustart oder Konfiguration berühren | Lifecycle Owner | block | Testplan muss read-only Beobachtung von externer Mutation trennen |
| Diagnose könnte in Reparatur driften | UR-Nicht-Ziel | block | `product_gap` stoppt und routet zu separater UR |
| Matrix könnte neuer Capability-Owner werden | bestehende Surface Capabilities | block | Matrix ist Evidenzview, keine normative Autorität |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: Keine Produktänderung, aber zwölf Fälle über drei authentifizierte Hosts,
  Datenschutz/Redaction, potenzielle Neustart-/Mutationsgrenzen und versionsgebundene Evidenz
  erfordern einen kleinen formalen Beobachtungs-, Sicherheits- und Test-Slice.
- evidence: genehmigte Child-UR; aktueller CLI-Versionsprobe; vorhandene Target-/Interaction-/
  OpenCode-/Delivery-Path-Artefakte; dokumentierte Authentifizierungs- und Live-Host-Lücken.
- transparency_note: PRD, SD und TP bleiben bewusst klein und definieren nur Beobachtung,
  Redaction, Preflight und Evidenzauswertung. Runtime- oder Produktänderung ist ausgeschlossen.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Welche vorhandene Beobachtung darf nur Hintergrund und welche darf frische Matrixevidenz sein? | PRD | revise |
| Welche Fälle benötigen interaktive Host-UI statt headless CLI? | PRD | revise |
| Welche Preflights belegen Authentifizierung ohne Secrets offenzulegen? | SD | revise |
| Wie werden Neustart-/Attachment-Fälle ohne unautorisierte Konfigurationsmutation ausgeführt? | SD | revise |
| Welche Wegwerf-Workspaces und synthetischen Attachments isolieren HC-01 bis HC-09? | TP | revise |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-TASK-TARGET-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`;
  `CG-DELIVERY-PATH-SEARCH`; `CG-RUN-SCOPED-CONTROL-STATE`
- context_graph_required_action: `link`
- context_graph_gate_effect: `none`
- context_graph_evidence: Der Run beobachtet bestehende Autoritäten; einzelne Host-Versionen und
  Testresultate sind keine neuen Graph-Knoten.

## Next Permissible Step

- next_allowed_action: kleinen PRD für Beobachtungsumfang, Freshness, Pass-/Limit-Regeln und
  Redaction entwerfen.
- forbidden_until_then: SD, TP, Host-Ausführung, Produktreparatur, VCS und Release.

## Quality Outlook

- quality_outlook: Ein ehrliches `host_unavailable` oder `limitation` ist qualitativ besser als
  ein aus Fixtures oder alter Evidenz abgeleiteter Live-Pass.
