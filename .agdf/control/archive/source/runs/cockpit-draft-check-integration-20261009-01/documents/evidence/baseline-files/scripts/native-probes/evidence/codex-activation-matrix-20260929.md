# Codex CLI activation matrix · adaptive Erstprüfung · 2026-09-29

AGDF-Run: `codex-activation-matrix-adaptive-runs` · Codex CLI `0.157.1` · isolierte installierte AGDF-Kopie `0.14.5+codex.local-18841fddd654`

## Live-Ergebnis

Die zehn bestehenden Fälle liefen je einmal in einer frischen Codex-CLI-Sitzung mit eigenem Wegwerf-Git-Repository. Alle zehn Sitzungen wurden vollständig beendet und erfüllten ihre Aktivierungserwartung (`10/10`). Es wurde kein Fall automatisch wiederholt. Die fünf Lese-/Beratungsfälle blieben ohne AGDF-Aufruf (`5/5`), die fünf Änderungs- oder expliziten AGDF-Fälle riefen den Dispatcher auf (`5/5`). Keines der Fixture-Repositories wurde verändert (`0/10`).

Bei Q1 endete die Zielbindung erwartbar mit `target_unresolved`, obwohl die Aktivierung korrekt erfolgte. Die übrigen vier positiven Fälle banden ein Ziel. Diese Zielbindungsbefunde sind von der Aktivierungsbewertung getrennt.

A4 bekam `meta/contracts/modes.md` aus der isolierten Plugin-Kopie als konkrete Quelle und las sie in einem abgeschlossenen Shell-Dateiaufruf. Es gab in A4 keinen beobachteten Shell-Suchaufruf. Ein gesonderter `file_search`-Ereignistyp wurde in dieser CLI-Sitzung nicht beobachtet; dessen Zähler ist `null`.

## Verbrauch und Messgrenze

- 624.034 Input-Tokens, davon 510.592 gecacht und 113.442 nicht gecacht; 7.632 Output-Tokens.
- Summe der zehn Sitzungsdauern: 317.057 ms. Die gleichzeitig gestarteten Sitzungen machen dies nicht zur Wall-Clock-Laufzeit der Matrix.
- Beobachtete abgeschlossene Aufrufe: 13 Shell-Suchen und 18 Dateileseaufrufe. Dateisuch-Toolaufrufe: unbekannt (`null`), weil kein entsprechender strukturierter Ereignistyp vorlag.
- `observation.json` sichert für jede Sitzung Token-Aufschlüsselung, Laufzeit, Such-/Lesezählung, Aktivierungsbefund, Zielbindung und tatsächliche Laufzahl: [strukturierte Evidenz](codex-activation-matrix-20260929.json).

Diese adaptive Stichprobe belegt die Aktivierungsgrenze für genau diese zehn Sitzungen, nicht die Wiederholbarkeit unauffälliger Fälle. Die geringere Sitzungszahl ist beobachtet; eine exakte Abrechnungskosten-Ersparnis ist aus Brutto- und Cache-Tokens allein nicht ableitbar. Die frühere [vollständige Dreifachmatrix](codex-activation-matrix-20260928.md) bleibt historisch unverändert.

Ein erster Versuch unter der eingeschränkten lokalen Ausführung scheiterte für alle Erstläufe an `workspace routing discovery failed` und wurde vor Abschluss der geplanten Wiederholungen abgebrochen. Er ist keine Aktivierungsevidenz. Der hier ausgewertete Lauf erfolgte nach erfolgreichem Codex-Verbindungstest mit nutzbarer Workspace-Routing-Verbindung. Rohprotokolle liegen lokal im git-ignorierten `probe-results/codex-activation-matrix-20260929-063253Z/`.
