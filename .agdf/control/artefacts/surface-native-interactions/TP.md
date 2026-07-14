# TP: Surface-Native AGDF Interactions

Status: approved
Gate: TP
Gate approval: `Approval: TP` recorded on 2026-07-14
Based on: `.agdf/control/artefacts/surface-native-interactions/SD.md`
Date: 2026-07-14
Owner: AGDF

## 1. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| SNI-01 | Add the normative Native Interaction Contract and semantic envelope to `plugin/meta/agdf-runtime-contract.md`, including the three interaction kinds, deliberate-user-input rule, no-auto-resolution invariant, revalidation boundary and text fallback. | AC-01, AC-02, AC-05, AC-09, AC-11–AC-13, AC-15–AC-17 | Runtime Contract diff plus deterministic integrity assertions for every normative invariant. |
| SNI-02 | Extend `plugin/skills/gate-check/SKILL.md` with the decision-point trigger policy, exactly-one-run readiness check, native-question selection, exact approval option, revise/cancel outcomes, free-form validation and post-response revalidation. | AC-03–AC-10, AC-13, AC-15, AC-16 | Skill diff and negative/positive assertions showing routine inspection does not prompt and non-ready/stale responses fail closed. |
| SNI-03 | Extend `plugin/meta/agdf-plugin.definition.json` with canonical capability metadata for Codex, Claude Code, OpenCode and fallback without duplicating gate policy. | AC-02, AC-14, AC-15, AC-18 | Schema-valid canonical definition diff and integrity checks proving all four mappings are present. |
| SNI-04 | Extend `create-agdf/scripts/sync-package-assets.js` so canonical interaction guidance and surface mappings propagate to generated Codex, Claude Code, OpenCode and generic/fallback assets. | AC-14, AC-15, AC-18 | Sync output diff and generated-surface assertions with no independent generated-file edits. |
| SNI-05 | Update the OpenCode config generation and merge path in `create-agdf/bin/create-agdf.js` so missing `permission.question` receives the owned default `allow`, while explicit user `allow` or `deny` remains unchanged. | AC-11, AC-14, AC-15 | Fixtures for missing, existing-allow and explicit-deny configurations; explicit-deny path proves textual fallback remains available. |
| SNI-06 | Add canonical integrity rules in `plugin/scripts/check-runtime-integrity.mjs` for the interaction contract, gate-check behavior, capability metadata, surface mappings and the prohibition on treating host permissions or plan approval as AGDF authority. | AC-01–AC-18 | Passing runtime-integrity check plus one controlled negative fixture or assertion per drift-sensitive owner. |
| SNI-07 | Extend `create-agdf/scripts/smoke-test.js` or its focused fixtures to verify packaged Codex, Claude Code, OpenCode and generic/fallback output. | AC-14–AC-18 | Passing package smoke evidence showing the expected mapping and fallback on every generated surface. |
| SNI-08 | Add OpenCode regression coverage for generated config and merge behavior, including absent, allow and deny values and separation from technical auto/permission outcomes. | AC-11, AC-13–AC-15 | Passing focused fixtures demonstrating user-owned decisions are preserved and no permission result advances a gate. |
| SNI-09 | Add or extend control-state/gate regression tests for missing artefact, ambiguous run, wrong run, wrong gate, stale expected gate, generic consent, technical permission outcomes and plan approval. Preserve valid exact textual approval behavior. | AC-05–AC-13, AC-16, AC-17 | Passing deterministic tests with each rejection case named and a positive exact-text compatibility case. |
| SNI-10 | Update `INSTALL.md` and only the canonical Pages capability data/copy needed to prevent public drift, describing native controls as optional presentation enhancements with deterministic fallback and honest enforcement labels. | AC-14–AC-16 | Documentation diff, link/content checks and confirmation that no host-owned UI is claimed as AGDF enforcement. |
| SNI-11 | Synchronize all generated package assets from their canonical owners and verify there are no hand-maintained parallel policies or unsynchronized mirrors. | AC-18 | Clean post-sync regeneration check and reviewed diff limited to canonical sources plus expected generated outputs. |
| SNI-12 | Record the approved reusable Context Graph invariant: host permission, plan approval and native question presentation are not AGDF gate authority; only validated deliberate user input may be persisted. | AC-11–AC-17 | Context Graph node/relationship diff linked to this delivery without copying version-specific surface schemas. |
| SNI-13 | Run focused and aggregate automated checks for runtime integrity, asset synchronization, routing, control-state transitions, package smoke and whitespace integrity. | AC-01–AC-18 | Command log with exit status for every required check and any limitation classified explicitly. |
| SNI-14 | Run bounded supporting probes on available authenticated Codex, Claude Code and OpenCode surfaces, checking native question presentation and separation from permission/plan outcomes without changing gate state automatically. | AC-06, AC-09, AC-11–AC-16 | Per-surface observation labelled supporting evidence; unavailable authentication or host capability is disclosed and does not replace deterministic evidence. |
| SNI-15 | Reconcile implementation against every task and AC, document deviations, and prepare the mandatory Task Plan Review, Clean Implementation Review and Code Review inputs before QA. | AC-01–AC-18 | Complete task-to-diff-to-test evidence map with no unexplained AC or file-scope gap. |

## 2. Test Plan

### Required deterministic checks

1. Run `npm --prefix create-agdf run sync-package-assets` and verify a second run produces no additional diff.
2. Run `node plugin/scripts/check-runtime-integrity.mjs`.
3. Run `npm --prefix create-agdf run test:control-state` for current-run, wrong-run, wrong-gate, stale-state, missing-artefact and exact-text compatibility cases.
4. Run `npm --prefix create-agdf run test:routing` to ensure interaction guidance remains discoverable through canonical routing.
5. Run `npm --prefix create-agdf run smoke-test` for generated package/configuration coverage.
6. Run focused OpenCode merge fixtures for missing, explicit-allow and explicit-deny `permission.question` values.
7. Run `git diff --check`.

If an aggregate command is unavailable or fails for an unrelated pre-existing reason, preserve the output, run the smallest equivalent focused checks, and classify the gap honestly; do not convert missing evidence into a pass.

### Required behavioral assertions

- One selected ready run can present exactly one gate-specific question containing `Approval: <GateName>`.
- Revision and cancel/decline do not advance the gate.
- A free-form answer advances only when it exactly matches the current gate approval after revalidation.
- Missing artefact, ambiguous or wrong run, wrong gate and stale response remain blocked.
- Codex permission/app actions, Claude permission or `ExitPlanMode`, and OpenCode permission outcomes or auto mode never satisfy an AGDF gate.
- A native question timeout, default, hook-supplied answer or agent-to-agent message never carries user authority.
- Exact textual approval remains fully supported on all surfaces and is used whenever native interaction safety or availability is unknown.

### Supporting live evidence

- Codex: use the callable native short-question control without auto-resolution and verify the response is still revalidated before persistence.
- Claude Code: when an authenticated runtime is available, verify `AskUserQuestion` is used only without auto-continue authority; otherwise document the textual fallback branch.
- OpenCode: when available, verify `question` presentation and that explicit `permission.question: deny` or technical auto mode cannot become gate approval.

Live probes support but do not replace deterministic contract, generation and control-state tests.

## 3. Brownfield Scope

Before implementation, inspect and confirm the current owners and their generated consumers:

- `plugin/meta/agdf-runtime-contract.md`
- `plugin/skills/gate-check/SKILL.md`
- `plugin/meta/agdf-plugin.definition.json`
- `plugin/meta/agdf-agent-router.md`
- `create-agdf/scripts/sync-package-assets.js`
- `create-agdf/bin/create-agdf.js`, especially OpenCode config creation and merge behavior
- `plugin/scripts/check-runtime-integrity.mjs`
- `create-agdf/scripts/smoke-test.js` and focused control-state/routing tests
- canonical and generated Codex, Claude Code, OpenCode and generic/fallback assets
- `INSTALL.md` and canonical Pages capability data/copy
- the existing Context Graph owner and relevant approval-authority invariants

The post-TP Brownfield Analysis must confirm exact modification points, existing fixture owners, generated-file boundaries and any dirty-worktree overlap before code changes begin.

## 4. Out Of Scope

- New AGDF CLI commands or parameters.
- A custom UI, approval service, persistence layer, MCP server or dedicated interaction skill.
- Hook-supplied, defaulted, timed-out or agent-generated gate approval.
- Treating command/file/network permission, OpenCode auto mode, Claude plan approval or any host permission result as an AGDF gate.
- Non-interactive Claude `defer`/resume integration or a separate trusted external approval UI.
- Making native controls mandatory for correctness or removing exact textual approvals.
- Independent edits to generated files or user-owned permission settings.
- Expanding native structured interaction to unsupported surfaces beyond the universal text fallback.

## 5. Risks And Blockers

| Risk or blocker | Required handling |
|---|---|
| Host tool name or schema drift | Runtime integrity must expose drift while textual fallback remains usable. |
| Unsafe or unobservable timeout behavior | Block native gate interaction for that branch and use exact text. |
| User-owned OpenCode `question` denial | Preserve the denial and prove fallback; do not overwrite it. |
| Response races with changed run state | Revalidate the same run and expected gate immediately before persistence. |
| Prompt fatigue or repeated non-ready prompts | Treat as a revise-level defect in gate-check trigger policy and negative tests. |
| Any route that equates technical permission or plan approval with an AGDF gate | Treat as a block-level security/correctness defect. |
| Missing deterministic evidence for a surface mapping | QA cannot pass that AC based on a live probe or documentation alone. |
| Dirty-worktree overlap in canonical/generated owners | Brownfield Analysis must isolate or stop before implementation. |

## 6. Next Step

TP was approved with exact post-artefact evidence on 2026-07-14. Complete the required pre-implementation Brownfield Analysis before beginning CD+Tests.
