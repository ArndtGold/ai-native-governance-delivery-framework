# Brownfield Analysis: Adaptive Codex-CLI-Aktivierungsmatrix

- mode: `pre_implementation_analysis`
- decision: `pass`
- run_id: `codex-activation-matrix-adaptive-runs`
- approved_tp: `TP.md`, Freigabe `Approval: TP` zu Revision `a0d99fb8-ab40-4166-8a6f-bd02614a0534`
- reviewed_at: 2026-09-29

## Scope And Existing Owners

| Concern | Existing owner | Current evidence | Implementation fit |
|---|---|---|---|
| Fallliste und Aktivierungsbewertung | `scripts/native-probes/codex-activation-matrix.mjs` `CASES` und `grade` | zehn IDs; `grade` nutzt strukturierte AGDF-Aufrufe und geänderte Pfade | unverändert verwenden; `ok` des Erstlaufs entscheidet adaptive Wiederholung |
| Frische Sitzungen und Isolierung | derselbe Harness `runOne`, `runCodex`, `setupIsolatedCodexHome` | neues Fixture pro `runOne`, `codex exec --json --ephemeral`, temporäres `CODEX_HOME` und AGDF-Datenverzeichnis | Queue-Logik um vorhandenes `runOne`; Authentifizierung und Cleanup unverändert erhalten |
| Rohereignisse und Messwerte | derselbe Harness `parseTranscript` | `turn.completed.usage` mit `cached_input_tokens` und `item.completed.command_execution` im lokalen Rohprotokoll vom 2026-09-28 | parsernah ergänzen; fehlende Werte als `null`; Startereignisse nicht als fertige Suche zählen |
| Bericht und Betreiberanleitung | `main` sowie `scripts/native-probes/README.md` | `summary.txt`, `observation.json`, dokumentiertes `--runs 3` | additive Felder und adaptive Standardbeschreibung; historischer Nachweis bleibt unverändert |
| Testintegration | Node-Tests unter `scripts/native-probes`; `package.json` Maintenance-Scripts | bestehender Harness hat Top-Level-Profil-Setup und ist nicht rein importierbar | kleine Entry-Guard/Test-Seam im selben Modul; keine zweite Fallliste oder Bewertungslogik |

## Reuse And Minimal Implementation

1. Options-Parsing zentral im bestehenden Modul halten. `--runs` nur bei expliziter Angabe als fester Modus; `--repeat-case` vor Profil-Setup validieren. Eine reine Auswahlfunktion bestimmt nach allen Erstläufen die Repeat-Jobs und ihre Gründe.
2. Das bestehende Worker-Muster zweimal verwenden: zuerst zehn Erstläufe, dann nur die geplanten Wiederholungen. `runOne` bleibt der einzige Erzeuger eines frischen CLI-Prozesses und Fixtures. Fehlresultate werden als Beobachtung erhalten.
3. A4 erhält den bestehenden temporären Paketpfad als konkrete Quelle, bevor sein `runOne` startet. Existenzprüfung verhindert stillen Rückfall auf breite Suche.
4. `parseTranscript` erhält Cache- und Suchmetriken aus strukturierten abgeschlossenen Ereignissen. Die bereits vorhandene `duration_ms` wird weiterverwendet. Messwerte bleiben unbekannt, wenn kein entsprechendes Feld oder kein belegbarer Ereignisstream vorliegt.
5. Zusammenfassung und README erläutern Auslöser, tatsächliche Sitzungen, A4 und die Grenzen der Aufrufzählung. Bestehende Rohprotokolle werden nicht geändert.
6. Gezielte Node-Tests prüfen Auswahl und Parser ohne echten Codex-Start; ein begrenzter Live-Lauf prüft die aktuelle CLI-/Plugin-Ereignisform.

## Boundaries And Risks

- Schnittstellen: Nur das lokale Maintenance-Probe und sein Ergebnisformat ändern sich. AGDF-Dispatcher, normative Request-Activation-Regel und installierter Plugin-Inhalt bleiben unberührt.
- Daten: Neue Ergebnisfelder sind additiv. Historische `evidence/codex-activation-matrix-20260928.*` und Rohprotokolle sind Vergleichsevidenz und bleiben unverändert.
- Sicherheit: Temporäre Authentifizierungskopie und `redact` bleiben im vorhandenen Setup/Cleanup. Der A4-Pfad stammt aus der eigenen isolierten Kopie; keine vom Testprompt frei gewählte Datei.
- Regression: Default-Wechsel von fest drei zu adaptiv muss im README und Ergebnis explizit erscheinen. Explizites `--runs` bleibt fest. Eine `target_unresolved`-Karte darf nicht allein als Aktivierungsabweichung gelten.
- Nachweisgrenze: Ein Shell-Toolaufruf mit mehreren Suchkommandos zählt als ein beobachteter Aufruf. Fehlende CLI-Telemetrie wird nicht als Nullkosten interpretiert.

## Context Graph Impact

- context_graph_impact: `none`
- context_graph_reconciliation: `not_applicable`
- reason: Die Änderung bleibt beim lokalen Test-Harness und seinem Protokoll; keine neue Architektur- oder SoT-Entscheidung entsteht.

## Next Permissible Step

Nach Verknüpfung dieses bestandenen internen Schritts mit dem ausgewählten Run: `CD+Tests` für T-001 bis T-005 ausführen. Codearbeit ist vor dieser Verknüpfung weiterhin gesperrt.
