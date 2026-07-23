# Verified Change: OpenCode Plugin Honesty Hardening

- status: executed
- related_ur: .agdf/control/artefacts/opencode-plugin-honesty-hardening/UR.md
- escalation_target: structured_slice
- canonical_owner: create-agdf/opencode-plugin.js
- allowed_source_paths: create-agdf/opencode-plugin.js,plugin/skills/gate-check/SKILL.md,create-agdf/scripts/opencode-hardening-test.js,create-agdf/scripts/sync-package-assets.js
- allowed_derived_paths: create-agdf/generated/.opencode/skills/agdf-gate-check/SKILL.md,create-agdf/generated/.github/skills/agdf-gate-check/SKILL.md,create-agdf/generated/plugins/agdf/skills/gate-check/SKILL.md,create-agdf/generated/AGENTS.md,create-agdf/generated/.opencode/AGDF.md
- prohibited_impacts: none
- propagation_command: node create-agdf/scripts/sync-package-assets.js
- validation_commands: node create-agdf/scripts/opencode-hardening-test.js,node agdf/bin/agdf-local.js doctor --json,node agdf/bin/agdf-local.js gate-check --run opencode-plugin-honesty-hardening --json,git diff --check
- baseline_tracked_paths: none
- baseline_untracked_paths: .agdf/control/artefacts/github-community-health-governance/BROWNFIELD_REVIEW.md,.agdf/control/artefacts/github-community-health-governance/UR.md,.agdf/control/artefacts/github-community-health-governance/UX_INTENT_DEFINITION.md,.agdf/control/artefacts/opencode-plugin-honesty-hardening/BROWNFIELD_REVIEW.md,.agdf/control/artefacts/opencode-plugin-honesty-hardening/UR.md,.agdf/control/artefacts/opencode-plugin-honesty-hardening/VERIFIED_CHANGE.md,.agdf/control/runs/github-community-health-governance/RUN_STATE.md,.agdf/control/runs/opencode-plugin-honesty-hardening/RUN_STATE.md
- baseline_commit: 7ca208896afd3466d396c2df653807008bd6b158
- execution_changed_paths: .agdf/control/MASTER_BACKLOG.md,.agdf/control/artefacts/opencode-plugin-honesty-hardening/OR.md,create-agdf/opencode-plugin.js,create-agdf/scripts/opencode-hardening-test.js,create-agdf/scripts/sync-package-assets.js,plugin/skills/gate-check/SKILL.md
- execution_scope_status: pass
- validation_status: pass
- propagation_status: pass

## Scope Summary

Three bounded honesty-hardening changes to the OpenCode plugin surface, all additive, all failure-tolerant:

1. Subagent enforcement-bypass disclosure in `plugin/skills/gate-check/SKILL.md` (propagated to generated surfaces and AGDF.md instructions).
2. `client.tui.showToast` on inactive repository in `create-agdf/opencode-plugin.js` `session.created`, in addition to existing `app.log`.
3. Version-drift check in `session.created` comparing loaded plugin `packageJson.version` to `agdf/bin/agdf-local.js` expectedVersion.

## Prohibited Impact Checklist

- Gate/approval/schema change: none
- Policy/persistence change: none
- Architecture change: none
- External API: client.tui.showToast extends existing client object usage (same as client.app.log); degrades to app.log on failure
- CLI flag/output-schema change: none
- Release behavior change: none

## Baseline Hashes (source paths)

Captured 2026-07-23:
- create-agdf/opencode-plugin.js: c834d7cc5883e4ed1541c925b4e7b66ce6d57a95c97e917839f12d7dbc0a0b56
- plugin/skills/gate-check/SKILL.md: 66fde6d22abb079c2a965e7a893d933557c45ae10e3c3bb4143deba980aad219
- create-agdf/scripts/opencode-hardening-test.js: 9261763d6fb790ebb3f7f0e967011480c62c06cbcb7785cb19e3a29684952e7b
- create-agdf/scripts/sync-package-assets.js: 5db158888a171fd3446a5cdfa103eae74e7e4c06e8748b114607b2baf4b927bd

## Execution Plan

1. Extend create-agdf/opencode-plugin.js session.created hook with TUI toast on inactive + version-drift check (try/catch, degrade to app.log).
2. Add subagent-bypass disclosed-boundary section to plugin/skills/gate-check/SKILL.md.
3. Add disclosure to AGDF.md instructions source.
4. Extend create-agdf/scripts/opencode-hardening-test.js with toast-fallback and drift-detection test cases.
5. Run sync-package-assets.js to propagate generated surfaces.
6. Run validation commands.
7. Record execution evidence and mini-closeout.
