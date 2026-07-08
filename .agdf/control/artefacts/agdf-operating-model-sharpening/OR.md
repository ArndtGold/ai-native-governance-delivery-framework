# Orchestration Report: AGDF Operating Model Sharpening

Run: `agdf-operating-model-sharpening`
Status: pass
Date: 2026-07-08

## Run Status Card

- status: pass
- allowed_now: UAT review, commit preparation after UAT approval
- forbidden_now: release claim without UAT approval
- blocking_condition: UAT not yet approved for commit/release handoff
- next_skill: agdf-delivery-closeout
- next_step: Request `Approval: UAT` before committing if this slice should be finalized in git.
- quality_outlook: Validate in the next real consumer repo whether source precedence, scope ambiguity and memory routing make agent runs clearer without increasing ceremony.

## Delivered

- Runtime Contract now defines source precedence, workstate/scope ambiguity, knowledge persistence decisions, Bug Lightweight Track, Domain Guardrail Packs and support-answer next-step behavior.
- Router and gate-check skill now explicitly handle branch/workspace evidence limits, ambiguous scopes and lightweight bug routing.
- Control templates now expose source/scope state and per-run knowledge persistence decisions.
- Quality contracts now include ambiguity, branch-not-proof, persistence and bug-lightweight evidence conditions.
- CLI delivery-map/gate-check JSON now exposes `source_scope` and `memory` and emits findings for explicit ambiguity, branch evidence and missing memory reasons.
- Post-QA status projection now handles QA `passed` state correctly and requires `Approval: UAT` before delivery handoff.
- Pages now explains operating guards and the Bug Lightweight path publicly.

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
- `node create-agdf\bin\create-agdf.js gate-check --json`: pass; projects `current_gate: UAT` with `missing_approval: Approval: UAT`

## Knowledge Persistence Decision

- memory_target: context_graph
- memory_reason: This run adds reusable operating-model guardrails that should be available to future AGDF-governed runs.
- memory_refs: CG-OPERATING-MODEL-SHARPENING

## Open Risks

- Rule density could feel heavier in small repos; mitigated by documenting Bug Lightweight and domain guardrails as optional/right-sized mechanisms.
- First downstream adoption should confirm the new fields are helpful rather than noisy.

## Next Permissible Step

- next_allowed_action: Request `Approval: UAT` before commit handoff.
- quality_outlook: Use the next downstream repo installation as a usability check for guardrail clarity.
