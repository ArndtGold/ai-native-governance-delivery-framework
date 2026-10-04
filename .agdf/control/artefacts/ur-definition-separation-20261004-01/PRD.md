# PRD: Eigenständige UR-Erstellung

Status: draft
Gate: PRD
Gate approval: open
Based on: UR
Date: 2026-10-04
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Product Scope

AGDF erhält einen eigenen fachlichen Skill für die Erstellung und Überarbeitung von User Requirements. Er formuliert den ursprünglichen Nutzerbedarf im bestätigten Kontext und erzeugt genau einen kanonischen UR-Entwurf. Der Dispatcher übergibt diese Tätigkeit; gate-check prüft Kontrollzustand und Gate-Bereitschaft. Der Nutzer erteilt die Freigabe.

Der Schritt umfasst Skillkatalog, betroffene Laufzeitverträge und Routing, bestehende Registrierung und Rückgabe an den Kontrollpfad, Dokumentation sowie deterministisch abgeleitete Hostprojektionen. Er umfasst neue Anforderungen und zulässige Überarbeitungen noch nicht freigegebener URs. Eine bereits freigegebene UR darf durch den Erstellungsskill nicht geändert oder in einen Entwurf zurückversetzt werden.

## 2. UX Intent And Success

- ui_ux_impact: low
- ux_intent_definition: directly defined low-impact semantics; die freigegebene UR und BROWNFIELD_REVIEW.md klären Bedarf, Zuständigkeiten und Grenzen. Keine neue Oberfläche oder geänderte Freigabeentscheidung.
- primary_user_intent: Einen Bedarf verständlich formulieren lassen und den daraus entstandenen UR-Entwurf bewusst prüfen und freigeben.
- success_signal: Der Entwurf gibt den tatsächlichen Bedarf vollständig wieder; offene Klärung, Zuständigkeit und nächster Schritt sind erkennbar, ohne technische Run-Auswahl oder wiederholte Informationsabfrage.
- primary_decision_or_action: Wesentliche offene Bedarfsfragen beantworten, den Entwurf überprüfen oder seine aktuell präsentierte Fassung ausdrücklich freigeben.

## 3. Working Modes And Effective State

| working_mode | effective_state | visible_state_types | effective_state_authority | primary_state_presentation_owner |
|---|---|---|---|---|
| UR-Erstellung | Bedarf wird im gebundenen Intake geklärt und formuliert | Entwurf, wesentliche offene Frage, konkret zugeordnetes Ergebnis | Nutzerauftrag und kanonischer Intake | UR-Erstellungsskill für fachliche Rückfragen und Ergebnis |
| UR-Überarbeitung | Nur der zulässige unfreigegebene Entwurf wird überarbeitet | Änderungswunsch, aktualisierter Entwurf oder konkreter Blocker | Nutzerauftrag und kanonischer Run-/Gate-Zustand | UR-Erstellungsskill für Inhalt; Kontrollpfad für Berechtigung |
| UR-Prüfung | Ein gespeicherter Entwurf ist bereit zur Prüfung oder konkret blockiert | Bestehende Gate-Präsentation oder begründete Wiederherstellungsaktion | Kanonische Gate-Evaluation und aktuelle Artefakt-/Revisionsbindung | Bestehende Kontrollpräsentation |
| UR-Freigabe | Nur eine gültige menschliche Antwort auf die aktuelle Präsentation wird erfasst | Bestehende UR-Freigabe und nächster erlaubter Schritt | Bestehende Freigabeoperation | Bestehende Kontrollpräsentation |

## 4. Activation, Blockers, Recovery And Transitions

- activation_and_deactivation: Die bestehende Request-Activation entscheidet, ob Delivery vorliegt. Ein direkter Skillaufruf oder seine automatische Auswahl allein erteilt keine Ziel-, Run- oder Gate-Berechtigung. Reine Beratung bleibt entsprechend dem bestehenden Vertrag außerhalb von Delivery.
- blockers_and_visible_next_actions: Unklarer Bedarf führt zu einer gezielten fachlichen Rückfrage. Ungeklärte Run-Zuordnung, falsches Ziel, veraltete Revision, freigegebene UR oder spätere Gates werden nicht durch den Erstellungsskill aufgelöst oder überschrieben; die bestehende Kontrolle liefert den konkreten nächsten erlaubten Schritt.
- recovery_paths: Bereits bekannte Angaben bleiben erhalten und müssen nicht erneut abgefragt werden. Behebbare Schreib-, Registrierungs- oder Präsentationsfehler folgen dem bestehenden Wiederherstellungspfad mit sichtbarem nächsten Schritt. Ein erneuter Versuch prüft die aktuelle Bindung; er übernimmt keine alte Antwort oder Freigabe.
- relevant_state_transitions: Bestätigter Intake geht zur fachlichen UR-Erstellung; wesentliche fehlende Angaben gehen zur Klärung; vollständiger Entwurf geht über kanonische Registrierung zurück zur Prüfung. Zulässige Überarbeitung erzeugt eine neue aufgezeichnete Fassung und bei Bereitschaft eine neue Präsentation. Freigabe führt unverändert zur Brownfield Review. Kein Übergang erteilt Implementierungsberechtigung allein durch einen Skill.

## 5. Acceptance Criteria

- criterion_id: AC-001
  - working_mode: UR-Erstellung
  - source_state: Kanonischer Intake hat Ziel und Run bestätigt; UR-Erstellung ist zulässig.
  - trigger: Ein neuer Bedarf soll als UR formuliert werden.
  - expected_effective_state: Ein katalogregistrierter UR-Erstellungsskill erhält die fachliche Tätigkeit. gate-check und Dispatcher bleiben Prüf- beziehungsweise Routing-Eigentümer.
  - visible_feedback: Zuständigkeit und fachliches Ergebnis sind eindeutig erkennbar.
  - blocker_behavior: Kein konkurrierender Formulierungsweg verbleibt im bisherigen gate-check-Intake.
  - recovery_next_action: Bei unzulässigem Zustand zum vorhandenen Kontrollpfad zurückkehren.
  - observable_success: UR-Erstellung hat genau einen fachlichen Eigentümer und die Steuerung enthält keine zweite Erstellungskompetenz.
  - required_evidence: Skillvertrag, Katalog, positiver Intake-/Routingtest und Prüfung auf konkurrierende Anweisungen.

- criterion_id: AC-002
  - working_mode: UR-Erstellung
  - source_state: Nutzerauftrag und bestätigter Kontext stehen bereit.
  - trigger: Der Skill formuliert den Bedarf.
  - expected_effective_state: Die kanonische UR enthält Problem, Ziel, betroffene Nutzer, Umfang, Nicht-Ziele, Erfolgssignale, verbindliche Quellen, Risiken und offene Fragen. Annahmen sind als solche kenntlich.
  - visible_feedback: Ein nachvollziehbarer Entwurf bildet den ursprünglichen Bedarf ab.
  - blocker_behavior: Fehlende wesentliche Angaben werden nicht erfunden; ungeklärte technische Lösungen werden nicht als Nutzerentscheidung behandelt.
  - recovery_next_action: Wesentliche Bedarfsfragen bündeln und mit den vorhandenen Angaben fortfahren.
  - observable_success: Der Entwurf ist auf den Nutzerauftrag zurückführbar und fachlich vollständig, soweit die verfügbaren Angaben dies erlauben.
  - required_evidence: Repräsentative Auftrags-/Entwurfspaare mit nachvollziehbarer Inhaltsprüfung und markierten Annahmen.

- criterion_id: AC-003
  - working_mode: UR-Erstellung
  - source_state: Mindestens eine fehlende Angabe verhindert eine verlässliche Bedarfsformulierung oder würde den Bedarf wesentlich verändern.
  - trigger: Der Skill erkennt die Lücke.
  - expected_effective_state: Der Bedarf bleibt in Klärung; die betreffende Frage und ihre Auswirkung werden sichtbar.
  - visible_feedback: Eine gebündelte, verständliche Frage verlangt fachliche Angaben statt technischer Run-IDs oder bereits beantworteter Informationen.
  - blocker_behavior: Offene wesentliche Klärung wird nicht als fachliche Bereitschaft oder Zustimmung ausgegeben.
  - recovery_next_action: Antwort einarbeiten und den Entwurf im selben bestätigten Umfang vervollständigen; bloße Unwesentlichkeiten als begründete Annahme behandeln.
  - observable_success: Wesentliche Unklarheit führt zur passenden Rückfrage; ein hinreichend konkreter Auftrag führt ohne unnötige Rückfrage zum Entwurf.
  - required_evidence: Fälle mit wesentlicher Lücke, vollständigem Auftrag und bereits beantworteter Frage; Verhaltensnachweise getrennt von strukturellen Prüfungen.

- criterion_id: AC-004
  - working_mode: UR-Erstellung und UR-Überarbeitung
  - source_state: Ein Aufruf liegt mit gültiger, fehlender, falscher oder veralteter Bindung vor.
  - trigger: Der Skill soll einen Entwurf schreiben oder registrieren.
  - expected_effective_state: Schreiben ist ausschließlich für das bestätigte Ziel, den ausgewählten Run und den aktuell zulässigen Zustand möglich. Run-Zuordnung und Revisionsprüfung behalten ihre bestehenden Eigentümer.
  - visible_feedback: Unzulässige Bindung liefert den bestehenden konkreten Kontroll- oder Wiederherstellungshinweis.
  - blocker_behavior: Keine andere UR, kein anderer Run, keine Freigabe und keine spätere Gate-Datei werden stillschweigend verwendet oder verändert.
  - recovery_next_action: Bindung durch den vorhandenen Intake beziehungsweise Kontrollpfad neu prüfen.
  - observable_success: Fremde oder veraltete Bindung führt ohne Veränderung fremder Artefakte zurück zur kanonischen Kontrolle.
  - required_evidence: Positive und negative Bindungs-/Revisionsszenarien mit unveränderten Fremdartefakten und Freigaben.

- criterion_id: AC-005
  - working_mode: UR-Überarbeitung
  - source_state: Eine UR ist als unfreigegebener Entwurf registriert oder bereits freigegeben.
  - trigger: Der Nutzer verlangt eine fachliche Änderung.
  - expected_effective_state: Nur eine zulässige Entwurfsänderung wird aufgezeichnet; sie führt zu einer neuen Fassung und erneuten Prüfung. Eine freigegebene UR wird nicht durch den Erstellungsskill ersetzt.
  - visible_feedback: Aktualisierter Entwurf oder konkreter Hinweis auf den zuständigen Kontrollpfad.
  - blocker_behavior: Eine alte Präsentation oder frühere Antwort gilt nicht für den geänderten Entwurf; die ursprüngliche Freigabe bleibt bei unzulässiger Änderung erhalten.
  - recovery_next_action: Kanonische Änderung und neue Präsentation verwenden; für geänderten freigegebenen Umfang den bestehenden zulässigen Lifecycle klären.
  - observable_success: Unfreigegebene Entwurfsänderungen sind revisionsgebunden; freigegebene Artefakte werden durch den Erstellungsskill nicht verändert.
  - required_evidence: Erstentwurf, registrierte Entwurfsänderung, veraltete Präsentation und abgewiesene Änderung einer freigegebenen UR.

- criterion_id: AC-006
  - working_mode: UR-Prüfung und UR-Freigabe
  - source_state: Der Skill hat einen prüfbaren Entwurf erstellt oder überarbeitet.
  - trigger: Die Tätigkeit wird an die bestehende Kontrolle zurückgegeben.
  - expected_effective_state: Genau eine kanonische UR wird über die vorhandenen Operationen aufgezeichnet. gate-check bestimmt Bereitschaft; eine aktuelle revisionsgebundene Präsentation geht der menschlichen Freigabe voraus.
  - visible_feedback: Die vollständige bestehende Freigabezusammenfassung und der konkrete Artefaktlink erscheinen in der gewählten Sprache.
  - blocker_behavior: Der Skill erteilt keine Zustimmung und behauptet keine Gate- oder Implementierungsfreigabe. Ein unvollständiger, ungeprüfter oder ungültig gebundener Entwurf wird nicht als freigegeben präsentiert.
  - recovery_next_action: Konkrete Klärung beziehungsweise bestehende Registrierungs- oder Präsentationskorrektur durchführen.
  - observable_success: Approval: UR bleibt die ausdrückliche menschliche Entscheidung für die aktuelle Präsentation; ihre erfolgreiche Erfassung führt unverändert zur Brownfield Review.
  - required_evidence: Ende-zu-Ende-Intake bis zur bestehenden Präsentation und Freigabe, lokalisierte Darstellung, negative Prüfungen auf alte Antwort und fehlende Bereitschaft.

- criterion_id: AC-007
  - working_mode: Installation und Skillentdeckung
  - source_state: Eine unterstützte Hostprojektion wird aus dem kanonischen Plugin erzeugt.
  - trigger: Skills werden projiziert, entdeckt und aufgerufen.
  - expected_effective_state: Der neue Skill erscheint konsistent im kanonischen Katalog und den entsprechenden Hostnamen, mit vollständigen Vertragsreferenzen. Die Zehn-Skills-Annahme verhindert seine Aufnahme nicht.
  - visible_feedback: Unterstützte Projektionen zeigen denselben fachlichen Skill mit ihrem jeweiligen registrierten Namen.
  - blocker_behavior: Kein zweiter Katalog, keine manuell divergierenden Kopien, keine abgeschalteten Budget-/Integritätsprüfungen und kein pauschales zusätzliches Budgetpolster.
  - recovery_next_action: Kanonische Quelle oder Projektor korrigieren und betroffene Projektionen neu erzeugen und prüfen.
  - observable_success: Katalog, Projektionen, Paket-/Payloadintegrität und gemessene Anweisungsgrößen sind konsistent und nachvollziehbar.
  - required_evidence: Katalog-/Namens-, Konformitäts-, Aktivierungs-, Projektions-, Paket- und Budgetprüfungen; tatsächliches Hostverhalten nur bei entsprechender frischer Beobachtung behaupten.

- criterion_id: AC-008
  - working_mode: Governed Delivery
  - source_state: Der erste UR-Umbau ist umgesetzt und wird geprüft.
  - trigger: Review und QA bewerten den Umfang.
  - expected_effective_state: Die Verantwortungstrennung ist anhand der Kriterien nachvollziehbar; PRD-, Design-, Taskplan-Erstellung und übrige Gates behalten ihre bestehende Funktion.
  - visible_feedback: Nachweise und verbleibende Evidenzgrenzen sind explizit; keine weitergehende Umsetzungs- oder Hostbereitschaft wird behauptet.
  - blocker_behavior: Keine parallele UR-/Freigabequelle, kein automatischer Release und kein stiller Umbau der späteren Verantwortungsschritte.
  - recovery_next_action: Offene Anforderungen, Design-, Plan-, Umsetzungs- oder Nachweislücken zum bestehenden Eigentümer zurückführen.
  - observable_success: Der erste Schritt ist eigenständig akzeptierbar und führt keine Voraussetzung aus einem ungeplanten Folgeumbau ein.
  - required_evidence: Scope-Diff, Taskplan-Abdeckung, Code- und Strukturreview sowie QA mit konkret bezeichneten Nachweisen und Lücken.

## 6. Non-Goals

PRD-/SD-/TP-Erstellung, Task 0, Review-Gates, QA, UAT, Closeout und Release werden in diesem Schritt nicht neu geordnet. Keine neuen Gates, parallelen Anforderungen oder Kontrollschreiber. Keine automatische Run-Migration, Neuinterpretation alter Freigaben, Installation, Veröffentlichung oder VCS-Aktion.

## 7. Users And Roles

- Nutzer und Maintainer Arndt Gold verantworten den Bedarf und die menschliche Freigabe.
- Der UR-Erstellungsskill verantwortet fachliche Klärung und Entwurf.
- Der bestehende Intake verantwortet Ziel-/Run-Zuordnung; kanonische Kontrolloperationen verantworten Registrierung und Revisionen.
- Der Dispatcher routet; gate-check prüft den Zustand und die Bereitschaft. Bestehende Freigabeoperation und Präsentation behalten ihre Autorität.
- SD- und TP-Ersteller sowie Review- und QA-Skills behalten die bestehende nachgelagerte Funktion. Eine kooperative Agentenprüfung ist nicht als unabhängiger menschlicher Review auszugeben.

## 8. Constraints

Eine kanonische UR pro Run, ein kanonischer Skillkatalog und vorhandene Kontrollschreiber bleiben verbindlich. Ein neuer Skill ist keine Freigabeautorität. Die fachliche Erstellung erzeugt keine Produktentscheidung, die der Nutzer nicht getroffen hat. Generierte Dateien bleiben abgeleitet; Budgetänderungen müssen exakt gemessen und begründet sein. Unabhängige staged Änderungen außerhalb dieses Runs bleiben erhalten.

## 9. Evidence Requirements

SD und TP beziehen sich auf AC-001 bis AC-008, ohne sie umzubenennen oder einen zweiten Akzeptanzkatalog anzulegen. Nachweise müssen Erstentwurf, wesentliche Lücke, beantwortete Rückfrage, Entwurfsänderung, freigegebene UR, fremde/veraltete Bindung, Registrierungs-/Präsentationsfehler sowie Rückgabe an die bestehende Freigabe erfassen. Lokalisierte Präsentationen und alle generierten Hostnamen werden geprüft. Bestehende Aktivierungs-, Integritäts-, Payload- und Paketprüfungen bleiben wirksam.

Strukturelle Tests zeigen Vertrags-/Projektionskonformität; Verhaltensbeobachtungen zeigen tatsächliche Bedarfsformulierung und Rückfragen. Lokale oder Protokolltests allein begründen keine frische native Beobachtung auf anderen Hosts. QA nennt diese Grenzen ausdrücklich.

## 10. Risks And Open Questions

Die konkrete Übergabe an den Skill, sein direkter Aufruf, die Wiederaufnahme eines registrierten Entwurfs sowie das Verhältnis von kontrollierter Erstellung und fachlicher Rückfrage benötigen verbindliche SD-Entscheidungen. TP bestimmt danach proportionate Nachweise und Recovery-Szenarien. Ein zusätzlicher Skill kann automatisch geladene Anweisungen und Payload verändern; Größen müssen tatsächlich gemessen werden. Der erste Schritt darf kein Übergangswerkzeug mit einer zweiten Erstellungskompetenz hinterlassen.

## Approval Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| PD-001: Fachliche Trennung | before_prd | resolved | Eigener UR-Erstellungsskill; gate-check prüft, Dispatcher routet, Nutzer genehmigt. Freigegebene UR und explizite Auswahl im Gespräch. | Arndt Gold |
| PD-002: Umfang | before_prd | resolved | Nur neue und zulässig überarbeitete unfreigegebene URs. Bereits freigegebene URs sowie spätere Erstellungskompetenzen und Gates werden nicht umgebaut. | Arndt Gold |
| PD-003: Freigabe- und Zielautorität | before_prd | resolved | Vorhandene Ziel-, Run-, Revisions- und Freigabebindung bleibt maßgeblich; keine Zustimmung durch den neuen Skill. | Arndt Gold |
| PD-004: UX-Tiefe | before_prd | resolved | Low impact mit hier definiertem eindeutigen Nutzerziel, Ergebnis und Recovery. Kein Mock und keine zusätzliche UX-Analyse erforderlich. | Arndt Gold |
| PD-005: Übergabe und Skillname | later_sd | deferred | SD legt Namen, Aufrufgrenzen, Übergabeformat und Registrierung/Entwurfsänderung auf Basis der bestehenden Eigentümer verbindlich fest. | Codex als SD-Ersteller; Freigabe Arndt Gold |
| PD-006: Nachweisplan | later_tp | deferred | TP bildet alle Kriterien auf konkrete Szenarien und Evidenzquellen ab, mit getrennten Quell-, Paket-, Protokoll- und Hostbehauptungen. | Codex als TP-Ersteller; Freigabe Arndt Gold |

## 11. Next Step

PRD aus der freigegebenen UR und abgeschlossenen Brownfield Review revisionsgebunden präsentieren. Bei Approval: PRD ist Solution Design erlaubt; Implementierung folgt erst nach den weiteren erforderlichen Freigaben.

## AGDF Approval Summary (de; source=en)

- Nutzerziel: Einen Bedarf verständlich formulieren lassen und den daraus entstandenen UR-Entwurf bewusst prüfen und freigeben.
- Umfang: Ein eigener UR-Erstellungsskill für neue und zulässig überarbeitete unfreigegebene URs; getrennte Erstellung, Routing und Kontrolle; bestehende Registrierung, Freigabe und kanonische Hostprojektionen weiterverwenden.
- AC-001: Die fachliche UR-Erstellung hat genau einen Eigentümer; gate-check prüft und der Dispatcher routet, ohne einen konkurrierenden Formulierungsweg.
- AC-002: Der Entwurf bildet Problem, Ziel, betroffene Nutzer, Umfang, Nicht-Ziele, Erfolgssignale, Quellen, Risiken und offene Fragen ab; Annahmen sind kenntlich und Angaben werden nicht erfunden.
- AC-003: Wesentliche Lücken führen zu gebündelten fachlichen Rückfragen; ein vollständiger Auftrag wird ohne unnötige Rückfragen formuliert und beantwortete Angaben bleiben erhalten.
- AC-004: Fremde, fehlende oder veraltete Ziel-/Run-/Revisionsbindung wird im bestehenden Kontrollpfad behandelt; andere Artefakte und Freigaben werden nicht verändert.
- AC-005: Zulässige Entwurfsänderungen werden neu aufgezeichnet und präsentiert; alte Antworten übertragen sich nicht. Eine freigegebene UR wird durch den Erstellungsskill nicht verändert.
- AC-006: Genau eine kanonische UR geht zur bestehenden Bereitschaftsprüfung und vollständigen lokalisierten Präsentation zurück. Approval: UR bleibt die menschliche Entscheidung für die aktuelle Fassung und führt zur Brownfield Review.
- AC-007: Katalog, Hostnamen, Vertragsreferenzen, Paket-/Payloadintegrität und gemessene Anweisungsgrößen sind konsistent; keine zweite Quelle, ausgeschaltete Prüfung oder pauschale Budgetreserve.
- AC-008: Der erste Schritt ist eigenständig akzeptierbar; spätere Erstellungskompetenzen und Gates bleiben funktional erhalten. Review und QA nennen konkrete Nachweise und offene Evidenzgrenzen.
- Entscheidungen: PD-001 bis PD-004 sind aus dem bestätigten Bedarf und seiner bestehenden Kontrollgrenze geklärt. PD-005 (Skillname und technische Übergabe) liegt beim SD-Ersteller, PD-006 (konkreter Nachweisplan) beim TP-Ersteller; beide erhalten die bestehende menschliche Freigabe.
- Abgrenzung: PRD-, Design- und Taskplan-Erstellung, Task 0, Reviews, QA, UAT, Closeout und Release werden hier nicht neu geordnet. Keine zusätzlichen Gates, automatische Run-Migration, Installation, VCS-Aktion oder Veröffentlichung.
- Nachweise und Risiken: Neue UR, wesentliche Lücke, beantwortete Frage, Entwurfsänderung, freigegebene UR, falsche/veraltete Bindung und Fehler-Recovery prüfen. Quell-, Paket-, Protokoll- und frische native Hostevidenz unterscheiden. Der zusätzliche Skill erfordert gemessene Größen und konsistente Projektion.
- Nächster Schritt: Mit dieser PRD-Freigabe wird Solution Design erlaubt; Implementierung bleibt bis zur genehmigten Planung und ihren Voraussetzungen gesperrt.
