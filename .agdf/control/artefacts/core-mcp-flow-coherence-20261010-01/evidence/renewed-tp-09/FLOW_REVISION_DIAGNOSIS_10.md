# Revision routing repair and renewed UI intent

Run: core-mcp-flow-coherence-20261010-01
Date: 2026-10-11
Authorizes: false
QA decision: open

## Cause and bounded repair

The caller selected unapproved-draft authoring revision for an already approved UR. The correct existing path is source_revision.preview followed by separately confirmed source_revision.apply. Core skill-dispatch compounded that caller error by returning ordinary status presentation after declining the authoring action. That hid the rejected intent and caused an unrelated approval card.

The scoped repair uses the existing source-status and localized input-recovery owners. It emits a terminal draft_revision_route_unavailable diagnostic, no ordinary presentation/continuation/authority, and the existing agdf_revise/source_revision.preview descriptor for an approved source. No new operation, approval policy, locale key, source write or generic bypass was added. Existing TP-09 T-003/T-006/T-008 governed this repair before the later approved-source reopening.

## Verification and limits

- dispatch-revision-50.log: passed source dispatch suite, including en/de × approved UR/PRD/SD and unchanged input state.
- dispatch-contract-50.log: preserved failed obsolete five-operation assertion; the actual supported read-only interface has ten existing operations. Corrected assertion passes in dispatch-contract-52.log.
- dispatch-generate-50.log and dispatch-generate-51.log: preserved payload guard failures. DISPATCH_PAYLOAD_REVIEW_50.json records the exact reviewed +1039 bytes of service growth. The runtime manifest changed digest at the same byte length; file count remains 232. No speculative headroom or schema budget increase.
- dispatch-prepare-52.log: full current generated/package preparation passed. Public plugin digest: 6fa864c73cfb82dbe14ac3888fee88665cbedaa90f18aeeef961fe1ea14c0508.
- dispatch-packaged-52.log: preserved stale expectation of an earlier validator wording. Corrected exact-field assertion and actual generated CLI declined-revision coverage pass in dispatch-packaged-53.log, including full authoring/clarification/revision/binding/presentation/approval boundary suite.
- Passing source and generated-package checks do not qualify the selected installed runtime or new native UI. No productive install, configuration change, VCS action or QA decision was performed for this repair.

## Approved-source revision and clarification

The first source_revision.apply was rejected by automatic approval review for lack of explicit confirmation of the concrete previewed invalidation. APPROVAL_ONLY_REVISION_BLOCK_10.json preserves that event. The user subsequently confirmed "Ja, Revision anwenden". Retrying the same exact operation/proposal/preview was accepted: operation 10d50a97-8a43-4695-8ced-3be9e1ccc132, previous revision 9063bc02-1fa7-4d00-95e2-b3dc05e0d44f, resulting revision b3e05cba-5328-47ad-a057-bae5af7123fc. UR/PRD/SD/TP and affected decisions/bindings are archived; Brownfield/UX require reassessment. Code, tests and history remain.

The sealed proposal is immutable. The user's later clarification narrows the UI, retaining Core approve/request-change/reject capabilities. UI primary action is eligible approval or an already Core-permitted next step; discussion and desired edits happen in Chat. Chat introduces click/exact-text alternatives only when the approval card is actually displayed on the current user surface. Otherwise a complete Chat card and exact material remain usable, including iPad. Both routes reference one eligible version/presentation and one approval effect. Nothing in the clarification grants a gate or continuation authority.

The renewed UR preserves all sixteen integrated acceptance signals and adds this clarification to Scope 7 and AC-010/012. It passed actual installed authoring readiness and was registered by step.record operation 02b235b5-9c66-4f88-8360-dec645fec423 at revision e78c09ea-2186-42f8-9341-c36d177e6841 (44). Its source digest is sha256:da633c3cf6b7faf6b044a5c64e8f4b130c5849c60011fad41bc49d381c656196. New deliberate UR approval remains required; downstream sources were not rewritten or reapproved.

## Additional contract candidates

The renewed draft initially failed readiness with only Scope reported. Replacing the schematic angle-bracket gate placeholder with the resolved current-gate formula description made the unchanged intent ready; no parser inspection was used. This is a candidate for field/form-specific authoring diagnostics, not a new tool or automatic fix. A direct inspect contract request was rejected by the currently callable schema; the bound UR dispatcher already supplies the exact authoring contract. Preserve that supplied-contract route and verify schema/documentation parity under the renewed plan rather than inventing another access path.
