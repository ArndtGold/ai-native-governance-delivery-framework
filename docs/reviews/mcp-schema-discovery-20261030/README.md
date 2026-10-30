# MCP schema discovery repair: local evidence, 2026-10-30

Codex hid dispatch inputs and rendered known writable inputs as `unknown`. The existing
Core contracts now derive a readable input view while preserving SDK validation.
Inspect supplies a valid pre-Run help example; writable tool groups have distinct purposes.

Scope: `run-dbfc21ef-cc29-4f65-8c20-135c2ec13b4e`, completed as Compact Delivery after
UR approval, Brownfield Review, implementation evidence and Code Review. The same AI agent
implemented and reviewed the diff; human approval covered the UR, not an independent code audit.
Private Run control, user replies and temporary profiles are intentionally not published here.

## Evidence

| Check | Observed result | Source |
|---|---|---|
| Before/after SDK acceptance | 301,097 cases; zero differences | [Parity summary](schema-parity.json) |
| Actual offline Codex input rendering | 28 `unknown` occurrences before; zero after; all expected fields visible for nine tools | [Rendering summary](renderer-comparison.json) |
| Dispatch, record and revise rendering | Before/after primary signature excerpts | [Dispatch before](before/agdf_dispatch.ts), [after](after/agdf_dispatch.ts); [record before](before/agdf_record.ts), [after](after/agdf_record.ts); [revise before](before/agdf_revise.ts), [after](after/agdf_revise.ts) |
| Core command regressions | 2,248 SDK/expanded-owner cases, including missing, wrong-type and foreign-kind fields | `node packages/core/test/run-command-contract-test.js` |
| Dispatch/Inspect contracts | Passed, including the executable help example and target pair | `node packages/cli/scripts/skill-dispatch-function-contract-test.js` |
| Inspect read-only/control parity | Passed | `node packages/cli/scripts/control-inspect-test.js` |
| Shared decision facade | Passed | `node packages/core/test/decision-action-test.js` |
| MCP semantic contract | Passed | `node packages/mcp-server/test/contract.test.js` |
| Legacy and modern STDIO | Passed for protocols 2025-11-25 and 2026-07-28 | `node packages/mcp-server/test/protocol.test.js` |
| Command confinement, recording, replay/status | Passed for both STDIO eras | `node packages/mcp-server/test/run-command.test.js` |
| Failure and uncertain-effect behavior | Passed; later purpose-wording edit does not change these paths | `node packages/mcp-server/test/tool-errors.test.js` |
| Generated distributions | Passed; three surfaces and fourteen late-gate scenarios | `node packages/cli/scripts/build-contract-test.js` |
| Payload review | Passed | `node packages/cli/scripts/payload-budget-test.js` |
| Source-bound compatibility fixtures | 56 scenarios; zero failed; regenerated from an isolated export of the selected changes | `node scripts/host-compatibility/run.mjs record` |

The SDK matrix exhausts Inspect and Dispatch field-presence combinations, then mutates
representative command variants, nested objects, value types and cross-kind payloads.
The expanded Core owner is also the oracle for the committed command regression tests.
The JSON summary binds the three changed canonical modules by SHA-256. The full local
matrix harness, nine signature pairs and schema snapshots remain with the local Run.

The renderer used the actual local Codex app-server with a loopback response stub,
isolated temporary profiles, no account authentication and zero model invocations.
Only the three repaired signature pairs are published here; the summary covers all nine tools.
STDIO tests used owned candidate packages and synthetic targets.

## Bounds and regeneration

- Inspect definition: **4,998 / 5,000 bytes**.
- Command plus decision definitions: **24,552 / 24,576 bytes**.
- Copilot closure: **433 files / 4,591,779 bytes**, an exact measured increase of 8,033 bytes
  with zero reserve. No hard request, result, schema, Worker, UI or timing limit increased.
- Derived distributions were regenerated with `node scripts/sync-package-assets.js` and
  `node scripts/assemble-npm.mjs`; generated output is not hand-edited or tracked.
- Compatibility evidence was regenerated with `node scripts/host-compatibility/run.mjs record`
  from an isolated selected snapshot. Existing native observations retain their original
  identity and are not requalified by deterministic fixtures.
- The obsolete `agdf-cockpit-local` stanza was removed from the ignored local
  `.codex/config.toml`. That local cleanup is not a versioned repository change.

## Limits

These are local SDK, package and offline-renderer observations. They do not establish
installation or restarted-host loading, human UI acceptance, productive approvals,
cross-host qualification or a performance benchmark. SDK rejection wording may change;
the checked invariant is identical acceptance/rejection and preserved effects.
Full repository CI and full `verify:commit` were not run for this local repair. CI results
must be attributed to the actual PR head separately. No merge or release authorization
is implied; [CONTRIBUTING.md](../../../CONTRIBUTING.md) and
[GOVERNANCE.md](../../../GOVERNANCE.md) remain authoritative.
