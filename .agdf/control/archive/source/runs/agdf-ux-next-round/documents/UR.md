# UR: AGDF UX Next Round

Status: approved
Gate: UR
Gate approval: `Approval: UR`
Date: 2026-07-15
Owner: agent

## 1. Problem

AGDF correctly fails closed when multiple active runs are plausible, but the resulting user
experience exposes an internal run-selection problem instead of presenting a clear human choice.
The first-contact experience also introduces governance concepts and a nine-skill surface before
users understand the immediate next action. When native controls are unavailable, the fallback
and the evidence for the installed version are not consistently visible enough to preserve trust.

## 2. Goal

Make the next AGDF interaction easy to understand and act on while preserving exact approval
authority, durable control state, cross-surface portability and fail-closed behavior.

## 3. Scope

- Present ambiguous active runs as understandable user choices with human-readable titles and
  enough context to select the intended run explicitly.
- Reduce first contact to a short "what happens now?" orientation before exposing deeper AGDF
  process concepts.
- Group the skill surface into "Start here", "used automatically" and "optional" guidance.
- Make native-control fallback states and installed/expected version evidence visible and clear.
- Preserve the existing Gate Transition Card, exact `Approval: <GateName>` values, locale rules,
  revalidation boundary and machine-readable control output.

## 4. Non-Goals

- No change to gate authority, approval semantics or the canonical Runtime Contract.
- No custom approval UI that replaces host-native controls.
- No new governance gates, artefact types or parallel control-state model.
- No release, commit, push or PR work as part of this UX scope.
- No claim that screenshots or local checks constitute live cross-surface UAT.

## 5. Acceptance Signals

- A user can identify and select the intended run without knowing `--run`, `AGDF_RUN_ID` or
  internal run-state terminology first.
- A first-time user can state the immediate next action and why AGDF is asking for it after the
  initial orientation.
- The plugin surface communicates where to start and which skills are automatic versus optional.
- When native interaction is unavailable, the user sees an explicit explanation and the exact
  textual fallback value.
- Version evidence distinguishes installed, expected and historical screenshot state.
- Existing interaction presentation tests and runtime-integrity checks remain green.

## 6. Existing Source Of Truth

- `plugin/meta/agdf-runtime-contract.md`
- `plugin/skills/gate-check/SKILL.md`
- `plugin/meta/agdf-plugin.definition.json`
- `create-agdf/lib/interaction-presentation.js`
- `create-agdf/README.md`
- `pages/src/data/site.ts`
- `pages/public/assets/`
- Prior UX review and the existing `agdf-human-decision-surface` and `native-gate-buttons-live`
  run records.

## 7. Risks And Unknowns

- Brownfield Review must determine whether the four concerns are one coherent slice or should be
  split into separate delivery paths.
- The host surfaces may expose different limits for selection controls, fallback messaging and
  version visibility.
- Human-readable run summaries must not accidentally become a second authority source.
- Existing screenshots may be historical evidence and need explicit labeling rather than silent
  replacement.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`
