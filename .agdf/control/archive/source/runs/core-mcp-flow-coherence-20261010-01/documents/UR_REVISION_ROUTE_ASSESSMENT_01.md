# Existing-Run UR revision route assessment

Date: 2026-10-10
Run: core-mcp-flow-coherence-20261010-01
Observed revision: eeda271d-cf03-4430-9701-5ec61410062d
Purpose: user's explicit request to integrate the accepted decision-card concept into this Run, retaining equal exact Approval text during discussion. This assessment/proposal does not reopen a gate or authorize implementation.

## Current result and cause

The approved UR excludes new app approval buttons. Approved PRD and registered unapproved SD depend on it. User requests removing that exclusion and integrating the supported native decision card into the same lifecycle scope; old approvals must remain historical rather than transferred.

The current runtime does not implement that reopening boundary. Both prd_action revise and ur_action revise returned terminal SD status cards, not revision authorization. Source inspection confirms why:

- skill-dispatch/delivery-intake.js urDefinitionPhase requires current_gate UR and missing Approval: UR. Its action is unapproved-draft authoring, not approved-source reopening.
- control-state/run-revision.js prepareLateRevision requires an active structured CD+Tests boundary with all UR/PRD/SD/TP approved and exact current source bindings. This Run is at SD with unapproved design, so it is ineligible.
- reopenPrdRevision handles only approved PRD at SD before any later artefact is linked/approved. This Run already has linked SD, and the earliest changed source is UR, not PRD.
- skill-dispatch/service.js returns the current terminal status presentation when a requested authoring revision phase is declined. That response obscures the unsupported operation; no repeated status request fixes the missing owner path.
- run-recovery is for unsealed/invalid legacy control, not this valid sealed Run. Deliberately damaging a seal to activate it would be a bypass, not a supported revision.

The installed MCP runtime was inspected as well as repository source. Installed files under /Users/arndtgold/Library/Application Support/agdf/mcp/codex-plugin/mcp/0.14.5/node_modules/create-agdf/runtime/core/lib/ reproduce the same UR and CD+Tests conditions and early PRD rejection. This is an actual runtime-policy gap, not just stale repository guidance. No installed runtime was changed.

## Prepared product change

UR_REVISION_PROPOSAL_01.md contains the full existing UR plus the accepted decision-card slice: exact larger-view document, read/discuss/return, three explicit actions, equal later exact Approval text, distinct human origin/tool permission, stale-card protection, confirmed/uncertain feedback, concurrent-click/text behavior and exact native/accessibility/locale evidence. General cockpit redesign and arbitrary writer access remain excluded. The original nine acceptance signals are retained; AC-010 through AC-012 add the explicit interaction outcomes. No model-originated Approval text becomes human evidence.

The proposal is neither the canonical UR nor a run-present record. Canonical UR/PRD/SD and Run State are unchanged; a fresh Approval: UR cannot be applied to this proposal while the current Run remains at SD. The supplementary gate-decision-card Run is not pursued further as the product delivery path under the user's latest direction; no approval, closeout, deletion or lifecycle alteration of that record is claimed.

Following the user's instruction to record the unsupported route, the proposal now explicitly includes it in scope item 8 and AC-013. The declared extension covers approved UR/PRD with linked unapproved SD in an active structured Run before SD/TP approval, implementation or closeout. It requires separate preview/application, exact retained history, invalidation of affected current decisions/bindings, reassessment, renewed gate decisions and qualified concurrency/recovery across Core/CLI/MCP. Other lifecycle boundaries remain outside this extension. Requirements capture does not implement or authorize the bootstrap needed to activate this proposal.

## Required durable revision capability

A qualified early approved-source revision at this exact SD boundary must reuse the existing revision/transaction/archive owners. It must validate target/Run/revision/source identity and reviewed impact, preserve exact old UR/PRD/SD/analyses/approvals/presentations/mappings/receipts before mutation, invalidate the affected current source bindings and user decisions coherently, reassess Brownfield/UX for UR change, synchronize Run/backlog recoverably and return to UR drafting/registration/presentation. New deliberate approvals then follow current gate order. Stale, foreign, unsupported lifecycle, concurrent writes and interrupted archive/Run/backlog steps need tests and explicit recovery; no direct control-table patch or generic reseal.

This would extend the existing permitted revision boundary, which the currently approved UR/PRD/SD intentionally did not authorize. It is a material Core/control change, not document-only authoring. Product authorization to expand this UR does not by itself supply an implemented trusted reopening writer or make a new Core capability tested. A bootstrap/repair decision is needed before changing runtime policy; do not manufacture TP approval or claim that the document proposal already solves the control gap.

## Instruction boundary

The installed ur-definition contract states: “Never edit an approved UR or its approval.” The shared gate-artifact preparation contract requires the existing revision owner and forbids raw Run/reseal bypass. These instructions explain why dependent canonical edits stop here. The user's desired product change is fully recorded; the unresolved decision is how to qualify the missing revision capability, not whether the decision card/text alternative is wanted.

## Resolution after explicit bounded bootstrap authorization

The earlier findings above describe the installed/pre-bootstrap restriction. The user explicitly authorized the limited Core fix outside AGDF. CORE_REVISION_BOOTSTRAP_01.md records the shared-boundary implementation, qualification and actual existing-owner reopening/registration. The integrated UR is now canonical at UR.md, revision 12 / f20105c0-a12d-4635-9f08-d81d1d254a33, digest sha256:b937eb29e750758c842d8abf42325cf3ada6869198b197247e31a7eefd9b2a1b; it is a draft requiring a new deliberate UR decision. Exact old history is verified. No new product Run, approval transfer or remaining product implementation followed. The installed MCP remains the prior runtime; local candidate proof is not installation or native-host proof.
