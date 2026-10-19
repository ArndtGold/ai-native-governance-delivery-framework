# Runtime update attempt before UAT retry

Historical blocked attempt. Superseded on 2026-10-19 by the successful regular
installation and accepted UAT command documented in
[APPROVAL_LOCALE_REPAIR.md](APPROVAL_LOCALE_REPAIR.md). The existing Desktop connection
and final native Cockpit migration remain explicitly unqualified; the successful
retry used a freshly started instance of the installed plugin.

- observed_at: 2026-10-19
- run_id: prd-preview-review-integration-20261018-01
- revision_id: 4e3d6140-b170-477e-bf9c-8627b8b34908
- outcome: blocked before activation; UAT approval not retried
- authorizes: false

## Prepared correction

The official generated plugin launcher successfully prepared an immutable, verified
0.14.5 publication in the existing plugin data root:

- publication_id: 21c68356f4b93142590114fbbd527c4d47be84db4df31433af4eaf7332c48dd5
- server_digest: bfde57aa5c351e441acae558785e0371cc5c0e5478502d5f1d681f91d97fc583
- dispatcher_digest: 8c53a9b06d021233c62c565f135fd5b4312db3fca2898abe7e3410fb0ee41b54
- sdk_digest: b863c5d6511cbdf1e29eddaf5e95e052b5f5c0d742d186f6665daaa9189994bb

The deployed candidate's run-recording.js and approval-command.js match the repaired
repository sources byte for byte. Package integrity and locked SDK verification pass.
The selector is preserved in RUNTIME_CANDIDATE.json; preparation does not mean activation.

## Actual activation results

The serving connection rejected runtime_generation.replace operation
40e02bc5-c049-4ac2-9039-9c5d59b80d26 with generation_manifest_incompatible.
Its current generation remained 1, with no replacement or Run write.
Comparison of the real old and new manifests found changed tool definitions and a
changed Decision UI resource digest. This update requires fresh host discovery;
the existing manifest compatibility guard must remain intact.

The regular local Codex installer then refused an existing
cockpit_qualification_pending marketplace transaction. Its supported publication
rollback completed, but the subsequent installer admission check found
agdf-cockpit / host_same_key_or_possible_alias. No further cutover was attempted.

To leave the installation consistent, the previously installed publication was
restored through the marketplace owner from its original cached source. Both its
normalized source identity and entire resulting plugin digest were checked before
retaining the original Cockpit qualification boundary:

- source_digest: cebb272906fd310a0d68faf8eee905c54e1d012ffc885b9aa2dbd6e81b83963d
- plugin_digest: d805a86738b8d2fd3f7031bbf30f095c3269d07aa35c49885748cd17ce557bbd

No native Cockpit qualification was invented, no provider registration was removed,
and no active process was killed. The old immutable serving runtime remains active.

## UAT and next step

The original approval operation cb439773-af6b-4602-9020-be27381b3f44 has no stored
receipt. Its original presentation bc4f4624-3d44-4e02-bce5-79b4f8c39023 and revision
remain unchanged. No successful UAT approval is claimed.

First complete the supported Cockpit transition using actual native provider/UI
evidence, then install the corrected publication and refresh the host connection.
Verify its active runtime identity before retrying the original exact UAT operation.
Preserve its UUID, presentation and payload; prepare a new presentation only if its
approval basis actually changes. Accepted UAT must be followed immediately by the
same-Run gate-check continuation.

This report supplements UAT_APPROVAL_BLOCKER.md. It does not revise approved QA,
approve UAT, close the Run, or authorize VCS or release actions.
