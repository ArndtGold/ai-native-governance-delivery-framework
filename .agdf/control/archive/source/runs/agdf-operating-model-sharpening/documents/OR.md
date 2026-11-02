# Orchestration Report: AGDF Operating Model Sharpening

Run: `agdf-operating-model-sharpening`
Status: pass
Date: 2026-07-09

## Run Status Card

| Run status | Value |
|---|---|
| Status | UAT approved |
| Current gate | OR closeout |
| Allowed now | Preserve the completed delivery record |
| Blocked by | none |
| Missing approval | none |
| Next step | No further delivery action for this slice |
| Quality outlook | Validate in a real consumer repository whether the guardrails reduce ambiguity without increasing ceremony |

## UAT

- approval: `Approval: UAT`
- approved_at: 2026-07-09
- outcome: accepted

## Delivered

- Runtime Contract now defines source precedence, workstate/scope ambiguity, knowledge persistence decisions, Bug Lightweight Track, Domain Guardrail Packs and support-answer next-step behavior.
- Router and gate-check skill now explicitly handle branch/workspace evidence limits, ambiguous scopes and lightweight bug routing.
- Control templates now expose source/scope state and per-run knowledge persistence decisions.
- Quality contracts now include ambiguity, branch-not-proof, persistence and bug-lightweight evidence conditions.
- CLI delivery-map/gate-check JSON now exposes `source_scope` and `memory` and emits findings for explicit ambiguity, branch evidence and missing memory reasons.
- Post-QA status projection now handles QA `passed` state correctly and requires `Approval: UAT` before delivery handoff.
- Pages now explains operating guards, the Bug Lightweight path and the Core Control Flow publicly, with small Operating Model, Early Warning and Control Flow icons as visual anchors.

## Not Delivered

- No AGDF gate order change.
- No weakening of exact `Approval: <GateName>` rules.
- No MarzipanWeb-specific domain rules or German approval formula copied into AGDF.
- No new broad skill catalogue.

## Validation

- `node plugin\scripts\check-runtime-integrity.mjs`: pass
- `npm --prefix create-agdf run smoke-test -- --quiet`: pass
- `npm --prefix pages run check`: pass
- `npm --prefix pages run build`: pass
- `node create-agdf\bin\create-agdf.js gate-check --json`: pass before UAT; projected `current_gate: UAT` with `missing_approval: Approval: UAT`
- `npm --prefix pages run check` after Core Control Flow revision: pass
- `npm --prefix pages run build` after Core Control Flow revision: pass
- `npm --prefix pages run check` after Operating Model icon: pass
- `npx --yes node@22 .\node_modules\astro\astro.js build` from `pages\` after Operating Model icon: pass
- `npm --prefix pages run check` after additional section icons: pass
- `npx --yes node@22 .\node_modules\astro\astro.js build` from `pages\` after additional section icons: pass

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: This run adds reusable operating-model guardrails that should be available to future AGDF-governed runs.
- memory_refs: CG-OPERATING-MODEL-SHARPENING

## Open Risks

- Rule density could feel heavier in small repos; mitigated by documenting Bug Lightweight and domain guardrails as optional/right-sized mechanisms.
- First downstream adoption should confirm the new fields are helpful rather than noisy.
- Local Node 25.8.2 on Windows emits a post-build assertion after Astro build completion; Node 22 LTS build validates the Pages output.

## Next Permissible Step

- next_allowed_action: No further delivery action for this slice.
- quality_outlook: Use the next downstream repo installation as a usability check for guardrail clarity.
