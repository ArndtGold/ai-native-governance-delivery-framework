# Native German SD decision milestone

Run: core-mcp-flow-coherence-20261010-01
Consumed implementation revision: 29bb4d4d-1f4f-4b23-bd45-f599eb9eac53
Date: 2026-10-11
Evidence progress only; no CD+Tests completion, formal CR or final QA decision.

## Actual observations and effects

The exact loaded disposable candidate is NATIVE_PROBE_CANDIDATE_NEXT_01.json:
dispatcher 49bc6520a5523c3017d4342f04cfa7f59bde3be771ea5c8b4d8c5af65e80c67c,
server 429c9f2616055440e872b9af82f1f09e6bd70c113137b0df5c2d4e17d9d22cde,
resource sha256:9daa4741ab4bd0dd0bbfafe79ff3f71238258f0f6e77aa7caaf129ac479c51b3,
Codex 0.162.0-alpha.17.2. This is the separately authorized experimental disposable
probe; neither production qualification nor the rebuilt Inspect candidate is inferred.

| Test Run | Deliberate human observation | Original action UUID | Confirmed canonical effect |
|---|---|---|---|
| native-de-approve | Space approval; stable focus/content; Enter in comment did not approve; no technical prompt reported | 4f96a457-c87c-4877-a355-d5220b26cbea | Exactly one SD approval receipt; valid seal; next gate TP |
| native-de-request-change | Tab/Enter submission; saved status; no technical prompt reported | b0284baa-acd7-4463-a839-b3c650e06809 | Exactly one request_change receipt with requested comment; zero SD/TP approvals; SD revision owner sd-definition |
| native-de-reject | Document opened/read/returned; required-message on empty comment; subsequent Tab/Enter rejection; saved status; no technical prompt reported | c6db98d9-cbf3-4140-a478-4d14c00b95a8 | Blank validation previously had zero effects/unchanged revision; exactly one later reject receipt; zero SD/TP approvals; valid seal |

The quoted Approval: TP in the change comment stayed inert. Native original-UUID
operation-status, actual client exchanges, canonical parsers and native DOM saved/
disabled controls corroborate the effects. No agent decision click was performed.
Human reports plus cooperative receipts do not establish cryptographic gesture identity.

## Bounded gaps and next checks

The user explicitly did not read the document in the change case. Blank validation
was not established there; it was then explicitly tested on the fresh reject card.
Reading before approve, sources/narrow-wide/scroll details for the complete required
matrix, both-view closure, actual technical denial/retry, remaining English and
UR/PRD/TP/QA/UAT cases, final-candidate loading and fixed workflow benefit counters
remain open. No visible technical prompt is not denial/remembered permission proof.

A fresh English approve card 068ced77-d25a-42c9-86f9-d036ee1f4efe was prepared
through the existing native Inspect/prepare route. It has no observed human decision
at this report snapshot. Native host immediate teardown remains the separately
retained upstream abort; previously observed real idle expiry is separate evidence.

Formal CD/review/QA ordering remains unchanged. Existing review preparations are
not registered pass reports. This record adds evidence only to the existing Run.

## Frozen evidence references at recording

Future human closure/permission observations must use separate follow-up evidence;
they are not silently added to these already hashed snapshots.

| Evidence snapshot | SHA-256 |
|---|---|
| NATIVE_NEXT_DE_APPROVE_01.json | sha256:6a1bf44c47da7102e0b1cb09fbfdd53ce079da6ef04188085c6817b6795e434a |
| NATIVE_NEXT_DE_CHANGE_01.json | sha256:77352f63fed7e5f146501ecdd04040a2301f795876a9d994e5fc96a1aa56de60 |
| NATIVE_NEXT_DE_CHANGE_HUMAN_FOLLOWUP_01.json | sha256:eee9f0c31793ffd7fd12e168bdcaae772df3ccae0cc8fd8aad98cba482ccf42c |
| NATIVE_NEXT_DE_REJECT_VALIDATION_01.json | sha256:67369ba7ac24387fa6db64c70e8deac3da007363e93d5d92addf4b864493d64f |
| NATIVE_NEXT_DE_REJECT_01.json | sha256:157d52a31c8ca8c5ed98f6af2c6177e32fc4c52124264e88b23ab6c9c9a06195 |
