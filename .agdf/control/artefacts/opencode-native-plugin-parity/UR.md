# User Request

## Objective

Bring the OpenCode AGDF integration to a native plugin surface that is comparable in cleanliness and discoverability to the Codex and Claude Code plugin surfaces, while preserving OpenCode's native plugin, skill, agent, instruction and permission model.

## Problem

The current OpenCode integration combines a thin npm lifecycle hook with repository-local `AGDF.md`, generated subagents and control files. It intentionally does not expose AGDF as OpenCode Skills and is classified as `instruction_only`, unlike the tool-enforced Codex and Claude evaluator surfaces.

## Scope boundary

- inspect and extend the existing OpenCode adapter and generated-surface pipeline;
- establish one canonical AGDF source of truth with native OpenCode packaging;
- preserve repository-local `.agdf/control/` authority and explicit edit/bash/skill permissions;
- define and test the strongest enforcement level that OpenCode can evidence;
- keep Codex, Claude Code and other surfaces unchanged unless shared-source propagation requires it.

## Out of scope

- changing the AGDF gate model or Runtime Contract semantics;
- claiming tool enforcement without reproducible OpenCode evidence;
- replacing OpenCode's native configuration model with a Codex- or Claude-specific abstraction;
- commit, push, pull request or release.

## Acceptance direction

The resulting OpenCode package must be discoverable through OpenCode's native mechanisms, route the canonical AGDF workflow controls without duplicated policy, preserve explicit permissions and repository source-of-truth boundaries, and expose an honestly evidenced capability classification with regression coverage.

## Approval

`Approval: UR` provided on 2026-07-13.
