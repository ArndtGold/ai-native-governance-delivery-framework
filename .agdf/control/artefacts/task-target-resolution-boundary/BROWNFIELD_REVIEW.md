# Brownfield Review: Task Target Resolution Boundary

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: task-target-resolution-boundary
- related_ur: `.agdf/control/artefacts/task-target-resolution-boundary/UR.md`
- current_gate: Brownfield Review
- reviewer: agent
- reviewed_at: 2026-07-28

## Ziel

Die freigegebene UR so einordnen, dass AGDF das primäre Arbeitsziel vor
Repository-Aktivierung und Gate-Auswertung auflöst, ohne einen zweiten Scope-Classifier oder
Presentation-Owner einzuführen.

## UI-/UX-Impact-Routing

- delivery_context: `brownfield`
- ui_ux_impact: `medium`
- ui_ux_impact_reason: Die Änderung führt sichtbare Zustände für Ziel, Governance-Scope,
  Inhalts-Mismatch und Mehrziel-Ambiguität ein. Diese Zustände bestimmen, was Nutzer als
  aktuellen Arbeitsgegenstand und nächste zulässige Aktion verstehen.
- ux_intent_definition_required: `yes`
- ux_intent_definition_result: `ready`
  (`.agdf/control/artefacts/task-target-resolution-boundary/UX_INTENT_DEFINITION.md`,
  2026-07-28)

## Sicht auf das bestehende System

| Bereich | Bestehender Owner oder Artefakt | Befund | Impact |
|---|---|---|---|
| Einstieg und Routing | `plugin/meta/agdf-agent-router.md` | Aktivierung und Moduswahl beginnen repositorybezogen; ein vorgelagerter Task-Target-Schritt fehlt | `high` |
| Gate- und Scope-Semantik | `plugin/meta/contracts/gate-transition.md` | Source Precedence und Workstate/Scope Ambiguity behandeln bestehende Runs und Repositories, nicht das primäre Arbeitsobjekt | `medium` |
| Sichtbare Interaktion | `plugin/meta/contracts/interaction.md` | Scope Classification Card und nicht-autorisierende Presentation-Regeln sind wiederverwendbar | `medium` |
| Operativer Pfad | `plugin/skills/gate-check/SKILL.md` | Der Skill prüft den ausgewählten Repository-Kontrollzustand, bevor ein kanonisches Task Target vorliegt | `high` |
| Presentation | `create-agdf/lib/interaction-presentation.js` | Bestehender alleiniger Renderer kann eine kompakte Projektion aufnehmen; er darf die Target-Semantik nicht besitzen | `low` |
| Qualität | `plugin/scripts/check-runtime-integrity.mjs`, `evals/cases/gate-check.json` | Ownership- und Verhaltensprüfungen existieren und können erweitert werden | `low` |

## Abdeckung und Lücke

- existing_coverage: `partially_done`
- covered: Repositorybezogene Mehrfach-Run-Ambiguität, Scope Classification und
  nicht-autorisierende kompakte Darstellung sind bereits vorhanden.
- gap: Ein kanonischer, vorgelagerter Owner für `primary_target`, `evidence_sources`,
  `working_directory` und `governance_target` sowie dessen fail-closed Zustände fehlt.
- consequence: Die bestehende Scope Classification kann formal korrekt sein und trotzdem auf
  das falsche Repository oder Änderungsziel angewandt werden.

## Wiederverwendung und Parallelstruktur-Risiko

| Befund | Risiko | Erforderliche Maßnahme |
|---|---|---|
| Task Target Resolution liegt logisch vor Router-Aktivierung und Gate-Auswertung | `revise` | Einen fokussierten semantischen Contract definieren und Router sowie `gate-check` darauf verweisen |
| Scope Classification besitzt bereits Repository-Modus- und Boundary-Semantik | `block` bei Duplikation | Target Resolution nur zur Auswahl des Arbeits- und Governance-Ziels verwenden; keine zweite Modus- oder Gate-Entscheidung |
| `interaction-presentation.js` ist alleiniger Presentation-Owner | `warn` | Bestehenden Renderer nur für die menschliche Projektion erweitern; Semantik im Contract belassen |
| Mehrere generierte Oberflächen konsumieren Runtime-Regeln | `warn` | Bestehende Sync-Owner und Runtime-Integrity-Prüfungen verwenden |
| Folgeturn-Stabilität kann mit einer unbegrenzten impliziten Bindung verwechselt werden | `revise` | UX Intent muss Aktivierung, Zielwechsel, Blocker, Recovery und sichtbare Zustandsautorität definieren |

## Mode-/Slice-Entscheidung

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: Die Änderung betrifft normative Routing-Reihenfolge, einen neuen
  semantischen Contract, sichtbare Zustände und mehrere generierte Oberflächen. Damit ist sie
  größer als Quick Task oder Verified Change. Sie bleibt jedoch auf eine vorgelagerte
  Target-Grenze mit Wiederverwendung bestehender Scope-, Presentation-, Sync- und
  Test-Owner begrenzt; eine vollständige Structured Delivery wäre unverhältnismäßig.
- evidence: Bestehende Owner in der Systemübersicht; abgeschlossener Run
  `agdf-scope-classification-card`; aktuelle Router-, Gate-Transition-, Interaction-,
  `gate-check`-, Integrity- und Eval-Strukturen.

## Offene Produkt- und Designfragen

| Frage | Erforderlicher Schritt | Wirkung |
|---|---|---|
| Welche Quelle ist bei expliziter Datei, Repository-Hinweis, Anhang und `cwd` jeweils autoritativ? | UX Intent / PRD | `block` |
| Wann gilt ein Ziel über Folgeturns als stabil und wann als bewusst gewechselt? | UX Intent / PRD | `block` |
| Welche sichtbaren Zustände und Recovery-Aktionen gelten für `target_content_mismatch` und Mehrziel-Ambiguität? | UX Intent / PRD | `block` |
| Wird die Projektion in die bestehende Scope Classification Card integriert oder als klar abgegrenzter Orientierungsteil davor dargestellt? | PRD / SD | `revise` |
| Wo liegt der fokussierte normative Contract und wie wird er in generierte Oberflächen propagiert? | SD | `warn` |

## Context-Graph-Auswirkung

- context_graph_impact: `new_node_required`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY` (verwandter Presentation-Owner,
  keine Target-Semantik)
- context_graph_reconciliation: `open_gap`
- context_graph_required_action: Nach genehmigtem Design einen neuen Knoten für die
  vorgelagerte Task-Target-Autorität anlegen und bei Closeout reconciliieren.
- context_graph_gate_effect: `warning`
- context_graph_evidence: Im aktuellen Context Graph existiert kein Owner für die Trennung von
  primärem Ziel, Evidenzquelle, Arbeitsordner und Governance-Ziel.

## Nächster zulässiger Schritt

- next_allowed_action: Das aus der `ready` UX Intent Definition abgeleitete PRD prüfen und
  `Approval: PRD` anfordern.
- forbidden_until_then: SD, TP, Brownfield Analysis, Implementierung, QA, Release und Änderungen
  an Runtime- oder Presentation-Ownern.

## Quality Outlook

- quality_outlook: Die Lösung ist nur sauber, wenn Task Target Resolution exakt einmal vor
  Repository-Scope und Gate-Auswertung stattfindet und bestehende Scope- sowie
  Presentation-Owner unverändert autoritativ bleiben.
