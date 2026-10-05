# Validation: Dedicated Solution Design authoring

Run: sd-definition-separation-20261004-01
Date: 2026-10-04
Status: partial; no QA decision
Platform/runtime: macOS, Node 22.22.3
Baseline: IMPLEMENTATION_BASELINE.json; candidate is the uncommitted scoped working tree

| Check | Actual result | Evidence |
|---|---|---|
| New Core SD declared-decision readiness suite | pass: resolved/open/malformed/legacy cases | packages/core/test/sd-readiness-test.js |
| Actual generated CLI runtime in isolated SD fixtures | pass: exact source/assignment, read-only dispatch, clarification blocker, revision, recording/history, stale presentation, source protection and SD-to-TP transition | SD_AUTHORING_TEST-01.log; SD_CLI_BEHAVIOR-01.json |
| Shared dispatch function-schema/runtime checks | pass, including SD revision action validation/exclusivity | SD_FUNCTION_CONTRACT-01.log |
| Interaction presentation suite | pass, including actual SD blocker cards for every registered locale | SD_INTERACTION-01.log |
| Full build/package asset preparation | fail at unchanged Copilot payload baseline | BUILD_FAILURE-01.log |
| Instruction-footprint suite | blocked at the same Copilot payload check; no overall pass | INSTRUCTION_FAILURE-01.log |
| Existing PRD packaged regression suite | pass | PRD_REGRESSION-01.log |
| Existing intake packaged E2E | pass | INTAKE_REGRESSION-01.log |
| Protected independent CI paths | unchanged in the recorded hash comparison | IMPLEMENTATION_BASELINE.json; final comparison must be repeated after remaining work |

The successful CLI suite exercised an actual version-bound generated runtime copied into an
isolated test fixture. Build propagation stops at the later Copilot profile budget; a successful
full build/package/CI consumer matrix is not claimed. All fixture approvals are explicitly
synthetic; they are not live human authorization, independent review or native-host/model proof.

See PAYLOAD_CONSTRAINT_CONFLICT.md for the exact measured conflict. On 2026-10-05 the user
selected controlled revision preparation. PAYLOAD_REVIEW-01.json and
PAYLOAD_REVISION_PROPOSAL-01.md retain the measured review and concrete proposal. The installed
run-revise rejected the late revision; PAYLOAD_REVISION_ATTEMPT-01.json records the actual result.
The unchanged production payload validator was invoked with budget enforcement enabled and
again rejected exactly 198 files / 1,608,420 bytes. No gate or budget change has been approved.
Existing PRD/intake packaged regressions passed. Candidate-owned MCP protocol/full shared repository
verification, behavioral/derivation evidence completion and final Code/Architecture/Task Plan
reviews remain outstanding. No QA pass, fresh native-host compatibility or delivery completion.
