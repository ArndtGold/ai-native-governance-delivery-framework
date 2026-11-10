# Abschluss und Auslieferung

Ein erfolgreicher Testlauf bedeutet noch nicht, dass die Arbeit abgeschlossen oder auslieferbar ist.
AGDF trennt Umsetzung, Reviews, Quality Assurance, fachliche Abnahme und Auslieferung.

## Nach der Umsetzung

Für eine strukturierte Lieferung dokumentiert CD+Tests:

- welche Aufgaben umgesetzt wurden;
- welche Dateien oder Artefakte betroffen sind;
- welche Tests und Prüfungen liefen;
- welche Nachweise sichtbar sind;
- was nicht geprüft wurde;
- welche Risiken verbleiben.

Danach folgen die für den Scope erforderlichen Reviews. Der Code Review ist bei Codeänderungen ein
verpflichtender interner Schritt. Task Plan Review und Clean Implementation Review liefern weitere
Evidenz zu Planabdeckung und Lösungsgüte. Keiner dieser Reviews entscheidet allein QA.

## Quality Assurance

`qa-gate` ist der einzige Eigentümer der endgültigen QA-Entscheidung:

| Ergebnis | Bedeutung |
|---|---|
| `pass` | Planabdeckung, Lösungsgüte, Reviews und Evidenz reichen für den nächsten Gate-Entscheid aus. |
| `revise` | Eine korrigierbare Lücke oder fehlende Evidenz muss an den zuständigen Schritt zurückgeführt werden. |
| `block` | Eine harte Voraussetzung oder ein kritisches Risiko verhindert den Übergang. |

Ein QA-Bericht mit `pass` ist noch keine menschliche Freigabe. Erst das exakte

```text
Approval: QA
```

öffnet das UAT. Ein `revise`- oder `block`-Befund wird an den frühesten zuständigen Eigentümer
zurückgeführt. Das kann UR, PRD, SD, TP, CD+Tests oder eine Evidence Obligation sein.

## User Acceptance Testing

Im UAT prüfst du das Ergebnis aus Sicht der Nutzer und des vereinbarten Zwecks. Repository-Tests
oder ein QA-Bericht ersetzen diese Beobachtung nicht.

Beispiel:

```text
Eine zur manuellen Prüfung markierte Echtzeitüberweisung belastet das Tageslimit
noch nicht. Eine später freigegebene Zahlung wird genau einmal gezählt.
```

Entspricht das beobachtete Ergebnis der Anforderung, kannst du exakt freigeben:

```text
Approval: UAT
```

Passt das Ergebnis nicht, dokumentierst du den beobachteten Befund. Der Agent ordnet ihn dem
frühesten betroffenen Artefakt, der Umsetzung oder einer fehlenden Evidenz zu. Er behauptet nicht
selbst, dass UAT bestanden wurde.

## Welche Evidenz was beweist

Evidenz ist nur so stark wie die tatsächlich geprüfte Ebene. Ein Nachweis darf deshalb nicht für
eine weitergehende Aussage verwendet werden.

| Evidenz | Was sie belegt | Was sie nicht belegt |
|---|---|---|
| Repository- und Build-Evidenz | Was der geprüfte Quellstand enthält und welche dokumentierten Tests, Reviews oder Builds erfolgreich waren. | Dass genau diese Version installiert, bereitgestellt, für Nutzer erreichbar oder fachlich akzeptiert ist. |
| Beobachtung in einem installierten Host | Welches Verhalten bei der beobachteten Version, dem Konto, den Berechtigungen und der konkreten Situation auftrat. | Dass alle Konten, Versionen, Hosts oder Nutzer dasselbe Verhalten haben. |
| Menschliches UAT | Dass das beobachtete Verhalten für den vereinbarten Zweck und die geprüften Akzeptanzfälle angenommen wurde. | Dass andere Umgebungen funktionieren oder ein Deployment, eine Freigabe oder öffentliche Listung erfolgt ist. |
| Deployment- oder Veröffentlichungsevidenz | Dass die zuständige externe Plattform den konkret gelesenen Deployment-, Review- oder Veröffentlichungszustand meldet. | Dass ein lokales Bundle, eine vorbereitete Einreichung oder eine erwartete Plattformaktion bereits extern wirksam ist. |

Nenne bei wichtigen Aussagen deshalb Quelle, Version oder Prüfumfang der Evidenz und die Grenze der
Prüfung. Eine nicht ausgeführte Host-Beobachtung bleibt sichtbar `unverified`; sie wird nicht aus
Repository-Tests abgeleitet.

## Native Agententests lesen

Ein Agent kann die beauftragte Aufgabe nach Korrekturen erfüllen und dabei trotzdem technische
Fehler oder ein Zeitlimit erreichen. Ein belastbarer Prüfbericht nennt deshalb getrennt:

- **Aufgabenerfüllung:** Welche Fälle wurden vollständig durchlaufen, einschließlich notwendiger
  Korrekturen und frischer Entscheidungsvorlagen?
- **Ablaufqualität:** Welche Werkzeug- und Aufruffehler, Wiederanläufe oder Zeitlimits traten auf?
- **Prüfumgebung:** Welche Quellen, installierten Versionen, Hosts, Modelle und festen Grenzen
  lagen der Prüfung zugrunde?
- **Aussagegrenze:** Welche Wege blieben ungeprüft, welche Befunde offen und welche Entscheidungen
  wurden nur für den Test simuliert?

Ein konkretes Beispiel ist der [native SD-/TP-Test vom 6. November 2026](../../development/native-authoring-recovery-2026-11-05.md#completed-resumption-campaign-on-2026-11-06):
Alle drei frischen Fälle durchliefen Korrektur, neue Vorlage und simulierte Freigabe für SD und TP.
Die 181 MCP-Aufrufe hatten keinen MCP-Ausführungsfehler. Vier Fehler in aufrufendem Hilfscode,
zwei erreichte Zeitlimits und ein falsch zugeordneter Dateivergleich blieben jedoch dokumentiert.
Das Ergebnis lautet deshalb **3/3 funktional abgeschlossen, 0/3 vollständig fehlerfrei**.

Simulierte Freigaben belegen den getesteten Ablauf. Menschliches UAT bleibt eine eigene Beobachtung
und Entscheidung. Auch der Prüfer selbst braucht nachvollziehbare Kriterien: Ein fehlerhafter
Vergleich darf weder eine tatsächlich beobachtete Werkzeugnutzung unsichtbar machen noch
nachträglich aus dem ursprünglichen Ergebnis entfernt werden.

## Orchestration Report und Delivery Closeout

Nach dem erforderlichen QA-/UAT-Weg fasst der Orchestration Report den Lauf zusammen. Er nennt
Gate-Status, gelieferten und bewusst nicht gelieferten Scope, Planabdeckung, Lösungsgüte, Evidenz,
Risiken und den nächsten erlaubten Schritt.

Delivery Closeout bereitet den operativen Git-Handoff vor. Weder Report noch Closeout führen
automatisch einen Commit, Push, Pull Request, Release, Deployment oder eine externe Veröffentlichung
aus.

## Git und Release

Git- und Release-Aktionen benötigen einen ausdrücklichen Auftrag mit klarem Ziel. Das gilt auch nach
erfolgreicher QA und UAT für:

- Staging;
- Commit;
- Push;
- Pull Request;
- Tag oder Release;
- Deployment, Plugin-Einreichung oder Veröffentlichung.

Repository-Evidenz beweist keine externe Ausführung. Ein lokaler Build ist kein Deployment, ein
Plugin-Bundle keine Installation und eine vorbereitete Einreichung keine Veröffentlichung.

Weiter: [Fehlerbehebung](06-fehlerbehebung.md).
