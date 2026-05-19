# 02 — Gates

Dieses Dokument beschreibt, wie Gates im Framework bewertet werden.

Der Überblick über das gesamte Modell steht in `01-framework-ueberblick.md`. Hier geht es nicht darum, den Ablauf noch einmal zu erklären. Hier geht es um die praktische Entscheidung:

> Darf das Vorhaben in die nächste Phase wechseln, oder fehlt dafür noch etwas?

Ein Gate ist damit kein zusätzliches Meeting und keine formale Checkliste. Ein Gate ist ein bewusster Haltepunkt. Es schützt den roten Faden zwischen Anliegen, Produktvertrag, Design, Plan, Umsetzung und Nachweis.

## Grundidee

Jedes Gate beantwortet drei Fragen:

1. Was wissen wir?
2. Was ist freigegeben?
3. Was darf als Nächstes passieren?

Wenn diese Fragen nicht belastbar beantwortet werden können, geht es nicht stillschweigend weiter.

Das ist der praktische Kern von `fail closed`.

`fail closed` bedeutet nicht, dass jedes Detail perfekt sein muss. Es bedeutet: Unklarheiten werden nicht verdeckt. 
Annahmen werden markiert. Fehlende Nachweise werden nicht als erledigt dargestellt. Und harte Voraussetzungen
werden nicht übersprungen.


## Anforderungen an LLMs und Agenten

Aus der Grundidee dieses Frameworks ergibt sich eine zentrale Mindestanforderung: Ein LLM oder Agent muss Gate-Haltepunkte 
zuverlässig respektieren.

Daran scheitert es in der Praxis oft, weil Teams Coding-Fähigkeit mit Prozessfähigkeit verwechseln. Gute Antwortqualität, 
starke Coding-Leistung oder überzeugende Demos reichen nicht aus, wenn ein Modell bei fehlenden Voraussetzungen trotzdem 
weiterplant, weiterdesignt oder weiterimplementiert.

Auch ein nachgelagertes „Human in the Loop“-Prinzip ersetzt keine Gate-Disziplin im Agentenfluss. Entwickler können prüfen, 
Rückfragen stellen und Entscheidungen freigeben. Sie können aber einen bereits ungeordnet weitergelaufenen Prozess nur 
schwer nachträglich stabilisieren. Wenn Gates regelmäßig übersprungen werden, entstehen Nebenstränge, stille Annahmen und 
schwer nachvollziehbare Entscheidungen.

Für steuernde Rollen zählt deshalb nicht nur Antwortqualität, sondern Stop-Fähigkeit. Ein geeignetes Modell erkennt 
fehlende Voraussetzungen, legt sie offen und hält den Prozess an, statt automatisch in die nächste Phase zu springen.

Dabei genügt es nicht, Gate-Disziplin nur als gute Absicht in eine Systeminstruktion zu schreiben. Geeignete Agenten-Setups 
brauchen technische Kontrollpunkte wie Plan-vor-Ausführung, explizite Freigaben, eingeschränkte Werkzeugrechte, 
blockierende Regeln, Review-Punkte und nachvollziehbare Artefakte.

Hier hilft die Unterscheidung zwischen zwei Fähigkeiten:

Ein starkes Modell kann fachliche Gate-Zustände erkennen, bewerten und begründen. Es kann feststellen, dass Scope, 
Akzeptanzkriterien, Brownfield-Kontext, Nachweise, Risiken oder Freigaben noch nicht belastbar sind. Das ist die fachliche 
Prüfleistung.

Ein starkes Agenten-Setup kann zusätzlich technisch erzwingen, dass bei einem nicht erfüllten Gate nicht weitergearbeitet 
wird. Es kann stoppen, bevor Dateien geändert, Kommandos ausgeführt, Tools genutzt oder Deployment-Schritte gestartet werden. 
Das ist die technische Durchsetzung.

Technische Permissions verhindern unerlaubte Aktionen. Fachliche Gates verhindern verfrühte Entscheidungen.

Erst die Kombination aus fachlicher Prüfung und technischer Durchsetzung erzeugt belastbare Gate-Disziplin. Deshalb muss 
diese Prüfung als Prozess-, Artefakt- und Nachweisregel modelliert und überprüfbar durchgesetzt werden.

![Anforderungen an LLMs und Agenten: Nicht nur liefern können, auch stoppen können](../assets/llm-agent-gate-discipline.png)

Ein Modell, das bei fehlenden Voraussetzungen trotzdem weiterplant, implementiert oder Ergebnisse als fertig darstellt, 
ist für dieses Framework nicht als steuernder Agent geeignet. Es kann weiterhin unterstützend eingesetzt werden, etwa 
für Recherche, Formulierungen, Variantenbildung, Code-Vorschläge oder Zusammenfassungen.

Die zentrale Mindestanforderung bei der Wahl eines LLM-Modells bleibt:

> Ein geeigneter Agent muss nicht nur liefern können. Er muss auch zuverlässig nicht liefern, wenn das Gate nicht erfüllt ist.

## Statusmodell

Jedes Gate endet mit einer klaren Entscheidung.

### pass

Das Gate ist erfüllt. Die nächste Phase darf beginnen.

`pass` bedeutet: Die notwendigen Eingaben liegen vor, die Entscheidung ist nachvollziehbar, und es fehlt keine harte Voraussetzung.

### revise

Das Gate ist noch nicht reif.

Es fehlt etwas, das nachgearbeitet werden kann: Informationen, Präzisierung, Nachweise, eine bessere Abgrenzung oder eine Entscheidung.

Typische Fälle:

- der Scope ist noch unscharf
- Akzeptanzkriterien sind nicht testbar
- Annahmen sind nicht markiert
- Brownfield-Auswirkungen sind noch nicht verstanden
- ein Artefakt verändert stillschweigend die Bedeutung eines früheren Artefakts

### block

Das Gate darf nicht passieren.

`block` ist nötig, wenn eine harte Voraussetzung fehlt oder ein Widerspruch nicht verantwortbar übergangen werden kann.

Typische Fälle:

- der `PRD.contract` ist nicht freigegeben
- Scope oder Zielbild widersprechen sich
- eine fachliche Richtungsentscheidung fehlt
- Security, Compliance oder Datenschutz sind betroffen und ungeklärt
- die Umsetzung würde ohne ausreichenden Bestandskontext starten

### pass_with_limits

Das Gate ist nur eingeschränkt bestanden.

Dieser Status sollte selten sein. Er ist nur sinnvoll, wenn die Einschränkungen klar benannt sind und die verbleibenden Risiken bewusst akzeptiert werden.

Beispiel: Ein technischer Check konnte nicht ausgeführt werden. Dann darf nicht einfach behauptet werden, alles sei geprüft. Der nicht geprüfte Teil bleibt sichtbar.

## Eine gute Gate-Entscheidung

Eine Gate-Entscheidung muss nicht lang sein. Sie muss aber belastbar sein.

Sie sollte enthalten:

- Gate
- Status
- kurze Begründung
- offene Punkte oder Einschränkungen
- nächste Aktion

Beispiel:

```text
Gate: G-01 PRD.contract
Status: revise
Begründung: Scope ist beschrieben, aber zwei Akzeptanzkriterien sind noch nicht testbar.
Offen: AC-3 und AC-4 nachschärfen; Out-of-Scope für Reporting klären.
Next action: PRD.contract überarbeiten und erneut prüfen.
```

## G-00 — User Request

G-00 prüft, ob aus einem Anliegen ein sinnvoller nächster Schritt werden kann.

Es geht noch nicht um PRD, Design oder Umsetzung. Es geht um Orientierung: Was ist das Problem, was ist das Ziel, wer ist betroffen, welche Unsicherheiten sind sichtbar?

### Benötigte Eingaben

- Anliegen oder Problem
- gewünschtes Ziel
- betroffene Nutzer oder Rollen
- bekannte Constraints
- erkennbare Risiken
- offene Fragen

In Brownfield-Kontexten zusätzlich:

- Hinweise auf betroffene bestehende Systeme
- bekannte technische Schulden
- bestehende Produktlogik oder Ownership
- mögliche Schnittstellen, Datenmodelle oder Betriebsabhängigkeiten

### pass

G-00 kann auf `pass` stehen, wenn Problem, Ziel und Kontext ausreichend verstanden sind, um den `PRD.contract` vorzubereiten.

In Brownfield-Kontexten muss zusätzlich klar sein, ob der Wunsch bestehenden Systemkontext berührt und welche Punkte in G-01 berücksichtigt werden müssen.

### revise

G-00 geht auf `revise`, wenn das Anliegen noch zu unklar ist.

Typische Gründe:

- das Ziel ist nicht verständlich
- Nutzer oder Betroffene sind unklar
- das gewünschte Ergebnis ist mehrdeutig
- wichtige Constraints fehlen
- Brownfield-Auswirkungen sind wahrscheinlich, aber noch nicht grob eingeordnet

### block

G-00 geht auf `block`, wenn kein verantwortbarer nächster Schritt möglich ist.

Typische Gründe:

- Ziele widersprechen sich
- Verantwortung ist unklar
- eine fachliche Richtungsentscheidung fehlt
- Security, Compliance oder Datenschutz sind offensichtlich betroffen
- im Brownfield-Kontext ist unklar, welches bestehende Verhalten überhaupt gelten soll

### Gate-Check

- Verstehen wir das Problem?
- Verstehen wir das Ziel?
- Wissen wir, wer betroffen ist?
- Sind die wichtigsten Unsicherheiten sichtbar?
- Ist klar, ob Brownfield betroffen ist?
- Muss vor dem PRD eine Richtungsentscheidung getroffen werden?

## G-01 — PRD.contract

G-01 prüft, ob ein belastbarer Produktvertrag vorliegt.

Der `PRD.contract` ist der zentrale Anker für Scope, Akzeptanzkriterien, Non-Goals, Constraints und Erfolgskriterien. Er beschreibt nicht jede spätere Lösung im Detail, aber er legt fest, was fachlich gelten soll.

### Benötigte Eingaben

- Ergebnis aus G-00
- geklärtes Problem und Ziel
- Scope und Out-of-Scope
- Akzeptanzkriterien
- Non-Goals
- relevante Constraints
- Annahmen und Risiken
- Brownfield-Erkenntnisse aus G-00, falls vorhanden

### pass

G-01 kann auf `pass` stehen, wenn der `PRD.contract` vollständig genug, widerspruchsfrei und freigegeben ist.

Wichtig: Freigabe gilt für den stabilen Vertragskern, nicht für lose Notizen oder spätere Interpretationen.

### revise

G-01 geht auf `revise`, wenn der Produktvertrag noch nicht tragfähig ist.

Typische Gründe:

- Akzeptanzkriterien sind nicht testbar
- Scope und Out-of-Scope sind unscharf
- Non-Goals fehlen
- Annahmen sind nicht markiert
- Risiken aus G-00 wurden nicht aufgenommen
- Brownfield-Kontext wurde erkannt, aber nicht in Scope, Risiken oder Akzeptanzkriterien übersetzt

### block

G-01 geht auf `block`, wenn der Vertrag nicht freigegeben werden darf.

Typische Gründe:

- Scope ist widersprüchlich
- eine fachliche Entscheidung fehlt
- regulatorische oder sicherheitsrelevante Fragen sind offen
- der Vertrag würde bestehendes Verhalten verändern, ohne dass diese Änderung bewusst entschieden wurde

### Gate-Check

- Ist klar, was gebaut oder geändert werden soll?
- Ist klar, was nicht gebaut oder geändert werden soll?
- Sind die Akzeptanzkriterien prüfbar?
- Sind Annahmen und Risiken sichtbar?
- Ist der Brownfield-Kontext berücksichtigt?
- Liegt eine Freigabe für den `PRD.contract` vor?

## G-02 — Solution Design

G-02 prüft, ob es ein tragfähiges Lösungskonzept gibt.

Das Solution Design beschreibt, wie der `PRD.contract` konzeptionell erfüllt werden soll. Es bleibt auf Design-Ebene. Es ist keine Implementierungsanleitung.

### Benötigte Eingaben

- freigegebener `PRD.contract`
- relevante Constraints
- bekannte Risiken
- Brownfield-Kontext, falls vorhanden
- Architektur- oder Systemhinweise

### pass

G-02 kann auf `pass` stehen, wenn das Design nachvollziehbar auf den `PRD.contract` zurückführt und die wesentlichen Lösungsentscheidungen erklärt.

Dazu gehören Komponenten, Verantwortlichkeiten, Schnittstellen auf konzeptioneller Ebene, Datenflüsse, Sicherheits- und Betriebsaspekte sowie wichtige Trade-offs.

### revise

G-02 geht auf `revise`, wenn das Design nicht stabil genug ist.

Typische Gründe:

- Traceability zum `PRD.contract` fehlt
- Verantwortlichkeiten sind unklar
- Trade-offs werden nicht erklärt
- Brownfield-Risiken sind nicht berücksichtigt
- bestehende Systemgrenzen werden ignoriert
- das Design enthält bereits implementierungsnahe Details

### block

G-02 geht auf `block`, wenn das Design auf einer falschen oder nicht freigegebenen Grundlage basiert.

Typische Gründe:

- kein freigegebener `PRD.contract`
- Design widerspricht Akzeptanzkriterien oder Non-Goals
- Design verändert Produktsemantik ohne Change-Entscheidung
- Security, Datenschutz oder Compliance sind ungeklärt

### Gate-Check

- Führt das Design auf den `PRD.contract` zurück?
- Sind Komponenten und Verantwortlichkeiten verständlich?
- Sind Schnittstellen und Datenflüsse passend abstrakt beschrieben?
- Werden bestehende Systemgrenzen respektiert?
- Bleibt das Design konzeptionell?
- Sind Risiken und Trade-offs sichtbar?

## G-03 — Task & Test Plan

G-03 prüft, ob aus Produktvertrag und Design ein steuerbarer Umsetzungsplan entstanden ist.

Der Task & Test Plan verbindet Arbeitspakete mit Testbarkeit. Er beschreibt nicht nur, was getan werden soll, sondern auch, warum es getan werden soll und wie später geprüft wird, ob es erledigt ist.

### Benötigte Eingaben

- freigegebener `PRD.contract`
- abgeschlossenes Solution Design
- Akzeptanzkriterien
- relevante Risiken
- Brownfield-Kontext, falls vorhanden

### pass

G-03 kann auf `pass` stehen, wenn die Tasks nachvollziehbar aus Vertrag und Design abgeleitet sind und die Akzeptanzkriterien ausreichend abgedeckt werden.

Ein guter Task hat eine erkennbare Begründung. Er existiert nicht nur, weil eine technische Zerlegung plausibel klingt.

### revise

G-03 geht auf `revise`, wenn der Plan nicht prüfbar genug ist.

Typische Gründe:

- Tasks haben keinen klaren Bezug zu Anforderungen oder Design
- Akzeptanzabdeckung fehlt oder ist unklar
- Tests fehlen für relevante Akzeptanzkriterien
- Reihenfolge oder Abhängigkeiten sind unklar
- Risiken wurden nicht in Tasks, Tests oder Review-Punkte übersetzt
- Brownfield-Kontext wurde nicht in eine spätere Analyse überführt

### block

G-03 geht auf `block`, wenn Umsetzung aus dem Plan nicht verantwortbar starten dürfte.

Typische Gründe:

- kein freigegebener `PRD.contract`
- kein tragfähiges Solution Design
- Akzeptanzkriterien sind nicht prüfbar
- eine zentrale Brownfield-Frage ist offen
- der Task Plan enthält Arbeit außerhalb des freigegebenen Scope

### Gate-Check

- Hat jede relevante Aufgabe einen Zweck?
- Führt jede Aufgabe auf Vertrag, Design, Risiko oder Qualitätsziel zurück?
- Sind Akzeptanzkriterien abgedeckt?
- Sind Tests oder Nachweise benannt?
- Sind Abhängigkeiten sichtbar?
- Ist klar, wann eine Aufgabe fertig ist?

## Brownfield Analysis vor G-04

In Brownfield-Kontexten reicht der frühe Brownfield Review aus G-00 nicht aus.

Vor der Implementierung braucht es eine konkrete Brownfield Analysis. Sie prüft pro Task, welche bestehenden Artefakte betroffen sind, was bereits vorhanden ist, welche Reuse-Strategie sinnvoll ist und ob neue Parallelstrukturen drohen.

Diese Prüfung liegt zwischen G-03 und G-04.

Sie beantwortet die operative Frage:

> Wie setzen wir den genehmigten Task & Test Plan im bestehenden System sauber und minimal-invasiv um?

### pass

Die Brownfield Analysis kann auf `pass` stehen, wenn relevante bestehende Artefakte identifiziert sind und ein begründeter Pfad für Wiederverwendung, Erweiterung, Refactoring oder Neuanlage vorliegt.

### revise

Sie geht auf `revise`, wenn wichtige Bestandsinformationen fehlen oder die Reuse-Strategie nicht belastbar ist.

Typische Gründe:

- relevante Module wurden nicht geprüft
- aktuelle Teilabdeckung ist unklar
- bestehende Ownership wurde nicht verstanden
- Test- oder Regressionsbedarf ist offen
- der minimal-invasive Pfad ist nicht begründet

### block

Sie geht auf `block`, wenn Implementierung wahrscheinlich neue Drift oder Parallelstrukturen erzeugen würde.

Typische Gründe:

- neues Artefakt trotz vorhandener Verantwortung
- zweiter State-, Render-, Recovery- oder Policy-Pfad
- unentschiedene SoT-vs-Runtime-vs-Produktsemantik-Frage
- Änderung würde bestehendes Verhalten brechen, ohne dass dies entschieden wurde

## G-04 — Code / Implementation

G-04 prüft, ob Umsetzung auf einer freigegebenen und nachvollziehbaren Grundlage stattfindet.

In diesem Gate entstehen Code, Tests, Konfigurationen, Migrationen, Dokumentationsänderungen und technische Nachweise.

### Benötigte Eingaben

- freigegebener `PRD.contract`
- abgeschlossenes Solution Design
- abgeschlossener Task & Test Plan
- Brownfield Analysis, falls bestehender Codebestand betroffen ist

### pass

G-04 kann auf `pass` stehen, wenn die Umsetzung zum genehmigten Plan passt, notwendige Nachweise vorliegen und offene Punkte sichtbar markiert sind.

`pass` bedeutet nicht nur: Code existiert.

`pass` bedeutet: Die Umsetzung ist gegen Vertrag, Design, Task & Test Plan und relevante Nachweise vertretbar.

### revise

G-04 geht auf `revise`, wenn die Umsetzung noch nicht ausreichend belegt oder nicht sauber genug abgegrenzt ist.

Typische Gründe:

- Tests fehlen oder wurden nicht ausgeführt
- Checks sind nicht nachvollziehbar
- einzelne Tasks sind nur teilweise umgesetzt
- Out-of-Scope-Änderungen sind entstanden
- Brownfield-Reuse wurde nicht wie geplant umgesetzt
- nicht verifizierte Punkte sind nicht markiert

### block

G-04 geht auf `block`, wenn Implementierung nicht verantwortbar freigegeben werden darf.

Typische Gründe:

- eine harte Voraussetzung fehlt
- Code widerspricht dem `PRD.contract`
- Security, Datenschutz oder Compliance sind offen
- Implementierung erzeugt ungeklärte Parallelstrukturen
- relevante Tests fehlen für wichtige Akzeptanzkriterien

### Gate-Check

- Wurde nur umgesetzt, was durch Vertrag, Design und Plan gedeckt ist?
- Sind neue Artefakte begründet?
- Sind Tests und Checks nachvollziehbar?
- Sind nicht ausgeführte Prüfungen sichtbar markiert?
- Gibt es Out-of-Scope-Änderungen?
- Sind Brownfield-Risiken adressiert?

## Task Plan Review nach G-04

Nach der Implementierung sollte nicht direkt zur finalen QA gesprungen werden.

Zuerst braucht es einen Task Plan Review.

Der Task Plan Review prüft, ob die Umsetzung den genehmigten Task & Test Plan tatsächlich erfüllt. Dabei wird jede relevante `task_id` einzeln betrachtet.

### pass

Der Task Plan Review kann auf `pass` stehen, wenn alle relevanten Tasks vollständig erfüllt und durch Evidenz belegt sind.

### revise

Er geht auf `revise`, wenn Tasks teilweise erfüllt sind oder Evidenz fehlt.

Typische Gründe:

- Acceptance Criteria sind nur teilweise erfüllt
- UI-, State-, Render- oder Runtime-Verhalten ist nicht belegt
- Tests sind vorhanden, passen aber nicht zur Aufgabe
- der Build ist grün, aber das Task-Ziel ist nicht vollständig erfüllt
- Out-of-Scope-Änderungen müssen geklärt werden

### block

Er geht auf `block`, wenn zentrale Aufgaben nicht erfüllt sind oder die Umsetzung nicht gegen den Plan verantwortbar ist.

Typische Gründe:

- wichtige Tasks sind nicht erledigt
- ein kritisches Akzeptanzkriterium fehlt
- Evidenz für zentrales Verhalten fehlt
- die Umsetzung weicht wesentlich vom genehmigten Task Plan ab

### Gate-Check

- Wurde jede relevante `task_id` einzeln geprüft?
- Ist der Status pro Task klar: vollständig, teilweise oder nicht erledigt?
- Sind Acceptance Criteria pro Task bewertet?
- Gibt es belastbare Evidenz?
- Sind Abweichungen dokumentiert?
- Welche Lücken gehen an QA?

## QA-Gate

QA prüft die Lieferfähigkeit des Ergebnisses.

Es geht nicht nur darum, ob Code vorhanden ist oder ob einzelne Tests grün sind. QA bewertet, ob das Ergebnis mit den vorhandenen Nachweisen verantwortbar freigegeben werden kann.

### Benötigte Eingaben

- Implementierung
- Test- und Check-Ergebnisse
- Task Plan Review
- bekannte Defects
- offene Risiken
- nicht verifizierte Punkte

### pass

QA kann auf `pass` stehen, wenn die Lieferung die relevanten Akzeptanzkriterien erfüllt, die Nachweise ausreichend sind und keine offenen Risiken eine Freigabe verhindern.

### revise

QA geht auf `revise`, wenn Korrekturen oder weitere Nachweise nötig sind.

### block

QA geht auf `block`, wenn die Lieferung nicht verantwortbar freigegeben werden darf.

Typische Gründe:

- kritische Defects
- fehlende Nachweise für wichtige Akzeptanzkriterien
- nicht akzeptiertes Risiko
- Compliance-, Datenschutz- oder Sicherheitsproblem

## Typische Blocker über alle Gates

Ein Gate sollte blockieren, wenn eine dieser Situationen vorliegt:

- eine harte Voraussetzung fehlt
- ein freigegebener Vertrag fehlt
- Scope oder Akzeptanzkriterien widersprechen sich
- ein späteres Artefakt interpretiert ein früheres Artefakt stillschweigend um
- Brownfield-Kontext wird ignoriert
- bestehende Ownership ist unklar
- neue Parallelstrukturen entstehen ohne Entscheidung
- nicht verifizierte Annahmen werden als Fakten behandelt
- Security, Datenschutz oder Compliance sind betroffen und ungeklärt
- Qualität wird behauptet, aber nicht belegt

## Minimale Gate-Checkliste

Diese Checkliste ist bewusst kurz. Sie soll helfen, ein Gate nicht mit einem langen Prozessformular zu verwechseln.

Vor dem Weitergehen sollte klar sein:

- Was ist die Grundlage?
- Was ist freigegeben?
- Welche Annahmen bestehen?
- Welche Risiken bleiben?
- Welche Nachweise liegen vor?
- Was wurde nicht geprüft?
- Was darf als Nächstes passieren?

Wenn eine dieser Fragen nicht beantwortet werden kann, ist das Gate nicht einfach bestanden.

## Verhältnis zu Tooling

Die Gates ersetzen keine Werkzeuge wie Jira, Azure DevOps, GitHub Issues, Pull Requests oder CI/CD.

Sie erklären, welche Entscheidung ein Werkzeug unterstützen soll.

Ein Jira-Ticket kann zeigen, woran gearbeitet wird. Ein Pull Request kann zeigen, was geändert wurde. Eine Pipeline kann 
zeigen, welche Checks gelaufen sind.

Das Gate beantwortet die Frage, ob diese Informationen zusammen ausreichen, um verantwortbar weiterzugehen.

Ideal wäre eine Integration, bei der LLMs, Agenten und Delivery-Werkzeuge kontrolliert miteinander verbunden sind. 
Protokolle wie MCP können dabei helfen, relevante Informationen aus Tickets, Repositories, Build-Systemen, Testläufen, 
Dokumentation oder Artefakt-Speichern zugänglich zu machen.

Entscheidend ist aber: Toolzugriff ersetzt keine Gate-Entscheidung.

Ein Agent darf nicht nur deshalb weiterarbeiten, weil er ein Ticket lesen, einen Branch öffnen oder eine Pipeline 
starten kann. Er muss prüfen, ob die Voraussetzungen des jeweiligen Gates erfüllt sind.

MCP oder vergleichbare Integrationen sollten deshalb nicht als direkter Autopilot verstanden werden, sondern als 
kontrollierte Verbindung zwischen Agent und Werkzeuglandschaft.

Das Ziel ist nicht:

> Der Agent kann alles ausführen.

Sondern:

> Der Agent kann die richtigen Nachweise lesen, die richtigen Aktionen auslösen und an Gate-Haltepunkten zuverlässig stoppen.

Gerade deshalb müssen Tool-Integrationen selbst governance-fähig sein: mit klaren Berechtigungen, nachvollziehbaren 
Aktionen, begrenzten Schreibrechten, Audit Logs und einer Trennung zwischen Lesen, Vorschlagen, Ändern und Freigeben.


## Nächster Schritt

Als nächstes sollten die Artefakte detaillierter beschrieben werden.

Das nächste Dokument ist daher:

[`03-artefakte.md`](docs/01-framework-ueberblick.md)
