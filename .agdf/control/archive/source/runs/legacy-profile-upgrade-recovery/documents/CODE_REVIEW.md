# Code Review: Release-Owned Historical Profile Compatibility

Status: done
Decision: pass
Revision: 5
Date: 2026-09-02
Run: `legacy-profile-upgrade-recovery`

## Code Review

- decision: pass
- findings: none open in the reviewed CAT-T13 through CAT-T16 diff.
- correctness: the snapshot helper observes the source before and after copying, verifies the copied
  snapshot with the same normalized digest function and passes that exact digest into staging and
  provenance. Staging reads only snapshot bytes. Codex identity is content-bound; Copilot and Claude
  version strategies remain explicit.
- error_paths: source instability fails before marketplace recovery/staging; snapshot cleanup occurs
  before stable swap; an injected cleanup failure removes the building stage, retries exact owned
  cleanup and leaves the stable root absent. Existing transaction rollback remains unchanged.
- security_and_data_integrity: deletion targets only the exact `mkdtemp` root retained in the
  snapshot closure. Caller-supplied Codex identity is rejected on snapshot-owned preparation.
  Marketplace ownership validation and stable/backup containment remain unchanged.
- compatibility: public commands, marker/provenance schemas, marketplace layout and host lifecycle
  calls are unchanged. Existing non-snapshot direct callers retain their prior behavior; OpenCode
  remains on its package archive path.
- maintainability: orchestration loses duplicate identity logic and the new helper composes existing
  digest and transaction owners through one descriptor. No alternate source-of-truth was added.
- missing_evidence: complete aggregate and remote workflow evidence remains TPR-5-01; the first
  failing aggregate owner is unchanged runtime packaging, not one of the reviewed installer paths.
- risks: an operating-system failure that prevents two consecutive removals will fail closed and can
  leave only the exact temporary snapshot for manual cleanup; it cannot swap the stable marketplace.
- required_next_step: QA consumes Task Plan Review Revision 5, Clean Review Revision 5, this pass and
  the open evidence finding TPR-5-01.
