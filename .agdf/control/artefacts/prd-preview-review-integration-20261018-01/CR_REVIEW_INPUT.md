# Code Review: Bound PRD preview review

- decision: pass
- run_id: prd-preview-review-integration-20261018-01
- source_revision: b8533f68-7c56-48fc-aca2-11d443b3956b
- reviewed_at: 2026-10-19
- reviewer: Codex, agent self-review of the actual implementation and repairs
- based_on: approved UR/PRD/SD/TP, CD+Tests and fresh correction evidence

## Code Review

- findings: Five implementation findings were reproduced and corrected. No applicable open Code Review finding remains in the reviewed scope.
- missing_evidence: No additional evidence required for this bounded Code Review result remains missing. Native-host end-to-end qualification and independent review were not performed or inferred.
- risks: Local and synthetic execution do not qualify a native host or prove human viewing; cooperative filesystem assurance and the existing supported-resource grammar remain unchanged.
- required_next_step: Perform task-plan-review against the corrected implementation and fresh evidence before completing the remaining Quality Readiness work.

## Actual reviewed scope

Reviewed the current branch `feat/ux-intent-prd-ui-previews` against base commit
`e1ab24407e1e936f2bc0f5d9d4434abb0754789b`, including new untracked implementation modules.
Inspection covered the shared requirement/descriptor/file inspector, static renderer, exact snapshot
publication, presentation versions 1–5, approval transaction revalidation, current and archived proof,
revision closure, session and stateless read selectors, UI DecisionCard/DecisionEntry/bootstrap,
locale/schema propagation, pinned dependency projection, package boundaries and the Core dependency
correction. Directly affected tests, authoring contracts/templates and documentation were inspected.

The prior 42-declaration movement audit and 31-export identity checks were considered alongside the
actual owner/import changes and strict graph guard. Fresh package evidence repeats the public export
and normalization checks. Test success was not treated as a substitute for diff inspection.
Unrelated `.gitignore` changes and the foreign handoff Run were excluded and preserved. Generated
adapter evidence was validated through its owner; historical native observations and independent
human feedback were not regraded. This is an agent self-review, not an independent review attestation,
TP coverage verdict, Clean Implementation Review or QA decision.

## Corrected findings

### CR-001 — P1: bound CSS expansion before materialization

`packages/core/lib/control-state/preview-render.js:37` recursively expanded every import before the
caller applied the 2 MiB final-output limit. A small acyclic shared dependency graph therefore caused
exponential repeated work and allocation. The retained bounded probe used 1106 source bytes and
15 files and materialized 2512540 output bytes. Larger variants were not executed to cause OOM.
The defect was late resource enforcement; it did not demonstrate an oversized accepted approval.

Resolved: memoize each stylesheet by path and exact input, reserve imported/data-URL bytes before
inserting expanded nodes, bound total embedding and check the emitted wrapper. The renderer owns
the one shared render-limit constant. Exact-boundary tests still accept 2 MiB and reject one byte
more. A tiny acyclic expansion now rejects without uncontrolled materialization.
Evidence: `resource-reproduction-before.log`, `before-preview-render.js.txt`, `preview-final.log`.

### CR-002 — P2: resolve imported stylesheet images once

The renderer first embedded an imported stylesheet's relative image URL, then walked its inserted
declarations again in the parent and treated the generated `data:` URL as an authored local resource.
A valid declared `@import` with an image failed with `preview_resource_unsupported`.

Resolved at `packages/core/lib/control-state/preview-render.js:49`: resolve each file's own declarations
before inserting already-resolved imports. The existing local/declared-file allowlist remains
unchanged. Positive relative-image, distinct inline-style and existing hostile-resource tests pass;
the exact final packed renderer also exercises the imported-image case.

### CR-003 — P2: retain the preview failure during retry

`packages/control-ui/src/mcp/DecisionCard.tsx:118` cleared the known read failure before a retry
completed and did not include pending preview reads in the approve guard. The red regression observed
a live approve button while the retry promise was still unresolved. Frame signal timing also allowed
availability events to race a passive-effect listener.

Resolved: pending reads disable and guard approval, a known failure survives retry/early return until
the exact frame reports readiness, and the listener is installed in the layout effect before display.
No frame message becomes an action and no human viewing/click receipt is introduced. The positive
recovery, failed-frame, missing-port, untrusted-message, focus and no-preview paths all remain tested.
Evidence: `ui-before.log`, `components-final.log`, `browser-final.log`.

### CR-004 — P2: expose explicitly unanswered questions on the primary card

The PRD descriptor's `open_questions` were retained in the full summary but omitted from the compact
native metadata and primary review surface. The exact question text was absent in the red UI
regression. This failed the existing requirement to keep unanswered example policy visible.

Resolved at `packages/core/lib/control-inspect/decision-session.js:136` and
`packages/control-ui/src/mcp/DecisionCard.tsx:172`: project the checked question list and render it
under a localized primary label. Bootstrap validation bounds supplied lists while retaining older
metadata without the optional field. Empty, overlong, oversized and non-array lists reject. Questions
remain questions, with no inferred product answer or changed approval policy.
Evidence: `ui-before.log`, `preview-final.log`, `components-final.log`, `browser-final.log`, and the
inspected decision screenshots at 736px and 320px.

### CR-005 — P2: preserve cancellation and lifetime checks in preview reads

The direct `preview` branch skipped the ordinary reader's AbortSignal handling and final session
validation. The red test received preview content despite an already-aborted request.

Resolved at `packages/core/lib/control-inspect/decision-session.js:169`: reject cancellation without
content, require every chunk to remain current, recheck the same live generation and expiry before
return, enforce the serialized response ceiling, and always release `readPending`. Tests prove an
aborted read cannot disclose content or prevent a subsequent valid read, and expiry both during and
before access returns no preview data. Existing exact selectors, close and source-change rejection
remain active. Evidence: `session-before.log`, `preview-final.log`.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CR-001 | implementation_gap | CD+Tests | resolved | Renderer guard and cache; resource-reproduction-before.log; preview-final.log | Execute node packages/core/test/preview-render-test.js; completed with pass |
| CR-002 | implementation_gap | CD+Tests | resolved | Imported relative-image regression and packed-final.log | Execute node packages/core/test/preview-render-test.js; completed with pass |
| CR-003 | implementation_gap | CD+Tests | resolved | Pending/known-failure/ready signal regressions; components-final.log and browser-final.log | Execute the existing preview UI/browser regression suites; completed with pass |
| CR-004 | implementation_gap | CD+Tests | resolved | Checked metadata, bounded bootstrap, primary list and 320px screenshot | Execute preview-session and preview UI/browser regressions; completed with pass |
| CR-005 | implementation_gap | CD+Tests | resolved | Abort and expiry regressions; session-before.log and preview-final.log | Execute node packages/core/test/preview-session-test.js; completed with pass |

All evidence filenames above are under `evidence/code-review/`. Current executed commands and hashes
are in its execution index, source snapshot and manifest. `CD_REVIEW_FIXES_EVIDENCE.md` records the
fresh correction verification separately from the existing historical CD+Tests report. All five gaps
are existing implementation obligations; no missing upstream constraint was invented or reclassified.

## Verification and limits

Fresh results: four preview programs and four existing Core compatibility programs; all 269 component
tests, TypeScript, eight UI server tests, 19 browser cases, final build, strict Core/package boundaries,
locale/skill/MCP contracts, the actual final 1344-file tarball, 56 adapter scenarios, runtime inventory,
Community, whitespace and the strengthened clean-source test pass. Payload is exactly 394 files and
3406116 bytes. The eight server results precede only the later frontend listener correction; their
server source is unchanged and final browser/component results cover that correction.

An initial concurrent presentation fixture failure lacked its child-output diagnostic. The assertion
was strengthened to retain it; both the isolated rerun and the full final preview chain pass. The
failure remains retained, with no unsupported claim about its cause. Original test assertions were
not disabled or weakened. Native-host qualification and independent human review remain unobserved,
consistent with the approved capability scope. No approval, installed-cache update or VCS action was
performed as part of this review.
