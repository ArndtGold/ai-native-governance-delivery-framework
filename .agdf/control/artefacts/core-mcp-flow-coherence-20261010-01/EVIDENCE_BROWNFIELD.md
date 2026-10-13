# Brownfield evidence — Core/MCP flow coherence

- observed_at: 2026-10-10
- source_commit: 5b1e66d14c7ff1f87aab21a664e8b2b1c386f712
- evidence_class: fresh read-only repository Core evaluation; not a writer transaction or installed-host qualification
- interpreter: /usr/local/Cellar/node@22/22.22.3/bin/node
- target: /Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework

## Executed comparison

Run the following from the target repository with Node's `--input-type=module`. It reads existing run bytes and evaluates two in-memory models; it does not record approvals, revise sources, repair seals or change the reference runs.

```js
import { parseControlState } from './packages/core/lib/control-state/run-state-parser.js';
import { readRunState, userGateOrder, closeoutArtefacts } from './packages/core/lib/control-evaluation/run-state.js';
import { transitionDecisionForRunState } from './packages/core/lib/control-evaluation/gate-policy.js';
for (const runId of ['cockpit-documented-approvals-20261009-01', 'cockpit-draft-check-integration-20261009-01']) {
  const full = readRunState(process.cwd(), { runId, ignoreRunIdEnv: true });
  const short = {
    ...parseControlState(full.content, {
      userGates: userGateOrder,
      internalSteps: ['Brownfield Review', 'Brownfield Analysis', 'CD+Tests', 'CR'],
      closeoutArtefacts: [...closeoutArtefacts],
    }),
    content: full.content,
  };
  const summarize = state => {
    const d = transitionDecisionForRunState(state);
    return { ux: state.artefacts.get('UX Intent Definition')?.status ?? 'absent',
      current_gate: d.current_gate, status: d.status,
      next_operation: d.next_operation ?? null, next_allowed_action: d.next_allowed_action };
  };
  console.log(JSON.stringify({ runId, full: summarize(full), writer_model: summarize(short),
    lifecycle: full.content.match(/^- lifecycle:\s*(.*)$/m)?.[1],
    or: full.artefacts.get('OR')?.status }));
}
```

## Captured results

| Reference | Complete reader model | Model using writer's current internal-step list | Persisted closeout |
|---|---|---|---|
| cockpit-documented-approvals-20261009-01 | UX `done`; gate `OR`; status `open`; no typed next operation | UX absent; gate `PRD`; status `open`; `reassess_source_analysis` / `ux-intent-definition` | lifecycle `completed`; OR `done` |
| cockpit-draft-check-integration-20261009-01 | UX `done`; gate `OR`; status `open`; no typed next operation | UX absent; gate `OR`; status `open`; no typed next operation | lifecycle `completed`; OR `done` |

For the first short model, the next action is `Reassess UX intent under the current approved UR before dependent source authoring.` All other evaluated OR results ask `Produce delivery closeout or requested handoff; do not perform VCS actions automatically.`

The comparison reproduces the state-preparation inconsistency for a revised-source run and the open-OR projection on two completed structured runs. It does not itself execute `prepareGateApproval` or prove transactional/retry behavior. The current source establishes that both approval routes use that preparation; implementation tests must exercise real writes in disposable targets.

## Other inspected boundaries

- `run-recording.js` prepares approval and refreshes derived state with a shortened internal-step list; `run-state.js` includes UX and source-revision UX requirements; `run-step-policy.js` already provides a full proposed-content evaluation pattern.
- `skill-dispatch/service.js` still compares `next_allowed_action` with the exact CD+Tests sentence. This is source confirmation, not a new live dispatcher failure scenario.
- `run-steps.js` rejects structured `closeout`; `gate-policy.js` returns open OR after structured UAT. Existing Quick Task transaction behavior is a reuse input, not proof of structured closeout.
- `traceability-readiness.js` extracts inline `criterion_id` declarations; `run-presentation-render.js` extracts bullet declarations and takes the first three UAT evidence rows. These are source findings; no new formatter or host test was run.
- Existing typed approval command exposes bound command/receipt/current-state semantics and explicitly cooperative assurance. Both typed and legacy CLI paths share the existing approval preparation.
- MCP dispatch used in this turn: 0.14.5, runtime digest `ef57692309f13380ad91f10c1be06b465793460e8149b80ba3aef1fc775322aa`, provenance matched. Supplied CLI used for UR recording: 0.14.5, digest `c326e6ffc4d975981ca75540a03dca9775d62351c8b8d230722ed60967183e6a`, provenance matched. They are distinct loaded runtime identities; successful control handoff is not package-byte equivalence or qualification of the planned flow.

## Protected baseline and limits

Only the newly bound run's control/artefacts and its canonical backlog entry may change in this planning phase. Other active/completed runs remain reference inputs. Product files have no implementation diff in this turn. No native UI, new MCP writer, concurrency, source-revision transaction or closeout-recovery qualification is claimed. Those scenarios belong to the later approved plan.

## Renewed review after same-Run UR approval

- observed_at: 2026-10-10, after UR approval presentation 12aa3f85-b4cd-4819-a454-0ff7c260214a at revision 13
- source_ur_digest: sha256:b937eb29e750758c842d8abf42325cf3ada6869198b197247e31a7eefd9b2a1b
- fresh read-only reproduction: both rows of Captured results above reproduced unchanged; full readers still return open OR for lifecycle completed/OR done; first shortened writer model still omits done UX and asks reassessment at PRD. No reference Run was changed.
- fresh source verification: run-recording.js still uses shortened internalSteps; skill-dispatch/service.js still compares the exact CD+Tests sentence; run-steps.js still rejects structured closeout.
- new existing capability: run-revision-boundary.js and revision/history owners implement the separately authorized early UR-at-SD bootstrap. CORE_REVISION_BOOTSTRAP_01.md distinguishes automated Core/CLI/STDIO evidence from product/native evidence.
- installed and loaded MCP: local plugin 0.14.5+codex.local-93b5873338eb; runtime digest 04b79e75931e64d4b2bacca6af48a5e5dec48d52d5b4c0a329e041957c86f65c; provenance matched; doctor pass and source_revisions verified. Earlier digests above remain historical observations.
- approval-command.js already owns operation UUID/payload-conflict receipt checks, Run/Backlog lock, confirmed effect versus current observation and explicit cooperative assurance. App/DocumentView/EmbeddedEntry and cockpit-session supply bound exact reads and display-mode transitions; no native approval/change/reject card completion is evidenced.
- renewed review conclusion: extend existing owners under one design; expose only qualified writes; prevent duplicate decisions across click/text with the same canonical authority; no independent human-origin claim, general cockpit writer or new orchestration state. Product/API details and native qualification remain mandatory later-gate obligations.
