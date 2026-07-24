# CD+Tests Evidence: Community Health

Status: done_with_external_gaps
Date: 2026-07-23
Based on: `.agdf/control/artefacts/github-community-health-governance/TP.md`

## Delivered Repository Scope

- five canonical root policies;
- four Issue Forms, chooser config, pull-request template and CODEOWNERS;
- repository metadata desired-state manifest;
- 1280×640 social-preview asset;
- README community navigation;
- SOT Registry and Context Graph ownership;
- root `yaml@2.9.0` dependency and lockfile;
- deterministic checker, 14 negative contract fixtures and Guardrails integration.

## Passing Evidence

| Check | Result |
|---|---|
| `npm ci --ignore-scripts` | pass; 2 packages audited, 0 vulnerabilities |
| `npm run test:community-health` | pass; baseline plus 14 negative contracts |
| `npm run check:community-health` | pass; 17 required files and 4 Issue Forms |
| Node syntax for both new scripts | pass |
| Guardrails workflow YAML parse | pass |
| `node plugin/scripts/check-runtime-integrity.mjs` | pass; 10 skills and 16 control files |
| `npm --prefix create-agdf run sync-package-assets` | pass; no unexpected generated delta |
| `npm --prefix create-agdf run test:package-contents` | pass; 228 files |
| `npm --prefix agdf run smoke-test` | pass |
| `npm --prefix pages run check` | pass; 0 errors, warnings or hints |
| Delivery Path Search focused/unit/generator | pass |
| OpenCode hardening | pass |
| direct `create-agdf/scripts/smoke-test.js` | pass |
| direct `create-agdf/scripts/test-routing.js` | pass |
| `git diff --check` | pass |
| Social preview | pass; PNG 1280×640, 850979 bytes, visually inspected |

## Reconciled Regression Evidence

The separately authorized recovery reconciled both unrelated blockers without weakening validation:

1. The gate-check source fingerprint was deterministically refreshed after the already-committed OpenCode disclosure changed its behavior-owner hash. Skill evaluations now pass 39/39.
2. `opencode-plugin-honesty-hardening` was reconciled from active to completed using its existing commit `ae5f57c`; the historical Verified Change baseline was not recaptured. Global delivery-map status is now `warn` with zero block findings.
3. The complete `npm --prefix create-agdf run smoke-test` passes, including routing, skill evaluations, Delivery Path Search and OpenCode hardening.

## Host Evidence

- Authenticated GitHub connector: exact public repository, default branch `main`, admin/maintain/push/triage/pull permission.
- In-app browser: unauthenticated for repository Settings; PVR/settings state could not be observed.
- GitHub settings mutation: not performed because the available browser is not authenticated and the GitHub connector does not expose repository-settings mutation.
- Default-branch recognition: not available before separately authorized VCS delivery.
