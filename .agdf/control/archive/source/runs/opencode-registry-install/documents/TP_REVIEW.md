# Task Plan Review: OpenCode Registry Installation and Runtime Integrity

Status: pass
Based on: `.agdf/control/artefacts/opencode-registry-install/TP.md`, `.agdf/control/artefacts/opencode-registry-install/CD_TESTS.md`
Date: 2026-07-13

## TP Coverage

| task_id | status | evidence | missing_evidence | QA impact |
|---|---|---|---|---|
| ORI-01 | fully_done | `installOpenCodeGlobalPlugin()` constructs `create-agdf@<expected-version>`, uses `--save-exact`, runs npm with `cwd: configDir`, and has no production local-source branch. Fake and real npm probes pass. Confidence: high. | none; the approved `--prefix` detail was replaced by the stronger evidenced `cwd` refinement recorded in CD+Tests. | none |
| ORI-02 | fully_done | The existing subprocess/PATH seam hosts a bounded fake npm executable that records arguments and creates only package/lock/config-local package state; production has no test-source override. Confidence: high. | none | none |
| ORI-03 | fully_done | Clean install, legacy `file:` migration, unrelated dependency/config preservation and package loadability pass. The permanent fixture deletes the legacy `.npm/_npx` source after migration and proves `opencode-status` remains loadable/current; isolated real npm migration also passes. Confidence: high. | none | none |
| ORI-04 | fully_done | Parser tests retain all four internal rows. CLI fixtures prove Brownfield Analysis can be `not_applicable` while mandatory CD+Tests/CR cannot use `not_applicable` to advance on an approved-TP path. Confidence: high. | none | none |
| ORI-05 | fully_done | Canonical, legacy and dual-heading precedence parser tests pass; source and generated RUN_STATE templates match and emit the canonical heading. Confidence: high. | none | none |
| ORI-06 | fully_done | Parser tests cover QA `pass`, `passed` and `approved`; transition fixtures also prove missing QA remains unsatisfied, while QA artefact status remains `pass | passed`. Confidence: high. | none | none |
| ORI-07 | fully_done | Eleven CLI-path cases prove all output fields across Brownfield Analysis, CD+Tests, CR, QA, UAT and OR, including rejected mandatory-step `not_applicable` and premature QA/UAT evidence that must remain behind earlier prerequisites. Confidence: high. | none | none |
| ORI-08 | fully_done | Runtime Contract and RUN_STATE source templates are aligned; generated copies compare byte-identical after sync; runtime integrity passes. Confidence: high. | none | none |
| ORI-09 | fully_done | Targeted dead helpers and orphaned progress order have no remaining definitions/call sites; installed global guidance asserts `agdf-global-*` and rejects obsolete global namespace wording. Confidence: high. | none | none |
| ORI-10 | fully_done | Final package smoke aggregate, focused control-state tests, Delivery Path Search tests, routing render, runtime integrity, release bootstrap, doctor and diff checks pass after the final installer refinement. Confidence: high. | none | none |

## Acceptance-Criteria Coverage

- exact registry dependency and migration: `done`
- unrelated OpenCode state preservation: `done`
- config-local loadability and permanent explicit source-removal sequence: `done`
- all internal artefact rows retained and step-specific `not_applicable` policy: `done`
- canonical/legacy Mode/Slice behavior: `done`
- QA approval/report vocabulary separation: `done`
- complete late-gate states and output-field assertions: `done`
- dead-code cleanup and global namespace protection: `done`
- aggregate regression and generated integrity: `done`

## Summary

- fully_done: 10 (`ORI-01` through `ORI-10`)
- partially_done: 0
- not_done: 0
- out_of_scope_changes: none. Removing `effectiveCurrentGate`, `normalizeCurrentGate` and `gateProgressOrder` is part of ORI-07 because retaining them would continue to let persisted later gates override missing prerequisite evidence. Adding the RUN_STATE artefact table is part of ORI-04/ORI-08.
- deviations: The SD's `--prefix <configDir>` detail changed to `cwd: configDir` after a real npm probe demonstrated that `--prefix` itself creates path-bound lock metadata. The change improves the approved portability outcome and is visibly documented in CD+Tests; no renewed product approval is required.
- risks: No TP coverage gap remains. The real global OpenCode installation is still intentionally reserved for UAT or separate explicit instruction; local and isolated real-registry evidence is complete for QA.
- context_graph_impact: `link_only`; no new node or required action.
- required_next_step: Run Clean Implementation Review, then mandatory Code Review before QA.
