# TP: Chat Noise Suppression Task and Test Plan

Status: draft
Gate: TP
Revision: 1
Derived from: SD
Date: 2026-07-16

## Tasks

| Task ID | Description | File | Acceptance |
|---|---|---|---|
| CNS-01 | Add "Chat and Tool-Call Discipline" subsection to §Chat Output Discipline | `plugin/meta/agdf-runtime-contract.md` | Clause present; covers skill compaction, tool batching, template-read avoidance, surface neutrality |
| CNS-02 | Add 1-line reference note | `plugin/skills/gate-check/SKILL.md` | Note present, references Runtime Contract clause |
| CNS-03 | Add "Compact Chat Output" guidance | `plugin/skills/qa-gate/SKILL.md` | 1-line at pass, expanded at revise/block; QR only at revise/block |
| CNS-04 | Add "Compact Chat Output" guidance | `plugin/skills/code-review/SKILL.md` | 1-line at pass, findings at revise/block |
| CNS-05 | Add "Compact Chat Output" guidance | `plugin/skills/task-plan-review/SKILL.md` | 1-line at pass, findings at revise/block |
| CNS-06 | Add "Compact Chat Output" guidance | `plugin/skills/clean-implementation-review/SKILL.md` | 1-line at pass, findings at revise/block |
| CNS-07 | Sync generated surfaces + verify | `sync-package-assets.js`; `check-runtime-integrity.mjs` | Generated copies match; integrity ok |

## Tests

| Test ID | What it asserts |
|---|---|
| CNS-T01 | Runtime contract contains "Chat and Tool-Call Discipline" subsection |
| CNS-T02 | All 5 skills contain compact output guidance |
| CNS-T03 | `check-runtime-integrity.mjs` passes |
| CNS-T04 | `test:interaction-presentation` unaffected |

## Verification

1. Implement CNS-01 through CNS-06.
2. `npm run sync-package-assets`.
3. `npm run test:interaction-presentation`.
4. `node plugin/scripts/check-runtime-integrity.mjs`.
5. `git diff --check`.

## Next Step

`Approval: TP`
