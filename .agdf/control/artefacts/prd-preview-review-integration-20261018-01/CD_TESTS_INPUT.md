# CD+Tests: Bound PRD preview review

- decision: revise
- run_id: prd-preview-review-integration-20261018-01
- approved_tp_digest: sha256:150cea2ce16e423488ae6ec411388943f0849f82d2a0193e9c0e36d27bc859c5
- implementation_base: e1ab24407e1e936f2bc0f5d9d4434abb0754789b
- branch: feat/ux-intent-prd-ui-previews
- environment: macOS x64, Node 22.22.3; synthetic isolated Runs and browser/STDIO harnesses
- required_next_step: Assess and correct the existing Core dependency-cycle prerequisite before rerunning the boundary and clean-source checks; retain the approved preview scope and its evidence.

## Result

The approved preview implementation and its focused tests exist. The complete verification result
is not green: the unchanged HEAD boundary checker already rejects a Core import cycle starting at
run-seal.js, including run-seal.js -> run-revision-history.js -> run-seal.js. The same required check
fails on the implementation, and the clean-source test stops there after generating and assembling
the source fixture. The original cycle guard remains active. This report records revise rather
than declaring CD+Tests done, beginning CR/QA, or requesting another human gate approval.

The isolated HEAD reproduction is `evidence/head-boundary-baseline.json`. Its original checker and
Core sources were extracted from the base commit into scratch, with no worktree edits or new
preview code. This establishes pre-existence; it does not establish that every new dependency edge
is structurally acceptable. The broad existing Core coupling needs its own bounded assessment.

The new helpers initially extended that strongly connected component from 26 to 28 modules.
Pure text normalization and acceptance-criteria grammar were extracted with the original public
exports and algorithms preserved. The final graph has the original 26 cyclic modules and no
added cyclic modules; see `evidence/core-cycle-assessment.json`. This removes the preview
implementation's additional cycle coupling while preserving the pre-existing failing guard.

## Implementation

- New UR declarations explicitly distinguish required interactive before-PRD review from none;
  unmarked legacy URs retain their existing semantics. UR/UX/PRD skills, templates and authoring
  contracts preserve the task, versioned run-local files, criterion relation and unanswered choices.
- The PRD owns one strict Preview Review JSON descriptor. The shared inspector checks source UR,
  criterion IDs, contained regular files, raw byte hashes, supported local resource closure and
  exact size limits. Production parse5/PostCSS dependencies are pinned and explicitly projected.
- The existing presentation writer creates PRD schema 5 with immutable raw snapshots, rendered
  chunks, descriptor and renderer binding. Existing versions 1–4, receipt schemas and material
  algorithms retain their original meanings. A checked standalone access copy is derived from the
  same bytes; immutable chunks remain historical authority.
- Existing session and stateless Inspect reads expose only the bound preview. Session selectors,
  expiry, closure, UTF-8 offsets and content digests are checked. A still-readable immutable view
  whose live source changed is explicitly stale, rather than incorrectly current.
- The existing DecisionCard/DecisionEntry show task/version/criteria and a separate preview entry,
  keep example actions local, isolate executable content, restore focus and show retry/stale or
  unavailable states. An unavailable preview port cannot silently leave approval enabled.
- The existing approval transaction revalidates current preview material under its locks and at
  pre-commit. Current approved-source proof checks the declared files; version-aware revision
  closure archives originals and snapshots. Historical reconstruction uses archived bytes.
- Text fallback carries exact preview selectors and states unobserved access honestly. A resource,
  raw HTML or a local link is not treated as observed remote viewing or human approval.

## Executed verification

| Scope | Observed result | Evidence |
|---|---|---|
| Requirement, descriptor, containment, raw limits | pass, including exact and over-limit boundaries | evidence/final-checks/material.log |
| Local resources, isolation document, parser closure, 2 MiB output limit | pass | evidence/final-checks/renderer.log |
| Actual prepare/approval, missing or changed files, pre-commit race, partial publication, legacy bypass, raw/render tampering | pass | evidence/retained/presentation-stale-final.log |
| Actual early PRD revision, fresh reply, native facade, archived reconstruction after live changes | pass in synthetic Runs | evidence/retained/presentation-stale-final.log |
| Actual session/Inspect UTF-8 assembly, opaque selectors, freshness, expiry and close | pass | evidence/final-checks/session.log |
| Complete UI suite | 263 component tests and 8 server tests passed | evidence/retained/ui-all-final.log |
| Existing SDK/decision browser regressions plus preview integration | 19 scenarios passed; three preview cases were subsequently strengthened and rerun | evidence/retained/browser-final.log |
| Strengthened actual Core/session-to-browser preview | pass at 736/360/320px, including real readiness, no runtime errors, missing proof, focus and hostile navigation/bridge/storage/network probes | evidence/retained/browser-correct-ready.log and screenshots |
| Existing Core command flow | 17/18 passed in initial full run; the failed owned-output fixture passed separately after projection completed | evidence/retained/owned-recovery.log; initial log retained separately |
| Existing source revision regressions | 3/3 entrypoints passed, including canonical phase/source matrix and process recovery | evidence/retained/revision-regressions.log |
| Actual npm tarball outside checkout (captured identity) | prepare/read/tamper rejection/unchanged state/valid synthetic approval passed; receipt schema 2 | evidence/current-packed-preview.json |
| Full command package suite | pass; 1323 real packed files, contained runtime dependency closure, both generated validators and missing-resource checks | evidence/retained/package-command-final.log |
| Final packed helper extraction | pass in 1329-file tarball: actual Core load, preserved public export identities and normalization, confined parsers and render | evidence/final-packed-helpers.json |
| Pure helper regressions | 5/5 source entrypoints passed after extraction | evidence/retained/pure-helper-regressions.log |
| MCP package and semantic contract | pass | evidence/retained/package-mcp.log and MCP contract log |
| Actual STDIO preview projection/session/stateless read and unsupported text access | pass; no real host qualification or human approval asserted | evidence/retained/packaged-preview.log |
| Remaining canonical MCP flow entrypoints | 4/4 passed, including all 18 selected source/phase cells and structured/Quick closeout | evidence/retained/mcp-remaining.log |
| Runtime inventory layout and negative integrity cases | pass | evidence/retained/integrity-layout.log and integrity-negative.log |
| Typecheck, Inspect, function/schema contracts and locale catalog | pass | evidence/final-checks/journal.json |
| Skill conformance | pass after declaring the actual supported authoring guidance without an undeclared resource dependency | evidence/retained/conformance-pure-final.log |
| Canonical verification infrastructure | 15/15 passed; new tests registered in existing executable inventory | evidence/retained/verification.log |
| Generated assets and measured payload | pass at 389 files / 3402801 bytes, no spare budget; runtime JS/JSON and licenses retained | evidence/retained/budget-pure-final.json |
| Core boundary and clean-source completion | fail at the reproduced existing import cycle | evidence/final-checks/boundaries.log, evidence/retained/clean-checkout.log, evidence/head-boundary-baseline.json |

The initial projection and readiness defects found during implementation were corrected and rerun:
stale generated locales, a test fixture's unsupported operation inventory, a missing sandbox
capability state, a malformed serialized readiness script, and overly broad package closure
assumptions. Earlier green rendering alone did not establish readiness; the strengthened browser
checks now require both disappearance of loading and absence of the unavailable state.

## TP coverage and remaining work

T-001 through T-008 are implemented with the source, transaction, history, read, UI and browser
evidence above. T-009 remains partially done because the mandatory structural boundary and
clean-source completion checks cannot pass. T-010 remains pending at its canonical post-CD review
boundary. This is a CD execution report, not a completed Task Plan Review, Code Review, QA decision,
UAT, release or proof that the approved TP is fully fulfilled.

No installed plugin/cache was updated, no real delivery approval was inferred from preview actions,
and no commit, push, merge or publication was performed. Existing unrelated working-tree changes
and the approved UR/PRD/SD/TP sources were preserved.

## Evidence limits

Core, actual local packed/STDIO execution and synthetic browser observations are separate evidence
levels. Native Codex/Claude/remote host rendering and independent human-view proof were not observed.
Windows and Linux native execution were not performed. Local file/lock validation is cooperative;
it is not protection against an adversarial process rewriting files after the final validated read.

The open structural prerequisite must not be hidden by raising a cycle allowance, removing a test,
silently broadening approved product scope, or declaring QA pass from the feature tests alone.
