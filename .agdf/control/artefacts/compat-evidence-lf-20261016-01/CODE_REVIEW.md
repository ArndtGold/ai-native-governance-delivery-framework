# Code Review: Record host-compatibility evidence from LF source bytes

Gate: CR
Type: Code Review
Status: done
Decision: pass
Reviewer: Claude Code (claude-opus-5-5)
Date: 2026-10-16

## Scope

Re-recorded host-compatibility evidence (`docs/compatibility/evidence/snapshot.json`,
`docs/compatibility/evidence/facts.json`, `docs/compatibility/HOST_COMPATIBILITY.md`, new observation
`evals/host-compatibility/observations/3470094043a7ab93062c71001236bf770579f78271c54fb9a454b3dce4cf55bc.json`) and
the LF normalization of the working copy of `packages/cli/lib/installers/packaged-app-marketplace.js`.

## Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|

No findings.

## Checks

- Root cause addressed: the only snapshot entry that differed from its committed LF blob now matches
  (`c0d138a0`); all 238 entries equal their `HEAD` blobs, so CI's LF checkout yields the same fingerprints.
- No content change to Git-tracked source: the normalized file has the identical blob id as the index entry and
  shows no diff; only evidence files change.
- Payloads: rebuilt with `build:prepare` before recording, matching CI's stage order (generate before
  `compatibility-freshness`); no CR bytes in either generated profile.
- Evidence integrity: produced by the existing recorder, `compatibility:check` and `test:host-compatibility`
  pass; older observations remain untouched as append-only history.
- Scope: recorder and checker unchanged; the hardening against CRLF working copies is left to a follow-up.

## Decision

- decision: pass
- evidence: `.agdf/control/artefacts/compat-evidence-lf-20261016-01/CD_TESTS.md`
- required_next_step: OR-lite closeout.
