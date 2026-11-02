# Brownfield Review: Deterministic Repository-Activation Diagnosis

Gate: Brownfield Review
Type: Brownfield Review
Mode: `post_ur_review`
Status: done

## Run

- run_id: activation-diagnosis-determinism
- related_ur: `.agdf/control/artefacts/activation-diagnosis-determinism/UR.md` (approved 2026-07-20)
- current_gate: Mode/Slice Decision
- reviewer: agent
- reviewed_at: 2026-07-20

## Objective

Size and route the approved UR scope: make repository-activation diagnosis deterministic and
tool-shell-safe by (1) naming `agdf-local.js doctor --json` as the sole canonical activation probe,
(2) explicitly forbidding relative glob/grep and `AGDF_*` env-only as agent-side proof of
`.agdf/control/config.json` presence or absence, (3) disclosing the OpenCode `shell.env`
host-propagation boundary, and (4) adding Runtime Integrity assertions for the new guidance.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: none
- ui_ux_impact_reason: framework-maintenance guidance change; no user-facing surface, no workflow restructure, no visual change.
- ux_intent_definition_required: no
- ux_intent_definition_result: not_applicable

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | `plugin/skills/gate-check/SKILL.md` | Already names `doctor --json`/`gate-check --json` as the deterministic check (lines 52, 62, 67); does NOT promote `AGDF_*` env vars as agent-facing proof | medium |
| Source of truth | `plugin/meta/contracts/control-scaffold.md` | Already states `doctor --json` is the actionable check (line 84); `agdf-agent-router.md:97` says validators do not substitute for the router/skills | medium |
| Runtime path | `create-agdf/opencode-plugin.js:48-55` | Owns the `shell.env` hook that sets `AGDF_PLUGIN_ACTIVE`, `AGDF_CONTROL_DIR`, `AGDF_OPENCODE_REPOSITORY_SURFACE`, `AGDF_OPENCODE_REPOSITORY_ACTIVATION`; consumed internally by `create-agdf/lib/installers/opencode.js:416-420` for `opencode-status` | low |
| UI / UX | none | — | none |
| Persistence / data | none | No schema, control-state or approval-value change | none |
| Tests / QA | `plugin/scripts/check-runtime-integrity.mjs:629`; `create-agdf/scripts/lifecycle-test.js:195-205` | Runtime Integrity asserts `opencode-plugin.js` contains `AGDF_CONTROL_DIR`; lifecycle tests assert env-var exposure for active/inactive states | medium |
| Release / operations | none | No VCS, publication or release scope | none |

## UR Premise Refinement

The UR section 1 states "AGDF advertises plugin-shell environment variables as the diagnostic source
of truth." Brownfield inspection refines this: the gate-check skill and control-scaffold contract
**do not currently advertise** `AGDF_*` env vars as agent-facing diagnostic proof — they already
correctly direct agents to `doctor --json`. The actual gap is the absence of an **explicit
prohibition** on two fallback patterns an agent can fall into when env-propagation or tool-shell
semantics differ from the interactive shell:

1. using `AGDF_*` env vars (set by the plugin's `shell.env` hook) as proof of activation when those
   vars are unset in the current tool shell;
2. using a relative glob/grep for `.agdf/control/config.json` as proof of presence/absence, when
   relative-path resolution in a tool shell can fail for an existing absolute file.

The PRD must reframe scope accordingly: AGDF is not removing a wrong promotion, it is adding an
explicit forbidden-list entry and a disclosed boundary. This is a smaller, additive change than
the UR's initial framing suggested.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| `AGDF_*` env vars are an internal plugin status channel, not agent guidance | `opencode-plugin.js:50-54` sets them; `opencode.js:416-420` consumes them; no skill/contract tells agents to use them as proof | warn | PRD must forbid agent-side use as proof without removing the plugin-internal channel or breaking Runtime Integrity assertions that reference it |
| Prior related run already disclosed part of this boundary | `opencode-global-install-visibility/OR.md` Limitations: "Active OpenCode session detection can only be proven from a process that sees the hook-set environment variables." | warn | PRD must extend, not duplicate, the existing disclosure; link to the prior OR |
| `agdf-interaction-ownership-quick-path-ux` (UAT) owns gate-check skill responsibilities | RUN_STATE at UAT; that run reduced gate-check to six operational responsibilities and added the canonical status_presentation contract | revise | PRD must distinguish this run's additive guidance (forbidden patterns + canonical probe) from the UAT run's responsibilities reduction; no overlap in scope of change |
| `opencode-single-install-activation` (UAT) owns the activation helper and `opencode-plugin.js` | RUN_STATE at UAT; owns `evaluateOpenCodeRepositoryActivation` and the shell.env hook contract | warn | PRD must keep `opencode-plugin.js` and the activation helper out of scope (non-goal in UR); this run only edits skill/contract prose and Runtime Integrity assertions |
| Runtime Integrity assertion class for guidance prose is new | Existing Runtime Integrity asserts code/asset presence; this run adds assertions that skill/contract prose does not reintroduce relative-glob/env-only diagnosis | warn | Brownfield Analysis (pre-implementation) must validate the assertion mechanism can deterministically detect the targeted prose drift without false positives on legitimate edits |

## Mode / Slice Decision

- decision: verified_change
- required_next_gate: Verified Change Execution
- scope_reason: The approved UR scope is a single-owner, additive guidance-and-assertion change. The canonical owner (gate-check skill + control-scaffold contract) already exists and already directs to `doctor --json`; this run only adds an explicit forbidden-list entry, a disclosed boundary note, and Runtime Integrity assertions. Bounded clean-at-baseline paths (small prose edits + assertion extension + canonical sync). No prohibited impact (no gate, approval value, schema, control-state mutation, plugin host behavior, or release change). Deterministic propagation/validation via `sync-package-assets` idempotence and Runtime Integrity positive/negative assertions. Structured escalation target is `structured_slice`/`structured_delivery` PRD if pre-implementation Brownfield Analysis finds the prose-assertion mechanism cannot be made deterministic.
- evidence: This Brownfield Review; UR section 1, 3, 4; existing owners cited above; prior `opencode-global-install-visibility/OR.md` Limitations disclosure.
- transparency_note: The PRD shortcut is not used because the change touches normative skill and contract files explicitly excluded from the Trivial Change Boundary. The verified_change compact record must prove the four eligibility conditions before implementation.

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Can Runtime Integrity deterministically detect prose drift (forbidden patterns reintroduced) without false positives on legitimate edits? | Verified Change pre-implementation Brownfield Analysis | revise |
| Does any other generated surface (Codex/Claude/Copilot AGENTS.md/instructions) currently contain env-only or relative-glob diagnosis language that needs the same update? | Verified Change implementation | warn |
| Should the disclosed boundary live in `control-scaffold.md` (CLI verification) or `interaction.md` (interaction contract) or both, given the canonical-probe statement already lives in control-scaffold? | Verified Change implementation | warn |

## Context Graph Impact

- context_graph_impact: link_only
- context_graph_refs: candidate node for the "canonical CLI probe is the only activation diagnosis" invariant; link to existing `opencode-global-install-visibility` OR Limitations disclosure and to the gate-check / control-scaffold owners.
- context_graph_required_action: create
- context_graph_gate_effect: none
- context_graph_evidence: Pre-implementation Brownfield Analysis must confirm whether a new Context Graph node is required or an existing one extends; no SOT drift.

## Next Permissible Step

- next_allowed_action: Create the Verified Change compact record (baseline + eligibility proof via `doctor --json` and `gate-check --json`), then implement the four scoped changes (gate-check skill forbidden-list, control-scaffold boundary note, Runtime Integrity assertions, generated-surface sync), then record mini-closeout and offer OR.
- forbidden_until_then: PRD, SD, TP, QA, UAT, release, VCS, mutation of `opencode-plugin.js` or `opencode-activation.js` or `opencode.js`, mutation of existing `.agdf/control/` content other than this run's own artefacts, and any change to gate order, approval values, or control-state schema.

## Quality Outlook

- quality_outlook: The verified_change compact record must prove that the prose-assertion mechanism is deterministic before implementation; if Brownfield Analysis cannot, the run escalates to a structured_slice PRD rather than shipping a non-deterministic integrity check.
