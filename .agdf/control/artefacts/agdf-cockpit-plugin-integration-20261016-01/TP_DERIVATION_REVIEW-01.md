# TP derivation review

Reviewer: Codex
Date: 2026-10-16
Status: Cooperative author review; not independent QA or gate approval.

The approved PRD remains product authority and the exact approved SD remains design authority. Both source hashes were checked unchanged. The plan follows the installed canonical TP template, criteria-chain-v1 and tp-decisions-v1.

Nine tasks extend existing Core/CLI/MCP/build/UI/lifecycle owners without a parallel installer or state source. Twenty-six unique scenarios cover every criterion/decision pair in the SD plus same-key native cutover, native reader routing and package faults. Each scenario names its task, observable result, concrete execution route, environment, prerequisites/permissions, named owner, planned evidence path and unavailable action. Referenced existing Node test entrypoints were checked to exist; no implementation tests were run for this authoring operation.

The single SD later_tp decision Executable scenario inventory and native observation sequence is resolved once. Existing generated-assets prerequisites precede package/protocol checks; focused tests precede the final required repository lane; native observations follow the exact final installed tuple. Automated/browser/CLI evidence is not substituted for Codex MCP-App rendering. Same-key qualification remains native, isolated and before legacy retirement, with final normal-context observation and guarded installation/config rollback.

Native UI access/isolation/lifecycle context is explicitly a per-scenario execution prerequisite with an unavailable action, as required by the approved SD. The plan does not assert that the context is currently available, invent a supported profile, or authorize another host mechanism. Its absence blocks the scenario and completion without disabling the old route. A discovered material contradiction must return to the existing earliest source owner rather than silently rewrite the plan or source.

Public release, VCS, new features/hosts and foreign cleanup stay excluded. Read-only/session/approval boundaries and all seven SD decisions are preserved. QA/UAT/OR remain later canonical steps. Prior presentation, mapping and recording files are retained.
