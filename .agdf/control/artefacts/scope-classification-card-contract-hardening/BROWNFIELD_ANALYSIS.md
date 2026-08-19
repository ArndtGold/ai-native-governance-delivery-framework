# Pre-Implementation Brownfield Analysis: Scope Classification Card Contract Hardening

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_slice`
- required_next_gate: `none`
- artefact: `.agdf/control/artefacts/scope-classification-card-contract-hardening/BROWNFIELD_ANALYSIS.md`
- date: 2026-08-19
- reviewer: agent

## Scope

Verify the implementation path for approved tasks SCH-T1 through SCH-T7 before CD+Tests. The work
must correct the existing renderer contract through existing owners and must preserve unrelated
dirty-worktree changes.

## Evidence

- `create-agdf/lib/interaction-presentation.js` already owns the pure
  `renderScopeClassificationCard` renderer, locale exception boundary, Markdown cell escaping and
  fail-closed `null` result. Its current mode allowlist is the confirmed permissive gap.
- `plugin/meta/agdf-interaction-locales.json` owns complete English/German packs. Both packs contain
  the same obsolete `verified_change` label, so one symmetric canonical edit preserves parity.
- `plugin/meta/contracts/interaction.md` owns Scope Classification activation, failure and locale
  behavior. Its current text still admits Quick Task or Trivial Change and describes incomplete
  packs as unsupported, which conflicts with the approved PRD distinction.
- `create-agdf/scripts/interaction-presentation-test.js` already contains the positive,
  deterministic, non-authorizing and incomplete-registry Scope Classification baseline. It is the
  single focused test owner to extend with boundary matrices.
- Existing gate-check eval records cover ungated, ambiguous and gated Scope Classification. They
  can be extended with one Verified Change suppression case through the current case, fixture,
  observation and manifest owners; no new eval runner is required.
- `plugin/scripts/check-runtime-integrity.mjs` already asserts renderer exports and locale shape.
  Narrow structural assertions can extend this owner without a broad prose-matching policy.
- `create-agdf/scripts/sync-package-assets.js`, the runtime manifest/digest pipeline and
  `test:runtime-integrity-layout` are the existing propagation and generated-layout owners.
- `.agdf/control/CONTEXT_GRAPH.md` already contains `CG-NATIVE-INTERACTION-AUTHORITY`; the approved
  correction updates that node rather than creating a new node.
- Current source targets are clean. Existing dirty paths are limited to unrelated
  `activation-diagnosis-determinism` control closeout changes and this run's own control artefacts;
  no planned code, contract, registry, eval or Context Graph path overlaps foreign work.

## Missing Evidence

- Direct host-visible exactly-once rendering is not locally enforceable and remains outside the
  approved scope. Repository, generated-layout and eval evidence must not be reported as live-host
  UAT.
- Exact generated digest changes are unknown until canonical synchronization; the existing sync
  and installed-layout checks are sufficient deterministic owners.

## Current Coverage

- current_coverage: `partially_done`
- fully_done: one pure renderer, locale selection owner, contract owner, focused test runner,
  eval infrastructure, Runtime Integrity and canonical synchronization already exist.
- partially_done: positive Quick Task, deterministic locale, non-authorizing, gated/ambiguous and
  incomplete-registry evidence exists but does not cover approved bounds or every invalid class.
- not_done: Quick Task-only mode restriction, bounded shared input validation, trigger bounds and
  duplicate rejection, obsolete-label removal, aligned locale contract, Verified Change eval and
  Context Graph reconciliation.

## Reuse Strategy

- `extend`: existing renderer, locale registry, interaction contract, focused tests, eval corpus,
  Runtime Integrity and Context Graph node.
- `reuse`: locale resolver, registry validator, Markdown output escape, eval tooling, sync pipeline,
  runtime packaging and installed-layout test.
- `refactor`: only the renderer's repeated permissive scalar coercion into one module-local
  validator beside its sole consumer.
- `replace`: nothing.
- `new`: no runtime owner; only this delivery evidence and normal review artefacts.

## Impact And Compatibility

- interfaces: renderer signature and returned semantic-block schema stay unchanged;
- data/migrations: none; locale vocabulary and eval fixtures are repository assets only;
- compatibility: valid Quick Task cards remain ordered and localized; previously accepted invalid
  or Verified Change input now deliberately returns `null`;
- side effects: generated surfaces and runtime digests change only through canonical sync;
- regressions: Run Status, approval presentation, task-target orientation and other interaction
  renderers must remain green in the existing suite.

## Parallel-Structure And Drift Assessment

- No second renderer, classifier, validation module, locale fallback or skill-local Markdown is
  required.
- Numerical limits remain executable only beside the renderer; normative prose states approved
  behavior without becoming another runtime evaluator.
- The locale resolver remains unchanged; invalid-registry recovery is corrected in the contract,
  not implemented as a partial-pack fallback.
- The Context Graph update curates the stable interaction-authority invariant and does not become a
  delivery log.
- No unresolved product-semantic conflict or competing active source owner was found.

## Risks And Controls

- Markdown rejection may over-reject ordinary prose: test valid punctuation and plain URLs as
  counterexamples beside every forbidden control class.
- JavaScript code-unit counting may violate the PRD: use `Array.from(value).length` and test astral
  characters at 240/241 code points.
- Prose-fragile integrity checks may create false failures: assert stable canonical structures and
  absence of the obsolete locale key, not full paragraph text.
- Generated assets may hide drift: synchronize once, rerun synchronization and require no second
  diff.

## Context Graph Impact

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: `open_gap`
- required_action: update the existing node after implementation and test evidence exists.

## Minimal Clean Implementation Path

1. Harden the existing renderer and extend its focused tests.
2. Remove the obsolete locale vocabulary symmetrically and align the owning contract.
3. Add the narrow Verified Change eval and reliable Runtime Integrity checks.
4. Update the existing Context Graph node with delivered evidence.
5. Run focused checks, canonical sync, idempotence and generated-layout/package regressions.
6. Complete TP, clean-implementation and code reviews before QA.

## Required Next Step

- required_next_step: execute `CD+Tests` for SCH-T1 through SCH-T7.
- transparency: No later gate is skipped. QA and UAT remain distinct from repository evidence.
