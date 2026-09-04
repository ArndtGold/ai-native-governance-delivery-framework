# PRD: Cross-Surface Skill Target Preflight

Status: draft
Gate: PRD
Gate approval: open
Based on: approved UR and completed Brownfield Review
Date: 2026-09-03
Owner: Arndt Gold

## 1. Product Scope

AGDF muss direkte Aufrufe evidenzabhängiger Skills auf Codex, Claude Code, GitHub Copilot und
OpenCode vor jedem Repository-, Run- oder Evidenzzugriff durch die bestehende Task Target Resolution
führen. Der erste Slice schließt den beobachteten `qa-gate`-Fehlpfad und definiert die gemeinsame
Anwendungsgrenze für weitere evidenzabhängige Skills. Nach einem aufgelösten Ziel liest der Skill
vorhandene Governance-Evidenz selbst und erzeugt nur seinen eigenen kanonischen Output.

## 2. UX Intent And Success

- ui_ux_impact: `medium`
- ux_intent_definition: `ready` in
  `.agdf/control/artefacts/cross-surface-skill-target-preflight/UX_INTENT_DEFINITION.md`
- primary_user_intent: Einen AGDF-Skill direkt nutzen, ohne Repository- und Evidenzkontext manuell
  rekonstruieren zu müssen.
- success_signal: Zielklärung oder skill-spezifisches Ergebnis erscheint lokalisiert, eindeutig und
  ohne erfundene Karte, falsche Repository-Autorität oder freie Ersatzfragen.
- primary_decision_or_action: Bei ungeklärtem Ziel genau ein Ziel benennen; bei geklärtem Ziel das
  kanonische Skill-Ergebnis prüfen.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| `target_unresolved` | keine Repository-, Run- oder Gate-Autorität | Task Target Orientation und eine Recovery-Aktion | Target-Contract und `target-check` | `interaction-presentation.js` |
| `governed_target_resolved` | genau ein Governance-Repository und auswählbarer Run | optional knappe Orientierung, danach Skill-Output | Target-Contract und `.agdf/control/` | Target-Renderer, danach aufgerufener Skill |
| `evidence_incomplete` | skill-spezifische starke Entscheidung ist nicht zulässig | entscheidender Gap, Grund und nächster Schritt | Quality Contract und durable Reviews | aufgerufener Skill |
| `skill_result_ready` | skill-spezifisches Ergebnis ist evidenzbasiert | QA-Entscheidung oder anderer definierter Skill-Output | jeweiliger Skill-Contract | aufgerufener Skill |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Aktiv bei direktem Aufruf eines im SD festgelegten
  evidenzabhängigen Skills; endet nach unresolved Orientierung oder dem skill-spezifischen Ergebnis.
- blockers_and_visible_next_actions: Kein, mehrdeutiges, unzugängliches oder inhaltlich unpassendes
  Ziel verlangt genau die kanonische Recovery-Aktion; fehlende QA-Evidenz verlangt Review-Korrektur
  oder Evidenznachweis.
- recovery_paths: Ziel oder Zugriff bereitstellen und denselben Skill erneut ausführen; bei
  aufgelöstem Repository offene Findings am kanonischen Owner beheben und QA erneut ausführen.
- relevant_state_transitions: Aufruf -> Zielprüfung -> unresolved terminal oder resolved;
  resolved -> Repository/Run/Evidenz -> revise/block oder ready; jede Änderung des expliziten Ziels
  beendet die alte Bindung.

## 5. Acceptance Criteria

### CSTP-01 — Target first

- working_mode: alle direkten evidenzabhängigen Skill-Aufrufe
- source_state: Skill wurde direkt aufgerufen
- trigger/action: Nutzer startet den Skill
- expected_effective_state: Ziel wird vor Repository-, Run- und Evidenzzugriff aufgelöst oder revalidiert
- visible_feedback: kanonische Orientierung nur wenn erforderlich
- blocker/failure behavior: unresolved stoppt terminal
- recovery/next action: kleinste kanonische Ziel-Recovery
- observable success: kein nachgelagerter Skill-Schritt vor erfolgreicher Zielauflösung
- required evidence: deterministische Eval- und Runtime-Integrity-Prüfung

### CSTP-02 — No cwd authority

- working_mode: repo-loser Hostchat
- source_state: Host liefert nur einen Arbeitsordner
- trigger/action: direkter Skill-Aufruf
- expected_effective_state: kein primäres oder Governance-Ziel
- visible_feedback: lokalisierte `no_reliable_target`-Orientierung
- blocker/failure behavior: kein doctor, Run-Select, QA oder Approval
- recovery/next action: ein Ziel benennen
- observable success: Chat-/Temp-Verzeichnis wird nie `current_repository`
- required evidence: Resolver- und Hostprofiltests

### CSTP-03 — Self-service repository evidence

- working_mode: aufgelöstes Governance-Repository
- source_state: `.agdf/control/` enthält relevante Artefakte
- trigger/action: direkter `qa-gate`-Aufruf
- expected_effective_state: QA liest TP, Reviews, Tests, Brownfield- und Run-Evidenz selbst
- visible_feedback: genau eine QA-Entscheidung mit entscheidendem Grund
- blocker/failure behavior: fehlende Evidenz senkt die Entscheidung
- recovery/next action: genau ein zulässiger Korrektur- oder Evidenzschritt
- observable success: keine pauschale Bitte, vorhandene Repository-Daten manuell zu liefern
- required evidence: Fixture mit vollständiger und unvollständiger QA-Evidenz

### CSTP-04 — Skill output ownership

- working_mode: resolved oder evidence_incomplete
- source_state: Target-Preflight ist abgeschlossen
- trigger/action: Skill setzt fort
- expected_effective_state: nur der Output des aufgerufenen Skills wird erzeugt
- visible_feedback: `qa-gate` liefert `pass | revise | block`; `gate-check` besitzt die Run Status Card
- blocker/failure behavior: keine erfundene interaktive Karte
- recovery/next action: kanonischer skill-spezifischer nächster Schritt
- observable success: Statuskarte, Quality Readiness und QA-Entscheidung bleiben getrennt
- required evidence: Interaction- und Skill-Evals

### CSTP-05 — Locale consistency

- working_mode: jeder unterstützte Host
- source_state: Gesprächssprache ist bestimmbar
- trigger/action: Orientierung oder Skill-Ergebnis wird dargestellt
- expected_effective_state: ein vollständiger unterstützter Locale-Pack wird verwendet
- visible_feedback: Karte, Werte und Rückfrage verwenden dieselbe Sprache
- blocker/failure behavior: ungültiger Registry-Zustand scheitert geschlossen
- recovery/next action: Registry oder Spracheingabe korrigieren
- observable success: keine gemischtsprachige Antwort
- required evidence: deutsche und englische Fixtures

### CSTP-06 — Cross-surface propagation

- working_mode: Codex, Claude Code, GitHub Copilot und OpenCode
- source_state: kanonische Quellen sind geändert
- trigger/action: bestehende Profilgenerierung läuft
- expected_effective_state: alle vier Profile enthalten semantisch identische Pflichten
- visible_feedback: hostgerechte Pfade, gleiche Autorität und gleiche Fail-closed-Semantik
- blocker/failure behavior: Drift stoppt Runtime Integrity oder Conformance
- recovery/next action: kanonische Quelle oder Generator korrigieren
- observable success: keine manuell gepflegten Host-Forks
- required evidence: Sync-, Profil- und Conformance-Tests

### CSTP-07 — Approval boundary

- working_mode: jeder direkte Skill-Aufruf
- source_state: Host bietet Tool-, Plan- oder Permission-Interaktion
- trigger/action: Skill benötigt eine AGDF-Freigabe
- expected_effective_state: nur exaktes `Approval: <GateName>` nach Revalidierung ist autoritativ
- visible_feedback: keine Gleichsetzung mit Hostbestätigung
- blocker/failure behavior: unsichere Interaktion verändert keine Authority
- recovery/next action: exakte Textfreigabe verwenden
- observable success: kein automatischer Gate-Fortschritt
- required evidence: adversarial Skill-Eval

### CSTP-08 — Honest host evidence

- working_mode: generierter oder installierter Host
- source_state: Repository- und Paketprüfungen bestehen
- trigger/action: QA oder UAT bewertet Parität
- expected_effective_state: Source, Bundle, Installation und geladene Hostbeobachtung bleiben getrennt
- visible_feedback: nicht beobachtete Hosts werden nicht als bestanden dargestellt
- blocker/failure behavior: fehlende Hostevidenz bleibt sichtbar
- recovery/next action: separat autorisierte Fresh-Session-Beobachtung
- observable success: keine inferierte Cross-Host-Parität
- required evidence: hostweise Evidenzmatrix

## 6. Non-Goals

- Kein neuer Target-Resolver, Renderer, Gate oder Approval-Wert.
- Keine Änderung des öffentlichen CLI-Schemas außer wenn SD eine bereits vorhandene interne
  Orchestrierung als zwingend nachweist und eine PRD-Revision erfolgt.
- Keine automatische Installation, Aktivierung, QA, UAT oder Veröffentlichung.
- Keine vollständige Neugestaltung aller AGDF-Skills außerhalb der evidenzabhängigen Aufrufgrenze.

## 7. Users And Roles

- Nutzer: Personen, die AGDF-Skills direkt in Codex, Claude Code, Copilot oder OpenCode aufrufen.
- Product Authority: freigegebene UR und PRD.
- Target Authority: kanonischer Task-Target-Contract und Resolver.
- QA Decision Owner: `qa-gate`.
- Status Presentation Owner: `gate-check` plus kanonischer Interaction-Renderer.

## 8. Constraints

- Bestehende Gate- und Approval-Semantik bleibt unverändert.
- Kanonische Quellen liegen unter `plugin/` und `create-agdf/`; generierte Profile sind abgeleitet.
- Ein Host-Arbeitsordner ist ohne semantische Auswahl keine Zielautorität.
- Die Lösung muss ohne Netzwerkzugriff deterministisch testbar bleiben.
- Geladene Hostevidenz ist separat von Repository-, Bundle- und Installationsnachweisen.

## 9. Evidence Requirements

- Unit-/Fixture-Abdeckung für resolved und alle unresolved Zielzustände.
- QA-Fälle mit vollständiger, fehlender und widersprüchlicher Evidenz.
- Adversarial Evals gegen cwd-Autorität, manuelle Evidenzabwälzung, erfundene Karte und Approval-Leak.
- Runtime Integrity und Agent Skills Conformance über alle generierten Profile.
- Vollständiger `create-agdf` Smoke-Test.
- Separat ausgewiesene Fresh-Session-Beobachtung je beanspruchtem Host.

## 10. Risks And Open Questions

- SD muss bestimmen, ob ein fokussierter Direct-Invocation-Contract oder eine kurze Pflicht in jedem
  betroffenen Skill die kleinste driftarme Lösung ist.
- Die Liste evidenzabhängiger Skills muss begründet und begrenzt werden.
- Hostseitiges Skill-Routing kann globale Router-Instruktionen unterschiedlich laden.
- Bereits geladene Sessions können alte Skill-Bytes behalten.

## 11. Next Step

Review this PRD and approve only with:

`Approval: PRD`
