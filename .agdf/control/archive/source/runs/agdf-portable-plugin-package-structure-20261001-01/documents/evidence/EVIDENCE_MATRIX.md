# Evidence lanes

| Lane | Scope | Result |
|---|---|---|
| Source | canonical plugins/agdf; pinned schemas; approved TP | source integrity/schema/path tests pass |
| Actual npm archives | exact SHA-256 and unpacked roots in PACKED_OUTPUTS.json | names/exports/resources pass; create-agdf contains 15 preexisting duplicate paths, Copilot payload fails |
| Isolated clean archives/install fixtures | excludes exact preexisting duplicate paths; darwin/x64/Node22.22.3 | package and deterministic adapter tests pass; no transfer to dirty actual package |
| Fresh native hosts | prerequisites in NATIVE_PREREQUISITES.json | unverified; no invocation or active install |

Performance aggregate initially failed under load; targeted retry passed cold p95 636.675ms / warm 414.192ms with original 1500/500ms limits. Other initial failures were repaired (fixture prerequisites, moved paths, strict manifest fields and current derived documentation), then affected tests rerun. TEST_EXECUTIONS.json retains original failed exits. One unresolved gap: full actual generation/prepack/Copilot payload; clean fixture is not a replacement. Native unavailability is an explicit evidence limit permitted by TP SCN-017.
