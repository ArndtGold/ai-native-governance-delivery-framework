# UX Intent Definition: Task Target Resolution Boundary

Status: ready
Decision: ready
Based on: freigegebene UR und Post-UR-Routing
Date: 2026-07-28
Owner: agent

Diese Analyse ist nicht autorisierend. Sie ist kein User Gate, enthält keine Freigabe und erteilt
keine Implementierungserlaubnis. Nach PRD-Freigabe ist ausschließlich das PRD die
Produktanforderungs-Autorität.

## 1. Routing-Evidenz

- delivery_context: `brownfield`
- ui_ux_impact: `medium`
- ui_ux_impact_reason: Nutzer müssen erkennen können, welches Artefakt tatsächlich bearbeitet wird,
  welches Repository nur Evidenz liefert und warum AGDF für einen bestimmten Scope aktiv ist oder
  eine Klärung verlangt.
- ux_intent_definition_required: `yes`

## 2. Intent und Erfolg

- primary_user_intent: Ein Nutzer möchte, dass der Agent die konkret beauftragte Datei, das
  Artefakt oder das Repository bearbeitet, ohne aus `cwd`, Projekterwähnungen oder Evidenzquellen
  stillschweigend ein anderes Änderungsziel abzuleiten.
- success_signal: Vor jeder repositorybezogenen Aktivierung oder Mutation ist genau ein primäres
  Arbeitsziel wirksam oder ein sichtbarer fail-closed Zustand aktiv. Das sichtbare Ziel entspricht
  der expliziten Anfrage oder einer erkennbar fortgesetzten bestätigten Zielbindung.
- primary_decision_or_action: Der Nutzer bestätigt das Ziel implizit durch eine eindeutige Anfrage
  oder explizit bei Mehrziel-Ambiguität, Inhalts-Mismatch beziehungsweise bewusstem Zielwechsel.

## 3. Working Modes und State

- working_modes:
  1. `explicit_single_target`: Der aktuelle Turn benennt genau ein bearbeitbares Ziel.
  2. `continued_confirmed_target`: Ein Folgeturn setzt das zuletzt bestätigte Ziel eindeutig fort.
  3. `unresolved_target`: Mehrere Änderungsziele sind plausibel oder kein belastbares Ziel ist
     auflösbar.
- effective_state_by_mode:
  1. `explicit_single_target`: Das explizite Ziel ist `primary_target`; `cwd` und erwähnte
     Repositories bleiben Arbeitskontext oder Evidenz, sofern sie nicht selbst beauftragt sind.
  2. `continued_confirmed_target`: Das bestätigte Ziel bleibt wirksam, solange Inhalt und Handlung
     erkennbar dieselbe Aufgabe fortsetzen und kein expliziter Zielwechsel erfolgt.
  3. `unresolved_target`: Es gibt kein autorisiertes Änderungs- oder Governance-Ziel; Mutation und
     Gate-Auswertung bleiben gesperrt.
- visible_state_types: kompakte Orientierung mit primärem Ziel, Governance-Ziel und davon getrennten
  Evidenzquellen; sichtbare Zustände `target_content_mismatch`, `target_unavailable`,
  `multiple_plausible_targets` und `target_changed`.
- effective_state_authority_by_mode:
  1. `explicit_single_target`: die explizite aktuelle Nutzeranfrage;
  2. `continued_confirmed_target`: die letzte bestätigte Nutzeranfrage plus die eindeutige
     Fortsetzungssemantik des aktuellen Turns;
  3. `unresolved_target`: keine implizite Quelle ist autoritativ; nur eine Nutzerklärung kann den
     Zustand auflösen.
- primary_state_presentation_owner_by_mode: die kanonische AGDF-Interaktionsdarstellung; sie
  projiziert das aufgelöste Ergebnis und entscheidet es nicht. Der aktuelle Arbeitsordner ist in
  keinem Modus Zustandsautorität.

## 4. Aktivierung, Blocker, Recovery und Transitionen

- activation_paths: Task Target Resolution startet bei einer neuen Arbeitsanfrage vor
  Repository-Aktivierung, Scope Classification und Gate-Auswertung; bei eindeutigen Folgeturns wird
  die bestehende Zielbindung revalidiert.
- deactivation_paths: Abschluss oder ausdrücklicher Abbruch der Aufgabe; expliziter Zielwechsel;
  Verlust der Fortsetzungssemantik; Entstehung einer Mehrziel-Ambiguität.
- blockers:
  - mehrere plausible Änderungsziele → sichtbare Zielklärung;
  - Zieldatei oder Artefakt nicht verfügbar → Verfügbarkeit benennen und erneute Bereitstellung
    ermöglichen;
  - angefragte Inhaltsänderung passt nicht zum Zielinhalt → `target_content_mismatch`, keine stille
    Ausweitung auf ein erwähntes Repository;
  - explizites Ziel und fortgesetztes Ziel widersprechen sich → aktuelles explizites Ziel gewinnt,
    Zielwechsel wird sichtbar.
- recovery_paths:
  - Nutzer benennt ein Ziel eindeutig → Resolution erneut ausführen;
  - Nutzer stellt fehlendes Ziel bereit → Verfügbarkeit erneut prüfen und sichtbar wiederholen;
  - bei Inhalts-Mismatch → Ziel oder Änderungsabsicht klären, danach neu auflösen;
  - bei bewusstem Zielwechsel → neues Ziel sichtbar aktivieren, alte Zielbindung beenden.
- relevant_state_transitions:
  - `unresolved → explicit_single_target` durch eindeutige Nutzerklärung;
  - `explicit_single_target → continued_confirmed_target` durch eindeutigen Folgeturn;
  - `continued_confirmed_target → explicit_single_target` durch expliziten Zielwechsel;
  - `resolved → target_content_mismatch` durch belegten Inhaltswiderspruch;
  - `target_content_mismatch → resolved` durch geklärtes Ziel oder geklärte Änderungsabsicht;
  - `resolved → unresolved_target` durch neue Mehrziel-Ambiguität.

## 5. Vorgeschlagene PRD-Akzeptanzkriterien

1. Eine explizit benannte Datei oder ein explizit benanntes Artefakt hat Vorrang vor `cwd`.
2. Evidenzquellen autorisieren weder Mutation noch repositorybezogene AGDF-Aktivierung.
3. Repository-Aktivierung, Scope Classification und Gate-Auswertung erfolgen erst nach erfolgreicher
   Target Resolution.
4. Ein eindeutiger Folgeturn behält das bestätigte Ziel bei.
5. Ein expliziter Zielwechsel ersetzt die alte Zielbindung und wird sichtbar.
6. Mehrere plausible Änderungsziele sperren Mutation bis zur Klärung.
7. `target_content_mismatch` erweitert den Scope nicht stillschweigend.
8. Ein nicht verfügbares Ziel bietet eine sichtbare erneute Bereitstellungs- und Retry-Aktion.
9. Die Darstellung trennt primäres Ziel, Governance-Ziel, Evidenzquellen und `cwd`.
10. Die Darstellung ist nicht autorisierend und erzeugt kein neues Gate.

## 6. Entscheidungsevidenz

- blocking_reason: none
- open_product_questions: none blocking; technische Contract-Platzierung, Datenform und
  Propagation bleiben SD-Fragen.
- affected_outputs: Router-Einstieg, `gate-check`-Orientierung und Scope-Presentation,
  generierte Agent-Oberflächen sowie Behavioral Evals.
- evidence: freigegebene UR; Brownfield Review; bestehende Scope Classification Card;
  Router-, Gate-Transition-, Interaction-, `gate-check`-, Renderer-, Integrity- und Eval-Owner.
- missing_evidence: keine blockierende Produkt-Evidenz; technische und
  Implementierungs-Evidenz entstehen erst in SD, TP und CD+Tests.
- required_next_step: PRD aus dieser Analyse ableiten, Kriterien produktseitig festlegen und
  `Approval: PRD` anfordern.
