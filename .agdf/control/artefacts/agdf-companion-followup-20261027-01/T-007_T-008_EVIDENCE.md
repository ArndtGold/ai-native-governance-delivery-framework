# T-007 and T-008 Evidence: Generation, Verification Lanes and Documentation

- run_id: `agdf-companion-followup-20261027-01`
- tasks: T-007, T-008 (approved TP revision 11)
- date: 2026-10-27
- environment: Windows 11, Node v22.22.3, worktree `claude/festive-mcnulty-c824c7`

## Generation and Compatibility (SCN-024)

- `npm run build:prepare`: `[verify-ci] prepare passed (76.3s)` on the final companion sources. It includes the public plugin, portable plugin and release coherence tests and the Copilot payload validation; the Copilot payload budget did not grow (no `AGDF_COPILOT_PAYLOAD_GROWTH`, `plugins/agdf/meta/copilot-payload-baseline.json` unchanged).
- `npm run compatibility:record`: `status: pass`, 56 scenarios evaluated, 0 failed, source fingerprint `f315b344af43f569ef5c24498bca6dbd432e25a7f99f76b258156417389280ee`. Regenerated: `docs/compatibility/HOST_COMPATIBILITY.md`, `docs/compatibility/evidence/facts.json`, `docs/compatibility/evidence/snapshot.json` and the new observation `evals/host-compatibility/observations/2a040bb636dc87bdb5b62b496aa933e9a5e360ff1e6cc07a53d9bfc3ec5535c1.json`.
- `npm run compatibility:check`: `status: pass`, 56 evaluated, 0 failed, same fingerprint.
- Evaluation fingerprints: unchanged; no contract, template or skill text changed.
- The generated runtime plugin `packages/cli/generated/plugins/agdf/companion/` contains `notice.mjs` with the 12 delivered files; the generated Copilot profile has no `companion/` folder.

## Verification Lanes (SCN-024)

Run locally with `CI= node scripts/ci-plan.mjs --job <id> --scope all --suite cli --published false`; every command exited 0:

| Lane | Duration | Commands | Companion-related commands |
|---|---|---|---|
| `windows-22-installation-part-2` | 336 s | 12 | `scripts/claude-companion-test.js` |
| `windows-22-installation-part-3` | 233 s | 23 | `scripts/claude-companion-adapter-test.js`, `scripts/claude-companion-integrity-test.js` |
| `windows-22-packages-part-2` | 328 s | 17 | `scripts/runtime-integrity-layout-test.js` |
| `windows-22-packages-part-4` | 352 s | 11 | `scripts/runtime-integrity-negative-test.js` (and the create-agdf smoke test) |

The full `npm run verify:ci` was not run (TP planning decision "Full verification run").

## Documentation (SCN-019, SCN-026)

`INSTALL.md`, section "Optional AGDF Companion panel":

- the brand "AGDF Companion" throughout the section;
- the gate bar per mode (table), the `CD+Tests` mark and the build state;
- switching on and off including the status line and notices, and the person's close hiding only the panel;
- notices, sound (off by default, silent on Windows according to the probe) and the status line with examples;
- five kept choices with their defaults;
- the placeholder objective and the language fallback through Claude's `language` setting;
- surfaces table with notice and status-line placement; host versions incl. the 2.1.302 test engine without `$.settings` and the 2.1.308 desktop probe;
- known limits: several sessions announcing the same change, older companion versions dropping the two new choices.

The evidence status paragraph is updated after the live test (T-009).
