# QA continuation evidence

Run: core-mcp-flow-coherence-20261010-01
Consumed revision: 2b1b6d04-eceb-4a7e-bc56-e92344b934ae
Date: 2026-10-11
Evidence only; no CD+Tests, formal review, QA/UAT approval or closeout fulfillment.

The actual native English SD view expired after its unchanged 30-minute idle deadline. Snapshot and the originally bound document both returned session_expired after 07:36 UTC. The same native probe log contains zero model close requests and zero decision actions for this view; Run bytes are unchanged. NATIVE_IDLE_EXPIRY_01.json binds the exact candidate, sessions, input/results and before/after hashes. Native action-after-expiry was not independently observed; its rejection is separately tested at the existing Core owner. Immediate Codex host teardown still aborts MCP delivery and remains an upstream issue with an approved expiry fallback.

Additional verification passed: both STDIO eras for early UR-at-SD preview/explicit apply/replay/history; all 38 early-UR v2 atomic transaction process checkpoints plus legacy recovery; actual renewed live approval/binding/archive proof without mutation; CLI gate/Inspect compatibility and both registered-language completion/recovery rendering; generated Copilot/payload checks; rebuilt UI/package and actual STDIO resource regression. The real German dispatcher presentation failure is fixed through the existing locale registry. Exact commands, source/build identities, initial failures and fresh passing logs remain in COMMANDS.json and the linked per-check metadata.

TP_REVIEW_PREPARATION_01.md, CLEAN_REVIEW_PREPARATION_01.md and CODE_REVIEW_PREPARATION_01.md assess actual progress, ownership, diff and concrete gaps. They are preparation evidence, not canonically registered review fulfillment. The Core recording predicate requires fulfilled CD+Tests before formal TP/Clean/CR registration. A pass cannot be manufactured to unlock that ordering.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| QAC-NATIVE-01 | evidence_gap | evidence_obligation | open | QA_INDEX SCN-039/040/042; NATIVE_OBSERVATION.md | Collect required actual human all-gate/locale document, action, keyboard, width and scroll observations on the exact final loaded candidate. |
| QAC-PERMISSION-01 | evidence_gap | evidence_obligation | open | QA_INDEX SCN-041 | Observe supported native technical consent deny/retry/remembered behavior without using consent as a gate decision; unsupported mediation stays unqualified. |
| QAC-BENEFIT-01 | evidence_gap | evidence_obligation | open | QA_INDEX SCN-044; BEFORE_STATE_CORPUS.json | Complete the fixed before/after workflow corpus and comparable counters; do not claim weaker-model improvement without actual model comparison. |
| QAC-CANDIDATE-01 | evidence_gap | evidence_obligation | open | CANDIDATE_IDENTITY_COMPLETION_COPY_01.json; QA_CONTINUATION_SOURCE_DELTA_01.json | Bind final native observations to the new dispatcher build. Old loaded view establishes only its exact scoped expiry behavior. |
| QAC-REVIEW-01 | evidence_gap | evidence_obligation | open | QA_INDEX SCN-045; review preparation reports; internalStepEligibility | Complete outstanding implementation evidence and scenario/diff mapping, then record genuinely fulfilled CD+Tests and refreshed reviews in canonical order before qa-gate. |

No approved UR/PRD/SD/TP, protected foreign control or Git index changed in these checks. Production runtime remains unchanged. The new generated candidate is prepared locally, not installed. QA remains open.
