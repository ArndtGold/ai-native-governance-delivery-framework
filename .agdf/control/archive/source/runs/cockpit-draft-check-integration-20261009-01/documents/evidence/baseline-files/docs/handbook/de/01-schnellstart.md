# Schnellstart

Du musst keine AGDF-Befehle lernen. Beschreibe dem Coding-Agenten dein Ziel und nenne betroffene
Dateien, Systeme oder Grenzen, soweit du sie kennst. Wenn du eine Umsetzung, ein verbindliches
Delivery-Artefakt oder eine ausdrückliche AGDF-Aktion verlangst, klärt der Agent zuerst das Vorhaben,
prüft den erlaubten nächsten Schritt und bereitet nur die dafür erforderlichen Inhalte vor.

Eine gewöhnliche Frage, Bewertung, Erklärung, Empfehlung, Prüfung oder Diagnose aktiviert AGDF nicht.
Der Agent beantwortet sie ohne AGDF-Statuskarte, Gate-Hinweis oder versteckte AGDF-Aktion. Das gilt
auch dann, wenn der Text AGDF oder eine mögliche Implementierung nur als Thema, Zitat, Beispiel,
Hypothese oder verneinte Handlung nennt. Ein gemischter Auftrag aktiviert AGDF erst dann, wenn er
tatsächlich eine Umsetzung oder ein anderes verbindliches Delivery-Ergebnis verlangt.

Vor dieser Entscheidung enthalten die erzeugten AGDF-Profile nur einen kleinen gemeinsamen
Aktivierungskern und kurze Skill-Beschreibungen. Ausführliche Regeln für Routing, Gates, Qualität und
Abschluss stellen sie erst nach positiver Aktivierung bei Bedarf bereit. Versionierte Größenbudgets
begrenzen diese sichtbaren Anweisungen und werden beim Erzeugen und Paketieren geprüft. Das reduziert
unnötige Systemanweisungen, ohne die Freigabe- oder Sicherheitsregeln zu lockern.

Diese Prüfungen belegen Quellcode und erzeugte Pakete. Ob ein konkreter Host dieselben Inhalte nach
Installation und Neustart tatsächlich lädt und behält, benötigt einen getrennten Host-Nachweis.

Du entscheidest bewusst, wann ein Nutzer-Gate freigegeben wird.

## Der erste Delivery-Auftrag

Ein fachlicher Auftrag kann zum Beispiel so beginnen:

```text
Eine zur manuellen Prüfung markierte Echtzeitüberweisung darf das Tageslimit noch
nicht belasten. Normale SEPA-Überweisungen müssen unverändert bleiben.
```

Der Coding-Agent klärt offene Punkte und erstellt oder aktualisiert die User Requirement (UR). Bei
einem frischen Vorhaben kann der erste Entwurf zunächst im Gespräch stehen. Ein dauerhaftes
Artefakt wird spätestens dann benötigt, wenn der weitere Gate-Pfad es verlangt.

Wenn die UR deiner Absicht entspricht, antwortest du exakt mit:

```text
Approval: UR
```

Eine Anweisung wie `Leg los`, `Mach weiter` oder `Sieht gut aus` kann den Agenten nur innerhalb des
bereits erlaubten Schritts weiterarbeiten lassen. Sie ersetzt keine Gate-Freigabe.

## Was eine Freigabe bewirkt

Eine Freigabe hat immer dieses Format:

```text
Approval: <GateName>
```

Die Nutzer-Gates sind:

```text
Approval: UR
Approval: PRD
Approval: SD
Approval: TP
Approval: QA
Approval: UAT
```

Jede Freigabe erlaubt nur den konkret nächsten Schritt. Beispielsweise erlaubt `Approval: PRD` das
Solution Design, aber noch keine Implementierung. Die genaue Wirkung erklärt
[Gates und Freigaben](02-gates-und-freigaben.md).

## Auswahl des Delivery-Pfads

Nach einer freigegebenen UR prüft AGDF den bestehenden Kontext im Brownfield Review. Dabei werden
vorhandene Verantwortungen, Quellen, Risiken und Wiederverwendungsmöglichkeiten betrachtet. Der
Review wählt mit Begründung den kleinsten sicheren Pfad:

- **Compact Delivery** für eine kleine, klar begrenzte Änderung nach freigegebener UR;
- **Verified Change** für eine begrenzte Änderung mit genau nachgewiesenem Eigentümer, sauberem
  Ausgangszustand und deterministischen Prüfungen;
- **Structured Slice** für ein eigenständig abnehmbares strukturiertes Teilergebnis;
- **Structured Delivery** für umfassende oder folgenreiche Änderungen;
- **Block**, wenn wichtige Entscheidungsgrundlagen fehlen oder widersprüchlich sind.

Unabhängige Fragen und reine Prüfungen bleiben außerhalb von AGDF. Eine kleine Korrektur ist dagegen
eine Umsetzung und aktiviert den passenden begrenzten Delivery-Pfad.

## Typischer strukturierter Ablauf

Eine strukturierte Änderung durchläuft normalerweise:

```text
Wunsch und eindeutiges Vorhaben
→ User Requirement (UR) und Approval: UR
→ Brownfield Review und Mode/Slice-Entscheidung
→ Product Requirements Document (PRD) und Approval: PRD
→ Solution Design (SD) und Approval: SD
→ Task- und Testplan (TP) und Approval: TP
→ Pre-Implementation Brownfield Analysis
→ Umsetzung und Tests (CD+Tests)
→ Task Plan Review, Clean Implementation Review und Code Review
→ QA-Entscheidung und Approval: QA
→ User Acceptance Testing (UAT) und Approval: UAT
→ Orchestration Report und Delivery Closeout
```

Structured Slice und Structured Delivery verwenden dieselben Nutzer-Gates. Sie unterscheiden sich
in der notwendigen Tiefe ihrer Artefakte und Nachweise. Compact Delivery und Verified Change haben
eigene kompakte Abschlusswege und führen nicht aus Gewohnheit durch die vollständige Gate-Kette.

## Was der Coding-Agent übernimmt

Abhängig vom aktuell erlaubten Schritt kann der Coding-Agent:

- bestehenden Kontext und Artefakte analysieren;
- den aktuellen Gate-Entwurf vorbereiten;
- freigegebene Aufgaben implementieren;
- Tests und Reviews ausführen;
- Nachweise und verbleibende Risiken dokumentieren;
- den nächsten erlaubten Schritt sichtbar machen.

Der Agent entscheidet niemals selbst, dass ein menschliches Gate freigegeben wurde. Er führt auch
keinen Commit, Push, Pull Request, Release oder eine externe Veröffentlichung ohne ausdrücklichen
Auftrag aus.

Weiter: [Gates und Freigaben](02-gates-und-freigaben.md).
