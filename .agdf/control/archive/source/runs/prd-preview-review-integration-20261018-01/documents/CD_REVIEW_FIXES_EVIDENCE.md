# Verification after Code Review corrections

- decision: pass
- run_id: prd-preview-review-integration-20261018-01
- based_on: approved TP and current CD+Tests
- source_revision: b8533f68-7c56-48fc-aca2-11d443b3956b
- reviewed_at: 2026-10-19

This is fresh verification of implementation corrections made under the existing Code Review
permission. It supplements the earlier CD+Tests report without rewriting that report or claiming
a new gate approval. Approved UR, PRD, SD and TP bytes remain unchanged. The corrections address
existing requirements, resource bounds, error handling and visibility, not a changed product scope.

All new evidence is under `evidence/code-review/`; exact commands, exit codes and retained failures
are in `execution-index.json`. `reviewed-source.json` binds the inspected and tested source files.

| Verification | Observed result | Evidence |
|---|---|---|
| Four preview programs | pass: material bounds, parser/static closure, actual approval/history/races, source/session/Inspect and expiry | preview-final.log |
| Resource regressions | pass: imported stylesheet images, distinct inline styles, bounded acyclic expansion and exact 2 MiB output boundary | preview-final.log |
| Document, material-decision, action and QA compatibility | four programs pass, including actual opposed text/App processes | core-regressions.log |
| UI component suite and TypeScript | 269 tests pass; typecheck passes | components-final.log |
| Existing UI server suite | eight tests pass in the first full UI command; server implementation unchanged by the subsequent listener fix | ui-browser-intermediate.log |
| Browser integration | 19 tests pass; preview questions, complete/missing-proof behavior, no decision side effect, isolation, return/focus and widths 736/360/320 | browser-final.log |
| Final UI build | source-bound cockpit and decision resources generated successfully | ui-final-build.log |
| Core boundaries, locale catalog, skills and MCP semantics | pass; strict 142-module cycle guard unchanged | contracts-boundary.log |
| Exact final tarball outside checkout | pass; 1344 files, pinned parser confinement, imported-image regression, renderer, text normalization and 31 public export identities | final-packed-smoke.json |
| Deterministic adapters | fresh recording and recheck pass; 56 scenarios, no failures | compatibility-final.log; final-contracts.log |
| Strengthened clean source | pass: fresh generation, assembly, actual Core/Community execution, startup and routing | clean-final.log |
| MCP package, Community, installed-layout inventory and whitespace | pass | final-contracts.log |
| Measured payload | 394 files / 3406116 bytes; exact measured ceiling and no spare headroom | budget-final.json |

The before-fix resource probe produced 2512540 output bytes from only 1106 source bytes and 15 files;
the caller checked the final size only after expansion. It also rejected a declared imported image
with `preview_resource_unsupported`. These are reproduced local observations, not a claimed OOM test
or a claim that an oversized approval was accepted. The new guard fails before uncontrolled import
materialization and the imported-image case succeeds.

The UI red regressions reproduce premature retry approval and absent question text. The session red
regression reproduces disclosure despite an already-aborted request. Fresh tests verify cancellation
without content, subsequent valid access, expiry during access and expiry before access. The retry
regression also verifies retained failure after an early return and recovery only after the correct
frame's ready signal. Existing no-preview cards retain their behavior; viewing is never a new human
approval requirement or an authorization receipt.

At 320px the primary question list is visibly present and wraps inside the decision surface; see
`agdf-preview-decision-320.png`. This image was inspected. The browser preview harness drives the
actual Core/session through its local test port and DecisionCard. Separate SDK tests exercise the
built decision resource. These observations do not claim native-host end-to-end preview qualification
or an independent human review. Historical native records were not upgraded by adapter execution.

One initial concurrent presentation fixture assertion failed without its child-output diagnostic.
The assertion now retains that diagnostic; an isolated rerun and the final complete preview chain
passed. The original failure is retained and no unobserved cause is asserted. Frame event ordering
was corrected at the listener owner, and all original and new assertions remain active.

No installed cache, approval, source revision, commit, push, merge or release was performed. TP and
Clean Implementation Reviews, the sole QA decision and any human QA/UAT decisions remain separate.
