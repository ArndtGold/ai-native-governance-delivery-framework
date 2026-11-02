# Brownfield Review: AGDF Installation and First-Run UX

Status: done; revision 2 delta
Mode: post_ur_review
Date: 2026-07-17
Based on: approved `UR.md` revision 2

## Revision 2 Delta Decision

- decision: pass
- mode_slice_decision: structured_slice
- required_next_gate: PRD
- scope: Make AGDF-owned CLI presentation canonically English and revise the lifecycle Success Card
  without changing project chat/artefact localization, gate authority or host-native operations.
- scope_reason: The delta is bounded to the existing lifecycle result/presentation boundary, its CLI
  call sites, scaffold completion and focused lifecycle/bootstrap tests. It changes public output and
  may extend the schema-v1 result compatibly, so it is too semantic for Quick Task or Verified Change,
  but it does not reopen the original destructive lifecycle or cross-host installation design.
- transparency: The existing Structured Delivery artefacts remain baseline evidence. Only concise
  PRD, SD and TP deltas are required before implementation; unrelated installer, approval and
  lifecycle-operation scope stays closed.

## Revision 2 Existing-System Coverage

| Concern | Coverage | Existing owner and evidence | Reuse direction |
|---|---|---|---|
| English CLI presentation | partially_done | Most CLI surfaces already emit fixed English; `create-agdf/lib/lifecycle/presentation.js` alone selects `primary.lifecycleResult` from the project chat locale | decouple lifecycle CLI copy from `chat_language`; do not change agent-chat locale resolution |
| Mixed lifecycle card values | partially_done | Localized labels are combined with stable English enums such as `success`, `verified` and `healthy` | render one canonical English vocabulary; retain stable JSON values |
| Installation health | fully_done | `verification.status` and installer version evidence already drive the lifecycle result | relabel through the existing result rather than add a second verifier |
| Host activation | partially_done | `restart.required` and `restart.reason` exist, but the human card exposes only a yes/no restart row | derive or compatibly add an explicit activation projection from existing restart evidence |
| Repository delivery | fully_done in `status`, not evaluated by global install | `lifecycle/status.js` composes doctor/gate-check authority; install results have no selected repository delivery evidence | never infer delivery from restart; show `not evaluated` only when the shared result contract explicitly represents it |
| Project language | fully_done and separately owned | `runtime-context.js`, `.agdf/control/config.json` and the interaction locale registry govern chat and artefacts | preserve unchanged; CLI English must not delete German interaction packs or alter generated config |
| Idempotent version transition | fully_done in data, partially_done in presentation | lifecycle `version.transition` already distinguishes installed, updated and unchanged | reuse the transition for truthful English outcome copy |
| Marketplace/cache paths | host-owned in observed Codex output | `plugin-installers.js` deliberately streams native Codex output before the AGDF card | keep the final AGDF card free of internal paths; PRD must decide whether normal mode may summarize instead of streaming native detail, because duplicate native lines cannot be removed while also preserving them verbatim |
| Regression coverage | partially_done | `lifecycle-test.js`, `smoke-test.js` and `release-bootstrap-smoke-test.js` assert the current ordered card | extend these fixtures for German environment/project locale, activation/delivery separation and mixed-language rejection |

## Revision 2 Reuse Strategy

- Reuse `create-agdf/lib/lifecycle/result.js` as the only lifecycle result schema and
  `create-agdf/lib/lifecycle/presentation.js` as the only human Success Card renderer.
- Stop passing `options.language.chat_language` into lifecycle/status rendering. Keep that language
  object for generated AGDF chat and artefact configuration only.
- Reuse existing `restart` evidence for activation; do not create a second host probe.
- Reuse `lifecycle/status.js` plus doctor/gate-check for repository delivery. Global installation must
  not manufacture a delivery blocker when no repository/run was evaluated.
- Keep `plugin/meta/agdf-interaction-locales.json` as interaction-copy ownership. Removing its German
  lifecycle keys is optional cleanup only if runtime-integrity consumers permit it; it is not a new
  CLI localization framework.
- Extend existing lifecycle and bootstrap fixtures. Do not introduce snapshot infrastructure or a
  second presentation module.

## Revision 2 Impact And Risks

- affected modules: lifecycle result/presentation, CLI lifecycle call sites, scaffold completion,
  focused lifecycle/smoke/bootstrap tests and concise CLI documentation.
- compatibility: JSON enum values and existing commands remain stable. Any added activation/delivery
  fields must be additive within schema v1 or require an explicit schema decision in SD.
- primary visible owner: the final AGDF lifecycle card. Host-native command output remains a separate
  upstream surface and must not be silently claimed as AGDF-localized copy.
- parallel_structure_risk: low if the existing lifecycle renderer is extended; high if a new
  installer-only card or separate locale registry is introduced.
- product_semantics_risk: activation and delivery must remain different state domains. A restart can
  make activation pending but cannot authorize or classify a repository delivery gate.
- missing_evidence: PRD must settle normal-versus-verbose handling of host-native detail and the exact
  compact card rows; SD must settle additive schema shape before implementation.

## Revision 2 Context Graph

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-CREATE-AGDF-CLI-COMPOSITION`; `CG-RUN-STATUS-CARD`
- context_graph_required_action: update after the approved design fixes the CLI-language and
  installation/activation/delivery invariants
- context_graph_gate_effect: none
- context_graph_evidence: both concepts already exist and own the affected composition/status
  boundaries; no new governance node is justified.

## Revision 2 Required Next Step

Draft a concise PRD delta that fixes the exact English Success Card contract and decides how normal
output treats host-native detail, then request `Approval: PRD`.

## Revision 1 Baseline

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
