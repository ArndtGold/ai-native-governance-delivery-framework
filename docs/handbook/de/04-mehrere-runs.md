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
