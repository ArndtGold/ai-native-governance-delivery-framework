# Brownfield Review: AGDF Installation and First-Run UX

Status: done
Mode: post_ur_review
Date: 2026-07-16
Based on: approved `UR.md`

## Decision

- decision: pass
- mode_slice_decision: structured_delivery
- required_next_gate: PRD
- scope_reason: The approved requirement changes public CLI commands and JSON output, installer
  success and failure presentation, host-specific disable/uninstall mutation rules, repository-local
  bootstrap behavior, runtime interaction guidance and three public documentation owners. The work is
  too broad and too destructive-risk-sensitive for Quick Task, Verified Change or a single
  structured slice.
- transparency: A PRD is required to define one user lifecycle and explicit safety semantics before
  solution design. SD and TP remain gated and are not created by this review.

## Existing-System Coverage

| Capability | Coverage | Existing owner and evidence | Reuse direction |
|---|---|---|---|
| Codex and Claude install/version verification | partially_done | `create-agdf/lib/installers/plugin-installers.js`; release-bootstrap and smoke tests | extend the existing installers; preserve fail-closed version checks |
| OpenCode install/status projection | partially_done | `create-agdf/lib/installers/opencode.js` | reuse its version-transition evidence, not its surface-specific schema wholesale |
| Shared installation completion presentation | not_done | Codex/Claude single lines, OpenCode status block, scaffold `printNextSteps()` | introduce one shared presentation result consumed by surface adapters |
| Technical health versus delivery state | partially_done | `opencode-status`, `doctor`, `gate-check` exist separately | compose them in a new lifecycle status projection; do not redefine doctor or gate policy |
| Read-only no-run/no-approval orientation | partially_done | Runtime and gate-check rules already forbid unnecessary gating | extend the interaction contract and behavioral tests; avoid a second router or repeated banner |
| Exact-text approval fallback | fully_done at contract/helper level, live UAT open | `plugin/meta/contracts/interaction.md`; `gate-check`; `interaction-presentation.js`; active `agdf-human-decision-surface` run | consume the existing owner; correct capability truth without creating another authorization path |
| Primary `@agdf/cli` command family | partially_done | `command-registry.js` already renders a Preferred group first | sharpen grouping and docs; preserve compatibility entry points |
| General lifecycle `status` | not_done | only `opencode-status` exists | add one surface-aware read-only command that composes installer and repository evidence |
| Safe disable and uninstall | not_done | `INSTALL.md` delegates to host-native controls; OpenCode files have ownership markers | add surface adapters with ownership-aware mutation and retained-file reporting |
| `codex-repo` completion | partially_done | scaffold planning/writing plus `printNextSteps()` | extend the same flow with truthful verification and one remaining host action at most |
| Root/package/install documentation | partially_done | `README.md`, `INSTALL.md`, `create-agdf/README.md` | update existing owners only; no fourth onboarding source |

## Existing Owners And Interfaces

- Command identity, grouping and option validation: `create-agdf/lib/cli/command-registry.js`,
  `parse-args.js`, `application.js`.
- Codex and Claude plugin operations: `create-agdf/lib/installers/plugin-installers.js`.
- OpenCode config, owned files, package transitions and status: `create-agdf/lib/installers/opencode.js`.
- Repository-local generated files and collision safety: `create-agdf/lib/scaffold/plan.js`, `write.js`
  and `presentation.js`.
- Delivery health and gate authority: `create-agdf/lib/control-evaluation/doctor.js`, `gate-check.js`
  and `delivery-map.js`.
- Approval capability and fallback authority: `plugin/meta/contracts/interaction.md`,
  `plugin/meta/agdf-plugin.definition.json`, `plugin/skills/gate-check/SKILL.md` and
  `create-agdf/lib/interaction-presentation.js`.
- Public onboarding: `README.md`, `INSTALL.md`, `create-agdf/README.md`.

## Reuse Strategy

- strategy: extend and refactor existing owners; add only a shared lifecycle result/presentation
  boundary where current surface-specific outputs cannot be composed cleanly.
- Keep `doctor` as the repository control-state validator and `gate-check` as delivery authority.
  A new `status` command may compose their results but must not reinterpret or override them.
- Keep host commands as the mutation authority. Surface adapters translate AGDF intent into supported
  host commands and report evidence; they must not invent cross-host parity.
- Reuse OpenCode ownership markers and scaffold collision checks as the safety pattern for disable and
  uninstall. Codex/Claude operations must rely on their native plugin commands and verify afterward.
- Reuse the active `agdf-human-decision-surface` approval owner. This run may repair stale Codex
  capability metadata and user-facing promises, but it must not implement a second gate evaluator,
  approval parser or interaction sequence.
- Keep all compatibility commands routed through the same registry and handlers; documentation
  demotion must not fork behavior.

## Change Impact

- files/modules: CLI registry/parser/application, installer modules, scaffold presentation and
  potentially planning/writing safety helpers, interaction capability metadata/contract, focused
  tests, package sync outputs and three documentation owners.
- public interfaces: new `status`, `disable` and `uninstall` commands; new JSON status schema; changed
  human install completion output; clearer `codex-repo` completion contract.
- data and migrations: no application data model. User configuration and generated repository files
  are mutation targets and therefore require ownership evidence, dry reporting and retained-file
  semantics.
- backwards compatibility: existing install, doctor, gate-check, `opencode-status`, scaffold and
  compatibility command entry points must continue to work. Existing JSON schemas must not silently
  change shape.
- regression surface: first/update/unchanged installs, missing executable, marketplace failure,
  version mismatch, partial config, owned/unowned files, repository-local opt-out, global uninstall,
  read-only status, no-run orientation, capability conflict and generated-surface synchronization.

## Primary Visible Ownership

- Installation Success Card: shared CLI presentation model rendered after host-native output.
- Technical installation health: new lifecycle status evaluator, derived from verified host/plugin
  evidence.
- Delivery state: existing doctor/gate-check output, linked but never relabeled as installation health.
- Approval fallback: existing interaction contract and presentation helper.
- Read-only orientation: gate-check/router interaction rules, not installer output and not a new
  session-start banner.
- Documentation promise: root README for first contact, INSTALL for surface setup/lifecycle, package
  README for CLI reference.

## Parallel-Structure And Drift Assessment

- parallel_structure_risk: high if `status` duplicates doctor/gate policy, if lifecycle commands each
  invent their own ownership rules, or if this run reimplements approval handling.
- mitigation: one lifecycle result contract, surface adapters, existing control evaluators and one
  existing approval owner.
- observed_drift: Codex static metadata declares `exact_option_value` while the loaded host tool only
  exposes a decorated recommended label. Runtime evidence must fail closed and override optimistic
  static capability.
- documentation_drift: the root README's primary discussion-draft framing and INSTALL's absence of
  AGDF lifecycle commands no longer describe the intended product journey.

## Risks And Missing Evidence

- Exact Codex/Claude native disable and uninstall command behavior must be inspected and fixture-tested
  before SD chooses command sequences.
- Codex may still require restart and explicit `/plugins` interaction for repository-local install;
  no code may claim that the CLI can bypass this host boundary.
- Uninstall across OpenCode config, owned instructions/contracts/skills and npm dependencies has the
  highest destructive risk. User-owned or ambiguous files must be retained fail-closed.
- The current Codex tool capability is session/version dependent. Static metadata alone cannot prove
  future runtime capability.
- Existing unrelated working-tree changes are limited to this run's control files and must remain
  isolated from later implementation.

## Context Graph

- context_graph_impact: update
- context_graph_refs: `CG-SURFACE-NATIVE-INTERACTIONS`; `CG-CREATE-AGDF-CLI-MODULARIZATION`;
  `CG-RUN-STATUS-CARD`
- context_graph_required_action: update after approved design establishes durable lifecycle and
  capability-truth invariants
- context_graph_gate_effect: warning
- context_graph_evidence: Existing nodes already own approval adapters, CLI modular ownership and
  status projection; this delivery must extend those nodes rather than create a parallel concept.

## Required Next Step

Draft a PRD that defines the user-visible installation lifecycle, status semantics, safe mutation
boundaries, native-approval capability truth and host-specific completion criteria, then request
`Approval: PRD`.
