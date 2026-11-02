# CD+Tests: Surface-Native AGDF Interactions

Status: done
Gate: CD+Tests
Based on: approved `TP.md` and passed `BROWNFIELD_ANALYSIS.md`
Date: 2026-07-14
Owner: AGDF

## Delivered Behavior

- Added one canonical Native Interaction Contract with `clarification`, `tool_permission` and `gate_approval` semantics, a provider-neutral envelope, deliberate-user-input requirements, exact-text fallback and same-run/same-gate revalidation before persistence.
- Extended the canonical gate-check skill with decision-point triggering, readiness checks, one-question gate presentation and explicit Codex, Claude Code, OpenCode and fallback behavior.
- Added canonical surface adapter metadata and OpenCode `permission.question: allow` to the plugin definition.
- Extended OpenCode generation and global installation so a missing question permission receives the AGDF default while explicit user `allow` or `deny` remains unchanged. Existing repository config protection and reviewed fragment behavior remain intact.
- Added deterministic runtime-integrity and package/config regressions for canonical mappings, generated OpenCode behavior and explicit question decisions.
- Updated install/package/Pages wording and added `CG-NATIVE-INTERACTION-AUTHORITY` without introducing custom UI, persistence, commands or parallel gate policy.

## Task Evidence

| task_id | Status | Implementation and evidence |
|---|---|---|
| SNI-01 | done | `plugin/meta/agdf-runtime-contract.md` owns the Native Interaction Contract and semantic envelope; runtime-integrity anchors pass. |
| SNI-02 | done | `plugin/skills/gate-check/SKILL.md` owns trigger, readiness, native/fallback and revalidation workflow; integrity assertions pass. |
| SNI-03 | done | `plugin/meta/agdf-plugin.definition.json` declares four adapter mappings and technical permission owners. |
| SNI-04 | done | Existing `sync-package-assets.js` propagation carries canonical contract/skill changes and emits OpenCode guidance; repeated sync is idempotent. |
| SNI-05 | done | `installOpenCodeGlobalPlugin` adds only missing `permission.question`; explicit allow/deny tests pass; existing repository config remains unmodified and receives a reviewed fragment. |
| SNI-06 | done | `check-runtime-integrity.mjs` validates interaction kinds, safety boundaries, surface metadata and gate-check clauses. |
| SNI-07 | done | Aggregate package smoke verifies generated repository surface, instructions, config and skills. |
| SNI-08 | done | Smoke fixtures cover missing question permission, explicit allow, explicit deny and existing repository config denial. |
| SNI-09 | done | Existing control-state/smoke fixtures prove ambiguous run, stale revision, missing artefacts and implicit consent fail closed; the new integrity contract proves permission/plan/timeout/hook outcomes are excluded. No native response parser or alternate state transition was introduced. |
| SNI-10 | done | `INSTALL.md`, `create-agdf/README.md` and the affected Pages runtime line describe native presentation, exact-text fallback and authority separation. |
| SNI-11 | done | Canonical assets synchronized repeatedly with identical source diff hash; no generated mirror was hand-edited. |
| SNI-12 | done | `.agdf/control/CONTEXT_GRAPH.md` contains `CG-NATIVE-INTERACTION-AUTHORITY`. |
| SNI-13 | done | All required focused and aggregate commands passed; see Test Evidence. |
| SNI-14 | done_with_disclosure | Runtime availability was inspected without mutation: Codex 0.142.4 is authenticated; Claude Code 2.1.193 is not authenticated; OpenCode 1.17.13 has configured credentials. Interactive native-question UI was not automated from the non-interactive shell. Current Codex execution used exact-text fallback. These are supporting observations only. |
| SNI-15 | done | This task-to-diff-to-test map and the persisted TP, clean implementation and code review artefacts provide complete pre-QA review input. |

## Test Evidence

| Check | Result | Evidence |
|---|---|---|
| JavaScript syntax | pass | `node --check` passed for CLI, smoke test and runtime-integrity validator. |
| Asset synchronization | pass | `npm --prefix create-agdf run sync-package-assets`; a repeated run preserved the same full diff SHA-256 `02acf653247b4e37b0359ee9fa63682e579e86827d73ebd680c081927058acd6`. |
| Runtime integrity | pass | `node plugin/scripts/check-runtime-integrity.mjs` → 9 skills and 15 control files checked. |
| Control-state tests | pass | `npm --prefix create-agdf run test:control-state`. |
| Routing tests | pass | `npm --prefix create-agdf run test:routing`. |
| Aggregate package smoke | pass | `npm --prefix create-agdf run smoke-test`, including Verified Change, negative integrity, Delivery Path Search, OpenCode config and generated-surface fixtures. |
| Pages diagnostics | pass | `npm --prefix pages run check` → 0 errors, 0 warnings, 0 hints. |
| Pages build | pass | `npm --prefix pages run build` → one static page built successfully. |
| Diff whitespace | pass | `git diff --check`. |
| AGDF doctor | pass | Re-run after the CD+Tests control-state update; no findings. |

## Surface Evidence Classification

- deterministic: Runtime Contract and gate-check integrity assertions; generated surface/config smoke fixtures; control-state regressions; asset idempotence.
- supporting: installed runtime versions/authentication state and the successful exact-text fallback in the current Codex run.
- not claimed: host UI enforcement of AGDF semantics, authenticated Claude native question behavior or automated interactive OpenCode question rendering.

## Deviations And Gaps

- No scope or design deviation.
- No new executable native-response parser was added because native controls are presentation adapters and existing canonical gate evaluation/persistence remains authoritative.
- Live interactive UI probes remain deliberately supporting and were not automated from a non-interactive test shell. This does not weaken deterministic acceptance evidence.

## Next Step

Run the mandatory Task Plan Review, Clean Implementation Review and Code Review. QA remains forbidden until all review findings are resolved and review artefacts are persisted.
