# Task/Test Plan: OpenCode Surface Hardening and Evaluator Parity

Status: approved
Gate: TP
Revision: 2
Date: 2026-07-23
Derived from: `.agdf/control/artefacts/opencode-surface-hardening-parity/SD.md`
Gate approval: Exact `Approval: TP` accepted on 2026-07-23 for revision 2 after same-run,
same-revision and durable-artefact revalidation.

## Delivery Boundary

Implement the approved OpenCode structured slice only. Do not change gate order, approval values,
the Interaction Contract, shared search/scoring semantics, Candidate Generation availability,
user-owned OpenCode permission decisions, release state or VCS state.

Automatic SDK alignment is confined to the explicit `opencode` install lifecycle, targets only the
exact validated host version and must not make `opencode-status` mutating.

Implementation starts only after exact TP approval and a passing
`pre_implementation_analysis` Brownfield Analysis.

## Ordered Tasks

### OHP-01 — Generalize installed-package resolution

- Requirements: PRD-OC-01, PRD-OC-03; SD-01
- Paths:
  - `create-agdf/lib/installers/opencode.js`
  - focused unit/smoke fixtures under `create-agdf/scripts/`
- Work:
  1. Extract a bounded config-directory package resolver.
  2. Locate the exact matching package manifest without registry access.
  3. Preserve the existing `create-agdf` status result while adding SDK resolution evidence.
  4. Return typed uninspectable errors instead of throwing status evaluation.
- Acceptance:
  - package entry, manifest, root and version are correct for root and `dist/` entries;
  - mismatched, missing and malformed manifests fail closed;
  - current AGDF package version tests remain green.
- Tests:
  - new focused resolver unit cases;
  - existing OpenCode version-status smoke cases.

### OHP-02 — Add host, SDK, hook and divergence status evidence

- Requirements: PRD-OC-01, PRD-OC-02, PRD-OC-03; SD-02, SD-03
- Paths:
  - `create-agdf/lib/installers/opencode.js`
  - `create-agdf/lib/cli/application.js` only if dependency injection is required
  - `create-agdf/scripts/smoke-test.js`
- Work:
  1. Probe the OpenCode host version without a shell.
  2. Resolve the SDK declaration entry and exact two hook names.
  3. Add the approved additive JSON fields and human output.
  4. Add warning-only host/SDK divergence to read-only status evaluation and expose the observed
     post-install result without performing alignment from status.
  5. Preserve installation, activation and session evidence separation.
- Acceptance:
  - both present, one missing, both missing and uninspectable fixtures produce stable states;
  - `live_invocation_observed` remains false without independent runtime evidence;
  - 1.18.3/1.17.11 is visible as divergent and status inspection modifies no package;
  - existing schema-v1 fields and next actions remain compatible.
- Tests:
  - fixture matrix in smoke/focused tests;
  - JSON and human presentation assertions;
  - install result remains success/partial according to the approved warning/degradation policy.

### OHP-03 — Make static governance sufficient and hooks defensive

- Requirements: PRD-OC-04, PRD-OC-05; SD-04
- Paths:
  - `create-agdf/lib/installers/opencode.js`
  - `create-agdf/opencode-plugin.js`
  - `create-agdf/scripts/sync-package-assets.js`
  - `create-agdf/scripts/lifecycle-test.js`
  - applicable deterministic skill-eval fixtures/fingerprints
- Work:
  1. Add the approved minimum governance invariants to the single global-instruction owner.
  2. Reuse one active/inactive reminder builder in both hooks.
  3. Guard null, missing and non-array output containers without throwing.
  4. Log bounded degradation evidence when a dynamic hook cannot append.
  5. Keep dynamic guidance subordinate to static instructions.
- Acceptance:
  - static instructions alone require activation, gate-check-first routing, exact approvals and
    version-matched local validation;
  - hook-absent evaluations stay fail-closed;
  - active/inactive and malformed-output hook fixtures do not crash;
  - no skill-local duplicate policy is introduced.
- Tests:
  - lifecycle tests for both hooks and malformed shapes;
  - deterministic skill evals with dynamic hook context absent;
  - Runtime Integrity assertions for the canonical static owner.

### OHP-04 — Install and protect the owned evaluator agent

- Requirements: PRD-OC-06, PRD-OC-11; SD-05
- Paths:
  - `plugin/meta/agdf-plugin.definition.json` if used as the descriptor owner
  - `create-agdf/lib/installers/opencode.js`
  - `create-agdf/lib/lifecycle/operations.js`
  - `create-agdf/scripts/sync-package-assets.js`
  - lifecycle/smoke tests
- Work:
  1. Define and install `agents/agdf-evaluator.md` with an ownership marker.
  2. Add it to global surface completeness and status evidence.
  3. Refuse unowned collision before any mutation.
  4. Preserve all unrelated agents and explicit permissions.
  5. Add ownership-validated uninstall behavior.
- Acceptance:
  - clean install, repeat install, owned update, unowned collision and uninstall are deterministic;
  - collision leaves config and package state unchanged;
  - user-owned agents and permissions remain untouched.
- Tests:
  - focused lifecycle and smoke fixtures;
  - package contents and prepack assertions.

### OHP-05 — Add invocation-scoped permission profile and preflight

- Requirements: PRD-OC-07, PRD-OC-11; SD-06, SD-07
- Paths:
  - new `create-agdf/lib/delivery-path-search/evaluators/opencode.js`
  - optional focused helper beside that adapter
  - focused evaluator unit test
- Work:
  1. Build the exact approved deny profile and serialize it only into the child environment.
  2. Reject `--auto`.
  3. Check version, required run flags, owned agent discovery and effective terminal denies.
  4. Return typed evidence or one approved preflight failure code.
  5. Keep evidence invocation-local and uncached.
- Acceptance:
  - preflight succeeds only with all required flags, owned agent and provable deny profile;
  - later `allow`/`ask` for mutation-capable tools fails preflight;
  - the parent environment and OpenCode configuration remain unchanged;
  - repeated calls perform independent preflights.
- Tests:
  - fake executable transcripts for success and every preflight failure;
  - environment overlay and no-`--auto` assertions;
  - stale-evidence rejection.

### OHP-06 — Implement the conforming OpenCode evaluator

- Requirements: PRD-OC-06, PRD-OC-07, PRD-OC-09; SD-08
- Paths:
  - `create-agdf/lib/delivery-path-search/evaluators/opencode.js`
  - Codex/Claude evaluator modules only for shared prompt-builder extraction
  - `create-agdf/lib/delivery-path-search/transports/read-only-guard.js` only for generic evaluator
    failure codes without weakening generator behavior
  - focused evaluator/contract tests
- Work:
  1. Extract one evaluator prompt builder without semantic changes.
  2. Run the approved `opencode run --pure --agent agdf-evaluator --format json --dir` command.
  3. Parse exactly one final assistant payload from the JSON event stream.
  4. Validate through the existing evaluator contract.
  5. Preserve mutation checks after success and failure.
  6. Map authentication, timeout, invalid output and mutation failures.
- Acceptance:
  - the shared fixture produces the same validated evaluation shape as existing adapters;
  - malformed/multiple/missing final payloads fail;
  - timeout and authentication are distinguishable;
  - mutation is a hard failure on success and error paths;
  - Codex and Claude command/prompt behavior remains equivalent.
- Tests:
  - shared evaluator contract fixture;
  - event-stream parser matrix;
  - mutation/timeout/auth/error fixtures;
  - existing Codex/Claude focused tests unchanged in meaning.

### OHP-07 — Wire conditional enforcement and typed CLI fallback

- Requirements: PRD-OC-07, PRD-OC-08, PRD-OC-10, PRD-OC-12; SD-09, SD-10
- Paths:
  - `create-agdf/lib/delivery-path-search/surfaces/capabilities.js`
  - `create-agdf/lib/cli/delivery-path-search-command.js`
  - `create-agdf/lib/cli/command-registry.js`
  - `create-agdf/lib/cli/validation-handlers.js`
  - CLI/unit tests
- Work:
  1. Add OpenCode CLI examples without adding generator examples.
  2. Validate OpenCode preflight evidence before constructing `tool_enforced` input.
  3. Dispatch the new adapter only after successful preflight.
  4. Emit the approved `evaluator_unavailable` result, no recommendation and exit `2` on failure.
  5. Forbid persistence of degraded output as a search result.
  6. Keep baseline OpenCode capability `instruction_only`.
- Acceptance:
  - success reaches the unchanged search core with validated `tool_enforced` evidence;
  - failed preflight never calls the search core and never emits a recommendation;
  - mutation failure forbids instruction-only execution fallback;
  - arbitrary evidence strings cannot upgrade enforcement;
  - `--generate-candidates --surface opencode` remains rejected.
- Tests:
  - handler exit-code and JSON/human output cases;
  - no-search-call/no-persistence spies;
  - existing surface capability unit matrix plus conditional OpenCode cases.

### OHP-08 — Synchronize capability truth and documentation

- Requirements: PRD-OC-02, PRD-OC-03, PRD-OC-10, PRD-OC-12; SD-10
- Paths:
  - `INSTALL.md`
  - `create-agdf/README.md`
  - `agdf/README.md` where applicable
  - `pages/src/data/site.ts`
  - `pages/src/pages/index.astro`
  - `plugin/meta/contracts/control-scaffold.md` only if the stable capability contract needs an
    additive clarification
  - `plugin/scripts/check-runtime-integrity.mjs`
  - generated copies via sync scripts
- Work:
  1. Describe baseline `instruction_only` versus invocation-scoped `tool_enforced`.
  2. Explain SDK declaration versus live invocation evidence.
  3. Document read-only warning-only version divergence, exact install-time SDK alignment and
     stop-then-instruction-only evaluator recovery.
  4. Keep OpenCode Candidate Generation unavailable.
  5. Synchronize derived surfaces from canonical owners.
- Acceptance:
  - all capability matrices and prose agree;
  - no page claims unconditional OpenCode tool enforcement;
  - generated assets are byte-aligned through existing sync flows;
  - no installed cache is edited.
- Tests:
  - Runtime Integrity;
  - focused copy assertions;
  - Pages check/build.

### OHP-09 — Run regression and package verification

- Requirements: all deterministic PRD acceptance criteria
- Work:
  1. Run focused tests after each owner change.
  2. Run the complete `create-agdf` smoke suite.
  3. Run source-mode Runtime Integrity and negative integrity tests.
  4. Verify package contents/build and generated synchronization.
  5. Run Pages checks/build.
  6. Run selected-run `doctor` and `gate-check`.
- Required commands:
  - `npm --prefix create-agdf run test:lifecycle`
  - `npm --prefix create-agdf run test:delivery-path-search`
  - `npm --prefix create-agdf run test:delivery-path-search-unit`
  - the new focused OpenCode evaluator/status test command
  - `npm --prefix create-agdf run smoke-test`
  - `node plugin/scripts/check-runtime-integrity.mjs`
  - `npm --prefix pages run check`
  - `npm --prefix pages run build`
  - `git diff --check`
- Acceptance:
  - all required deterministic tests pass;
  - no assertion is skipped or weakened to obtain a pass;
  - Candidate Generation tests retain existing Codex/Claude-only behavior.

### OHP-10 — Capture real installed-SDK and evaluator evidence

- Requirements: PRD Evidence Obligations; AC-02, AC-06, AC-09
- Preconditions:
  - deterministic implementation and reviews are green;
  - an authenticated OpenCode provider/model is available;
  - invocation is bounded and uses the approved deny profile.
- Work:
  1. Run `opencode-status --json` against the installed OpenCode config and capture host, SDK, hook
    declaration and divergence evidence.
  2. Run one bounded `delivery-path-search --surface opencode --json` invocation.
  3. Capture preflight evidence, enforcement level, evaluator metadata, duration and zero-mutation
    proof.
  4. Run a second preflight or deterministic probe showing stale evidence is not reused.
  5. Record unavailable/authentication limitations honestly if the live probe cannot run.
- Acceptance:
  - only a successful real invocation may support a live `tool_enforced` claim;
  - fixture evidence alone cannot satisfy this task;
  - a missing live probe remains explicit QA evidence debt rather than being silently converted to
    pass;
  - no VCS, release or publish action occurs.

### OHP-11 — Add fail-safe exact-version SDK alignment to OpenCode install

- Requirements: PRD-OC-03, PRD-OC-13; SD-03, SD-11; AC-02, AC-13, AC-14
- Depends on: OHP-01, OHP-02
- Paths:
  - `create-agdf/lib/installers/opencode.js`
  - `create-agdf/lib/cli/application.js`
  - `create-agdf/scripts/opencode-hardening-test.js`
  - `create-agdf/scripts/lifecycle-test.js`
  - `create-agdf/scripts/smoke-test.js` only for end-to-end lifecycle assertions
- Work:
  1. Add exact host-version validation and the typed `sdk_alignment` result envelope to the existing
     OpenCode installer owner.
  2. Return `already_matching` without registry or install calls when host and SDK already match.
  3. Return `not_attempted` without SDK mutation when host/SDK evidence or the exact host version is
     uninspectable.
  4. For proven divergence, resolve only
     `@opencode-ai/plugin@<exact-validated-host-version>` through the configured npm invocation.
  5. Install the exact package with scripts, audit, funding output, shell and prompts disabled; do
     not target `latest`, a range or another version.
  6. Re-probe installed SDK version and hook declarations after success and failure.
  7. Report `aligned` only for an exact observed match with both required declarations; otherwise
     return `unavailable | failed | verification_failed` with previous, target and observed final
     versions plus one repair/retry action.
  8. Map unresolved alignment to an existing partial/degraded lifecycle result and keep
     `opencode-status` read-only.
- Acceptance:
  - already-matching performs no registry or SDK-install invocation;
  - 1.18.3/1.17.11 targets exactly `@opencode-ai/plugin@1.18.3`, post-verifies 1.18.3 and reports
    `aligned`;
  - invalid/uninspectable host output, absent exact registry version, npm failure, version mismatch
    after install and missing hook declarations never report healthy alignment;
  - failure output exposes the observed final versions and exactly one recovery action;
  - OpenCode host, unrelated dependencies, permissions and status inspection remain unchanged;
  - execution is deterministic without a TTY and never uses a shell or package lifecycle scripts.
- Tests:
  - injected npm/host/resolver transcript matrix covering every alignment state;
  - argument assertions for exact package specifier, `--save-exact`, `--ignore-scripts`,
    `--no-audit`, `--no-fund` and absence of `latest`, ranges or prompt flags;
  - no-call assertions for matching and uninspectable cases;
  - post-probe and partial lifecycle JSON/human presentation assertions;
  - regression assertion that `opencode-status` performs no registry or install invocation.

## Requirement Coverage

| Requirement | Tasks |
|---|---|
| PRD-OC-01 | OHP-01, OHP-02 |
| PRD-OC-02 | OHP-02, OHP-08 |
| PRD-OC-03 | OHP-01, OHP-02, OHP-08 |
| PRD-OC-04 | OHP-03 |
| PRD-OC-05 | OHP-03 |
| PRD-OC-06 | OHP-04, OHP-06 |
| PRD-OC-07 | OHP-05, OHP-06, OHP-07 |
| PRD-OC-08 | OHP-07 |
| PRD-OC-09 | OHP-06, OHP-07 |
| PRD-OC-10 | OHP-07, OHP-08 |
| PRD-OC-11 | OHP-04, OHP-05 |
| PRD-OC-12 | OHP-07, OHP-08, OHP-09 |
| PRD-OC-13 | OHP-11 |

## UX Intent Fidelity Plan

| PRD criterion | Working mode/state | Task | Required visible evidence |
|---|---|---|---|
| Declaration evidence is not live proof | Status inspection | OHP-02, OHP-08 | JSON/human status and docs show `sdk_declaration` evidence and no live claim. |
| Versions stay separate and warning-only | Status inspection | OHP-02, OHP-11 | Host, SDK and AGDF versions plus divergence warning; status performs no mutation. |
| Install repairs resolvable drift safely | OpenCode installation | OHP-11 | Matching no-op, exact aligned success and typed unavailable/failed/post-verification fixtures with one recovery action. |
| Static guidance remains fail-closed | Active plugin guidance | OHP-03 | Hook-absent skill eval and static instruction fixture. |
| `tool_enforced` is invocation-scoped | Executable evaluator | OHP-05, OHP-07, OHP-10 | Current preflight evidence and stale-evidence rejection. |
| Failure stops executable evaluation | Degraded recovery | OHP-07 | Typed result, null recommendation, exit `2`, instruction-only next action. |
| Mutation is a hard failure | Degraded recovery | OHP-06, OHP-07 | Mutation failure with no fallback execution. |

## Review And QA Obligations

After implementation:

1. `agdf:task-plan-review` maps OHP-01 through OHP-11 to code, tests and visible evidence.
2. `agdf:clean-implementation-review` verifies one status owner, one instruction owner, one
   evaluator adapter and no scoring/policy fork.
3. `agdf:code-review` reviews the complete diff, permission handling, parser trust boundaries,
   subprocess safety, collision handling and regression risk.
4. `agdf:qa-gate` requires all applicable deterministic evidence and treats missing OHP-10 live
   evidence as an explicit revise condition unless the approved plan is revised.

## Stop And Escalation Conditions

Stop and route back to SD or PRD if implementation discovers:

- `--pure` cannot load an ownership-proven evaluator agent without unsafe configuration mutation;
- effective deny permissions cannot be proven from stable OpenCode mechanisms;
- SDK alignment requires `latest`, a range, shell interpolation, package lifecycle scripts, a TTY,
  status mutation, host modification or a second package owner;
- OpenCode event output cannot identify a deterministic final assistant payload;
- shared search/scoring or gate semantics must change;
- Candidate Generation must be added;
- user-owned permissions or agents would need to be overwritten.

## Completion Evidence

The implementation phase is complete only when OHP-01 through OHP-09 and OHP-11 are fully evidenced
and OHP-10 has either successful real evidence or an explicit unresolved QA evidence gap.
Completion does not authorize QA, UAT, release or VCS actions.
