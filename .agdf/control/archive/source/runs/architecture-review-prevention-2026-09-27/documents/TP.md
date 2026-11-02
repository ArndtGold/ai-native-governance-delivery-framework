# TP: Prevent Architecture Debt in Brownfield Review

Status: draft
Gate: TP
Gate approval: open
Based on: approved PRD revision 11 and approved SD revision 14 (sha256:4127fe0700fa658bea1b1e1a95a350dd5eb0a55f8597cb3662e07aef0321e57d)
Date: 2026-09-28
Owner: Arndt Gold (AGDF Brownfield policy)

## 1. Task List

- T1-T3: Extend the existing Brownfield skill and review record while keeping Modes and Quality as the sole policy owners.
- T4-T5: Check the defined scenarios and project the canonical source into the host packages.
- T6-T7: Observe all four hosts in fresh sessions and reconcile review findings before QA.

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| T1 | Extend `plugin/skills/brownfield-analysis/SKILL.md` in `post_ur_review` only: conditional architecture relevance; evidence and missing evidence; problem versus justified trade-off; named next owner; evidence-backed `architecture-not-applicable`; optional diagram rule. Refer to the existing Modes and Quality contracts instead of copying their matrices. | AC-ARCH-01, 02, 04, 05, 07; AD-01, 03, 04 | Skill diff and scenario outputs showing the relevant and low-impact paths, their evidence, and the existing route. |
| T2 | Extend `plugin/control/templates/artefacts/BROWNFIELD_REVIEW.md` with the compact Architecture Impact fields from AD-02. Keep the four-column Reuse And Parallel-Structure Risk table as the finding index; tie a retained-debt detail block to the same finding and require rationale, accountable owner, mitigation and review date or exit condition. | AC-ARCH-01, 02, 03, 04, 05; AD-02 | Template diff and completed example records; an incomplete retained-debt entry remains unresolved. |
| T3 | Make only the minimal cross-reference needed in `plugin/meta/contracts/gate-transition.md`. Keep `modes.md` as sole structured-depth policy and `quality.md` as sole normalized gap route. Do not add a gate, decision taxonomy, debt registry or downstream-review substitute. | AC-ARCH-05; AD-03 | Source-owner comparison and focused review of the skill, template, gate-transition, Modes and Quality diffs. |
| T4 | Extend `plugin/scripts/check-runtime-integrity.mjs` and the existing Brownfield skill-evaluation cases for the new fields and boundaries. Cover relevant risk, intentional trade-off, incomplete accepted debt, missing decisive evidence, low-impact not-applicable, owner routing and optional diagrams. Keep deterministic replay distinct from live-host proof. | AC-ARCH-01 through 05, 07; AD-01 through 04 | Structural check output, scenario observations with source fingerprints, failure-case evidence, and a short limitations note. |
| T5 | Regenerate host packages from canonical `plugin/` with `create-agdf/scripts/sync-package-assets.js`. Review any Copilot payload-budget growth with an exact inventory and reason. Inspect source and generated payload parity before installation. | AC-ARCH-05, 06 | Source-to-generated inventory/digests and package-integrity result; no generated profile edited as a separate authority. |
| T6 | Install the changed plugin on Codex, Claude, Copilot and OpenCode, start a fresh session on each, and observe one relevant and one low-impact Brownfield case where the host is available. Record loaded version/provenance, prompt, response, artefact and limitations separately per host. | AC-ARCH-01 through 07, especially 06 | Four host-specific fresh-session records. A missing or stale host stays `unobserved`, never `pass`. |
| T7 | Complete Task Plan Review, Clean Implementation Review and Code Review on the actual change; reconcile every finding through the existing `requirements_gap`, `design_gap`, `plan_gap`, `implementation_gap` or `evidence_gap` route before QA. | AC-ARCH-01 through 07; AD-03 | Review artefacts linked to changed paths, requirements, design decisions and available evidence. |

The existing post-TP Brownfield Analysis precedes implementation. It confirms current owners,
reuse paths and the smallest safe edit set; any newly discovered product or design gap returns to
its existing PRD or SD owner. The tasks above start only when that analysis and the TP gate permit
implementation.

## 2. Test Plan

1. **Contract and template inspection:** Check the conditional trigger, not-applicable reason,
   evidence/owner fields and retained-debt detail against AD-01 to AD-04. Confirm the Modes depth
   matrix and Quality gap taxonomy each still have one normative owner. Inspect a case where a
   diagram is useful and a simple case where it is omitted.
2. **Focused scenario evaluation:** Use the existing Brownfield evaluation corpus and record
   concrete outputs for a changed ownership/interface boundary, a defensible trade-off, an
   incomplete debt acceptance, missing decisive evidence, and a low-impact local change. An
   incomplete acceptance must not be described as accepted; missing decisive route evidence must
   use the existing `block` recovery. Deterministic replay proves its defined assertions only.
3. **Package integrity:** Run the existing runtime-integrity and package projection checks on the
   canonical source and generated host payloads. If the Copilot payload exceeds its recorded
   budget, review the exact file/byte inventory before adjusting the budget; retain the reason.
4. **Direct host acceptance:** After installation and full restart, observe Codex, Claude,
   Copilot and OpenCode in fresh sessions. For each host, capture the installed/loaded version or
   provenance, the relevant and low-impact prompts, the resulting Brownfield guidance/artefact,
   and any missing capability. Compare against the approved PRD criteria. Package parity alone
   does not count as fresh-session evidence.
5. **Review and QA handoff:** Map T1-T7 evidence to AC-ARCH-01 through AC-ARCH-07. Report any
   unobserved host, failed scenario or unresolved review finding explicitly; do not claim QA pass
   or cross-host acceptance from partial evidence.

Arndt Gold is accountable for acceptance of the Brownfield policy and the four-host evidence.
The delivery implementer operating each host records that host's direct observation and supplies
it for Arndt Gold's review. If no operator can access a host, that host remains unobserved and
cross-host acceptance stays open. This resolves the PRD's deferred TP assignment question.

## 3. Brownfield Scope

Inspect the current `brownfield-analysis` skill, `BROWNFIELD_REVIEW.md` template,
`gate-transition.md`, `modes.md`, `quality.md`, runtime-integrity checks, existing Brownfield
evaluation cases, package projection and host installer paths. Preserve the split between
`post_ur_review` and `pre_implementation_analysis`. Use the approved UR, PRD and SD as the scope
boundary. The existing Brownfield Analysis after TP approval must record reuse and regression
impact before code changes begin.

## 4. Out Of Scope

- New gate, approval authority, architecture-review skill, debt registry or duplicate findings table.
- Rewriting the Modes depth matrix or Quality gap taxonomy in the Brownfield skill.
- Retrofitting untouched historical Brownfield Reviews or remediating all existing debt.
- Requiring diagrams for every change or treating a diagram as a substitute for source evidence.
- Claiming live-host support from generated packages or a loaded but stale session.

## 5. Risks And Blockers

| Risk or blocker | Disposition and next action |
|---|---|
| Broad trigger language could turn local changes into exhaustive reviews. | Revise T1/T2 if the low-impact scenario cannot record an evidence-backed not-applicable reason without new ceremony. |
| A documented trade-off could be mistaken for approved debt. | Block acceptance of that finding until rationale, accountable owner, mitigation and finite review/exit condition are present in the same Brownfield record. |
| A new check could duplicate Modes or Quality ownership. | Revise the change to a cross-reference and remove the parallel rule before QA. |
| Generated content or installed plugins could drift from canonical source. | Rebuild through the existing projection/installer; keep source, package, installed version and fresh-session observations separate. |
| Any agreed host remains unavailable or stale. | Mark it unobserved and keep cross-host acceptance open; Arndt Gold decides the recovery schedule without treating partial evidence as a pass. |

## 6. Next Step

Review this Task/Test Plan and approve only with:

`Approval: TP`
