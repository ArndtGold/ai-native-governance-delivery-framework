# UR: Establish a Codex Harness Conformance Slice for AGDF

Status: draft
Gate: UR
Gate approval: open
Date: 2026-08-21
Owner: Arndt Gold

## 1. Problem

OpenAI now presents the open-source Codex harness as a reusable execution and integration layer for
threads, turns, context, tools, sandbox policies, approval requests, streaming events and work across
turns. AGDF does not yet have a bounded, durable conformance boundary that explains how those runtime
capabilities may be consumed without confusing host-owned tool permission with AGDF gate approval,
treating transient thread history as governance state, or making Codex the authority for AGDF's
portable delivery semantics.

Without that boundary, future integration work could duplicate AGDF owners, create a second approval
model, overstate live-host evidence or couple the framework core to one host's protocol.

## 2. Goal

Make it possible to assess and, only through later approved gates, deliver the smallest useful Codex
harness conformance slice for AGDF. The slice should preserve AGDF as the authority for scope, gates,
durable artefacts, evidence classification, QA, UAT and closeout while treating Codex as an execution
and presentation host.

## 3. Scope

This first scope is limited to establishing the governed need for:

- a documented semantic mapping between Codex threads, turns and events and AGDF runs and evidence;
- an explicit boundary between Codex tool permissions and exact AGDF gate approvals;
- continued authority of `.agdf/control/` and the existing deterministic AGDF projections;
- evaluation of the documented Codex SDK, App Server and non-interactive integration layers;
- a bounded conformance and evidence plan that separates repository tests, protocol tests and direct
  authenticated-host UAT; and
- a host-adapter approach that preserves the existing shared AGDF contracts for Claude Code,
  OpenCode and other surfaces.

## 4. Non-Goals

- Forking or modifying the Codex harness.
- Replacing `.agdf/control/`, the AGDF CLI, the gate model or exact approval formulas.
- Treating Codex sandbox or tool permission as AGDF delivery approval.
- Building an AGDF account, hosted service, telemetry system or MCP server in this scope.
- Implementing an App Server or SDK adapter before Brownfield Review and the required later gates.
- Claiming authenticated-host behavior, publication, installation, release or deployment from
  repository evidence.
- Weakening the existing portability boundary or making Codex-specific metadata normative for AGDF.

## 5. Acceptance Signals

The need is clear enough for Brownfield Review when:

1. the execution-host and governance-authority boundary is explicit;
2. the approval distinction is stated as a protected invariant;
3. the existing AGDF owners and portability constraints to inspect are named;
4. repository, protocol and live-host evidence remain separate;
5. the smallest independently acceptable conformance outcome can be sized after inspecting the
   existing system; and
6. no implementation or public capability claim is implied by approving this UR.

## 6. Existing Source Of Truth

- `plugin/meta/contracts/interaction.md` owns AGDF interaction kinds, approval transport and the rule
  that native controls are presentation adapters only.
- `plugin/meta/contracts/task-target-resolution.md` owns target and governance-target selection.
- `plugin/meta/contracts/control-scaffold.md` and `.agdf/control/` own durable run state, evidence and
  deterministic projections.
- `plugin/meta/contracts/modes.md` owns proportional delivery depth and portability-sensitive impact.
- `plugin/meta/agdf-agent-router.md` owns workflow routing and skill boundaries.
- `README.md` defines the current public Skills-only distribution and its explicit non-claims.
- The completed `agent-skills-conformance-portability` run records the existing boundary between the
  portable skill format, plugin host integration and AGDF governance authority.
- OpenAI's official article `Codex as a platform: build on the open agent harness` and official Codex
  component documentation are external product evidence, not AGDF authority.

## 7. Risks And Unknowns

- The documented App Server or SDK protocol may change independently of AGDF.
- The smallest appropriate integration layer is not yet known and must not be selected before
  Brownfield Review.
- Thread and event data may be useful evidence without being sufficient, durable or authoritative.
- Native host presentation may not transport exact gate values safely in every Codex surface.
- A Codex-specific adapter could accidentally duplicate the canonical interaction renderer, gate
  logic or control-state owner.
- Direct authenticated-host access and repeatable test fixtures may be unavailable; those limits must
  remain visible rather than being inferred from repository tests.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`
