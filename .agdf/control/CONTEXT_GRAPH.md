# AGDF Context Graph

Current nodes point to canonical owners. This graph is not a parallel plan,
validator or approval store. The complete previous graph is preserved at
`archive/source/shared/CONTEXT_GRAPH.md` as historical evidence.

## Node Index

| ID | Type | Status | Title | Evidence | Next Step |
|---|---|---|---|---|---|
| CG-PUBLIC-COMMUNITY-GOVERNANCE | sot_invariant | active | Public policy ownership | Root policies and GitHub adapters | Preserve canonical routing |
| CG-QUALITY-CONTRACT | sot_invariant | active | Shared quality and evidence rules | plugins/agdf/meta/contracts/quality.md | Apply proportionate verification |
| CG-MCP-DISPATCH-ADAPTER | integration_surface | active | Bound MCP continuations and host invocation | [Integration guidelines](../../docs/architecture/09-mcp-integrationsrichtlinien.md); [native evidence](../../docs/development/native-authoring-evidence-2026-11-06.json) | Resolve documented host-invocation and evaluator gaps with source-bound evidence |
| CG-BRAND-GUIDED-UX | integration_surface | active | Project brand source to observable UX criteria | [AGDF brand profile](BRAND.md); [UX owner](../../plugins/agdf/skills/ux-intent-definition/SKILL.md) | Apply source-to-criterion tracing in applicable design work and retain actual observation limits |
| CG-REPOSITORY-ARCHIVE | decision | active | Historical control is read-only archive | docs/reviews/repository-archive-migration-20261102.md | Keep current work in runs/ and planned/ |

## Nodes

### CG-PUBLIC-COMMUNITY-GOVERNANCE

- refs: CODE_OF_CONDUCT.md; CONTRIBUTING.md; SECURITY.md; SUPPORT.md; GOVERNANCE.md; .github/ISSUE_TEMPLATE/; .github/pull_request_template.md; .github/CODEOWNERS; .github/repository-metadata.json
- decision: Root policy files remain canonical. GitHub templates and CODEOWNERS are adapters. The metadata manifest describes desired settings, while GitHub owns effective host state.
- invariants: Confidential reporting and maintainer authority remain governed by the root policies. Local repository checks do not establish applied GitHub settings or native host qualification.
- historical_evidence: archive/source/runs/github-community-health-governance/documents/SD.md
- next_clean_step: Preserve these ownership boundaries in contributions and host observations.

### CG-QUALITY-CONTRACT

- refs: plugins/agdf/meta/contracts/quality.md; CONTRIBUTING.md; docs/development/verification.md; docs/handbook/de/05-abschluss-und-auslieferung.md; docs/development/native-authoring-recovery-2026-11-05.md; docs/development/native-authoring-evidence-2026-11-06.json
- affects: Test selection, result interpretation and evidence reuse across repository checks, installed hosts and human acceptance.
- decision: The shared quality contract owns test selection, evidence applicability and finding rules. SD/TP define the required strategy and executable checks; technical QA and deliberate human approvals remain separate.
- invariants: An older CI run or a local test does not prove a new head or installed host. Required PR/merge checks must correspond to the actual candidate.
- evidence: The [2026-11-06 authoring campaign](../../docs/development/native-authoring-recovery-2026-11-05.md#completed-resumption-campaign-on-2026-11-06) completed 3/3 functional SD/TP paths but 0/3 clean cases. The recorded findings and their interpretation remain separate.
- risk_or_value: Functional completion, execution quality, runtime observation/verification and human acceptance are distinct claims. An evaluator's mapping error must remain visible without erasing an actual observation or retroactively changing the original verdict.
- next_clean_step: Run the smallest sufficient local checks and retain visible evidence gaps.
- exit_criterion: Each reused result identifies its tested source, environment, scope and limits; evaluator findings and untested paths remain explicit. Simulated approvals are not independent human acceptance.
- links: evidenced_by docs/development/native-authoring-evidence-2026-11-06.json; depends_on plugins/agdf/meta/contracts/quality.md.

### CG-MCP-DISPATCH-ADAPTER

- type: integration_surface
- status: active
- title: Bound MCP continuations and host invocation
- introduced_by: Direct repair and documentation follow-up in [PR #58](https://github.com/ArndtGold/ai-native-governance-delivery-framework/pull/58); curated on 2026-11-06 without an AGDF repair Run.
- affects: packages/mcp-server/src/; packages/cli/lib/mcp-lifecycle/; packages/core/lib/control-state/; packages/core/lib/runtime/plugin-provenance.js; scripts/sync-plugin-runtime.js.
- refs: [MCP integration criteria and lessons](../../docs/architecture/09-mcp-integrationsrichtlinien.md#7-erkenntnisse-aus-dem-nativen-fortsetzungstest-vom-6-november-2026); [dated report](../../docs/development/native-authoring-recovery-2026-11-05.md#completed-resumption-campaign-on-2026-11-06); [sanitized result projection](../../docs/development/native-authoring-evidence-2026-11-06.json); [handbook evidence guidance](../../docs/handbook/de/05-abschluss-und-auslieferung.md#native-agententests-lesen); [handbook recovery guidance](../../docs/handbook/de/06-fehlerbehebung.md#der-nächste-werkzeugaufruf-schlägt-fehl).
- decision: Reuse canonical Core validation and writers. Offer concrete bound continuations and correction actions, preserving the original target, Run, revision and operation identity. Resolve logical tool names and transfer text as data at the host invocation boundary; the graph does not duplicate those contracts or implementations.
- invariants: Offered references do not grant permission. Private material transfer and canonical recording remain separate actions. Runtime observation, identity verification and human acceptance must not be conflated.
- evidence: The report binds 3/3 functional completions and 0/3 clean passes to product source b89156e1f1dba9f179299daf3f593d3bd9b2ccbe and candidate 0.30.0+codex.local-92f767cea8eb. Case 01 directly reused a private material.stage/put reference across CLI invocations; it is not a cross-invocation canonical-record witness. Runtime metadata was observed in all three cases; the local CLI setup branch was not exercised.
- risk_or_value: The observed host-code failures and false evaluator mapping remain open. Data-handoff instructions alone did not reliably prevent malformed calling code. A working MCP execution path does not establish an entirely error-free agent workflow.
- next_clean_step: Use the existing [open follow-up table](../../docs/development/native-authoring-recovery-2026-11-05.md#consequences-and-open-follow-up) to address text transfer, host-name resolution and evaluator mapping at their named owners; preserve the original observations and untested-branch boundaries.
- exit_criterion: Close each documented gap only with its owner-linked evidence on the affected host path and exact candidate. Separate missing observations from failed verification; report functional completion, calling-code failures and reached budgets independently. Do not generalize to other hosts, branches or human acceptance.
- links: depends_on CG-QUALITY-CONTRACT; evidenced_by docs/development/native-authoring-evidence-2026-11-06.json; derived_from docs/architecture/09-mcp-integrationsrichtlinien.md.

### CG-BRAND-GUIDED-UX

- type: integration_surface
- status: active
- title: Project brand source to observable UX criteria
- introduced_by: Explicit user-requested English rule and source integration on 2026-11-06; direct implementation without AGDF, preserving existing Runs.
- affects: .agdf/control/BRAND.md; plugins/agdf/meta/contracts/quality.md; plugins/agdf/meta/contracts/modes.md; plugins/agdf/skills/ux-intent-definition/; plugins/agdf/meta/contracts/prd-definition.md; plugins/agdf/meta/contracts/sd-definition.md; docs/handbook/.
- refs: [AGDF-owned English brand profile](BRAND.md); [shared source-use rule](../../plugins/agdf/meta/contracts/quality.md#brand-source-use-across-delivery-paths); [compact delivery connection](../../plugins/agdf/meta/contracts/modes.md); [UX source/criteria owner](../../plugins/agdf/skills/ux-intent-definition/SKILL.md); [PRD owner](../../plugins/agdf/meta/contracts/prd-definition.md); [SD owner](../../plugins/agdf/meta/contracts/sd-definition.md); [existing fidelity review](../../plugins/agdf/meta/contracts/quality.md#ux-intent-fidelity); [handbook](../../docs/handbook/en/03-common-workflows.md#translate-brand-sources-into-observable-ux-criteria).
- decision: Quality owns the shared project-brand source-use rule across existing delivery paths; Modes connects it to compact work without forcing formal artefacts. Applicable UX analysis retains source identity, owner, scope and passages, then derives priorities, scenarios, observable proposed outcomes and evidence. PRD adopts confirmed in-scope criteria and SD selects realization where those stages apply; compact work retains checks in its existing scope/result/evidence.
- invariants: Brand material is design context, not approval or parallel product authority. No extra gate, report schema or universal brand-file requirement is introduced. AGDF's own profile is not another project's default; implementation token values and trademark policy keep their existing owners.
- evidence: .agdf/control/BRAND.md contains the English AGDF intent and illustrative source-to-criterion checks. The Quality/Modes connection, UX/PRD/SD sources and handbook define the handoff within existing fields and authority. Presence of these instructions is not native model compliance or delivered-UI acceptance evidence; the earlier SD/TP campaign did not exercise this new rule.
- risk_or_value: Unread, missing, stale or contradictory brand sources and generic adjectives can leave material design decisions unresolved. The Quality Contract requires a SHA-256 digest of the consumed bytes when a matching Git revision is unavailable. Use the existing clarification path for a source that cannot be bound.
- next_clean_step: In an authorized applicable design task, trace the declared source passage to adopted criterion IDs, SD realization and actual observed behavior; retain missing evidence and user-observation limits.
- exit_criterion: Relevant criteria have source/version provenance, approved scope, a responsible realization owner and appropriate task/rendering evidence. Irrelevant brand input has a justified applicability decision; an otherwise required UX analysis remains required. Material source conflicts remain visible through existing owners. Do not claim automatic enforcement or independent human acceptance from guidance checks.
- links: depends_on CG-QUALITY-CONTRACT; derived_from .agdf/control/BRAND.md; evidenced_by plugins/agdf/skills/ux-intent-definition/SKILL.md.

### CG-REPOSITORY-ARCHIVE

- refs: config.json; archive/INDEX.json; scripts/import-cockpit-archive.mjs; packages/core/lib/control-inspect/cockpit-archive.js; docs/maintenance/cockpit-archive-import.md
- decision: Current control uses run-folders-v1. Historical Runs, artefacts and shared files are preserved as cockpit-archive/1 with original byte digests.
- invariants: Historical approvals grant no current authority. The master backlog and old Run formats are not executable current control. Local backup copies and unpublished stages are excluded from Git.
- next_clean_step: Use runs/ and planned/ for current work; use the read-only archive for historical sources.
