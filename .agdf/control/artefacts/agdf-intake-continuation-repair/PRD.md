# PRD: Verlässlicher Delivery-Intake und Fortsetzung

Status: draft
Gate: PRD
Gate approval: open
Revision: 1
Based on: UR.md, freigegebene Fassung 1
Date: 2026-09-27
Owner: user
Run: agdf-intake-continuation-repair

## 1. Product Scope

AGDF führt klar beauftragte neue Änderungen auch neben bestehenden Runs bis zu einer gebundenen UR-Entscheidung. Unterstützte installierte Befehle tragen diesen Weg. Eine gültige Antwort wird ausschließlich der zuvor präsentierten Bindung zugeordnet. In aktiver Delivery führt die angenommene UR-Freigabe ohne zusätzlichen Weiterarbeits-Prompt zur Brownfield Review und Routenwahl. Spätere Nutzerfreigaben bleiben erforderlich. Reine Statusabfragen bleiben lesend.

## 2. UX Intent And Success

- ui_ux_impact: high
- ux_intent_definition: UX_INTENT_DEFINITION.md — ready
- primary_user_intent: Arbeit beauftragen und fachliche Entscheidungen treffen, ohne technische Run-Verwaltung übernehmen zu müssen.
- success_signal: Eindeutiger Entscheidungsvorschlag und nachvollziehbarer Fortschritt bis zur nächsten echten Nutzerentscheidung oder konkreten Blockade.
- primary_decision_or_action: Die angezeigte Fassung freigeben, überarbeiten lassen oder ablehnen.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| Neuer Auftrag | Noch keine Gate-Freigabe; eigener Umfang in Vorbereitung | Vorbereitung, Klärung, entscheidungsbereit | Nutzerauftrag und kanonischer Run | Aktueller Chat mit kanonischer Darstellung |
| Gebundene Fortsetzung | Nur aktuell erlaubte interne Arbeit | angenommen, in Bearbeitung, nächstes Gate, blockiert | Gebundene Freigabe und Gate-Prüfung | Aktueller Chat mit kanonischer Darstellung |
| Status | Unveränderter Zustand | Status, konkrete offene Entscheidung | Kanonischer Run | Lesende Chat-/CLI-Darstellung |
| Entscheidung | Antwort auf zuvor präsentierten Run/Gate/Revision | angenommen, abgelehnt, Überarbeitung, veraltet | Deliberate Nutzerantwort auf gebundene Präsentation | Gate-Darstellung im aktuellen Chat |
| Fehlerbehebung | Letzte gültige Autorität bleibt erhalten | Fehler, nächste Aktion, wiederholbar | Kanonischer Zustand, keine neue Freigabe durch Fehler | Aktueller Chat mit konkretem Fehlerhinweis |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Neuer Auftrag aktiviert Intake nur bei geklärtem Ziel und Umfang. Ein bestehender Run wird nur bei eindeutiger Fortsetzungsbindung verwendet. Statusfragen aktivieren keine Mutation. Abbruch, Ablehnung und fehlende Antwort erteilen keine Freigabe.
- blockers_and_visible_next_actions: Bei echter Mehrdeutigkeit gezielt Auswahl/Klärung verlangen; bei fehlenden Artefakten diese im erlaubten Gate vorbereiten; bei fehlender Runtime-Fähigkeit Fehler und unterstützten Wiederherstellungsschritt ausweisen. Niemals eine ungebundene Freigabe als Lösung zeigen.
- recovery_paths: Nach transientem Fehler erneute Prüfung anbieten. Nach Unterbrechung Zustand erneut prüfen und bereits erledigte Schritte erhalten. Keine automatische Doppelanlage und kein erneutes Anwenden einer Antwort auf einen anderen Zustand.
- relevant_state_transitions: Intake -> dauerhafte UR -> gebundene Präsentation -> Nutzerentscheidung -> Freigabepersistenz -> Brownfield Review/Routenwahl -> nächstes erlaubtes Gate. Ungültige Antwort hält vor Persistenz; fehlerhafte Fortsetzung erhält bereits gültige Freigabe und meldet den konkreten Restschritt.

## 5. Acceptance Criteria

| criterion_id | working_mode / source_state | Trigger | Expected effective state / visible feedback | Blocker and recovery | Observable success / evidence |
|---|---|---|---|---|---|
| IC-01 | Neuer Auftrag / mehrere fremde aktive Runs | Klar abgegrenzten neuen Umfang beauftragen | Eigener Run mit dauerhafter UR, noch keine Freigabe; Vorschlag identifiziert Umfang und Bindung | Unklares Ziel/Umfang zuerst klären; kein fremder Run ausgewählt | Durchgängiger Mehrfachrun-Test und sichtbarer Chat; fremde Zustände unverändert |
| IC-02 | Auswahl / unklarer bestehender Run | Mehrdeutige Fortsetzung oder Statusfrage | Konkrete Auswahlfrage statt ungebundenem Approval: UR | Passende Kandidaten/fehlende Information zeigen, nach Antwort erneut prüfen | Negativtest und gerenderte Ausgabe ohne falsche Freigabeaufforderung |
| IC-03 | Intake / Run fehlt | Unterstützten Erstellungsweg ausführen | Run und Revision über ausgelieferte Schnittstelle entstehen; danach UR-Vorbereitung | Fehlende Fähigkeit explizit melden; keine internen Modulimporte als normaler Ablauf | Test der gepackten installierbaren Runtime mit deren ausgegebenen Befehlen |
| IC-04 | Entscheidung / gebundene Fassung bereit | Exakte Freigabeantwort | Nur zuvor präsentierter Run, Gate und Revision werden angenommen; Bindung nachvollziehbar | Fremde, geänderte, erst nach Antwort erzeugte oder nicht zuvor gebundene Revision zurückweisen; neue Präsentation erfordern | Positive und negative Bindungstests sowie Gesprächsbeleg der Reihenfolge |
| IC-05 | Fortsetzung / UR gültig freigegeben | Freigabe erfolgreich persistiert | Brownfield Review und Routenwahl laufen ohne weiteren Nutzerprompt; Ergebnis und nächstes Gate sichtbar | Bei echter Blockade konkret stoppen; keine Implementierung allein durch UR | Zusammenhängender Fortsetzungstest und sichtbarer Host-Verlauf |
| IC-06 | Status / beliebiger Run-Zustand | Nur Status erfragen | Bericht ohne Run-Erstellung, Freigabe oder interne Arbeit | Unklaren Run klären; technische Fehler anzeigen | Vorher-/Nachher-Zustand identisch, lesender Aufrufnachweis |
| IC-07 | Recovery / teilweise erledigter Intake oder interne Arbeit | Nach Unterbrechung wiederholen | Bereits angelegte/bestätigte Schritte erhalten; Restarbeit neu geprüft | Unklare Wiederaufnahme klären, transienten Fehler mit Wiederholungsaktion zeigen | Wiederholungs- und Fehlerfalltests ohne Doppelrun, doppelte Freigabe oder fremde Mutation |
| IC-08 | Entscheidung / überarbeiten, ablehnen, abbrechen, keine Antwort | Nicht-Freigabe | Keine neue Freigabe und keine spätere Gate-Arbeit; gewählte Aktion sichtbar | Überarbeitung erzeugt neuen prüfbaren Stand; keine alte Antwort übertragen | Negative Entscheidungstests; relevante sichtbare Zustände |

## 6. Non-Goals

Kein automatisches Approval; keine Änderung des MGDF-Produkts oder seiner historischen Freigaben; keine neue allgemeine Agenten-Orchestrierung; keine pauschale Aufhebung terminaler Statusantworten; kein neues Nutzer-Gate; keine Veröffentlichung als Teil dieser PRD-Freigabe.

## 7. Users And Roles

Nutzer beauftragt und entscheidet. Agent bereitet vor und führt begrenzt autorisierte Schritte aus. Kanonische Prüfung bestimmt Zulässigkeit; Host präsentiert und transportiert Antworten. Keine dieser Rollen darf eine fehlende Nutzerentscheidung ersetzen.

## 8. Constraints

Bestehende Runs und Freigaben bleiben erhalten. Ein neuer Umfang darf keine vorhandene Freigabe erben. CLI/MCP und generierte Skills müssen dieselbe Semantik tragen. Lesend deklarierte Aufrufe dürfen keine versteckte Persistenz erhalten. Alte Integrationen dürfen bei fehlender erforderlicher Bindung nur mit konkreter sicherer Recovery weitergeführt werden, nicht mit stiller Abschwächung.

Die Runtime darf keine tatsächliche menschliche Sichtbarkeit behaupten, wenn sie nur eine vorbereitete Präsentation kennt. SD muss die Grenze zwischen technisch geprüfter Bindung und Host-/Agentennachweis explizit halten. Fehlender Nachweis darf nicht als bestätigte Sichtbarkeit gelten.

## 9. Evidence Requirements

Quelltests und ein durchgängiger Test über die gepackte installierbare Schnittstelle; Regressionen für IC-01 bis IC-08; Contracts/Skill-Projektionen prüfen. Zusätzlich ein sichtbarer realer Host-Verlauf vom neuen Auftrag bis Brownfield/Routenwahl. Angaben zu installierter Version, tatsächlich ausgeführtem Pfad und verbleibenden Host-Grenzen getrennt dokumentieren. Keine Cross-Host-Parität allein aus einem Codex-Lauf ableiten.

## 10. Risks And Open Questions

SD entscheidet über explizite Neuanlage-/Fortsetzungsabsicht im bestehenden Vertrag, Nachweis und Lebenszyklus einer Präsentationsbindung, Kompatibilität alter Aufrufer, Wiederholung/Unterbrechung und Runtime-Paketierung. TP ordnet jeden Akzeptanzpunkt ausführbaren positiven/negativen Prüfungen und sichtbaren Nachweisen zu. Diese technischen Fragen verändern nicht die hier vorgeschlagenen Produktgrenzen.

## 11. Next Step

PRD Fassung 1 mit gebundener Run-Revision prüfen. `Approval: PRD` erlaubt Solution Design; Implementierung erst nach SD-/TP-Freigaben und den notwendigen internen Prüfungen.
