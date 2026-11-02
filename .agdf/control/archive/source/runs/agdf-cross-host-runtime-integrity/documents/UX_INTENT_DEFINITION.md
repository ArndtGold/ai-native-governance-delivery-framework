# UX Intent Definition: Cross-Host Plugin Runtime Integrity

Status: ready  
Date: 2026-08-25  
Derived from: approved `UR.md` and completed `BROWNFIELD_REVIEW.md`

- decision: ready
- blocking_reason: none
- primary_user_intent: Trust that the AGDF plugin currently guiding work is either paired with its
  matching machine validator or clearly identified as a portable profile without local machine
  validation.
- success_signal: The user can see one coherent effective state for the active host, including
  intended plugin identity, observed loaded version, machine-validation availability and one safe
  next action when they disagree.
- primary_decision_or_action: Use the active AGDF workflow when integrity is healthy; otherwise run
  the named normal install/update recovery or continue only through the explicitly permitted
  agent-native boundary.
- working_modes:
  - runtime-bearing installed Codex plugin
  - runtime-bearing installed Claude Code plugin
  - config-local OpenCode runtime
  - portable public Skills-only or instruction-only profile
  - source-development checkout before installation
- effective_state_by_mode:
  - Codex: effective loaded plugin/cache identity plus matching validator version and digest
  - Claude Code: effective installed plugin root plus matching validator version and digest
  - OpenCode: effective config-local package and validator version
  - portable profile: packaged skills/resources with machine validation unavailable or externally required
  - source checkout: canonical editable sources only, not a runtime-bearing installed state
- visible_state_types:
  - healthy matching runtime
  - portable agent-native profile
  - not installed
  - stale or mismatched version
  - runtime missing or corrupt
  - source projection shadowing a complete installation
  - host state unavailable or unverified
- effective_state_authority_by_mode:
  - runtime-bearing modes: observed host-loaded installation plus exact-version runtime probe
  - portable modes: declared distribution profile and packaged-resource evidence
  - source-development mode: repository source and generated-build evidence, without installed-host claims
- primary_state_presentation_owner_by_mode:
  - Codex and Claude Code: lifecycle/status result and fresh-session AGDF orientation
  - OpenCode: existing native plugin status surface
  - portable profile: gate-check agent-native status with explicit machine-validation boundary
  - source checkout: build/install command result, never the source marketplace alone
- activation_paths:
  - explicit supported install or update followed by required host restart or fresh session
  - repository activation only after the intended plugin surface is loaded and durable AGDF control exists
  - portable profile activation through installed skills without claiming a local validator
- blockers:
  - marketplace identity collision: show the conflicting identities and refuse silent replacement
  - source shadowing: name the effective source projection and the complete installed alternative
  - version or digest mismatch: reject machine evidence and show the expected and observed values
  - host does not expose loaded provenance: classify it as unverified rather than healthy
  - missing local validator on a portable profile: continue only where agent-native inspection is permitted
- recovery_paths:
  - use the existing surface-specific AGDF install/update command; do not patch caches
  - restart or open a fresh host session and repeat the effective-state check
  - on an unowned marketplace conflict, stop and request an explicit user decision
  - on a recoverable host read failure, provide a visible retry
  - preserve agent-native read-only or gated work only when the declared profile permits it
- relevant_state_transitions:
  - source checkout -> generated complete bundle -> registered marketplace -> installed cache/root -> fresh loaded session
  - healthy installed -> updated bundle -> restart required -> freshly verified healthy
  - healthy installed -> source-shadowed/mismatch -> machine evidence rejected -> installer recovery -> fresh verification
  - portable profile -> agent-native active with machine validation unavailable
  - unverified host -> retry/read-back -> healthy, degraded or blocked
- proposed_prd_acceptance_criteria:
  1. Runtime-bearing profiles never accept a runtime-free source projection as healthy installed AGDF.
  2. The visible status distinguishes intended installation from effective loaded state.
  3. Matching version and digest are required before validator output counts as machine evidence.
  4. Portable profiles state the absence of local machine validation without presenting it as failure
     when agent-native operation is the declared contract.
  5. Every blocking state provides one safe recovery action and never proposes direct cache editing.
  6. A successful install that still requires restart is not presented as an already refreshed session.
  7. Codex, Claude Code and OpenCode preserve shared governance meaning while using native host path
     and lifecycle evidence.
  8. Repository, bundle, installed-host and fresh-session evidence remain separately labeled.
- open_product_questions: none; repository marketplace removal versus restriction is a technical
  ownership and compatibility decision for SD, not a change to user intent.
- affected_outputs: installation/update result, plugin status, session-start orientation,
  machine-validation availability and recovery guidance.
- evidence: approved UR; Brownfield Review; observed Codex cache/marketplace divergence; existing
  installer and runtime contracts; official Codex and Claude Code plugin documentation inspected
  2026-08-25.
- missing_evidence: direct post-change fresh-session observations remain later UAT evidence and do
  not block PRD drafting.
- required_next_step: Incorporate these observable behaviors into the bounded PRD. This analysis does
  not authorize implementation.
