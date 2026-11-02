# UX Intent Definition: approve, discuss and revise the appropriate source

- run_id: core-mcp-flow-coherence-20261010-01
- source_ur: UR.md
- source_ur_digest: sha256:1fd8023903193ec530433a5f9b0878e7dbf633c2a62b20552f370c0572f02313
- source_revision_id: 59f81d3d-0cf3-4e41-99c7-dbd5582f5e13
- decision: ready
- blocking_reason: none; approved intent and routed Brownfield/high UX impact are explicit
- primary_user_intent: Understand what is being proposed, inspect the exact material, discuss or change it, and deliberately approve the eligible version once through the visible native card or Chat; continue or revise the existing Run without losing valid earlier work.
- success_signal: The user can identify document, relevant changes, unresolved points and consequence without technical discovery; the same eligible version has one confirmed approval effect; new requirements return to the earliest affected source with visible proportional impact.
- primary_decision_or_action: Localized approval at a human decision boundary; otherwise the Core-permitted next step. Ordinary discussion remains in Chat. Core request-change/reject capabilities and historical results remain valid but are not primary card actions.
- working_modes: discussion; native document review/approval; complete Chat/remote review/approval; requirement-impact review; permitted continuation; confirmed result or uncertain recovery; generation/session inspection

## Effective State And Presentation By Mode

| mode | effective_state_by_mode | effective_state_authority_by_mode | primary_state_presentation_owner_by_mode | visible_state_types |
|---|---|---|---|---|
| discussion | Proposed change is unrecorded; current eligible material remains distinct. Actual source change invalidates its prior eligibility. | Human intent plus existing source/presentation validity; discussion alone is no formal decision | Chat explains proposal and existing current state | discussing; change proposed; fresh material required |
| native review/approval | Current exact readable material and eligible presentation; one deliberate approval action | Existing canonical eligibility and approval result | Actually displayed native card, briefly introduced in Chat; exact material remains accessible in Chat | ready; sending; saved; superseded; expired; uncertain |
| complete Chat/remote review/approval | Same exact material, presentation and human decision; no assumed remote native display | Same canonical eligibility/approval result | Full Chat decision card with complete summary, consequence and exact current formula; document content readable in Chat when native/local links are unusable | ready; waiting for deliberate reply; saved; renewed material required; uncertain |
| requirement-impact review | Concrete changed statement and earliest affected UR/PRD/SD/TP; checked unaffected and affected dependencies distinguished | Human clarified need and current canonical revision eligibility/preview | Chat explains selected source, reason, retained decisions and necessary renewed work; any supporting view describes the same impact | proposal; preview; application pending; applied; unsupported; stale |
| permitted continuation | Work already permitted by current Core state, with no outstanding approval substituted | Current canonical next operation | Contextual next-step action and concise Chat outcome | available; running; complete; blocked |
| confirmed result/uncertain recovery | Receipt/current state establishes saved effect or unresolved acknowledgement | Existing result/status/recovery | Same origin view plus concise Chat result; history clearly separate from current state | saved; already saved; not submitted; outcome unknown; recovery available |
| generation/session inspection | Owned active views and uncertain work remain protected; capacity/qualification/closed state are explicit | Actual connection/session/runtime observation | Supporting inspection view and actionable Chat explanation | usable; qualifying; active protected; draining; close unconfirmed; capacity protected; host unavailable |

These are user-observable semantics, not a new technical ownership model or a second product source. Material product criteria become authoritative only in the approved PRD; component/storage/protocol decisions belong to SD.

## Activation Paths

- A genuinely displayed native approval card is announced once with its document and the alternatives: click its approval action or type the exact current gate formula in Chat. Mere declared MCP capability or a Mac card does not establish what the iPad user sees.
- Without confirmed display on the current surface, show the complete Chat decision card. Include purpose/changes/open issues/consequence and current formula. Offer complete exact document reading through Chat; a local file path alone is not an adequate remote reading route.
- Reading documents/sources and returning retains the decision context. Inspecting history does not reactivate stale approval controls.
- A later deliberate exact formula remains available after discussion while the same presentation/version remains eligible. Changed material requires a fresh summary/material/presentation and new response.
- A requirement proposal first clarifies changed intent and statements. Explain earliest affected source, then actual dependency impact and required confirmation for an approved-source revision. Unapproved draft refinement retains its existing authoring path.
- Already permitted continuation is explicit and contextual. It never grants an outstanding human decision, arbitrary execution or publication authority.

## Blockers And Recovery

- Missing/expired/superseded material: explain why this version cannot be approved and obtain the fresh current presentation. Do not show unexplained disabled buttons or ask for a duplicate decision on unchanged material.
- Unsupported source/phase revision: name the necessary missing capability and existing owner; keep current approved work/history. No arbitrary UR restart, substitute Run, manual control edit or unrelated approval card.
- Ambiguous affected source: explain the actual conflicting statements and clarify the need before application. Do not force a current-gate default or infer semantic approval.
- Lost acknowledgement, concurrent text/click or repeated activation: show pending/unknown truthfully and resolve the existing operation/result before another submission. The user sees one saved approval effect or a concrete recovery condition.
- Technical tool permission is separate from business approval; its denial is not a recorded rejection or success. The actual host may show no permission prompt. Do not promise independent human proof from a model-callable flag.
- Native capability unavailable: complete Chat remains usable. Core eligibility and exact material do not change because a card is absent.
- Capacity/qualification/teardown failure: protect active or uncertain work, explain the permissible next action and external host dependency. View disappearance alone is not confirmed session/worker termination.

## Relevant State Transitions

- current readable material -> deliberate human approval -> confirmed saved result -> existing next permitted step
- discussing -> actual material change -> prior presentation superseded -> fresh current decision material -> new deliberate response
- proposed requirement -> earliest-source assessment -> dependency impact preview -> separately confirmed applicable revision -> selected source draft -> renewed affected decisions/checks
- implementation defect under unchanged intent/design -> valid TP correction -> relevant tests/review; no automatic earlier-source revision
- active view/in-flight decision -> protected original owner until confirmed completion/expiry; qualified new generation handles only allowed new work
- uncertain acknowledgement -> existing receipt/current-state resolution; never silently resubmit or report failure as proof no effect occurred

## Proposed PRD Acceptance Criteria

1. Every decision surface shows the same plain-language purpose, relevant changes/open points, exact document and effect. IDs, hashes and protocol details are secondary inspectable evidence, not the primary task description.
2. Eligible native cards expose one primary approval action; already permitted continuation uses its own contextual next step. Core change/reject capabilities remain supported without three primary card choices.
3. Actually displayed native approval has one short Chat introduction plus equal exact-text route; absent/unconfirmed UI has one complete Chat card, with no invisible-button instruction or duplicated approval request.
4. Remote/iPad user can read complete exact material in Chat and approve the same eligible version once. A local link, desktop declaration or model paraphrase alone does not fulfill this reading requirement.
5. Document/source inspection, keyboard/layout/scrolling/return and supported view lifecycle preserve context; Enter during discussion/comment composition does not approve. Native action and later exact-text approval are deliberately tested, including concurrent duplicate attempts.
6. Changed requirements select earliest actual source, explain why and preserve verified unaffected decisions; affected quality evidence is renewed. Pure implementation defects remain distinguishable.
7. Busy/expired/stale/unsupported/unknown/capacity/host states explain the permissible next action without invented authority. Confirmed receipt governs success; unconfirmed native behavior stays unqualified.
8. Every registered presentation language and native/complete-Chat/remote path is qualified at the actual changed candidate; source or synthetic evidence cannot replace required user/host proof.

## Open Questions, Evidence And Next Step

- open_product_questions: No material ambiguity in the approved user intent prevents PRD drafting. PRD must specify the pre-UAT supported source/phase matrix and truthful support/qualification boundary; SD owns technical eligibility/impact and compatibility details, TP the evidence scenarios.
- affected_outputs: Native approval/large document view; complete Chat/iPad decision card and reading; current status/quality/history; revision impact; generation/session recovery; existing Core/CLI/MCP result meanings
- evidence: Approved UR AC-010..017; freshly registered BROWNFIELD_REVIEW.md; UR_APPROVAL_RESULT_12.json; actual corrected continuation; existing presentation/approval/session/revision/generation owners and historical candidate-bound tests
- missing_evidence: New primary-action UI implementation, full pre-UAT return paths and fresh actual native/iPad/end-to-end qualification. Analytical ready is not product approval, implementation or QA success.
- required_next_step: Record this renewed analytical result through the existing internal-step writer; derive current PRD criteria from approved UR and this input, then present the new exact PRD once.
