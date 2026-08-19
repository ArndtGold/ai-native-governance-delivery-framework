# Workstream Register: AGDF Product Maturity Roadmap

Status: active
Date: 2026-08-19

| workstream_id | Arbeitslinie | Scope | Eintrittsbedingung | Owner-Kandidaten | Child-Run | Status | Exit-Evidenz |
|---|---|---|---|---|---|---|---|
| WS-00 | Baseline Closeout | vorhandene QA-/UAT-/OR-Zustände korrekt verlinken | Roadmap TP und Brownfield Analysis pass | kanonische Bestands-Runs | keiner | `in_progress` | BL-01 bis BL-10 ohne hochgestufte Zustände |
| WS-01 | Live Host Conformance | zwölf PMR-3-Fälle auf Codex, Claude Code und OpenCode beobachten | `CONFORMANCE_SCOPE.md` fertig; separate Child-UR | bestehende Host-Adapter, Target-/Interaction-/Gate-Contracts | [`agdf-live-host-conformance-matrix`](../../runs/agdf-live-host-conformance-matrix/RUN_STATE.md) | `completed` | [Child-OR](../agdf-live-host-conformance-matrix/OR.md): 16 Passes, 8 Limitierungen, 12 `host_unavailable`, QA/UAT akzeptiert |
| WS-02 | Proportionalität und Zeremonie | 40-Fall-Benchmark und konkrete Reibungs-Gaps | WS-01 liefert klassifizierte Gaps | Modes, Gate Transition, Scope Classification, Gate Rationale, `evals/` | [`agdf-proportionality-benchmark`](../../runs/agdf-proportionality-benchmark/RUN_STATE.md) · [`agdf-staged-proportionality-observation`](../../runs/agdf-staged-proportionality-observation/RUN_STATE.md) · [`agdf-structured-delivery-depth-boundary`](../../runs/agdf-structured-delivery-depth-boundary/RUN_STATE.md) · [`agdf-staged-proportionality-baseline-v3`](../../runs/agdf-staged-proportionality-baseline-v3/RUN_STATE.md) | `completed` | [Benchmark v3 OR](../agdf-staged-proportionality-baseline-v3/OR.md): QA/UAT accepted, 40-case/72-scenario corpus, six semantic Full-Depth cases, deterministic 216-observation replay and protected 225-file history; authenticated live series remains unclaimed |
| WS-03 | Enforcement Closure | nur technisch schließbare Garantie-/Host-Gaps | WS-01-Matrix benennt Owner und negativen Test | Quality Contract, Surface Capabilities, Host-Adapter | [`agdf-qa-block-transition-integrity`](../../runs/agdf-qa-block-transition-integrity/RUN_STATE.md) | `completed` | [Enforcement Scope](ENFORCEMENT_CLOSURE_SCOPE.md) · [Child OR](../agdf-qa-block-transition-integrity/OR.md): QA-`block` ohne Approval-Aufforderung, widersprüchliches Approval fail-closed, volle Package-Suite und Code Review pass |
| WS-04 | Unified Journey | Progressive Disclosure über stabile Target-/Routing-/Enforcement-Zustände | WS-01 bis WS-03 liefern stabile Semantik | Interaction Contract und `interaction-presentation.js` | none | `no_safe_child_scope_yet` | no separate Journey gap is evidenced while Task Target is at QA, Interaction Ownership and Single Install are at UAT, and OpenCode parity remains evidence-limited; reassess after those owners settle |
| WS-05 | Roadmap Aggregation | PMR-1 bis PMR-7 aus Child-Evidenz bewerten | erforderliche Child-Runs QA/UAT/OR-reif | Roadmap-Run | `agdf-product-maturity-roadmap` | `in_progress` | [Aggregate Acceptance](AGGREGATE_ACCEPTANCE.md): RMP-10 is startable but not final; PMR-5 owner decisions and PMR-6 direct understandability UAT remain open |

## Regeln

- `ready_for_ur` autorisiert weder Run-Erstellung noch Produktänderung.
- Jeder Child-Run beginnt mit `gate-check` und einer eigenen dauerhaften UR.
- Parent-Approvals werden nie in diese Tabelle als Child-Approval eingetragen.
- Ein Workstream ohne konkreten Gap bleibt blockiert oder entfällt; die Roadmap erzeugt keinen
  vorsorglichen Implementierungs-Scope.
