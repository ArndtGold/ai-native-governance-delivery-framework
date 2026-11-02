# Proposed one-line test correction; no further real models

Status: proposal only; current TP remains approved and unchanged
Run: mcp-codex-guided-inspection-20261025-01

The two fresh paired-guidance Codex sessions passed original and strict T7 acceptance, each with four MCP calls and zero SDK/other errors. Complete original Root/control/settings/staging and frozen-candidate comparisons passed. Total current-Run real sessions are four; all slots/results remain consumed and immutable.

One test-only defect remains from the guard adaptation: the unsupported-platform negative branch in scripts/native-probes/codex-command-task-test.mjs asserts that T7_GUARD_APPLICATION_UNAVAILABLE appears in result.stdout. The actual current controller throws before any account/model activity and Node writes the typed error to stderr. The model-free process.platform=linux branch simulation on darwin returned exit 1, empty stdout and the expected stderr error. This diagnoses the branch/stream; it is not native Linux qualification.

Prepared exact patch: evidence/qualification/pair-guidance-01/proposed-non-darwin-stream-fix.patch. It changes only result.stdout to result.stderr for that assertion. The nonzero exit and exact typed error remain required. The current source file is not edited. The proposed predicate matches the captured actual error.

The current TP explicitly freezes all seven product/test/guard files and excludes unplanned test edits. The proposed TP-only source revision would allow only this one-line test exception, affected model-free tests and renewed review of existing evidence applicability. It changes no product/runtime/guard/harness/task/prompt/parser/audit or acceptance/size/time/account limit. Zero additional real model sessions are requested or authorized. Preserve the current 2/2 native observations and assess their exact unchanged-runtime dependency applicability after the test-only delta; never rerun or relabel them automatically. Unexpected runtime drift remains a blocker.

After separately confirmed source-revision application, author/present the narrow renewed TP and obtain a new deliberate Approval: TP before applying the patch. Then run the affected existing model-free tests, verify the sole test delta and unchanged runtime/guard/task/audit/SDK/assembly, complete the mandatory TP/Clean/Code reviews and sole QA assessment. No Git/install/release action is included. Applying a source revision itself neither fixes the file nor grants a gate or model approval.
