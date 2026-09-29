# Codex CLI activation matrix · 2026-09-28

AGDF run: `agdf-request-activation-boundary` · Codex CLI codex-cli 0.157.1 · AGDF 0.14.5+codex.local-fcac2d4ed5e9

## Ergebnis

30 frische Codex-CLI-Sitzungen liefen über die installierte AGDF-Plugin-Kopie in temporären, getrennten Test-Repositories. Die erwartete Aktivierungsgrenze stimmte in **30/30** Sitzungen:

- 15 Lese-/Beratungsfälle blieben ohne Dispatcher-Aufruf und ohne Dateiveränderung (**15/15**).
- 15 Änderungs- oder explizite AGDF-Fälle riefen `agdf_dispatch` auf (**15/15**).
- Kein Test-Repository wurde verändert (**0/30**).

| Fälle | Klasse | Erwartung | Läufe | Aktivierung passend | AGDF-Ziel gebunden | Ziel ungeklärt |
|---|---|---:|---:|---:|---:|---:|
| A1 | 0-abstain | abstain | 3 | 3/3 | 0 | 0 |
| A2 | 0-abstain | abstain | 3 | 3/3 | 0 | 0 |
| A3 | 0-abstain | abstain | 3 | 3/3 | 0 | 0 |
| A4 | 0-abstain | abstain | 3 | 3/3 | 0 | 0 |
| N1 | 0-abstain | abstain | 3 | 3/3 | 0 | 0 |
| Q1 | 1-quick-task | activate | 3 | 3/3 | 1 | 2 |
| D1 | 2-ur | activate_no_impl | 3 | 3/3 | 1 | 2 |
| D2 | 2-ur-structured | activate_no_impl | 3 | 3/3 | 3 | 0 |
| E1 | 3-explicit | activate | 3 | 3/3 | 1 | 2 |
| E2 | 3-explicit | activate | 3 | 3/3 | 3 | 0 |

## Was die AGDF-Karten sagen

Alle 15 Dispatcher-Antworten waren terminal und `authorizes: false`:

- **9/15** positive Anfragen banden ein Ziel. AGDF stoppte vor der UR-Einrichtung und forderte die Autorisierung der Einrichtung oder den Abbruch. Es wurde kein Run genehmigt und nichts implementiert.
- **6/15** positive Anfragen endeten mit `target_unresolved` (`no_reliable_target`). Die Karte fordert, ein einziges Arbeitsziel explizit zu benennen. Das ist ein Zielbindungsproblem nach erfolgreicher Aktivierung, kein fehlender AGDF-Aufruf.

## Laufbedingungen und Grenzen

- Konfiguriertes Modell: `gpt-6-sol`, Reasoning `high`; JSONL enthielt kein unabhängig auslesbares Modellfeld.
- Temporäres `CODEX_HOME`, temporärer AGDF-Datenpfad und frisches Git-Fixture je Sitzung; Authentifizierung wurde nur temporär kopiert und am Ende entfernt.
- Verbrauch laut Codex-JSONL: 2.095.847 Input- und 24.021 Output-Tokens.
- Das ist probabilistische Codex-Aktivierungsevidenz. Sie ersetzt weder die vier geforderten composed-profile Läufe noch Installations-/Restart-/Fresh-Session-Evidenz und schließt QA-Befunde `RAB-TPR-01` oder `RAB-TPR-02` nicht.

Strukturierte Evidenz: [codex-activation-matrix-20260928.json](codex-activation-matrix-20260928.json) · Harness: [codex-activation-matrix.mjs](../codex-activation-matrix.mjs) · Rohprotokolle liegen im lokalen, git-ignorierten `probe-results/codex-activation-matrix-20260928-143639Z/`-Ordner.
