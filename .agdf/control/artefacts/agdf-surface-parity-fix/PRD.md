# PRD: Surface Parity Fix

Status: draft
Gate: PRD
Date: 2026-07-16
Derived from: UR

## Product Outcome

All three surfaces (Codex, Claude Code, OpenCode) have correct capability declarations, equal starter prompts and surface-neutral descriptions.

## Functional Requirements

- PRD-01: Change `approvalValueTransport` from `decorated_label_only` to `exact_option_value` for `codex`, `claude` and `opencode` in `agdf-plugin.definition.json`.
- PRD-02: Add `defaultPrompt` array under `claude` in `agdf-plugin.definition.json` with the same 4 prompts as `codex`.
- PRD-03: Rewrite `shortDescription` and `longDescription` to be surface-neutral (no "Codex" mention).
- PRD-04: Update Runtime Contract surface adapter table to reflect `exact_option_value` for all three surfaces.
- PRD-05: Update `interaction-presentation-test.js` to assert `exact_option_value` → `eligible: true` for all three surfaces; retain `decorated_label_only` rejection test.
- PRD-06: Tests and runtime integrity pass.

## Acceptance Criteria

1. All three surfaces declare `"approvalValueTransport": "exact_option_value"`.
2. `claude` has `defaultPrompt` with 4 entries.
3. `shortDescription` and `longDescription` do not contain "Codex".
4. Runtime Contract table says `exact_option_value` for all three surfaces.
5. Test asserts `exact_option_value` → `eligible: true`, `native_attempt_required: true`.
6. `decorated_label_only` rejection test still passes.
7. `test:interaction-presentation` and `check-runtime-integrity.mjs` pass.

## Next Step

`Approval: PRD`
