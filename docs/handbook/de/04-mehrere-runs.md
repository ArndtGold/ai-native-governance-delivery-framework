# Mehrere Runs

Ein **Run** ist der dauerhafte AGDF-Kontrollzustand eines Vorhabens. Jeder Run besitzt eigene
Artefakte, Freigaben, Evidenz, Risiken und einen eigenen nächsten erlaubten Schritt.

Ein Run ist jedoch keine technische Arbeitskopie. Er isoliert nicht automatisch Branch, Worktree,
Dateien, Prozesse oder externe Systeme.

## Run-Auswahl

Normalerweise musst du dich nicht um die technische Auswahl kümmern:

- Gibt es genau einen aktiven Run, kann AGDF ihn automatisch auswählen.
- Gibt es mehrere plausible aktive Runs, muss der Agent die Kandidaten sichtbar machen.
- Ist dein Auftrag nicht eindeutig, stoppt der Agent und bittet um die kleinste notwendige Klärung.
- Ein neuer ausdrücklich benannter Auftrag ersetzt einen zuvor angenommenen Arbeitsgegenstand.

Arbeitsverzeichnis, Branchname, vorhandener Diff oder Chatverlauf reichen allein nicht aus, um einen
Run als autoritativ auszuwählen.

## Mehrere Aufgaben im selben Repository

Für einen Fehler, eine neue Funktion und eine Dokumentationsänderung kann AGDF jeweils einen eigenen
Run führen. Die Kontrollzustände bleiben getrennt. Änderungen im gemeinsamen Arbeitsverzeichnis
können sich trotzdem überschneiden.

Der Agent muss deshalb:

- den betroffenen Run und Scope vor Änderungen bestätigen;
- bereits vorhandene fremde Änderungen sichtbar halten;
- nicht zugehörige Dateien unangetastet lassen;
- bei überlappenden Pfaden, widersprüchlichen Artefakten oder unklarer Autorität fail closed stoppen;
- bei Bedarf einen separaten Branch oder Worktree als technische Isolation verwenden.

Ein Run ersetzt keine Git- oder Worktree-Strategie.

## Abgeschlossene Runs

Ein abgeschlossener Run bleibt als Nachweis erhalten. So lässt sich später nachvollziehen:

- welche Entscheidung getroffen wurde;
- welche Artefakte und Freigaben vorlagen;
- welche Prüfungen ausgeführt wurden;
- welche Risiken oder Grenzen dokumentiert waren.

Neue Arbeit verwendet nicht still den abgeschlossenen Zustand. Sie benötigt einen neuen oder einen
anderen ausdrücklich ausgewählten aktiven Run. Historische Evidenz kann verlinkt werden, ohne den
abgeschlossenen Run umzuschreiben.

## Runs ohne Lieferung beenden

Nicht jeder Run wird geliefert. Wurde ein Vorhaben durch einen anderen Run ersetzt oder wird es
nicht weiterverfolgt, beendest du ihn ausdrücklich:

- **superseded**: ersetzt, mit Nachfolger und Grund. Der Nachfolger ist eine bestehende Run-ID oder
  ein freier Verweis, etwa ein Pull Request, der als ungeprüft vermerkt wird.
- **abandoned**: nicht weiterverfolgt, mit Grund.

Der Ablauf hat zwei Schritte. Zuerst zeigt eine Vorschau jeden gewählten Run mit Gate, offenen
Freigaben, letzter Aktivität und Warnungen; sie ändert nichts. Dann bestätigst du genau diese
Vorschau mit dem Satz `Close runs: <preview_id>`. Ein Agent bereitet die Vorschau vor und reicht
nur deine wörtliche Antwort weiter. Jeder Run, der sich seit der Vorschau nicht geändert hat, wird
geschlossen und erhält einen eigenen Beleg mit Grund, Zeitpunkt und deiner Git-Identität. Das
Ergebnis nennt jeden Run einzeln. Wartet irgendwo im Repository eine unterbrochene Schreiboperation
auf Wiederherstellung, wird nichts geschlossen.

Ein beendeter Run ist endgültig. Er verschwindet aus allen Listen aktiver Runs, bleibt als Historie
lesbar und nimmt keine weiteren Schritte, Freigaben oder Fortsetzungen an. Soll die Arbeit doch
weitergehen, legst du einen neuen Run an, der auf den alten verweisen kann.

In der Shell erledigst du dasselbe mit `run-close`. Die Vorschau gibt die Vorschau-ID und den
genauen Satz aus; erst der zweite Befehl schließt:

```bash
agdf run-close --action preview --run payment-limit-v1 --outcome superseded --reason "Replaced by the limit redesign" --successor-run payment-limit-v2
agdf run-close --action apply --preview-id 3f2a9c1e --confirmation "Close runs: 3f2a9c1e"
```

`--successor-run` verlangt eine bestehende Run-ID. Für einen freien Verweis wie einen Pull Request
nimmst du `--successor-ref`, für `abandoned` lässt du den Nachfolger weg. Mehrere Runs auf einmal
beschreibst du in einer JSON-Datei und übergibst sie mit `--closure-file`. Ersetze die Run-IDs und
die Vorschau-ID durch die Werte, die AGDF dir anzeigt.

## Wie die CLI einen Run auswählt

Diese Auswahl brauchst du normalerweise nur, wenn mehrere Runs aktiv sind. Die Run-ID steht im
AGDF-Status. Ein Beispiel wäre `payment-limit-fix`.

Das Plugin und die CLI sind getrennte Installationen. Eine Plugin-Installation stellt deshalb nicht
automatisch den Shell-Befehl `agdf` bereit. Prüfe zuerst, ob die global installierte CLI vorhanden
ist:

```bash
command -v agdf
```

Zeigt der Befehl keinen Pfad an, hast du zwei Möglichkeiten:

```bash
npm install --global @agdf/cli
agdf gate-check --run payment-limit-fix
```

Oder du führst denselben Check ohne globale Installation über das veröffentlichte npm-Paket aus:

```bash
npx --yes @agdf/cli@latest gate-check --run payment-limit-fix
```

`npx ...@latest` kann das aktuell veröffentlichte Paket aus der npm-Registry laden. Diese Version
kann hinter dem Stand eines lokalen Repository-Checkouts liegen. Verwende `npx ...@latest` deshalb
für Bootstrap, Installation oder einen bewussten Registry-Aufruf und die global installierte CLI für
wiederholte lokale Prüfungen. Die vollständigen Installationswege stehen in
[INSTALL.md](../../../INSTALL.md). Alle folgenden Befehle werden im Ziel-Repository ausgeführt.

Für einen einzelnen CLI-Befehl gibst du die Run-ID mit `--run` an:

```bash
agdf gate-check --run payment-limit-fix
```

Wenn mehrere Befehle denselben Run verwenden sollen, kannst du stattdessen die Umgebungsvariable
für deine aktuelle Shell setzen:

```bash
export AGDF_RUN_ID=payment-limit-fix
agdf doctor
agdf gate-check
unset AGDF_RUN_ID
```

`unset AGDF_RUN_ID` entfernt die Auswahl anschließend wieder. Ersetze `payment-limit-fix` in den
Beispielen durch die Run-ID, die AGDF für dein Vorhaben anzeigt.

Die CLI prüft zuerst ein ausdrücklich gesetztes `--run` und danach `AGDF_RUN_ID`. Ohne beides wählt
sie nur dann automatisch, wenn genau ein Run aktiv ist. Bleiben mehrere Runs möglich, stoppt AGDF,
statt zu raten.

Die Run-Auswahl bestimmt nur, welchen AGDF-Kontrollzustand der Befehl verwendet. Sie erstellt oder
wechselt keinen Git-Branch und keinen Worktree.

Weiter: [Abschluss und Auslieferung](05-abschluss-und-auslieferung.md).
