# Task/Test Plan: Verified Change Control Integrity and Proportionality

- status: approved
- revision: 1
- gate: TP
- gate_approval: exact `Approval: TP` received on 2026-07-15 after same-run, same-gate and revision revalidation
- derived_from: approved SD revision 1
- date: 2026-07-15
- owner: AGDF

## 1. Delivery Scope

Implement the approved parser, evaluator, compact-record and native-capability design through existing canonical owners. Preserve fail-closed eligibility, exact approval authority, generated-surface derivation and the completed Pages contact-email product behavior.

Implementation starts only after exact `Approval: TP` and a passing pre-implementation Brownfield Analysis for this plan.

## 2. Tasks

| task_id | Task | Owner paths | Acceptance evidence |
|---|---|---|---|
| VCI-TP-01 | Add strict artefact-path cell parsing for plain and complete code-span values, retaining raw/format/reason evidence and rejecting unmatched or embedded delimiters. | `create-agdf/lib/control-state/run-state-parser.js`; `create-agdf/scripts/control-state-test.js` | Focused fixtures prove plain/code-span equivalence and deterministic rejection of one-sided, repeated, embedded, absolute, traversal and unsupported-backslash forms. |
| VCI-TP-02 | Add `OR` as a distinct recognized closeout artefact category and pass user-gate, internal-step and closeout vocabularies through every run-state parser call. | `create-agdf/bin/create-agdf.js`; control-state fixtures | `OR` is parsed without becoming a user gate or implementation step; existing artefact categories and non-Verified modes remain stable. |
| VCI-TP-03 | Implement consolidated-role consistency validation for Brownfield Review, Verified Change and OR. | `create-agdf/bin/create-agdf.js`; `create-agdf/scripts/verified-change-test.js` | Same-path roles pass only for lifecycle-consistent `verified_change`; premature OR, mismatched record status and cross-role aliases in other modes fail closed. |
| VCI-TP-04 | Replace the static control-path allowance with same-run, explicitly linked, recognized artefact-path derivation. | `create-agdf/bin/create-agdf.js`; `create-agdf/scripts/verified-change-test.js` | Selected-run UR/Brownfield/OR/control paths pass; another run, unrecognized role, sibling file and arbitrary worktree path emit scope escape or invalid-path findings. |
| VCI-TP-05 | Extend the compact record with Brownfield Selection, `baseline_commit`, `execution_changed_paths` and `execution_scope_status`; implement active and completed lifecycle validation. | `plugin/control/templates/artefacts/VERIFIED_CHANGE.md`; `create-agdf/bin/create-agdf.js`; Verified Change fixtures | Active runs detect new unlisted paths and exact execution-scope mismatch; completed executed runs use the recorded snapshot, ignore later unrelated worktree changes and still reject missing/unsafe/inconsistent evidence. |
| VCI-TP-06 | Replace boolean canonical-value transport metadata with the approved enum and wait-safety vocabulary across canonical adapter definitions and integrity rules. | `plugin/meta/agdf-plugin.definition.json`; `plugin/scripts/check-runtime-integrity.mjs`; negative integrity fixtures | Canonical/generated metadata use one vocabulary; decorated, unknown, unsafe and legacy-boolean cases cannot become gate-safe; exact/separate transport cases validate. |
| VCI-TP-07 | Implement the pure native capability preflight and require it before native invocation. | `create-agdf/lib/interaction-presentation.js`; `create-agdf/scripts/interaction-presentation-test.js` | Runtime evidence outranks static metadata; conflicts fail closed; unsafe adapters are not invoked; exact validator remains byte-exact and unchanged. |
| VCI-TP-08 | Decouple ready `gate_approval` classification from adapter availability and derive `native_attempt_required` exclusively from preflight. | `create-agdf/bin/create-agdf.js`; `create-agdf/lib/interaction-presentation.js`; control/presentation fixtures | A ready gate with decorated-only or unknown transport remains a gate approval but reports `native_attempt_required: false` and exact-text fallback; eligible adapters report true. |
| VCI-TP-09 | Align Runtime Contract, gate-check, Brownfield and release/OR guidance with complete mode vocabulary, gate-derived approval values and compact Mini-Closeout semantics. | `plugin/meta/agdf-runtime-contract.md`; `plugin/skills/gate-check/SKILL.md`; `plugin/skills/brownfield-analysis/SKILL.md`; `plugin/skills/release-or/SKILL.md`; routing tests | No skill hard-codes another gate's approval; all relevant mode lists include `verified_change`; skills reference rather than duplicate the transition model. |
| VCI-TP-10 | Synchronize all generated/package surfaces and extend regression aggregation. | `create-agdf/scripts/sync-package-assets.js`; `create-agdf/generated/**`; package/routing/smoke tests | Repeated synchronization is idempotent; Codex, Copilot and OpenCode outputs match canonical owners; existing package smoke remains green. |
| VCI-TP-11 | Re-run the contact-email reproduction and compatibility matrix without changing its delivered product files. | focused fixtures; `.agdf/control/artefacts/pages-contact-email/**` as read-only evidence | Compact record needs no separate Brownfield/OR file or false OR product-path classification; separate legacy files, plain/code-span paths and non-Verified runs remain valid. |
| VCI-TP-12 | Update the two affected Context Graph nodes and complete mandatory implementation reviews. | `.agdf/control/CONTEXT_GRAPH.md`; TP Review, Clean Implementation Review and Code Review artefacts | Durable invariants reflect the delivered behavior; each plan task maps to diff/test evidence; no unresolved blocking or workaround finding remains before QA. |

## 3. Requirement Traceability

| PRD requirement | Tasks |
|---|---|
| VCI-01 Canonical Workflow And Skill Alignment | VCI-TP-02, VCI-TP-09, VCI-TP-10 |
| VCI-02 Safe Markdown Path Normalization | VCI-TP-01 |
| VCI-03 Run-Owned Control Artefact Boundary | VCI-TP-02, VCI-TP-04 |
| VCI-04 Consolidated Compact Record | VCI-TP-02, VCI-TP-03, VCI-TP-05 |
| VCI-05 Proportional Static-Content Handling | VCI-TP-04, VCI-TP-05, VCI-TP-11 |
| VCI-06 Lifecycle-Stable Validation | VCI-TP-05 |
| VCI-07 Compatibility And Propagation | VCI-TP-10, VCI-TP-11 |
| VCI-08 Regression Evidence | VCI-TP-01 through VCI-TP-12 |
| VCI-09 Exact Native Approval Transport | VCI-TP-06, VCI-TP-07, VCI-TP-08, VCI-TP-09 |

## 4. Test Matrix

| test_id | Covers | Required cases | Expected result |
|---|---|---|---|
| VCI-T01 | VCI-TP-01 | plain, complete code span, one-sided opening/closing, repeated/embedded backtick, absolute, traversal, backslash | Only plain and one complete code span normalize; every unsafe/partial form remains invalid. |
| VCI-T02 | VCI-TP-02, VCI-TP-03 | OR separate, OR same path, premature OR, mismatched statuses, non-Verified alias | Only recognized lifecycle-consistent Verified Change consolidation passes. |
| VCI-T03 | VCI-TP-04 | selected-run linked paths, another run, unlinked sibling, arbitrary path | Only explicit same-run recognized paths enter the permitted control set. |
| VCI-T04 | VCI-TP-05 | active eligible, active executed exact/mismatch, completed executed, missing snapshot, later unrelated dirty path | Active scope escapes fail; completed history is stable only with complete valid recorded evidence. |
| VCI-T05 | VCI-TP-06, VCI-TP-07 | exact, separate label/value, decorated-only, unknown, unsafe wait, static/runtime agreement and conflict | Only confirmed exact transport plus safe wait is eligible; conflicts and unknowns fail closed before invocation. |
| VCI-T06 | VCI-TP-08 | ready gate with eligible, unavailable and unsafe adapter; non-ready gate | Interaction kind follows gate readiness; native attempt follows capability; no unavailable adapter is invoked. |
| VCI-T07 | VCI-TP-09 | UR, PRD, SD, TP, QA and UAT primary values; complete mode lists | Exact approval always derives from evaluated gate; no stale hard-coded value or missing `verified_change` remains. |
| VCI-T08 | VCI-TP-10, VCI-TP-11 | generated parity, repeated sync, separate legacy artefacts, all non-Verified modes, contact-email reproduction | Compatibility and package tests pass without modifying delivered contact-email behavior. |

## 5. Verification Sequence

1. Run pre-implementation Brownfield Analysis and confirm exact owners, touched paths, reusable helpers and unrelated-worktree isolation.
2. Add failing path, role, historical-snapshot and adapter-capability fixtures before changing runtime behavior.
3. Implement VCI-TP-01 through VCI-TP-08 in existing shared owners.
4. Align canonical runtime, skills, metadata and template under VCI-TP-09.
5. Run synchronization once, inspect generated changes, run it again and prove idempotence.
6. Execute focused tests after each owner change, then the full verification bundle.
7. Update Context Graph invariants and record direct task-to-diff-to-test evidence.
8. Run Task Plan Review, Clean Implementation Review and Code Review before QA Gate.

## 6. Required Validation Bundle

```text
node plugin/scripts/check-runtime-integrity.mjs
node create-agdf/scripts/runtime-integrity-negative-test.js
node create-agdf/scripts/control-state-test.js
node create-agdf/scripts/verified-change-test.js
node create-agdf/scripts/interaction-presentation-test.js
node create-agdf/scripts/test-routing.js
npm --prefix create-agdf run test:control-state
npm --prefix create-agdf run test:routing
npm --prefix create-agdf run smoke-test
node create-agdf/bin/create-agdf.js doctor --json --run verified-change-control-integrity
node create-agdf/bin/create-agdf.js gate-check --json --run verified-change-control-integrity
node create-agdf/bin/create-agdf.js delivery-map --json --run verified-change-control-integrity
git diff --check
```

Any skipped, weakened or shape-changed assertion must be reported as a deviation and prevents a clean QA pass unless explicitly resolved in the approved plan.

## 7. Scope Constraints

- No new delivery mode, gate, approval formula, public CLI command or product-specific static-content bypass.
- No second path parser, gate evaluator, approval validator, adapter-specific authority path or closeout engine.
- No post-response stripping or fuzzy matching of decorated approval values.
- No broad rewrite of unrelated control-state, presentation, package or Pages behavior.
- No modification of `pages/src/data/site.ts` or `pages/src/pages/index.astro` in this implementation slice.
- No commit, push, pull request or release without a separate explicit delivery instruction after the required gates.

## 8. Completion Criteria

- VCI-TP-01 through VCI-TP-12 each have direct implementation and automated evidence.
- Every PRD requirement and test-matrix row is covered or explicitly blocked with impact.
- Doctor, gate-check, delivery-map, runtime integrity, routing, focused suites and package smoke pass.
- Canonical and generated surfaces are synchronized without an independent generated owner.
- Active Verified Change remains fail-closed and completed history remains evidence-backed.
- Exact textual approval remains authoritative on every surface.
- Context Graph reconciliation is complete and all mandatory reviews have no unresolved blocking finding.

## 9. Decision Required

Approve this Task/Test Plan to permit pre-implementation Brownfield Analysis:

`Approval: TP`
