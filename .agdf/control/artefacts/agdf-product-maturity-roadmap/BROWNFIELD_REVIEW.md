# Brownfield Review: AGDF Product Maturity Roadmap

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `agdf-product-maturity-roadmap`
- related_ur: `.agdf/control/artefacts/agdf-product-maturity-roadmap/UR.md`
- current_gate: PRD
- reviewer: agent
- reviewed_at: 2026-07-28

## Objective

Die fünf genehmigten Reifegradlinien gegen bestehende AGDF-Owner, abgeschlossene Lösungen, aktive
Runs und reale Evidenzlücken prüfen und daraus einen minimalen, nicht-duplizierenden Lieferzuschnitt
ableiten.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `high`
- ui_ux_impact_reason: Standardinteraktion, sichtbare Zeremonie, Pfadverständlichkeit,
  Blocker/Recovery und Progressive Disclosure ändern die primäre Nutzerreise über mehrere Hosts.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready`

Die UX-Intent-Analyse ist als nicht-autorisierende PRD-Eingabe unter
`UX_INTENT_DEFINITION.md` dokumentiert.

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Produktsemantik | `modes.md`, `gate-transition.md`, `task-target-resolution.md` | Quick Task, Compact Delivery, Structured Delivery, Target Resolution und Challenge Path bestehen | high |
| Source of Truth | `.agdf/control/runs/*/RUN_STATE.md`, Run Resolver, Artefact Chain | run-scoped Authority und Mehrfach-Run-Isolation sind implementiert | medium |
| Runtime-Pfad | Router, fokussierte Contracts, Skills, lokaler Validator, Generated Surfaces | Runtime Integrity und Package Smoke prüfen Source-/Installed-Layouts | high |
| UI / UX | `interaction.md`, `interaction-presentation.js`, Locale Registry | Status-, Gate-, Scope-, Target-, Rationale- und Quality-Projektionen bestehen | high |
| Enforcement | Delivery Path Search `capabilities.js`, Host-Adapter, Validatoren | Codex/Claude tool-enforced Teilpfade; OpenCode invocation-abhängig; Copilot/generic instruction-only | high |
| Evals / QA | versioniertes Skill-Eval-Corpus, Interaction-/Control-State-/Integrity-Tests | 47 deterministische Fälle; Replay bleibt ausdrücklich kein Live-Host-Proof | high |
| Release / Operations | Installer-/Lifecycle-Owner, exact-version lokaler Validator | Installation, Aktivierung und Delivery Status sind getrennt; reale installierte Hosts bleiben teilweise UAT-Grenze | medium |

## Coverage der fünf Roadmap-Linien

| Linie | Aktuelle Abdeckung | Reuse-Entscheidung | Reale Restlücke |
|---|---|---|---|
| R1 sichtbare Zeremonie | `partially_done` | bestehende Compact-Delivery-, Status- und Interaction-Owner erweitern; zuerst offenen Interaction-UAT bewerten | durchgängiges Interaktionsbudget und reale Journey-Evidenz fehlen |
| R2 technische Durchsetzung | `partially_done` | bestehende Capability-/Validator-/Adapter-Klassifikation konsolidieren, nicht neu erfinden | keine vollständige garantiebezogene Enforcement-Matrix für alle kritischen Grenzen und Hosts |
| R3 Host-/Mehrturn-UAT | `partially_done` | vorhandene Live-Probes und UAT-Artefakte als Baseline wiederverwenden | gemeinsame authentifizierte Conformance-Matrix für Target, Attachment, Approval, Aktivierung und Recovery fehlt |
| R4 Proportionalität | `partially_done` | bestehende Modes, Scope Classification, Gate Rationale und Skill Evals erweitern | kalibriertes Real-Task-Benchmark-Korpus und getrennte Über-/Unter-Governance-Metriken fehlen |
| R5 einfache UX | `partially_done` | einziger Interaction-/Presentation-Owner bleibt bestehen | zusammenhängende novice-taugliche Journey und Live-Host-Verständlichkeitsnachweis fehlen |

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Interaction und Progressive Disclosure besitzen bereits einen normativen Owner | `CG-NATIVE-INTERACTION-AUTHORITY`; `interaction.md` | block | Keine zweite UX-, Card- oder Dashboard-Autorität anlegen |
| Proportionalität besitzt bestehende Mode-, Gate- und Scope-Owner | `modes.md`; `gate-transition.md`; Scope Classification | block | Benchmark und Kriterien in bestehende Owner integrieren |
| Enforcement ist surface- und invocation-spezifisch | `CG-DELIVERY-PATH-SEARCH`; OpenCode-Honesty-Evidenz | block | Keine globale Garantie aus Teilpfaden ableiten |
| Mehrere aktive Runs besitzen angrenzenden Scope | Task Target, Interaction, OpenCode Activation/Hardening | revise | Erst UAT/Status übernehmen, keine fremden Artefakte oder Diffs neu attribuieren |
| Roadmap könnte zu einem Mega-TP werden | UR-Nicht-Ziel und fünf unabhängige Restlücken | block | Roadmap-PRD definiert Grenzen; ausführbare Arbeit wird in eigenständige Runs geschnitten |

## Minimaler Lieferzuschnitt

Die Roadmap bleibt ein koordinierender `structured_delivery`-Scope. Sie definiert ein gemeinsames
Zielbild, messbare Reifegradkriterien, Abhängigkeiten und eine priorisierte Run-Grenze, implementiert
aber nicht alle fünf Linien gemeinsam.

Empfohlene ausführbare Reihenfolge:

1. offene QA-/UAT-Baselines abschließen oder ihre Evidenzgrenze dauerhaft festhalten;
2. eigenständiger erster Run `agdf-live-host-conformance-matrix`;
3. erst anhand dieser Befunde getrennte Folgeruns für Proportionalität/Zeremonie,
   Enforcement-Lücken und die vereinfachte Journey eröffnen;
4. keine Folge-UR vor einem konkreten Gap und kanonischen Owner.

## Mode / Slice Decision

- decision: `structured_delivery`
- required_next_gate: `PRD`
- scope_reason: Die Roadmap verändert Produktversprechen, UX, Routing-Qualität und
  Enforcement-Transparenz über mehrere Hosts und kanonische Owner. Ein strukturierter Rahmen ist
  erforderlich; Implementierung muss dennoch in kleine eigenständige Runs zerlegt werden.
- evidence: genehmigte Roadmap-UR; bestehende Context-Graph-Owner; aktive Task-Target-, Interaction-
  und OpenCode-Runs; dokumentierte Live-Host-Evidenzgrenzen.
- transparency_note: Der volle Roadmap-Pfad rechtfertigt nur Zielbild, Messmodell und Run-Schnitt.
  Er autorisiert keinen gemeinsamen Implementierungs-TP für alle fünf Linien.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Welche Reifegradmetriken sind verbindlich und welche nur diagnostisch? | PRD | revise |
| Welche Hosts gehören zur verbindlichen Conformance-Baseline und welche bleiben best effort? | PRD | revise |
| Welche konkreten kritischen Garantien müssen in die Enforcement-Matrix? | PRD | revise |
| Wie werden Interaktionsbudget und Über-/Unter-Governance gemessen, ohne Sicherheit zu optimieren weg? | PRD | revise |
| Welche technischen Owner werden je Folgerun erweitert? | SD | revise |

## Context Graph Impact

- context_graph_impact: `link_only`
- context_graph_refs: `CG-TASK-TARGET-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`;
  `CG-DOCUMENTATION-CEREMONY-BOUNDARY`; `CG-DELIVERY-PATH-SEARCH`;
  `CG-RUN-STATUS-CARD`; `CG-UX-INTENT-BEFORE-PRD`
- context_graph_required_action: `link`
- context_graph_gate_effect: `none`
- context_graph_evidence: Die Roadmap koordiniert bestehende Autoritätsknoten, schafft aber noch
  keine neue dauerhafte Architekturentscheidung.

## Next Permissible Step

- next_allowed_action: PRD als messbaren Roadmap-Rahmen entwerfen; keine Folge-Implementierung und
  keinen Mega-TP vor PRD-Freigabe.
- forbidden_until_then: SD, TP, Implementierung, neue Enforcement-/UX-Owner, VCS und Release.

## Quality Outlook

- quality_outlook: Roadmap-Erfolg muss weniger sichtbare Reibung und mindestens gleichbleibende
  Schutzwirkung gemeinsam nachweisen; reine Interaktionsreduktion ist kein Pass.
