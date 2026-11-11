# OR: Status card path marks only one current gate

Run: run-921ef1f8-9792-4392-a2ea-6eb63c50bde6
Report mode: OR-lite

## Result

Compact Delivery (`quick_task`) of the approved UR is implemented in the working tree of branch `fix/status-card-single-current-gate`. `buildBreadcrumbPath` in `packages/core/lib/control-evaluation/gate-check.js` keeps a route entry (`Compact Delivery`, `Verified Change`, `Block`) open while an earlier, unapproved gate of the path is the current gate, so the status card path shows at most one current entry. A new test covers the three routes and the unchanged cases; the companion adapter test now expects `●○ UR` for a quick task at UR. The Copilot payload baseline and the compatibility evidence are updated.

## Evidence

- Approved UR: `.agdf/control/runs/run-921ef1f8-9792-4392-a2ea-6eb63c50bde6/documents/UR.md` (sha256:4cc630c27d20ccbdfe3981456f293f45a1d4b7389afe53704b29015498f419f4).
- Brownfield Review with Mode/Slice `quick_task`: `documents/BROWNFIELD_REVIEW.md`.
- Verification evidence in the evidence folder of this Run: the defect was reproduced with `buildStatusCard` and by the new test before the fix; `status-card-golden-test.js`, `test:companion-run-view`, `test:claude-companion`, `test:control-state`, `test:cli-gates`, `test:interaction-presentation`, `test:control-inspect`, `test:copilot-profile`, `test:package-contents`, `build:prepare`, `compatibility:check` and `check:community-health` pass.
- Code Review `pass` (self-review) with one resolved normalized finding: `documents/CODE_REVIEW.md`.
- Context Graph: no impact (`context_graph_impact: none`, `context_graph_reconciliation: not_applicable`); knowledge persistence `scope_artifact` (the evidence of this Run).

## Risk

- `test:run-command-flow` reports 2 failures of 80 on this Windows host, both `EPERM` on symlink creation in `project-initialization-test.js`; not compared against unchanged `main`.
- The review was a self-review; no independent reviewer.
- No native host run against an installed build.

## Next Step

Commit the change, the tests, the baseline, the re-recorded compatibility evidence and this Run folder on `fix/status-card-single-current-gate` and open the pull request against `main`, as the owner requested on 2026-11-11.
