# CI repair — 2026-10-02

Same approved physical-package scope; source baseline 89e87cbf0d294d8e7b17ab959ceea7ca0f9d6415.

## Causes and repair

- CI Node22 community fixture and metadata used root assets/examples although canonical files are now in docs/assets and docs/examples. Corrected existing references; no asset copies or bypass.
- Node24 and Windows npm smoke both referenced the deleted repository-control-startup-test.js. Restored the historical bounded startup, consent, target and read-only coverage from eb95b13 and adapted CLI/Core/generated paths. Added a release-workflow contract for npm Node entrypoint existence; an actual missing-file negative fixture rejects before smoke execution.
- Restored the seven navigation-only docs/agenten-handbuch compatibility redirects required by the existing SoT and public contract. Canonical handbook semantics remain under docs/handbook.
- Rebound English handbook index source_revision to final German bytes after existing paired link changes; no translation prose or human review status changed.
- Fixed the final routing test repository root to ../.. relative to packages/cli; it now loads the actual plugins/agdf definition, and fresh-source regression covers this stage.
- Fixed two landing-page logo URLs to /assets/logo.png, the existing Astro public asset. Repository docs/assets is not the website public URL. All Pages checks pass.

## Verification and limits

15 command groups recorded with actual exit codes; all current affected checks pass. The full npm run failed at its terminal routing stage, after all preceding stages including the direct CLI suite passed; that isolated routing path was corrected and the affected npm stage rerun successfully; logs and exact source hashes are in evidence/ci-repair-20261002/RESULTS.json. The complete npm smoke command was invoked from the fresh CLI source fixture: prerequisite npm scripts, MCP tests, installer/lifecycle fixtures, package tests and the direct CLI suite passed. Its final routing stage failed on packages/plugins and was repaired to the actual repository root; npm test:routing and the expanded fresh-source check then passed. The complete unchanged prefix was not redundantly rerun after this test-only path correction; no final complete-command exit-zero claim is made. Root build/release preparation, the expanded fresh-source test, community baseline plus 29 negatives, maintenance, 56 compatibility cases, integrity, CLI wrapper and Pages passed.

Earlier FINAL_REGRESSION_MATRIX.json ran 82 individual Node files, including scripts/smoke-test.js, but did not invoke the complete npm smoke chain. That earlier evidence did not cover the missing manifest entrypoint; the full npm prefix plus corrected terminal-stage evidence replaces that inference. Historical logs remain unchanged.

Dependency files were copied from the installed locked workspace into the fresh fixture; this is not a fresh registry installation. No repaired GitHub/Linux/Windows/Node24 run, installation into real user hosts, commit, push or publication is claimed. Existing five staged duplicate entries are unchanged during this repair (index digest 6512013e213aa0a979e7223882631b6a9774d4c6eeb47cc97d2a35dc3b789f92); this does not satisfy the older original-migration index proof obligation. TPR-E001 and TPR-E002 remain open; overall QA remains revise.

## Review findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CI-001 | implementation_gap | CD+Tests | resolved | Canonical doc paths, metadata and community-test/community-check logs | Retain canonical documentation path checks. |
| CI-002 | implementation_gap | CD+Tests | resolved | Restored startup suite, npm entrypoint contract, negative fixture, full-smoke log | Retain the startup suite and early npm entrypoint check. |
| CI-003 | implementation_gap | CD+Tests | resolved | Navigation-only redirects, source hash, green community checks | Preserve canonical handbook and navigation-only compatibility paths. |
| CI-005 | implementation_gap | CD+Tests | resolved | Corrected routing root, routing.log and fresh-source check | Retain the routing check in the fresh-source suite. |
| CI-004 | implementation_gap | CD+Tests | resolved | Existing Pages public logo and green Pages log | Preserve the actual public logo URL. |

- memory_target: scope_artifact
- memory_reason: CI failure, exact repair diff and verification are run-specific evidence. Existing SoT already declares canonical handbook and compatibility navigation owners.
- context_graph_impact: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- required_next_step: Reconcile TPR-E001/E002 against original evidence or an explicit authoritative deviation decision; do not request QA approval from revise.

## Workflow prerequisites and Windows preload follow-up — 2026-10-02

Baseline 31602aac23850bc1421c5568faa68d8bcbb917b3 was committed and pushed at the user's explicit request. Fresh remote Guardrails Node24 passed. Ubuntu Node22 and the evidence-recording job failed because full-source fixtures copy MCP dependencies before the workflows installed them. Windows reached the process interruption suite, then its legacy preload exited before the checkpoint.

Moved the existing locked MCP installation ahead of all source fixtures in Guardrails and added the same prerequisite to evidence recording. The release-workflow contract now rejects both a missing and a late installation in each job. Documented the two dependency sets in CONTRIBUTING.md. Source-fixture dependency checks remain strict.

The Windows legacy preload now uses pathToFileURL(preload).href for --import. A raw drive-path negative probe reproduces ERR_UNSUPPORTED_ESM_URL_SCHEME (d:) locally; the complete process suite, including both real legacy interruption cases and final-checkpoint validation, passes with the file URL on macOS Node22. Actual corrected Windows execution remains unverified until the next push. Node's ESM documentation recommends pathToFileURL for path imports: https://nodejs.org/api/esm.html#file-urls.

Current workflow contract, host fixture contract, full build/release preparation, compatibility check (56/56), community check and process suite pass locally. Exact logs, source hashes, remote failures and exits are in evidence/ci-prerequisites-20261002/RESULTS.json. An initial compatibility recording attempted before complete release preparation failed; the attempt and diagnostic are preserved in the same evidence folder. The already committed compatibility snapshot matches after canonical preparation, so no snapshot/facts/observation publication was replaced.

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| CI-006 | implementation_gap | CD+Tests | resolved | Workflow ordering diff; contract missing/late negative cases; fixture.log | Preserve locked MCP install before source fixtures in both jobs. |
| CI-007 | implementation_gap | CD+Tests | resolved | file URL preload; process.log; windows-path-probe.log | Run the corrected Windows job on the next push. |

The five unrelated staged duplicate entries remain byte-identical. TPR-E001/E002 remain open; QA remains revise. This source push grants no QA/UAT/release approval. Earlier no-commit/no-push statements describe the evidence at their original recording time.
