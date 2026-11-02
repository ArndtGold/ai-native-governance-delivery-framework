# Local verification closeout, 2026-10-24

The importer correction passes 34/34 release-qualification tests, release-evidence-test,
syntax checks and diff checks. All ten original native records validate mechanically.
Cooperative Code Review and Clean Implementation Review pass the exact three-file correction.
This is not Windows execution, human acceptance or final-source remote CI.

## Complete canonical stages recorded as passed

dependencies, maintenance, shell, ui-dependencies, ui-build, generate, build-contracts,
evals, compatibility-freshness (after prescribed regeneration), assemble, prepare,
mcp-dependencies, runtime, community, host-compatibility, mcp-ergonomics, built-runtime,
cli-package, wrapper-package, transactions, mcp-package, archives, wrapper-smoke (after canonical
assembly restored its input), pages-install and pages.
Their original logs are verify-ci-local.log, verify-ci-resume.log,
verify-ci-after-delivery-map.log and verify-ci-remaining-independent.log.
Archive package-consumer tests passed; pages check/build/landing/public-documents passed.
The compatibility projection was regenerated through its existing owner: 56/56 expected
scenario outcomes, zero unexpected failures. Fixtures are not native qualification.

## Full verification is not green

The first complete invocation failed at compatibility-freshness (source_snapshot_changed).
The prescribed regeneration corrected that failure. The resumed canonical plan then failed
at the aggregate Delivery Map: one PRD/UR relationship conflict and two missing QA/TP links
in other Runs. Thirteen other Run objectives are incomplete. DELIVERY_MAP_SUMMARY.json
records these findings; the selected release Run's map passes without findings.
Actual foreign Run sources, relationships and decisions were not invented or modified.

The later CLI smoke attempt failed when a test fixture copied an empty, untracked Run
directory. That empty directory alone was removed after inspection. A retry then found
incomplete dist/npm/create-agdf output. Source assembly was rerun canonically; no production
check was weakened and no source-code workaround for these output problems was added.
The wrapper smoke initial failure and its successful separate retry are retained in their logs;
verify-wrapper-recovery.log is the retry that exited 0.

The supplementary CLI retry used the exact already consumer-tested package archives through
the existing supported AGDF_TEST_CANDIDATE_CLI_ROOT and AGDF_TEST_CANDIDATE_MCP_ROOT settings
for its MCP test chain only. Contract, continuation, late-source-revision, command, resource,
whole-flow, structured-flow and revision tests reported passes. The expanded source/phase
matrix was only partly executed. This broad retry was explicitly stopped; neither the whole
MCP chain nor the complete CLI smoke stage is claimed as passed. The completed earlier source
prefix and archive-mode results do not erase the default-path failures.
Archive identities are recorded at the beginning of verify-cli-archive-recovery.log.

## Evidence and execution boundaries

Original Codex protected files: 44/44 unchanged. Imported Claude files: 26/26 unchanged.
IMMUTABILITY_FINAL.json records fresh digest comparisons. No native case was repeated.
The original Codex tar remains SHA-256
2d9798679652f8bf80acd529496e4b0f09fdb35cb3b73ca1382c82f89241ea36.
No native work-tmp remains. No private login/profile file was changed.

No Windows executor is exposed; the specified Windows import remains unexecuted. No commit,
push, merge, tag or import was performed. CI 40079920556 is green for 94ef61c9 only. The local
source correction and generated projection have no new final release snapshot/remote CI.
QA must remain revise. The next executable external action is the prepared Windows return
sequence, followed by combined reviewed matrix validation and final-snapshot verification.
