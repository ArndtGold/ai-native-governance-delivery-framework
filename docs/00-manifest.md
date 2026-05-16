# Manifest: AI-native Governance & Delivery Framework

## Warum dieses Projekt existiert

Agentisches Software Engineering verändert gerade, wie Software geplant, entworfen, getestet und umgesetzt wird.

Viele Diskussionen drehen sich um Coding Agents, Produktivität und Automatisierung. Das ist nachvollziehbar. Wer sieht, wie schnell KI heute lauffähigen Code erzeugen kann, landet schnell bei der Frage, wie viel schneller Entwicklung dadurch wird.

Dieses Projekt setzt an einer anderen Stelle an:

> Wie halten wir Software Delivery kontrollierbar, prüfbar und am vereinbarten Ziel ausgerichtet, wenn KI-Agenten Anforderungen interpretieren, Lösungen entwerfen, Arbeitspakete ableiten, Tests planen und Implementierungsartefakte erzeugen?

In vielen Teams versucht man, den roten Faden über Jira, Azure DevOps, GitHub Issues oder ähnliche Ticket- und Planungssysteme zu halten. Diese Werkzeuge sind wichtig. Sie zeigen, woran gearbeitet wird, wer beteiligt ist und wie weit ein Vorgang fortgeschritten ist.

Sie beantworten aber nicht automatisch die Governance-Frage.

Ein typischer Satz aus der Praxis lautet:

> „Wir haben in Jira zu diesem Thema über 1000 Tickets, aber wir wissen nicht, was davon tatsächlich umgesetzt wurde."

Das ist kein reines Tool-Problem. Es zeigt eine Lücke zwischen Aktivität und fachlicher Nachvollziehbarkeit.

Ein Board zeigt, woran gearbeitet wird.
Dieses Framework erklärt, warum daran gearbeitet werden darf.

Agentisches Software Engineering braucht deshalb mehr als bessere Tools. Es braucht einen Delivery-Rahmen, der Scope, Freigabe, Traceability, Qualitätsnachweise, Rollen, Verantwortung und Änderungen sichtbar macht.

## Sprache und Kontext

Dieses Projekt ist bewusst Deutsch-first.

Der Grund ist fachlich: Governance, Verantwortung, Freigabe, Nachweisführung, Prüfpfade, Akzeptanzkriterien, Nicht-Ziele und Änderungssteuerung sind keine rein technischen Begriffe. Sie berühren Organisation, Haftung, Zusammenarbeit, Regulierung und Entscheidungsverantwortung.

Gerade im deutschsprachigen Raum, etwa in Unternehmen, Mittelstand, öffentlicher Verwaltung, regulierten Branchen und europäischen Governance-Kontexten, müssen diese Fragen präzise und anschlussfähig diskutiert werden können.

Englische Fachbegriffe wie `AI-native`, `Delivery`, `Gate`, `Traceability`, `PRD.contract` oder `Agentic Software Engineering` werden dort verwendet, wo sie als Fachanker hilfreich sind. Die argumentative und konzeptionelle Ausarbeitung erfolgt jedoch zunächst auf Deutsch.

Englische Übersetzungen können später entstehen. Die Primärfassung dieses Frameworks soll zuerst im deutschsprachigen Kontext geschärft werden.

## Kernthese

Agentisches Software Engineering braucht eine explizite Governance- und Delivery-Schicht.

Ohne eine solche Schicht kann KI-gestützte Delivery zwar schneller werden, aber zugleich schwer nachvollziehbar bleiben:

* Anforderungen können stillschweigend uminterpretiert werden
* Scope kann ohne Freigabe wandern
* Design kann zu früh in Implementierung kippen
* Tasks können technisch plausibel wirken, ohne fachlich legitimiert zu sein
* Tests können den Bezug zu Akzeptanzkriterien verlieren
* Qualitätsaussagen können ohne Nachweise bleiben
* Verantwortung kann unklar werden

Ziel dieses Frameworks ist es, KI-gestützte Software Delivery belastbarer zu machen, indem Absicht, Scope, Freigabe, Traceability und Qualitätsnachweise explizit werden.

Besonders relevant wird diese Governance-Schicht in Brownfield-Projekten, in denen KI-Agenten nicht nur neue Funktionen erzeugen, sondern bestehende Systeme verstehen, verändern, modernisieren und absichern müssen.

## Rollenwandel

Agentisches Software Engineering verändert nicht nur Werkzeuge, sondern Rollen.

Erfahrene Entwickler werden zunehmend zu Produzenten. Sie schreiben nicht mehr nur Code. Sie formulieren Ziele, geben Kontext, stabilisieren Scope, treffen Architekturentscheidungen, zerlegen Arbeit, bewerten Vorschläge, prüfen Qualität, priorisieren Risiken und entscheiden über Freigaben.

KI-Agenten können dabei Teile eines Entwicklungsteams simulieren oder übernehmen: Analyse, Planung, Implementierungsvorschläge, Testableitung, Dokumentation und Qualitätshinweise.

Gerade deshalb braucht diese Arbeitsweise einen Rahmen. Wenn ein erfahrener Entwickler mit KI wie mit einem Entwicklungsteam arbeitet, muss nachvollziehbar bleiben, warum etwas gebaut wird, worauf es basiert, wie es geprüft wird und wann es weitergehen darf.

## Brownfield als Kernrealität

Dieses Framework betrachtet Brownfield-Projekte nicht als Sonderfall, sondern als zentrale Realität agentischer Software Delivery.

Viele relevante KI-gestützte Softwarevorhaben werden nicht auf der grünen Wiese entstehen. Sie werden in bestehenden Systemlandschaften stattfinden: in gewachsenen Codebasen, mit historischen Architekturentscheidungen, unvollständiger Dokumentation, bestehenden Schnittstellen, regulatorischen Anforderungen, technischen Schulden und laufendem Betrieb.

Gerade dort reicht schnelle Code-Erzeugung nicht aus.

In Brownfield-Kontexten muss agentische Softwarearbeit besonders sorgfältig gesteuert werden:

* bestehendes Verhalten darf nicht unbemerkt verändert werden
* implizites Systemwissen muss sichtbar gemacht werden
* Abhängigkeiten müssen nachvollziehbar bleiben
* Änderungen brauchen klare Begründung und Freigabe
* Tests müssen bestehendes Verhalten absichern
* Risiken müssen vor Umsetzung explizit werden
* Migration, Rückbau und Rollback müssen mitgedacht werden

Brownfield-Delivery ist deshalb kein Randfall für dieses Framework. Sie ist wahrscheinlich der wichtigste Prüfstein.

Ob agentisches Software Engineering wirklich trägt, entscheidet sich nicht an der nächsten grünen Wiese, sondern an bestehenden Systemen: dort, wo Abhängigkeiten gewachsen sind, Wissen verteilt ist, Tests fehlen und Änderungen trotzdem verantwortbar geliefert werden müssen.

## Prinzipien

### 1. Keine Implementierung ohne freigegebenen Produktvertrag

Implementierung sollte nicht auf vager Absicht basieren.

Ein stabiler Produktvertrag definiert akzeptierten Scope, Akzeptanzkriterien, Non-Goals, Constraints und Erfolgsmessung.

### 2. Fail closed

Wenn eine notwendige Freigabe, Eingabe oder Qualitätsaussage fehlt, muss der Prozess stoppen oder eine Überarbeitung verlangen.

Der Standard darf nicht „best effort“ sein, wenn der nächste Schritt von ungeprüften Annahmen abhängt.

### 3. Eine verbindliche Quelle für Produktabsicht

Der Produktvertrag ist der Anker für alle nachgelagerten Arbeiten.

Design, Task & Test Plan und Implementierung dürfen den vereinbarten Scope nicht stillschweigend uminterpretieren.

### 4. Design und Code müssen getrennt bleiben

Konzeptuelles Design und Implementierungsdetails sollten nicht zu früh vermischt werden.

Design beschreibt Architektur, Verantwortlichkeiten, Schnittstellen und Abläufe.

Code beschreibt ausführbares Verhalten, Payloads, Schemas, Migrationen und Implementierungslogik.

### 5. Tasks brauchen fachliche Begründung

Ein Task ist nicht nur eine Karte auf einem Board.

Ein Task sollte nachvollziehbar machen, welche Anforderung, welches Akzeptanzkriterium, welche Designentscheidung, welches Risiko oder welches Qualitätsziel er adressiert.

Gerade bei KI-Agenten ist das wichtig, weil sie sehr schnell überzeugende Pläne erzeugen können. Die Zerlegung von Arbeit muss deshalb erklärbar und prüfbar bleiben.

### 6. Traceability ist keine Bürokratie

Traceability bedeutet nicht, möglichst viele Dokumente zu erzeugen.

Traceability bedeutet, grundlegende Delivery-Fragen beantworten zu können:

* Warum existiert diese Aufgabe?
* Welche Anforderung stützt diese Designentscheidung?
* Welches Akzeptanzkriterium validiert dieser Test?
* Welches freigegebene Artefakt erlaubt diese Implementierung?
* Was hat sich zwischen zwei Versionen geändert?

### 7. Qualität braucht Nachweise

Eine Qualitätsbehauptung reicht nicht aus.

Delivery sollte sichtbare Nachweise enthalten, zum Beispiel Testergebnisse, Build-Status, Review-Ergebnisse, bekannte Einschränkungen und verbleibende Risiken.

Was nicht geprüft wurde, sollte auch nicht so dargestellt werden, als sei es geprüft.

### 8. Änderungen müssen explizit sein

Wenn Scope, Akzeptanzkriterien, Non-Goals oder sicherheits-, compliance- oder datenschutzrelevante Aspekte geändert werden, muss diese Änderung dokumentiert und geprüft werden.

Agentische Delivery darf Änderungen nicht hinter flüssiger Konversation verstecken.

## Was dieses Framework ist

Dieses Framework ist ein Vorschlag für gate-basierte, auditierbare Software Delivery in KI-gestützten und agentischen Umgebungen.

Es strukturiert Arbeit entlang von:

* Nutzerabsicht
* Produktvertrag
* Solution Design
* Ableitung von Arbeitspaketen und Tests
* Implementierung
* Qualitätsnachweisen
* Review und Change Control

Es richtet sich an Teams, Builder, Forscherinnen und Forscher, Engineering Leads, Produktverantwortliche und Praktiker, die agentisches Software Engineering zuverlässiger, prüfbarer und verantwortbarer machen wollen.

## Was dieses Framework nicht ist

Dieses Framework ist kein Coding Standard.

Es ersetzt kein Engineering-Urteil.

Es ist nicht an ein bestimmtes KI-Modell, einen Anbieter, eine IDE, ein Agent Framework oder eine Programmiersprache gebunden.

Es soll Teams nicht durch unnötige Bürokratie verlangsamen.

Sein Zweck ist es, die kritischen Teile von Software Delivery so explizit zu machen, dass Menschen und KI-Agenten sicher zusammenarbeiten können.

## Offene Fragen

Dieses Projekt wird bewusst als Diskussionsentwurf veröffentlicht.

Wichtige Fragen sind:

1. Wie verändert sich die Rolle erfahrener Entwickler, wenn KI-Agenten Teile eines Entwicklungsteams übernehmen?
2. Wie viel Governance ist hilfreich, bevor sie zu schwergewichtig wird?
3. Ist ein Produktvertrag der richtige Anker für agentische Delivery?
4. Wo endet Design und wo beginnt Implementierung?
5. Wie lassen sich Tickets, Boards und Pull Requests mit fachlicher Traceability verbinden?
6. Welche Qualitätssignale sind notwendig, um Vertrauen zu schaffen?
7. Wie sollte Verantwortung zwischen Menschen und Agenten verteilt werden?
8. Welche Teile dieses Frameworks sollten durch Tooling unterstützt werden?
9. Was muss menschliches Review und menschliches Urteil bleiben?
10. Wie kann das Framework Brownfield-Modernisierung unterstützen, ohne bestehende Lieferprozesse zu überfrach
