# OR-lite: Record host-compatibility evidence from LF source bytes

Report mode: OR-lite
Run: `compat-evidence-lf-20261016-01`
Route: `quick_task` (Compact Delivery)
Date: 2026-10-16

## Result

Host-compatibility evidence is re-recorded from LF source bytes: all 238 snapshot hashes equal their committed LF blobs, compatibility:check passes locally with source fingerprint daf91d7f, and the CRLF working copy that broke CI's compatibility-freshness stage is normalized without a Git content change.

## Evidence

.agdf/control/artefacts/compat-evidence-lf-20261016-01/CD_TESTS.md; .agdf/control/artefacts/compat-evidence-lf-20261016-01/CODE_REVIEW.md

## Risk

CI green is confirmed only after push; the recorder still hashes working-copy bytes, so another CRLF working copy on Windows can recreate the failure until it is hardened.

## Next Step

The user commits and pushes the evidence files; then confirm the PR #16 CI run. Harden the recorder against CRLF working copies in a separate run. No VCS action taken.
