# UR: Fresh Request vs Durable Control State Documentation

Status: approved
Gate: UR
Gate approval: `Approval: UR`
Date: 2026-07-09
Owner: agent

## 1. Problem

AGDF user documentation mentions durable UR requirements and also says normal fresh requests do not require `init`. Users can reasonably expect a UR file to be written immediately under `.agdf/control/` even when the repository does not yet own live control state.

## 2. Goal

Make the user-facing documentation explicitly distinguish the first agent-native UR step from repository-owned durable control state.

## 3. Scope

- Clarify that a normal fresh request may start with a minimal UR in the chat plus `Approval: UR`.
- Clarify that `.agdf/control` artefacts are written when live control state is explicitly requested, already used by the repository, or required for deterministic setup.
- Clarify that later gates and implementation still require a persisted or linked UR where the Runtime Contract requires one.
- Keep the explanation aligned across primary user docs.

## 4. Non-Goals

- No change to gate order or approval semantics.
- No change to CLI behavior.
- No automatic control-state initialization.
- No new artefact format.

## 5. Acceptance Signals

- `README.md`, `INSTALL.md` and `create-agdf/README.md` explain the distinction in user-facing terms.
- The docs make clear that `init` is not required for every fresh request.
- The docs make clear that durable artefacts are still required before later gated delivery work when AGDF requires them.

## 6. Existing Source Of Truth

- `plugin/meta/agdf-runtime-contract.md`
- `plugin/skills/gate-check/SKILL.md`
- `README.md`
- `INSTALL.md`
- `create-agdf/README.md`

## 7. Next Step

Brownfield Review and Mode/Slice Decision are recorded in `BROWNFIELD_REVIEW.md`.
