# AGDF Source-of-Truth Registry

## Primary Sources of Truth

| Domain | SoT Document | Status | Owner | Last Verified |
|---|---|---|---|---|
| Runtime contracts | plugin/meta/agdf-runtime-contract.md | active | AGDF | 2026-07-08 |
| CLI control checks | create-agdf/bin/create-agdf.js | active | AGDF | 2026-07-08 |
| Control templates | plugin/control/templates/ | active | AGDF | 2026-07-08 |
| Skill routing | plugin/meta/agdf-plugin.definition.json | active | AGDF | 2026-07-08 |

## Secondary References

| Reference | Purpose | Limit |
|---|---|---|
| README.md; INSTALL.md; create-agdf/README.md | User-facing explanation | Must follow runtime and CLI source files |

## Conflict Rule

When a secondary document, generated output, old snapshot or chat summary conflicts with the primary SoT, the primary SoT wins until a new approved artefact changes it.
