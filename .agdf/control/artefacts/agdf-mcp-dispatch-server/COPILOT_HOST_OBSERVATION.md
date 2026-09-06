# Copilot Host Observation: QA Skill Bypasses Dispatcher

Status: negative direct host evidence
Date: 2026-09-06
Run: `agdf-mcp-dispatch-server`
Host scope: GitHub Copilot Skills-only path, outside the approved first-release MCP adapter set

## Observation

The user invoked `/agdf-qa-gate` in a new Copilot session. The visible host activity searched for
AGDF run and QA files, expanded to broad `find` calls below the user home and `/Users`, and ended
after about two minutes and fifty seconds. The supplied screenshot is retained at
[`evidence/copilot-qa-gate-dispatch-bypass-2026-09-06.png`](evidence/copilot-qa-gate-dispatch-bypass-2026-09-06.png).

Image evidence:

- format: PNG, 1740 x 976, RGBA
- SHA-256: `4f2f4db8acbd0cf1bf71ea11b66051a2fd42a0d1dd641673ffbc6b071494bf18`

## Correlated Host Evidence

- session: `7db6a259-5817-4451-b2cd-bbf7aab202b8`
- session start: 2026-09-06 14:22:23 Europe/Berlin
- user input: `/agdf-qa-gate`
- selected assistant model: `mai-code-1.1-flash`
- installed AGDF plugin: `0.14.5`
- installed skill and runtime timestamps: 2026-09-06 14:13 local time
- session working directory: Copilot chat storage, classified by the hook as `repo_less`
- SessionStart result: success with a schema-2 dispatcher binding, exact Node executable, exact
  installed `runtime/agdf-local.js` argv prefix, expected version `0.14.5` and `authorizes: false`
- observed assistant tool requests: 17 total, comprising seven `view`, six `bash` and four
  `read_bash` calls
- dispatcher invocations: zero
- broad searches: six shell searches, including `find /Users -type d -name '.agdf'`
- final result: a QA `block` inferred from the unsuccessful search rather than a canonical dispatcher
  result

## Contract Comparison

The loaded installed skill states:

- use only the supplied schema-2 binding;
- if target evidence is absent, omit the target pair and let the dispatcher resolve it;
- a missing, failed or old binding yields `dispatcher_unavailable`;
- perform no search, environment repair or help retry.

The binding was present and valid. The model did not follow the required first operational call and
therefore never received the canonical localized `target_unresolved` result. The final `block` is not
a valid AGDF QA decision for a selected target and run.

## Cause And Boundary

- immediate cause: loaded-model instruction conformance failure; the model ignored a valid binding
  and selected generic filesystem tools instead
- architectural condition: the installed Copilot plugin declares only a passive `sessionStart`
  command. It supplies context but has no AGDF pre-tool enforcement owner.
- ruled out: stale installed skill, missing dispatcher binding, missing runtime, version mismatch or
  failed SessionStart hook
- MCP implication: a native `agdf_dispatch` tool would give the host a structured executable
  capability instead of a model-constructed shell call. MCP alone still does not prove that every
  model will select the tool; direct loaded-host evidence and, if strict enforcement is required, a
  separately designed host enforcement boundary remain necessary.
- scope implication: Copilot was excluded and `unverified` in approved PRD Revision 3 and TP
  Revision 1 and remains excluded in approved PRD Revision 4 and TP Revision 2. This observation
  does not satisfy the OpenCode-plus-one qualification requirement and does not authorize a Copilot
  MCP adapter or hook change.

## Required Follow-Up

The observation originally kept the then-current MCP run at QA `revise`. Approved PRD Revision 4,
SD Revision 3 and TP Revision 2 later separated Copilot from the completed OpenCode-plus-Codex
first-release qualification. Preserve this as negative Copilot Skills-only evidence without
invalidating QA for that approved scope. Decide in a separate approved scope whether Copilot should
receive an MCP adapter, a pre-tool fail-closed mechanism, or both. Do not treat further instruction
wording as proof that the first dispatcher call is enforced.

## Follow-Up After Local Reinstallation

A second fresh Copilot General Chat on 2026-09-06 failed closed without filesystem or shell calls,
but still bypassed the supplied dispatcher binding:

- session: `6c9ebd13-b5e0-4bca-8f2d-0ff52794188d`
- session start: `2026-09-06T17:00:12Z`
- model: `mai-code-1.1-flash`
- session working directory:
  `/Users/arndtgold/.copilot/chats/94568c52-246c-45b6-8ee9-7a53b8b26c35`
- host classification: `repo_less`
- installed AGDF plugin: `0.14.5`
- SessionStart result: success with the valid schema-2 dispatcher binding and `repo_less` runtime
  facts
- observed assistant tool requests: zero
- assistant result: no `pass | revise | block` decision, followed by a synthesized English
  target/evidence explanation instead of the dispatcher's canonical German target-orientation card

Replaying the installed hook with the recorded Copilot working directory reproduces `repo_less`.
Replaying the installed dispatcher without target evidence produces the canonical terminal
`target_unresolved` result and German `host_action.text`. Replaying it with the explicit repository
and `--run agdf-mcp-dispatch-server` resolves the current QA gate, exact run revision
`66315C86-EA37-4571-A93E-4B64D8A95391` and missing `Approval: QA`.

This proves that installation, runtime provenance and durable run state are intact. It also proves
that Copilot General Chat does not provide repository target authority: its working directory is
host-owned chat storage. The safer model response avoids the earlier fabricated `block`, but it is
still not a canonical dispatcher result. The user must name both repository and run in this
repo-less host path, and Copilot must actually invoke the supplied dispatcher. A native Copilot MCP
adapter or pre-tool enforcement remains outside the approved first-release scope.
