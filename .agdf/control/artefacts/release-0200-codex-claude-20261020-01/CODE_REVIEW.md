# Code Review: Codex CLI immutable-record import correction

- decision: pass
- run_id: release-0200-codex-claude-20261020-01
- date: 2026-10-24
- reviewer: Codex agent; cooperative local self-review, not independent human review
- reviewed_diff: HEAD 94ef61c9 plus the three uncommitted native-probe source/test changes, reviewed compatibility outputs and three traceability metadata corrections

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

## Additional traceability and projection review

The three Delivery Map errors were traced to existing legacy metadata, not missing product
acceptance. architecture-review-prevention-2026-09-27 declared both UR and Brownfield Review as
PRD derived_from parents; the approved PRD itself says Based on UR and the Brownfield Review is
routing input. Changing that one subordinate row to informed_by preserves the product source.
The other two Runs already contain QA reports evaluating their approved TPs, but their legacy
QA/evaluates rows do not supply the registry's required QA_REPORT/tests/TP relation. Adding the
concrete canonical relation retains those legacy observations and records the actual source link.

The existing atomic Run/Backlog writer performed these metadata changes. Guards proved valid
initial/final seals, unchanged approval seals, unchanged current gates and byte-identical listed
artefacts, including every approved source. No approval, QA decision or product acceptance changed.
RELATIONSHIP_CORRECTIONS.json records exact before/after revisions and source digests. The
aggregate Delivery Map now reports warn with zero block/revise findings; thirteen pre-existing
incomplete objective warnings remain. No reader or test assertion was weakened.

The generated compatibility diff changes source fingerprint/date and deterministic fixture OS to
this Mac. It keeps actual imported Claude evidence attached to Windows; no Codex import or extra
native qualification is inferred. The complete canonical validate --all-hosts command passes all
ten actual records/reviews in a temporary read-only validation input tree. Copies retain their
original bytes/reference hashes. No repository import or projection write occurred.

No actionable defect was found in these additional metadata/derived-output changes. Local
ignored configuration files under packages/cli predate this work, are preserved and are excluded
by the Git snapshot export; they are not secretly relabelled as tested release input.

## Evidence, risks and next step

- evidence: release-qualification.log (34/34); CODEX_PRIMARY_REVIEW.json; VALIDATION.json;
  release-evidence-test and syntax/diff checks from this session; exact source diff inspected; QA_FINISH_20261024/RELATIONSHIP_CORRECTIONS.json, SOURCE_APPLICABILITY.json and REVIEWED_MATRIX_VALIDATION.json.
- findings: No open finding in the reviewed code scope. Earlier resolved findings retain their
  provenance in the preserved previous report; no severity/type/status is reclassified here.
- missing_evidence: No new Windows execution or final clean release candidate/remote CI for the uncommitted diff. The full isolated verifier is running separately and this review does not predeclare its result. Those are
  release-verification obligations, not a claim supplied by this Code Review.
- risks: The agent authored and reviewed this small correction. This is cooperative review,
  not independent human acceptance. Existing candidate 8e2b8699 proves its original source only.
- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- memory_target: scope_artifact
- required_next_step: Complete the native bundle import and final-snapshot evidence obligations before QA pass.
