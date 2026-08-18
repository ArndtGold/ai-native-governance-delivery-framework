# Fehlerbehebung

Wenn der Agent anhält, ist zuerst zu klären, welche Ebene betroffen ist:

1. **Installation:** Ist das Plugin oder die Runtime technisch vorhanden und in der erwarteten
   Version geladen?
2. **Repository-Aktivierung:** Besitzt das Ziel-Repository gültige AGDF-Konfiguration und
   kontrollierten Run-State?
3. **Delivery-Status:** Welcher Run und welches Gate sind aktiv, was fehlt und was ist als Nächstes
   erlaubt?

Eine gesunde Installation und ein blockierter Delivery-Status können gleichzeitig korrekt sein.

## Eine Freigabe fehlt

Prüfe zuerst, ob du den richtigen Run, das richtige Gate und die aktuelle Artefaktrevision siehst.
Entspricht das Artefakt deiner Entscheidung, gib die Freigabe exakt ein:

```text
Approval: TP
```

`OK`, `Weiter`, `Leg los`, `Approved` oder ein Wert mit Zusatz wie
`Approval: TP (Recommended)` sind keine gültigen Gate-Freigaben.

Wenn das Artefakt nicht passt, beschreibe die Korrektur. Gib das Gate nicht vorsorglich frei.

## Mehrere aktive Runs

Bei mehreren aktiven Runs darf AGDF nicht raten. Nenne das Vorhaben oder die Run-ID eindeutig oder
bitte den Agenten, die Kandidaten mit Gate, Artefakten und nächstem Schritt aufzulisten.

Das Plugin allein installiert keinen Shell-Befehl `agdf`. Prüfe deshalb zuerst:

```bash
command -v agdf
```

Zeigt der Befehl keinen Pfad an, verwende entweder den vollständigen Registry-Aufruf

```bash
npx --yes @agdf/cli@latest gate-check --run payment-limit-fix
```

oder installiere die CLI bewusst global:

```bash
npm install --global @agdf/cli
```

Die folgenden Kurzformen mit `agdf` setzen diese globale Installation voraus und werden im
Ziel-Repository ausgeführt. `npx ...@latest` verwendet dagegen die aktuell veröffentlichte
Registry-Version, die vom Stand eines lokalen Repository-Checkouts abweichen kann. Ersetze
`payment-limit-fix` durch die angezeigte Run-ID.

Prüfe veröffentlichte, global installierte und lokale Repository-Version getrennt:

```bash
npm view @agdf/cli version
npm list --global --depth=0 @agdf/cli
node -p "require('./agdf/package.json').version"
```

Die dritte Zeile ist nur im Root-Verzeichnis eines AGDF-Repository-Checkouts sinnvoll. Eine leere
globale npm-Liste bedeutet, dass `agdf` auf diesem Rechner nicht global installiert ist.

Wähle den Run für einen einzelnen Gate-Check ausdrücklich aus:

```bash
agdf gate-check --run payment-limit-fix
```

Alternativ gilt die Umgebungsvariable nur für diesen einen Befehl:

```bash
AGDF_RUN_ID=payment-limit-fix agdf gate-check
```

Prüfe alle aktiven Runs unabhängig voneinander mit:

```bash
agdf doctor --all-active
```

## Repository-Aktivierung fehlt

Eine globale Installation beweist nur die technische Verfügbarkeit der jeweiligen Oberfläche. Sie
beweist noch keinen repository-eigenen dauerhaften Kontrollzustand. Führe im Ziel-Repository genau
den Statusbefehl für die verwendete Oberfläche aus:

```bash
agdf status --surface codex
agdf status --surface claude
agdf status --surface opencode
```

Du brauchst nur eine dieser drei Zeilen. Die Installations- und Aktivierungsschritte der einzelnen
Oberflächen stehen in [INSTALL.md](../../../INSTALL.md). Verwende für Repository-Aktivierung und
dauerhaften Kontrollzustand nur den dort dokumentierten Pfad. Ein frischer agentennativer Auftrag
kann trotzdem zunächst mit einer minimalen UR im Gespräch beginnen, wenn noch kein dauerhaftes
Repository-Control benötigt wird.

Ein relativer Dateiglob oder die bloße Existenz irgendeiner `.agdf`-Datei beweist keine gültige
Aktivierung. Wenn die globale CLI den dokumentierten Installationspfad deiner Oberfläche bildet,
prüfst du den Repository-Zustand vollständig mit:

```bash
agdf doctor --json
```

Verwendet deine Oberfläche stattdessen einen eigenen lokalen Validator, führe den vollständigen
oberflächenspezifischen Befehl aus [INSTALL.md](../../../INSTALL.md) aus.

## Legacy Run State oder Mixed Authority

Die kanonische veränderliche Run-Datei liegt unter:

```text
.agdf/control/runs/<run_id>/RUN_STATE.md
```

Eine ältere `.agdf/control/AGDF_RUN.md` kann Migrationseingabe oder eine ausdrücklich erzeugte,
nicht autoritative Projektion sein. Sie ist kein zweiter veränderlicher Eigentümer.

Lösche oder überschreibe Legacy-Dateien nicht auf Verdacht. Prüfe zuerst den ausgewählten Run:

```bash
agdf doctor --run payment-limit-fix --json
agdf gate-check --run payment-limit-fix --json
```

Wenn die Diagnose eine Migration verlangt, führe sie ausdrücklich für dieselbe Run-ID aus:

```bash
agdf run-migrate --run payment-limit-fix
```

Ersetze `payment-limit-fix` durch die betroffene Run-ID. Read-only-Befehle wie `doctor` und
`gate-check` migrieren den Zustand nicht automatisch.

## Der Agent meldet `revise` oder `block`

`revise` bedeutet, dass eine korrigierbare Lücke oder fehlende Evidenz offen ist. `block` bedeutet,
dass eine harte Voraussetzung, Autoritätsfrage oder kritisches Risiko ungeklärt bleibt.

Prüfe im Status:

- den ausgewählten Run;
- aktuelles Gate oder internen Schritt;
- erlaubte und verbotene Aktionen;
- Blocker oder offenen Befund;
- fehlende Freigabe oder Evidenz;
- genau den nächsten erlaubten Schritt.

Ein Befund wird an seinen zuständigen Eigentümer zurückgeführt. Er darf nicht einfach im aktuellen
späteren Gate überschrieben werden. Wenn der Agent keinen konkreten nächsten Schritt nennen kann,
bitte um einen AGDF-Gate-Check für den ausdrücklich benannten Run.

## Versions- oder Paketfehler

Ein Quelltest, installiertes Plugin und öffentliches Bundle sind unterschiedliche Evidenzklassen.
Bei Versionsfehlern müssen kanonische Definition, Pakete, generierte Manifeste und veröffentlichte
Artefakte zusammenpassen. Ändere nicht nur eine abgeleitete Datei und behaupte danach Konsistenz.

Führe die dokumentierten Integritäts- und Paketprüfungen aus und halte fehlgeschlagene oder nicht
ausgeführte Host-Beobachtungen sichtbar.

Zurück zum [Handbuch-Index](README.md).
