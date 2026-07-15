# PRD: Human-Centered Primary Decision Surface

Status: approved
Gate: PRD
Revision: 4
Gate approval: exact `Approval: PRD` provided on 2026-07-15 for revision 4 after same-run, same-gate and revision revalidation
Based on: `.agdf/control/artefacts/agdf-human-decision-surface/UR.md`; `.agdf/control/artefacts/agdf-human-decision-surface/BROWNFIELD_REVIEW.md`
Date: 2026-07-15
Owner: AGDF

## 1. Product Outcome

AGDF primary interactions explain what the user needs to understand or decide without exposing the internal representation of the control state. The existing fail-closed gate model, exact approvals and machine-readable reports remain unchanged.

## 2. Presentation Model

AGDF will maintain one canonical control-state model with three derived presentation layers:

| Layer | Purpose | Allowed content |
|---|---|---|
| Primary decision surface | Normal chat and approval interaction | Human-readable position, decision, consequence, blocker and next action |
| Detail surface | User-requested status or troubleshooting | Readable labels, selected run, artefacts, evidence and diagnostic explanation |
| Machine surface | CLI JSON, CI and integrations | Existing canonical fields, including snake_case keys and diagnostic codes |

The primary surface must never render the machine surface or the full detail surface by default. Locale presentation is data-driven and extensible; `de` and `en` are initial packs, not a structural language limit.

### 2.1 Primary visual hierarchy

The first visible line of every primary AGDF interaction MUST be a level-two Markdown heading
containing the localized, action-oriented title of the current user gate or internal step.
The title is the visual owner of the interaction and appears exactly once.

Generic labels such as `AGDF Status`, `Run Status Card`, `Gate Transition Card`, raw gate identifiers
or machine status values MUST NOT be the primary heading. They may appear only as secondary context
after the human title, for example `AGDF · PRD · <run_id>`.

If a surface does not render Markdown headings, the adapter MUST preserve equivalent first-line
semantic prominence through its native accessible heading mechanism or a bold first line. Host-owned
typography may vary, but title order, wording and accessible hierarchy may not.

The Approval Orientation Envelope retains its two distinct semantic blocks, but they must not compete
for visual ownership: the localized action title heads the complete envelope; the compact status
projection and transition explanation follow without introducing another primary title.

For every ready user gate, the complete interaction MUST follow this immutable visible order:

```text
Run Status Card -> Gate Transition Card -> native approval control or exact-text fallback
```

`Run Status Card` and `Gate Transition Card` name semantic blocks, not permitted primary headings.
Both blocks MUST be visibly complete, separately recognizable and rendered exactly once in one
immediately preceding assistant message before adapter invocation. They MUST NOT be combined into one
block, omitted, reversed, repeated, deferred until after the control, or represented only inside the
question, option descriptions, tool payload or hidden context. The action-oriented heading is the
first visible line of the Run Status Card and therefore the complete envelope; it does not replace
either block. The native control or fallback is always third.

### 2.2 Native presentation evidence

Native interaction has three distinct evidence levels that MUST NOT be collapsed:

1. `invoked`: the agent called the configured adapter;
2. `presented`: the host visibly rendered a deliberate-input control to the user;
3. `deliberate_response`: the user consciously submitted a response through that visible control.

Adapter invocation or a structured tool return does not prove presentation or deliberate input.
If the adapter returns a value while the user reports that no control was visible and no choice was
made, the outcome is `attempted_not_applied`, not `presented`. The value is non-authoritative, MUST
NOT be persisted and MUST lead to one visible exact-text fallback without an automatic retry of the
same interaction.

The adapter MUST preserve the exact approval value independently from display decoration. A
host-decorated value such as `Approval: PRD (Recommended)` is not the canonical
`Approval: PRD`. If a surface cannot provide an exact deliberate value or a trustworthy mapping to
that value without treating label text, position or recommendation as authority, the native control
is presentation-only and the exact-text fallback remains the authorizing path.

Every native attempt reports one visible outcome: `presented`, `unavailable_before_invocation`,
`attempted_not_applied` or `unsafe_to_wait`. Only user-visible evidence may support `presented`;
repository tests and internal tool success prove at most invocation and contract behavior.

## 3. State-Specific User Experience

### 3.1 Ready user gate

Render the immutable three-stage approval interaction: compact Run Status Card first, separate Gate
Transition Card second, then the native approval control or exact-text fallback third. The transition
card contains the human-readable run title and selected-run context, readiness and exact approval
effect, immediate next action and next actual user decision. The exact value
`Approval: <GateName>` remains unchanged.

### 3.2 Clarification required

Explain the missing choice in plain language, name competing human-readable work items where available, and state that no gate approval or implementation can proceed until the choice is made. Do not present a gate-approval question.

Example:

> Mehrere Vorhaben sind aktiv. Bitte wähle zuerst, an welchem Vorhaben wir weiterarbeiten sollen. Danach prüft AGDF den Zustand erneut.

### 3.3 Blocked state

State what is missing, why AGDF cannot continue, and the single resolution action. Translate known diagnostic conditions such as active-run ambiguity into user language; retain the diagnostic code only in detail or machine output.

### 3.4 Status request or progress update

Give a compact answer about the current position, what is allowed now and the next useful action. Do not expose `next_user_gate`, `mode_slice_decision`, `required_next_gate` or similar keys in the primary response.

### 3.5 Canonical action-title mapping

Initial German user-gate titles are:

| Gate | Primary title |
|---|---|
| UR | Nutzeranforderung freigeben |
| PRD | Produktanforderungen freigeben |
| SD | Lösungsdesign freigeben |
| TP | Umsetzungsplan freigeben |
| QA | Qualitätsentscheidung freigeben |
| UAT | Ergebnis abnehmen |

Internal steps use localized action-oriented titles without approval language. Concrete titles live
in the canonical locale registry, not in surface-specific prompt copies.

## 4. Functional Requirements

1. Every primary interaction answers the relevant subset of: where are we, what is possible now, what decision is needed, what happens next, and why are we blocked.
2. Internal field names and raw diagnostic codes are prohibited in primary copy.
3. The user-facing mapping is derived from the canonical report; no second state model or approval authority is introduced.
4. The exact approval formula remains `Approval: <GateName>` in every locale.
5. Internal mandatory steps are described as agent actions, never as additional user gates.
6. Run identifiers remain available as secondary context, but human-readable titles are preferred; when no title exists, a concise safe fallback is used.
7. German presentation is used for `chat=de`; absent or unsupported locales use English consistently.
8. CLI/JSON output remains backward compatible.
9. Existing native adapters, exact-text fallback and host authority boundaries remain unchanged.
10. Visible gate titles, option labels, option descriptions and fallback explanations use the active language pack; the exact approval value remains unchanged.
11. Language packs use standard language tags and a documented fallback order; adding a pack does not change gate logic or adapter contracts.
12. Button order and recommendation are stable, with no auto-selection, auto-submission or skip/bypass action.
13. Host-owned UI chrome is not translated or semantically mixed with AGDF chat language.
14. Labels and descriptions remain unambiguous for long translations, narrow layouts and assistive technologies.
15. Missing response, timeout, cancellation, empty response and explicit decline remain distinct non-equivalent outcomes.
16. A deterministic human-readable run-title fallback exists when only a `run_id` is available.
17. Only an exact, revalidated `Approval: <GateName>` may authorize a transition; labels, order and button position never authorize it.
18. Every primary chat card shows compact links for the durable `UR`, `PRD`, `SD` and `TP` artefacts whenever the corresponding artefact exists.
19. Missing artefacts are shown as `not yet created` or the configured localized equivalent; the card must never render a broken, guessed or non-existent link.
20. Artefact links use stable repository-relative ownership and readable labels (`UR`, `PRD`, `SD`, `TP`); raw internal paths are not shown as the primary label.
21. The same artefact-link semantics apply to native-card context, exact-text fallback and human-readable CLI output where links are supported; machine JSON retains canonical paths.
22. The first visible line of every primary AGDF interaction is the localized action-oriented title
    formatted as a level-two Markdown heading or equivalent accessible host heading.
23. The primary title appears exactly once; status and transition blocks do not introduce competing
    primary headings.
24. `AGDF Status`, `Run Status Card`, `Gate Transition Card`, raw gate identifiers and machine status
    values are forbidden as the primary title.
25. `AGDF`, the canonical gate identifier, run title and `run_id` remain available only as compact
    secondary context after the primary title.
26. User-gate titles describe the decision action; internal-step titles describe agent work and never
    imply a false approval.
27. The gate-check workflow validates the complete heading invariant before invoking a native control
    or emitting exact-text fallback.
28. Title strings are owned by the locale registry and use deterministic locale fallback without
    changing gate identity or exact approval values.
29. Native invocation, host-visible presentation and deliberate user response are separate evidence
    states and are never inferred from one another.
30. A tool return without evidenced visible presentation and deliberate input is classified as
    `attempted_not_applied`; it cannot authorize or persist a gate transition.
31. Every native attempt exposes its presentation outcome to the user before any fallback or gate
    claim.
32. An unapplied attempt uses one exact-text fallback and does not automatically retry the same
    interaction.
33. Display decoration, option position and recommendation markers never modify or substitute for
    the canonical exact approval value.
34. If an adapter cannot preserve a canonical approval value independently from its display label,
    it remains presentation-only and exact text owns authorization.
35. Host-rendering claims require user-visible or equivalent trustworthy host evidence; internal
    invocation success and repository tests are insufficient.
36. Every ready-gate interaction renders exactly `Run Status Card -> Gate Transition Card -> native
    control or exact-text fallback`; this order is invariant across hosts and locales.
37. The two cards remain separately recognizable semantic blocks in one immediately preceding
    assistant message and are each rendered exactly once before adapter invocation.
38. Combining, omitting, reversing, duplicating or moving either card into the question, option
    descriptions, tool payload or hidden context is a contract violation.
39. The localized action title owns the first visible line of the Run Status Card and complete
    envelope but never substitutes for the Run Status Card or Gate Transition Card.

## 5. Acceptance Criteria

- Ready-gate approval continues to use the existing Gate Transition Card and exact approval token.
- Ambiguous-run, missing-artefact and missing-approval fixtures produce plain-language clarification/blocker copy without a native gate question.
- Status output in the primary interaction contains no raw snake_case keys, diagnostic codes, Markdown dashboard tables or internal gate-field vocabulary.
- Detail and machine surfaces still expose the information required for troubleshooting, CI and audit.
- TP approval and other internal-step transitions do not ask for a false second user approval.
- German and English-default fixtures preserve identical authority and transition semantics.
- Generated surfaces remain aligned with canonical sources.
- Native option payloads, localized gate titles, button ordering, fallback text and semantic outcome mappings are tested for multiple language packs.
- Tests cover `UR`, `PRD`, `SD`, `TP`, `QA`, `UAT`, internal steps and status-only interactions that must not request approval.
- Accessibility fixtures or checks cover stable names and long-label behavior without relying on color, position or truncation.
- Chat-card fixtures verify clickable `UR`, `PRD`, `SD` and `TP` links for existing artefacts, plus explicit non-link states for missing artefacts.
- Ready, blocked, clarification, status and internal-step fixtures assert that the first visible line
  is the expected localized level-two action heading.
- Negative fixtures reject a generic AGDF/status label, raw gate identifier or machine value as the
  first visible heading.
- Fixtures assert exactly one primary title and no duplicate gate title across the status and
  transition blocks.
- Gate-check and Runtime Integrity fail before native invocation when the heading invariant is absent,
  misplaced, generic or duplicated.
- Portable rendering checks verify semantic heading prominence and accessible naming without claiming
  identical host-owned font size.
- Controlled adapter fixtures distinguish `invoked`, `presented` and `deliberate_response` and reject
  any transition that lacks the latter two evidence levels.
- A fixture in which the adapter returns an answer without visible presentation produces
  `attempted_not_applied`, persists no approval and emits one exact-text fallback.
- A decorated response such as `Approval: PRD (Recommended)` fails canonical exact-approval
  validation unless a separate trustworthy adapter payload carries the unchanged exact value.
- Output checks require one visible presentation outcome for every native attempt and prohibit
  repository-only evidence from being reported as host-visible rendering proof.
- Sequence fixtures assert the exact visible event order `run_status_card`, `gate_transition_card`,
  `native_control_attempt` or `exact_text_fallback` from one immutable run/gate/revision snapshot.
- Negative sequence fixtures reject merged cards, missing cards, reversed cards, duplicated cards,
  button-first invocation and cards present only in tool or option context.
- Adapter invocation is prohibited until both separately recognizable cards have been emitted in the
  immediately preceding assistant message.
- Runtime-integrity, control-state, routing, package smoke and whitespace checks pass.

## 6. Non-Goals

- No new gate, approval syntax, persistence format or automatic run-selection policy.
- No custom UI renderer, dashboard redesign or host-control replacement.
- No guarantee of identical pixel size or typography across hosts; the contract owns semantic heading
  level, first-line position, wording and accessible hierarchy.
- No removal or renaming of machine-readable fields.
- No changes to product responsibility, human UAT or release authority.
- No reopening of the declined UAT in `native-gate-buttons-live`; this slice creates its own acceptance evidence.

## 7. Source Of Truth And Ownership

- Presentation semantics: `plugin/meta/agdf-runtime-contract.md`
- Agent interaction guidance: `plugin/skills/gate-check/SKILL.md`
- Surface capability declaration: `plugin/meta/agdf-plugin.definition.json`
- Human CLI projection: `create-agdf/bin/create-agdf.js`
- Generated propagation: `create-agdf/scripts/sync-package-assets.js`
- Integrity and negative presentation checks: `plugin/scripts/check-runtime-integrity.mjs` and `create-agdf/scripts/runtime-integrity-negative-test.js`

## 8. Risks And Open Questions

- The exact boundary between primary and detail output must be stable across agent surfaces.
- Human-readable run titles may require a deterministic fallback from objective text or run ID.
- Existing tests protect approval-time leakage; new fixtures must cover clarification and blocked paths without weakening machine-output coverage.
- A generic status heading can be semantically accurate yet visually misleading; first-line order and
  heading level must therefore be tested rather than left to agent judgement.
- Some hosts may return structured values without visibly presenting or awaiting a control; adapter
  output must therefore remain non-authoritative until presentation and deliberate input are evidenced.
- Host UI schemas may decorate recommended labels; authorization must not depend on presentation text.

## 9. Next Step

Refresh the Solution Design against approved PRD revision 4. Implementation remains forbidden.
