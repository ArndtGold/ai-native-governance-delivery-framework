# Host Conformance Report: AGDF Live Host Conformance Matrix

Status: evidence_complete_with_limits
Date: 2026-07-28
AGDF: `0.11.4`

## Ergebnis

Dieser Lauf verbessert die Beweislage, nicht das Produktverhalten. Von 36 versionsgebundenen
Host-/Fall-Zeilen sind 16 direkte Headless-Passes. Acht Codex-/OpenCode-Fälle bleiben begrenzte
native-UI-, echte-Mehrturn- oder Restart-Beobachtungen; Claude Code war nicht authentifiziert.

| Ergebnis | Anzahl | Bedeutung |
|---|---:|---|
| `pass` | 16 | direkt auf genanntem Host und Version beobachtet |
| `limitation` | 8 | ehrliche Grenze; kein Pass |
| `host_unavailable` | 12 | notwendiger authentifizierter Hostpfad fehlte |
| `invalid_evidence` | 0 | keine ungültige Fallbeobachtung in der aktuellen Matrix |

## Host-Preflights

| Host | Version | Auth | Headless | Interaktiv |
|---|---|---|---|---|
| Codex | `0.145.0` | `authenticated` | `available` | `available` |
| Claude Code | `2.1.193` | `unauthenticated` | `unavailable` | `unverified` |
| OpenCode | `1.18.3` | `authenticated` | `available` | `unverified` |

## Fallmatrix

| Fall | Codex | Claude Code | OpenCode |
|---|---|---|---|
| HC-01 | `pass` | `host_unavailable` | `pass` |
| HC-02 | `pass` | `host_unavailable` | `pass` |
| HC-03 | `pass` | `host_unavailable` | `pass` |
| HC-04 | `pass` | `host_unavailable` | `pass` |
| HC-05 | `limitation` | `host_unavailable` | `limitation` |
| HC-06 | `limitation` | `host_unavailable` | `limitation` |
| HC-07 | `limitation` | `host_unavailable` | `limitation` |
| HC-08 | `limitation` | `host_unavailable` | `limitation` |
| HC-09 | `pass` | `host_unavailable` | `pass` |
| HC-10 | `pass` | `host_unavailable` | `pass` |
| HC-11 | `pass` | `host_unavailable` | `pass` |
| HC-12 | `pass` | `host_unavailable` | `pass` |

## Evidenzgrenzen

- Codex-Passes gelten nur für den authentifizierten Headless-Aufruf auf CLI `0.145.0` und AGDF `0.11.4`.
- Kein Codex-Pass wird als native UI-, Attachment-, Restart-, echte Mehrturn- oder Subagent-Garantie dargestellt.
- Claude-Code-CLI-Präsenz ist kein Authentifizierungsnachweis; ohne Login wurde kein Fall ausgeführt.
- OpenCode-Passes gelten nur für die authentifizierte serielle Headless-Beobachtung auf CLI
  `1.18.3`, explizitem Modell `opencode/glm-5.2` und AGDF `0.11.4`.
- Die OpenCode-Herstellerdokumentation begründet den Ausführungspfad, ersetzt aber keine
  Live-Evidenz; die Klassifikation stammt aus den zwölf seriellen Fallbeobachtungen.
- Alle ausgeführten Wegwerf-Workspaces blieben laut Vorher-/Nachher-Git-Status unverändert.
- Es wurde kein `product_gap` behauptet, weil die offenen Befunde derzeit Evidenz- oder Verfügbarkeitsgrenzen sind.

## Redigierte Evidenz

- [Codex Headless Bundle](evidence/CODEX_HEADLESS_BUNDLE.md)
- [Claude-Code-Preflight](evidence/CLAUDE_PREFLIGHT.md)
- [OpenCode Headless Bundle](evidence/OPENCODE_HEADLESS_BUNDLE.md)
- [OpenCode Herstellerdokumentation](evidence/OPENCODE_VENDOR_DOCUMENTATION.md)

## UAT-Grenze

QA bewertet Schema, Coverage, Redaction, Mutation Guard, Klassifikation und
Berichtsmatrix-Parität als belastbar und entscheidet `pass`. Die acht Limitierungen und zwölf
Claude-`host_unavailable`-Zeilen bleiben eine ausdrücklich sichtbare UAT-Entscheidungsgrenze.
UAT ist erst nach der separaten exakten QA-Freigabe zulässig.
