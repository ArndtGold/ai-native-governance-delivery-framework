# Solution Design: Mandatory Native-First Gate Approval

Status: approved
Gate: SD
Gate approval: `Approval: SD` (2026-07-14, deliberate native selection after transition-card UX revision)
Run: `native-gate-buttons-live`
Derived from: `.agdf/control/artefacts/native-gate-buttons-live/PRD.md`
Date: 2026-07-14

## 1. Design decision

Extend the existing gate-check interaction adapter and its readiness boundary.
The adapter remains presentation-only; the control-state workflow remains the
sole owner of approval validation and persistence. For every ready gate with a
callable, gate-safe native adapter, native invocation is mandatory before any
textual approval request. The first eligible attempt has one deterministic
outcome: either the host renders the native question or AGDF immediately uses
the exact-text fallback with a stated reason. A second prompt must never be
required to activate a native control.

## 2. Flow

1. Resolve exactly one selected run.
2. Evaluate the current gate and confirm the required durable artefact.
3. Build the bounded native question with exact approval, revise and decline.
4. Classify the interaction as `gate_approval`, then make exactly one
   first-attempt call to the declared surface adapter when the host capability
   is callable and gate-safe.
5. If the adapter is explicitly unavailable, unsafe, non-interactive, not
   applied or cannot establish deliberate input, immediately present exact
   textual approval and state the fallback reason; do not retry the native
   control.
6. Re-resolve the same run and expected gate immediately after native or text
   input.
7. Persist only an exact, validated approval; otherwise leave state unchanged.

The agent must not emit `Approval: <GateName>` as a direct request when step 4
establishes that a safe native adapter is callable. Doing so is a procedure
violation, not a valid fallback.

## 3. Surface behavior

### Codex

Use `request_user_input` when the host exposes it in the current mode and can
wait for deliberate input. The first eligible attempt must invoke the adapter
and either render the bounded native question or transition to exact text with
an explicit fallback reason. The feature flag or host capability is not an
AGDF approval and must not be changed by the implementation. A user request
to retry is not part of the normal path and must not be required for fallback.

### Claude Code

Use `AskUserQuestion` on the first eligible attempt when the current Claude
session exposes a deliberate question control and no timeout or hook can
auto-continue it. If the control is not applied, appears only after a second
prompt or cannot establish deliberate input, classify native invocation as
unavailable for that attempt, state the concrete reason and present exact text
immediately. Do not add prompting loops or simulated UI.

### OpenCode

No change in this slice. Preserve its existing question/permission distinction
and exact-text fallback unless shared ownership is demonstrated by analysis.

## 4. Ownership and boundaries

- `plugin/meta/agdf-runtime-contract.md` remains the semantic source of truth.
- `plugin/skills/gate-check/SKILL.md` owns agent-side readiness and adapter use.
- Existing surface adapter metadata remains the capability declaration.
- Existing control-state persistence remains the approval authority.
- No custom renderer, MCP app, hook approval or parallel store is introduced.

## 5. User Experience And Localization

The native gate question must feel like a clear, trustworthy decision point,
not like a technical permission prompt. The user must immediately understand
what is being approved, what happens next and how to request changes without
accidentally bypassing the gate.

### Mandatory User-Facing Transition Card Before Every Approval

Before every user-gate approval request — `UR`, `PRD`, `SD`, `TP`, `QA` or
`UAT` — AGDF must emit one compact transition card as a separate user-facing
message. This rule applies to native buttons and exact-text fallback alike,
across Codex, Claude Code, OpenCode and non-interactive surfaces. The approval
question must never be the first or only orientation surface.

The transition card is product copy, not a rendering of `RUN_STATE.md` or the
machine-readable status card. It must answer exactly these three user
questions, in this order:

1. **Where am I?** Show a human-readable artefact or decision title, the
   selected `run_id` as secondary context, and that the decision is ready.
2. **What does this decision do?** State the concrete authority granted by the
   exact approval and the most important boundary that remains in force.
3. **What happens next?** State the immediate internal agent action and, only
   when one exists, the next actual user gate.

Canonical English composition:

```text
<Human-readable gate title> · <run_id>
Ready for your decision

Approve now
`Approval: <GateName>` allows <concrete next outcome>. <important boundary>.

Next
I will <immediate internal action>. <next user decision, or no further action required now>.
```

Canonical German composition:

```text
<Lesbarer Gate-Titel> · <run_id>
Bereit für deine Entscheidung

Jetzt freigeben
`Approval: <GateName>` erlaubt <konkretes nächstes Ergebnis>. <wichtige Grenze>.

Danach
Ich <unmittelbare interne Aktion>. <nächste Nutzerentscheidung oder aktuell keine weitere Aktion nötig>.
```

At approval time the visible transition card must not use a Markdown table,
dashboard rows, raw control-state keys, machine statuses, evidence lists,
diagnostic codes, `allowed_now`/`forbidden_now` vocabulary, or implementation
details that do not help the user decide. Those fields remain available to
validators and audit artefacts, not to the primary decision experience.

The card should normally fit in a title, a readiness line and two short content
blocks. Each block must express one idea in plain product language. It must not
repeat the native question or enumerate every process restriction.

For `chat=de`, only the presentation labels and explanations are localized;
the run identifier, gate name and exact approval value remain unchanged.
The card is informational and does not itself grant authority. It must be
emitted after canonical readiness evaluation and immediately before the
approval request. If the native control is available, the card precedes the
one native question attempt. If the native control is unavailable, the same
card precedes the exact-text fallback. No surface may omit the card because it
uses text instead of buttons.

### User-Intent Transition Contract

The card must distinguish the next permitted agent action from the next user
approval gate in natural language. An internal step must never be labelled as
a user gate or presented as something the user must approve.

For an approved `TP`, the card must identify pre-implementation Brownfield
Analysis as an internal next step, show `Next user gate: none` until a real
user approval is required in machine-readable output, and tell the user
plainly that no further action is required now. It must never ask the user to
approve Brownfield Analysis separately or expose `Next user gate: none` as a
raw UI field.

For the current `SD` decision in German, the transition card must communicate
the following meaning without adding internal status rows:

```text
Solution Design · native-gate-buttons-live
Bereit für deine Entscheidung

Jetzt freigeben
`Approval: SD` gibt das überarbeitete Design frei. Die Implementierung bleibt gesperrt.

Danach
Ich passe den Task Plan an. Deine nächste Entscheidung ist `Approval: TP`.
```

### Canonical German Chat Copy

Question:

> Run `native-gate-buttons-live`, aktuelles Gate `SD`: Soll das Solution Design für den nächsten AGDF-Schritt freigegeben werden?

Options:

- `Approval: SD` — Gives the SD approval and allows creation of the Task Plan.
- `Überarbeiten` — Keeps the SD open for requested changes.
- `Ablehnen` — Rejects this approval attempt and leaves the run unchanged.

The exact machine-readable approval value remains `Approval: SD`. It must not
be translated, reformatted or inferred from a localized label. Localized
labels such as `Überarbeiten` and `Ablehnen` map to internal `revise` and
`decline` outcomes and never carry AGDF approval authority.

### UX Invariants

- The question names the selected run and current gate.
- The recommended option is visually clear but never auto-selected or
  auto-submitted.
- The approval description states the concrete next permitted step: creation
  of the Task Plan.
- `Überarbeiten` and `Ablehnen` explain different outcomes; neither advances
  the gate.
- A host-provided free-text action such as “Nein, und teile ChatGPT mit, was
  es anders machen soll” is treated as revision input only, never as approval.
- A host action labelled `Überspringen` must not be used for a gate question;
  use `Abbrechen` or equivalent wording so the user cannot interpret it as a
  gate bypass.
- Durable artefacts remain English; user-facing chat and native option
  descriptions follow the configured chat language.

### Internationalization Contract

1. All user-facing native question text, option descriptions and fallback
   explanations must be resolved through the configured chat locale.
2. When `chat=de`, use the German copy defined above.
3. When the configured locale is absent, unsupported or not yet translated,
   use English as the default language.
4. English is the canonical fallback language for every surface; no surface
   may invent a third-language variant or silently mix languages within one
   question.
5. Durable AGDF artefacts, runtime rules, task identifiers and machine-facing
   approval values remain English and are not localized.
6. The exact approval value remains `Approval: <GateName>` in every locale.
   Localized labels are presentation text only and map to stable internal
   outcomes such as `revise`, `decline` and `cancel`.
7. Locale resolution must be deterministic and must not change gate meaning,
   option ordering, approval validation or persistence behavior.

### Locale Examples

German (`chat=de`):

> Run `native-gate-buttons-live`, aktuelles Gate `SD`: Soll das Solution Design für den nächsten AGDF-Schritt freigegeben werden?

English (default):

> Run `native-gate-buttons-live`, current gate `SD`: Approve the Solution Design for the next AGDF step?

The primary option remains `Approval: SD` in both locales. Only the
explanatory copy and non-authoritative action labels are localized.

### Wow Effect

The experience should communicate safe progress in one glance: the user sees
the exact decision, the scope boundary, the next concrete benefit and a safe
way to improve the result. The visual hierarchy should make `Approval: SD`
the confident primary action while preserving an equally understandable
revision path and an explicit no-decision exit.

## 6. Verification design

- deterministic tests for ready-gate, unavailable-adapter and fallback paths
- a regression test that fails when a callable native adapter is bypassed by a
  direct textual approval request
- regression tests proving empty, revise, decline and non-deliberate responses
  do not advance a gate
- same-run/same-gate/artefact revalidation test immediately before persistence
- bounded live Claude probe documenting first-attempt behavior and immediate
  fallback when the host does not apply the control
- bounded live Codex probe documenting first-attempt native rendering when
  callable and immediate fallback when it is not
- runtime integrity, control-state tests and package smoke checks

## 7. Failure handling

Unknown host behavior is treated as unavailable native capability only after
the single eligible native attempt is made, unless the adapter is already
known to be unavailable or unsafe. The user receives the exact approval
formula plus the fallback reason rather than a repeated native prompt. Any
ambiguous run, stale gate, missing artefact or non-exact response fails closed.

## 8. Delivery constraints

Implementation requires an approved Task Plan after this SD. No code, host
configuration or release change is authorized by this design alone.

## 9. Next gate

The revised SD was approved through the deliberate native `Approval: SD`
option on 2026-07-14. The next permissible artefact is the revised Task Plan;
implementation remains forbidden.
