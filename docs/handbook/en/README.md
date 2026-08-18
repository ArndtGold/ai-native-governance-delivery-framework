---
language: en
chapter_role: index
translation_of: ../de/README.md
source_revision: sha256:a79bcea722e73a88058104ef89693636bc7e5b6af9ee6c82da0e2d5080f0a6d7
translation_status: reviewed
---

# Using AGDF with coding agents

This handbook shows you how to work with AGDF. It is for people who want to use a coding agent
without first studying the CLI or the internal runtime rules.

AGDF is not an extra set of forms. It shows what the agent may do now, which decisions require user
approval, and what evidence supports the next step.

## AGDF in five minutes

You do not need the AGDF CLI or any knowledge of the internal runtime rules to get started. For now,
five concepts are enough:

1. **Request:** You describe what you want to achieve and what must remain unchanged.
2. **Run:** AGDF keeps the control state for that work. A run is not a Git branch or a worktree.
3. **Gate:** The agent stops before an important decision. You decide whether to approve the next
   step.
4. **Evidence:** Tests, reviews and observations show whether a result is reliable.
5. **Delivery:** A commit, push, pull request, release or publication happens only when you ask for
   it explicitly.

A simple conversation might look like this:

> **You:** Add an export function. The existing API must not change.  
> **Agent:** I have prepared the User Requirement. Implementation is not permitted yet.  
> **You:** `Approval: UR`  
> **Agent:** I will now inspect the existing system and select the smallest safe delivery path.

You do not need to decide whether the work requires a Quick Task, Compact Delivery or a structured
path. The agent first examines the existing context, explains the appropriate path and shows you the
next decision it needs from you.

For now, remember this: **You describe the goal, AGDF makes the next permitted step visible, and
important transitions require your deliberate approval.**

## Getting started

Begin with the [Quickstart](01-quickstart.md). It takes you from the initial request to the delivery
path, quality assurance, acceptance and closeout.

The [banking example](../../../examples/sample-banking-flow.md) illustrates a high-stakes Brownfield
case. It is a domain example, not a complete record of every approval interaction or closeout
action.

Continue with the chapter that matches your question:

1. [Quickstart](01-quickstart.md) — initial request, User Requirement and delivery path
2. [Gates and approvals](02-gates-and-approvals.md) — the exact effect of an approval
3. [Common workflows](03-common-workflows.md) — Quick Task, Compact Delivery, Verified Change and
   structured paths
4. [Multiple runs](04-multiple-runs.md) — parallel work, run selection and what runs do—or do not—isolate
5. [Closeout and delivery](05-closeout-and-delivery.md) — reviews, QA, UAT, Git and release boundaries
6. [Troubleshooting](06-troubleshooting.md) — activation, ambiguity, missing approvals and drift

## What this handbook does not replace

This handbook explains practical use. The following current sources remain authoritative:

- the [Runtime Contract](../../../plugin/meta/agdf-runtime-contract.md) for normative gate, mode and
  authority rules;
- the selected live run at `.agdf/control/runs/<run_id>/RUN_STATE.md` for current delivery state;
- [Installation](../../../INSTALL.md) for Codex, Claude Code, GitHub Copilot and OpenCode;
- the [Control Scaffold](../../../plugin/control/README.md) for technical run-state details;
- the [AGDF CLI README](../../../agdf/README.md) for command reference;
- the [framework overview](../../01-framework-ueberblick.md) and [gates](../../02-gates.md) for
  additional background.

If a simplified explanation differs, the Runtime Contract, selected live run and approved artefacts
take precedence in that order. This handbook cannot grant approval.
