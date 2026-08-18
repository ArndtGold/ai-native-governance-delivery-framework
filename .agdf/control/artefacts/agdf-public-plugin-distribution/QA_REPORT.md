# QA Report: Public AGDF Plugin Distribution

Status: pass
Decision: `pass`
Revision: 10
Date: 2026-08-18
Run: `agdf-public-plugin-distribution`

## Quality Readiness

| Dimension | Result | Evidence |
|---|---|---|
| Plan coverage | pass | TP Review Revision 7 confirms international support routing reaches canonical English contribution, governance and conduct owners while bilingual participation and German-primary governance remain explicit. |
| Solution integrity | pass | Clean Review Revision 7 confirms all five translated community policies remain their in-place canonical owners with no fork, fallback, shim or parallel structure. |
| Code quality | pass | Code Review Revision 7 has no open finding; PPD-CR-08 verifies contribution, authority, succession and enforcement semantics plus 17 negative contracts. |
| QA decision | pass | `qa-gate` is the sole decision owner; PPD-QA-01 through PPD-QA-03 are resolved with approved scope, implementation and deterministic evidence. |

## QA Gate

- decision: `pass`
- evidence: approved PRD/SD/TP Revision 3; passing Brownfield Analysis Revision 2; completed
  PPD-T01–T18; Task Plan, Clean and Code reviews Revision 7; refreshed PPD-L01 bundle inspection;
  exact local/package `Control layer for governed AI-assisted delivery.` and public `Governed AI
  delivery controls` assertions; public length 29; unchanged shared Codex/Claude/public long-copy;
  removed-key and duplicate-field rejection;
  exact 42-file source
  inventory and 45-file final candidate with digest
  `a2aca3a964ecb7899ffa705879f9d6ac7cc484516455b98bcdd58823e3160a04`; two-build equivalence;
  source and installed Runtime Integrity; package build/contents; complete create-agdf smoke;
  53/53 deterministic skill evals; Pages checks/build/routes and responsive desktop/mobile inspection;
  community-health and AGDF CLI smoke.
- missing_evidence: PPD-L02 exact Codex host, PPD-L03 applicable ChatGPT host, PPD-L04 public Pages
  deployment, PPD-L05 verified publisher/Apps Management, PPD-L06 portal draft, PPD-L07 submission
  and PPD-L08 publication/post-publication evidence are not performed. They are external evidence
  obligations and remain `unverified`, `pending` or `not_observed` in the candidate report.
- risks: OpenAI may change accepted manifest/listing constraints; host capabilities may differ by
  product/version/account; public routes are locally built but not deployed; publisher identity and
  availability remain unresolved external prerequisites.
- required_next_step: Review QA Report Revision 10 and provide exact `Approval: QA`, request revision
  or decline. QA approval permits bounded UAT preparation only; external actions remain forbidden.
- impact_codes: none registered for this project scope.

## Acceptance And Boundary Review

- The normal Codex manifest preserves the established local display name, uses `Control layer for
  governed AI-assisted delivery.`, four prompts and hooks. Only the public candidate uses `AGDF`,
  `Governed AI delivery controls`, three public prompts and no hooks; its listing values pass Unicode
  code-point limits without truncation.
- The Skills-only candidate has no active hook, MCP or app declaration and contains no AGDF-operated
  service, account, telemetry or authentication.
- Privacy, terms and support are canonical root owners; public routes use one adapter and do not fork
  policy prose.
- Reviewer cases cover five positive and all five mandated negative themes using synthetic context.
- The runtime payload has a minimal generated ESM package manifest; candidate and npm declarations
  resolve to shipped targets with negative path/case/traversal/symlink coverage.
- Readiness reports keep repository, bundle, installed-host, portal and post-publication evidence
  distinct. `submissionReady` is `false` and publisher/availability/portal/publication state is not
  inferred.
- Existing local marketplace, npm, Claude, OpenCode, Copilot, lifecycle, routing and skill-eval
  regressions pass.
- The unrelated staged `docs/presentation/agdf_cto_praesentation.key` remains outside review and was
  not touched.

## Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| PPD-QA-01 | requirements_gap | PRD | resolved | PRD, SD and TP Revision 3 are approved; canonical metadata, generated Codex/Claude/public projections, exact fixtures, 29-code-point assertion, Runtime Integrity and the complete create-agdf regression all match the approved copy contract. | Retain exact local/public copy fixtures and rerun the full projection regression on later metadata changes. |
| PPD-QA-02 | implementation_gap | CD+Tests | resolved | Root `SECURITY.md` and `SUPPORT.md` are canonical English documents preserving all prior private-reporting, version-support, best-effort/no-SLA and routing semantics; English and German participation remains explicit. Public route/build, baseline plus 15 community negative contracts, Runtime Integrity and full package smoke pass. | Retain semantic bilingual guardrails and avoid independent translated policy copies. |
| PPD-QA-03 | implementation_gap | CD+Tests | resolved | `CONTRIBUTING.md`, `GOVERNANCE.md` and `CODE_OF_CONDUCT.md` are canonical English documents with preserved contribution, authority, succession, confidential-reporting and enforcement semantics. English/German participation and German-primary governance remain explicit. Community baseline plus 17 negatives, Runtime Integrity and complete smoke pass. | Retain semantic guards and avoid independently maintained translation copies. |

## Context Graph

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-PUBLIC-PLUGIN-DISTRIBUTION`, `CG-PUBLIC-COMMUNITY-GOVERNANCE`
- context_graph_required_action: none
- context_graph_reconciliation: resolved
- context_graph_gate_effect: none
- context_graph_evidence: The public-distribution node records identity, projection, evidence and
  authority boundaries. The community-governance node now records canonical English security/support
  policies, explicit English/German participation and the no-translation-fork invariant.

## QA Decision Boundary

This `pass` covers repository and exact-bundle readiness, including the canonical English public
community-policy chain. It does not claim that
the plugin is
installed in ChatGPT or Codex, that `agdf.iself.eu` changes are deployed, that Arndt Gold is verified,
that Apps Management authority exists, or that a portal draft, submission, approval or publication
has occurred.
