# UR: Cross-Host Plugin Runtime Integrity

Status: approved  
Gate: UR  
Gate approval: `Approval: UR` provided on 2026-08-25 after same-run, same-gate and revision-1 revalidation.  
Date: 2026-08-25  
Owner: agent

## 1. Problem

AGDF already owns one generated, exact-version validator runtime and validated installation paths for
Codex, Claude Code and OpenCode. However, the repository Codex marketplace currently exposes the
runtime-free source tree `plugin/` under the same marketplace identity as the complete installed
plugin. In the observed Codex session, that source projection was copied into the plugin cache and
loaded while the registered durable marketplace contained the healthy runtime-complete build.

This makes plugin presence look healthy while the effective session lacks
`runtime/agdf-local.js`, its runtime manifest and the focused validator modules. The current
repository marketplace renderer also emits the general `agdf` marketplace name instead of the
separate canonical repository name already declared in the plugin definition. Equivalent source,
build, installed-cache and loaded-session ambiguity must not occur on any supported executable
surface.

## 2. Goal

Ensure that every supported AGDF surface has one unambiguous and truthful runtime profile:

- executable Codex and Claude Code installations load the same generated, exact-version shared
  validator runtime from a complete installed plugin;
- OpenCode continues to use its existing exact config-local runtime owner;
- public Skills-only and instruction-only surfaces remain usable through the agent-native path and
  report machine validation as unavailable or externally required when no local validator is part
  of that profile; and
- source, built bundle, registered marketplace, installed cache and effective loaded-session
  evidence remain distinct and independently verifiable.

## 3. User Outcomes

1. A Codex or Claude Code user does not unknowingly load a runtime-free source projection over a
   healthy installed AGDF plugin.
2. When machine validation is supported, the active skill and validator come from the same AGDF
   version and distribution profile.
3. When machine validation is not supported, AGDF states that limitation clearly and continues only
   through the permitted agent-native path.
4. A contributor can identify the effective plugin source, version, runtime digest and cache or
   installation location without comparing directories manually.
5. Marketplace collisions, shadowed installations and incomplete runtime payloads fail closed with
   actionable diagnostics before their output is treated as machine evidence.

## 4. Scope

- Define explicit runtime expectations for source, built, installed and portable Skills-only AGDF
  distribution profiles.
- Prevent runtime-free `plugin/` source from being advertised or consumed as a runtime-bearing
  Codex or Claude Code installation.
- Reconcile repository marketplace identity and source selection with the existing durable local
  marketplace and local-development installer owners.
- Preserve one canonical validator implementation and one generated runtime payload; host adapters
  may translate only path resolution and process invocation.
- Add exact-version and digest-based provenance for runtime-bearing installed bundles and effective
  caches where the host exposes them.
- Add deterministic detection for marketplace collision, source shadowing, missing runtime,
  version mismatch and digest mismatch.
- Verify the actual post-installation runtime location for Codex and Claude Code and preserve the
  existing OpenCode config-local verification boundary.
- Preserve explicit public Skills-only, ChatGPT, GitHub Copilot and other instruction-only
  degradation behavior without claiming a local executable.
- Extend package, installer, lifecycle, negative and fresh-session evidence so repository success is
  not presented as loaded-host success.

## 5. Non-Goals

- Duplicating the validator implementation or complete runtime payload in every skill.
- Creating a second gate model, approval validator, runtime contract or host-specific governance
  policy.
- Changing AGDF gate semantics, approval values, control-state authority or supported delivery
  modes.
- Editing an installed cache in place or silently removing an unowned marketplace registration.
- Publishing a package, submitting or publishing a public plugin, deploying a service, committing,
  pushing or opening a pull request as part of this UR.
- Adding an AGDF MCP service, hosted account, remote validator or automatic registry fallback.
- Claiming ChatGPT, Codex, Claude Code, OpenCode or Copilot parity without direct evidence for each
  named surface.

## 6. Acceptance Signals

- No installable Codex or Claude Code marketplace owned by AGDF points to the runtime-free source
  directory `plugin/`.
- Repository and durable marketplace identifiers cannot shadow each other; canonical configured
  names are rendered exactly or the unnecessary repository marketplace is removed.
- Codex and Claude Code runtime-bearing bundles contain one matching runtime manifest, entrypoint,
  focused payload and deterministic digest produced by the existing build owner.
- A validator launched from the actual installed Codex cache and Claude Code plugin root reports the
  expected version without registry access and can execute focused `doctor --json` evidence.
- The active skill version, plugin manifest version, runtime version and runtime digest agree before
  validator output is accepted as machine evidence.
- A runtime-free source projection shadowing a complete installation produces a stable blocking
  diagnostic and a normal installer-based recovery action; no cache patch is proposed.
- Public Skills-only and other instruction-only profiles pass only their declared portable
  contract and expose `machine_validation: unavailable` or `external_required` where applicable.
- Negative tests independently cover source-as-install-target, marketplace identity collision,
  missing runtime, version drift, digest corruption and stale-cache provenance.
- Fresh Codex and Claude Code sessions provide separate direct evidence that the intended installed
  plugin version and runtime are actually loaded; repository and package tests do not substitute for
  this evidence.
- Existing OpenCode installation, public Skills-only packaging, package publication and local
  development installation behavior remain regression-clean within their declared boundaries.

## 7. Existing Sources Of Truth And Reuse

- `automatic-version-asset-sync` owns the runtime-free source, generated full plugin, shared runtime
  payload and durable Codex/Claude marketplace architecture.
- `agdf-local-plugin-install-scripts` owns contributor-facing local installation and cachebuster
  orchestration.
- `create-agdf/scripts/sync-plugin-runtime.js` owns runtime payload generation.
- `create-agdf/scripts/sync-package-assets.js` owns complete generated plugin composition.
- `create-agdf/lib/installers/local-marketplace.js` owns durable marketplace staging, identity,
  digest validation and rollback.
- `create-agdf/lib/installers/plugin-installers.js` owns Codex and Claude Code lifecycle operations.
- `create-agdf/lib/installers/opencode.js` owns the OpenCode config-local runtime.
- `plugin/meta/agdf-plugin.definition.json` owns canonical product, surface and marketplace metadata.
- `plugin/skills/gate-check/SKILL.md` and the Runtime Contract own agent-native fallback and machine
  evidence boundaries.

This scope extends those owners. It must not create a parallel installer, marketplace format,
runtime generator or validator.

## 8. Risks And Open Questions

- Codex repository marketplace precedence and cache selection must be verified against the current
  host rather than inferred solely from file equality.
- Claude Code uses its own plugin cache, `${CLAUDE_PLUGIN_ROOT}` and executable-path behavior; its
  adapter must remain native to Claude while consuming the same runtime payload.
- Removing or renaming the repository marketplace may affect contributor discovery and must retain
  one clear local-development installation path.
- Public Skills-only distribution and runtime-bearing local installation are intentionally distinct
  profiles; combining them without evidence could overstate ChatGPT execution capability.
- Host updates can retain an older plugin path for an active session. Fresh-session evidence and
  explicit restart boundaries are therefore required.
- Brownfield Review must decide whether the repository marketplace should be removed, renamed and
  restricted to development, or replaced by a runtime-complete derived source.

## 9. Next Step

Review this UR. Approval permits only the post-UR Brownfield Review and Mode/Slice Decision, not
implementation.

Approve only with:

`Approval: UR`
