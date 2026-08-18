# QA Report: Public AGDF Plugin Distribution

Status: revise
Decision: `revise`
Revision: 14
Date: 2026-08-18
Run: `agdf-public-plugin-distribution`

## Quality Readiness

| Dimension | Result | Evidence |
|---|---|---|
| Plan coverage | revise | PPD-T17 and PPD-21 are fulfilled, but PPD-T18 lacks current full-smoke evidence because the existing version contract is incoherent. |
| Solution integrity | pass | The root documents remain their canonical owners; no translated copy or parallel policy structure is required. |
| Code quality | pass | Code Review Revision 9 finds no correctness, security, compatibility or maintainability defect in the plain-English, handbook or semantic-validator diff. |
| QA decision | revise | `qa-gate` is the sole decision owner; PPD-QA-04 and PPD-QA-06 are resolved, PPD-QA-05 keeps the full-regression evidence gap open and PPD-QA-07 routes the bilingual-handbook intent to PRD Revision 4. |

## QA Gate

- decision: `revise`
- evidence: approved PRD/SD/TP Revision 3; passing Brownfield Analysis Revision 2; completed
  plain-English correction PPD-QA-04; Task Plan, Clean and Code reviews Revision 8; community-health
  baseline plus 17 negative contracts; ten-document local-link scan; Runtime Integrity; Pages check
  and build; refreshed PPD-L01 bundle inspection;
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
- required_next_step: Resolve the existing `0.13.0`/`0.12.0` version contract through its owning
  release change, rerun the complete create-agdf and AGDF CLI smoke suites, refresh TP Review and
  rerun QA. External actions remain forbidden.
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
| PPD-QA-04 | implementation_gap | CD+Tests | resolved | All ten English root documents were revised in place. Installation now has a clear user route and optional advanced section; dense paragraphs are split; `legal next steps` is now `permitted next steps`; formal policy phrases were simplified. Community-health baseline plus 17 negatives, local links, Runtime Integrity and Pages checks pass. | Retain plain-English wording and semantic negative contracts without creating translated policy copies. |
| PPD-QA-05 | evidence_gap | evidence_obligation | open | Both full smoke commands stop before their suites because untouched canonical/package version `0.13.0` conflicts with capability matrix, reviewer cases and release notes at `0.12.0`. Git confirms these version-owner files are unchanged by the documentation revision. | Resolve the version contract through its owning release change, rerun both complete smoke suites and refresh TP Review and QA. |
| PPD-QA-06 | implementation_gap | CD+Tests | resolved | The seven-file Coding Agent Handbook now describes all current Delivery paths, exact gate effects, post-TP Brownfield Analysis, mandatory Code Review, QA/UAT routing, Run-versus-worktree boundaries and safe migration. Community-health requires all seven files, checks ten semantic meanings, rejects four harmful legacy phrases and passes its 18th negative contract. | Retain the handbook as one German semantic owner until a separately approved language strategy is implemented. |
| PPD-QA-07 | requirements_gap | PRD | open | The user selected a new bilingual handbook product contract: German remains canonical, English becomes a controlled derived translation, a neutral language selector is added and the legacy German path remains compatible. Revision 3 did not define translation authority, structure, parity, review or drift behavior. | Review PRD Revision 4 and provide exact `Approval: PRD`, request revision or decline. Do not move or translate handbook files before approval and subsequent SD/TP approval. |

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

This `revise` decision confirms that the bounded plain-English and German handbook corrections are
complete, keeps the independent full-regression evidence gap open and routes the new bilingual
handbook decision to unapproved PRD Revision 4. No bilingual structure or translation is authorized
yet. It does not claim
that the plugin is installed in ChatGPT or Codex, that `agdf.iself.eu` changes are deployed, that
Arndt Gold is verified,
that Apps Management authority exists, or that a portal draft, submission, approval or publication
has occurred.
