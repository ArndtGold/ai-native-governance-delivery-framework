# TP: Surface Parity Fix Task and Test Plan

Status: draft
Gate: TP
Revision: 1
Derived from: SD
Date: 2026-07-16

## Tasks

| Task ID | Description | File |
|---|---|---|
| SPF-01 | Change `approvalValueTransport` to `exact_option_value` for codex, claude, opencode | `agdf-plugin.definition.json` |
| SPF-02 | Add `defaultPrompt` under `claude` | `agdf-plugin.definition.json` |
| SPF-03 | Rewrite `shortDescription` and `longDescription` surface-neutral | `agdf-plugin.definition.json` |
| SPF-04 | Update surface adapter table in runtime contract | `agdf-runtime-contract.md` |
| SPF-05 | Add `exact_option_value` eligibility test; retain `decorated_label_only` rejection | `interaction-presentation-test.js` |
| SPF-06 | Sync + verify | sync-package-assets, check-runtime-integrity |

## Tests

| Test ID | Asserts |
|---|---|
| SPF-T01 | 3 surfaces declare `exact_option_value` |
| SPF-T02 | `exact_option_value` → `eligible: true`, `native_attempt_required: true` |
| SPF-T03 | `decorated_label_only` → `eligible: false` (retained) |
| SPF-T04 | `claude.defaultPrompt` has 4 entries |
| SPF-T05 | `shortDescription` no "Codex" |
| SPF-T06 | `test:interaction-presentation` passes |
| SPF-T07 | `check-runtime-integrity.mjs` passes |

## Verification

1. Implement SPF-01 through SPF-05.
2. `npm --prefix create-agdf run sync-package-assets`
3. `npm --prefix create-agdf run test:interaction-presentation`
4. `node plugin/scripts/check-runtime-integrity.mjs`
5. `git diff --check`

## Next Step

`Approval: TP`
