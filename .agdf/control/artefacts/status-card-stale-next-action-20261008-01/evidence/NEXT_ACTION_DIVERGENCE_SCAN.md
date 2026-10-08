# Next-Action Divergence Scan

- run_id: status-card-stale-next-action-20261008-01
- date: 2026-10-08
- source: `packages/core/lib` at HEAD fe02a54a plus the working tree; read-only; no control file written
- method: for every run under `.agdf/control/runs`, compare the persisted `next_allowed_action` and `current_gate` from `readRunState` with `transitionDecisionForRunState`

## All runs

`diverging: 69` of 115 runs have a non-placeholder persisted next action that differs from the evaluated text. Nearly all are `lifecycle: completed` runs with deliberate, hand-authored closeout text. Several completed legacy runs evaluate to a gate other than OR, so always preferring the evaluated text would show implementation steps for closed runs.

## Active runs (lifecycle: active)

Classification: `equal`: persisted equals evaluated; `same-gate-custom`: same gate, run-specific text; `GATE-MOVED`: the persisted gate differs from the evaluated gate.

```text
GATE-MOVED | agdf-cockpit-claude-host-20261008-01 | Brownfield Analysis -> CD+Tests | Run Brownfield Analysis for the approved TP scope before CD+Tests.
active runs: 48
equal | agdf-clean-build-output-repair-20261004-01 | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | agdf-cockpit-mcp-app-20261005-01 | UAT -> UAT | Request exact approval: Approval: UAT before delivery handoff.
equal | agdf-copilot-plugin-integration | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | agdf-cross-host-runtime-integrity | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | agdf-guided-mcp-activation | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | agdf-host-adapter-compatibility | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | agdf-intermediate-status-card-reduction-20261002-01 | QA -> QA | Resolve the QA revise findings, refresh CD+Tests and reviews, then rerun QA. Do 
equal | agdf-mcp-inspect-slice1-20260929-01 | QA -> QA | Run the QA gate, persist the QA report, and request exact approval: Approval: QA
equal | agdf-npm-package-payload-cleanup | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | agdf-physical-package-boundaries-20261001-01 | QA -> QA | Resolve the QA revise findings, refresh CD+Tests and reviews, then rerun QA. Do 
equal | agdf-plugin-family-language | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | agdf-portable-plugin-package-structure-20261001-01 | QA -> QA | Run the QA gate, persist the QA report, and request exact approval: Approval: QA
equal | agdf-product-maturity-roadmap | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | agdf-proportionality-benchmark | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | agdf-public-plugin-distribution | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | agdf-request-activation-boundary | QA -> QA | Resolve the QA revise findings, refresh CD+Tests and reviews, then rerun QA. Do 
equal | agdf-staged-proportionality-observation | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | agent-control-dispatcher-mcp-concept-20261002-01 | QA -> QA | Run the QA gate, persist the QA report, and request exact approval: Approval: QA
equal | approval-card-decision-focus | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | architecture-review-prevention-2026-09-27 | CD+Tests -> CD+Tests | Implement the approved TP scope, run its tests, and record CD+Tests evidence bef
equal | claude-loaded-host-conformance-observation | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | codex-harness-conformance-slice | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | copilot-skill-name-normalization-20261002-01 | UAT -> UAT | Request exact approval: Approval: UAT before delivery handoff.
equal | cross-surface-executable-skill-dispatcher | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | cross-surface-plugin-opt-out | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | cross-surface-skill-target-preflight | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | delivery-path-search-control-input-integrity | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | doctor-presentation-identity-parity | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | github-community-health-governance | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | installation-consent-runtime-checks | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | legacy-profile-upgrade-recovery | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | mcp-routing-guard-20260929-01 | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | opencode-native-dispatch-tool | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | opencode-surface-hardening-parity | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | payload-budget-root-resolution-20261008-01 | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | prd-definition-separation-20261004-01 | QA -> QA | Run the QA gate, persist the QA report, and request exact approval: Approval: QA
equal | pre-decision-status-card-visibility | UR -> UR | Fill the current UR control state, persist the UR draft, and request exact appro
equal | quick-task-closeout-status-20261002-01 | Quick Task Execution -> Quick Task Execution | Proceed as a Quick Task within the Brownfield Review scope and record verificati
equal | repository-control-compatibility-20260930-01 | QA -> QA | Run the QA gate, persist the QA report, and request exact approval: Approval: QA
equal | sd-definition-separation-20261004-01 | CD+Tests -> CD+Tests | Implement the approved TP scope, run its tests, and record CD+Tests evidence bef
equal | status-card-stale-next-action-20261008-01 | Brownfield Review -> Brownfield Review | Run Brownfield Review after G-00 before drafting PRD, or mark Brownfield Review 
equal | ur-definition-separation-20261004-01 | UAT -> UAT | Request exact approval: Approval: UAT before delivery handoff.
same-gate-custom | agdf-actionable-card-ux-20260928-01 | CD+Tests -> CD+Tests | Choose whether AC-006 stays open under this TP or a separate host-provisioning s
same-gate-custom | agdf-intake-continuation-repair | QA -> QA | Execute LIVE_VALIDATION.md after Codex restart, then refresh TP Review and qa-ga
same-gate-custom | agdf-review-remediation-20260929-01 | QA -> QA | Obtain exact candidate Linux/Windows CI and release/host observations, then reru
same-gate-custom | mcp-zielarchitektur-doku-20260929-01 | QA -> QA | Present the persisted QA report and request exact approval: Approval: QA
same-gate-custom | restore-unsealed-active-run-records-20260929-01 | QA -> QA | Resolve the SD-routed approval-provenance design gap and the transaction/platfor
```

## Script

```js
import { readdirSync } from "node:fs"; import { join, resolve } from "node:path"; import { pathToFileURL } from "node:url";
const repo = resolve(process.argv[2]); const lib = (p) => pathToFileURL(join(repo, "packages/core/lib", p)).href;
const { transitionDecisionForRunState } = await import(lib("control-evaluation/gate-policy.js"));
const { readRunState } = await import(lib("control-evaluation/run-state.js"));
const { isPlaceholderValue, extractField } = await import(lib("control-evaluation/shared.js"));
let active = 0;
for (const runId of readdirSync(join(repo, ".agdf/control/runs"))) {
  const s = readRunState(repo, { runId, ignoreRunIdEnv: true });
  const lc = (s.content.match(/^- lifecycle:\s*(.*)$/m)?.[1] ?? "").trim();
  if (lc !== "active") continue; active++;
  const d = transitionDecisionForRunState(s); const p = s.next_allowed_action ?? "";
  const pg = String(s.current_gate).replace(/`/g, "");
  const kind = isPlaceholderValue(p) ? "placeholder" : p === d.next_allowed_action ? "equal" : pg === d.current_gate ? "same-gate-custom" : "GATE-MOVED";
  console.log(`${kind} | ${runId} | ${pg} -> ${d.current_gate} | ${p.slice(0, 80)}`);
}
console.log("active runs:", active);
```
