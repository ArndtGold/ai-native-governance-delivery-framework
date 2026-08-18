# Code Review: Public AGDF Plugin Distribution

Status: pass  
Revision: 7
Date: 2026-08-18
Run: `agdf-public-plugin-distribution`

## Code Review

- decision: `pass`
- findings: no open correctness, security, compatibility or maintainability finding remains in the
  reviewed implementation diff.
- reviewed_scope: canonical metadata and manifest; public legal documents and Pages routes/content;
  submission sources; public-plugin contract, projection, builder, validator and reports; runtime
  payload manifest; package/CI integration; run-scoped evidence templates.
- evidence: focused public-plugin and Pages suites; full `create-agdf` smoke; source/installed Runtime
  Integrity; byte-identical package builds; 294-file package inventory with declared bin/export
  validation; 53/53 deterministic skill evals; community-health and AGDF CLI smoke; local responsive
  inspection; final diff inspection.
- missing_evidence: live OpenAI hosts, deployed public routes, publisher identity, Apps Management,
  portal state and post-publication behavior are out of the code-review proof class and remain
  unverified.
- risks: OpenAI may change its accepted package or listing constraints; current validation fails
  closed and requires the owning PRD/SD/TP to be re-evaluated rather than truncating or weakening the
  candidate.
- required_next_step: Complete final Task Plan Review and run QA from repository/bundle evidence only.

## Resolved Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| PPD-CR-01 | implementation_gap | CD+Tests | resolved | Initial directory replacement removed the prior generated candidate before rename. Builder now performs a recoverable same-parent swap and restores the prior candidate if the new rename fails. | Retain the swap-path regression through `test:public-plugin`. |
| PPD-CR-02 | implementation_gap | CD+Tests | resolved | Initial candidate validation allowed fewer than three prompts and did not revalidate developer-name or public-URL constraints. Validator now enforces exact prompt count, 80-code-point developer name and HTTPS website/privacy/terms/support URLs; negative prompt-count coverage passes. | Retain exact listing-boundary negatives in CI. |
| PPD-CR-03 | implementation_gap | CD+Tests | resolved | The first implementation applied the 30-character public display value, public short copy and three public prompts to the ordinary local Codex manifest. The projector now selects canonical local interface fields for normal packaging and `publicDistribution` fields only for the public candidate; regression assertions verify both outputs. | Retain explicit local-versus-public projection assertions in `test:public-plugin`. |
| PPD-CR-04 | implementation_gap | CD+Tests | resolved | Top-level `description` and `shortDescription` duplicated the same value, while `claudeDescription` and `longDescription` were near-duplicate long copy. The redundant fields are deleted; the same projector now generates both Codex and Claude source manifests from `description`/`longDescription`, Runtime Integrity verifies the mappings and tests reject reintroduction of removed keys or hand-maintained manifest drift. | Retain direct projection and removed-key assertions; do not add compatibility aliases. |
| PPD-CR-05 | implementation_gap | CD+Tests | resolved | `publicDistribution.longDescription` remained a second detailed-copy owner after local metadata cleanup. It is removed; Codex, Claude, listing metadata and the public candidate all consume the canonical top-level `longDescription`. Contract and equality tests reject a reintroduced public long-copy field and verify the exact approved positioning across every manifest. | Retain one exact long-copy fixture and the public duplicate-field rejection. |
| PPD-CR-06 | implementation_gap | CD+Tests | resolved | The approved Revision 3 correction changes only the two canonical short-copy values. Generated Codex/package output consumes `description`; the public candidate consumes `publicDistribution.shortDescription`; Claude and all surfaces retain the exact shared `longDescription`. Exact fixtures, public length 29, generated parity and the complete smoke suite pass. | Retain the two exact short-copy assertions and shared-long-copy invariance test. |
| PPD-CR-07 | implementation_gap | CD+Tests | resolved | Root `SECURITY.md` and `SUPPORT.md` are translated in place with unchanged private-reporting, issue-routing, best-effort and no-SLA semantics. Language-sensitive guardrails now accept explicit English/German or Englisch/Deutsch meaning, while a new monolingual fixture proves drift still fails. Public routes, 15 negative community contracts, Runtime Integrity and the complete package smoke pass. | Retain semantic bilingual validation and the monolingual negative fixture; do not add independently maintained translated policy copies. |
| PPD-CR-08 | implementation_gap | CD+Tests | resolved | `CONTRIBUTING.md`, `GOVERNANCE.md` and `CODE_OF_CONDUCT.md` are translated in place with preserved CLA/DCO, AI-disclosure, canonical-path, sole-maintainer, CODEOWNERS, succession, confidential-reporting, enforcement and reconsideration semantics. Updated exact guards and new governance/conduct negatives pass with all 17 community contracts and the complete smoke suite. | Retain semantic guards and negative fixtures; keep German-primary governance and bilingual participation explicit. |

No open normalized finding remains.
