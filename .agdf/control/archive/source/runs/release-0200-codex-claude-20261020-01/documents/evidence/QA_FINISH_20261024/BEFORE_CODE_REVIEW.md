# Code Review: Codex CLI immutable-record import correction

- decision: pass
- run_id: release-0200-codex-claude-20261020-01
- date: 2026-10-24
- reviewer: Codex agent; cooperative local self-review, not independent human review
- reviewed_diff: HEAD 94ef61c9 plus the three uncommitted native-probe source/test changes

## Scope and review

The earlier branch implementation remains covered by CODE_REVIEW_TPR103_20261024_INPUT.md and its
predecessor. This review adds the exact local changes to codex-host-e2e.mjs,
lib/release-observation.mjs and release-handoff-test.mjs. Historical canonical report bytes are
preserved in evidence/QA_RECHECK_20261024/BEFORE_CODE_REVIEW.md.

The producer already requires failure.authorizes === false for PASS and now copies that observed
value into its evidence. Missing observed values become null and cannot create a PASS. The
validator continues to verify reference containment/hashes, primary process exit, exact model,
outcome, plugin, terminal status and captured.authorizes === false before the new branch.
The compatibility branch uses that already-checked primary value only when the host is Codex,
the scenario is failure_case and Object.hasOwn confirms the summary property is absent.
Explicit true, null and string values do not use this branch. Other hosts/scenarios still
require their explicit summary field. No original object/file is mutated.

The two new tests exercise unchanged records and bundle digests, unsafe and missing primary
values even with recalculated hashes, capture tampering without recalculated hashes, and every
other required host/scenario. The test fixture's shared evidence object is restored between
mutations; each row has its own object. Tests are isolated synthetic validator fixtures, not
native observations. No meaningful correctness, security or regression defect was found.

## Evidence, risks and next step

- evidence: release-qualification.log (34/34); CODEX_PRIMARY_REVIEW.json; VALIDATION.json;
  release-evidence-test and syntax/diff checks from this session; exact source diff inspected.
- findings: No open finding in the reviewed code scope. Earlier resolved findings retain their
  provenance in the preserved previous report; no severity/type/status is reclassified here.
- missing_evidence: No new Windows execution or remote CI for the uncommitted diff. Those are
  release-verification obligations, not a claim supplied by this Code Review.
- risks: The agent authored and reviewed this small correction. This is cooperative review,
  not independent human acceptance. Existing candidate 8e2b8699 proves its original source only.
- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- memory_target: scope_artifact
- required_next_step: Complete the native bundle import and final-snapshot evidence obligations before QA pass.
