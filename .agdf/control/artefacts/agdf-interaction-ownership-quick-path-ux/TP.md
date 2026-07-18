# Task and Test Plan: Lean Interaction Ownership and Local Validation

Status: approved
Gate: TP
Date: 2026-07-18
Derived from: approved `SD.md`
Gate approval: `Approval: TP` provided on 2026-07-18 after same-run, same-gate, revision-12 and
durable-artefact revalidation.
Approval readiness: approved; every approved requirement is mapped to an implementation task and
deterministic evidence. Implementation remains forbidden until the required pre-implementation
Brownfield Analysis passes.

## 1. Scope

Implement the approved Structured Delivery through existing AGDF owners. Preserve gate authority,
persisted mode enums, user-owned configuration and the single `create-agdf/cli` evaluator. Generated
assets may be refreshed only through their canonical synchronization flow. No host installation,
registry publication, commit, push or PR action is part of this plan.

## 2. Task Plan

| task_id | Task | Primary owners | Acceptance mapping | Required evidence |
|---|---|---|---|---|
| LIR-01 | Consolidate complete native-interaction, locale, waiting, outcome and fallback semantics in the focused interaction contract; reduce gate-check to its six approved orchestration responsibilities and focused references. | `plugin/meta/contracts/interaction.md`; `plugin/skills/gate-check/SKILL.md` | PRD-01, AC-01 | Contract/skill diff plus ownership-oriented positive and negative integrity results. |
| LIR-02 | Replace integrity assertions that require duplicated interaction prose with assertions for the normative owner, focused references and each required gate-check orchestration boundary. | `plugin/scripts/check-runtime-integrity.mjs`; `create-agdf/scripts/runtime-integrity-negative-test.js`; interaction tests | AC-01, AC-04 | Each independently removed boundary fails; removing duplicated policy wording alone does not fail. |
| LIR-03 | Make completed Brownfield Review persist Mode/Slice selection, reason, evidence and required depth atomically; retain incomplete Mode/Slice Decision only as fail-closed recovery. | `create-agdf/lib/control-state/`; Brownfield/control evaluation and presentation owners; focused contracts | PRD-02, AC-02 | Completed, interrupted and legacy fixtures prove atomic normal flow and blocking recovery. |
| LIR-04 | Add the human presentation mapping from post-UR `quick_task` to Compact Delivery and correct immediate post-UR narration without changing stored or JSON enum values. | `plugin/meta/contracts/modes.md`; `gate-transition.md`; interaction presentation/control-state modules and locale registry if required | PRD-02, AC-02 | German/English presentation fixtures plus unchanged machine-output assertions. |
| LIR-05 | Split OpenCode full-boundary generation from the compact skill activation guard; emit the full boundary only in owned global `AGDF.md` while retaining nine guards and focused contract references. | `create-agdf/lib/installers/opencode.js`; generated OpenCode assets | PRD-03, AC-03 | Clean-install count and content checks: one full boundary, nine compact guards, all contract targets resolvable. |
| LIR-06 | Preserve OpenCode ownership, collision-safe names, instructions registration, permissions and unrelated user configuration while updating boundary generation and status evidence. | OpenCode installer/status helpers and smoke fixtures | AC-03, compatibility | Existing preservation, explicit-deny and incomplete-activation fixtures remain passing. |
| LIR-07 | Add a canonical CLI version query and a shared local-runtime resolver that verifies owned/configured candidates, emits the approved availability envelope and delegates argument vectors without interpreting control state. | `create-agdf/lib/cli/`; new focused runtime-resolution module; `agdf/bin/agdf.js` only as existing package delegate | PRD-04, AC-05 | Resolver unit tests cover every availability value, exact versions, safe argv handling and absence of evaluator logic. |
| LIR-08 | Generate a deterministic exact-version Codex/Claude full-plugin runtime payload and manifest from `create-agdf/cli`; add version/digest drift checks and installed-layout resolution. | canonical sync/prepack owner; `plugin/runtime/` derived output; plugin manifests/integrity checks as needed | PRD-04, AC-05 | Reproducible generation, manifest/digest parity, package-size evidence and clean installed-layout offline execution. |
| LIR-09 | Expose a stable OpenCode resolver entrypoint backed by the config-local pinned `create-agdf` package and report runtime availability independently in `opencode-status`. | OpenCode installer, lifecycle/status and global skill generator | PRD-04, AC-05 | Exact-match, mismatch, missing-package and legacy-compatibility fixtures; no PATH dependency. |
| LIR-10 | Classify instruction-only/repository-only surfaces as `external_required` or explicit `unavailable`; remove automatic `npx ...@latest` from routine skill validation while keeping it in explicit install/bootstrap/refresh guidance. | canonical skills/contracts, scaffolded surface guidance, CLI help/docs and sync outputs | PRD-04, AC-05 | Scoped source scan and generated-surface assertions distinguish routine from explicit lifecycle guidance. |
| LIR-11 | Synchronize all canonical derived surfaces and update SoT/Context Graph records for interaction authority, ceremony boundary and validator ownership. | `create-agdf/scripts/sync-package-assets.js`; `.agdf/control/SOT_REGISTRY.md`; `.agdf/control/CONTEXT_GRAPH.md` | AC-04, Context Graph | Sync produces no unexplained drift; referenced nodes reconcile with implementation evidence. |
| LIR-12 | Run focused and aggregate verification, record task-level CD+Tests evidence and preserve host-observation limits for UAT. | test owners and run artefacts | AC-01 through AC-05 | All test IDs below pass; failures are fixed or explicitly return to the relevant gate. |

## 3. Execution Order and Dependencies

1. Run the mandatory pre-implementation Brownfield Analysis and confirm exact module seams, generated
   ownership, current dirty-worktree boundaries and overlapping OpenCode-run files.
2. Implement LIR-01 through LIR-04 first so contract ownership and proportional behavior are stable
   before generated surfaces change.
3. Implement the resolver/version contract in LIR-07 before either surface packaging task.
4. Implement LIR-05/LIR-06 and LIR-08/LIR-09 against the stable contracts. These streams may proceed
   independently only where their files do not overlap.
5. Apply LIR-10 and LIR-11 once canonical source behavior is complete, then regenerate rather than
   hand-edit derived assets.
6. Complete LIR-12 and all reviews. Any new gate authority, persisted enum, package, public command or
   destructive migration returns to SD/TP review before proceeding.

The unrelated active `opencode-single-install-activation` run owns nearby OpenCode activation files.
Pre-implementation Brownfield Analysis must distinguish already-delivered changes from this run's
delta and must not overwrite or reattribute unrelated worktree changes.

## 4. Test Plan

| test_id | Covers | Required cases | Expected result |
|---|---|---|---|
| LIR-T01 | LIR-01, LIR-02 | Canonical interaction owner present; gate-check has six boundaries; remove each boundary/reference/owner independently; remove duplicated phrases | Positive integrity passes; every semantic deletion fails; prose deduplication is accepted. |
| LIR-T02 | LIR-03 | New completed Brownfield review, interrupted write, legacy record without selection, invalid evidence | Completed review persists routing atomically; incomplete states remain blocked without a new user approval. |
| LIR-T03 | LIR-04 | Ungated Quick Task, post-UR `quick_task`, all wider modes, German/English narration and JSON | Human labels are contextual; persisted/JSON `quick_task` remains unchanged; post-UR says no action now and preselects no next gate. |
| LIR-T04 | LIR-05, LIR-06 | Clean global OpenCode install, rerun, invalid activation, explicit `permission.question: deny`, unrelated instructions/skills | Exactly one full boundary and nine compact guards; all owned/user configuration and fail-closed behavior are preserved. |
| LIR-T05 | LIR-07 | Owned match, configured match, missing, external-required, mismatch, corrupt metadata, relative/malformed explicit path and argv metacharacters | Correct availability envelope; mismatch/corruption fail closed; invocation uses an argument vector and no shell interpolation. |
| LIR-T06 | LIR-08 | Clean Codex and Claude marketplace-layout fixtures, reproducible generation, manifest version/digest, tampered payload | Exact-version local runtime executes offline; tampering or drift blocks before validation. |
| LIR-T07 | LIR-09 | Clean OpenCode global install, package match/mismatch/missing, status separation and legacy local surface | Config-local package is used without PATH; status remains truthful and additive. |
| LIR-T08 | LIR-08, LIR-09 | Offline `doctor --json`, `gate-check --json`, `delivery-map --json` on all three full surfaces | Commands execute through the owned runtime with `registry_access: false`. |
| LIR-T09 | LIR-08 through LIR-10 | Rejecting `npx`, `npm` and network stubs during routine execution; explicit install/bootstrap/refresh copy | Routine checks neither install nor contact registry; lifecycle guidance remains available and explicitly initiated. |
| LIR-T10 | LIR-07, LIR-08 | Source scan, generated-runtime reproduction and transitive module inventory | `create-agdf/cli` is the only evaluator owner; plugin runtime contains only derived bytes and resolver/manifest code. |
| LIR-T11 | LIR-10, LIR-11 | Codex, Claude, Copilot, OpenCode and generic generated layouts plus focused references | Full surfaces resolve owned validator; instruction-only surfaces declare evidence boundary; generated references all resolve. |
| LIR-T12 | LIR-12 | Runtime Integrity positive/negative, control-state, interaction-presentation, lifecycle/OpenCode, skill evals, delivery-path tests, aggregate smoke and `git diff --check` | All applicable repository checks pass with no unexplained generated drift. |

## 5. Acceptance Traceability

| Acceptance criterion | Tasks | Tests |
|---|---|---|
| AC-01: Contract ownership | LIR-01, LIR-02 | LIR-T01 |
| AC-02: Proportional routing | LIR-03, LIR-04 | LIR-T02, LIR-T03 |
| AC-03: OpenCode boundary reduction | LIR-05, LIR-06 | LIR-T04 |
| AC-04: Regression evidence | LIR-02, LIR-04, LIR-06, LIR-11, LIR-12 | LIR-T01 through LIR-T04, LIR-T11, LIR-T12 |
| AC-05: Local validator availability | LIR-07 through LIR-10, LIR-12 | LIR-T05 through LIR-T10, LIR-T12 |

## 6. Safety and Regression Constraints

- Never infer approval from native presentation, tool permission, plan mode or validator output.
- Do not rename persisted modes or change exact approval values.
- Do not introduce an evaluator, gate table or command-policy copy outside `create-agdf`.
- Do not execute a mismatched or digest-invalid local runtime and do not silently fall back to PATH,
  `npx`, package installation or network access.
- Do not require a target repository to be a Node project or contain `node_modules`.
- Do not overwrite explicit OpenCode permissions or unrelated user configuration.
- Do not hand-edit generated Codex, Copilot or OpenCode outputs.
- Do not claim authenticated host behavior from fixtures; preserve direct UAT as separate evidence.
- Preserve unrelated worktree changes and the scope of the active OpenCode activation run.

## 7. Review and Evidence Sequence

After implementation and focused tests:

1. record CD+Tests evidence by `task_id` and `test_id`;
2. run Task Plan Review;
3. run Clean Implementation Review;
4. run Code Review;
5. run QA Gate and produce the QA report;
6. request the next exact approval only when its durable artefact and gate projection are ready; and
7. keep live Codex/Claude/OpenCode UAT evidence distinct from repository conformance.

## 8. Next Step

Request exact `Approval: TP`. After approval, run the mandatory pre-implementation Brownfield Analysis.
No user action is required during that internal analysis, and implementation remains forbidden until
it passes.
