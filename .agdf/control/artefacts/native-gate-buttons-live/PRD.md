# Product Requirements Document: Reliable Native Gate-Approval Invocation

Status: draft
Run: `native-gate-buttons-live`
Derived from: `.agdf/control/artefacts/native-gate-buttons-live/UR.md`
Brownfield basis: `.agdf/control/artefacts/native-gate-buttons-live/BROWNFIELD_REVIEW.md`
Date: 2026-07-14

## 1. Product decision

AGDF shall support host-native gate-approval controls when the selected agent
surface exposes them, while retaining exact textual approval as the universal
authoritative fallback. This run is limited to reliable invocation and live
evidence of the existing adapters; it does not introduce a custom UI, a second
approval store or host configuration changes.

## 2. Problem

The existing interaction contract and safety checks are implemented, but live
Claude Code behavior is inconsistent: the native controls were not applied on
the first interaction and appeared only after an explicit user request. This
leaves a gap between adapter availability and dependable agent-side invocation.

## 3. Users and value

AGDF users need a concise native choice when a gate is ready, without having to
know the internal invocation wording. If the host does not reliably provide the
control, users must still be able to approve through exact text with unchanged
run, gate and artefact validation.

## 4. Requirements

### R1. Ready-gate invocation

The gate-check flow may request a native gate control only for one selected run,
one current ready gate and one present durable artefact.

### R2. Claude first-attempt behavior

For a supported Claude Code session, the flow shall either invoke the native
gate control on the first eligible attempt or explicitly classify native
invocation as unavailable and present the exact-text fallback. A second user
prompt must not be required to reveal the fallback path.

### R3. Authority preservation

Only deliberate user input that passes same-run, same-gate and durable-artefact
revalidation may become an approval. Timeout, empty response, permission
result, plan approval and agent-produced text must not advance a gate.

### R4. Cross-surface parity

Codex and Claude Code shall expose the same semantic choices: exact
`Approval: <GateName>`, revise and decline/cancel, subject to each host's
capability. OpenCode remains unchanged unless shared ownership is proven.

### R5. Evidence

The implementation plan shall capture reproducible live evidence for Claude's
first eligible invocation, the no-answer path and the exact-text fallback. A
host limitation may be recorded as the result when the limitation is precise
and the fallback is demonstrated.

## 5. Non-goals

- custom AGDF UI, MCP/app button panel or plugin-owned renderer
- alternate approval persistence or host configuration mutation
- weakening or bypassing exact approval formulas
- treating a supporting live probe as gate-enforcement evidence
- unrelated OpenCode changes

## 6. Acceptance criteria

1. In a supported Claude Code session, the first eligible gate-check attempt
   either renders the bounded native choices or reports native unavailability
   and presents exact textual approval.
2. A native revise, decline or empty response leaves control state unchanged.
3. A native approval is accepted only after selected-run, current-gate and
   durable-artefact revalidation.
4. The same behavior remains covered by deterministic adapter/control tests and
   the existing textual fallback.
5. No custom UI, parallel approval store or host configuration change is added.

## 7. Open product question

If Claude Code cannot guarantee first-attempt native invocation from the
available plugin surface, the product outcome is an explicit host-capability
boundary plus a deterministic textual fallback, not a simulated button.

## 8. Next gate

After valid `Approval: PRD`, derive the Solution Design. Implementation remains
forbidden until the subsequent AGDF gates are satisfied.
