# Manifest: AI-native Governance & Delivery Framework

## Warum dieses Projekt existiert

Agentisches Software Engineering verändert, wie Software geplant, entworfen, getestet und umgesetzt wird.

Die aktuelle Diskussion konzentriert sich häufig auf Coding Agents, Produktivitätsgewinne und Automatisierung. Code-Erzeugung ist jedoch nur ein Teil von Software Delivery.

Die wichtigere Frage lautet:

> Wie halten wir Software Delivery kontrollierbar, auditierbar und am vereinbarten Ziel ausgerichtet, wenn KI-Agenten Anforderungen interpretieren, Lösungen entwerfen, Tests planen und Implementierungsartefakte erzeugen?

Dieses Projekt startet mit der Annahme, dass agentisches Software Engineering mehr braucht als bessere Tools.

Es braucht Governance-Prinzipien, die für KI-gestützte Delivery gemacht sind.

## Sprache und Kontext

Dieses Projekt ist bewusst Deutsch-first.

Der Grund ist fachlich: Governance, Verantwortung, Freigabe, Nachweisführung, Prüfpfade, Akzeptanzkriterien, Nicht-Ziele und Änderungssteuerung sind keine rein technischen Begriffe. Sie berühren Organisation, Haftung, Zusammenarbeit, Regulierung und Entscheidungsverantwortung.

Gerade im deutschsprachigen Raum, etwa in Unternehmen, Mittelstand, öffentlicher Verwaltung, regulierten Branchen und europäischen Governance-Kontexten, müssen diese Fragen präzise und anschlussfähig diskutiert werden können.

Englische Fachbegriffe wie `AI-native`, `Delivery`, `Gate`, `Traceability`, `PRD.contract` oder `Agentic Software Engineering` werden dort verwendet, wo sie als etablierte Fachanker hilfreich sind. Die argumentative und konzeptionelle Ausarbeitung erfolgt jedoch zunächst auf Deutsch.

Englische Übersetzungen können später entstehen. Die Primärfassung dieses Frameworks soll zuerst im deutschsprachigen Kontext geschärft werden.

## Kernthese

Agentisches Software Engineering braucht eine explizite Governance- und Delivery-Schicht.

Ohne eine solche Schicht kann KI-gestützte Delivery zwar schneller werden, aber zugleich intransparent:

- Anforderungen können stillschweigend uminterpretiert werden
- Scope kann ohne Freigabe wandern
- Design kann zu früh in Implementierung kippen
- Tests können den Bezug zu Akzeptanzkriterien verlieren
- Qualitätsaussagen können ohne Nachweise bleiben
- Verantwortung kann unklar werden

Ziel dieses Frameworks ist es, KI-gestützte Software Delivery belastbarer zu machen, indem Absicht, Scope, Freigabe, Traceability und Qualitätsnachweise explizit werden.

Besonders relevant wird diese Governance-Schicht in Brownfield-Projekten, in denen KI-Agenten nicht nur neue Funktionen erzeugen, sondern bestehende Systeme verstehen, verändern, modernisieren und absichern müssen.

## Brownfield als Kernrealität

Dieses Framework betrachtet Brownfield-Projekte nicht als Sonderfall, sondern als zentrale Realität agentischer Software Delivery.

Viele relevante KI-gestützte Softwarevorhaben werden nicht auf der grünen Wiese entstehen. Sie werden in bestehenden Systemlandschaften stattfinden: in gewachsenen Codebasen, mit historischen Architekturentscheidungen, unvollständiger Dokumentation, bestehenden Schnittstellen, regulatorischen Anforderungen, technischen Schulden und laufendem Betrieb.

Gerade dort reicht schnelle Code-Erzeugung nicht aus.

In Brownfield-Kontexten muss agentische Softwarearbeit besonders sorgfältig gesteuert werden:

- bestehender Scope darf nicht unbemerkt verändert werden
- implizites Systemwissen muss sichtbar gemacht werden
- Abhängigkeiten müssen nachvollziehbar bleiben
- Änderungen brauchen klare Begründung und Freigabe
- Tests müssen bestehendes Verhalten absichern
- Risiken müssen vor Umsetzung explizit werden
- Rückbau, Migration und Rollback müssen mitgedacht werden

Brownfield-Delivery ist deshalb ein Hauptanwendungsfall dieses Frameworks.

Das Ziel ist nicht nur, neue Funktionen schneller zu erzeugen. Das Ziel ist, bestehende Systeme kontrolliert, nachvollziehbar und verantwortbar mit KI-Agenten weiterzuentwickeln.

## Prinzipien

### 1. Keine Implementierung ohne freigegebenen Produktvertrag

Implementierung sollte nicht auf vager Absicht basieren.

Ein stabiler Produktvertrag definiert akzeptierten Scope, Akzeptanzkriterien, Non-Goals, Constraints und Erfolgsmessung.

### 2. Fail closed

Wenn eine notwendige Freigabe, Eingabe oder Qualitätsaussage fehlt, muss der Prozess stoppen oder eine Überarbeitung verlangen.

Der Standard darf nicht „best effort“ sein, wenn der nächste Schritt von ungeprüften Annahmen abhängt.

### 3. Eine verbindliche Quelle für Produktabsicht

Der Produktvertrag ist der Anker für alle nachgelagerten Arbeiten.

Design, Testplanung und Implementierung dürfen den vereinbarten Scope nicht stillschweigend uminterpretieren.

### 4. Design und Code müssen getrennt bleiben

Konzeptuelles Design und Implementierungsdetails sollten nicht zu früh vermischt werden.

Design beschreibt Architektur, Verantwortlichkeiten, Schnittstellen und Abläufe.

Code beschreibt ausführbares Verhalten, Payloads, Schemas, Migrationen und Implementierungslogik.

### 5. Traceability ist keine Bürokratie

Traceability bedeutet, grundlegende Delivery-Fragen beantworten zu können:

- Warum existiert diese Aufgabe?
- Welche Anforderung stützt diese Designentscheidung?
- Welches Akzeptanzkriterium validiert dieser Test?
- Welches freigegebene Artefakt erlaubt diese Implementierung?
- Was hat sich zwischen zwei Versionen geändert?

### 6. Qualität braucht Nachweise

Eine Qualitätsbehauptung reicht nicht aus.

Delivery sollte sichtbare Nachweise enthalten, zum Beispiel Testergebnisse, Build-Status, Review-Ergebnisse, bekannte Einschränkungen und verbleibende Risiken.

### 7. Änderungen müssen explizit sein

Wenn Scope, Akzeptanzkriterien, Non-Goals oder sicherheits-, compliance- oder datenschutzrelevante Aspekte geändert werden, muss diese Änderung dokumentiert und geprüft werden.

Agentische Delivery darf Änderungen nicht hinter flüssiger Konversation verstecken.

## Was dieses Framework ist

Dieses Framework ist ein Vorschlag für gate-basierte, auditierbare Software Delivery in KI-gestützten und agentischen Umgebungen.

Es strukturiert Arbeit entlang von:

- Nutzerabsicht
- Produktvertrag
- Solution Design
- Testplanung
- Implementierung
- Qualitätsnachweisen
- Review und Change Control

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

1. Wie viel Governance ist hilfreich, bevor sie zu schwergewichtig wird?
2. Ist ein Produktvertrag der richtige Anker für agentische Delivery?
3. Wo endet Design und wo beginnt Implementierung?
4. Welche Qualitätssignale sind notwendig, um Vertrauen zu schaffen?
5. Wie sollte Verantwortung zwischen Menschen und Agenten verteilt werden?
6. Welche Teile dieses Frameworks sollten durch Tooling unterstützt werden?
7. Was muss menschliches Review und menschliches Urteil bleiben?
8. Wie kann das Framework Brownfield-Modernisierung unterstützen, ohne bestehende Lieferprozesse zu überfrachten?

## Einladung

Dieses Projekt lädt zu Diskussion, Kritik und Experimenten ein.

Das Ziel ist nicht, einen starren Prozess vorzuschreiben.

Das Ziel ist, gemeinsam zu erkunden, wie zuverlässige, auditierbare und AI-native Software Delivery aussehen kann.