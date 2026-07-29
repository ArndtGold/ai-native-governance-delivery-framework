# UAT Evidence: AGDF Live Host Conformance Matrix

Status: accepted
Run: `agdf-live-host-conformance-matrix`
Based on: QA `pass` und exaktes `Approval: QA` nach Revalidierung von Revision 9
Gate approval: exaktes `Approval: UAT` am 2026-07-28 nach Revalidierung von Child-Run, Gate UAT,
Revision 10 und dauerhaftem UAT-Artefakt akzeptiert
Date: 2026-07-28

## Abzunehmendes Ergebnis

Die Host-Conformance-Matrix enthält exakt 36 versionsgebundene Host-/Fall-Zeilen:

| Host | Pass | Limitation | Host unavailable |
|---|---:|---:|---:|
| Codex `0.145.0` | 8 | 4 | 0 |
| OpenCode `1.18.3` | 8 | 4 | 0 |
| Claude Code `2.1.193` | 0 | 0 | 12 |
| Gesamt | 16 | 8 | 12 |

Es verbleiben 0 `invalid_evidence` und 0 `product_gap`. Alle ausgeführten synthetischen
Wegwerf-Git-Workspaces blieben unverändert.

## Bewusste Akzeptanzgrenze

UAT akzeptiert bei Freigabe ausdrücklich:

- die acht direkten Codex-/OpenCode-Passes als versionsgebundene Headless-Beobachtungen;
- je vier Codex-/OpenCode-Limitierungen für native UI, echte Mehrturn-Fortsetzung oder Restart;
- zwölf Claude-Code-Zeilen als `host_unavailable`, weil der Host nicht authentifiziert war;
- `instruction_only` als Enforcement-Grenze, nicht als Runtime- oder Subagent-Garantie;
- die Herstellerdokumentation nur als Methodenreferenz, nicht als Ersatz für Live-Evidenz;
- keine Produktreparatur und keinen erfundenen Produkt-Gap in diesem diagnostischen Run.

## Nicht durch UAT freigegeben

- keine Universalgarantie über andere Host-, Modell- oder AGDF-Versionen;
- keine native UI-, Attachment-, Restart-, echte Mehrturn- oder Subagent-Enforcement-Garantie;
- kein Commit, Push, PR, Release oder Veröffentlichung.

## UAT-Entscheidung

Freigabe nur, wenn die Matrix samt sichtbarer Grenzen als belastbare Roadmap-Baseline akzeptiert
wird.

Exakter Freigabewert: `Approval: UAT`

Entscheidung: accepted
