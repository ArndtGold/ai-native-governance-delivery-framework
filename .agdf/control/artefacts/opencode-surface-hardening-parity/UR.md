# UR: OpenCode Surface Hardening and Evaluator Parity

Status: approved
Gate: UR
Gate approval: Exact `Approval: UR` accepted on 2026-07-23 after same-run, same-revision and durable-artefact revalidation.
Revision: 1
Date: 2026-07-23
Owner: agent

## Problem

AGDF's OpenCode surface works, but two verified gaps weaken it. First, the npm plugin depends on
two `experimental.*` host hooks (`experimental.chat.system.transform`,
`experimental.session.compacting`) with no deterministic detection of whether the installed host
still supports them, and the pinned plugin SDK (1.17.11) drifts from the installed host (1.18.3) —
degradation would currently be silent. Second, Delivery Path Search treats OpenCode as
instruction-only while Codex and Claude Code provide executable, tool-enforced evaluators, which
makes OpenCode a second-class surface for a governed planning feature.

## Goal

Make the OpenCode surface degrade observably instead of silently when experimental hooks are lost,
and give Delivery Path Search an executable, tool-enforced OpenCode evaluator built on stable host
mechanisms.

## Scope

After the required approvals, deliver the smallest safe change that:

1. adds a deterministic hook-support probe to `opencode-status` that inspects the installed host
   plugin SDK for the two experimental hook names and reports support or degradation;
2. aligns or warns on host-versus-SDK version divergence at install or status time;
3. completes the static global OpenCode instructions so governance stays fail-closed without the
   experimental hooks, and hardens the plugin hook bodies defensively;
4. adds an executable OpenCode Delivery Path Search evaluator (`opencode run --pure --agent …`
   with deny permissions) with capability preflight and a fail-closed fallback to instruction-only;
5. updates the capability matrix and documentation truthfully and adds regression coverage.

## Non-Goals

- changing gate order, exact approval values or the interaction contract;
- removing the experimental hooks while they are the only dynamic-injection path;
- Delivery Path Search candidate-generation parity (stays Codex/Claude opt-in);
- in-host `permission.ask` enforcement as the primary path;
- VCS, release or publish actions as part of this run.

## Acceptance Signals

1. `opencode-status` deterministically reports experimental-hook support and version divergence
   from the installed SDK.
2. Static instructions alone keep governance fail-closed when the hooks are absent.
3. The OpenCode evaluator passes the shared evaluator contract through fixture/contract tests and
   is reported `tool_enforced` only after preflight success; otherwise it fails closed to
   instruction-only.
4. The capability matrix and documentation reflect the new state truthfully.

The hook-support result is declaration-level evidence from the installed SDK, not proof that a live
host invocation executed either hook. Status and documentation must preserve that evidence boundary.
