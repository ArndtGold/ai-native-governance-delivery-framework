# CD+Tests: Cross-Surface Skill Target Preflight

- status: `done`
- based_on: approved TP Revision 1
- date: 2026-09-03
- implementation_scope: CSTP-T02 through CSTP-T10

## Delivered

- `task-target-resolution.md` owns one Direct Skill Invocation Preflight before any skill-specific
  repository, run, gate, quality or mutation work.
- All ten canonical skills consume the Target and Interaction contracts, stop terminally on
  unresolved and use only the resolved governance target downstream.
- The resolved presentation language remains binding for target orientation, clarification and the
  subsequent skill-owned chat output.
- `qa-gate` selects exactly one eligible run, discovers durable repository evidence itself, stops at
  run clarification before QA and never promises a Run Status Card or interactive QA card.
- Runtime Integrity checks the shared contract and every canonical skill. Negative tests cover a
  removed shared boundary, a broken skill consumer and QA evidence deflection.
- The deterministic corpus is Revision 1.9.0 with 83 cases. Every skill has an unresolved direct
  invocation case; QA adds unique-run, ambiguous-run, missing-review and card/approval-bait cases.
- Existing generators project the canonical sources to Codex, Claude Code, GitHub Copilot and
  OpenCode. No host-specific semantic owner was added.

## Changed Owners

- `plugin/meta/contracts/task-target-resolution.md`
- `plugin/skills/*/SKILL.md` for the ten definition-owned skills
- `plugin/scripts/check-runtime-integrity.mjs`
- `create-agdf/scripts/runtime-integrity-negative-test.js`
- `create-agdf/scripts/skill-evals-test.js`
- `evals/cases/*.json`, `evals/manifest.json`, `evals/observations/deterministic-replay.json`
- `plugin/meta/copilot-payload-baseline.json`

## Test Evidence

| Check | Result | Evidence |
|---|---|---|
| Source Runtime Integrity | pass | 10 skills and 16 control files checked |
| Runtime Integrity layout | pass | Source and generated layout tests |
| Runtime Integrity negative | pass | Shared contract, skill consumer and QA owner failures detected |
| Task target resolution | pass | Resolved and unresolved resolver cases |
| Interaction presentation | pass | Gate, scope and task-target renderers including locale fixtures |
| Agent Skills conformance | pass | Source, policy, resources, symlinks and four generated surfaces |
| Copilot profile | pass | Inventory, drift, exclusions and growth fail closed |
| Skill eval framework | pass | Direct-case retention and QA self-discovery cases enforced |
| Deterministic skill replay | pass | 83/83 cases, 10/10 skills |
| Package build | pass | Byte-identical complete builds; source untouched |
| Complete `create-agdf` smoke | pass | Final non-TTY run including package, lifecycle, profile, integrity, eval, OpenCode and routing tests |
| Diff hygiene | pass | `git diff --check` after implementation |

## Payload Measurement

- Before: 82 files, 604901 bytes.
- After: 82 files, 612679 bytes.
- Increase: 7778 bytes, approximately 1.29 percent.
- Reason: one shared contract extension, direct-invocation consumption in ten skills and QA
  evidence-discovery behavior.
- The reviewed baseline was updated to the measured value; further growth still fails closed.
- Repeated profile sync is idempotent.

## Execution Notes

- One preliminary smoke invocation used an interactive TTY and was invalid for the CLI fixture.
- The first canonical non-TTY smoke invocation was stopped by sandbox-denied access to the existing
  npm cache, not by an AGDF assertion.
- The same non-TTY suite was rerun with explicit cache access and passed. After the final Locale
  Contract correction it was rerun again and passed completely.

## Not Delivered Or Claimed

- No plugin installation, cache refresh, host restart, release, commit, push or PR.
- No loaded-host behavior is inferred from source, generated profile or package evidence.
- The unrelated untracked image remains excluded.
