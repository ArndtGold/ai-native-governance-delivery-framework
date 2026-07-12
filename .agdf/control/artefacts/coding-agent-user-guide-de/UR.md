# UR: German User Guide for AGDF in Coding Agents

Status: approved
Gate: UR
Gate approval: `Approval: UR` provided on 2026-07-12
Date: 2026-07-12
Owner: agent

## 1. Problem

The repository explains the AGDF framework, installation and technical runtime surfaces, but it does
not yet provide a task-oriented German guide for people using AGDF through a coding agent. New users
must infer how to start work, provide approvals, understand agent stops, handle parallel runs and move
from implementation through QA, UAT and delivery.

## 2. Goal

Provide a concise German user guide that enables a user to operate AGDF confidently through a coding
agent without first learning the CLI or reading normative runtime internals.

## 3. Scope

- Add a clearly bounded `docs/agenten-handbuch/` section without moving the existing framework docs.
- Provide an index and practical chapters for quick start, gates and approvals, common workflows,
  parallel runs, delivery closeout and troubleshooting.
- Use realistic user-agent dialogue examples and clearly distinguish user decisions from agent work.
- Link the guide from the repository README and identify later website exposure without duplicating
  the guide body.
- Keep surface-specific differences limited to invocation or installation notes; keep the operating
  workflow surface-neutral.

## 4. Non-Goals

- Rewriting or renumbering the existing `docs/00-07` framework documentation.
- Duplicating the Runtime Contract, skill routing rules, CLI reference or installation instructions.
- Producing English or additional-language translations in this slice.
- Redesigning the website or creating a separate documentation application.
- Changing AGDF product semantics, gate order or approval syntax.

## 5. Acceptance Signals

- A new user can follow one end-to-end coding-agent workflow from request through UAT.
- The guide explains exact approval phrases, why the agent stops and what each gate permits.
- Quick Tasks and Structured Delivery are distinguishable through practical examples.
- Parallel-run selection and lifecycle behavior are explained without exposing unnecessary internals.
- Commit, push, PR and release authorization boundaries are explicit.
- Every normative claim links to its existing source instead of becoming a second rule owner.
- Existing documentation links remain valid.

## 6. Existing Source Of Truth

- `README.md` and `docs/00-07` for the public German framework explanation.
- `INSTALL.md` for installation and supported coding-agent surfaces.
- `plugin/meta/agdf-runtime-contract.md` for normative gate and runtime behavior.
- `plugin/meta/agdf-agent-router.md` and `plugin/skills/` for skill routing and workflow controls.
- `plugin/control/README.md` for durable control-state mechanics.
- `create-agdf/README.md` and `agdf/README.md` for CLI and package reference.

## 7. Risks And Unknowns

- Brownfield Review must define the boundary between explanatory examples and normative rules.
- The guide could become stale if it repeats installation commands or complete gate tables.
- The appropriate first-slice chapter depth and whether surface-specific appendices are needed remain
  to be sized after reviewing existing documentation overlap.
- Website exposure should link or derive from the guide rather than create a second maintained copy.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`
