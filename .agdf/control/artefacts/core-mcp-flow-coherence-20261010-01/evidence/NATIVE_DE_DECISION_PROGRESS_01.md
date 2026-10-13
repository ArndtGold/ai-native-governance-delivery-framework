# German native SD decision observations

Run: core-mcp-flow-coherence-20261010-01
Current implementation revision: 29bb4d4d-1f4f-4b23-bd45-f599eb9eac53
Date: 2026-10-11
Evidence progress only; no formal CD+Tests, CR or QA fulfillment.

## Confirmed observations

The actual loaded disposable candidate is NATIVE_PROBE_CANDIDATE_NEXT_01.json,
dispatcher 49bc6520a5523c3017d4342f04cfa7f59bde3be771ea5c8b4d8c5af65e80c67c,
decision resource sha256:9daa4741ab4bd0dd0bbfafe79ff3f71238258f0f6e77aa7caaf129ac479c51b3,
host Codex 0.162.0-alpha.17.2. It precedes the Inspect diagnostic correction;
source/generated diagnostic verification is separately bound in
INSPECT_MODULE_FIX_VERIFICATION_01.json. No final-candidate qualification transfer.

German approve: native-de-approve, presentation 939d83bc-7643-48c2-8aee-678ae5b8c570,
operation 4f96a457-c87c-4877-a355-d5220b26cbea. User reported Space approval and no
technical prompt; the subsequent answer "Beides bestätigt" explicitly confirms
stable content/focus and that Enter in the comment did not approve. Native DOM
showed saved status and disabled decisions. Original-operation status and canonical
Core validation corroborate one SD approval receipt, valid seals and next gate TP.
See NATIVE_NEXT_DE_APPROVE_01.json. Closure was not confirmed by that reply.

German change: native-de-request-change, presentation 702f4e89-3342-4e8d-80c5-a98c54b8b645,
operation b0284baa-acd7-4463-a839-b3c650e06809. User reported "Entscheidung gespeichert.";
native DOM showed this status and disabled decisions/comment. Native action carried
the requested full comment, including the quoted Approval: TP. Original-operation
status and canonical parsers corroborate exactly one request_change receipt,
zero SD or TP approval receipts, valid seals, current gate SD and next owner
sd-definition. No agent decision click was performed. See NATIVE_NEXT_DE_CHANGE_01.json.
The follow-up NATIVE_NEXT_DE_CHANGE_HUMAN_FOLLOWUP_01.json confirms Tab/Enter
submission and no technical prompt. The user explicitly did not read the document
and did not see the blank-comment validation message; an attempted blank submission
is not established. These missing observations are retained, rather than promoted
to a pass or misclassified as a reproduced validation defect.

## Remaining observations and review boundary

Document reading/return and blank-comment validation remain unqualified for the
change case; closure of both views is unconfirmed. Sidebar inventory showed only the change
card; this does not prove inline closure of the previous card or Core teardown.
The fresh German reject card, presentation 45de96c2-128c-4a28-b547-83c7e7f40524,
has been prepared through the actual native Inspect/prepare route. Its requested
sequence explicitly includes reading/return and a blank change attempt before
deliberate rejection. NATIVE_NEXT_DE_REJECT_PREPARE_01.json is preparation only.

The subsequent human reply confirms document opening, reading/return and the exact
required-comment message on this fresh German reject card. Independent native
original-presentation status and canonical parsers retain the original revision,
zero decision receipts, zero SD/TP approval receipts and valid seals after the blank
attempt. Thus reading and validation saved no business decision. See
NATIVE_NEXT_DE_REJECT_VALIDATION_01.json. Deliberate rejection and closure remain
pending; no outcome is inferred from this successful validation step.

German rejection and the remaining required gate/locale/surface cases, actual
permission deny/retry behavior, final-candidate loading and the fixed before/after
workflow corpus remain open. Earlier real idle expiry evidence remains separate
from the upstream Codex immediate teardown abort. Source tests, receipts and human
reports do not establish cryptographic independent gesture identity.

Formal review ordering still requires completed CD+Tests before CR/QA. Existing
review preparations and the bounded Inspect diff assessment are retained as
preparations; no pass was manufactured to unlock them. QA_INDEX.json remains
partial with quality_readiness_decision null and native_qualified false.

Approved source bytes, 5807 protected control files, foreign backlog content and
Git index are unchanged at PROTECTED_CHECKPOINT_INSPECT_MODULE_FINAL_01.json.
