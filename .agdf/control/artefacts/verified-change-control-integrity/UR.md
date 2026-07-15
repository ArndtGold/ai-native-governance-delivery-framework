# User Requirement: Repair Verified Change Control Integrity and Proportionality

## Work Item

- key: `verified-change-control-integrity`
- title: Align Verified Change skills, path handling, control artefacts and proportional static-content delivery
- revision: 2
- status: approved
- approval: renewed exact `Approval: UR` received for revision 2 on 2026-07-15 after same-run and same-gate revalidation

## User Need

The first real bounded Pages use of Verified Change exposed contract, skill and validator friction. The framework should preserve Verified Change as a fail-closed, machine-evidenced path while removing internal inconsistencies and artificial ceremony that do not improve delivery confidence.

## Desired Behavior

1. Brownfield Review guidance and output schemas consistently support `verified_change` wherever the Runtime Contract permits it.
2. Repository-relative artefact paths are parsed consistently whether or not Markdown code-span formatting is used in human-readable control tables.
3. Mandatory run-owned control artefacts, including UR, Brownfield Review and OR, do not become false Verified Change scope escapes or need to be misclassified as product-derived paths.
4. Deterministically verifiable static-content changes can use the smallest safe compact path without subjective size judgments, implicit exclusions or a silent quality bypass.
5. Generated and installed skill/runtime surfaces remain synchronized with the canonical sources.
6. A native gate adapter is used only when it can preserve the exact canonical approval value independently of recommendation styling or other host-owned label decoration; otherwise AGDF must select the exact-text fallback before invocation.

## Acceptance Criteria

1. Brownfield skill rules and output shape include `verified_change` and match the canonical Runtime Contract.
2. Automated tests prove code-spanned and plain repository-relative artefact paths resolve identically and remain safely confined to the repository.
3. Automated tests prove required run-owned control artefacts are permitted while unrelated new paths still fail closed with `AGDF_VERIFIED_CHANGE_SCOPE_ESCAPE`.
4. The proportional static-content rule is explicit, path- and evidence-bounded, machine-checkable and preserves the established Verified Change guarantees: no subjective size assessment, explicit exclusion criteria and no silent quality bypass.
5. The original contact-email scenario can close without treating its OR as a product-derived artefact.
6. Runtime integrity, routing/control-state tests, relevant package smoke tests and whitespace validation pass.
7. Regression tests prove that a decorated host label such as `Approval: PRD (Recommended)` never authorizes a gate, and that an adapter unable to return an exact canonical value is classified as unavailable before invocation without a futile native prompt.

## Scope Boundary

In scope: canonical Runtime Contract, Brownfield/gate-check/release guidance, native approval adapter capability handling, Verified Change parsing/evaluation, matching templates/generated surfaces and focused regression tests.

Out of scope: weakening exact approvals, stripping or silently normalizing decorated approval labels into authority, broad content-based heuristics, automatic commits/releases, changing the delivered contact-email product behavior, or fixing unrelated active runs.

## Evidence And Approval

- runtime authority: `plugin/meta/agdf-runtime-contract.md`.
- Brownfield skill source: `plugin/skills/brownfield-analysis/SKILL.md` and generated/installed mirrors.
- evaluator source: `create-agdf/bin/create-agdf.js` and focused control-state tests.
- native interaction sources: `plugin/meta/agdf-plugin.definition.json`, `plugin/meta/agdf-runtime-contract.md`, `create-agdf/lib/interaction-presentation.js` and interaction-presentation tests.
- observed reproduction: `.agdf/control/artefacts/pages-contact-email/VERIFIED_CHANGE.md` and its completed run state.
- observed native reproduction: Codex `request_user_input` returned `Approval: PRD (Recommended)` even though the canonical payload and validator require exact `Approval: PRD`.
- approval: renewed exact `Approval: UR` received for revision 2 on 2026-07-15 after same-run and same-gate revalidation.
