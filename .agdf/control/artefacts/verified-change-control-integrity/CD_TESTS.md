# CD+Tests Evidence: Verified Change Control Integrity and Proportionality

- status: done
- tp_revision: 1
- date: 2026-07-15

## Implementation Coverage

| task_id | Status | Evidence |
|---|---|---|
| VCI-TP-01 | done | Strict artefact-path cell parser and positive/negative control-state fixtures. |
| VCI-TP-02 | done | Distinct closeout artefact vocabulary with `OR` parser coverage. |
| VCI-TP-03 | done | Consolidated-role consistency analysis and lifecycle fixtures. |
| VCI-TP-04 | done | Same-run explicitly linked control-path derivation and cross-run/scope rejection. |
| VCI-TP-05 | done | Compact record baseline/execution snapshot fields and active/completed lifecycle validation. |
| VCI-TP-06 | done | Enumerated approval transport and wait-safety metadata plus integrity negatives. |
| VCI-TP-07 | done | Pure native capability preflight and no-invocation negative evidence. |
| VCI-TP-08 | done | Gate interaction kind decoupled from report-only native capability. |
| VCI-TP-09 | done | Runtime, gate-check, Brownfield and release/OR guidance aligned. |
| VCI-TP-10 | done | Canonical assets synchronized; repeated sync retained identical diff hash. |
| VCI-TP-11 | done | Contact-email reproduction remains read-only; Verified Change compatibility suite passes. |
| VCI-TP-12 | done | Both Context Graph invariants updated; Task Plan, Clean Implementation and Code Review artefacts completed with no open blocking finding. |

## Test Evidence

| Check | Result | Evidence |
|---|---|---|
| Runtime integrity | pass | `node plugin/scripts/check-runtime-integrity.mjs` |
| Runtime integrity negative suite | pass | `node create-agdf/scripts/runtime-integrity-negative-test.js` |
| Control-state suite | pass | `node create-agdf/scripts/control-state-test.js` |
| Interaction presentation suite | pass | `node create-agdf/scripts/interaction-presentation-test.js` |
| Verified Change suite | pass | `node create-agdf/scripts/verified-change-test.js` |
| Routing render suite | pass | `node create-agdf/scripts/test-routing.js` |
| Complete package smoke | pass | `npm --prefix create-agdf run smoke-test` |
| Synchronization idempotence | pass | Diff hash remained `4f7e0cde41052190aff66fd2e6f0c55020c4a2f3` after an additional sync before concurrent control-state changes appeared. |
| Whitespace validation | pass | `git diff --check` |
| Pages contact-email reproduction | pass | `npm --prefix pages run check`; `npm --prefix pages run build`; rendered `mailto:agdf@iself.eu` assertion |
| Final synchronization idempotence | pass | Diff hash remained `0e7789cff242413270e6c110509b7589ca07074873357d7cf33a072aca6770b2` across an additional sync after review corrections. |

## Review Corrections

- Active Verified Change now compares a syntactically valid `baseline_commit` with the current full Git HEAD; stale or fabricated identities fail closed.
- Generic recognized artefact paths now emit a dedicated Doctor finding for absolute, traversal, unsupported-backslash or non-normalized values after syntax normalization.
- Unknown wait safety now routes to `unavailable_before_invocation`; only explicitly unsafe waiting routes to `unsafe_to_wait`.
- Focused fixtures now directly cover premature and conflicting consolidated roles, cross-run and unrecognized control paths, execution-snapshot mismatch, unsafe completed snapshots, legacy boolean capability metadata and runtime-confirmed separate value transport.
- The run's compact backlog row was corrected to keep internal-step links out of the canonical Artefacts vocabulary.

## Scope Evidence

- Product changes remain confined to the approved runtime, parser, evaluator, metadata, template, skill, synchronization and test owners.
- `pages/src/data/site.ts` and `pages/src/pages/index.astro` were not modified.
- Concurrent `agdf-state-orientation` control artefacts are preserved and excluded from this implementation evidence.
- No current implementation-path diff from the competing run was observed before this review stage.

## Remaining Internal Steps

Run QA Gate against the approved plan, Brownfield fit, implementation evidence and completed reviews.
