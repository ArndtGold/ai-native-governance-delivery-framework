# SD: Scope Classification Card Contract Hardening

Status: approved
Gate: SD
Gate approval: approved on 2026-08-19 with exact `Approval: SD`
Based on: approved PRD Revision 1
Date: 2026-08-19
Owner: agent

## 1. Solution Overview

Harden the existing pure `renderScopeClassificationCard` path without introducing another renderer,
classification engine or policy owner. The existing interaction presentation module owns dynamic
input validation and the technical constants that realize the approved PRD bounds. The existing
locale resolver continues to own requested-locale selection and registry validity. The interaction
contract owns the normative activation and failure behavior; the locale registry owns only visible
copy. Focused tests and Runtime Integrity prove the contract, and the existing synchronization owner
propagates the change to generated surfaces.

## 2. Ownership And Source Of Truth

- Product behavior: approved child PRD.
- Normative interaction behavior: `plugin/meta/contracts/interaction.md`.
- Renderer, validation helpers and technical limit constants:
  `create-agdf/lib/interaction-presentation.js`.
- Visible localized labels: `plugin/meta/agdf-interaction-locales.json`.
- Agent consumption: `plugin/skills/gate-check/SKILL.md`, consume-verbatim only.
- Focused renderer regression evidence:
  `create-agdf/scripts/interaction-presentation-test.js`.
- Behavioral routing evidence: existing `evals/` owners.
- Propagation and installed-layout evidence: existing `sync-package-assets` and Runtime Integrity
  owners.

No new file or wrapper owns classification semantics.

## 3. Architecture Decisions

### 3.1 Mode and activation validation

`renderScopeClassificationCard` accepts only:

- `outcome === "ungated"`
- `mode === "quick_task"`
- `trivial_boundary === "inside" | "outside"`

Every other mode or outcome returns `null`. Remove `scopeClassification.mode.verified_change` from
both locale packs because it is no longer valid visible vocabulary for this semantic block.

### 3.2 Dynamic-input validation

Keep one frozen module-local technical limits object in `interaction-presentation.js`:

- `maxCodePointsPerField: 240`
- `minEscalationTriggers: 1`
- `maxEscalationTriggers: 3`

Add one module-local validator used by every dynamic scalar and escalation item. A valid value:

- is already a string; implicit object/array coercion is rejected;
- remains non-empty after trimming;
- contains no carriage return or newline;
- contains at most 240 Unicode code points, measured with `Array.from(value).length`;
- contains no Markdown control token: backslash, backtick, asterisk, underscore, square bracket,
  angle bracket or pipe;
- does not begin, after trimming, with Markdown heading, blockquote, unordered-list or ordered-list
  syntax (`# `, `> `, `- `, `+ ` or `<digits>. `).

The renderer rejects the complete input and returns `null` on the first invalid value. It does not
silently truncate, sanitize or partially retain values. Escalation triggers must be an array within
the approved count, every item must pass the same validator, and duplicate normalized items are
rejected.

`markdownCell` remains a defense-in-depth output escape for valid content; it is not the input
policy owner.

### 3.3 Locale resolution

Reuse `resolvePresentationLocale` unchanged:

- A complete valid registry plus an unsupported requested tag resolves to the configured English
  fallback.
- A present incomplete or otherwise invalid registry causes validation to throw; the renderer
  catches the failure and returns `null`.

The interaction contract must state this distinction explicitly. No partial pack merge or
field-by-field fallback is introduced.

### 3.4 Failure and recovery

`null` is the only renderer failure result. `gate-check` continues to fail closed to the existing
ceremony and never reconstructs Markdown. No error is converted into a valid card, no retry state is
stored and no user gate changes.

## 4. Integration And Change Surface

Expected canonical source changes:

1. `create-agdf/lib/interaction-presentation.js` — restrict mode, add constants/helper and validate
   all dynamic input.
2. `plugin/meta/agdf-interaction-locales.json` — remove invalid Verified Change label from both
   complete packs.
3. `plugin/meta/contracts/interaction.md` — align Quick Task-only activation, locale distinction and
   bounded plain-text failure behavior.
4. `create-agdf/scripts/interaction-presentation-test.js` — add boundary and negative matrices.
5. `plugin/scripts/check-runtime-integrity.mjs` — assert the canonical contract and absence of the
   invalid locale label where structural drift detection is reliable.
6. Existing gate-check eval corpus — add or refine a Verified Change suppression case if current
   evidence does not exercise that exact state.
7. Generated assets — update only through the canonical synchronization command.

No `gate-check` local card template or second validation helper is allowed.

## 5. Compatibility And Migration

- No persisted classification state, schema, gate value, CLI flag or output schema changes.
- Valid Quick Task cards preserve field order and semantic block shape.
- Unsupported locales continue to render English when the registry is valid.
- Previously accepted invalid/over-length/Markdown-bearing input now fails closed; this is the
  approved compatibility correction.
- Verified Change flows use their existing run-status/Verified Change presentation and no longer
  have latent scope-card rendering support.
- Generated runtime digest changes are expected and must be produced deterministically.

Rollback is a local source revert plus canonical regeneration; no data migration or coordinated
cutover exists.

## 6. Test And Evidence Strategy

- Valid boundaries: 1 and 240 Unicode code points; 1 and 3 escalation triggers.
- Invalid boundaries: empty/whitespace, 241 code points, non-string values, newline/CR, duplicate
  triggers and 0/4 trigger counts.
- Markdown classes: headings, emphasis, code, links/images, blockquotes, unordered/ordered lists,
  tables and escape characters.
- Mode/outcome: Quick Task pass; Verified Change, structured, gated and unknown return `null`.
- Locale: unknown requested tag returns English; incomplete German pack and malformed registry
  return `null`; complete English/German remain deterministic.
- Security/authority: `authorizes: false`, frozen result, no approval vocabulary.
- Regression: existing interaction presentation suite, gate-check evals and relevant package smoke.
- Propagation: synchronization idempotence, source Runtime Integrity and generated installed-layout
  Runtime Integrity.

## 7. Brownfield Fit And Parallel-Structure Controls

- Extend the existing renderer and registry; create no replacement.
- Reuse the existing locale-validation exception boundary.
- Keep dynamic technical constants beside the only consumer; do not duplicate numerical values in
  the skill or locale registry.
- Tests may use approved boundary literals as assertions but must not export a second runtime policy.
- Any need for a second module, persistent schema or CLI classifier is scope growth and routes back
  to PRD.

## 8. Risks And Mitigations

- Markdown detection can over-reject ordinary text. Mitigation: reject only explicit control tokens
  and line-leading structural syntax; preserve ordinary punctuation and plain URLs.
- Unicode counting can drift through UTF-16 `.length`. Mitigation: mandate code-point counting and
  test astral characters at the boundary.
- Locale-label removal can break parity. Mitigation: remove the same key from every complete pack
  and run registry validation before sync.
- Generated runtime drift can mask source correctness. Mitigation: sync once, verify idempotence and
  validate the installed-layout fixture.
- Existing dirty paths may overlap with this child. Pre-implementation Brownfield Analysis must
  resolve exact diff ownership after TP approval.

## 9. Context Graph Impact

- context_graph_impact: update_existing_node
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`
- context_graph_reconciliation: open_gap
- context_graph_required_action: update after implementation and acceptance evidence
- context_graph_gate_effect: none
- context_graph_evidence: Approved PRD and this SD define the corrected activation, locale and
  invalid-input recovery boundary.

## 10. Next Step

The Solution Design is approved. Review and approve the derived Task/Test Plan before any
implementation-preparation Brownfield Analysis or code change.
