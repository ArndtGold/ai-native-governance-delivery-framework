# UR: Agent Skills Conformance And Portability Baseline

Status: approved
Gate: UR
Gate approval: Approval: UR
Date: 2026-08-19
Owner: Arndt Gold

## 1. Problem

AGDF's canonical skills already follow the core Agent Skills directory and `SKILL.md` format, but
the repository does not yet carry one durable, deterministic conformance check against that public
baseline. The skills also consume shared AGDF Runtime Contract modules outside their individual
directories, so their supported portability boundary is plugin-scoped rather than clearly proven as
standalone skill portability.

## 2. Goal

Make AGDF's Agent Skills conformance and supported portability boundary explicit, deterministic and
regression-testable without weakening AGDF's canonical Runtime Contract ownership.

## 3. Scope

- Define the Agent Skills core constraints that AGDF claims and validates.
- Add one deterministic repository check for all canonical AGDF skills.
- Verify required frontmatter, naming, description limits, directory agreement, size guidance and
  referenced-resource resolution.
- Distinguish self-contained skill resources from intentional plugin-scoped shared dependencies.
- Integrate the check with the existing integrity/test path and document the supported portability
  claim at its canonical owner.
- Preserve the current ten-skill inventory and existing skill behavior.

## 4. Non-Goals

- Making every AGDF skill independently installable outside the AGDF plugin.
- Copying shared Runtime Contract modules into each skill or creating parallel sources of truth.
- Changing gates, approvals, delivery modes, skill routing or runtime semantics.
- Adding MCP servers, connectors or a new registry.
- Adding optional `agents/openai.yaml` metadata without a separately evidenced product need.
- Claiming identical behavior across agent hosts from repository validation alone.

## 5. Acceptance Signals

- The claimed Agent Skills baseline and plugin-scoped portability boundary are unambiguous.
- A deterministic check passes for every canonical AGDF skill and fails on representative malformed
  metadata, name mismatch, unresolved reference and undeclared out-of-root dependency fixtures.
- Existing Runtime Integrity, skill evaluations and package smoke checks remain green.
- Repository conformance, packaged-plugin integrity and unperformed live-host behavior remain
  explicitly separate evidence classes.

## 6. Existing Source Of Truth

- `plugin/skills/*/SKILL.md`
- `plugin/meta/contracts/*`
- `plugin/meta/agdf-plugin.definition.json`
- `plugin/.codex-plugin/plugin.json`
- `plugin/scripts/check-runtime-integrity.mjs`
- `create-agdf/scripts/sync-package-assets.js`
- Agent Skills specification at `https://agentskills.io/specification`
- OpenAI skill guidance at `https://learn.chatgpt.com/docs/build-skills`

## 7. Risks And Unknowns

- Brownfield Review must decide whether the new check belongs inside Runtime Integrity or as one
  focused validator consumed by it.
- The standard's recommendations and strict constraints must be separated so AGDF does not turn
  advisory guidance into an accidental compatibility break.
- Shared `../../meta/contracts/*` references must remain resolvable in the packaged plugin without
  being mislabeled as standalone portability.
- Upstream standard drift requires an explicit update strategy rather than an unpinned network
  dependency in routine CI.

## 8. Next Step

Perform Brownfield Review and record the smallest safe Mode/Slice Decision. No additional user
action is required for that internal step.
