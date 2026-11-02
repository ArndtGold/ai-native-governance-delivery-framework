# Approval locale repair and actual installed-runtime retry

Date: 2026-10-19
Run: prd-preview-review-integration-20261018-01
Outcome: original UAT approval accepted at revision 23

The shared approval owner now validates the exact immutable presentation record
before choosing the readiness language. Both the actual approval and the returned
observation use that stored language. A caller cannot replace it with another
locale. Existing source, freshness, gate, reply and final transaction checks remain.

The user authorized this direct repair and the subsequent installation/retry.
Approved UR/PRD/SD/TP/QA bytes are unchanged. Their earlier reports remain historical
source-bound assessments; this supplement does not retrospectively add the later
repair to an already approved QA report.

## Retained verification

Logs and their checksums are in evidence/approval-locale-repair/.

| Observation | Actual result | Evidence |
|---|---|---|
| Previously failing locale regression | red before repair, green after repair | before.log; after.log |
| Full existing command flow and preview regressions | 18 programs pass, no failures/skips; four preview programs pass | core.log |
| Actual isolated production tarball | 1344 files; repaired owners byte-identical; text and native action facade regression passes | package.log |
| Dependency guard | strict 142-module check passes | boundaries-final.log |
| Deterministic compatibility | 56 scenarios pass; current evidence recheck passes | compatibility-record.log; compatibility-check.log |
| Generated bundle, package and payload | pass; 394 files / 3406895 bytes, exact measured ceiling | generate-final.log; assemble.log; budget-final.json; budget-test.log |

The regression executes actual English UAT over German defaults with protected
sources, invalid selectors/replies, once-only acceptance and replay. Synthetic native
action facade results remain distinct from native UI qualification.

## Installation correction

The previous update attempt only rolled back the marketplace publication. This left
the existing retired-Legacy configuration and native cached registration on another
version. The supported complete transition rollback restored both configuration and
publication using the original qualified-transition.json; the native plugin add then
aligned its cached registration with that restored marketplace.

The regular installer subsequently succeeded and installed
0.14.5+codex.local-ccfd429cc96e with matched provenance. No runtime or cached executable
was edited in place. The old executing generations remain preserved.

The new installation intentionally retains the Legacy Cockpit route and guarded
publication backup pending native qualification. Its installation result reports
configured_pending_restart, not completed native migration. No final native Cockpit
qualification, Desktop refresh or cleanup is asserted. These limits do not invalidate
the existing scoped UAT decision.

## Actual live command

A new process started through the installed plugin's own mcp.json STDIO launcher
served the corrected runtime. Its observed dispatcher digest was
8c53a9b06d021233c62c565f135fd5b4312db3fca2898abe7e3410fb0ee41b54, publication
21c68356f4b93142590114fbbd527c4d47be84db4df31433af4eaf7332c48dd5, version 0.14.5,
provenance matched. This proves a fresh installed command runtime, not replacement
of the older connection already held by the Desktop chat.

RUNTIME_UAT_RETRY.json retains the actual contract/status/approval exchanges and
immediate same-Run continuation. The exact original operation
cb439773-af6b-4602-9020-be27381b3f44 accepted the human's existing Approval: UAT for
presentation bc4f4624-3d44-4e02-bce5-79b4f8c39023 and revision
4e3d6140-b170-477e-bf9c-8627b8b34908. The matching persisted receipt advances to
376867b8-956f-481f-824b-ddd775462514 (23), OR, no missing approval.

The original UAT_APPROVAL_BLOCKER.md and RUNTIME_UPDATE_BLOCKER.md are retained as
historical failed attempts and are superseded by this successful command evidence.
No new human reply, presentation, QA decision, commit, push or release was fabricated.

- context_graph_impact: link_only
- context_graph_refs: .agdf/control/CONTEXT_GRAPH.md#CG-NATIVE-INTERACTION-AUTHORITY; .agdf/control/SOT_REGISTRY.md
- context_graph_reconciliation: resolved
- context_graph_required_action: none
- context_graph_gate_effect: none
- memory_target: scope_artifact
- memory_reason: Preserve this exact Run's correction and deployment evidence locally.
