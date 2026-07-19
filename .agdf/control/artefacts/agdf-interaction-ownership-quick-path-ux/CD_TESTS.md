# Code Deliverables and Tests: Lean Interaction Ownership and Local Validation

Status: done
Date: 2026-07-18
Based on: approved `TP.md`

## Task Evidence

| task_id | status | implementation evidence | test evidence |
|---|---|---|---|
| LIR-01 | done | `interaction.md` remains normative; `gate-check/SKILL.md` retains six orchestration responsibilities only | interaction presentation and Runtime Integrity |
| LIR-02 | done | integrity checks assert owner/reference/boundaries instead of duplicated surface prose | positive integrity plus independent negative mutations |
| LIR-03 | done | Brownfield skill and transition contract require same-operation review/routing persistence; incomplete state is recovery only | completed, interrupted, invalid-evidence and legacy control-state fixtures |
| LIR-04 | done | `quick_task` persists unchanged while breadcrumb locale projection renders Compact Delivery/Kompakte Lieferung | control-state and interaction presentation fixtures |
| LIR-05 | done | OpenCode generator emits the full boundary once in `AGDF.md` and one compact guard per skill | clean-install count/content smoke |
| LIR-06 | done | existing ownership markers, collision-safe names, permissions and config preservation remain in the same installer | lifecycle and OpenCode smoke fixtures |
| LIR-07 | done | version query, shared validation handlers and fail-closed local resolver added | CLI modularization and local-validator cases |
| LIR-08 | done | deterministic 352 KB focused payload and digest manifest generated under `plugin/runtime/`; installer/lifecycle/scaffold modules excluded | byte-reproduction, digest/tamper and installed-layout integrity evidence |
| LIR-09 | done | OpenCode owned wrapper delegates to its exact config-local package; status reports availability separately | match, mismatch, missing package and command-execution smoke fixtures |
| LIR-10 | done | routine help, skills, hooks and docs use local validation; registry resolution remains lifecycle-only | scoped source assertions and aggregate smoke |
| LIR-11 | done | canonical sync propagates runtime and skills; SoT and three existing Context Graph nodes updated | deterministic sync and Runtime Integrity |
| LIR-12 | done | focused and aggregate evidence completed; live authenticated host behavior remains explicitly UAT-only | aggregate smoke, 27/27 deterministic skill evals and `git diff --check` |

## Test Evidence

| test_id | result | evidence |
|---|---|---|
| LIR-T01 | pass | `test:interaction-presentation`, positive Runtime Integrity, `test:runtime-integrity-negative` |
| LIR-T02 | pass | `test:control-state` atomic completed/interrupted/invalid/legacy routing cases |
| LIR-T03 | pass | `test:control-state` BT-03/BT-05 and unchanged `quick_task` value |
| LIR-T04 | pass | OpenCode aggregate smoke: one full boundary, nine guards, config/permission preservation |
| LIR-T05 | pass | `test:local-validator`: all availability states, corruption, path escape and literal argv metacharacters |
| LIR-T06 | pass | byte-reproducible generator, manifest digest probe, tamper rejection and installed-layout integrity |
| LIR-T07 | pass | OpenCode exact package status plus missing/mismatch/legacy smoke cases |
| LIR-T08 | pass | shared Codex/Claude plugin runtime executed doctor, gate-check and delivery-map with `registry_access: false`; OpenCode smoke executes the same three commands through its config-local wrapper |
| LIR-T09 | pass | help/README/source assertions reject routine `@latest`; lifecycle guidance remains explicit |
| LIR-T10 | pass | focused runtime excludes installers/lifecycle/scaffold; shared validation handlers remain the single command owner |
| LIR-T11 | pass | sync output, generated surface smoke and focused contract references pass |
| LIR-T12 | pass | `npm --prefix create-agdf run smoke-test`; Runtime Integrity; `git diff --check` |

## Evidence Boundary

- Repository fixtures and local runtime execution prove deterministic conformance and offline behavior.
- The 27/27 skill eval result is deterministic replay, not live host execution.
- No authenticated Codex, Claude or OpenCode UI behavior, registry publication or release was claimed.

## Result

- result: pass
- missing_evidence: direct authenticated host UAT only; it is not required for repository QA but remains required before host-behavior claims.
- required_next_step: complete TP, clean implementation and code reviews, then run `qa-gate`.

## QA Revision Evidence — 2026-07-19

| Finding | Implementation | Regression evidence | Result |
|---|---|---|---|
| Duplicate release-or rule number | Canonical rule 16 corrected in `plugin/skills/release-or/SKILL.md`; sync regenerates all surfaces | Runtime Integrity requires a sequential Rules section; negative mutation restores the duplicate and fails | pass |
| OpenCode module warning | Global surface owns `agdf/package.json` with `type: module`; preflight and status verify owner, surface and module type | Clean-install validator probe returns version-matched JSON with empty stderr; unowned package collision fails before mutation | pass |
| Missing canonical permissions | Installer fills missing `question`, `edit`, `bash` and skill defaults from `agdf-plugin.definition.json` | Clean/partial config fixtures receive defaults; explicit question/edit/bash and unrelated skill decisions remain unchanged | pass |

- aggregate_evidence: `npm --prefix create-agdf run smoke-test`; `npm --prefix agdf run smoke-test`;
  source Runtime Integrity; 27/27 deterministic skill evals; byte-identical package builds; 218-file
  package contents; `git diff --check`.
- evidence_boundary: the real global OpenCode installation was inspected but not mutated; refreshed
  installed-host behavior remains UAT evidence after a released package is installed.
- result: pass
- required_next_step: rerun TP, clean implementation and actual-diff reviews, then QA.

## UAT Revision Evidence — Deterministic Operational Status Presentation — 2026-07-19

| Requirement | Implementation | Regression evidence | Result |
|---|---|---|---|
| Single presentation owner | `interaction-presentation.js` renders additive immutable `status_presentation`; `status_card` remains unchanged | Direct renderer tests plus source/generated Runtime Integrity | pass |
| No agent reconstruction | Gate-check consumes `status_presentation.markdown` verbatim and no longer contains a table template | Positive assertion plus independent negative mutation | pass |
| CLI parity and fail-closed behavior | `--status-card` emits the canonical block; a missing projection returns exit status 2 | Blocked, ready-gate, internal-step, OR and missing-projection fixtures | pass |
| Compact intent | Chat card contains selected run/path, status, gate, current/forbidden authority, blocker, approval transition, next step and quality; raw evidence remains in JSON | German, English fallback, HTML/pipe escaping and no-audit-dump assertions | pass |
| Approval separation | Existing five-field `approval_presentation` remains a separate ready-gate-only projection | Approval identity/order/value-count tests remain green | pass |

- aggregate_evidence: full `create-agdf` smoke; full `@agdf/cli` smoke; 27/27 deterministic
  skill evaluations; Runtime Integrity positive/negative; byte-identical builds; 218-file package;
  canonical sync; `git diff --check`.
- evidence_boundary: the source CLI proves deterministic rendering; the installed 0.10.2 cache is
  intentionally unchanged and cannot evidence the unreleased additive field.
- result: pass
- required_next_step: refresh mandatory reviews and QA.
