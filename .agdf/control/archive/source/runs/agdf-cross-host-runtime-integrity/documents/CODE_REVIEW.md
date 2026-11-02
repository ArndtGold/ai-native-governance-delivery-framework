# Code Review: Cross-Host Plugin Runtime Integrity

Status: pass; revision 4
Decision: pass
Date: 2026-08-26

## Code Review

- decision: pass
- findings: no open correctness, security, compatibility or maintainability finding remains in the reviewed revision-3 diff.
- reviewed_scope: `create-agdf/lib/installers/local-marketplace.js`, `create-agdf/lib/installers/plugin-installers.js`, `create-agdf/scripts/local-marketplace-test.js`, `create-agdf/scripts/release-bootstrap-smoke-test.js`, `create-agdf/scripts/smoke-test.js`, the existing transaction and provenance neighbours, and generated/package consumers exercised through canonical release preparation.
- evidence: current and exact legacy-marker behavior remains green; the new path requires owned outer evidence, semantic version coherence, exact plugin digest, owned marketplace manifests, complete runtime and absent profiles and markers; current marker absence and all malformed or tampered states fail closed.
- missing_evidence: direct native-Windows execution CRI-H05 remains outside code-review proof and is handed to QA as an evidence gap.
- risks: an actor able to replace the complete plugin and outer ownership marker remains outside the provenance threat boundary, unchanged from the approved design. Historical content is set aside, never trusted or copied into the target stage.
- required_next_step: run QA Gate with TP Review revise and CRI-TPR-02 open.

## Resolved Review Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CRI-CR-06 | implementation_gap | CD+Tests | resolved | Outer historical version eligibility now requires a semantic version in addition to equality across definition, runtime, Codex and Claude manifests | none |
| CRI-CR-07 | evidence_gap | evidence_obligation | resolved | The focused test now drives an actual pre-provenance transaction through simulated Codex host failure and proves exact old-root restoration; native-Windows execution remains separately owned by CRI-TPR-02 | none for repository review |
| CRI-CR-08 | implementation_gap | CD+Tests | resolved | The workflow still proves that `latest` points to the release, while the clean bootstrap now executes exact `@agdf/cli@0.13.6`; public npm execution and a permanent static regression pass | none |
