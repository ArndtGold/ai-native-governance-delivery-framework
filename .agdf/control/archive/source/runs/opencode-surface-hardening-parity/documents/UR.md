# UR: OpenCode Surface Hardening and Evaluator Parity

Status: approved
Gate: UR
Gate approval: Exact `Approval: UR` accepted on 2026-07-23 after same-run, same-revision and durable-artefact revalidation.
Revision: 2
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

The first implementation made version divergence visible but left repair as a manual step. The
approved follow-up intent is that the OpenCode install path should safely align the plugin SDK to
the detected host version when that exact SDK version is available, instead of knowingly leaving a
repairable divergence behind.

## Goal

Make the OpenCode surface degrade observably instead of silently when experimental hooks are lost,
align the plugin SDK safely during OpenCode installation when an exact host-version match is
available, and give Delivery Path Search an executable, tool-enforced OpenCode evaluator built on
stable host mechanisms.

## Scope

After the required approvals, deliver the smallest safe change that:

1. adds a deterministic hook-support probe to `opencode-status` that inspects the installed host
   plugin SDK for the two experimental hook names and reports support or degradation;
2. makes `opencode-status` read-only and, during `opencode` install, automatically aligns
   `@opencode-ai/plugin` to the detected OpenCode host version when that exact version is
   resolvable; if alignment is unavailable or fails, preserves the observed installation state and
   reports the unresolved divergence and recovery action;
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
- an interactive SDK-alignment question or a TTY-dependent installation path;
- updating, downgrading or otherwise modifying the OpenCode host itself;
- mutating SDK dependencies from `opencode-status`;
- VCS, release or publish actions as part of this run.

## Acceptance Signals

1. `opencode-status` deterministically and read-only reports experimental-hook support and version
   divergence from the installed SDK.
2. `opencode` install aligns the SDK to an exactly matching, resolvable host version and verifies
   the resulting installed version; unavailable or failed alignment is visible and does not claim a
   matching state.
3. Static instructions alone keep governance fail-closed when the hooks are absent.
4. The OpenCode evaluator passes the shared evaluator contract through fixture/contract tests and
   is reported `tool_enforced` only after preflight success; otherwise it fails closed to
   instruction-only.
5. The capability matrix and documentation reflect the new state truthfully.

The hook-support result is declaration-level evidence from the installed SDK, not proof that a live
host invocation executed either hook. Status and documentation must preserve that evidence boundary.
