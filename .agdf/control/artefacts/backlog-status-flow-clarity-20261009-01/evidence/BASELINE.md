# Implementation baseline

Captured after exact TP approval, before implementation. The eight existing UI source/test changes are the earlier opt-out cockpit refinement. MASTER_BACKLOG and this selected Run already contain approved planning/control changes. BASELINE.patch preserves the tracked increment; BASELINE.json captures exact relevant source and artefact digests plus HEAD and all dirty paths. No implementation test result is claimed.

```
 M .agdf/control/MASTER_BACKLOG.md
 M packages/control-ui/src/BacklogRows.tsx
 M packages/control-ui/src/Overview.tsx
 M packages/control-ui/src/mcp/CompactCockpit.tsx
 M packages/control-ui/src/mcp/style.css
 M packages/control-ui/src/style.css
 M packages/control-ui/test/browser/backlog.spec.mjs
 M packages/control-ui/test/compact.test.tsx
 M packages/control-ui/test/scoped-reading.test.tsx
?? .agdf/control/artefacts/backlog-status-flow-clarity-20261009-01/BROWNFIELD_REVIEW.md
?? .agdf/control/artefacts/backlog-status-flow-clarity-20261009-01/PRD.md
?? .agdf/control/artefacts/backlog-status-flow-clarity-20261009-01/PRD_MAPPING_REV6.json
?? .agdf/control/artefacts/backlog-status-flow-clarity-20261009-01/PRD_RECORDING_REV6.json
?? .agdf/control/artefacts/backlog-status-flow-clarity-20261009-01/SD.md
?? .agdf/control/artefacts/backlog-status-flow-clarity-20261009-01/SD_MAPPING_REV8.json
?? .agdf/control/artefacts/backlog-status-flow-clarity-20261009-01/SD_RECORDING_REV8.json
?? .agdf/control/artefacts/backlog-status-flow-clarity-20261009-01/TP.md
?? .agdf/control/artefacts/backlog-status-flow-clarity-20261009-01/TP_MAPPING_REV10.json
?? .agdf/control/artefacts/backlog-status-flow-clarity-20261009-01/TP_RECORDING_REV10.json
?? .agdf/control/artefacts/backlog-status-flow-clarity-20261009-01/UR.md
?? .agdf/control/artefacts/backlog-status-flow-clarity-20261009-01/UX_INTENT_DEFINITION.md
?? .agdf/control/runs/backlog-status-flow-clarity-20261009-01/RUN_STATE.md
?? .agdf/control/runs/backlog-status-flow-clarity-20261009-01/presentations/26fadde3-dbee-40e3-b6f2-c5dcbf2da63e.json
?? .agdf/control/runs/backlog-status-flow-clarity-20261009-01/presentations/4298eda3-0249-404c-8ebe-2a6db57f8db5.json
?? .agdf/control/runs/backlog-status-flow-clarity-20261009-01/presentations/ab0c90c0-a44a-4181-9d43-2de70847579a.json
?? .agdf/control/runs/backlog-status-flow-clarity-20261009-01/presentations/c46b92d9-ce99-49fe-9f18-6e3da1ba588c.json
```
