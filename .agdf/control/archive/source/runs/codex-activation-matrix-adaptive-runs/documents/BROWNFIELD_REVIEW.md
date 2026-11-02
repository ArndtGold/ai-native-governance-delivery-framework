# Brownfield Review: Gezielte Wiederholungen der Codex-Aktivierungsmatrix

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: `done`

## Run

- run_id: `codex-activation-matrix-adaptive-runs`
- related_ur: `UR.md`, Revision `f197a330-92fa-4a64-8f32-19fea8db54df`
- current_gate: Brownfield Review
- reviewer: Codex
- reviewed_at: 2026-09-29

## Objective

Den bestehenden Codex-CLI-Matrix-Harness so erweitern, dass zehn frische Erstläufe standardmäßig genügen, nur definierte Fälle zwei weitere frische Läufe erhalten und die Pro-Sitzung-Messung den Dokumentensuchaufwand sichtbar macht.

## UI / UX Impact Routing

- delivery_context: `brownfield`
- ui_ux_impact: `low`
- ui_ux_impact_reason: Die textuelle CLI-Zusammenfassung und README werden für den Testbetreiber erweitert; es gibt keine neue Produktoberfläche, Aktivierungs- oder Recovery-Semantik.
- ux_intent_definition_required: `no`
- ux_intent_definition_result: `not_applicable`

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Request-Activation-Vertrag und zehn bestehende Fälle | `plugin/meta/contracts/request-activation.md`; `scripts/native-probes/codex-activation-matrix.mjs` `CASES`, `grade` | low: Erwartungen bleiben gleich; Auswahl der Wiederholungen wird präzisiert |
| Source of truth | Ein Matrix-Harness und dessen README | `scripts/native-probes/codex-activation-matrix.mjs`; `scripts/native-probes/README.md` | low: denselben Owner erweitern |
| Runtime path | Frisches Fixture und `codex exec --json --ephemeral` pro `runOne` | `runOne`, `runCodex`, `main` im Harness | low: Scheduling und Auswertung lokal ändern |
| UI / UX | `summary.txt` und `observation.json` | bestehender Ausgabe-Block in `main` | low: Auslöser und Messwerte ausweisen |
| Persistence / data | Wegwerf-Repos und lokale Rohprotokolle | `results`, `writeFileSync` im Harness | low: additive Felder in lokaler Evidenz |
| Tests / QA | Aktivierungsbefund aus strukturierten JSONL-Ereignissen und `git status` | `parseTranscript`, `grade`; historischer Bericht `evidence/codex-activation-matrix-20260928.md` | medium: adaptive Auswahl und Messwert-Parsing gezielt prüfen |
| Release / operations | Manuell gestartetes Maintenance-Probe-Script | `scripts/native-probes/README.md` | low: keine separate Ausrollung |

## Architecture Impact

- architecture_relevance: `architecture-not-applicable`
- architecture_impact: `none`
- architecture_reason: Der vorhandene Maintenance-Harness bleibt alleiniger Owner für Fallliste, Scheduling, JSONL-Auswertung und lokale Ergebnisdateien. Weder AGDF-Dispatcher noch Host-Integration, normativer Vertrag, externe API oder persistente Produktdaten werden geändert.
- architecture_evidence: `scripts/native-probes/codex-activation-matrix.mjs`, `scripts/native-probes/README.md`; getrennte historische Evidenz unter `scripts/native-probes/evidence/`.
- architecture_missing_evidence: `none`
- architecture_next_owner_and_action: Harness-Owner legt im PRD die wiederholbaren Auslöser und die Definition der Suchzählung fest.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| Bestehenden Harness erweitern | `runOne`, `grade`, `main` besitzen bereits frische Sitzungen und Fallbewertung | none | Scheduling und Messwerte dort ergänzen; keinen zweiten Runner schaffen |
| Rohereignisse nicht als fehlende Kostenwerte interpretieren | `parseTranscript` summiert heute nur `input_tokens` und `output_tokens`; `duration_ms` besteht bereits pro Lauf | warn | Cache-Felder versionstolerant lesen, fehlende Werte als unbekannt markieren |
| A4-Suchaufwand von Aktivierungsbefund trennen | A4 fragt ohne Quellbindung nach AGDF-Unterschieden; historischer Bericht zählt nur Aktivierung | warn | PRD entscheidet vor Implementierung über vorgegebene Quelle oder separate Dokumentensuch-Kennzeichnung |
| Erwartete Zielungeklärtheit nicht als Wiederholungsfehler zählen | historischer Bericht: 6/15 positive Läufe `target_unresolved` nach Dispatcher-Aufruf | warn | Auslöser an `grade` und explizite Grenzfallregeln binden |

## Mode / Slice Decision

- decision: `structured_slice`
- required_next_gate: `PRD`
- scope_reason: `bounded_structured_slice`: Das Vorhaben ändert das dokumentierte Verhalten des Maintenance-Probes und seine lokale Ergebnisstruktur in einem kohärenten, reversiblen Slice. `quick_task` ist wegen neuer Auswertungssemantik und Ausgabe-Felder zu schmal; `verified_change` scheidet wegen dokumentiertem CLI-/Ausgabeverhalten aus. Ein Full-Depth-Trigger liegt nicht vor, weil weder öffentlicher CLI-Vertrag noch AGDF- oder Host-Runtime geändert werden.
- evidence: `UR.md`; `scripts/native-probes/codex-activation-matrix.mjs`; `scripts/native-probes/README.md`; `scripts/native-probes/evidence/codex-activation-matrix-20260928.md`.
- transparency_note: PRD, SD und TP werden auf Scheduling, Messdefinition, A4-Auswertung und gezielte Tests dieses Harness begrenzt.

## Structured Depth Evidence

- depth_policy_version: `1`
- depth_facts_status: `complete`
- primary_reason_code: `bounded_structured_slice`
- decisive_full_depth_triggers: `none`
- rejected_alternative: `quick_task` und `verified_change` wegen geänderter dokumentierter Probe-Semantik; `structured_delivery` mangels externer, normativer oder Host-Grenzänderung.
- missing_or_conflicting_facts: `none`; JSONL-Feldverfügbarkeit ist ein Implementierungs-/Testdetail und wird mit unbekanntem Messwert behandelt.
- depth_evidence_refs: `UR.md`; `scripts/native-probes/codex-activation-matrix.mjs`; `scripts/native-probes/README.md`; `scripts/native-probes/evidence/codex-activation-matrix-20260928.md`.

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | UR beschränkt sich auf adaptive zehn-Fall-Matrix und Pro-Sitzung-Evidenz |
| authority_boundary | pass | Aktivierungsvertrag und `grade` bleiben normative bzw. Bewertungs-Owner |
| owner_consumer_coordination | pass | Ein Harness schreibt lokale `observation.json` und `summary.txt`; README beschreibt die Benutzung |
| full_depth_impacts_absent | pass | Kein AGDF-Dispatcher, öffentlicher CLI-Vertrag, Host-Protokoll, Release- oder Produktdatenpfad im Scope |
| migration_propagation_bounded | pass | Neue lokale Ergebnisfelder sind additiv; historische Evidenz bleibt unverändert |
| failure_recovery_local | pass | Jeder Lauf nutzt eigenes Wegwerf-Repo; Abbruch und Wiederholung betreffen nur diesen Probe-Lauf |
| independently_acceptable | pass | UR nennt unauffälligen zehn-Lauf-Fall, ausgelöste Dreifachläufe und Messwert-/A4-Signale |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Welche Fälle gelten vorab als Grenzfall, und welche Laufabweichungen lösen zwei weitere Sitzungen aus? | PRD | revise |
| Wird A4 mit einer expliziten Quelle eingegrenzt oder als Dokumentensuche getrennt ausgewiesen? | PRD | revise |
| Welche strukturierten Codex-Ereignisse zählen als Datei-/Shell-Suche, und wie wird fehlende Cache-Telemetrie gezeigt? | SD | warn |

## Context Graph Impact

- context_graph_impact: `none`
- context_graph_refs: `none`
- context_graph_required_action: `none`
- context_graph_gate_effect: `none`
- context_graph_evidence: Lokale Testorchestrierung und Evidenzfelder ändern keine wiederverwendbare Projektarchitektur oder SoT-Zuordnung.

## Next Permissible Step

- next_allowed_action: PRD für den abgegrenzten Matrix-Slice entwerfen und die beiden PRD-Entscheidungen schließen.
- forbidden_until_then: SD, TP, Implementierung, QA- oder Release-Behauptungen.

## Quality Outlook

- quality_outlook: Gezielte Parser-/Scheduling-Tests und mindestens ein frischer Codex-CLI-Lauf sind für die späteren Messbehauptungen erforderlich; Brutto-Token und Kosten bleiben getrennt.
