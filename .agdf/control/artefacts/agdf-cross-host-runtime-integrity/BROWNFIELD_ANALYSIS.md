# Brownfield Analysis: Cross-Host Plugin Runtime Integrity

Status: passed  
Mode: pre_implementation_analysis  
Decision: pass  
Date: 2026-08-25  
Based on: approved `TP.md`

## 1. Scope

Revalidate the approved implementation path immediately before CD+Tests for CRI-01 through CRI-12.
The scope remains the bounded correction of repository marketplace shadowing, executable
distribution profiles, installed provenance and loaded-root evidence across the existing Codex,
Claude Code and OpenCode owners.

- mode_slice_decision: structured_slice
- required_next_gate: none
- implementation_path_status: approved_for_cd_tests
- implementation_permission_boundary: CD+Tests may begin only within the approved TP paths; real
  host installation and fresh-session evidence remain separately authorized later actions.

## 2. Baseline And Scope Integrity

- tracked baseline changes before implementation:
  - `.agdf/control/MASTER_BACKLOG.md` from this run
  - `docs/presentation/agdf_cto_praesentation.key` as unrelated user work
- untracked baseline changes before implementation:
  - this run's `.agdf/control/artefacts/agdf-cross-host-runtime-integrity/`
  - this run's `.agdf/control/runs/agdf-cross-host-runtime-integrity/`
- protected unrelated file:
  - `docs/presentation/agdf_cto_praesentation.key`
  - observed SHA-256 before implementation:
    `377d5af865f37632f888ecda76da4d3eb11acf38805976a6e9b4ab455dce047f`
- candidate implementation paths: clean at baseline
- multi_scope_state: clear

Any new path outside TP Section 3 or any byte change to the protected Keynote file invalidates the
implementation baseline and must stop CD+Tests.

## 3. Current Coverage And Reuse

| Concern | Coverage | Existing owner | Reuse decision |
|---|---|---|---|
| Editable source versus generated full plugin | fully_done | `plugin/`, `sync-package-assets.js`, `sync-plugin-runtime.js` | extend generation rules; preserve source/runtime separation |
| Runtime-free root source marketplaces | partially_done and contradictory | `manifest.js`, `sync-package-assets.js`, `.agents/plugins/marketplace.json`, `.claude-plugin/marketplace.json` | remove both source projections and the Codex generation path; preserve generated runtime-complete repository scaffolding |
| Canonical repository marketplace metadata | partially_done and drifting | `agdf-plugin.definition.json` | replace active marketplace declaration with distribution profiles; retain legacy identity only in recovery code |
| Focused validator payload | fully_done | `sync-plugin-runtime.js` and focused `create-agdf/lib/` modules | reuse unchanged semantic owner; add only the shared provenance helper to the payload |
| Runtime resolution | partially_done | `local-validator.js` | extend existing envelope and verification; no new resolver |
| Runtime digest verification | fully_done for runtime payload | runtime manifest plus `local-validator.js` | reuse and expose evidence |
| Installed plugin provenance | partially_done for Codex local development only | `.agdf-local-install.json` handling in `local-marketplace.js` | generalize through one canonical marker with legacy read compatibility |
| Durable marketplace transaction | fully_done | `local-marketplace.js` | extend staging validation; preserve ownership, atomic promotion and rollback |
| Codex and Claude installation lifecycle | fully_done | `plugin-installers.js` | extend evidence only; preserve host command sequences |
| Repository disable/status behavior | partially_done | `operations.js`, `status.js` | make durable `agdf@agdf` current for source checkouts; preserve `agdf@agdf-repo` for validated runtime-complete generated repositories and deliberate legacy recovery |
| Loaded-session orientation | partially_done | shared `session-start.sh` and `hooks.json` | extend the existing hook with one resolver invocation |
| OpenCode config-local validator | fully_done | `opencode.js` plus `local-validator.js` | regression plus additive profile evidence only |
| Portable Skills-only boundary | fully_done | public plugin builder/tests and gate-check contract | preserve runtime absence and honest degradation |
| Runtime Integrity | fully_done as independent checker, missing new invariants | `check-runtime-integrity.mjs` | extend independent verification; do not make it the runtime's operational policy owner |

## 4. Reuse Strategy

- extend:
  - canonical plugin definition with profile semantics;
  - local marketplace staging with general installation provenance;
  - local validator with additive profile/provenance evidence;
  - SessionStart, lifecycle and status with evidence-plane presentation;
  - Runtime Integrity and existing focused tests with new invariants.
- refactor:
  - extract production provenance and normalized digest behavior shared by installer and resolver into
    one focused `create-agdf/lib/runtime/` helper;
  - remove source-root marketplace rendering and unvalidated file-presence inference from current behavior.
- replace:
  - `.agdf-local-install.json` only through explicit owned reinstall with
    `.agdf-installation.json`; no in-place cache migration.
- new:
  - exactly one shared provenance helper and its direct tests.

The independent Runtime Integrity implementation may recompute expected values to detect defects in
the operational helper. This is verification diversity, not a second runtime policy owner. Stable
field meaning and profile rules still come only from the canonical definition and approved SD.

## 5. Minimal Clean Implementation Order

1. Record CRI-01 baseline evidence and add profile metadata plus source-marketplace removal.
2. Add the focused shared provenance helper and direct unit matrix.
3. Integrate the helper into durable marketplace staging and legacy-marker recovery.
4. Add the helper to the focused generated runtime and extend local resolution.
5. Extend SessionStart, installer verification, repository lifecycle and status projections.
6. Update independent Runtime Integrity, portable/OpenCode regressions and host-root fixtures.
7. Update documentation, regenerate only through canonical sync and run full verification.
8. Record CRI task/test evidence without claiming direct host state.

This order prevents the marker, resolver and UI surfaces from defining overlapping profile or digest
semantics.

## 6. Interfaces, Compatibility And Migration

- interfaces:
  - additive local `--resolve-only --json` fields and stable reason values;
  - internal canonical `distributionProfiles` metadata;
  - owned `.agdf-installation.json` marker;
  - compact SessionStart integrity line;
  - layered lifecycle/status evidence.
- compatibility:
  - existing machine-validation values and gate semantics remain unchanged;
  - existing Codex development cachebuster grammar remains valid;
  - existing OpenCode config-local resolution and portable package contract remain valid;
  - package-local Codex/Claude marketplaces remain runtime-bearing and owned by the durable
    marketplace lifecycle.
- migration:
  - remove both source-root marketplaces from the source checkout and prevent future source generation;
  - recognize `agdf@agdf-repo` for a validated runtime-complete generated repository or deliberate
    legacy recovery, and `.agdf-local-install.json` only during explicit owned reinstall;
  - never patch or delete an active host cache in place.
- public contract:
  - no breaking public CLI command or gate output is approved;
  - resolver fields are additive and local; exact stable reason compatibility is covered by TP.

## 7. Visible State Ownership

- installation, update, rollback and restart-required state: existing lifecycle result owner;
- installed marketplace and plugin state: existing general status/lifecycle owner;
- actual plugin root loaded for a new session: shared SessionStart hook invoking the existing
  surface-local resolver;
- OpenCode effective config-local state: existing OpenCode status owner;
- portable agent-native state: existing gate-check/runtime contract presentation;
- recovery action: existing surface installer command selected by the lifecycle/status owner.

No session-specific state file, duplicate status engine or host-specific product policy is needed.
The shared hook is compact and does not create a UI monolith risk.

## 8. Parallel Structure And Drift Assessment

- parallel runtime risk: controlled by one generated payload and one shared provenance helper;
- per-skill runtime risk: explicitly prohibited and unnecessary because every installed skill can
  resolve the enclosing plugin runtime;
- installer duplication risk: controlled by extending `local-marketplace.js` and existing host
  installers only;
- status duplication risk: controlled by projecting evidence through existing lifecycle/status and
  SessionStart owners;
- current SoT drift: both source-root marketplaces claim installability from runtime-free `./plugin`;
- drift resolution: delete both active source projections, retain generated runtime-complete
  `agdf-repo` composition, and keep incomplete legacy recognition only as recovery input.

No unresolved product-semantics, authority, persistence, security or cross-host cutover decision has
appeared since SD approval.

## 9. Regression And Evidence Impact

Required regression owners are already present:

- `local-validator-test.js`
- `local-marketplace-test.js`
- `local-development-install-test.js`
- `lifecycle-test.js`
- `runtime-integrity-layout-test.js`
- `runtime-integrity-negative-test.js`
- `public-plugin-test.js`
- `opencode-hardening-test.js`
- `package-build-test.js`
- `package-contents-test.js`
- aggregate `smoke-test`

Focused host-root fixtures belong beside the existing local validator, marketplace, lifecycle and
hook tests rather than in a new harness. Direct Codex and Claude Code observations remain external
evidence obligations and cannot be replaced by these fixtures.

## 10. Risks And Missing Evidence

- risks:
  - the shared helper could become too broad; keep it limited to pure profile/provenance evaluation
    and deterministic digest operations;
  - SessionStart output could become noisy or suppress governance instructions; enforce one compact
    line and failure isolation;
  - removal of repository marketplace discovery could regress contributor expectations; preserve
    explicit install commands and fresh-clone documentation/tests;
  - migration compatibility could accidentally authorize arbitrary legacy markers; require exact
    owner, kind, version and digest evidence;
  - changing resolver JSON could break consumers if existing fields or values change; additive only.
- missing_evidence:
  - implementation and test results;
  - direct current Codex loaded-cache proof;
  - direct Claude Code plugin-root proof;
  - post-change OpenCode and portable evidence;
  - Context Graph reconciliation.

The previously blocking root `.claude-plugin/marketplace.json` path is now explicitly covered by
approved SD revision 2 and TP revision 2. No additional executable owner, public contract, host
permission boundary or parallel runtime is required. Implementation and test evidence remain open.

## 11. Context Graph And Knowledge Persistence

- context_graph_impact: update_existing_node
- context_graph_refs: existing runtime distribution, local plugin installation and cross-host
  surface nodes; exact node IDs remain to be selected before closeout
- context_graph_reconciliation: open_gap
- context_graph_required_action: update
- context_graph_gate_effect: warning
- context_graph_evidence: The reusable invariant is confirmed: source, generated bundle, registered
  marketplace, installed root/cache and fresh loaded session are different evidence planes, while
  runtime and provenance semantics have one operational owner.
- memory_target: context_graph
- memory_reason: This source/provenance/evidence-plane boundary is reusable for every plugin release
  and host adapter.
- memory_refs: approved UR, PRD, SD and TP plus this analysis.

## 12. Decision

- decision: pass
- current_coverage: existing runtime, build, marketplace, lifecycle, status, hook, portable and test
  owners are sufficient; only one focused shared helper is new
- reuse_strategy: extend and narrowly refactor existing owners; remove the contradictory root
  marketplaces; no parallel runtime or installer
- required_next_step: Resume CD+Tests within TP revision 2, beginning with completion of source-root
  removal, shared provenance tests and the existing owner integrations. Real host mutation remains
  outside this implementation step.
