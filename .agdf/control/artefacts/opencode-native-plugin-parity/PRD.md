# Product Requirements Document

## 1. Product intent

AGDF shall provide an OpenCode-native integration that is as cleanly discoverable and packageable as the Codex and Claude Code integrations, while preserving OpenCode's native configuration, plugin, skills, agents and permission semantics.

## 2. Problem statement

The current OpenCode surface is split between a thin npm plugin hook and repository-generated instructions and subagents. The generator explicitly omits `.opencode/skills/`, and the delivery-path capability contract therefore classifies OpenCode as `instruction_only`. This creates an observable parity gap: OpenCode loads AGDF, but does not yet present the same native plugin-and-skill experience as Codex and Claude Code.

## 3. Goals

- Expose the canonical AGDF workflow controls through OpenCode-native discovery mechanisms.
- Keep `plugin/meta/agdf-runtime-contract.md`, the canonical router and the plugin definition as the authoritative owners.
- Preserve repository-local `.agdf/control/` as the durable source of truth.
- Preserve explicit approval for mutating OpenCode tools and make skill access permissionable.
- Keep global package activation separate from repository-surface activation.
- Establish a reproducible, honest capability classification for OpenCode.
- Maintain compatibility with existing `opencode`, `opencode-status` and `opencode-repo` flows.

## 4. Non-goals

- Rewriting AGDF's gate model, Runtime Contract or shared skill semantics.
- Making OpenCode behave like Codex or Claude Code internally.
- Claiming tool enforcement without runtime evidence.
- Introducing a second OpenCode-specific policy source.
- Changing Codex, Claude Code, Copilot or generic-surface behavior except for required generated-source synchronization.
- Commit, push, pull request or release.

## 5. User requirements

### R1 Native discovery

After repository setup, an OpenCode user can discover and invoke the canonical AGDF workflow controls through OpenCode's native skill/agent mechanisms, with names and routing that are unambiguous in OpenCode.

### R2 Plugin loading

The published `create-agdf` package remains loadable as an OpenCode plugin and continues to provide lifecycle/status context without becoming a second policy owner.

### R3 Source-of-truth boundary

Global plugin loading alone must not imply active repository governance. The OpenCode surface must continue to distinguish package loadability, global configuration, repository surface presence and active control state.

### R4 Permission boundary

OpenCode mutating tools remain explicitly permissioned by default. Skill access is exposed to OpenCode's permission system where supported. Generated permissions must not silently allow edits, shell execution or governance bypass.

### R5 Canonical propagation

OpenCode-native assets are generated from the same canonical plugin definition, router, skills and Runtime Contract as the other surfaces. Hand-maintained duplicated policy is prohibited.

### R6 Capability evidence

The delivery-path capability classification records the strongest level supported by reproducible OpenCode evidence. In the absence of such evidence, the surface remains `instruction_only`.

### R7 Backward compatibility

Existing global and repository setup commands, existing-config protection and status output remain compatible. Existing repositories must not be overwritten without the established explicit force behavior.

## 6. Proposed product shape

Extend the existing OpenCode adapter rather than replace it:

1. retain the npm plugin as the global lifecycle/status integration;
2. generate OpenCode-native skills and/or agents from canonical AGDF sources according to the verified OpenCode runtime contract;
3. generate the required instructions and permission configuration as a thin OpenCode adapter;
4. retain `.agdf/control/` as the durable governance authority;
5. add focused tests for discovery, routing, permissions, status separation, source propagation and capability evidence.

The exact choice between native Skills, Agents or a combined surface is deferred to the SD after runtime verification and must not be inferred solely from the existing generator.

## 7. Acceptance criteria

- A clean generated OpenCode repository surface exposes all canonical AGDF workflow controls through verified native OpenCode discovery.
- OpenCode loads the published npm plugin and the repository surface without duplicated gate policy.
- Global-only installation does not report repository governance as active.
- Mutating tools and skill access have explicit, tested permission behavior.
- Existing setup/status/config-preservation tests remain green or are updated with an explicitly justified compatibility change.
- Generated OpenCode assets change when the canonical plugin definition or source skill changes.
- The capability matrix contains runtime evidence or remains fail-closed at `instruction_only`.
- The implementation has no parallel AGDF router, Runtime Contract or gate owner.

## 8. Risks and mitigations

| Risk | Mitigation |
|---|---|
| OpenCode runtime behavior differs from documentation or package assumptions | Verify against the installed/current OpenCode runtime during SD and implementation preparation. |
| Native discovery improves usability but does not improve enforcement | Separate discovery evidence from tool-enforcement evidence; keep capability classification fail-closed. |
| Global plugin context is mistaken for active repository governance | Preserve explicit status fields and repository-surface checks. |
| Generated skills become a second policy copy | Generate from canonical sources and add drift checks. |
| Existing users lose current subagent routing | Preserve compatibility aliases or migration behavior where required and test existing flows. |

## 9. Traceability

- derived from: `UR.md`
- sized by: `BROWNFIELD_REVIEW.md`
- primary owners: `create-agdf/opencode-plugin.js`, `create-agdf/scripts/sync-package-assets.js`, `plugin/meta/agdf-plugin.definition.json`, OpenCode capability evaluation and focused smoke tests
- shared policy owners retained: `plugin/meta/agdf-agent-router.md`, `plugin/meta/agdf-runtime-contract.md`, `plugin/skills/**`

## 10. Required next step

Create the Solution Design for the verified OpenCode-native packaging, permission and capability-evidence approach.
