# Final local verification, 2026-10-24

The complete shared repository plan passed all 27 stages in one isolated current-source
snapshot. No stage or test command was removed. The driver preserved stage failures if any;
the final result contains none. This supersedes the earlier incomplete/failed attempts as
current local verification; their original logs remain unchanged.

Snapshot: /private/tmp/agdf-final-qa-lT8dow/checkout
Base commit: 94ef61c9f0aa5a2041269236affc6556c33ed5a3
Source inventory digest: 9888565d0513806fda85ef1eb860f1c6a8e9e32800497a9229a502bd3264cfc4
Node: v22.22.3; OS: macOS 15.7.7, darwin/x64.
No new root commit, push, tag, merge or import was performed.

| Canonical stage | Result | Seconds |
|---|---|---:|
| dependencies | pass | 2.52 |
| maintenance | pass | 116.111 |
| shell | pass | 1.11 |
| ui-dependencies | pass | 3.937 |
| ui-build | pass | 1.994 |
| generate | pass | 3.463 |
| build-contracts | pass | 30.729 |
| evals | pass | 0.921 |
| compatibility-freshness | pass | 2.218 |
| assemble | pass | 0.84 |
| prepare | pass | 48.107 |
| mcp-dependencies | pass | 7.055 |
| runtime | pass | 2.597 |
| community | pass | 9.678 |
| host-compatibility | pass | 102.996 |
| mcp-ergonomics | pass | 8.204 |
| built-runtime | pass | 2.356 |
| cli-package | pass | 5.192 |
| wrapper-package | pass | 1.656 |
| transactions | pass | 30.54 |
| delivery-map | pass | 20.289 |
| mcp-package | pass | 22.32 |
| archives | pass | 35.765 |
| cli-smoke | pass | 4279.526 |
| wrapper-smoke | pass | 11.508 |
| pages-install | pass | 7.702 |
| pages | pass | 21.515 |

The complete CLI smoke chain passed, including the MCP chain that was incomplete before.
Windows-specific live shim assertions retain their normal darwin skips; this is Mac verification,
not additional Windows qualification. No native qualification scenario was repeated.

The three prior aggregate Delivery Map blockers were corrected through the existing atomic
Run/Backlog writer after actual source review. Approval seals, current gates and all listed
artefacts stayed byte-identical. The aggregate has zero block/revise findings; thirteen existing
incomplete-objective warnings remain visible. RELATIONSHIP_CORRECTIONS.json and the final map
are the specific proof. No source/approval was invented and no check was weakened.

REVIEWED_MATRIX_VALIDATION.json records a complete canonical validate --all-hosts pass for all ten
actual original records and their reviews. A temporary input tree contains only unchanged copies
of original records, referenced captures and reviews. Validation used the clean original candidate
checkout and the separate corrected evaluator. It performed no repository import or projection write.

SOURCE_APPLICABILITY.json distinguishes the three changed tooling files, the tested Git-exported
snapshot and two pre-existing ignored local configuration files. Those local files were preserved;
they were not copied or silently claimed as release input. Original candidate 8e2b8699 and its
460027fa commit retain their own native records. This new source snapshot is not a newly frozen
release candidate. The approved TP requires a new final commit/candidate and its native evidence
if the source/probe changes enter the release. The current no-commit/no-push instruction remains.

The maintainer's Windows review/import gap acceptance remains recorded. Full local verification
does not invent Windows execution, native qualification of changed source or human QA acceptance.

INDEX_OBSERVATION.md records staged evidence/observation additions found in the real index at
closeout. Their origin is not established; they are preserved without reset/unstage or commit.
The initially overstrict empty-index assertion does not change the passed source/hash checks.
