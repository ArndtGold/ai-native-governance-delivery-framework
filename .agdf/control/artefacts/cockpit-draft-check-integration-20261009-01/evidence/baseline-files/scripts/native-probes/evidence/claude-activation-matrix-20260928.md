# Live-Evaluierung Request Activation unter Claude Code (2026-09-28)

Strukturierte Daten: [claude-activation-matrix-20260928.json](claude-activation-matrix-20260928.json) ·
Werkzeug: [`claude-activation-matrix.mjs`](../claude-activation-matrix.mjs)

## Anlass und Ergebnis

Ein Live-Test des installierten Plug-ins zeigte, dass die Request Activation von der gefühlten
Größe einer Änderung abhing. Laut [Request-Activation-Vertrag](../../../plugin/meta/contracts/request-activation.md)
entscheidet aber allein, ob eine echte Änderung verlangt wird. Die Größe wählt nur den nachgelagerten
Modus ([Modes](../../../plugin/meta/contracts/modes.md)). Commit `3ad9a0d` hat die für das Modell
sichtbaren Texte geschärft. Die Abstain-Semantik blieb unverändert.

| Fall | Stufe | Soll | Vorher (70dd195) | Nachher (3ad9a0d) |
|---|---|---|---|---|
| A1 Erklären · A2 Bewerten, nichts ändern · A3 nur beschreiben · A4 AGDF als Thema · N1 „Implementiere nichts …“ | 0 | still bleiben | 15/15 | **15/15** |
| Q1 Bugfix `multiply` + Regressionstest | 1 Quick Task | aktivieren | **0/3** (3× direkt gefixt) | **3/3** |
| D1 neue Funktion `divide` + Tests | 2 UR | aktivieren, keine Änderung vor UR | **1/3** (2× direkt implementiert) | **3/3** |
| D2 REST-API mit SQLite | 2 strukturiert | aktivieren, keine Änderung | 3/3 | 3/3 |
| E1 `/agdf:gate-check …` | 3 explizit | aktivieren | 3/3 | 3/3 |
| E2 „Führe den AGDF doctor … aus“ | 3 explizit | Doctor ausführen | 2/3 bewertet, Doctor lief 0/3 | 2/3 bewertet, Doctor lief 1/3 |

Nachher wurde in keinem Lauf Code am Gate vorbei geschrieben. Kosten: 8,88 USD vorher, 8,37 USD nachher.

## Methode

- Host: Claude Code 2.1.268 headless (`claude -p --output-format stream-json`), Standardmodell,
  Windows 11, AGDF 0.14.5 aus dem lokalen Marketplace (`npm run install:claude`).
- Fixture: Wegwerf-Git-Repo mit `src/calc.js` (`add`, fehlerhaftes `multiply`), einem Test und
  `package.json`, pro Lauf neu. 10 Fälle × 3 Läufe, 8 parallel.
- Werkzeuge: `acceptEdits`, erlaubt sind nur AGDF-Dispatch, Skills, Lesewerkzeuge und `node`.
  Ein umgangenes Gate zeigt sich so als echte Dateiänderung.
- Bewertung nur aus strukturierten Belegen: AGDF-Toolaufrufe (`agdf_dispatch`, `agdf:*`-Skills,
  AGDF-CLI) im Stream sowie `git status` der Sandbox. Modelltext wird nicht bewertet.
- Grenzen: 3 Läufe pro Fall sind ein Signal, kein Beweis. E2 zählt jeden AGDF-Aufruf als
  Aktivierung, auch einen, den die Host-Berechtigung abgelehnt hat.

## Vorangegangene Befunde (gleicher Tag)

1. **Veraltete Marketplace-Kopie:** Headless lädt Claude Code das Plug-in aus
   `%LOCALAPPDATA%\agdf\marketplaces\agdf\plugins\agdf`, nicht aus dem Plug-in-Cache. Diese Kopie
   war ein anderer Build mit derselben Version 0.14.5 und nur teilweise aktualisiert (50
   abweichende Dateien). Der MCP-Server brach beim Import ab (`digestPluginMcpDispatcherSource`
   fehlte). `status --surface claude` meldete trotzdem `healthy`. Behoben durch
   `npm run install:claude`.
2. **Erste Serie (implizite Anfrage „src/add.js + Test“):** Aktivierung in 4 von 9 Läufen, direkte
   Implementierung in den übrigen.

## Geänderte Texte (Commit 3ad9a0d)

- Guard: „Activate only for actual delivery/mutation …“ wurde zu „Activate for any requested
  file/code change however small, a binding gate artefact, …“. Die Abstain-Zeile ist inhaltlich
  gleich und nur kürzer. Kernel: 1094 von 1100 Bytes (freigegebenes Budget unverändert).
- Discovery-Suffix aller Skills: „The requested effect, not discovery, decides AGDF activation.“
  ersetzt „Automatic discovery alone does not activate AGDF.“
- `gate-check`-Beschreibung: „any requested build or code/file change, even a small fix or function, …“
- `modes.md` und Router: Quick Task spart Artefakttiefe, nie die Aktivierung. „small question,
  review“ gilt im Router nicht mehr als Quick Task.
- Deterministischer Korpus: Paare `small-change-de` und `small-change-en`.

## Offene Punkte

- **Doctor nicht erreichbar:** `control.doctor` und `control.delivery_map` stehen im Katalog, sind
  über die Plug-in-Oberfläche aber nicht aufrufbar. Das Binding bietet nur `skill-dispatch` an.
- **Zielauflösung:** Ohne ausdrückliches „dieses Repository“ endet eine Anfrage in „Klärung
  erforderlich – kein belastbares Arbeitsziel“. Das betraf nachher 4 der 6 Q1/D1-Läufe.
- **Status-Prüfung:** `status` sollte die Marketplace-Kopie gegen den installierten Build prüfen
  (`source_digest`).
- **Skill-Evals:** Die Beobachtungen waren schon vor 3ad9a0d veraltet (50). Nach der Textänderung
  sind es 90. Neu aufnehmen mit `npm --prefix create-agdf run eval:skills:record`.

## Wiederholen

```bash
npm run install:claude
npm run native:claude-activation-matrix
```
