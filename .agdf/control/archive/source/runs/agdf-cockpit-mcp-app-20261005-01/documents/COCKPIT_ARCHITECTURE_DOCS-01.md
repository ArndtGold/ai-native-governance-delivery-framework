# Cockpit architecture documentation checkpoint

The user requested documentation of the existing Cockpit implementation under docs. docs/architecture/06-agdf-cockpit.md now explains the local read-only MCP-App, existing source owners, explicit conversation Run binding, overview/card/Run/document behavior, connected work-step/prerequisite/evidence hierarchy, Pages-owned design, responsive reading modes, refresh and single-session lifecycle, registered source and exact ContextGraph access, deliberate context/question handoff, local preparation and evidence boundaries.

Architecture README, system architecture, MCP interfaces and package structure link this implemented local development integration without replacing the existing dispatch/inspect authority or proposed roadmap. Technical preparation details and historical implementation evidence remain linked to their existing owners. Current native qualification, Claude support and full review/QA/UAT/closeout are not inferred.

Verification: 180 local file links checked across the five changed documents; new Cockpit heading links checked; all pass. Existing CLI modularization suite including architecture/source/installation boundary assertions passes. git diff --check passes. Approved UR/PRD/SD/TP and project configuration match the previous baseline exactly. Exact documentation hashes and protected hashes are in COCKPIT_ARCHITECTURE_DOCS_VERIFICATION-01.json. Runtime/UI builds were not rerun because only documentation changed; the existing referenced UI/protocol results remain dated implementation evidence.

CD+Tests remains in_progress. No source approval, QA/UAT decision, independent CR, VCS action or lifecycle completion is claimed.
