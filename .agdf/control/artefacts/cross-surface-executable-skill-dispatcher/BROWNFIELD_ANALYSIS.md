# Brownfield Analysis: Cross-surface Executable Skill Dispatcher

- revision: 1
- status: `done`
- mode: `pre_implementation_analysis`
- decision: `pass`
- related_tp: `.agdf/control/artefacts/cross-surface-executable-skill-dispatcher/TP.md`

## Scope

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
