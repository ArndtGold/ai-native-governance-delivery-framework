# QA-Freigabe mit dokumentierten Abweichungen

Ein Anwender kann eine ausdrücklich vorgelegte Fassung mit begrenzten, dokumentierten
Nachweislücken akzeptieren. Die technische QA-Bewertung bleibt dabei `revise`.
Nicht ausgeführte Prüfungen bleiben offen; eine native Produktionsqualifikation wird damit
nicht erteilt. Ein `block` oder ein offener Fehler in Anforderungen, Design, Plan oder
Implementierung kann auf diesem Weg nicht freigegeben werden.

## Bedienung

Wenn die native Freigabe für Host und aktuelle Laufzeit qualifiziert ist, bleibt
bei bestandener QA die Aktion **Freigeben**. Bei einem zulässigen Vorschlag zeigt
die Karte als einzige Entscheidungsaktion **Mit Abweichungen freigeben**. Vorher stehen
Geltungsbereich, Risiko, Folge, Nacharbeit und Verantwortlicher sichtbar in der Karte und
im Chat. Die englische Aktion heißt **Approve with deviations**.

Ist der native Klickweg nicht verfügbar, dient die Karte als Leseansicht. Sie zeigt
keinen gesperrten Freigabebutton, sondern die konkrete Antwort für die Chat-Freigabe.
Lesen, Quellen und die Rückkehr aus dem Dokument bleiben möglich. Eine sichtbare
MCP-Karte allein qualifiziert keinen nativen Schreibkanal.

Im Chat, auch auf dem iPad, bleibt die Antwort `Approval: QA`. Sie gilt ausschließlich
für den neu vorgelegten Vorschlag. Eine frühere zurückgewiesene Freigabe wird nicht
übernommen. Fragen oder zitierter Freigabetext entscheiden das Gate nicht.

Beide Wege verwenden denselben Core-Freigabeprozess und entscheiden die identische
Fassung einmal. Nach der gespeicherten Entscheidung führt der vorhandene Flow zu UAT.
Die UAT-Vorlage nennt die akzeptierten Abweichungen und den ursprünglichen QA-Befund.
Das Funktionsmerkmal setzt weder einen neuen MCP-Schreibkanal noch einen zusätzlichen
Bestätigungsbutton voraus. Ein produktiver Host muss die aktualisierte Laufzeit laden;
automatisierte Kartenprüfungen ersetzen keinen tatsächlichen Host-Nachweis.

## Vorschlag im bestehenden QA-Bericht

Der nicht freigegebene QA-Bericht bleibt die Quelle. Ergänze genau einen Abschnitt
mit genau einem JSON-Block, ohne zusätzliche Felder:

````markdown
## QA Deviation Acceptance
```json
{
  "schema_version": "1",
  "reviewer": "QA-Nachweisverantwortlicher",
  "usage_scope": "Begrenzte interne Chat-Nutzung; keine native Produktionsqualifikation.",
  "deviations": [
    {
      "finding_id": "MISSING-NATIVE",
      "severity": "medium",
      "risk": "Die native Sitzungsbeendigung ist noch nicht beobachtet.",
      "consequence": "Ein begrenzter Leser kann bis zum Ablauf aktiv bleiben.",
      "follow_up": "Den nativen Schließtest an genau diesem Kandidaten nachholen.",
      "owner": "Runtime-Nachweisverantwortlicher"
    }
  ]
}
```
````

Alle offenen normalisierten Befunde in den registrierten QA-/Review-Berichten müssen
genau abgedeckt sein. Zulässig sind ausschließlich Nachweislücken mit Ziel
`evidence_obligation` und explizit beurteilter Schwere `low` oder `medium`.
Diese Einstufung ist eine fachliche Aussage des Reviewers; Core ersetzt keine
unabhängige fachliche Sicherheitsbewertung.

Core verlangt aktuelle writergebundene QA-, Code-, Clean- und Plan-Review-Nachweise,
bestandene Code-/Clean-Reviews und die vorhandenen vorherigen Freigaben. Ungültige,
widersprüchliche oder unvollständige Befunde, hohe/kritische Schwere, fremde IDs,
harte Run-Blocker und Änderungen an gebundenen Quellen werden zurückgewiesen.
Ein unfreigegebener aktueller QA-Bericht darf über den bestehenden Artefaktwriter
aufgefrischt werden; bereits freigegebene Berichte dürfen dabei nicht umgeschrieben werden.

## Dauerhafter Nachweis und Abschluss

Die vorhandene Freigabequittung verwendet für diese Akzeptanz Schema `3` und trägt
`effect.qa_acceptance` mit Vorschlagsdigest, Befund-IDs und `qa_outcome: revise`.
Der unveränderliche QA-Präsentationsnachweis verwendet Schema `4`. Alte Quittungs-
und Präsentationsformate behalten ihre bisherigen Regeln. Nicht unterstützte neue
Formate dürfen nicht als reguläre QA-Freigabe interpretiert werden.

Der QA-Bericht und seine Befunde werden nicht als bestanden umgeschrieben. Live-Status
und UAT zeigen **mit Abweichungen akzeptiert**. Im OR müssen die Risiken und
Nacharbeiten sichtbar bleiben; zusätzlich sind diese exakten Felder erforderlich:

```markdown
- qa_acceptance: accepted_with_deviations
- accepted_qa_deviations_digest: sha256:<exakter Vorschlagsdigest>
```

Fehlende oder abweichende Angaben verhindern den Abschluss. Andere verpflichtende
Run-, Kontext- und Abschlussobliegenheiten bleiben wirksam. Eine spätere Quellenrevision
archiviert den ursprünglichen Bericht, seine Präsentation und Quittung und entzieht
der betroffenen aktuellen Freigabe ihre Autorität.

Der direkte Legacy-CLI-Aufruf ohne Operationsquittung unterstützt diese Akzeptanz nicht.
CLI-Automatisierung verwendet den vorhandenen `run-approve --operation-id`-Weg;
Chat und Karte verwenden ohnehin den typisierten Freigabewriter. Anwender müssen
dafür keine UUID eingeben.

## Verifikation des direkten Code-Fixes

Am 12.10.2026 wurden ausschließlich Wegwerf-Projekte geprüft:

- Core-Integration: deutsche Chat-Freigabe und englische Entscheidungssitzung, identische
  Materialbindung, einmaliger Effekt, Replay, Ablehnung des quittungslosen Legacy-Wegs,
  unveränderter QA-Bericht, UAT-Offenlegung, Quellenrevision samt Archiv sowie OR-Abschluss.
- Negative Fälle: harte Blockade, Implementierungslücke, hohe/kritische oder ungültige
  Einstufung, fehlende Angaben, falsche/mehrdeutige Befund-IDs, zitierte Antwort,
  veränderte Risiken, bereits freigegebener Bericht und fehlende/falsche OR-Offenlegung.
- Bestehende Freigabe-, Präsentations-, Quellenrevisions-, Backlog- und Abschlussprüfungen;
  232 UI-Tests und TypeScript-Prüfung.
- 14 Browser-/SDK-Kartenprüfungen und zwei Browserprüfungen mit zusammengesetzter
  Core-Laufzeit für automatisches Schließen und Freigabe/Fortsetzung/Sitzungsende.
- Paketbau und exakte Payloadgrenze; kein zusätzlicher MCP-Befehl.

Diese Nachweise bestätigen Code, Komponenten und den synthetischen SDK-Host. Sie
qualifizieren keinen produktiven nativen Host. Alle 6.883 vor dem direkten Fix erfassten
Dateien des bestehenden Controls blieben bytegleich. Der bestehende Run wurde damit
weder revidiert noch freigegeben oder abgeschlossen. Vor produktiver Nutzung muss die
aktualisierte Laufzeit geladen und ein konkreter Abweichungsvorschlag neu vorgelegt werden.
