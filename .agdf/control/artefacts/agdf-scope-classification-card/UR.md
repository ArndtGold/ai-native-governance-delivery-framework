# UR: Canonical Scope Classification Card for Fresh Ungated Scopes

Status: approved
Gate: UR
Gate approval: `Approval: UR` accepted on 2026-07-21 after same-run, same-gate, revision and durable-artefact revalidation.
Revision: 1
Date: 2026-07-21
Owner: agent

## 1. Problem

For fresh scopes that `gate-check` classifies as ungated (Quick Task, Trivial Change Boundary), the visibility of that classification depends entirely on agent-authored ad-hoc output. Ready user gates have a deterministic, code-owned presentation (`status_presentation`, `approval_presentation`, two-card envelope); the "no user gate triggered" evaluation has no canonical presentation at all.

Observed in this repository's own delivery session on 2026-07-21: an agent began edits to `evals/**` without a visible scope classification. Only two user challenges ("Was ist mit den Gates?", "Du hast nicht nach Approval gefragt, warum?") forced the classification into the open, and the result was an ad-hoc table, not a deterministic rendering. Whether a user ever sees *why* no UR is required, *which* mode applies, *what* the boundary result is and *what* would escalate currently depends on model goodwill, not on the framework.

Consequences: classifications are inconsistent across models and hosts, cannot be relied upon, are hard to challenge systematically, and the proportionality decision (the framework's central anti-overhead promise) may never become visible.

## 2. Goal

A canonical, deterministic, compact scope-classification presentation for fresh scopes evaluated as ungated: one code-owned, localized, non-authorizing projection, consumed verbatim by `gate-check`, so the classification — UR trigger evaluation, selected mode, boundary result, currently allowed/forbidden outputs and escalation triggers — is always visible and challengeable, without becoming a gate and without adding ceremony to lightweight paths.

## 3. Scope

After the required approvals, deliver the smallest safe change that:

1. defines a canonical scope-classification projection schema (classification outcome, UR-trigger evaluation, mode, boundary result, allowed/forbidden summary, escalation triggers, `authorizes: false`);
2. extends the single code-owned presentation owner (`create-agdf/lib/interaction-presentation.js`) to render it — no parallel renderer, no second card owner;
3. makes `gate-check` consume the projection verbatim for fresh ungated scopes and forbids skill-local classification templates;
4. adds locale-registry keys for `en` and `de` with parity enforced by the existing locale validation;
5. adds Runtime Integrity assertions for ownership, non-duplication and the absence of approval controls in the classification card;
6. extends the skill-eval corpus with cases for: ungated scope renders the classification, the card never displays approval controls, and an ambiguous boundary classification fails closed to the existing ceremony.

## 4. Non-Goals

- No new user gate, no new approval value, no change to gate order or the Gate Transition Model.
- No mandatory ceremony that makes Quick Tasks heavier than today's ad-hoc classification (proportionality guard: the card must not add a user decision step).
- No change to the existing `status_presentation` / `approval_presentation` schemas for gated runs.
- No persistence requirement: the classification is transient and non-authorizing; it must not become a state store.
- No live host UI claims; no commit, push, PR, release or reinstall as part of this run.
- Not retroactive for historical runs or artefacts.

## 5. Acceptance Signals

1. The same control state and locale produce a byte-identical classification card across invocations (deterministic rendering).
2. The card carries `authorizes: false` and never renders approval options for an ungated scope.
3. `gate-check/SKILL.md` contains no second classification card template; Runtime Integrity fails on drift or duplication.
4. `en`/`de` key parity is enforced by the existing locale-registry validation.
5. Quick Task chat output stays compact; the chat-discipline contract is unchanged.
6. The eval corpus covers ungated rendering, absence of approval controls and ambiguous-boundary fail-closed behavior.

## 6. Existing Source Of Truth

- `plugin/meta/contracts/interaction.md` — presentation ownership, `authorizes: false` precedent, locale contract, read-only orientation line (possible overlap to clarify);
- `plugin/meta/contracts/modes.md` — Quick Task output, Trivial Change Boundary;
- `plugin/skills/gate-check/SKILL.md` — fresh-request classification behavior and output rules;
- `create-agdf/lib/interaction-presentation.js` — canonical presentation owner;
- `plugin/meta/agdf-interaction-locales.json` — locale registry;
- `evals/` — behavioral corpus (extended to 36 cases on 2026-07-21, including the session's P0 gate-authority cases).

## 7. Risks And Unknowns

- Fresh ungated scopes typically have no selected run; where the deterministic classification evaluation lives (CLI evaluation expects run state) is an open design question for Brownfield Review and SD.
- Proportionality inversion risk: if the card costs more than today's ad-hoc classification, the framework's anti-overhead promise breaks; Brownfield Review must size this explicitly (escalation target: `structured_slice`).
- Overlap with the existing read-only orientation line in `interaction.md` must be clarified — one orientation owner, not two.
- Whether the classification projection needs any machine-readable JSON twin (like `status_card`) or stays chat-only must be decided in SD.

## 8. Next Step

Perform Brownfield Review and select the smallest safe delivery path before drafting later artefacts or implementation. Approve only with:

`Approval: UR`
