# Next-Action Comparison (T-009, SCN-008, SCN-010, SCN-018)

- run_id: status-card-stale-next-action-20261008-01
- date: 2026-10-08
- baseline: `BASELINE_NEXT_ACTION.json`, captured before any code change with the repository CLI
- after: `AFTER_NEXT_ACTION.json`, captured after the forward-only implementation, with the same harness (`next-action-harness.mjs`)
- compared fields: gate-check `current_gate`, `next_allowed_action`, `status_card.next_step`, `status`; delivery-map `current_gate`, `next_allowed_action`, `status`

## Result

115 runs were compared, and exactly one changed:

| Run | Lifecycle | Stored → evaluated gate | Changed fields | Before | After |
|---|---|---|---|---|---|
| agdf-cockpit-claude-host-20261008-01 | active | Brownfield Analysis → CD+Tests (forward) | gate-check `next_allowed_action`, `status_card.next_step`; delivery-map `next_allowed_action` | Run Brownfield Analysis for the approved TP scope before CD+Tests. | Implement the approved TP scope, run its tests, and record CD+Tests evidence before CR. |

- No status, gate or delivery-map status changed for any run.
- The five same-gate custom active runs (SCN-008) and all completed runs (SCN-010) are byte-identical in every compared field.

## Doctor and delivery-map (SCN-018)

`doctor --all-active` with the repository runtime and with the unchanged installed runtime 0.14.5 report identical results: status `revise`, 66 findings (0 block, 3 revise, 63 warn), and 0 differences by severity, code and path. All findings belong to other runs and existed before this change. The three revise findings are:

- `AGDF_DELIVERY_RELATIONSHIP_CONFLICT` in architecture-review-prevention-2026-09-27;
- `AGDF_DELIVERY_RELATIONSHIP_MISSING` in mcp-zielarchitektur-doku-20260929-01;
- `AGDF_DELIVERY_RELATIONSHIP_MISSING` in repository-control-compatibility-20260930-01.

`delivery-map --all-active` reports the same 66 findings.
