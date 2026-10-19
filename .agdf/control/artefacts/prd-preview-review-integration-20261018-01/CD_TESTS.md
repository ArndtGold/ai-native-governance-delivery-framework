# CD+Tests: Bound PRD preview review and Core prerequisite correction

- decision: pass
- run_id: prd-preview-review-integration-20261018-01
- approved_tp_digest: sha256:150cea2ce16e423488ae6ec411388943f0849f82d2a0193e9c0e36d27bc859c5
- implementation_base: e1ab24407e1e936f2bc0f5d9d4434abb0754789b
- branch: feat/ux-intent-prd-ui-previews
- environment: macOS x64, Node 22.22.3; disposable Core/CLI/package/adapter fixtures
- required_next_step: Perform the existing TP Review, Clean Implementation Review and mandatory Code Review before the sole QA decision owner.

## Result

The reproduced pre-existing Core import cycle is corrected. The unchanged strict package-boundary
checker now passes for all 142 modules and the final clean-source test passes after fresh generation
and production assembly. The earlier CD revise result is superseded by the actual fresh results
below. Its original source report, first failures and baseline reproduction remain historical evidence.

The user explicitly requested this prerequisite correction and rerun. Five lower-level owners now
separate structural Run parsing, material shape/version, seal computation, prepared-state policy and
immutable presentation envelopes from orchestration. Existing public facades reexport the same
functions and collections; 31 export identities were checked in source and in the exact final tarball.
42 moved pre-existing declarations are byte-identical to the recorded base. No history validation,
approval predicate, gate, receipt schema or seal algorithm was removed or relaxed. The dependency
guard has no cycle exception. Full details are in `evidence/core-cycle-fix/CORE_IMPORT_CYCLE.md`.

Run seal verification and all four approved-source digests remain valid and unchanged; see
`evidence/core-cycle-fix/source-binding.json`. Existing foreign worktree changes were preserved.

## Fresh executed verification

All evidence paths in this section are relative to `evidence/core-cycle-fix/`.

| Check | Actual final result | Evidence |
|---|---|---|
| Full strict Core graph and isolated resource negatives | pass; 142 modules, zero cycles | final-boundary.log; import-graph.log |
| Original moved implementations | pass; 42 byte-identical declarations | movement-audit.json |
| Public facade compatibility | pass; 31 identical export references in source and final packed package | export-identity.json; final-packed-smoke.json |
| Existing CLI/Core command suite | pass; all 18 test programs, zero failures and skips | run-flow.log |
| All four preview entrypoints | pass; descriptor/material limits, shipped parsers/render, actual approval/history/race/interruption and session/Inspect access | run-flow.log |
| Expanded, recovery, early-UR and existing source revision entrypoints | pass; four entrypoints including all 18 source/phase cells, archived proof and process recovery | revision.log; revision-stream-tail.log; execution-index.json |
| State, next-action, parent reconciliation, archive read bounds and large Run revision | pass; five entrypoints | policy-history.log |
| Final shared envelope/recovery owner | pass; actual immutable document/Inspect/tamper/symlink regression after sharing its constants | document-final.log |
| Complete command package suite | pass; 1344 packed files, 146 reachable runtime modules, actual external CLI/API approval/replay, import audit, both generated profiles and missing-resource rejection | package.log |
| Exact final generated tarball outside checkout | pass; Core load, confined exact parser versions, renderer, normalization and 31 public export identities | final-packed.log; final-packed-smoke.json |
| MCP package boundaries | pass | mcp-package.log |
| Final installed-layout runtime manifest | pass; 14 skills and 16 control files | integrity-final.log |
| Canonical verification infrastructure | pass; 15 tests, no failures/skips | verification.log |
| Community contract regression | pass; baseline and 29 negative contracts | community.log |
| Fresh deterministic adapter compatibility execution and read-only recheck | pass; 56 evaluated scenarios, zero failures, current source fingerprint | compatibility-record.log; community-final.log |
| Actual repository Community check and whitespace check | pass | community-final.log |
| Strengthened clean-source completion | pass; fresh exact dependencies, generation, assembly, actual Core and Community execution, release/startup/routing checks | clean-strict.log |
| Final measured payload | pass; 394 files / 3404840 bytes, exact ceiling and zero spare headroom | budget-final.json |

The full package suite captured the correction before the final whitespace/shared-constant cleanup.
The final exact tarball was separately assembled, packed and imported after that cleanup; the
preview entrypoints and dedicated document regression also passed with the final shared owner.
Revision output was initially streamed for the first three entrypoints; the host transcript retains
its successful milestones and chain completion. The retained stream tail is explicitly partial,
and `revision.log` is the complete fourth entrypoint output, not a fabricated complete transcript.

## Verification defects found and corrected

The first clean-source rerun progressed beyond the original cycle and found a stale English
handbook source reference. The existing English preview additions match the German source;
only the `source_revision` checksum was refreshed. Translation content and the existing review
marker were preserved; this correction claims no new independent human review.

A subsequent apparently green clean-source run exposed a macOS path-alias entry-guard gap:
`/var` versus `/private/var` could silently skip the Community executable. The fixture root is now
canonicalized, and the test requires actual Core-boundary and Community success markers. Only
`clean-strict.log` is final clean-source evidence. The separate actual repository Community check
also passes. No required assertion was skipped, weakened or replaced with a mock.

The changed source invalidated the old deterministic adapter evidence as expected. Its existing
recording owner actually reran all 56 scenarios and generated source-bound evidence before the
read-only check and final clean-source run. The fingerprint was not edited by hand. This records
fixture observations; it does not renew native-host observations.

## Retained feature coverage

The preview feature implementation and detailed coverage are described by the prior source report
`CD_TESTS_INPUT.md`. That report's former cycle blocker is resolved by this report. Its other
retained evidence remains available under `evidence/retained/` and `evidence/final-checks/`.

The frontend was unchanged in this correction. The previous 263 component tests, 8 server tests,
typecheck and 19 browser scenarios (including the strengthened real readiness checks at
736/360/320px) were retained rather than reported as freshly rerun. Fresh Core preview tests and
package execution above cover the affected parser/presentation/approval/history paths. The strict
guard, dependency projection and four preview tests themselves match their previously retained
file digests; see `protected-checks.json`.

## TP coverage and next boundary

T-001 through T-009 are implemented with their retained feature evidence and the fresh prerequisite,
package and clean-source results above. This report records completion of CD+Tests, not completion
of T-010. Existing TP coverage/UX fidelity review, clean implementation review, Code Review and the
sole QA decision remain to be performed through their respective owners. No QA/UAT approval or
release completion is inferred.

Native Codex/Claude/remote host visibility, independent human-view proof and native Windows/Linux
execution were not newly observed. Local Core, actual tarball/API, deterministic adapters and prior
synthetic browser results remain distinct evidence levels. Cooperative file/lock assurance is
unchanged. No installed plugin cache, real delivery approval, commit, push, merge or publication
was performed.
