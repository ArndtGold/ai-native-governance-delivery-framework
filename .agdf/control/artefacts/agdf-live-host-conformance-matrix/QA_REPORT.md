# QA Report: AGDF Live Host Conformance Matrix

Status: pass
Gate approval: exaktes `Approval: QA` am 2026-07-28 nach Revalidierung von Child-Run, Gate QA,
Revision 9, dauerhaftem QA-Bericht und 0 Doctor-Findings akzeptiert
Gate: QA
Decision: `pass`
Date: 2026-07-28
Owner: qa-gate

## Quality Readiness

| Dimension | Ergebnis | Entscheidender Nachweis |
|---|---|---|
| Plan coverage | `pass` | TP Review 11/12 fully done; LHT-12 nur bis zur separaten QA-Freigabe/UAT teilweise |
| Solution integrity | `pass` | Clean Review: run-eigene Evidenz ohne Parallel-Owner oder Produktänderung |
| Code quality | `not_applicable` | kein Code geändert |
| QA decision | `pass` | `qa-gate` ist alleiniger Owner; TPR-LHC-001 ist durch zwölf direkte OpenCode-Beobachtungen aufgelöst |

## QA Gate

- decision: `pass`
- evidence:
  - genehmigte UR, PRD, SD und TP;
  - Pre-Implementation Brownfield Analysis `pass`;
  - 36/36 eindeutige und versionsgebundene Matrixzeilen;
  - Codex 8 direkte Headless-Passes und 4 ehrliche Limitierungen;
  - Claude Code 12 präzise `host_unavailable` nach direktem Auth-Preflight;
  - OpenCode 8 direkte serielle Headless-Passes und 4 ehrliche Limitierungen;
  - Herstellerdokumentation als methodische Referenz, ohne Hochstufung zur Live-Evidenz;
  - Schema-, Coverage-, Redaction-, Mutation-, Modus-, Paritäts-, Scope- und
    Control-Integrity-Prüfungen bestanden;
  - Clean Review `pass`, Code Review `not_applicable`.
- missing_evidence:
  - Claude Code bleibt mangels Authentifizierung für zwölf Fälle `host_unavailable`;
  - native UI-, echte Mehrturn- und echte Restart-Beobachtungen fehlen für je vier Codex- und
    OpenCode-Fälle und bleiben korrekt `limitation`.
- risks:
  - UAT muss acht sichtbare Limitierungen und zwölf Claude-`host_unavailable`-Zeilen bewusst als
    Roadmap-Baseline akzeptieren oder zurückweisen;
  - Headless-Passes dürfen nicht als native UI-, Mehrturn-, Restart- oder Runtime-Enforcement-
    Garantie verwendet werden.
- required_next_step: Nutzer-UAT anhand von `UAT_EVIDENCE.md` durchführen und exakt
  `Approval: UAT` einholen, Überarbeitung anfordern oder ablehnen.
- impact_codes: evidence quality, host conformance, mutation safety

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| TPR-LHC-001 | `evidence_gap` | `evidence_obligation` | `resolved` | zwölf gültige serielle OpenCode-Einzelbeobachtungen; 8 `pass`, 4 `limitation`, unveränderte Wegwerf-Workspaces | Grenzen in QA und UAT sichtbar halten |

## Acceptance Assessment

| Kriterium | Ergebnis | Begründung |
|---|---|---|
| LHC-1 | `pass` | 36/36 Zeilen vorhanden |
| LHC-2 | `pass` | nur direkte Codex-/OpenCode-Beobachtungen sind Pass; Herstellerdokumentation bleibt Methodenreferenz |
| LHC-3 | `pass` | Enforcement-Grenzen je Zeile sichtbar |
| LHC-4 | `pass` | gültige Ausführungen mutationsfrei; Fehlerpfade nicht als Beleg verwendet |
| LHC-5 | `pass` | Redaction-Scan grün |
| LHC-6 | `pass` | kein unbelegter Produkt-Gap und keine Reparatur |
| LHC-7 | `pass` | Version und Zeitpunkt vollständig |
| LHC-8 | `pass` | Bericht und QA trennen die acht Limitierungen sowie zwölf Host-Unavailable-Zeilen klar von Nutzer-UAT |

## Context Graph

- context_graph_impact: `link_only`
- context_graph_refs: `CG-TASK-TARGET-AUTHORITY`; `CG-NATIVE-INTERACTION-AUTHORITY`;
  `CG-DELIVERY-PATH-SEARCH`; `CG-RUN-SCOPED-CONTROL-STATE`
- context_graph_required_action: link
- context_graph_gate_effect: none
- keine neue Architekturautorität.

## Verbotener nächster Schritt

- kein OR, Commit, Push, PR oder Release vor dem späteren UAT-/Closeout-Pfad;
- keine Hochstufung der sichtbaren Limitierungen oder `host_unavailable`-Zeilen.
