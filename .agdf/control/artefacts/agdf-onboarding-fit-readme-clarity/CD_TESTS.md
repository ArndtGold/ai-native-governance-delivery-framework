# CD+Tests: Proportionate AGDF Fit Onboarding

## Status

- status: `done`
- based_on: `.agdf/control/artefacts/agdf-onboarding-fit-readme-clarity/TP.md`
- date: 2026-07-14

## Delivered Implementation

- Added `#### Passt AGDF zu diesem Vorhaben?` inside `README.md` → `Runtime und Setup` → `AGDF als Plugin mit einem Coding Agent anwenden`, directly before the existing installation-reference paragraph.
- Added German-first fit guidance: AGDF is useful for AI-assisted changes needing visible scope, approvals, evidence or collaboration; small, low-risk or exploratory work can justify a lighter path.
- Added the copyable English assessment prompt and explicit advisory boundary; it does not approve implementation or replace human responsibility.
- Replaced only `codex.defaultPrompt[0]` in the canonical plugin definition with the approved proportionate wording, including the explicit recommendation against AGDF where it adds more process than value.
- Updated the derived Codex manifest to match the canonical definition. Prompts two through four are unchanged and retain their order.
- Ran the existing package asset synchronization; no new prompt owner, generator, command, skill or runtime behavior was added.

## TP Coverage

| task_id | Status | Evidence |
|---|---|---|
| AFC-01 | done | README insertion is under `Runtime und Setup`, after the Coding-Agent subsection heading and before the existing npm installation reference. |
| AFC-02 | done | German-first text names benefits, overhead and the legitimate lighter-path outcome; it is explicitly advisory. |
| AFC-03 | done | Copyable prompt contains the before-implementation, purpose/benefits, risk/overhead, lightest-path and explicit no-AGDF clauses. |
| AFC-04 | done | Canonical `codex.defaultPrompt[0]` is refined; the following three entries remain present and ordered. |
| AFC-05 | done | `node create-agdf/scripts/sync-package-assets.js` ran successfully; derived Codex manifest was aligned with the canonical definition. |
| AFC-06 | done | Runtime integrity, package smoke, doctor and diff checks passed. |

## Test Evidence

- `node create-agdf/scripts/sync-package-assets.js` → pass.
- `node plugin/scripts/check-runtime-integrity.mjs` → pass (`9 skills and 14 control files checked`).
- `npm --prefix create-agdf run smoke-test` → pass, including generated-asset sync, control-state, Delivery Path Search, package smoke and routing tests.
- `node create-agdf/bin/create-agdf.js doctor --json` → pass, 0 findings.
- `git diff --check` → pass.

## Intentionally Not Performed

- No Pages, installation-command, gate-model, runtime-contract, skill, hook, evaluator or CLI change.
- No commit, push, pull request, publication or release.
- No QA decision or UAT request; mandatory reviews remain next.

## Next Step

Run Task Plan Review, Clean Implementation Review and Code Review before QA.
