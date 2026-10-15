# Bounded validator repair: evidence and review

- result: pass
- authorization: Direct user instruction in VALIDATOR_REPAIR_AUTHORIZATION.md; scoped post-UAT repair and original Run closeout. No new formal gate approval is inferred and no approved source/receipt is replaced.

## Root cause and change

QA registration used a first-match result reader, normalized QA inspection required one lowercase dash field, and closeout counted every supported declaration separately. A valid registered report using Status: pass and Decision: pass therefore failed two later readers. One shared Core readReportDecision observer now serves QA registration, QA inspection and closeout. Consistent supported observations yield one result; passed aliases pass; lifecycle metadata is not a QA decision. Conflicting results, unknown/empty explicit Decision and a missing supported result remain unconfirmed. No technical QA decision or approval authority moved to the parser.

Changed owners: control-evaluation/report-decision.js, closeout-readiness.js, qa-follow-up.js and control-state/run-artefact-recording.js. The focused quality contract documents the same behavior. Existing approval, source-set, revision, containment, normalized-finding and closeout checks remain with their original owners.

## Verification

- 19 parser cases passed: existing field/case/dash/backtick/CRLF forms, consistent duplicates, passed alias, lifecycle metadata and contradictory/unknown/missing refusal.
- Actual Core structured_delivery and structured_slice recording/QA/UAT/closeout chains passed, including pre-approval registrar refusal and altered approved bytes refusal. Both complete with valid seals and original-UUID replay; existing interruption/recovery scenarios pass.
- QA deviation/refresh/stale/critical/malformed regression passed; CLI gate/QA follow-up regression passed; MCP safety passed; instruction-footprint passed. Standard generation/assembly and supported local Codex installation succeeded. Exact generated payload remains budgeted with zero headroom.
- Installed 0.14.5+codex.local-628d4e5b67b2 qualified through the actual installed launcher and pinned STDIO on disposable structured_delivery and structured_slice targets. Actual installed registrar rejected conflicting/unknown/missing results without mutation. Matching Status/Decision reports were registered, freshly QA/UAT-approved in synthetic fixtures, closed and replayed without changing their approved bytes.
- All 300 installed Marketplace/cache files agree byte-for-byte; changed Core files equal source. Exact new runtime identity is retained in evidence/validator-installed-identity.json and validator-installed-stdio.jsonl.
- Live UR/PRD/SD/TP/QA bytes match the pre-repair baseline in validator-protected-baseline.json. Live approved QA hash remains sha256:6764edf0478b080d2363e77386413687398c27617ba2f9977d6fde29f22f6fb4. The source closeout and QA inspection preflight against that unchanged report now have no findings.

## Actual diff review

The shared observer performs no file writes, process execution, state selection or approval. Distinct technical values cannot be hidden by a matching metadata field; unknown explicit Decision is a refusal. All original exact-material and evidence/refusal checks are retained, with direct negative regression. The helper replaces divergent readers rather than adding another authority or fallback. Code and structural review found no remaining defect in the bounded patch; existing reports are not rewritten to claim these later reviews.

## Limits and required next action

Fixture prerequisites/approvals remain synthetic; protocol/actual canonical writer outcomes are direct installed observations. No fresh native Codex/model, native Windows/Linux, independent human identity or public release claim is made. The earlier QA report's build identity remains historical and unchanged; this supplement proves the separately authorized validator delta. Record this supplement through the existing evidence owner, then let the newly installed exact closeout owner validate and complete this same Run. No VCS action is included.
