# T-007 Evidence: Payload, Fingerprints, Compatibility and verify:ci

Run: `agdf-begleiter-companion-20261025-01`
Task: T-007 (SDD-11; scenarios SCN-020, SCN-021)
Recorded: 2026-10-26
Result: done

## Regeneration and Payload

- `npm run build:prepare` passed (69.1 s) and regenerated the runtime plugin, Copilot profile, OpenCode and submission outputs.
- The companion adds 12 files / 41,864 bytes under `generated/plugins/agdf/companion/` of the shared runtime plugin.
- `node scripts/payload-budget.js` reports the Copilot runtime profile at 397 files / 3,495,539 bytes with zero headroom, equal to the reviewed baseline. The baseline file is not changed for the companion.
- `docs/maintenance/payload-budget-history.md` records the review in the section "Claude companion in the shared runtime plugin (2026-10-26)":
  - the 12 files / 41,864 bytes in the runtime plugin;
  - inert files in the Codex view;
  - the Copilot exclusion rule;
  - the unchanged Copilot inventory and baseline.

## Evaluation Fingerprints

`evals/lib/skill-evals` reported `manifest_fingerprint_stale` for seven skills: delivery-path-search, brownfield-analysis, ux-intent-definition, clean-implementation-review, delivery-closeout, gate-check and release-or.

- Cause: every stale case lists `plugins/agdf/meta/contracts/gate-transition.md` as a relevant source. No fresh skill's case does. This contract changed with the AGDF source-revision fix carried on this branch (Brownfield Analysis as initiating phase), not with the companion.
- Refresh: `evals/manifest.json` `source_fingerprints` and the `source_fingerprint` values of those skills' deterministic replay observations were moved to the current fingerprints. This follows the earlier refresh in commit bddb1d47.
- Unchanged: the diff of `evals/observations/deterministic-replay.json` contains only `source_fingerprint` lines. Routing, gate, approval, action and artefact expectations are untouched.
- Result: `runSkillEvals` passes 113/113 cases.
- `request-activation-evals-test` and `proportionality-benchmark-test` were already current and passed.

## Compatibility Records

- `npm run compatibility:check` reported `source_snapshot_changed`.
- `npm run compatibility:record` passed: 56 scenarios evaluated, 0 failed, source fingerprint `60a52c8d51a3e0ae0e16963ca8ba6359c13bc8548d0a599e889c19add3095f84`. It wrote observation `dca12bd7…` and refreshed `HOST_COMPATIBILITY.md`, `facts.json` and `snapshot.json`. `compatibility:check` then passed.
- Observation `a53e7851…` had been recorded for the intermediate state of the AGDF fix earlier on this branch. It was never committed and is referenced by nothing, so it was removed.
- The native Claude Code CLI Windows release observations remain "stale/mismatched (fresh_host)" for installed, updated and recoverable. They show the same three rows at HEAD `c327c50d` on main, so this change does not newly stale them.
- Native evidence specific to the companion follows in T-009. Renewing the release-matrix tuple belongs to the release qualification.

## Full Verification

`npm run verify:ci` exited 0. All 27 stages passed:

| Stage | Time |
|---|---|
| dependencies | 2.9 s |
| maintenance | 134.9 s |
| shell | 1.3 s |
| ui-dependencies | 5.9 s |
| ui-build | 1.5 s |
| generate | 3.3 s |
| build-contracts | 24.2 s |
| evals | 1.1 s |
| compatibility-freshness | 2.2 s |
| assemble | 3.6 s |
| prepare | 91.2 s |
| mcp-dependencies | 25.9 s |
| runtime | 2.9 s |
| community | 49.5 s |
| host-compatibility | 198.9 s |
| mcp-ergonomics | 8.6 s |
| built-runtime | 2.3 s |
| cli-package | 6.1 s |
| wrapper-package | 2.8 s |
| transactions | 38.0 s |
| delivery-map | 24.0 s |
| mcp-package | 40.6 s |
| archives | 53.6 s |
| cli-smoke | 6,217.0 s |
| wrapper-smoke | 23.8 s |
| pages-install | 22.5 s |
| pages | 30.3 s |

- In `cli-smoke`, the three companion suites passed: "Claude companion logic tests passed", "Claude companion adapter tests passed", "Claude companion integrity tests passed" (SCN-020).
- `cli-package` ran `package-contents-test` with the new companion assertions on the distribution build.
- The pages build rewrote the tracked `pages/.astro/content.d.ts` with a platform-dependent import path. That side effect was reverted; it is not part of this change.
- Environment: Windows, Node v22.22.3, working tree of `feat/agdf-begleiter`, which also carries the uncommitted AGDF source-revision fix.
