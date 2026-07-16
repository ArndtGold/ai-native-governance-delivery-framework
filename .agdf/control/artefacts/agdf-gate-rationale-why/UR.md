# UR: Gate-Rationale-Registry and On-Demand "Why?" Interaction (Slice B)

Status: approved
Gate: UR
Gate approval: `Approval: UR` provided on 2026-07-16
Date: 2026-07-16
Owner: agent

## 1. Problem

AGDF gates are visible to the user as compact cards and transition prompts, but the
*reason* each gate exists — why it matters, what it prevents — is not surfaced in the
interaction. The user sees "Approve user requirements" or "Approve solution design" and
must either trust the process blindly or read the full Runtime Contract to understand the
rationale.

The existing `agdf-interaction-locales.json` provides deterministic, localized gate titles,
action titles, approval effects and narration — but no curated "why" for each gate. When
the agent explains a gate, it generates prose ad hoc, which is non-deterministic, verbose
and inconsistent across invocations.

Two gaps:

1. **No deterministic rationale content.** The "why" for each gate and internal step is
   nowhere in the locale registry. The agent either omits it or invents it.
2. **No on-demand "Why?" path.** The user has no stable, lightweight way to ask "why am I
   here?" without triggering a full explanation that floods the chat. Default output stays
   compact, but deeper context is unreachable when needed.

## 2. User Need

As an AGDF user encountering a gate, I need a deterministic, curated one-line rationale for
why this gate exists — available on demand without flooding the default output — so that I
can understand enough to accept that the gate makes sense, and can dig deeper only when I
choose to.

The rationale must be the same every time I ask for the same gate (deterministic, not
generated), localized to the configured chat language, and compact enough to stay within
the existing presentation budget.

## 3. Scope

This is Slice B of the state-orientation improvement tracked in
`agdf-state-orientation`. Slice A (breadcrumb, transition narration, internal-state
projection) is separately tracked and does not overlap.

### 3.1 H6 — Gate-Rationale-Registry (Curated "Why" Content)

Add a `gateRationale` section to `agdf-interaction-locales.json` with one deterministic,
localized one-liner per gate and per internal step. The agent pulls the curated string; it
does not generate rationale prose.

Gates and steps covered:

- `UR` — why user requirements are clarified before anything is built.
- `PRD` — why product behaviour is defined before solution design.
- `SD` — why solution design is committed before code.
- `TP` — why task and test plan is fixed before QA can measure.
- `QA` — why quality evidence is evaluated before release.
- `UAT` — why deliberate user acceptance is required before closeout.
- `Brownfield Review` — why existing systems, owners and conventions are checked early.
- `Mode/Slice Decision` — why the proportionate delivery scope is chosen explicitly.
- `Brownfield Analysis` — why reuse, owners and regression risk are verified before code.
- `CD+Tests` — why implementation evidence is collected, not just produced.
- `CR` — why code review is mandatory before QA.
- `OR` — why an auditable delivery report closes the run.

Trade-off: a one-liner cannot explain the full protective function. The user needs enough
to accept that the gate makes sense, not the complete rationale. Deeper context is
available on demand (H7).

### 3.2 H7 — On-Demand "Why?" as First-Class Interaction

Add a stable, deterministic "Why?" response path using the existing `status`/`clarification`
interaction kind — **not** a new `interaction_kind`.

Behaviour:

- The user can ask "why?" or "Warum?" at any gate or internal step.
- The agent responds with the curated rationale (H6) plus one line stating what is already
  fulfilled at this gate and what this gate specifically protects against.
- The response is deterministic: same gate, same question → same answer. No per-call
  generation.
- The "Why?" interaction is a `status` interaction: it does not display approval controls,
  does not advance any gate, and does not change the approval sequence.

Separation from the approval interaction:

- The `gate_approval` options remain exactly `approve | revise | decline | cancel`. The
  "Why?" response is never injected into the approval question's option list.
- The "Why?" response is emitted as a separate `status` interaction before or after the
  approval envelope, never merged into it.

### 3.3 Files Affected

- `plugin/meta/agdf-interaction-locales.json` — new `gateRationale` section per locale
  (`en`/`de`) with one-liner per gate/step; `lengthBudgets` enforcement applies.
- `plugin/meta/agdf-runtime-contract.md` — add the Gate-Rationale-Registry contract
  (deterministic, localized, curated) and the on-demand "Why?" interaction contract
  (status kind, non-authorizing, deterministic, progressive disclosure).
- `plugin/skills/gate-check/SKILL.md` — agent behaviour: respond to "why?"/"Warum?" with
  curated rationale + fulfilled/protects line; no approval controls in the response.
- `create-agdf/lib/interaction-presentation.js` — validation: enforce `gateRationale`
  key parity across locales via existing `flattenKeys` baseline comparison; budget
  enforcement for rationale strings.
- `create-agdf/scripts/interaction-presentation-test.js` — regression tests for rationale
  key presence, budget compliance and deterministic retrieval.

## 4. Non-Goals

- No new `interaction_kind`. The existing five kinds remain the complete set.
- No change to approval authority, gate logic, the gate-transition model, or the
  approval-question option list.
- No change to the `gate_approval` interaction sequence (Run Status Card → Gate Transition
  Card → approval question).
- No automatic rationale display in the default card output. The rationale is on-demand
  only; default output stays compact.
- No change to the machine-readable Run Status Card JSON fields or CLI output.
- No change to the `agdf-state-orientation` Slice A scope (breadcrumb, narration,
  internal-state collapse).

## 5. Acceptance Criteria

1. `agdf-interaction-locales.json` contains a `gateRationale` section in both `en` and `de`
   with one localized string per gate (`UR`, `PRD`, `SD`, `TP`, `QA`, `UAT`) and per
   internal step (`Brownfield Review`, `Mode/Slice Decision`, `Brownfield Analysis`,
   `CD+Tests`, `CR`, `OR`).
2. `validateLocaleRegistry()` enforces `gateRationale` key parity across all locale packs
   and applies `lengthBudgets` to rationale strings.
3. Rationale strings are deterministic: `gateRationale(registry, locale, gate)` returns the
   same string for the same inputs across invocations.
4. The agent, when the user asks "why?" or "Warum?" at a gate or internal step, responds
   with the curated rationale plus one line of fulfilled/protects context, as a `status`
   interaction without approval controls.
5. The "Why?" response never appears inside the `gate_approval` option list and never
   breaks the `APPROVAL_SEQUENCE` or `validateApprovalOrientationSnapshot` validation.
6. The default card output (Run Status Card, Gate Transition Card, approval question) is
   unchanged when the user does not ask "why?".
7. `interaction-presentation-test.js` includes regression tests for: rationale key
   presence in both locales, budget compliance, deterministic retrieval, and locale-key
   parity validation failure when `gateRationale` is missing from one locale.
8. `npm --prefix create-agdf run test:interaction-presentation` passes.

## 6. Existing Source Of Truth

- `plugin/meta/agdf-interaction-locales.json` — owns localized presentation labels, gate
  titles, action titles, narration; will own `gateRationale`.
- `plugin/meta/agdf-runtime-contract.md` — owns the Run Status Card spec, Gate Transition
  Card contract, Native Interaction Contract (five interaction kinds); will own the
  Gate-Rationale-Registry and on-demand "Why?" contract.
- `plugin/skills/gate-check/SKILL.md` — owns the primary card rendering and native
  interaction orchestration; will own the "Why?" response behaviour.
- `create-agdf/lib/interaction-presentation.js` — owns locale validation, gate options,
  approval orientation snapshot; will own rationale validation and retrieval.
- `create-agdf/scripts/interaction-presentation-test.js` — owns interaction-presentation
  regression tests; will own rationale regression tests.

## 7. Resolved Design Decisions

1. **One-liner vs. full rationale** — decided: one-liner. The user needs enough to accept
   that the gate makes sense, not the complete protective function. Deeper context stays
   on-demand.
2. **New interaction_kind vs. existing kinds** — decided: use `status`/`clarification`, no
   new kind. The five kinds remain the complete set.
3. **"Why?" as approval option vs. separate interaction** — decided: separate `status`
   interaction. The approval option list stays `approve | revise | decline | cancel`;
   "Why?" never enters the `gate_approval` sequence.
4. **Deterministic vs. generated rationale** — decided: deterministic. Curated strings in
   the locale registry, not per-call LLM generation. Same question, same answer.

## 8. Next Step

Run the post-UR Brownfield Review and record the smallest justified Mode/Slice Decision.
Brownfield Review is expected to confirm `structured_slice` against the existing locale
registry, runtime contract and gate-check skill owners, and to verify that no approval,
gate, or authority change is touched.
