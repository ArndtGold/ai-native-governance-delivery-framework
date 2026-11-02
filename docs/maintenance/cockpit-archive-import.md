# Alte Bestände ins Cockpit-Archiv übernehmen

`scripts/import-cockpit-archive.mjs` übernimmt den alten Inhalt von `.agdf/control`
einmalig als lesbares Archiv. Im Cockpit erscheinen die übernommenen Bestände unter
**Archiv**. Status, Gate und Freigaben sind damalige Quellenangaben. Daraus
entstehen weder aktuelle Freigaben noch aktive Runs oder aktuelle geplante URs.

**Beendet** zeigt aktuelle Runs mit abgeschlossenem oder beendetem Lebenszyklus.
**Archiv** enthält ausschließlich eingefrorene Altbestände. `history/` bleibt dem
Revisions- und Änderungsverlauf innerhalb eines aktuellen Runs vorbehalten.

Der Archivkatalog unterscheidet alte Runs, Artefaktbestände ohne Run-Zustand und gemeinsame
Projektdateien. `recorded_lifecycle`, `recorded_gate` und `recorded_approvals` sind aufgezeichnete
Quellenangaben. `archived_at` bezeichnet die Archivierung; es datiert keine alte Freigabe neu.
Der technische Backup-Ordner dient der Wiederherstellung, das Archiv dem dauerhaften Nachlesen.

Der Core verarbeitet weiterhin ausschließlich `run-folders-v1` / Run v4. Das Cockpit
liest nur das neue Archivformat `cockpit-archive/1`. Die Auswertung alter Metadaten
gehört zum separaten Repository-Werkzeug und wird nicht als alter Core-Parser installiert.

## Vorschau und bewusste Übernahme

Voraussetzungen: Node.js 22 oder neuer, dieses Repository mit vorbereiteten kanonischen
Ressourcen. Während der Übernahme müssen AGDF-Schreibarbeiten im Zielprojekt beendet sein.
Es ist eine Offline-Wartung; das Skript benötigt keinen AGDF-Run oder Gate-Freigaben.

Bei einem frischen Checkout werden die Ressourcen über den vorhandenen Build-Owner vorbereitet;
das installiert kein Plugin in einen Host:

```sh
node packages/cli/scripts/prepare-local-plugin.js codex
```

Nur lesen, ohne Dateien im Zielprojekt anzulegen:

```sh
node scripts/import-cockpit-archive.mjs --dir /pfad/zum/projekt
```

Die JSON-Vorschau nennt Datei-/Bytezahlen, Archivgruppen, mögliche offene Sperren
und den `source_digest`. Artefaktordner ohne Run-Zustand werden ebenfalls erhalten;
gemeinsame Dateien wie der alte Masterbacklog stehen unter „Gemeinsamer Altbestand“.
Sperren in gespeicherten Artefaktmitschnitten sind historische Daten. Tatsächliche Sperren
oder offene Transaktionsdateien außerhalb dieser Mitschnitte blockieren die Übernahme.

Mit dem **exakten Digest aus der Vorschau**:

```sh
node scripts/import-cockpit-archive.mjs --dir /pfad/zum/projekt --apply --expect 'sha256:DIGEST_AUS_DER_VORSCHAU'
```

Veränderte Quellen werden abgewiesen. Das Werkzeug erstellt und prüft zuerst einen
vollständigen Stage. Danach wird das Originalverzeichnis als Sicherung umbenannt und die
vorbereitete neue Struktur veröffentlicht. Inhalte, ursprüngliche Pfadangaben und alte
Siegel werden nicht umgeschrieben oder neu bestätigt. Unbekannte Dateien, leere Ordner,
Binärdateien und alte RECORD-/REVIEW-Nachweise bleiben erhalten. Gültige getrennte Chat- und
Artefaktsprachen werden für die neue Konfiguration beibehalten; die vollständige alte
Konfiguration liegt zusätzlich unverändert im Archiv.

```text
.agdf/
  backups/control-<quelldigest>/    vollständiger Originalbestand
  control/
    config.json                   aktuelles Layout
    runs/                         keine übernommenen aktiven Runs
    planned/                      keine übernommenen aktuellen Planungen
    archive/
      INDEX.json                  versionierter Archivkatalog
      source/
        runs/<alte-id>/documents/ bisherige Run-Artefakte
        runs/<alte-id>/control/   bisheriger Run-Zustand und Historie
        shared/                   gemeinsame und nicht zuordenbare Dateien
```

Zusätzlicher Speicherbedarf: ungefähr die Größe des Altbestands plus Index und Vorlagen.
Das Offline-Werkzeug begrenzt die Quelle auf 20.000 Dateien, 4 GiB insgesamt und 256 MiB
je Datei. Das ändert keine bestehenden MCP-/Cockpit-Limits. Die Dokumentvorschau bleibt
auf 2 MiB begrenzt; größere und binäre Dateien bleiben erhalten und mit ihrer Inhaltskennung
aufgeführt. Problematische Dateinamen werden im Archiv kodiert; die Originalnamen stehen
weiter im Leseindex.

## Wiederanlauf

`.agdf/ARCHIVE_IMPORT_PENDING.json` bindet nach Beginn der Veröffentlichung den Stage,
die Sicherung, das konkrete Projekt und den ursprünglichen Digest. Nach einer Unterbrechung:

```sh
node scripts/import-cockpit-archive.mjs --dir /pfad/zum/projekt --apply --resume --expect 'sha256:DIGEST_AUS_DER_VORSCHAU'
```

Veränderte Sicherungen oder widersprüchliche Stages/Ziele werden abgewiesen. Journal und
Sicherung nicht löschen, um eine Fehlermeldung zu umgehen. Eine identische, bereits vollendete
Übernahme liefert nach Prüfung der Archivdateien `already_archived`, ohne zweite Wirkung.
Nicht veröffentlichte Stages können zur Untersuchung zurückbleiben; fremde Inhalte werden
nicht automatisch entfernt.

## Im Cockpit

Die aktualisierte Cockpit-Version bereitstellen, den Zielbestand neu laden, **Archiv** wählen
und einen Archiveintrag öffnen. Die eigene Leseansicht zeigt den damals gespeicherten Status,
das damalige Gate und „Aufgezeichnete Freigaben (ohne heutige Gültigkeit)“. Über „Archivdokument“ wird ein
Dokument ausgewählt. HTML/Skripte erscheinen als Text. Es gibt keine Freigabe- oder
Fortsetzungsaktion. Beim Schließen bleibt die Archivliste erhalten.

Zugriffe sind an Eintrag, registrierte Ressource und Cockpit-Snapshot gebunden. Die
Dokumentbytes müssen zum Importdigest passen. Historische Freigaben sind weder aktuelle
Freigaben noch ein Nachweis nachträglich geprüfter alter Siegel. Das Cockpit bleibt lesend.

## Tests

`scripts/import-cockpit-archive-test.mjs` prüft Byte-Erhalt, Vorschau, Sperren, Pfade,
unterbrochene Veröffentlichung, Wiederanlauf, manipulierte Sicherungen und MCP-/HTTP-Zugriff.
`packages/control-ui/test/archive.test.tsx` und `test/browser/archive.spec.mjs` prüfen die
lesende Archivansicht einschließlich echter Chromium-Darstellung. Die Original-Arbeitskopie
wird nur für die Vorschau gelesen; tatsächliche Übernahmen laufen in isolierten Testkopien.
