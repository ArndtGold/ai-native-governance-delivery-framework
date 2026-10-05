# Exact Copilot payload baseline proposal

Status: proposed; requires explicit maintainer decision. This is not a gate approval, successful build, CR or QA result.
Run: late-source-revision-20261005-01.
Candidate: sha256:bcca212369bbef0c172a4f22350440a829b3afd5b15089f12f6e40a0ea570754; see CANDIDATE.json for the complete capability delta against T-000, with original SD and CI dependencies distinct.
Measured inventory SHA-256: 4f9aa101f611fcbc0625b06d85652783a5fce1aef2380eb7d144997513bdde93.
Current numeric-baseline SHA-256: 752edce90e0b3a22bd662709ae411f2e3a54b7214389e6a81ff222e1cff26a55.

| Inventory | Files | Bytes |
|---|---:|---:|
| Current approved numeric budget | 193 | 1,581,171 |
| Pre-existing SD-authoring candidate | 198 | 1,608,420 |
| Current measured complete payload | 200 | 1,682,900 |
| This capability and bounded qualification fixes added to SD candidate | 2 | 74,480 |
| Total additional payload relative to current budget | 7 | 101,729 |

Proposed exact values for plugins/agdf/meta/copilot-payload-baseline.json:
- max_files: 200
- max_bytes: 1682900
- reserve_files: 0 (no baseline schema addition)
- reserve_bytes: 0 (no baseline schema addition)

PACKAGE_REVIEW.json identifies every generated file, its canonical owner/generation origin, digest and baseline/SD/current byte contribution. The two added Copilot files are internal Core lifecycle/history modules. Existing outer/runtime mirrors serve the same generated consumers and keep generator ownership. There is no added workflow store, approval owner, MCP write tool or third-party runtime dependency. Help and notation fixes complete inherited SD qualification without weakening instruction or interface validation.

The actual unchanged all-surface builder rejects this inventory with AGDF_COPILOT_PAYLOAD_GROWTH. The normal isolated shared plan stops at prepare/npm run build; later package/archive/consumer/smoke stages are not green. A bounded Codex assembly allows actual behavior and runtime checks while retaining this failure. Its success cannot waive the Copilot guard.

If the maintainer explicitly approves this exact candidate and these exact totals, change only the numeric baseline and its truthful rationale, regenerate all normal projections and rerun normal guards/full verification. The inventory and input fingerprints must still match before applying the decision. No reserve or other instruction/performance limit change is proposed.

This decision does not revise or approve the original sd-definition-separation-20261004-01 UR/PRD/SD/TP, does not fulfill that run's old no-growth requirement and does not authorize installation, commit, push, PR or publication. The old run remains independently unresolved. Formal CD+Tests/CR/QA progression requires the remaining current evidence after the normal build passes.

The approved TP, T-007, requires: “Apply a package baseline change only after explicit approval of that exact candidate proposal; then rerun all normal guards. TP approval alone does not approve an unknown numeric proposal.”
