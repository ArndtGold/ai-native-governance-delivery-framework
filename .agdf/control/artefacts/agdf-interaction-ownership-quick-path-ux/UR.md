# UR: Clarify Interaction Ownership and Proportional Quick-Path UX

Status: approved
Gate: UR
Prior gate approval: `Approval: UR` provided on 2026-07-18 for the earlier three-finding scope; the
local-validator availability addition below materially expands the scope and requires renewed approval.
Current gate approval: `Approval: UR` provided on 2026-07-18 for the expanded four-finding scope after
same-run, same-gate revision revalidation.
Date: 2026-07-18
Owner: agent

## 1. Problem

External review of AGDF 0.10.0 identified four credible maintainability, context, availability and
adoption risks:

1. `gate-check/SKILL.md` repeats a large part of the normative native-interaction policy that is
   already owned by `plugin/meta/contracts/interaction.md`. Runtime-integrity checks currently lock
   several duplicated prose fragments into the skill, increasing drift risk and weakening the
   contract module as the single normative owner.
2. AGDF uses `quick_task` for both genuinely ungated work and a compact delivery path selected after
   an approved UR and Brownfield Review. The underlying risk classification is intentional, but the
   shared terminology and separately visible Mode/Slice step can make small work appear more
   ceremonial than it is and encourage users to bypass the framework.
3. The global OpenCode installer injects the same Global OpenCode Surface Boundary into all nine
   installed skills even though the same boundary is also present in the globally loaded `AGDF.md`.
   The copies are generated from one function, so this is not currently nine-source authoring drift,
   but it is installed-artifact and per-skill context redundancy. The adjacent focused Runtime Contract
   reference blocks are not identical policy copies: their module lists intentionally differ by skill
   and should remain explicit unless an equally focused dependency mechanism replaces them.
4. Skills route deterministic `init`, `doctor`, `gate-check`, `delivery-map` and Delivery Path Search
   checks to `npx --yes @agdf/cli@latest` when no `agdf` executable is installed. Codex and Claude
   plugin bundles do not currently expose an owned local validator, while OpenCode installs
   `create-agdf` under its config-local `node_modules` without placing that binary on the normal shell
   `PATH`. Routine machine-readable validation can therefore depend silently on network access and the
   moving registry `latest` version instead of the installed plugin version.

## 2. Goal

Make native-interaction ownership unambiguous and make the smallest safe delivery path feel
proportional without weakening exact approvals, evidence requirements, Brownfield checks or
fail-closed escalation.

## 3. Required Outcomes

- `plugin/meta/contracts/interaction.md` is the single normative prose owner for native-interaction
  envelopes, presentation order, locale behavior, adapter capability, fallback and outcome semantics.
- `gate-check/SKILL.md` retains only the concise gate-specific orchestration needed to invoke that
  contract: select and evaluate the run, confirm readiness, consume the canonical presentation,
  revalidate after deliberate input and persist through the existing workflow.
- Runtime-integrity tests verify contract ownership, focused references and required operational
  boundaries without requiring a second copy of normative interaction prose in the skill.
- Pure ungated Quick Tasks and the post-UR compact delivery path are distinguishable in human-facing
  guidance while preserving compatible machine values unless Brownfield Review proves a migration is
  necessary.
- Brownfield Review and Mode/Slice selection are presented as one compact internal routing operation
  whenever the review has enough evidence to decide the path; no new user approval or conversational
  turn is introduced for Mode/Slice selection.
- The Global OpenCode Surface Boundary has one effective runtime owner. Global skills retain only the
  smallest fail-closed activation guard needed when standard global instructions cannot be proven to
  load; they do not repeat the full boundary by default.
- Focused Runtime Contract dependencies remain discoverable per skill and are validated as resolvable;
  the change must not replace them with an indiscriminate all-contract context load.
- Routine machine-readable validation resolves an owned, version-matched local validator on supported
  plugin runtime surfaces without fetching `@latest`. Registry-resolved `npx` remains limited to
  explicit installation, bootstrap or refresh.
- Every surface exposes validator availability and evidence honestly. Instruction-only or repository-
  only surfaces that cannot own a local executable must fail transparently to agent-native inspection
  or an explicit pinned installation step; they must not imply that local deterministic validation ran.
- The implementation keeps the smallest safe path visible and fails closed when impact or eligibility
  is ambiguous.

## 4. Non-Goals

- Removing UR approval for new product semantics or user-visible behavior.
- Treating task size alone as proof that governance may be skipped.
- Weakening exact `Approval: <GateName>` authority, Brownfield evidence, Code Review, QA or UAT rules.
- Introducing a second interaction contract, renderer or surface-specific gate model.
- Breaking persisted `quick_task` run records merely to improve human-facing terminology.
- Removing focused per-skill Runtime Contract dependencies solely because their headings and reference
  syntax share a common shape.
- Automatically installing an unpinned global executable, silently contacting the registry during a
  routine gate check, or making CLI availability a new source of gate authority.

## 5. Acceptance Signals

- Normative native-interaction rules have one prose owner and generated surfaces remain complete.
- Focused integrity tests fail when the contract reference or gate-specific revalidation boundary is
  removed, but do not require duplicated adapter and outcome prose in `gate-check`.
- User-facing documentation clearly distinguishes an ungated Quick Task from compact post-UR delivery.
- A completed Brownfield Review can record its Mode/Slice selection in the same operation and does not
  create a redundant user-facing decision step.
- A normal global OpenCode installation does not embed the full surface-boundary preamble in all nine
  skill bodies, while a missing or invalid `.agdf/control/config.json` still fails closed in focused
  installation and runtime tests.
- Each skill's focused Runtime Contract module dependencies remain valid after generation and global
  installation without loading unrelated modules.
- A normal supported plugin installation can run its matching `doctor`, `gate-check` and `delivery-map`
  validators through an owned local path while offline; the observed validator version matches the
  installed AGDF surface.
- When no conforming local validator exists, the skill reports that machine validation is unavailable,
  continues only with the allowed agent-native path, and names an explicit pinned recovery action.
- Routine skill execution contains no automatic `npx --yes @agdf/cli@latest` fallback.
- Runtime integrity, interaction presentation, control-state, skill evaluation and package smoke tests
  pass with no weakened assertions.

## 6. Existing Owners and Brownfield Questions

- Normative interaction policy: `plugin/meta/contracts/interaction.md`.
- Gate transition and Mode/Slice policy: `plugin/meta/contracts/gate-transition.md` and
  `plugin/meta/contracts/modes.md`.
- Gate orchestration skill: `plugin/skills/gate-check/SKILL.md`.
- Deterministic presentation: `create-agdf/lib/interaction-presentation.js`.
- Integrity enforcement: `plugin/scripts/check-runtime-integrity.mjs` and
  `create-agdf/scripts/runtime-integrity-negative-test.js`.
- Generated-surface propagation: `create-agdf/scripts/sync-package-assets.js`.
- Global OpenCode boundary injection: `create-agdf/lib/installers/opencode.js`
  `globalOpenCodeBoundary()` and `installOpenCodeGlobalSurface()`.
- Global OpenCode instruction loading: generated `.opencode/AGDF.md` plus global `opencode.json`
  `instructions` configuration.
- CLI packages and executable owners: `agdf/bin/agdf.js`, `create-agdf/bin/create-agdf.js`,
  `create-agdf/package.json`, surface installers and plugin package layouts.

Brownfield Review must determine whether human-facing terminology can be clarified without changing
the persisted mode enum, and which current integrity assertions should become ownership assertions
rather than prose-presence assertions. It must also prove whether OpenCode always loads the owned global
instruction boundary before a global skill; if that cannot be guaranteed, retain one compact skill-local
fail-closed guard rather than the full repeated preamble.
Brownfield Review must additionally decide the smallest cross-surface packaging and resolver design
that provides version-matched offline validation without copying evaluator policy or assuming that a
package-manager bin directory is on `PATH`.

## 7. Risks

- Over-compressing `gate-check` could make the skill non-operational on hosts that do not reliably load
  referenced contracts; packaging and skill-evaluation evidence must prove the reference path remains
  usable on every supported surface.
- Renaming a persisted enum could break existing runs and parsers; compatibility is preferred unless a
  migration is explicitly designed and approved.
- Hiding Mode/Slice evidence in the name of simplicity could create an implicit governance bypass;
  evidence remains durable even when the interaction is compact.
- Removing the skill-local OpenCode activation check without proving instruction loading could apply
  AGDF governance in an unactivated repository; the refactor must fail closed under missing or invalid
  durable control.
- Bundling or resolving validators differently per surface could create version skew or duplicate CLI
  owners; the design must reuse `create-agdf/cli`, verify exact version parity and keep one evaluator
  implementation.

## 8. Next Step

Proceed with repeated Brownfield Review for the expanded four-finding scope and record the updated
Mode/Slice Decision before the PRD becomes approval-ready.
