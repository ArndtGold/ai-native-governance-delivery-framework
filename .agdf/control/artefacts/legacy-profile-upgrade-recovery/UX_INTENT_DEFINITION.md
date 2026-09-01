# UX Intent Definition: Safe Legacy Profile Upgrade Recovery

Status: ready
Date: 2026-09-01
Derived from: approved `UR.md` and completed `BROWNFIELD_REVIEW.md`

- decision: `ready`
- blocking_reason: none
- primary_user_intent: Upgrade a known AGDF installation through the supported public command without
  expert filesystem surgery, while retaining confidence that unknown or tampered state will not be
  accepted or deleted.
- success_signal: The installer either completes a verified canonical installation and gives one
  truthful activation handoff, or stops with a specific safe recovery action. Completion visibly
  distinguishes installed files, restarted application state and a fresh session that has loaded the
  current skill registry.
- primary_decision_or_action: Run the normal host-specific AGDF install/update command; after verified
  installation, fully restart the host application and start a fresh session before treating AGDF
  skills or loaded-runtime behavior as current.
- working_modes:
  - current healthy AGDF installation
  - explicitly supported historical AGDF installation eligible for canonical rebuild
  - unsupported, malformed, unowned or tampered installation
  - canonical marketplace installed while host cache installation is pending or retrying
  - installation verified while application restart is pending
  - application restarted while a restored session still has a stale skill registry
  - fresh session with current loaded AGDF skills
- effective_state_by_mode:
  - current healthy: current ownership, contract, provenance and digests match
  - supported historical: exact historical contract plus complete ownership, provenance and integrity
    evidence match the supported compatibility policy
  - invalid or unknown: migration authority is absent and no destructive recovery is allowed
  - cache recovery pending: canonical shared marketplace is staged or installed, but Claude's final
    cache transition has not completed
  - restart pending: host installation is verified, but the running application may still hold old
    runtime or skill state
  - fresh-session pending: the application was restarted, but a restored conversation/session is not
    evidence that the new skill registry was loaded
  - active current: a newly started post-restart session exposes the expected current AGDF skills and
    runtime evidence
- visible_state_types:
  - current and verified
  - supported historical upgrade detected
  - rebuilding canonical installation
  - recoverable Windows cache contention and bounded retry
  - unsupported or unsafe installation blocked
  - installation rollback completed
  - installation complete, app restart required
  - app restarted, fresh session required
  - fresh session current
- effective_state_authority_by_mode:
  - marketplace eligibility: AGDF ownership, explicit historical compatibility contract, provenance
    and digest evidence
  - host cache result: host command result plus exact installed-version read-back
  - application reload: completed process/application restart, not installer success
  - loaded skills/runtime: direct evidence from a newly started post-restart session
- primary_state_presentation_owner_by_mode:
  - install, upgrade, blocked and rollback states: public AGDF lifecycle result
  - Claude cache retry: the same lifecycle operation's progress/failure result
  - restart pending and fresh-session pending: lifecycle next action
  - loaded current state: the fresh session's host plugin/skill view and AGDF runtime orientation
- activation_paths:
  - current installation: verified install/update -> full application restart -> new session -> loaded
    state verification
  - supported historical installation: eligibility verified -> canonical transactional rebuild ->
    host install/cache completion -> full application restart -> new session -> loaded verification
  - restored session after restart: explicitly start a new session; do not interpret restoration as
    registry refresh
- blockers:
  - unsupported historical contract: stop and identify the unsupported version/contract without
    deleting state
  - missing or conflicting ownership/provenance/digest evidence: stop as unsafe and preserve state
  - rollback failure: report the exact retained/recovery state and forbid a success claim
  - non-`EPERM`, ambiguous path or non-temporary Claude cache failure: do not clean; report the host
    failure and safe retry/support action
  - exhausted bounded cache retry: preserve unrelated cache content and report the exact remaining
    blocker
  - stale restored session: state that application restart alone did not refresh this session's skill
    registry and direct the user to start a fresh session
- recovery_paths:
  - recoverable historical state: use the same supported installer; it rebuilds from current canonical
    assets and retains automatic rollback
  - exact transient Claude temp contention: show bounded retry; if it still fails, retain unrelated
    cache state and provide one explicit retry/support action
  - unsafe marketplace state: make no destructive change and request inspection or support
  - installation complete: fully restart the host application, then start a new session rather than
    reopening/restoring the old one
  - loaded state still stale in a fresh session: report degraded evidence and rerun status/support
    guidance; do not claim activation
- relevant_state_transitions:
  - supported historical -> eligibility verified -> canonical stage -> atomic replacement -> host
    install -> restart pending -> fresh-session pending -> active current
  - supported historical -> stage/host failure -> exact marketplace rollback -> historical state
    restored
  - canonical marketplace ready -> Claude temp rename `EPERM` -> exact bounded cleanup/retry -> host
    installed or explicit blocked state
  - unsafe historical -> blocked with no mutation
  - installed current -> application restarted -> restored stale session -> new session -> current
    skill registry
- proposed_prd_acceptance_criteria:
  1. Only explicitly supported historical contracts with complete ownership, provenance and integrity
     evidence enter migration.
  2. Unsupported, malformed, future, unowned or tampered state is preserved and blocked visibly.
  3. The replacement contains only current canonical content and every pre-commit failure restores the
     exact prior owned installation.
  4. Claude cache recovery reacts only to the exact recoverable Windows temp-rename failure, touches
     only the exact installer-owned temporary entry and uses bounded retries.
  5. The terminal result distinguishes `installation verified`, `application restart required`,
     `fresh session required` and `loaded current`.
  6. Guidance explicitly says that restoring the previous session can retain a stale skill registry
     and does not satisfy fresh-session evidence.
  7. Each blocking state presents one safe next action without suggesting broad cache deletion.
  8. Repository tests and installer read-back never claim restarted-host or fresh-session success.
- open_product_questions: none; the approved UR fixes the compatibility and recovery intent. Exact
  version-policy storage, cache ownership proof and transaction mechanics belong to PRD/SD.
- affected_outputs: global install/update lifecycle cards and JSON next action, migration/recovery
  failures, progress feedback, restart handoff and fresh-session verification guidance
- evidence: approved UR; completed Brownfield Review; direct public `0.14.3` upgrade attempt against a
  valid owned `0.13.8` marketplace; direct native-Windows Claude `temp_local_*` `EPERM`; successful
  exact-entry cleanup and retry; existing lifecycle output and tests that currently say only
  `Restart`; Copilot output that already separates restart and fresh-session verification
- missing_evidence: final wording usability and direct fresh-session behavior remain PRD criteria and
  later UAT evidence; they do not block PRD drafting
- required_next_step: Incorporate these observable states, transitions and acceptance criteria into
  the Structured Delivery PRD. This analysis does not authorize implementation.
