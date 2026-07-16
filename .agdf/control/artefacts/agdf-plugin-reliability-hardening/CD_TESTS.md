# CD+Tests: Dual-Layout Runtime-Integrity Validation

Status: done
Date: 2026-07-16
Owner: agent
Approved TP: `.agdf/control/artefacts/agdf-plugin-reliability-hardening/TP.md`

## Delivered

- AIRH-01: deterministic `source` / `installed` layout resolver with normalized explicit override
- AIRH-02: plugin-owned common paths and conditional repository-only paths
- AIRH-03: stable `AGDF_RUNTIME_INTEGRITY_LAYOUT_INVALID` failure before directory traversal
- AIRH-04: temporary staged-plugin regression covering default and override modes, missing contract
  and partial layout
- AIRH-05: focused layout test wired into the aggregate `create-agdf` smoke chain
- AIRH-06: maintainer-facing override semantics documented in `INSTALL.md`
- AIRH-07: full approved validation bundle executed

## Changed Production And Test Paths

- `plugin/scripts/check-runtime-integrity.mjs`
- `create-agdf/scripts/runtime-integrity-layout-test.js`
- `create-agdf/package.json`
- `INSTALL.md`

All other changes are this run's approved `.agdf/control/` artefacts and backlog pointer.

## Validation Evidence

| Check | Result |
|---|---|
| Source runtime integrity | pass — `mode=source`, 9 skills, 15 control files |
| Focused installed-layout test | pass |
| Existing negative runtime-integrity suite | pass |
| Aggregate `create-agdf` smoke | pass, including focused layout test |
| `@agdf/cli` smoke | pass |
| `create-agdf` package dry-run | pass, 139 entries |
| `@agdf/cli` package dry-run | pass, 4 entries |
| JavaScript syntax checks | pass |
| `git diff --check` | pass |

## Implementation Note

The first focused run caught and corrected a relative-URL mistake in the draft implementation:
`../..` from the script file resolves above the plugin root, while `..` resolves the actual plugin
root. The permanent installed-layout regression now protects this exact boundary.

## Deviations

None. No workflow-file change was needed because both guardrail and publish validation already run
the aggregate `create-agdf` smoke chain.

## Next Step

Run TP Review, Clean Implementation Review and mandatory Code Review before QA.
