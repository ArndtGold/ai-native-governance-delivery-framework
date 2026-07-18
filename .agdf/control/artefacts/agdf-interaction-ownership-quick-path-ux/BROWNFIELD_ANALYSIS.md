# Brownfield Analysis: Lean Interaction Ownership and Local Validation

Status: done
Mode: `pre_implementation_analysis`
Decision: `pass`
Date: 2026-07-18
Owner: agent
Based on: approved TP revision 1; exact `Approval: TP` revalidated against run revision 12

## Brownfield Analysis

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `CD+Tests`
- artefact: `.agdf/control/artefacts/agdf-interaction-ownership-quick-path-ux/BROWNFIELD_ANALYSIS.md`
- scope: LIR-01 through LIR-12 and LIR-T01 through LIR-T12.
- transparency: implementation is permitted only because the approved artefact chain, existing-owner
  seams and regression paths are complete; live host behavior and release remain later evidence.

## 1. Worktree and Parallel-Scope Boundary

- Production paths under `plugin/`, `create-agdf/` and `agdf/` are clean at the implementation
  baseline. Current uncommitted changes are this run's control artefacts and backlog row only.
- `opencode-single-install-activation` is an unrelated active run awaiting UAT. Its implementation is
  already part of `HEAD` (`5753aa7`) and owns durable-control activation, early system guidance,
  global installation/status separation and legacy compatibility.
- This run may extend `create-agdf/lib/installers/opencode.js` and its tests only for boundary
  deduplication and local-validator availability. It must preserve that run's delivered behavior and
  must not claim its activation changes as new work.
- No other uncommitted production implementation or competing runtime owner is present.

## 2. Existing Coverage and Reuse Strategy

| TP scope | Existing owner | Current coverage | Reuse strategy |
|---|---|---|---|
| LIR-01/02 interaction ownership | `plugin/meta/contracts/interaction.md`; `plugin/skills/gate-check/SKILL.md`; Runtime Integrity and negative tests | `partially_done`: the focused contract exists, but the skill and tests duplicate detailed policy. | `refactor`: move no semantics to a new owner; reduce the skill and retarget assertions to boundaries. |
| LIR-03/04 proportional routing | `gate-transition.md`; `modes.md`; `control-state/`; `gate-policy.js`; `interaction-presentation.js`; control-state tests | `partially_done`: modes and incomplete-decision blocking exist; normal post-UR copy and compact label are still ceremonially exposed. | `extend`: keep enums/parser and change only atomic workflow guidance and human projection. |
| LIR-05/06 OpenCode boundary | `globalOpenCodeBoundary()` and global surface installation/status in `opencode.js`; smoke fixtures | `partially_done`: one generator exists but is injected into `AGDF.md` and all nine skills. | `refactor`: split full boundary from compact guard inside the same installer owner. |
| LIR-07 resolver/version | modular CLI application/registry/parser; `agdf/bin/agdf.js`; control-evaluation modules | `partially_done`: one evaluator and thin wrapper exist; stable version query and surface resolver do not. | `extend`: add resolver/version seams only and delegate to current command modules. |
| LIR-08 Codex/Claude runtime | full plugin source at `plugin/`; Codex generation via `syncPluginDirectory()`; Claude marketplace points directly to `plugin/` | `not_done`: no executable payload is shipped. | `new` derived artefact only: generate an explicit transitive runtime payload and manifest from existing `create-agdf` owners. |
| LIR-09 OpenCode runtime | exact config-local `create-agdf@<plugin version>` installation; `resolveOpenCodePackage()` and version status | `partially_done`: package and version evidence exist, but no stable resolver envelope/entrypoint. | `extend`: reuse resolved package path and status owner; add no second install. |
| LIR-10 instruction-only boundary | canonical skills/contracts, scaffold presentation and generated surfaces | `not_done`: routine examples still route to `@latest` and do not classify availability. | `refactor`: distinguish routine local validation from explicit lifecycle commands. |
| LIR-11/12 propagation/evidence | sync, integrity, interaction, control-state, lifecycle, skill-eval, DPS and aggregate smoke suites | `fully_done` as test/generation infrastructure. | `extend`: add focused fixtures before aggregate execution. |

## 3. Minimal Clean Runtime Path

The current `create-agdf` CLI is already modular: the 11-line executable delegates to
`lib/cli/application.js`, while control evaluation, Delivery Path Search, installers and scaffold code
have separate acyclic owners. The clean path is:

1. add a stable version query at the command boundary;
2. add one pure resolver that verifies manifests/paths and returns availability without reading AGDF
   control state;
3. expose a validator-focused runtime entrypoint that imports the existing doctor, gate-check,
   delivery-map and Delivery Path Search owners rather than copying their behavior;
4. derive the plugin payload from that transitive module set plus the exact generated definition and
   locale resources it needs; and
5. make the normal CLI and shipped payload call the same modules.

This avoids bundling installer/scaffold behavior into routine validation where it is not required,
keeps the payload smaller than the complete `create-agdf` package, and preserves one command-policy
owner. The generator may write checked-in derived bytes under `plugin/runtime/`, but integrity must
reproduce them and reject hand-maintained drift.

## 4. Interface, Compatibility and Side-Effect Impact

- Persisted run modes and existing JSON meanings are unchanged. Validator availability is additive.
- No data migration, target-repository `node_modules`, global PATH mutation or new npm package is
  required.
- Codex and Claude already distribute the same plugin root; arbitrary owned plugin resources are
  copied by the existing Codex sync and present in Claude's marketplace source directory.
- OpenCode already installs an exact package under its config root through an argument-vector npm
  call. Routine resolution can reuse it without registry access.
- The explicit `AGDF_VALIDATOR_PATH` path must be absolute, version-checked and executed with
  `execFile`/argument vectors only. Mismatch or digest failure is terminal for machine evidence.
- Installation/bootstrap/repair commands may continue to use registry resolution; routine skill
  validation must not invoke them automatically.
- Existing ownership markers, `agdf-global-*` names, explicit question permissions, unrelated
  instructions and legacy local assets remain binding compatibility constraints.

## 5. Parallel-Structure and Source-of-Truth Check

- Interaction semantics stay in `interaction.md`; the gate-check skill remains orchestration only.
- Mode meaning stays in `modes.md`/`gate-transition.md`; Compact Delivery is a projection, not a new
  enum or state machine.
- Control evaluation stays in `create-agdf/lib/control-evaluation/`; the resolver must contain no
  gate table, parser, artefact-readiness or approval logic.
- OpenCode installation and status remain in the existing installer module; no second global-surface
  manager is allowed.
- Runtime generation is derived packaging, not a source directory for edits. A reproducible digest
  and source scan enforce that boundary.

No unresolved product-semantics or SoT drift remains. Discovery of a required second evaluator,
persisted enum, runtime package or host-specific policy owner stops implementation and returns to SD.

## 6. Regression and Test Impact

- `runtime-integrity-negative-test.js` must be rewritten carefully: duplicated phrase removal is now
  valid, while removal of any of the six orchestration boundaries must fail.
- `control-state-test.js` and interaction presentation tests own the Quick Task/Compact Delivery and
  post-UR narration regression surface.
- OpenCode smoke fixtures already cover clean global install, ownership protection, explicit
  permission preservation, status separation and legacy compatibility; extend these rather than
  creating another harness.
- CLI modularization tests own version/registry/parser seams; add focused resolver tests for missing,
  mismatch, digest, safe argv and availability classification.
- Installed-layout integrity and package smoke own Codex/Claude payload presence. Offline command
  fixtures must poison `npx`, `npm` and network paths to prove absence rather than merely omit them.
- Repository checks remain distinct from authenticated Codex, Claude or OpenCode host observation.

## 7. Risks and Required Controls

| Risk | Control |
|---|---|
| Generated runtime becomes a second maintained implementation | Deterministic generator, source banner, manifest digest, reproduction test and no edits under derived output. |
| Bundle import graph accidentally includes installers or recursive generated surfaces | Use an explicit validator entrypoint and verified transitive inventory; record payload size. |
| OpenCode activation UAT baseline regresses | Preserve current activation/status fixtures and attribute only boundary/resolver deltas to this run. |
| Terse gate-check becomes non-executable | Keep six operational boundaries and fail each one independently in negative tests. |
| Compact label changes machine consumers | Bind human label to unchanged `quick_task` output in paired presentation/JSON assertions. |
| Resolver executes stale or untrusted code | Exact version and digest/path validation before normal invocation; argument-vector execution; no PATH fallback. |
| Registry access hides missing local runtime | Rejecting lifecycle-command stubs in routine offline tests and explicit availability output. |

## 8. Context Graph

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`;
  `CG-DOCUMENTATION-CEREMONY-BOUNDARY`; `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: `open_gap`
- context_graph_gate_effect: `warning`
- context_graph_required_action: `update`
- rationale: the implementation extends three existing durable ownership invariants and introduces no
  independent policy node; reconcile them after code and test evidence exists.

## 9. Decision

- decision: `pass`
- current_coverage: `partially_done`; all new behavior has an existing owner or a derived packaging
  seam, and no second product-policy implementation is required.
- reuse_strategy: `refactor` duplicated guidance; `extend` existing presentation, CLI and OpenCode
  owners; create only the derived runtime payload and pure resolver seam.
- parallel_structure_risk: controlled by source/digest integrity.
- missing_evidence: final payload closure/size, offline per-surface execution and authenticated host
  observation are not preconditions; they remain TP verification/UAT evidence.
- required_next_step: proceed to `CD+Tests` for LIR-01 through LIR-12 and record evidence by task/test
  ID. No earlier gate reopens.
