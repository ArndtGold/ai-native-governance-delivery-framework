# PRD: Task Target Resolution Boundary

Status: approved
Gate: PRD
Gate approval: `Approval: PRD` accepted on 2026-07-28 after same-run, same-gate, revision and durable-artefact revalidation.
Based on: UR (approved 2026-07-28), UX Intent Definition (`ready`, 2026-07-28)
Date: 2026-07-28
Owner: user / agent

## 1. Product Scope

AGDF erhält eine kanonische Task Target Resolution Boundary vor Repository-Aktivierung, Scope
Classification und Gate-Auswertung. Sie bestimmt das primäre Arbeitsziel der Anfrage, trennt es von
Evidenzquellen und `cwd`, hält es über eindeutige Folgeturns stabil und stoppt bei Mehrziel-
Ambiguität, Nichtverfügbarkeit oder Inhalts-Mismatch sichtbar und fail-closed.

Produktentscheidungen:

1. **Autoritätsreihenfolge:** Ein explizites Ziel im aktuellen Turn gewinnt. Danach kann ein
   eindeutig fortgesetztes, zuvor bestätigtes Ziel gelten. `cwd` ist nur Kontext und nur dann
   Zielkandidat, wenn die Anfrage tatsächlich Repository-Arbeit dort verlangt.
2. **Evidenzgrenze:** Erwähnung, Inspektion oder fachliche Relevanz eines Repositories macht es
   nicht zum Mutation Target.
3. **Governance-Aktivierung:** Erst das aufgelöste Arbeitsziel bestimmt, ob und für welches
   Repository AGDF aktiviert wird.
4. **Stabilität:** Eine eindeutige Fortsetzung behält das Ziel bei; ein expliziter Zielwechsel gewinnt
   und wird sichtbar.
5. **Fail-closed:** Mehrziel-Ambiguität, Nichtverfügbarkeit und `target_content_mismatch`
   autorisieren keine Scope-Erweiterung oder Mutation.
6. **Darstellung:** Target Resolution wird als kompakter, nicht-autorisierender Orientierungsteil in
   die bestehende Scope- und Interaktionsdarstellung eingebunden; kein zweiter Card- oder
   Presentation-Owner.

## 2. UX Intent und Erfolg

- ui_ux_impact: `medium`
- ux_intent_definition:
  `.agdf/control/artefacts/task-target-resolution-boundary/UX_INTENT_DEFINITION.md` —
  decision `ready` (2026-07-28)
- primary_user_intent: Der Agent arbeitet am beauftragten Ziel und leitet aus Arbeitsordner,
  Projekterwähnungen oder Evidenzquellen kein anderes Änderungsziel ab.
- success_signal: Vor Governance-Aktivierung oder Mutation ist genau ein Ziel wirksam oder ein
  sichtbarer fail-closed Zustand aktiv; das Ziel bleibt bei eindeutigen Folgeturns stabil.
- primary_decision_or_action: Der Nutzer benennt das Ziel durch die Anfrage und entscheidet nur bei
  echter Ambiguität, Inhalts-Mismatch, Nichtverfügbarkeit oder bewusstem Zielwechsel erneut.

## 3. Working Modes und Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| `explicit_single_target` | ein explizites `primary_target`, getrennte `evidence_sources`, `working_directory` und abgeleitetes `governance_target` | kompakte Zielorientierung; optional sichtbarer `target_changed`-Hinweis | explizite aktuelle Nutzeranfrage | kanonische AGDF-Interaktionsdarstellung |
| `continued_confirmed_target` | zuvor bestätigtes Ziel nach Revalidierung der eindeutigen Fortsetzung | kompakte Zielorientierung nur wenn zur Klärung nötig; ansonsten stabile Fortsetzung | letzte bestätigte Anfrage plus eindeutiger aktueller Folgeturn | kanonische AGDF-Interaktionsdarstellung |
| `unresolved_target` | kein autorisiertes Mutation Target oder Governance Target | `multiple_plausible_targets`, `target_content_mismatch` oder `target_unavailable` mit nächster Aktion | keine implizite Quelle; Nutzerklärung erforderlich | kanonische AGDF-Interaktionsdarstellung |

Systemautorität entscheidet, welcher Zustand gilt. Presentation Ownership bestimmt nur, wie Zustand
und nächste Aktion sichtbar werden. Technische Speicherung, Ableitung und Komponentenplatzierung
bleiben Gegenstand des Solution Design.

## 4. Aktivierung, Blocker, Recovery und Transitionen

- activation_and_deactivation: Aktivierung bei jeder neuen Arbeitsanfrage vor Repository-Aktivierung;
  Revalidierung bei Folgeturns; Deaktivierung bei Abschluss, Abbruch, explizitem Zielwechsel oder
  Verlust der eindeutigen Fortsetzung.
- blockers_and_visible_next_actions:
  - mehrere plausible Ziele → Ziele sichtbar benennen und Klärung anfordern;
  - Ziel nicht verfügbar → fehlendes Ziel benennen und erneute Bereitstellung anbieten;
  - `target_content_mismatch` → Widerspruch benennen und Ziel oder Änderungsabsicht klären;
  - kein belastbares Ziel → keine repositorybezogene Aktivierung oder Mutation.
- recovery_paths: Nach Nutzerklärung oder erneuter Bereitstellung Target Resolution sichtbar
  wiederholen; bei transienter Nichtverfügbarkeit eine erkennbare Retry-Aktion anbieten; bei
  Zielwechsel alte Bindung sichtbar beenden.
- relevant_state_transitions:
  - `unresolved → explicit_single_target`: eindeutige Nutzerklärung; neues Ziel sichtbar;
  - `explicit_single_target → continued_confirmed_target`: eindeutige Fortsetzung; bestehendes Ziel
    bleibt wirksam;
  - `continued_confirmed_target → explicit_single_target`: expliziter Zielwechsel; neues Ziel
    sichtbar, alte Bindung beendet;
  - `resolved → target_content_mismatch`: belegter Inhaltswiderspruch; Mutation gesperrt;
  - `target_content_mismatch → resolved`: geklärtes Ziel oder geklärte Absicht; Resolution erneut;
  - `resolved → unresolved_target`: neue Mehrziel-Ambiguität; Mutation gesperrt.

## 5. Akzeptanzkriterien

| criterion_id | working_mode | source_state | Trigger / Aktion | Erwarteter effektiver Zustand | Sichtbares Feedback | Blocker-/Fehlerverhalten | Recovery / nächste Aktion | Beobachtbarer Erfolg | Erforderliche Evidenz |
|---|---|---|---|---|---|---|---|---|---|
| TTR-1 | `explicit_single_target` | explizite Datei plus anderes `cwd` | neue Anfrage | Datei ist `primary_target`; `cwd` bleibt Kontext | Zieltrennung erkennbar, wenn relevant | `cwd` darf nicht still gewinnen | keine | Mutation betrifft nur explizites Ziel | Behavioral Eval + Contract-Test |
| TTR-2 | alle | Repository nur erwähnt oder inspiziert | Evidenznutzung | Repository ist `evidence_source`, nicht Mutation Target | Rolle als Evidenz erkennbar | keine AGDF-Aktivierung allein durch Erwähnung | expliziten Auftrag abwarten | keine unbeauftragte Repository-Mutation | Behavioral Eval |
| TTR-3 | alle | neues Arbeitsziel | Routing startet | Target Resolution ist vor Scope Classification und Gate-Auswertung abgeschlossen | Ziel oder Blocker ist sichtbar | nachgelagerte Auswertung bleibt ohne Ziel gesperrt | Ziel klären | Reihenfolge ist deterministisch | Runtime-Integrity-Assertion + Eval |
| TTR-4 | `continued_confirmed_target` | bestätigtes Ziel | eindeutiger Folgeturn | bestehendes Ziel bleibt wirksam | keine irreführende Neuaktivierung | Ambiguität sperrt Fortsetzung | klären | Folgeturn mutiert nur bestätigten Scope | Mehrturn-Eval |
| TTR-5 | `explicit_single_target` | bestätigtes altes Ziel | expliziter Zielwechsel | neues Ziel ersetzt alte Bindung | `target_changed` sichtbar, wenn für Orientierung nötig | parallele Bindungen sind unzulässig | neue Resolution | nur neues Ziel ist wirksam | Mehrturn-Eval |
| TTR-6 | `unresolved_target` | mehrere plausible Ziele | Mutation beabsichtigt | kein Mutation oder Governance Target | Kandidaten und Klärungsbedarf sichtbar | fail-closed | Nutzer benennt Ziel | keine Mutation vor Klärung | adversariales Eval |
| TTR-7 | `unresolved_target` | Zielinhalt widerspricht Änderungsabsicht | Inhaltsprüfung | `target_content_mismatch` | Widerspruch und nächste Aktion sichtbar | keine stille Ausweitung auf Evidenzquelle | Ziel oder Absicht klären | kein Scope Drift | Behavioral Eval |
| TTR-8 | `unresolved_target` | Ziel nicht verfügbar | Zugriff / Prüfung | `target_unavailable` | fehlendes Ziel und Retry sichtbar | keine Ersatzmutation | Ziel bereitstellen, erneut prüfen | Retry führt zu neuer Resolution | Eval mit unavailable/retry |
| TTR-9 | alle | aufgelöstes Ziel | Orientierung wird dargestellt | Ziel, Governance-Ziel, Evidenz und `cwd` bleiben getrennt | kompakte nicht-autorisierende Projektion | kein Approval-Control, kein zweiter Renderer | bestehende Interaktionsdarstellung verwenden | `authorizes: false`; Ownership eindeutig | Renderer-Test + Runtime Integrity |
| TTR-10 | alle | mehrere Agent-Oberflächen | Asset-Sync / Prüfung | gleiche normative Reihenfolge und Zustände | semantische Parität | Drift schlägt fehl | kanonisch synchronisieren | Runtime Integrity und Evals grün | Sync- und Integrity-Evidenz |

## 6. Nicht-Ziele

- Keine Änderung von Gate-Reihenfolge, Approval-Werten oder Approval-Autorität.
- Kein neues Sandbox-, ACL- oder Berechtigungssystem.
- Keine freie Absichtsermittlung jenseits expliziter Anfrage und eindeutiger Fortsetzung.
- Kein zweiter Scope-Classifier, kein zweiter Presentation-Owner und kein paralleler Renderer.
- Keine rückwirkende Änderung historischer Runs.
- Keine Live-Host-, Release- oder VCS-Claims in diesem Scope.

## 7. Nutzer und Rollen

- Betroffen: Nutzer AGDF-fähiger Coding-Agent-Oberflächen, besonders bei externen Artefakten,
  mehreren erwähnten Repositories oder Projektwechseln.
- Zielautorität: der Nutzer durch explizite Anfrage oder Klärung.
- Governance-Autorität: bestehende AGDF-Repository-Kontrollzustände erst nach Target Resolution.
- Presentation: nicht-autorisierende Projektion; sie entscheidet weder Ziel noch Gate.

## 8. Constraints

- Fail-closed vor Mutation bei nicht eindeutigem oder nicht verfügbarem Ziel.
- Explizites aktuelles Ziel hat Vorrang vor implizitem Kontext.
- `cwd` allein ist keine Zielautorität.
- Evidence Access und Mutation Authority bleiben getrennt.
- Bestehende Scope-, Interaction-, Sync- und Test-Owner müssen wiederverwendet werden.
- Kompakte Chat-Ausgabe und bestehende Approval-Semantik bleiben unverändert.

## 9. Evidenzanforderungen

- Contract- und Runtime-Integrity-Evidenz für die vorgelagerte Reihenfolge und Single Ownership.
- Behavioral Evals für TTR-1 bis TTR-8 einschließlich Mehrturn-Stabilität und Retry.
- Renderer-/Presentation-Tests für TTR-9 mit `authorizes: false`.
- Sync-/Parity-Prüfungen für alle generierten Agent-Oberflächen.
- Brownfield Analysis vor Implementierung mit expliziter Prüfung aller betroffenen Owner.
- QA muss TP-Coverage, Brownfield Fit, Clean Review, Code Review und die genannten Evals sehen.

## 10. Risiken und offene Fragen

- SD muss den fokussierten Contract-Owner bestimmen, ohne Target-Semantik in den Renderer zu legen.
- SD muss festlegen, welche Resolution-Daten transient im Turn-Kontext liegen und welche
  run-scoped Evidenz benötigen, ohne eine neue globale State Authority zu schaffen.
- TP muss die Propagation über Codex, Claude Code, OpenCode und Copilot vollständig abdecken.
- Anhänge und hostabhängige Pfadauflösung benötigen ehrliche Evidenzgrenzen; Repository-Tests
  beweisen keine Live-Host-Erfahrung.
- Context Graph benötigt nach genehmigtem Design einen neuen Target-Authority-Knoten.

## 11. Nächster Schritt

Dieses PRD prüfen und nur mit folgendem exakten Wert freigeben:

`Approval: PRD`
