# Solution Design: Gate State Clarity

## Status

- status: approved
- approval: Approval: SD (2026-07-10)
- derived_from: PRD for `gate-state-clarity`

## Architecture Decision

Extend the existing gate-check report path in `create-agdf/bin/create-agdf.js` and the canonical Runtime Contract wording in `plugin/meta/agdf-runtime-contract.md`. Do not introduce a second gate table or a new status engine. New machine-readable fields are additive and derived from the existing transition decision.

## Design

### Transition Fields

Add two additive fields to the gate-check report and its compact status-card projection:

- `next_gate_after_approval`: the gate or internal step unlocked by the exact missing approval, or `none`
- `allowed_after_approval`: concise text describing what becomes allowed after the missing approval, or `none`

These fields are populated only when a user approval is missing. Internal steps and completed/OR handoff states report `none`.

### Derivation Strategy

Use a small helper in the existing gate-check owner that derives post-approval transition metadata from the current `transitionDecision.current_gate` and `transitionDecision.missing_approval`.

The helper must not duplicate the full gate model. It should map only the approved gate's immediate next step where the current transition decision already proves the missing approval:

| Missing approval | Next gate/internal step after approval | Allowed after approval |
|---|---|---|
| `Approval: UR` | `Brownfield Review` | Run Brownfield Review and record Mode/Slice Decision before PRD or implementation |
| `Approval: PRD` | `SD` | Draft Solution Design; implementation remains forbidden |
| `Approval: SD` | `TP` | Draft Task/Test Plan; implementation remains forbidden |
| `Approval: TP` | `Brownfield Analysis` | Run implementation-prep Brownfield Analysis before CD+Tests |
| `Approval: QA` | `UAT` | Request UAT when QA has passed; release remains gated |
| `Approval: UAT` | `OR` | Produce OR or delivery closeout; VCS/release actions still require explicit instruction |

If the missing approval is absent, unknown or not a user gate, both fields return `none`.

### Output

`gate-check --status-card` prints the new lines only when they carry useful values:

- `Next gate after approval: ...`
- `Allowed after approval: ...`

`gate-check --json` and `delivery-map --json` include the same additive fields where they embed `status_card`.

### Runtime Contract And Templates

Update `plugin/meta/agdf-runtime-contract.md` to describe:

- current authority: what is allowed now
- missing approval: exact formula
- post-approval transition: what the approval unlocks
- next step: the single immediate process action

Update `plugin/control/templates/AGDF_RUN.md` only if its Run Status Card guidance needs the same field names. Generated output remains synchronized through the existing package sync step.

## Test Design

Extend `create-agdf/scripts/smoke-test.js` with focused assertions:

1. A PRD-gated fixture reports `next_gate_after_approval: "SD"` and allowed-after-approval text that does not mention implementation as allowed now.
2. A Brownfield Review/internal-step fixture reports no post-approval transition fields.
3. An OR/completed handoff fixture reports no post-approval transition fields.
4. `--status-card` output includes the new lines for missing-approval cases and omits them for internal/completed states.

## Compatibility

Existing JSON fields remain unchanged. New fields are additive. Human output gains at most two compact lines and only when useful.

## Risks And Mitigations

- Risk: duplicate gate logic. Mitigation: derive only immediate post-approval metadata and keep canonical gate order in Runtime Contract/gate-check transition logic.
- Risk: noisy status-card output. Mitigation: print new lines only when a missing approval exists.
- Risk: generated output drift. Mitigation: update authoritative `plugin/` sources and run existing sync/smoke validation.

## Required Validation

- `npm --prefix create-agdf run smoke-test`
- `node plugin/scripts/check-runtime-integrity.mjs`
- `npx --yes @agdf/cli@latest doctor --json`
- `git diff --check`

## Required Next Step

Review this SD and provide exact approval:

`Approval: SD`
