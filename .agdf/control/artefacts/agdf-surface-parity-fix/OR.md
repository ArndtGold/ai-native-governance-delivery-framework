# OR: Surface Parity Fix Delivery Report

Status: pass
Gate: OR
Date: 2026-07-16
Run: agdf-surface-parity-fix

## Gate Status

All gates approved (UR, PRD, SD, TP, QA, UAT).

## Delivered

- `approvalValueTransport` changed from `decorated_label_only` to `exact_option_value` for codex, claude and opencode surfaces.
- `defaultPrompt` added under `claude` with the same 4 starter prompts as `codex`.
- `shortDescription`, `longDescription` and `description` rewritten to be surface-neutral (no "Codex" mention).
- Runtime Contract surface adapter table updated for `exact_option_value`.
- `interaction-presentation-test.js` updated: `exact_option_value` → `eligible: true` asserted; `decorated_label_only` rejection retained.
- `check-runtime-integrity.mjs` updated: expected transport values and description checks aligned.
- `plugin/.codex-plugin/plugin.json` source manifest updated.

## Not Delivered

- No commit, push, PR or release action.

## Evidence

- test:interaction-presentation: pass
- check-runtime-integrity.mjs: ok (9 skills, 15 control files)
- git diff --check: clean

## Next Permissible Step

Delivery closeout ready. Commit/push/PR require explicit instruction.
