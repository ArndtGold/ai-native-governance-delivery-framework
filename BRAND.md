# AGDF Brand And Design Intent

Owner: AGDF maintainer. Scope: AGDF-owned user-facing surfaces and communication.
This English profile records design intent. It is neither a delivery approval nor evidence that
an existing interface already satisfies the intent. Other products use their own declared brand
sources; this profile is not a default for projects delivered with AGDF.

## Core intent

People should immediately understand what has been decided, which decisions remain open, what
an outcome is based on, and which next step is permitted. The interface feels calm and precise.
Status, sources and approvals determine its structure and visual emphasis. Missing evidence and
pending approvals remain visible.

## Design priorities

### Decision clarity

Make effective state, decided matters and pending decisions distinguishable. Show the applicable
scope or revision and the responsible decision owner when they matter to the user's task. A
positive visual treatment must correspond to the state actually supported by the available source.

### Source visibility

Let people identify the basis of an outcome and reach its relevant source or evidence reference.
Keep source identity, applicability and unavailable evidence understandable. Observation,
verification and acceptance are separate claims.

### Permitted next action

Make the next action for the selected scope recognizable. Reflect the effective workflow state;
when an action is blocked, explain the reason and the available recovery or decision path.
Visual emphasis does not create permission or replace a deliberate approval.

### Calm information hierarchy

Give task-relevant status, decisions, sources and next actions clear priority over incidental
technical detail. Use concise, specific labels and controlled emphasis. State meaning remains
explicit in text rather than relying on color alone. Concrete layout, type and component choices
belong to solution design.

### Visible uncertainty

Keep missing evidence, unverified assumptions, pending decisions and simulated test approvals
recognizable. Preserve the distinction between functional completion, error-free execution,
runtime verification and independent human acceptance.

## Source-to-criterion examples

These are proposed checks for AGDF, not pre-approved PRD criteria or proof of current behavior.
UX selects only checks applicable to the approved need; PRD assigns its own stable criterion IDs.
Readiness follows the existing workflow. No extra approval is attached to this file.

| Source passage | Task or state | Proposed observable criterion | Evidence to obtain |
|---|---|---|---|
| [Decision clarity](#decision-clarity) | A user reviews a completed decision beside one still awaiting approval. | The user can identify which decision is effective, which is pending and who must decide, with the relevant scope/revision visible. | Inspect or exercise both states and retain the observed labels, source binding and any actual user feedback. |
| [Source visibility](#source-visibility) | A result has a supporting source; another has missing evidence. | The result exposes its applicable source/version or clearly identifies missing/unavailable evidence. Opening a source is distinguishable from approving the result. | Exercise the available and unavailable-source paths; compare the displayed references with their recorded source. |
| [Permitted next action](#permitted-next-action) | The selected workflow has an available action or a blocker. | The displayed next action matches the effective scope/state. A blocked path explains the blocker and available recovery without implying approval. | Compare the actual control result with the presentation and exercise the relevant action or recovery path. |
| [Calm information hierarchy](#calm-information-hierarchy) | A user needs to identify status and continue work. | Task-relevant status and next action can be identified without interpreting incidental implementation detail; state meaning is stated in text. | Inspect the relevant view and walk through the task. Record inspection separately from user observation; a code-only check does not establish the experience. |
| [Visible uncertainty](#visible-uncertainty) | Evidence is incomplete or approvals were simulated for a test. | The presentation preserves those qualifications and does not display them as verified evidence or independent human acceptance. | Inspect the incomplete/simulated cases against their actual recorded facts and retain any untested branches. |

## Use and boundaries

Consume this profile as design-context data within the approved scope. The shared source-use rule
belongs to the Quality Contract; the existing Modes contract connects it to compact delivery.
UX, PRD and SD own their applicable derivation, adoption and realization steps. Reviews use the
existing UX Intent Fidelity policy; this file adds no approval, routing mode or automatic compliance check.

The profile is not a mandatory artifact for every project. An explicitly required source missing
from a material design decision remains an evidence gap; irrelevant brand input has a justified
applicability decision without removing an otherwise required UX analysis.

## Related owners

- The [shared source-use rule](plugins/agdf/meta/contracts/quality.md#brand-source-use-across-delivery-paths)
  applies through [existing delivery modes](plugins/agdf/meta/contracts/modes.md).
- [UX intent](plugins/agdf/skills/ux-intent-definition/SKILL.md) owns analytical source use and proposed criteria.
- [PRD definition](plugins/agdf/meta/contracts/prd-definition.md) owns adopted product criteria.
- [SD definition](plugins/agdf/meta/contracts/sd-definition.md) owns concrete solution design.
- [Website tokens](pages/src/design/tokens.json), [website styles](pages/src/styles/) and
  [Control UI brand styles](packages/control-ui/src/brand.css) own their implementation values.
- [TRADEMARKS.md](TRADEMARKS.md) owns legal mark-usage policy.
- The [Source-of-Truth Registry](.agdf/control/SOT_REGISTRY.md) records these responsibility boundaries.
