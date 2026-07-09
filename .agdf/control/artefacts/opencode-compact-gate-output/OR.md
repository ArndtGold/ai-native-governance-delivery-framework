# OR: OpenCode Compact Gate Output

Status: completed
Gate: OR
Date: 2026-07-09
Owner: agent

## Result

AGDF now provides compact interactive gate/status output for OpenCode and other terminal sessions while preserving full `gate-check --json` evidence output.

## Delivered

- Added `gate-check --status-card` as compact output derived from the existing `status_card` projection.
- Preserved existing `gate-check --json` behavior for automation and audit evidence.
- Updated OpenCode hook guidance to prefer `--status-card` interactively and reserve `--json` for proof.
- Updated generated OpenCode instructions and README guidance.
- Updated user-facing docs for the compact interactive command.
- Added smoke coverage that verifies compact output does not print full JSON report keys.

## Evidence

| Evidence | Source | Covers | Strength |
|---|---|---|---|
| Direct CLI probe | `node create-agdf/bin/create-agdf.js gate-check --status-card` | Compact output shape and current gate projection | direct runtime output |
| Smoke test | `npm --prefix create-agdf run smoke-test` | compact output, generated assets, routing | direct automated test |
| Runtime integrity | `node plugin/scripts/check-runtime-integrity.mjs` | runtime skill/control consistency | direct automated test |
| Wrapper smoke | `npm --prefix agdf run smoke-test` | `@agdf/cli` wrapper remains usable | direct automated test |

## Verification

| Check | Result |
|---|---|
| `node create-agdf/bin/create-agdf.js gate-check --status-card` | passed |
| `npm --prefix create-agdf run smoke-test` | passed |
| `node plugin/scripts/check-runtime-integrity.mjs` | passed |
| `npm --prefix agdf run smoke-test` | passed |

## Limitations

- Full `--json` output remains intentionally verbose for machine-readable evidence.
- OpenCode can still display raw shell output if agents choose `--json`; guidance now directs them to summarize or use `--status-card` interactively.

## Next Step

Offer commit handoff; do not commit, push, publish or open a PR automatically.

## Quality Outlook

Keep compact output derived from `status_card` so it remains a projection, not a second gate model.
