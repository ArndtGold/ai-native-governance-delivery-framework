# PRD: Single-Install OpenCode Activation

Status: approved
Gate: PRD
Gate approval: `Approval: PRD` accepted on 2026-07-17 after selected-run, same-gate, revision and durable-artefact revalidation.
Revision: 2
Date: 2026-07-17
Owner: agent

## Product Outcome

An OpenCode user installs AGDF once globally. A repository becomes AGDF-active when it contains a
valid durable AGDF control configuration, without installing or copying the shared OpenCode skills,
contracts or instructions into that repository.

## User Requirements

### P1 — Explicit repository activation

The global OpenCode plugin must classify a repository as active only when
`.agdf/control/config.json` exists and is valid. Global plugin presence alone must remain inactive.
An inactive repository must receive a concise orientation that explains how to create or repair
durable AGDF control state; it must not apply AGDF gates solely because the plugin is installed.

### P2 — One shared runtime surface

The global installation must remain the owner of shared OpenCode skills, contracts and runtime
guidance. A newly activated repository must not require generated `.opencode/AGDF.md`,
`.opencode/skills/**`, copied contracts or an `opencode.json` fragment merely to obtain AGDF routing.
The plugin must supply the applicable AGDF system guidance early enough for ordinary sessions, not
only during compaction.

### P3 — Existing repositories migrate safely

Repositories that already contain the generated local OpenCode surface must keep a supported,
explicit compatibility path. The solution must neither overwrite nor delete user-owned OpenCode
configuration. It must define deterministic behavior when global `agdf-global-*` skills and legacy
local `agdf-*` skills coexist, and must not change names or precedence speculatively.

### P4 — Permission and approval safety

An explicit user denial of `permission.question` remains authoritative. Configuration changes may
add only missing owned defaults and must not convert OpenCode permissions, auto mode, hooks or tool
results into AGDF approval. Exact textual approval remains the required fallback where native
transport is unavailable or denied.

### P5 — Truthful status and first use

`opencode-status` and first-use guidance must separately report:

1. global installation and package health;
2. repository activation from durable control state;
3. legacy local-surface compatibility, if present; and
4. observable session state, without treating a status subprocess as session evidence.

The user-facing path must make clear that initial repository enablement creates durable AGDF state,
not a second copy of the runtime.

## Acceptance Criteria

| ID | Requirement | Acceptance evidence |
|---|---|---|
| OSA-01 | Valid control configuration activates the global plugin for a repository. | Focused plugin/status fixture reports active repository state without `.opencode/**`. |
| OSA-02 | Missing or invalid control configuration remains inactive. | Negative fixture preserves fail-closed guidance and no gate claim. |
| OSA-03 | Shared runtime assets are installed globally once. | Installer and generated-asset checks show one global skill/contract source for new repositories. |
| OSA-04 | Existing local-surface repositories have deterministic compatibility behavior. | Migration/coexistence fixtures preserve owned and user-owned files and state the selected skill boundary. |
| OSA-05 | Explicit permission denial remains unchanged. | OpenCode allow/deny regression fixtures and interaction integrity checks pass. |
| OSA-06 | Status separates install, activation, compatibility and observable session facts. | JSON and human-status assertions cover all four states. |
| OSA-07 | Guidance is available before compaction in an active repository. | Plugin-hook unit evidence plus optional live OpenCode observation; repository tests do not overclaim live rendering. |
| OSA-08 | Canonical and generated assets remain synchronized. | Runtime Integrity, focused OpenCode checks and package smoke pass. |

## Non-Goals

- global activation in arbitrary repositories without an explicit durable marker;
- changing AGDF gate authority, approval values or control-state ownership;
- deleting legacy local assets or user-owned OpenCode files automatically;
- renaming global skills into a collision with legacy local skills without a verified migration;
- proving authenticated live OpenCode behavior solely through repository tests; or
- plugin install, update, restart, VCS, publish or release actions.

## Dependencies And Risks

- OpenCode's supported plugin hooks and skill-discovery precedence constrain the safe design.
- Existing `agdf-global-*` names avoid collision with legacy local `agdf-*` names; any change needs
  explicit migration evidence.
- Host-visible early system guidance must be separated from repository-side conformance evidence.
- Generated package assets, source implementation and installed package versions can drift and must
  be checked together.

## Next Step

Draft the Solution Design for activation detection, guidance injection, compatibility behavior, status
projection and verification. Implementation remains forbidden.
