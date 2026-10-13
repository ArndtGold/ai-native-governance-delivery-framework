# SD derivation review — write permission refinement

Date: 2026-10-10
Reviewer: Codex
Run: core-mcp-flow-coherence-20261010-01
Assurance: cooperative semantic review; not independent human provenance or implementation/QA qualification.
Intent: user requested “schärfe es” after discussing official OpenAI write-tool safeguards and the universal MCP selector's permission granularity.
Approved source: PRD.md, sha256:579386038f52a54fd23d2a253e4927bbde755380e638493614e7ae69539a9097.
Previous SD: SD_BEFORE_SHARPENING_01.md, exact prior registered draft retained; earlier mapping/review/presentation are not overwritten or reused as new approval.

## Review of the refinement

The shared Core selector remains one implementation owner; only its published MCP boundary changes. Five fixed groups distinguish preparation, actual result recording, deliberate approval, supported revision and closeout. Both transport schemas and the serving Core reject cross-group actions. A group disabled at the server is unavailable at discovery and execution. This resolves the earlier universal tool's per-tool consent coupling without adding five gate policies or an arbitrary method API.

Host permission, concrete action intent/confirmation and existing exact gate approval remain separate. Remembered tool consent cannot establish a gate decision or permit different source/OR material. Model flags and instructions embedded in evidence cannot prove human authority. The design preserves cooperative assurance and explicitly avoids fictional host tokens, imported Responses API behavior or new formal gates. Actual local host controls and their limitations must be qualified; required confirmation absent means no sensitive effect. Existing exact user authorization is not repeatedly requested for the same material/effect.

Tool annotations cover actual action modes, including side effects. Preparation is strictly additive immutable output; the remaining groups conservatively disclose destructive/consequential effects. Recovery retains family/current binding and original intent; it does not bypass confirmation or broaden revision eligibility. Read-only inspection remains non-mutating. New per-tool and aggregate budgets are explicit architecture proposals, not OpenAI quotas. Data minimization retains necessary receipt/revision references without unnecessary report/log or secret payloads.

The supported lifecycle, acceptance and QA authority are unchanged. AC-003/005/007/012/013/015 gain concrete design/qualification detail; all 15 PRD criteria still appear once in Acceptance Traceability and all 14 SDD decisions are referenced. The old complete-state, source-history, journal commit-point, current-evidence, app-read-only and locale/foreign-source decisions remain intact. New mandatory scenarios cover host permit/deny, remembered permit without new gate response, cross-group and disabled writes, changed confirmation material and prompt injection. Test IDs/actions remain TP work, not unresolved architecture.

Official OpenAI pages were fetched in the preceding discussion on 2026-10-10 and are linked in SD section 4.2.1. Five groups are a design inference, not a claimed OpenAI requirement. No remote server, installer change or account-authentication flow is added.

## Registration and evidence limits

The bound sd-definition continuation explicitly allowed revision of the registered unapproved SD at revision c1831c61-4b9e-4a3b-9ba7-628f8f038917. Pre-registration Inspect reported artifact_run_integrity after that file changed; it did not assess the changed draft's authoring checks. The existing reviewed artefact update writer must reconstruct the prior binding, protect every other sealed/approved byte and register update_draft=true with a fresh mapping/input. Only after successful canonical replacement can a fresh Inspect/dispatcher result establish current authoring/presentation readiness. No seal repair, raw Run edit or false pre-registration readiness is claimed.

Semantic assessment: refinement stays within the approved PRD and user-requested SD changes; suitable for checked canonical replacement and a new deliberate SD decision, subject to writer/current-source checks. It grants no implementation or QA permission.

Post-registration result: canonical update_draft=true succeeded at revision 9 / eeda271d-cf03-4430-9701-5ec61410062d, with SD digest sha256:4e08695a90e9c03386bbe619f5659a1cea5fda95bed7b0887f7b1a1313573633. Fresh gate-check reported doctor pass, no blocker and presentation_required. Bound artifact-readiness then passed summary, sd-decisions-v1 and criteria-chain-v1 with no diagnostics. Protected UR/PRD/Brownfield/UX digests and retained prior SD were checked before registration. git diff --check exited successfully. These are draft/source/recording checks, not execution, host, QA or release evidence.
