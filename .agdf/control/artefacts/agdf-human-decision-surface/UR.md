# UR: Human-Centered Decision Surface for AGDF

Status: approved
Gate: UR
Revision: 2
Gate approval: exact `Approval: UR` provided on 2026-07-15 for revision 2 after same-run, same-gate and revision revalidation
Date: 2026-07-15
Owner: AGDF

## 1. Problem

The AGDF runtime contract is precise, but primary agent interactions can still expose internal control vocabulary such as `next_user_gate`, `mode_slice_decision`, `required_next_gate` or diagnostic codes. Users need clear decisions and consequences, not the internal representation of the control state.

## 2. Goal

Translate canonical AGDF control state into concise, human-readable decision guidance while preserving the existing gate model, exact approval formulas, machine-readable reports and fail-closed authority boundaries.

## 3. Scope

- Extend the existing Gate Transition Card concept from approval-ready prompts to primary status, clarification and blocked-run interactions where needed.
- Define a shared presentation mapping for current position, available action, required user decision, blocker and next consequence.
- Keep internal fields available in JSON, CLI diagnostics and audit artefacts, but out of the primary user-facing interaction.
- Cover Codex, Claude Code, OpenCode and fallback text through the existing surface-adapter model.
- Add deterministic negative tests for raw internal-key leakage and positive tests for German/English presentation.

## 4. Non-Goals

- No new gate model, approval formula, persistence authority or custom UI.
- No removal or renaming of canonical machine-readable fields.
- No automatic run selection or inferred approval.
- No redesign of the existing native host controls.

## 5. Acceptance Signals

- Primary cards answer: where are we, what can happen now, what must the user decide, and what happens next.
- Raw snake_case fields, diagnostic codes and audit tables do not appear in primary interaction copy.
- `Approval: <GateName>` remains exact and authoritative.
- Ambiguous and blocked states explain the required resolution in plain language.
- Machine-readable CLI/JSON output remains backward compatible.
- Runtime-integrity, routing, control-state and package smoke checks pass.

## 5.2 Extensible and Deterministic Localization of Native Options

Native gate questions must use one canonical, data-driven locale-dependent
presentation mapping. Localization must not be limited structurally to English
and German. English and German are the currently defined language packs; further
supported locales must be addable without changing gate semantics, approval
validation or surface adapters.

| Semantic outcome | `chat_language: de` | `chat_language: en` |
|---|---|---|
| approve | `Approval: <GateName>` | `Approval: <GateName>` |
| revise | `Überarbeiten` | `Revise` |
| decline | `Ablehnen` | `Decline` |
| cancel | `Abbrechen` | `Cancel` |

- The exact approval value remains `Approval: <GateName>` in every language; the gate name is not translated.
- Localized labels are presentation only and map internally to stable `approve`, `revise`, `decline` and `cancel` outcomes.
- One native question and its fallback must use one language only.
- Locale resolution must accept a standard language tag and select the closest supported language pack according to a documented fallback order.
- Absent, unsupported or not-yet-translated chat language falls back deterministically to English until a matching language pack exists.
- Adding a language pack must require only localized presentation data and fixtures, not changes to gate logic, approval validation or adapter contracts.
- Deterministic tests must inspect the generated native-question or adapter payload and the exact-text fallback for multiple language packs, not only the prose rules.

## 5.1 Approved UX Clarification: Native-First Gate Approval

For every ready user gate, the primary interaction must attempt the configured
native question adapter exactly once when the selected run, current gate and
durable artefact are ready and the host can wait for deliberate input.

- The native adapter attempt precedes any textual request for `Approval: <GateName>`.
- Exact-text approval is allowed only when the adapter is unavailable, unsafe, non-interactive, not rendered or not applied.
- The fallback must state the concrete reason in user-facing language and must not retry or simulate the native control.
- The exact approval value remains `Approval: <GateName>` and is validated against the same run, gate and durable artefact before persistence.
- Host buttons remain presentation-only; AGDF control state remains the sole approval authority.
- Native option labels and descriptions are resolved from the configured chat language through one canonical mapping; agent-specific synonyms are not accepted as the standard presentation.
- The mapping is locale-extensible; `de` and `en` are initial packs, not an exhaustive language boundary.

### 5.1.1 Mandatory approval-interaction sequence

Every ready user gate MUST use this exact visible sequence:

1. compact Run Status Card;
2. separate Gate Transition Card;
3. native approval control, or the exact-text fallback when the native attempt is not usable.

The two cards MUST be visibly complete in one immediately preceding assistant message before the
native adapter is invoked. They MUST remain two separately recognizable semantic blocks and MUST NOT
be merged, omitted, reversed or moved into button text, option descriptions, tool arguments or hidden
context. The localized action-oriented title is the first visible line of the complete envelope; it
does not replace either card. Each card is rendered exactly once. A native control invoked before
both cards are visible is a contract violation and cannot authorize a gate transition.

## 5.3 Interaction and Accessibility Invariants

- The visible gate title is localized through the active language pack, while the exact approval value remains unchanged. For example, a localized `Lösungsdesign` may be paired with `Approval: SD`.
- Button order and recommendation are stable across surfaces and locales. No option may be auto-selected, auto-submitted or labelled `Skip`/`Überspringen` when it could be interpreted as bypassing a gate.
- Button descriptions use the same language pack as their labels and gate title.
- Native buttons, exact-text fallback and human-readable CLI output express the same semantic outcomes and transition boundaries.
- Host-owned UI chrome and host language remain separate from AGDF's configured chat language; only AGDF-owned presentation text is localized.
- Labels, descriptions and localized gate titles must remain unambiguous and usable with long translations, narrow layouts and assistive technologies. Meaning must not depend on truncation, color or position alone.
- Missing response, timeout, cancellation, empty response and explicit decline are distinct outcomes. Only explicit decline maps to `decline`; none of the other outcomes advances or rejects a gate implicitly.
- A human-readable run title is preferred. If only a `run_id` exists, the fallback title must be deterministic and safe, without silently selecting another run.
- Tests cover every user gate (`UR`, `PRD`, `SD`, `TP`, `QA`, `UAT`), internal steps, clarification/blocker states and status-only interactions that must not request approval.
- A presentation label or button position must never authorize a transition. Only an exact, revalidated `Approval: <GateName>` value may authorize a gate.
- Deterministic fixtures must reject every sequence except `Run Status Card -> Gate Transition Card
  -> native control or exact-text fallback`, including merged, omitted, reversed, duplicated and
  button-first variants.

## 6. Existing Source Of Truth

- `plugin/meta/agdf-runtime-contract.md`
- `plugin/skills/gate-check/SKILL.md`
- `plugin/meta/agdf-plugin.definition.json`
- `create-agdf/bin/create-agdf.js`
- `plugin/scripts/check-runtime-integrity.mjs`
- `.agdf/control/artefacts/native-gate-buttons-live/SD.md` and `TP.md` for the existing Gate Transition Card boundary

## 7. Risks And Unknowns

- Existing approval-time cards already implement part of this behavior; Brownfield Review must prevent a second presentation owner.
- Human-readable run titles may not exist for every control state and need a safe fallback.
- CLI human output, agent instructions and host-native questions may currently have different ownership boundaries.

## 8. Next Step

Revision 2 is approved. Brownfield Review must reconfirm the affected presentation owners before PRD
progression.
