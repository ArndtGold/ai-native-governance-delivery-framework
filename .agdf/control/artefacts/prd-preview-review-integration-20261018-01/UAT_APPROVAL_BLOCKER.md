# UAT approval blocker: prepared locale is lost before approval readiness

Historical failed attempt. Superseded on 2026-10-19 by
[APPROVAL_LOCALE_REPAIR.md](APPROVAL_LOCALE_REPAIR.md) and the actual accepted original
UAT operation in [RUNTIME_UAT_RETRY.json](RUNTIME_UAT_RETRY.json). The original
diagnosis below is preserved; it no longer describes current UAT status.

- decision: block
- run_id: prd-preview-review-integration-20261018-01
- source_revision: 4e3d6140-b170-477e-bf9c-8627b8b34908
- reviewed_at: 2026-10-19
- reviewer: Codex, diagnosis of actual rejected UAT command
- required_next_step: Repair and verify the approval owner's locale handling through the permitted correction path, reassess affected QA, then present a fresh eligible UAT if its basis changes.

## Actual result

The user deliberately replied Approval: UAT to English presentation
bc4f4624-3d44-4e02-bce5-79b4f8c39023. The exact typed approval operation
cb439773-af6b-4602-9020-be27381b3f44 returned rejected/gate_not_ready,
receipt null and no approval effect. Revision remains
4e3d6140-b170-477e-bf9c-8627b8b34908 (22). UAT is not approved and OR is not permitted.

The returned outer current view is open/UAT, while family_result.current is blocked by
AGDF_DECISION_CONTENT_INCOMPLETE. Earlier exact English preparation passed; the same sources fail
German UAT content observation solely because the approved UR's localized goal uses older H3
summary sections. The user expressly requested English instead, and that language was supplied
to both preparation and the actual approval tool. Sources and the Run were not changed.

## Root cause and proposed correction

packages/core/lib/control-state/run-recording.js prepareGateApproval invokes
evaluateGateCheck(root, {runId}) before validateRunPresentation inspects the immutable record's
own language. The early check therefore uses repository-default German and rejects a valid
English presentation. The following comment about not revalidating an unrelated default locale
does not change the actual earlier call.

The shared approval owner must first safely inspect the exact immutable presentation binding and
use its recorded presentation language for readiness and matching current-state observations.
Do not trust a caller locale to change an already bound presentation, change the repository language,
weaken content checks, patch protected UR/QA bytes or manufacture an approval receipt.

A regression should exercise a real prepared English UAT over a German-default Run with this
protected legacy localized-goal shape. It should prove identical text/native-facade policy, successful
exact matching approval, and unchanged rejection behavior for foreign/stale/changed presentations.
The change must be tested, reviewed and assessed against the current QA basis before a fresh UAT.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| UAT-001 | implementation_gap | CD+Tests | open | Actual rejected approval with presentation_language en; English preparation and source readiness pass; early default-locale call in prepareGateApproval | Correct the existing approval owner's exact-presentation locale propagation and run actual regression evidence before QA reassessment |

This is a post-QA discovered blocker, not a rewritten prior QA report or a fabricated UAT rejection
by the human. No source revision, installation update, code fix, UAT receipt, OR, commit, push or
release has been performed. The original deliberate reply cannot be rebound to changed material.

- memory_target: scope_artifact
- memory_reason: Preserve the exact failed operation and bounded source diagnosis with this Run.
- context_graph_impact: none
- context_graph_reconciliation: not_applicable

