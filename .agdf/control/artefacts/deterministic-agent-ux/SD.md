# SD: Deterministic Agent UX

Status: approved
Gate: SD
Gate approval: `Approval: SD` accepted for revision 3 on 2026-07-17
Revision: 3
Based on: approved PRD revision 3
Date: 2026-07-17
Owner: agent

## 1. Solution Overview

Extend the existing gate evaluation and interaction-presentation path with one deterministic,
render-ready Approval Orientation projection and make the agent-native/CLI-validator ownership model
visible in first-contact documentation and CLI help.

The solution has three coordinated parts:

1. **Canonical render-ready projection:** the existing immutable approval snapshot gains one pure
   renderer and one additive public projection. It produces complete localized Markdown blocks and
   exact interaction values from already-evaluated run state.
2. **Local invocation path:** `agdf gate-check --approval-envelope` prints the ready-to-use envelope
   from an installed or repository-local CLI. It is a gate-transition helper, not a second primary UX
   or evaluator. Normal state inspection remains agent-native and does not require the command.
3. **Visible operating model:** public entry points and generated agent guidance distinguish
   bootstrap/install commands from repeated local validation and ordinary agent-native work.

No new gate, state store, renderer authority or Copilot-native adapter is introduced.

## 2. Ownership And Source Of Truth

| Concern | Canonical owner | Design action |
|---|---|---|
| Gate selection, readiness and authority | `create-agdf/lib/control-evaluation/gate-check.js`; `plugin/meta/contracts/gate-transition.md` | consume unchanged |
| Semantic approval snapshot and rendering | `create-agdf/lib/interaction-presentation.js` | extend with one pure renderer and validation boundary |
| Locale copy | `plugin/meta/agdf-interaction-locales.json` | add neutral decision headings, required-decision labels and neutral outcome guidance |
| Human and JSON gate-check output | `create-agdf/lib/control-evaluation/gate-check.js` | expose additive projection and focused envelope printer |
| CLI flags and dispatch | `create-agdf/lib/cli/parse-args.js`, `command-registry.js`, `application.js` | add one gate-check-only flag and route to the existing evaluator |
| Agent workflow | `plugin/skills/gate-check/SKILL.md`; interaction/control-scaffold contracts | shorten procedural rendering responsibility and define local-helper precedence |
| Copilot surface | generated `AGENTS.md`, `.github/copilot-instructions.md`, `.github/skills/**` | consume shared projection guidance and exact-text transport; no native adapter claim |
| Other generated surfaces | `create-agdf/scripts/sync-package-assets.js` | propagate canonical contracts and skills |
| Public first contact | `README.md`, `INSTALL.md`, `agdf/README.md`, CLI help | present one three-role operating model and separate bootstrap from repeated use |

`.agdf/control/runs/<run_id>/RUN_STATE.md` remains the only mutable run authority. The render-ready
projection is derived, non-persistent and non-authorizing.

## 3. Architecture Decisions

### D1. Extend the existing snapshot; do not create another evaluator

`buildApprovalOrientationSnapshot()` continues to receive only ready, selected and evaluated state.
A new pure renderer, conceptually `renderApprovalOrientationSnapshot(snapshot)`, validates the snapshot
and returns immutable rendered blocks. It never reads repository state, selects a run, decides a gate,
persists data or invokes a host tool.

### D2. Add one versioned public projection outside `status_card`

`evaluateGateCheck()` exposes a new additive top-level field:

```json
{
  "approval_presentation": {
    "schema_version": "1",
    "run_id": "<selected run>",
    "revision_id": "<selected revision>",
    "current_gate": "<gate>",
    "presentation_language": "<resolved locale>",
    "sequence": ["run_status_card", "gate_transition_card", "approval_interaction"],
    "blocks": {
      "run_status_card": { "markdown": "<complete deterministic block>" },
      "gate_transition_card": { "markdown": "<complete deterministic block>" }
    },
    "approval_interaction": {
      "prompt": "<localized prompt>",
      "expected_approval": "Approval: <GateName>",
      "options": ["<canonical structured options>"],
      "exact_text_fallback": "<localized exact-text request>"
    },
    "authorizes": false
  }
}
```

The field is present as a valid object only for a ready user gate and is `null` otherwise. Existing
`status_card` keys and the intentionally non-enumerable internal `approvalOrientation` property remain
unchanged. Public schema meaning and exit codes therefore remain backward compatible.

### D3. Render complete blocks, not fragments

The renderer owns:

- the localized neutral level-two decision heading;
- the five compact status fields in canonical order;
- the separate transition card and artefact reference line;
- spacing, Markdown restrictions and block ordering;
- the exact approval token, localized prompt and ordered outcomes; and
- the exact-text fallback sentence.

The model or surface adapter transmits these blocks without rewriting them. It owns only host-tool
selection and invocation after capability preflight. If the payload is absent or invalid, the native
attempt is forbidden and the existing fail-closed exact-text path remains available.

### D3.1. Card Design Contract

#### User intent and interaction goal

At a ready gate, the user should be able to answer three questions without understanding AGDF's
internal state model:

1. **Can I decide safely now?**
2. **What exactly does this approval unlock, and what remains forbidden?**
3. **What happens immediately afterwards, and when will I be asked again?**

The first scan across both cards must reveal the requested decision, readiness, required approval,
approval effect, remaining boundary and next transition. Identity and artefact references provide
supporting context without competing with this sequence. The cards are decision support, not a
process dashboard. They must not ask the user to interpret raw gates, status enums or implementation
internals.

#### Fixed two-card journey

The Approval Orientation Envelope is one assistant message with two visually distinct semantic
blocks. The screen-reader order and visual order are identical.

The first block is the compact approval-time Run Status Card:

```text
## <localized neutral decision heading>
<Selected run label>: <human run title> · `<run_id>`
<Readiness label>: <localized ready-for-decision state>
<Current gate label>: <localized gate title> (`<gate id>`)
<Required decision label>: <localized human-readable approval name>
<Next action label>: <neutral instruction to choose approve, request revision or decline>
```

This block answers whether the decision is ready and anchors it to one selected run. It contains
exactly the five fields shown above. It does not contain the exact approval token, artefact links,
evidence, diagnostics, allowed/forbidden inventories, lifecycle internals, quality outlook or
transition prose. The required-decision value communicates human meaning rather than technical input;
for example, `Required decision: Solution Design approval`.

The second block is the Gate Transition Card:

```text
<localized gate title> · <human run title> · `<run_id>`
<UR link or localized missing text> · <PRD link or localized missing text> ·
<SD link or localized missing text> · <TP link or localized missing text>
<localized ready-for-decision line>

<localized approve heading>
`Approval: <GateName>` <one concrete effect>. <one remaining boundary>.

<localized next heading>
<one immediate agent action>. <next real user decision or explicit no-action statement>.
```

This block answers where the user is, what the decision changes and what happens next. Artefacts
appear only here. Across the two cards, the exact approval value appears exactly once, in this
decision body, and is never decorated.

After both blocks, the surface performs exactly one of two actions:

- invoke one eligible native question with the canonical prompt and option values; or
- show one localized exact-text request using the same approval value.

The question or fallback is not a third card. It must not repeat either card or introduce new effect
copy. Copilot currently follows the exact-text branch.

#### Visual hierarchy and scan behavior

- The first visible line is one neutral level-two decision heading such as `Review and decide on
  solution design`; approval-directed headings such as `Approve solution design`, generic headings
  such as `AGDF Status`, card names and raw gate IDs are forbidden.
- The decision heading appears exactly once. The transition title is a compact identity line, not a
  competing heading.
- Labels use sentence case and precede values consistently. The approval token is inline code so it
  is visually distinct and copyable without looking like executable shell code.
- Blank lines separate identity, approval effect and next transition. Tables, dashboard grids,
  columns and nested bullet lists are forbidden inside both cards.
- The selected `run_id` is secondary context and remains visible in code styling. Human titles carry
  meaning; machine identifiers provide unambiguous anchoring.
- The user sees only one effect, one remaining boundary and one next transition. Additional evidence
  stays in linked artefacts or audit output.
- The cards must not imply that approval authorizes implementation, QA, release or VCS actions unless
  the canonical gate transition actually does so.

#### Content and tone

- Use direct, calm verbs and describe the user's decision outcome rather than AGDF's internal work.
- Prefer `This allows the Solution Design to be drafted; implementation remains blocked` over enum or
  policy language.
- State the most important remaining boundary explicitly. Do not make the user infer it from a later
  gate name.
- State whether another user decision is required. Internal Brownfield steps must be described as
  agent actions, never as false user gates.
- Avoid congratulatory, promotional, urgent or recommendation language. No option may add
  `(Recommended)` or otherwise visually pressure approval.
- Revision and decline remain equally understandable alternatives through the native prompt or
  exact-text guidance, even though the cards themselves explain the approval path.

#### Length, wrapping and narrow surfaces

The existing locale budgets remain binding: labels up to 40 characters, descriptions up to 160
characters and titles up to 100 characters.

- Each approval-effect sentence, remaining-boundary sentence and next-transition sentence must fit
  the description budget independently.
- The compact status card has one heading plus five value lines. The transition card normally has one
  identity line, one artefact line, one readiness line and two two-line content blocks.
- Long artefact lines and human titles wrap naturally. The renderer must not use fixed-width columns,
  horizontal scrolling or truncation as the only distinction.
- When a resolved human title exceeds the title budget, the renderer uses the deterministic normalized
  `run_id` title instead of an ambiguous ellipsis; the complete `run_id` remains visible.
- Translations may reflow vertically but may not remove meaning, reorder blocks or mix locale packs.

#### Accessibility

- Semantic order is heading, status fields, transition identity, approval effect, next transition,
  then the interactive question or fallback.
- Information must not depend on color, icons, punctuation or option position alone.
- Artefact links use readable labels (`UR`, `PRD`, `SD`, `TP`) and missing artefacts use localized
  plain text rather than broken links.
- Native options have distinct non-empty accessible names and descriptions. Host dismissal remains
  cancellation, not decline or approval.
- The exact approval value remains readable as text and copyable on every surface.
- English fallback occurs as a complete interaction when a locale pack is missing or incomplete;
  mixed-language cards are invalid.

#### Error and recovery behavior

The renderer validates the complete snapshot before returning any Markdown. Invalid sequence, missing
block, generic or approval-biased heading, wrong field set, unsafe artefact reference, mixed locale,
decorated approval, stale revision or run/gate mismatch yields no partial card. Native invocation is
then forbidden. The surface reports the failure concisely and performs a fresh gate evaluation. It
shows the exact-text request only when the gate is still ready and the canonical approval value has
been validated independently. Otherwise, it reports the current non-ready reason and requests no
decision. It never patches or guesses missing presentation content.

#### Usability acceptance

Fixture and live UAT review must confirm that a user can:

1. identify the requested decision from the first visible heading;
2. find the exact approval value without reading diagnostics or JSON;
3. distinguish current authority from what approval unlocks;
4. understand the most important remaining restriction;
5. identify the immediate next agent action and whether another user decision follows; and
6. receive the same meaning and order in English and German across Codex, Claude Code, OpenCode,
   Copilot and exact-text fallback.

Failure of any item is a presentation defect even when gate safety remains fail-closed.

#### Upstream alignment

Approved PRD revision 3 aligns its acceptance criteria with this five-field status-card decision. That
approval establishes requirement authority only; this solution design still requires independent exact
SD approval.

### D4. Add a focused human-output flag

`gate-check --approval-envelope` prints the two rendered blocks followed by the exact-text request. It:

- is valid only for `gate-check`;
- derives from the same `approval_presentation` object used by JSON;
- does not invoke a native host question;
- reports a concise non-ready reason rather than fabricating a card;
- preserves the gate-check exit status; and
- does not replace `--status-card`, normal gate-check detail or `--json`.

Native-capable agents use the JSON blocks verbatim and then invoke their canonical adapter. Copilot and
other instruction-only surfaces may use the complete human output as the exact-text interaction.

### D5. Prefer local execution without making CLI a ritual

User-facing guidance uses this precedence:

1. ordinary agent work: inspect the selected live control state and apply the active skill;
2. deterministic ready-gate rendering or repeatable validation: use an already installed `agdf` or
   repository-local `node_modules/.bin/agdf`;
3. bootstrap, installation, explicit version refresh or missing local executable: use documented
   `npx --yes @agdf/cli@latest ...` fallback.

The implementation will not auto-install dependencies, mutate a project's package manifest or perform
an implicit network lookup. `npx` remains explicit.

### D6. Preserve truthful surface boundaries

- Codex: shared blocks plus exact-value native adapter only when capability preflight permits it.
- Claude Code: shared blocks plus `AskUserQuestion` only under the existing safe-wait rules.
- OpenCode: shared blocks plus `question` only when explicit permission allows it.
- GitHub Copilot: shared generated skill/contract and rendered exact-text transport. No native adapter is
  added to `agdf-plugin.definition.json` without independently verified host capability.
- Fallback: shared rendered exact text and deliberate user response.

### D7. Keep host-visible proof separate

Deterministic tests prove projection content and invariants. Optional authenticated/live observations
record whether a host actually displayed the supplied blocks or control. They never become approval
authority and cannot substitute for deterministic validation.

## 4. Integration Points

- `interaction-presentation.js`: snapshot validation, pure block renderer and fallback text;
- `gate-check.js`: attach additive projection and print focused envelope;
- CLI parser/registry/application: `--approval-envelope` validation and dispatch;
- locale registry: add the neutral decision-heading, required-decision and decision-outcome copy;
- gate-check skill and focused Runtime Contract modules: local-helper precedence and reduced rendering
  procedure;
- `sync-package-assets.js`: Codex, Claude Code, OpenCode and Copilot generated parity;
- `README.md`, `INSTALL.md`, `agdf/README.md`: operating-model and invocation guidance;
- interaction, control-state, CLI modularization, smoke, Runtime Integrity and skill-eval suites.

There are no database, persistence, API, migration or external-service integrations.

## 5. Constraints And Compatibility

- Gate evaluation occurs before projection and remains the sole readiness authority.
- Exact approvals remain `Approval: <GateName>` and require same-run/same-gate revalidation.
- The projection remains derived, non-persistent and `authorizes: false`.
- Existing JSON keys, status-card behavior, CLI commands and exit codes retain their meaning.
- `--approval-envelope` cannot combine with `--all-active` and must reject unsupported commands.
- Locale resolution remains exact pack, language subtag, then complete English fallback.
- Artefact links remain selected-run-relative and must retain symlink/path safety.
- Generated files remain derived from canonical plugin sources.
- Copilot remains repository-instruction based and exact-text capable without a plugin-runtime claim.
- No automatic global install, dependency write or network access is added.

## 6. Test And Evidence Strategy

TP must include:

1. unit fixtures for all six user gates in English and German;
2. exact block snapshots for the approved wireframes, neutral heading hierarchy, five fields, transition
   structure, links, prompt and fallback;
3. negative mutation tests for order, missing blocks, generic headings, field drift, mixed locale,
   decorated approval, stale revision and run/gate mismatch;
4. JSON fixtures for ready object and non-ready `null`, proving unchanged existing fields;
5. CLI parser/registry tests for `--approval-envelope`, incompatible options and exit codes;
6. human output fixtures proving copy-ready two-card plus exact-text sequence;
7. narrow-width and long-title fixtures proving vertical reflow, deterministic title fallback and no
   table/fixed-column output;
8. accessibility assertions for semantic order, readable links, distinct option names and no
   icon/color-only meaning;
9. documentation/help assertions distinguishing bootstrap `npx` from repeated `agdf` and direct agent
   inspection;
10. generated Copilot fixtures proving canonical skill, contracts, locale and exact-text transport with
   no speculative interaction adapter;
11. synchronized Codex, Claude and OpenCode surface checks;
12. Runtime Integrity positive and negative drift checks;
13. aggregate package smoke and `git diff --check`; and
14. optional live Codex/Claude/OpenCode/Copilot observations using the six usability questions above,
    reported separately and truthfully.

## 7. Risks And Open Questions

- A host can still mutate or omit transmitted text when it exposes no response-interception hook; live
  evidence must retain this limitation.
- Always emitting the additive JSON field increases report size slightly; TP should measure the ready
  payload and confirm it remains compact.
- A local `agdf` binary can be version-skewed. Human guidance must retain explicit version/status checks
  for installation and release workflows without forcing them into every interaction.
- Copilot's instruction-only delivery may not execute the local renderer automatically. Exact text from
  the shared projection is conforming; native enforcement is not claimed.
- SD deliberately avoids a generated standalone renderer because that would enlarge sync and drift
  risk. If implementation proves the published CLI cannot be called locally on a supported surface,
  Brownfield Analysis must escalate rather than add a second renderer.

PRD revision 3 aligns the field-count requirement and is approved. After SD approval, task planning
must preserve these constraints and may narrow implementation paths, but it may not replace the
canonical renderer or add native authority.

## 8. Next Step

Review this solution design and approve only with:

`Approval: SD`
