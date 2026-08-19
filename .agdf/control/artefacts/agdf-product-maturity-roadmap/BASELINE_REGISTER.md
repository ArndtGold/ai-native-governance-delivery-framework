# Baseline Register: AGDF Product Maturity Roadmap

Status: active
Date: 2026-08-19
Owner: Roadmap-Run; kanonische Zustände verbleiben bei den referenzierten Runs.

## Schema

`baseline_id | existing_run | covered_requirements | state | evidence_class | limitation | next_action`

Zulässige States: `accepted | ready_for_user_decision | evidence_limited | superseded | not_applicable`.

## Baseline

| baseline_id | existing_run | covered_requirements | state | evidence_class | limitation | next_action |
|---|---|---|---|---|---|---|
| BL-01 | [`task-target-resolution-boundary`](../../runs/task-target-resolution-boundary/RUN_STATE.md) | PMR-2, PMR-3, PMR-5, PMR-7 | `ready_for_user_decision` | `repository_tested` | QA pass und 47/47 Replays beweisen kein reales Attachment-/Mehrturn-Hostverhalten | separaten Run bei QA mit exakt `Approval: QA` entscheiden |
| BL-02 | [`agdf-interaction-ownership-quick-path-ux`](../../runs/agdf-interaction-ownership-quick-path-ux/RUN_STATE.md) | PMR-1, PMR-2, PMR-5, PMR-7 | `ready_for_user_decision` | `repository_tested` | direktes installiertes Codex-/Claude-/OpenCode-Verhalten bleibt teilweise unverified | vorhandene UAT-Evidenz prüfen und separat entscheiden |
| BL-03 | [`opencode-single-install-activation`](../../runs/opencode-single-install-activation/RUN_STATE.md) | PMR-2, PMR-3, PMR-5 | `ready_for_user_decision` | `repository_tested` | reale OpenCode-Aktivierung und Host-Konsum bleiben UAT-Grenze | vorhandene UAT-Evidenz separat bewerten |
| BL-04 | [`opencode-surface-hardening-parity`](../../runs/opencode-surface-hardening-parity/RUN_STATE.md) | PMR-2, PMR-3, PMR-7 | `evidence_limited` | `authenticated_host_observed` | Live Provider antwortete 401 vor contract-valider Evaluation; `tool_enforced` ist nicht belegt | authentifizierten Provider konfigurieren und QA erneut ausführen |
| BL-05 | [`opencode-plugin-honesty-hardening`](../../runs/opencode-plugin-honesty-hardening/RUN_STATE.md) | PMR-2, PMR-3, PMR-7 | `evidence_limited` | `repository_tested` | Subagent-Pfad bleibt audit-only; Run-Closeout ist offen | OR/Closeout separat abschließen; technische Garantie nicht ausweiten |
| BL-06 | [`agdf-scope-classification-card`](../../runs/agdf-scope-classification-card/RUN_STATE.md) | PMR-1, PMR-4, PMR-5 | `evidence_limited` | `repository_tested` | kanonischer Run meldet OR als nächsten Schritt, auch wenn Backlog bereits Completed sagt | Run-Zustand vor Roadmap-Promotion schließen oder Abweichung sichtbar lassen |
| BL-07 | [`deterministic-agent-ux`](../deterministic-agent-ux/OR.md) | PMR-1, PMR-5, PMR-7 | `accepted` | `user_accepted` | authentifizierte Claude-/OpenCode-/Copilot-Beobachtung blieb als Grenze dokumentiert | als bestehende Interaction-Baseline wiederverwenden |
| BL-08 | [`quality-readiness-surface`](../quality-readiness-surface/OR.md) | PMR-1, PMR-5, PMR-7 | `accepted` | `user_accepted` | keine Host-Conformance-Aussage über die Roadmap-Fälle | als bestehende Quality-Projektion wiederverwenden |
| BL-09 | [`agdf-delivery-path-search`](../agdf-delivery-path-search/OR.md) | PMR-2, PMR-4, PMR-7 | `accepted` | `user_accepted` | instruction-only Surfaces beweisen keinen Schreibschutz | Capability-/Enforcement-Grenze übernehmen |
| BL-10 | [`agdf-micro-tier-below-quick-task`](../agdf-micro-tier-below-quick-task/OR.md) | PMR-1, PMR-4, PMR-7 | `accepted` | `user_accepted` | pathbasierte Grenze allein misst noch keine reale Über-Governance | Ceremony-Benchmark darauf kalibrieren |
| BL-11 | [`agdf-live-host-conformance-matrix`](../agdf-live-host-conformance-matrix/OR.md) | PMR-2, PMR-3, PMR-6, PMR-7 | `accepted` | `user_accepted` | 8 Modus-Limitierungen und 12 Claude-`host_unavailable`; keine native UI-, Mehrturn-, Restart- oder Subagent-Garantie | als versionsgebundene Conformance-Baseline für RMP-07 bis RMP-10 verwenden |
| BL-12 | [`agdf-qa-block-transition-integrity`](../agdf-qa-block-transition-integrity/OR.md) | PMR-2, PMR-7 | `accepted` | `repository_tested` | no direct installed-host execution; repository evidence proves the QA-`block` projection and fail-closed guard | reuse the completed child OR as the WS-03 enforcement result |
| BL-13 | [`agdf-structured-delivery-depth-boundary`](../agdf-structured-delivery-depth-boundary/OR.md) | PMR-1, PMR-4, PMR-7 | `accepted` | `user_accepted` | deterministic replay is not direct live-host semantic-following proof | use the accepted Modes-owned boundary as the prerequisite for a separately gated Benchmark v3 |
| BL-14 | [`agdf-staged-proportionality-baseline-v3`](../agdf-staged-proportionality-baseline-v3/OR.md) | PMR-1, PMR-4, PMR-7 | `accepted` | `user_accepted` | 40-case/72-scenario corpus and 216-observation deterministic replay do not prove authenticated live-agent behavior | reuse the accepted v3 protocol and protected 225-file history boundary in RMP-10 without regrading v2/r3 |

## Autoritätsregel

Bei jeder Abweichung zwischen dieser Tabelle und dem verlinkten Run beziehungsweise OR gewinnt die
verlinkte kanonische Quelle. Dieses Register darf keine Freigabe, Evidenzklasse oder Lifecycle-Stufe
hochsetzen.
