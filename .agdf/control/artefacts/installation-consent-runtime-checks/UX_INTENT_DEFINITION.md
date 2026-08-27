# UX Intent Definition: Installation Consent for Automatic Runtime Checks

- decision: `ready`
- blocking_reason: `none`
- primary_user_intent: Install or update AGDF without needing technical knowledge, understand the
  narrow automatic check in a few seconds, and make a durable but reversible choice without a broad
  permission grant.
- success_signal: The user first sees a short plain-language summary with scope, timing, access,
  authority, renewal, revocation and target AGDF version; can reveal implementation details on demand;
  chooses automatic, manual or cancel with one key; and receives one compact result with verified
  version, effective state and an accurate next action.
- primary_decision_or_action: Deliberately choose whether AGDF may perform the disclosed automatic
  local checks for the selected host installation.
- working_modes:
  - interactive install or update with a deliberate consent decision;
  - automatic checks enabled and effective;
  - installed without automatic checks, using manual host confirmation when required;
  - consent renewal required after changed executable identity or permission scope;
  - unsupported or degraded host/OS combination;
  - non-interactive installation with no deliberate consent available;
  - consent revoked.
- effective_state_by_mode:
  - enabled only when deliberate consent, host-effective permission/trust and current executable
    identity all agree;
  - manual when consent is declined, absent, revoked, stale or cannot be persisted safely;
  - cancelled when the user cancels before the requested installation mutation;
  - unavailable or degraded when the host cannot express or verify the narrow permission;
  - renewal_required when hook, validator, provenance or effective permission scope changes.
- visible_state_types: decision required; enabled; manual confirmation; cancelled; unavailable;
  degraded; renewal required; revoked; failed with recovery action.
- effective_state_authority_by_mode:
  - host-native permission or hook-trust state is authoritative for technical execution;
  - version-matched AGDF provenance identifies the executable capability being considered;
  - deliberate installer input records intent but never becomes AGDF gate authority;
  - unsupported or unverified combinations remain manual rather than inferred enabled.
- primary_state_presentation_owner_by_mode:
  - the existing AGDF installer shows the beginner summary first and technical details on demand;
  - the existing lifecycle presentation shows a compact requested/resulting state and one next action;
  - the host's native UI remains primary for host-owned permission or hook trust;
  - existing AGDF status and recovery presentation shows later enabled, manual, stale, revoked or
    unavailable state without creating a second settings product.
- activation_paths:
  - interactive install or update followed by explicit enablement and successful host application;
  - existing valid consent revalidated against current executable identity during update;
  - manual state retained when the user declines or host support is insufficient.
- blockers:
  - host cannot persist or verify the narrow permission: show manual mode and the supported next
    action;
  - managed policy denies the capability: preserve the denial and show that automatic checks remain
    unavailable;
  - executable identity or scope changed: show renewal required before automatic execution;
  - configuration is unreadable, conflicting or not owned: perform no silent mutation and show the
    recovery path;
  - native-Windows support lacks direct evidence: show unverified or unsupported rather than enabled.
- recovery_paths:
  - retry after correcting a transient host or configuration failure;
  - continue in manual confirmation mode without reinstalling where safe;
  - inspect the effective state and exact capability;
  - revoke through the supported host/AGDF lifecycle path;
  - renew consent after reviewing changed capability information;
  - roll back installer-owned mutations while preserving unrelated user configuration.
- relevant_state_transitions:
  - decision_required -> enabled | manual | cancelled;
  - enabled -> renewal_required when identity or scope changes;
  - enabled -> revoked -> manual;
  - unavailable | degraded -> decision_required after capability recovery;
  - failed -> retry | manual | rolled_back;
  - non_interactive -> manual unless an explicit externally supplied, host-valid policy authorizes
    the exact capability.
- proposed_prd_acceptance_criteria:
  - disclose capability, timing, access, side effects, network behavior, persistence and revocation
    before any consent-dependent mutation;
  - present enable, continue without automatic checks and cancel as distinct outcomes without hidden
    approval or coercive default;
  - use plain-language beginner wording first, keep material consent facts visible, and place only
    implementation details behind an explicit details action;
  - show the target version before the choice and the verified installed version or transition after it;
  - label persisted intent as a previous choice rather than effective host permission, explain that
    manual mode keeps AGDF usable, and recover visibly from invalid input;
  - derive enabled state only from deliberate intent, current executable identity and host-effective
    permission/trust;
  - preserve every explicit host or managed-policy denial;
  - never map installation consent to an AGDF gate approval;
  - expose inspect, revoke, retry and renewal paths;
  - fail safely to manual mode for unsupported, stale, non-interactive or unverified cases;
  - define and verify the host/OS matrix, including direct native-Windows acceptance evidence for
    every Windows-support claim;
  - keep repository, package, installed-host and fresh-session evidence separate.
- open_product_questions:
  - exact list of automatic checks that meet the read-only and bounded-cost promise;
  - supported host/OS matrix at first delivery and the product label for partial combinations;
  - whether consent applies per host installation, per repository or another scope that remains both
    understandable and least privilege;
  - exact non-interactive opt-in mechanism, if any, that still represents deliberate external policy.
- affected_outputs: PRD acceptance criteria, host/OS capability matrix, installation journey,
  lifecycle status and recovery requirements, later SD authority and persistence design, TP/UAT
  evidence matrix.
- evidence: approved UR Revision 2; Brownfield Review; existing installer lifecycle and interaction
  owners; current session-start hook and validator provenance; current Codex, Claude Code and OpenCode
  permission/trust behavior; native-Windows installer viability evidence.
- missing_evidence: Direct enabled, declined, revoked, renewed and fresh-session observations for each
  claimed host/OS combination remain later delivery evidence and do not block PRD drafting.
- required_next_step: Verify the implemented beginner-first presentation on installed Codex, Claude
  Code and OpenCode hosts; do not infer visible host behavior from repository tests.
