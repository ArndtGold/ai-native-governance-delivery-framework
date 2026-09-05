# UR: Request-Intent Activation Boundary

Status: approved
Gate: UR
Gate approval: `Approval: UR` accepted on 2026-09-04
Date: 2026-09-04
Owner: Arndt Gold

## 1. Problem

AGDF can become visible for ordinary read-only requests such as project assessments, explanations,
comparisons, reviews or diagnoses even when the user has not requested implementation, a formal
delivery artefact or an AGDF operation. Current routing, Quick Task and read-only-orientation rules
do not define one consistent abstention boundary. High-weight skill descriptions and session
guidance can therefore cause `gate-check` to be selected before delivery intent exists.

After that selection, the executable dispatcher has no activation kind or abstention outcome. It
evaluates target and control state as if AGDF applicability were already proven. In a repository
without `.agdf/control`, an ordinary assessment and an explicit implementation request can therefore
produce the same missing-control UR response. An explicit control-initialization request can also
fall into a repeated `Approval: UR` loop instead of a dedicated lifecycle path.

## 2. Goal

Make automatic AGDF activation depend on the effect requested by the user. Ordinary read-only work
must remain normal assistant work without AGDF skill selection, dispatch, control inspection,
status cards or approval prompts. AGDF must still activate for an explicit implementation or
delivery request, an explicit AGDF operation, or an unambiguous continuation of an active AGDF run.

The safety principle is:

> Ambiguity blocks mutation, but does not automatically activate AGDF.

## 3. Scope

- Define one canonical request-activation contract before AGDF target resolution and repository
  activation. It must distinguish at least ordinary read-only work, delivery intent, explicit AGDF
  operations, active-run continuation and ambiguous effect.
- Base classification on requested effect rather than isolated keywords. Advice about a possible
  implementation remains read-only unless the user requests implementation or a formal delivery
  artefact.
- Make canonical router guidance, skill discovery descriptions, session guidance and generated host
  projections consume the same activation contract.
- Add an applicability preflight and a silent abstention path so false-positive skill discovery can
  return to ordinary handling before target resolution or control access.
- Decide whether the dispatcher needs a validated activation kind and a versioned
  `not_applicable` outcome. Preserve prompt privacy and avoid implementing a second natural-language
  policy engine inside the dispatcher.
- Separate missing-control behavior by request class. Delivery intake may produce the existing
  minimal UR path. Explicit status and explicit control lifecycle requests must not be converted
  into an unrelated synthetic UR approval loop.
- Add negative, positive, mixed-intent and continuation routing tests in German and English, plus
  separately evidenced fresh-session checks for supported hosts.
- Preserve exact gate approval, task-target, repository-activation, control-state and presentation
  authority after AGDF has legitimately activated.

## 4. Non-Goals

- No second global SessionStart or per-prompt hook as the primary activation policy.
- No remote intent classifier, registry call or raw prompt persistence.
- No weakening of approval, gate, target, provenance or mutation safeguards.
- No automatic implementation when the requested effect is ambiguous.
- No claim that repository tests prove loaded-host behavior.
- No modification of the independently scoped `cross-surface-executable-skill-dispatcher` QA
  evidence or `opencode-native-dispatch-tool` permission scope.
- No pre-mutation hook in this first requirement. Brownfield Review may assess one later as
  defense in depth against missed delivery activation, never as the activation owner.

## 5. Acceptance Signals

1. `Bewerte das Projekt`, `Erkläre die Architektur` and equivalent read-only requests produce the
   requested findings without AGDF mention, skill dispatch, control access or approval prompt.
2. `Bewerte das Projekt und behebe die Probleme` and equivalent implementation requests activate
   AGDF before mutation.
3. `Wie würdest du X implementieren?` remains read-only, while `Implementiere X` and `Erstelle den
   verbindlichen Umsetzungsplan für X` are classified as delivery intent.
4. `Zeige den AGDF-Status` invokes the requested read-only AGDF operation even though no mutation is
   requested.
5. `Lege .agdf/control an` uses an explicit control-lifecycle path and does not repeat an unrelated
   UR approval request solely because the control file is absent.
6. Ambiguous effect permits read-only inspection or one neutral clarification, but no mutation and
   no automatic AGDF status card.
7. A false-positive direct skill selection can abstain before target resolution, repository
   activation, run selection or control evaluation.
8. Canonical and generated Codex, Claude Code, Copilot and OpenCode projections carry equivalent
   activation semantics, with direct host evidence kept separate from source and package tests.
9. Existing valid direct AGDF invocations and active-run continuations retain their target, gate,
   approval, locale and presentation behavior.

## 6. Existing Source Of Truth

- `plugin/meta/agdf-agent-router.md`
- `plugin/meta/contracts/task-target-resolution.md`
- `plugin/meta/contracts/interaction.md`
- `plugin/meta/contracts/modes.md`
- `plugin/skills/gate-check/SKILL.md`
- `plugin/meta/agdf-plugin.definition.json`
- `create-agdf/lib/skill-dispatch/contract.js`
- `create-agdf/lib/skill-dispatch/service.js`
- `create-agdf/lib/control-evaluation/gate-check.js`
- `create-agdf/scripts/sync-plugin-runtime.js`
- Completed `installer-output-parity` behaviour for read-only orientation
- Active `cross-surface-executable-skill-dispatcher` public dispatch contract and QA evidence

## 7. Risks And Unknowns

- The boundary between advisory implementation discussion and a formal delivery-planning request
  needs one explicit product definition.
- Active-run continuation must not make unrelated later questions inherit AGDF activation.
- A model-facing applicability preflight may still misclassify intent unless the dispatcher has a
  bounded, non-authorizing backstop.
- A new dispatcher field or outcome changes the approved public dispatch contract and requires
  explicit PRD, SD and TP treatment rather than a hidden QA patch.
- Existing read-only orientation was previously approved product behavior. This run must identify
  exactly which behavior it supersedes and which explicit AGDF read-only operations remain valid.
- Host discovery and hook capabilities differ. Shared semantics must not be implemented as four
  independent host policies.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`
