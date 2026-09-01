# UAT Report: Release-Owned Historical Profile Compatibility

Status: pending
Decision: deferred
Revision: 2
Date: 2026-09-01
Run: `legacy-profile-upgrade-recovery`
Based on: approved QA Revision 2

## Repository Outcome

The exact release-owned compatibility catalogue, migration authority, canonical rebuild, rollback and
release-continuity implementation has passed QA. No repository blocker remains.

## Required Direct Evidence

- Exercise a supported historical root on native Windows through an explicitly authorized disposable or
  owned install boundary and verify canonical current installation plus exact historical evidence.
- Verify Claude rollback behavior if installed-version read-back is absent or mismatched.
- Fully restart each exercised host application and start a genuinely fresh session.
- Observe the current loaded AGDF skill registry from that fresh session; restored-session evidence
  remains stale-session evidence only.

## Current Evidence Gap

Earlier Copilot and Claude `0.14.3` installations predate the final catalogue implementation and cannot
prove this revision. Repository and temporary-root tests cannot substitute for direct host/fresh-session
evidence.

## User Decision

UAT was deliberately deferred on 2026-09-01. No host boundary was authorized and no installation,
registration, cache, restart or fresh-session action was performed.

## Authority Boundary

No real installation, marketplace registration, cache cleanup, application restart, commit, push,
publication or release is authorized by QA approval. Direct UAT execution requires a separate deliberate
instruction defining the allowed host boundary.

## Next Step

Resume only after a deliberate bounded native-Windows host authorization. Do not provide
`Approval: UAT` until the required direct evidence is captured and this report is revised to pass.
