# UAT Evidence: Simple Local Plugin Installation Scripts

Status: pass_accepted
Run: `agdf-local-plugin-install-scripts`
Host: Codex
Observed at: 2026-08-23

## Executed Step

- user_selected_host: Codex
- command: `npm run install:codex`
- command_result: pass
- canonical_preparation: pass; 29 version surfaces coherent at `0.13.5`; 43 public plugin candidates passed
- installation_scope: global

## Direct Installation Evidence

- installed_plugin: `agdf@agdf`
- installed_version: `0.13.5+codex.local-619acdcbd1f9`
- canonical_version: `0.13.5`
- installation_status: healthy
- verification_status: healthy
- activation_status: pending_restart
- restart_required: yes
- marketplace_source: `/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf`
- read_back: `codex plugin marketplace list --json` shows the owned local `agdf` marketplace; `codex plugin list` shows the exact installed and enabled local version

## First Fresh Task Observation

- fresh_task: pass; this observation was performed in a new Codex task after the requested restart boundary
- loaded_behavior: the active host exposed and executed `agdf:gate-check`
- host_skill_source: `/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.13.5/skills/gate-check/SKILL.md`
- loaded_cache_manifest: `/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.13.5/.codex-plugin/plugin.json`
- loaded_cache_manifest_version: `0.13.5`
- current_plugin_list_version: `0.13.5`
- projected_marketplace_manifest_version: `0.13.5+codex.local-619acdcbd1f9`
- projected_marketplace_marker: canonical `0.13.5`, Codex install version `0.13.5+codex.local-619acdcbd1f9`, source digest `619acdcbd1f9ad5b0e70795883a52908647797ed56658fab85fe603654a9f6b2`
- comparison: the active cache and projected marketplace differ at the Codex manifest version; the active cache has no local-install marker
- observation_result: fail; the requested local-suffix runtime identity is not the identity loaded by the fresh Codex task

## Post-Repair Fresh Task Loaded-Host Evidence

- fresh_task_after_repair: pass; the current task started after the second full Codex restart
- host_loaded_skill_inventory: all active `agdf:*` skills resolve from `/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.13.5+codex.local-619acdcbd1f9/skills/`
- loaded_behavior: the host exposed and this task executed `agdf:gate-check` from the suffix cache
- loaded_runtime_source: `/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.13.5+codex.local-619acdcbd1f9/runtime/agdf-local.js`
- loaded_cache_manifest: `/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.13.5+codex.local-619acdcbd1f9/.codex-plugin/plugin.json`
- loaded_cache_manifest_version: `0.13.5+codex.local-619acdcbd1f9`
- current_plugin_list_version: `0.13.5+codex.local-619acdcbd1f9`
- installed_and_enabled: yes
- validator_resolution: pass; the suffix-cache validator reports owned version-matched canonical runtime `0.13.5`, as designed
- observation_result: pass; installed identity, loaded skill source, loaded runtime source and active behavior converge on the repaired suffix cache

## Finding

- finding_id: `UAT-LPI-01`
- gap_type: `evidence_gap`
- routing_target: `evidence_obligation`
- gap_status: `resolved`
- evidence: the post-repair restarted task loads all AGDF skills and its validator from `0.13.5+codex.local-619acdcbd1f9`; cache manifest and current plugin list expose the same suffix identity
- required_next_step: none; loaded-host evidence and independent human acceptance are complete

The original provisional `implementation_gap` classification is superseded by direct reproduction evidence. In an isolated Codex home, both a clean install and a canonical `0.13.5` to `0.13.5+codex.local-619acdcbd1f9` update create exactly one suffix cache and report the suffix as installed. The same real global reinstall now reports and stores the suffix. No source change is justified unless the next restarted host again selects the base identity.

## Repair Applied

- repair_action: direct `codex plugin add agdf@agdf --json`, followed by the canonical `npm run install:codex` workflow
- repair_result: pass
- installed_version_after_repair: `0.13.5+codex.local-619acdcbd1f9`
- enabled_after_repair: yes
- active_cache_after_repair: `/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.13.5+codex.local-619acdcbd1f9`
- active_cache_manifest_version: `0.13.5+codex.local-619acdcbd1f9`
- isolated_upgrade_regression: pass; canonical base cache was replaced by exactly one suffix cache for both supported Codex selector syntaxes
- repository_change: none; the existing installer behavior passed direct reproduction, so no speculative implementation change was made
- activation_status: resolved_by_second_restart

## Still Missing

- none within the accepted Codex loaded-host boundary

## Human Acceptance

- decision: approved
- evidence: Exact `Approval: UAT` provided by the user on 2026-08-23 for run revision 16 (`13565830-7291-412f-91aa-3cd8acc0114d`) after same-run, same-gate and same-revision revalidation.

## Evidence Boundary

The first fresh-task observation remains valid negative evidence for the pre-repair state. The post-repair task directly proves the loaded suffix runtime boundary. Installation, loaded-host behavior and human acceptance remain separate evidence classes; all three are now satisfied for the accepted Codex boundary.
