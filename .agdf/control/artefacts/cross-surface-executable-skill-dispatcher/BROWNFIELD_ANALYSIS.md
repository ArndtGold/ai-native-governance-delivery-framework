# Brownfield Analysis: Cross-surface Executable Skill Dispatcher

- revision: 5
- status: `done`
- mode: `pre_implementation_analysis`
- decision: `pass`
- related_tp: `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/TP.md`

## Scope

## Codex Host Feedback, 2026-09-05

Current pre-implementation decision: `pass` for bounded corrections under approved TP-04/06/14/15/16.
The native task `Run AGDF QA gate` (`01a07112-556e-7383-88dd-81ab23a8ebfe`) supplies direct evidence:
the hook emitted binding schema 2 with `--surface claude` inside Codex; after explicit target input,
the deterministic renderer rejected the ambiguous-run recovery with `next_step_unlocalized`.

- `CSED-CODEX-09 | implementation_gap | CD+Tests | resolved`: the existing locale registry omits
  `runSelectionRecovery("gate-check")`. Reuse that exact semantic owner and add reviewed locale
  entries; do not loosen renderer validation, silently choose a run or invent an approval.
- `CSED-CODEX-10 | implementation_gap | CD+Tests | resolved`: generated host detection treats
  `CLAUDE_PLUGIN_ROOT` as exclusive Claude evidence, although Codex supplies that compatibility
  alias alongside its native `PLUGIN_ROOT`. Preserve explicit AGDF_SURFACE and Copilot's specific
  signal; prefer native PLUGIN_ROOT over the compatibility alias.
- Correction evidence: code, locale and native-environment tests pass; see CD_TESTS Revision 10
  and CODE_REVIEW Revision 10. Corrected installed-host evidence is still missing.
- Regression gaps: prior fixtures force AGDF_SURFACE and initialize ambiguous-run control in
  English. Add real host-shaped environment fixtures and German control plus German dispatch.
- Boundaries: native metadata and gate semantics, target policy, hooks manifest and permissions
  remain unchanged; no cache mutation, install, trust write or gate approval is included.
- Baseline: HEAD `4d38db394d05bf2afb5280dc3af92dfee042a2bb` plus the existing dirty worktree;
  preserve previous hook-status, Copilot and dispatcher changes. Snapshot:
  `/private/tmp/agdf-codex-followup-baseline/`.
- Context Graph: update existing interaction and dispatcher authority nodes after verification.

## Current Revision 4 Pre-implementation Decision

Approved TP2 is revalidated against baseline `4d38db394d05bf2afb5280dc3af92dfee042a2bb`.
Only this run's prior seven control/design files and the unrelated image were dirty. No runtime
code or installed profile was changed before this analysis. TP-11 through TP-16 are the correction
scope; prior task results remain regression inputs, not new implementation evidence.

- Coverage: dispatcher/target/gate authority fully exists; launch environment, common binding
  validation and exact argument guidance are partially implemented or absent.
- Reuse: extend the canonical CLI registry for derived argument metadata, add one bounded
  skill-dispatch transport module, reuse its launch preparation in local-validator, and consume
  it from the generated session runtime and existing OpenCode transform. Existing generators and
  footprint/profile/composed-input validators are affected consumers, not separate owners.
- Risk: tests currently assert binding v1 literals and exact keys; update them to validate v2
  semantically without weakening activation, consent, footprint or CLI-v1 assertions. Windows
  shell and Electron runtime require separate runtime/host evidence.
- No SoT, target, gate, rendering or policy change is required. No native tool, hook, daemon,
  PATH search or permission expansion is needed. Existing template and generated files remain
  generated, not primary edit targets.
- Context Graph: approved transport boundary is already curated; implementation evidence must
  later reconcile with that node. The old planning-only state is not proof of working hosts.
- Decision: pass for scoped CD+Tests. Implement TP-11 through TP-15 and complete TP-16 reviews;
  host lifecycle changes remain separately authorized. Stop on any SD2/TP2 boundary violation.

## Historical Revision 2 Scope

Revision 2 revalidates the existing implementation against the 2026-09-05 OpenCode QA invocation
and the user's request to correct dispatch across Codex, OpenCode, Claude Code and Copilot. The
Revision 1 implementation analysis below remains historical. Its permission to implement does not
cover the proposed binding-schema change until SD2 and the subsequent TP revision are approved.

## Revision 2 Findings And Routing

Revision 3 records the accepted SD2 decision and TP2 mapping only. It does not represent a new
pre-implementation pass. Refresh this analysis against the approved TP2 and current source before
implementation begins.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CSED-BA-08 | design_gap | SD | resolved | SD Revision 2 approved by exact Approval: SD against run revision 18; TP2 tasks TP-11 through TP-16 map the decision | Preserve the approved SD2 transport boundary; any new design deviation routes back to SD. |

The actual installed OpenCode binding names an Electron Helper through `process.execPath`, without
the environment required for standalone script execution. The generated session-runtime owner for
Codex, Claude Code and Copilot independently emits the same incomplete tuple shape. Only OpenCode's
failure is host-observed; shared source structure does not prove the others fail at runtime.

The final observed call supplied `--working-directory` but omitted both target fields. The unchanged
resolver correctly returned `target_unresolved`; no QA decision ran. Do not convert that observation
into permission to infer targets from cwd. Complete argument guidance and carry established target
evidence, retaining clarification for genuinely absent or ambiguous evidence.

Reuse the existing dispatcher contract, CLI grammar, local-validator process chain, session-runtime
generator and OpenCode transform. Add only a common transport helper. Existing target policy,
activation kernel, gate/QA owners, permissions, renderers and public skills-only profile remain
unchanged. No additional hook or native tool is needed.

The binding-version/environment/compatibility decision is absent from SD1, so this is not solely an
implementation gap under TP1. UR and PRD remain sufficient; route to SD rather than start a new run.
Context Graph impact is `update_existing_node` for `CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY`, pending SD
approval. Keep host installation, restart, native Windows and live-host evidence separately bounded.

Current required next step: obtain the decision on ready TP Revision 2. After approval, refresh
pre-implementation analysis against that revision and the current baseline before code changes.

## Historical Revision 1 Analysis

Verify the approved TP implementation path against the current runtime, CLI, skill, generator,
package, host-adapter and test owners before CD+Tests.

## Current Coverage

| Area | Coverage | Evidence |
|---|---|---|
| Installed runtime identity | `fully_done` | `create-agdf/lib/runtime/local-validator.js` validates version, manifest digest, plugin root and installation provenance before spawning the packaged CLI. |
| Target-first resolution | `fully_done` | `task-target-resolution.js`, `interaction-presentation.js` and their tests own normalized target results and canonical orientation. |
| Gate and status evaluation | `fully_done` | `control-evaluation/gate-check.js` and existing CLI handlers own gate state and presentation. |
| Named skill dispatch | `not_done` | `validator-application.js` exposes five validator commands; no dispatcher command or service exists. |
| Canonical skill inventory | `partially_done` | `agdf-plugin.definition.json.skillSet` owns ten slugs but lacks dispatch metadata. |
| Surface runtime binding | `partially_done` | Session/runtime generation resolves exact plugin roots, but context does not expose a dispatcher binding before consent-gated repository checks. OpenCode guidance points at gate-check only. |
| Skill instruction compaction | `not_done` | Ten canonical skills total 77,232 bytes and repeat direct-preflight/runtime discovery mechanics. |
| Distribution and integrity | `fully_done` as reusable owner | Existing sync, package, payload, Runtime Integrity and smoke suites provide the propagation boundary to extend. |

## Reuse Strategy

- `extend`: parser and command registry with one command plus approved fields.
- `new`: one bounded `skill-dispatch/contract.js` and one orchestration `service.js` because no
  existing module owns named skill dispatch.
- `extend`: validation handlers and validator application for the new command.
- `extend`: local wrapper only for validated identity and timing propagation.
- `reuse unchanged`: target resolver, gate evaluator, interaction renderer, approval persistence,
  locale registry and QA judgement.
- `extend`: canonical plugin definition and existing generators; generated surface files remain
  derived.
- `refactor`: canonical skill prose only after executable coverage exists, removing replaced common
  mechanics while preserving skill-specific judgement and evidence rules.

## Existing Owners And Constraints

- `plugin/meta/agdf-plugin.definition.json` is the sole skill inventory.
- `create-agdf/lib/cli/parse-args.js` and `command-registry.js` own public grammar.
- `create-agdf/lib/runtime/validator-application.js` is the packaged surface-local command boundary.
- `create-agdf/lib/runtime/local-validator.js` owns version, digest and provenance checks.
- `task-target-resolution.js` and `interaction-presentation.js` remain semantic owners.
- `sync-plugin-runtime.js` and `sync-package-assets.js` own generated runtime and surface copies.
- `agdf-session-check.js` is generated and currently exits before emitting context when automatic
  checks are not enabled; binding emission must be separated from consent-gated repository work.
- `create-agdf/opencode-plugin.js` owns OpenCode system guidance and must remain honest about
  config-local runtime and subagent limitations.

## Regression And Compatibility Impact

- Parser option compatibility is high risk because target options are currently legal only for
  `target-check`; tests must prove no widened legality for other commands.
- Local wrapper changes can affect every supported surface and must preserve exact digest and
  provenance behavior.
- Session hook reordering must not start repository inspection when consent is disabled.
- Generated skill compaction can remove normative rules; every removed block needs executable
  replacement plus retained-semantics evidence.
- Copilot payload bytes will change and require measured baseline review, never a blind threshold
  increase.
- Windows needs real argv/path and release tests without assuming symlink capability.
- Existing commands, output schemas and exit codes remain backwards compatible.

## Parallel-structure And SoT Check

No parallel owner is required. The dispatcher registry derives from `skillSet`; deterministic paths
call existing evaluators and renderers; judgement paths return continuation rather than deciding.
Per-host registries, copied gate tables, local approval state, model-rendered cards, runtime search
and remote fallback are prohibited.

## Visible-state And Recovery Ownership

Existing code-owned presentation remains the only visible-state owner. The dispatcher exposes typed
failure and timing data but does not create UI state. Recovery is exactly one normalized action for
missing binding, invalid input, unresolved target or evaluator failure.

## Context Graph Impact

`CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY` is already curated after SD approval and links the unchanged
Target and Native Interaction owners. Implementation must update its evidence only if the approved
boundary changes; no further node is required.

## Missing Evidence

- Implementation and deterministic test results.
- Retained-semantics and byte/token compaction measurements.
- Native-Windows execution evidence.
- Separately authorized loaded-host evidence for all four surfaces.

These are planned delivery evidence, not blockers to beginning CD+Tests.

## Risks And Controls

- Authority duplication: dependency boundaries and negative tests forbid new semantic owners.
- Consent regression: binding emission has no repository input; existing automatic checks remain
  downstream and receipt-bound.
- Skill semantic loss: compaction follows executable replacement and a per-skill rule matrix.
- Surface drift: generators and integrity tests reject missing or divergent bindings and skills.
- Latency misstatement: dispatcher duration, model tool-start and first-visible host latency stay
  separate.

## Minimal Clean Implementation Path

Implement TP-01 through TP-08 in approved order. Keep TP-09 pending until separate lifecycle
authorization permits installation/restart and host mutation. Then run mandatory plan, clean and code
reviews before QA.

## Required Next Step

Proceed to CD+Tests for TP-01 through TP-08. Do not install profiles, claim loaded-host conformance or
advance QA without their separate evidence.
