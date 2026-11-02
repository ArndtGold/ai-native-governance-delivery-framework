# Direct test correction and evidence reconciliation

Date: 2026-10-25
Owner: Codex

The human explicitly instructed: "Fix ist ohne agdf zu nutzen" after the prepared one-line unsupported-platform test correction. The agent applied exactly that correction directly, without AGDF lifecycle operations, new models or a changed approved source. The subsequent human instruction was "Evidenz aktualisieren, Reviews abschließen, dann QA", followed by "Fix it" to correct the agent's invalid control-tool invocation and continue that work.

This note attributes the narrow direct authorization; it is not a new TP, a source-revision application, a gate approval or permission for further native execution. The approved TP and its qualification freeze remain byte-for-byte historical/current approved sources. The change occurred after completion of its two-session qualification window and is disclosed as an explicit human-authorized deviation from that test freeze. It changes neither acceptance nor executable runtime, model budget, task, audit, guard or limits. The prepared TP source-revision preview was never applied and is not represented as applied now. No new Approval: TP is inferred.

Changed file: scripts/native-probes/codex-command-task-test.mjs, line 67. The negative assertion now inspects result.stderr instead of result.stdout for T7_GUARD_APPLICATION_UNAVAILABLE, retaining the nonzero-exit and exact-error checks. Replacing that one token back reconstructs the exact previously frozen test SHA-256 9bb38b89a60e696cbab733edcd3724e1f4ccd15dd8f369e90e3b1367d3ed9560.

The direct verification ran the complete existing test module on actual macOS with synthetic hosts: four groups pass, zero failures. A Node preload overriding process.platform for the actual affected test and its child entry exercises the unsupported-platform branch: one group passes. This simulation is not native Linux qualification. Both routes invoke zero real models. Original logs are retained verbatim in evidence/direct-fix-04.

Reconciliation: evidence/direct-fix-04/assessment.json verifies every one of the 19,339 previously frozen candidate paths; only this test file differs. All runtime/guard/task/audit, dependency, assembly and UI inputs match the qualified native candidate. Existing native observations remain exact evidence for that unchanged runtime, not newly executed observations for a revised test manifest. The post-fix manifest is separate; no historical manifest, trace, ledger or observation is rewritten. The complete retained/current scenario evidence and preservation results are rechecked before reviews/QA.
