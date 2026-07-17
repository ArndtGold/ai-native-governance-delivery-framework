# Solution Design: Single-Install OpenCode Activation

Status: approved
Gate: SD
Gate approval: `Approval: SD` accepted on 2026-07-17 after selected-run, same-gate, revision and durable-artefact revalidation.
Revision: 2
Date: 2026-07-17
Owner: agent

## Design Decision

Retain one global `create-agdf` OpenCode plugin and its collision-safe `agdf-global-*` skill
surface. Replace the duplicated local runtime surface as the activation predicate with a shared
repository-activation helper that recognizes a valid `.agdf/control/config.json`. The helper is the
single owner used by the plugin, status evaluator and scaffold/migration flow.

## Components And Ownership

| Component | Responsibility | Change |
|---|---|---|
| Repository activation helper | Safely determine `inactive`, `active`, or `legacy_compatible` from durable control configuration and owned legacy files. | New focused pure module; no gate logic or policy duplication. |
| `opencode-plugin.js` | Provide session environment state and early AGDF system guidance. | Replace local-surface predicate; append canonical global guidance through the existing OpenCode system-transform hook only for active repositories. |
| Global OpenCode installer | Own npm package, global instructions, global `agdf-global-*` skills and explicit global defaults. | Keep ownership guards and current skill prefix; do not add project runtime copies. |
| Status evaluator | Report installation, durable activation, legacy compatibility and observable session state independently. | Replace boolean local-surface projection with explicit activation state and actionable next step. |
| `opencode-repo` scaffold | Support existing-repository migration without destructive changes. | Stop requiring copied runtime assets for new activation; preserve legacy files unless an explicit, owned migration path is selected. |
| Generated assets and docs | Derive all shared content from canonical owners. | Update guidance and integrity assertions without creating a second OpenCode policy source. |

## Activation Algorithm

1. Resolve `.agdf/control/config.json` relative to the OpenCode repository directory.
2. Parse it as JSON and verify the minimum AGDF configuration shape already accepted by control
   validation. Missing or invalid configuration yields `inactive` and never enables gate routing.
3. Detect the existing generated local OpenCode files separately. If control is valid and owned local
   assets also exist, report `legacy_compatible`; they remain untouched.
4. In an active or legacy-compatible repository, the global plugin:

   - exposes `AGDF_PLUGIN_ACTIVE=1` and durable-control metadata through `shell.env`;
   - appends the canonical global AGDF system guidance through
     `experimental.chat.system.transform`, so routing is present before compaction; and
   - preserves the compaction reminder as recovery context, not as the primary activation mechanism.

5. In an inactive repository, the plugin supplies only the existing concise orientation and does not
   claim AGDF gates are active.

## Permissions And Authority

The design does not add a plugin-owned permission override. The global installer may add missing
defaults as it already does, but explicit `permission.question: deny` is never changed. The plugin
must not mutate approval state, infer approval from a permission outcome, or treat auto mode as user
approval. The existing exact-text fallback and same-run/same-gate revalidation remain unchanged.

## Skill And Compatibility Strategy

New repositories use the installed global `agdf-global-*` skills. The prefix is retained because
the previous generated repository `agdf-*` skill names can coexist in existing repositories and
OpenCode does not provide a safe preference rule for duplicate names. The global instruction layer
names the correct global entrypoint for activated repositories. Any future canonical-name migration
is out of scope until its collision behavior has direct evidence.

`opencode-repo` becomes a compatibility/migration command rather than a required second runtime
installation. It may ensure durable AGDF control configuration exists, report legacy assets and
offer an explicit owned migration; it must not silently delete `.opencode/**` or modify a user-owned
`opencode.json`.

## Status Contract

`opencode-status` reports independently:

- `global_installation`: config, package version and global skill/contract completeness;
- `repository_activation`: `inactive | active | legacy_compatible | invalid_control`;
- `repository_control`: marker path and parse/validation diagnostics;
- `session`: observable plugin signal only, never inferred from a status subprocess; and
- `next_step`: repair control, migrate legacy surface, restart OpenCode, or load the documented
  global gate-check skill as appropriate.

Existing JSON fields remain additive-compatible where possible; deprecated local-surface aliases
remain until migration evidence and regression coverage permit removal.

## Verification Design

1. Pure activation-helper fixtures: missing, invalid and valid control configuration; valid control
   with legacy generated files; user-owned lookalikes.
2. Plugin-hook tests: active repositories append canonical system guidance before compaction;
   inactive repositories do not claim activation; shell environment values match the helper.
3. Installer/status tests: global installation, activation and session facts remain distinct;
   package/source/generated version drift stays visible.
4. Scaffold/migration tests: new activation does not copy shared `.opencode/**`; legacy owned files
   are preserved; user-owned files are never deleted or overwritten.
5. Cross-surface regression: Runtime Integrity, focused OpenCode tests and package smoke.
6. UAT: optional live OpenCode session verifies visible early routing; absence of that observation
   remains an explicit limitation rather than a failed repository assertion.

## Risks And Mitigations

- Hook API drift: type-check against the installed OpenCode plugin definitions and isolate the hook
  adapter in the existing plugin module.
- Skill-name confusion: retain `agdf-global-*` and state it clearly until a tested migration exists.
- Invalid marker false activation: parse/validate fail closed and report repair guidance.
- Legacy breakage: preserve local assets by default and test owned versus user-owned paths.

## Non-Goals

No second plugin, no new gate evaluator, no automatic deletion, no global activation of arbitrary
repositories, no native-approval authority change and no live-host claim without evidence.

## Next Step

Create the Task and Test Plan. Implementation remains forbidden until the TP is approved and the
pre-implementation Brownfield Analysis passes.
