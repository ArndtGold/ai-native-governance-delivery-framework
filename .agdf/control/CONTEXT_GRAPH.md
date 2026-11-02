# AGDF Context Graph

Current nodes point to canonical owners. This graph is not a parallel plan,
validator or approval store. The complete previous graph is preserved at
`archive/source/shared/CONTEXT_GRAPH.md` as historical evidence.

## Node Index

| ID | Type | Status | Title | Evidence | Next Step |
|---|---|---|---|---|---|
| CG-PUBLIC-COMMUNITY-GOVERNANCE | sot_invariant | active | Public policy ownership | Root policies and GitHub adapters | Preserve canonical routing |
| CG-QUALITY-CONTRACT | sot_invariant | active | Shared quality and evidence rules | plugins/agdf/meta/contracts/quality.md | Apply proportionate verification |
| CG-REPOSITORY-ARCHIVE | decision | active | Historical control is read-only archive | docs/reviews/repository-archive-migration-20261102.md | Keep current work in runs/ and planned/ |

## Nodes

### CG-PUBLIC-COMMUNITY-GOVERNANCE

- refs: CODE_OF_CONDUCT.md; CONTRIBUTING.md; SECURITY.md; SUPPORT.md; GOVERNANCE.md; .github/ISSUE_TEMPLATE/; .github/pull_request_template.md; .github/CODEOWNERS; .github/repository-metadata.json
- decision: Root policy files remain canonical. GitHub templates and CODEOWNERS are adapters. The metadata manifest describes desired settings, while GitHub owns effective host state.
- invariants: Confidential reporting and maintainer authority remain governed by the root policies. Local repository checks do not establish applied GitHub settings or native host qualification.
- historical_evidence: archive/source/runs/github-community-health-governance/documents/SD.md
- next_clean_step: Preserve these ownership boundaries in contributions and host observations.

### CG-QUALITY-CONTRACT

- refs: plugins/agdf/meta/contracts/quality.md; CONTRIBUTING.md; docs/development/verification.md
- decision: The shared quality contract owns test selection, evidence applicability and finding rules. SD/TP define the required strategy and executable checks; technical QA and deliberate human approvals remain separate.
- invariants: An older CI run or a local test does not prove a new head or installed host. Required PR/merge checks must correspond to the actual candidate.
- next_clean_step: Run the smallest sufficient local checks and retain visible evidence gaps.

### CG-REPOSITORY-ARCHIVE

- refs: config.json; archive/INDEX.json; scripts/import-cockpit-archive.mjs; packages/core/lib/control-inspect/cockpit-archive.js; docs/maintenance/cockpit-archive-import.md
- decision: Current control uses run-folders-v1. Historical Runs, artefacts and shared files are preserved as cockpit-archive/1 with original byte digests.
- invariants: Historical approvals grant no current authority. The master backlog and old Run formats are not executable current control. Local backup copies and unpublished stages are excluded from Git.
- next_clean_step: Use runs/ and planned/ for current work; use the read-only archive for historical sources.
