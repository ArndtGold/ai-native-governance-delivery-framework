# Typische Arbeitsabläufe

AGDF verwendet den kleinsten sicheren Arbeitsablauf. Die Auswahl richtet sich nach Wirkung,
Verantwortung, Risiko und Nachweisbarkeit – nicht nach der Zahl geänderter Dateien.

## Quick Task

Ein Quick Task eignet sich außerhalb eines formalen Delivery-Runs für:

- Fragen zum bestehenden Code oder zur Dokumentation;
- reine Prüfungen und Reviews;
- Debugging;
- geeignete kleine Korrekturen ohne neue Produktsemantik oder formale Gate-Artefakte.

Prüfung und Änderung bleiben getrennt. Der Auftrag

```text
Prüfe, ob die README auf einen nicht vorhandenen Link verweist.
```

autorisiert zunächst die Prüfung und den Befund. Soll der Link auch korrigiert werden, muss dies aus
dem Auftrag hervorgehen oder anschließend beauftragt werden.

Ein Quick Task dokumentiert kompakt Ergebnis, Evidenz, verbleibendes Risiko und nächsten Schritt. Er
reicht nicht aus, wenn neue Produktsemantik, Architektur, Policy, Persistenz, ein öffentlicher
Vertrag, eine Release-Grenze oder formale Freigaben betroffen sind.

## Brownfield Review und Pfadauswahl

Nach `Approval: UR` prüft der Brownfield Review den bestehenden Kontext. Er erfasst vorhandene
Eigentümer, Quellen, geschütztes Verhalten, Wiederverwendung, Risiken und offene Entscheidungen.
Anschließend wird genau einer dieser Werte mit Begründung dokumentiert:

| Mode/Slice-Wert | Nutzerverständliche Bedeutung |
|---|---|
| `quick_task` | **Compact Delivery:** kleine, klar begrenzte Lieferung nach freigegebener UR |
| `verified_change` | begrenzte Änderung mit einem kanonischen Eigentümer und deterministischer Scope-, Propagations- und Testevidenz |
| `structured_slice` | eigenständig abnehmbares, begrenztes strukturiertes Ergebnis |
| `structured_delivery` | vollständige strukturierte Lieferung für folgenreiche oder koordinationsintensive Änderungen |
| `block` | Pfad kann wegen fehlender oder widersprüchlicher Entscheidungsgrundlagen noch nicht sicher gewählt werden |

Die Mode/Slice-Entscheidung ist ein interner Routing-Schritt, kein zusätzliches Nutzer-Gate.

## Compact Delivery

Compact Delivery ist die nutzerverständliche Bezeichnung für einen nach Brownfield Review
persistierten `quick_task`-Pfad. Die Umsetzung bleibt auf die freigegebene UR begrenzt. Der Agent
führt passende Prüfungen aus und dokumentiert einen kompakten Abschluss. PRD, SD und TP werden nicht
aus Gewohnheit erzeugt.

Wächst der Scope oder entstehen neue Produkt-, Architektur-, Policy- oder Release-Fragen, muss der
Pfad in eine strukturierte Lieferung eskalieren.

## Verified Change

Verified Change ist ein enger, fail-closed Pfad für eine begrenzte Änderung. Vor der Implementierung
müssen unter anderem belegt sein:

- genau ein kanonischer Eigentümer;
- begrenzte Quell- und Ableitungspfade;
- ein sauber erfasster Ausgangszustand der betroffenen Pfade;
- keine Auswirkungen auf Gates, Sicherheit, Persistenz, Architektur, öffentliche APIs, CLI- oder
  Release-Verhalten;
- deterministische Propagation und mindestens eine deterministische Prüfung;
- ein benanntes strukturiertes Eskalationsziel.

Fehlt ein Nachweis oder verändert sich ein nicht erlaubter Pfad, wird nicht großzügig weitergemacht.
Der Verified Change eskaliert zum festgelegten Structured Slice oder Structured Delivery.

## Structured Slice und Structured Delivery

Beide strukturierten Wege verwenden dieselben Nutzer-Gates. Der Unterschied ist die erforderliche
Tiefe.

Ein **Structured Slice** umfasst ein kohärentes, eigenständig abnehmbares Ergebnis. Verantwortung,
Auswirkungen, Migration, Fehlerbehandlung und Rücknahme müssen innerhalb des Slices begrenzt und
nachweisbar sein.

**Structured Delivery** ist erforderlich, wenn beispielsweise Autorität, Sicherheit, Architektur,
Persistenz, öffentliche Verträge, Deployment, Release oder mehrere unabhängige Eigentümer
koordiniert werden müssen.

Der normale strukturierte Ablauf ist:

```text
UR und Brownfield Review
→ PRD
→ SD
→ TP
→ Pre-Implementation Brownfield Analysis
→ CD+Tests
→ Task Plan Review, Clean Implementation Review und Code Review
→ QA
→ UAT
→ Orchestration Report und Delivery Closeout
```

Jeder Pfeil steht für einen erlaubten Übergang, nicht für eine automatische Fortsetzung. Die
Nutzer-Gates benötigen jeweils die exakte Approval-Zeile.

## Gute Arbeitsaufträge

Ein guter Arbeitsauftrag beschreibt zuerst Ziel und gewünschtes Ergebnis. Hilfreich sind außerdem:

- betroffene Nutzer, Dateien, Systeme oder Schnittstellen;
- Verhalten, das unverändert bleiben muss;
- bekannte Risiken und Abhängigkeiten;
- gewünschte Evidenz oder Akzeptanzkriterien;
- ausdrücklich erlaubte oder verbotene externe Aktionen.

Beispiel:

```text
Eine zur manuellen Prüfung markierte Echtzeitüberweisung darf das Tageslimit noch
nicht belasten.

Normale SEPA-Überweisungen und die bestehende Sicherheitsprüfung müssen unverändert
bleiben. Keine neue Datenbank und keine Übergangslösung einführen.
```

Solche Vorgaben helfen bei der Planung. Der Agent prüft trotzdem, ob sie zum bestehenden System, zu
den kanonischen Quellen und zum aktuellen Gate passen.

Weiter: [Mehrere Runs](04-mehrere-runs.md).
