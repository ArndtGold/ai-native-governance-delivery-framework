# UX Intent Definition: Cross-Host MCP Integration

Status: ready  
Revision: 1  
Date: 2026-09-06  
UR: `.agdf/control/artefacts/agdf-cross-host-mcp-integration/UR.md` Revision 1  
Brownfield Review: `.agdf/control/artefacts/agdf-cross-host-mcp-integration/BROWNFIELD_REVIEW.md`

- decision: `ready`
- blocking_reason: `none`
- primary_user_intent: Enable the same local AGDF MCP capability for one selected coding-agent host,
  understand its real effective state and scope, use it in a fresh session, and remove it cleanly.
- success_signal: One explicit lifecycle action reports the selected host, scope, exact server
  identity, native configuration source, support and discovery state plus one next action; a fresh
  host session discovers the canonical `agdf_dispatch` tool, and disable restores the prior state.
- primary_decision_or_action: Inspect status, then explicitly enable or disable AGDF MCP for one
  named host and scope.
- working_modes: `unavailable_or_unsupported`; `compatible_not_configured`;
  `configured_pending_restart_or_trust`; `configured_unverified`; `discovered_ready`;
  `degraded_or_foreign`; `disabled`
- effective_state_by_mode: Host/version capability and organization policy determine availability;
  native configuration and AGDF ownership/provenance determine configured state; a fresh loaded host
  observation determines discovery and readiness; removal verification determines disabled state.
- visible_state_types: selected host and version; requested and effective scope; capability state;
  configuration source and precedence; exact executable, server version and digest; registration
  ownership; permission or trust effect; restart requirement; discovery evidence; diagnostic code;
  compatible path; one recovery action.
- effective_state_authority_by_mode: Each coding-agent host owns loaded configuration, trust,
  organization policy, permission and discovery. AGDF lifecycle inspection owns exact package,
  registration and rollback evidence. `.agdf/control/` alone owns governance target, run, gates and
  approvals.
- primary_state_presentation_owner_by_mode: The AGDF lifecycle result presents registration,
  provenance, compatibility and the next technical action. The host presents its native trust,
  permission and loaded-tool state. AGDF gate presentation separately presents governance state.
- activation_paths: Run the explicit AGDF MCP status command for one host and absolute repository
  target; choose project scope by default or explicitly select user scope; run enable; satisfy any
  host-native trust or policy step; restart or open a fresh session; verify tool discovery.
- blockers: Unsupported host or version; Node.js below the server minimum; absent host CLI;
  organization allowlist denial; untrusted project; foreign or ambiguous `agdf` registration;
  higher-precedence configuration; version or digest mismatch; authentication unavailable; partial
  mutation; restart pending; tool not discovered.
- recovery_paths: Return a non-mutating compatible path for unsupported prerequisites; identify the
  exact foreign or higher-precedence source; retry the same explicit action after correcting a
  transient failure; roll back every partial AGDF change; start a fresh host session; disable only
  the AGDF-owned registration; preserve all unrelated settings; never translate technical host
  permission into a gate approval.
- relevant_state_transitions: `compatible_not_configured -> configured_pending_restart_or_trust`
  after successful enable; `configured_pending_restart_or_trust -> configured_unverified` after
  native configuration is accepted; `configured_unverified -> discovered_ready` only after direct
  fresh-session evidence; any configured state may enter `degraded_or_foreign` after drift or a
  conflicting higher-precedence source; retry may restore the prior configured state; disable moves
  an AGDF-owned configured state to `disabled` and restores the previous container where safe.
- proposed_prd_acceptance_criteria: One four-host lifecycle command family; explicit separation of
  plugin installation from MCP activation; project-first scope without silent widening; stable
  common state vocabulary plus host-native facts; exact server provenance; read-only status;
  idempotent enable; exact rollback; ownership-safe disable; no permission widening; exact gate
  non-authority; separate direct-host and protocol evidence; visible retry and compatible recovery.
- open_product_questions: none. The common lifecycle is explicit and project-first; plugin install
  alone does not enable MCP or prove discovery; host-native storage, trust and permission semantics
  remain visible; support is granted independently per exact host evidence tuple.
- affected_outputs: PRD; later Solution Design and Task Plan; lifecycle CLI help and JSON/text
  results; Copilot and existing host adapter behavior; installation guidance; capability metadata;
  direct-host evidence and support documentation.
- evidence: Approved UR Revision 1; completed MCP server run; Brownfield Review; existing lifecycle
  source and tests; current official host MCP and plugin documentation; installed Codex, Claude Code
  and OpenCode CLI probes.
- missing_evidence: Direct Copilot behavior, Claude invocation, OpenCode 2.x and non-macOS host
  behavior remain later implementation and qualification obligations, not unresolved product intent.
- required_next_step: Incorporate these semantics into PRD Revision 1 without prescribing storage,
  parser, component or transaction implementation details.

