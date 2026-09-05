# Brownfield Analysis: Host Adapter Compatibility

- mode: pre_implementation_analysis
- decision: pass
- mode_slice_decision: structured_slice
- required_next_gate: none
- date: 2026-09-05
- scope: Approved TP Revision 1, T01 through T12, HAC-01 through HAC-12.
- authority: Exact TP approval revalidated for run agdf-host-adapter-compatibility and revision identity d2803cf5-c221-4243-9ced-71a24f88dcad. Installed AGDF 0.14.5 is owned_version_matched with matched provenance; selected-run doctor passes.
- required_next_step: Establish the existing regression baseline and shared fixture oracle, then implement the approved private extractions and repository evidence tooling.

## Existing Coverage and Reuse

| Owner / observed evidence | Current coverage | Strategy and implementation boundary |
|---|---|---|
| `create-agdf/lib/installers/plugin-installers.js` | partially_done: three native installation paths, explicit ordered rollback, list parsing and native commands currently mixed | refactor into the approved host leaves; retain exports/defaults and phase/error/result fields. Shared command capture and filesystem rollback remain mechanical helpers. |
| `installers/local-marketplace.js`, `runtime/plugin-provenance.js`, `lib/fs-swap.js` | fully_done for shared staging, ownership, content identity and transaction primitives | reuse unchanged algorithms. Move only pure Codex registration identity and host envelope projection to host leaves, retaining current classification authority. |
| Existing Copilot Git transport/settings/discovery and Claude cache recovery | fully_done mechanisms with independent test entry points | reuse directly, including prior enablement restoration after reinstall and bounded Claude retry. Do not add a universal recovery layer. |
| `runtime-check-consent/{contract,coordinator,state,service,adapters,claude-settings}.js` | partially_done: central decision/hash/receipt owners exist, native projections mixed | refactor native rules, commands and execution only. Preserve Claude configuration before receipt write and rollback on receipt failure. Keep shared consent state/result meanings. |
| `lifecycle/{operations,status,result,presentation}.js` and existing OpenCode installer | partially_done: common plans/status policy coexist with native parsing and ownership details | delegate native mechanics; retain public plan application, selection/precedence, local delivery status and result envelope owners. Existing OpenCode owned-file helpers remain in its installer. |
| Dispatcher service/contract/binding, target resolution, control evaluator and interaction renderer | fully_done central authority, independently tested | reuse without changing protocol 1, binding 2, target/gate/terminal meanings or interaction rules. Common tests compare these results through all four bindings. |
| `scripts/sync-plugin-runtime.js` and package manifest | fully_done explicit runtime allowlist and package profile boundary | extend allowlist only for four pure session-command leaves and needed pure formatter. Validate in an isolated generated directory; npm already includes lib and excludes scripts/evals/docs reporting. |
| Existing installer/lifecycle/consent/dispatch tests | partially_done: substantial focused regression coverage, no single common lifecycle oracle | extract reusable stimulus fixtures and retain independent assertions. Copilot local Git fixture uses a synthetic host; it is not live evidence. |
| Repository evidence/report path | not_done | new bounded internal contract/evaluator/runner/renderer as approved. Historical source formats are imported explicitly and kept intact. No installed-runtime dependency or additional capability authority. |
| INSTALL, de/en troubleshooting, Pages proof links, community-health check | partially_done existing documentation entry points | extend links and read-only report checking. Preserve seven-chapter handbook structure and current site components. |

Paths without a repository prefix in this table are relative to `create-agdf/lib/`, except scripts,
which are relative to `create-agdf/`. Runtime and reporting source sets remain explicit in the SD.

## Compatibility Findings

- Codex content-derived registration, native refresh order and Claude same-version reinstall are
  existing required behavior. Their removal would change the approved product boundary.
- `inspectPluginSurface` defaults an unrecognized surface to a Codex executable while retaining the
  supplied surface in the result. Preserve that existing entry-point behavior during extraction.
- `prospectiveRuntimeCheckIdentity` currently uses `generated/plugins/agdf` for non-OpenCode hosts.
  Preserve that source-root behavior in this refactor. Any correction requires its own evidenced scope.
- OpenCode automatic execution has a module-relative default package root. Moving its code must keep
  the same resolved root and injected status resolver; the leaf must not import the service facade.
- Claude settings currently imports permission rules through adapters. Point it directly at the pure
  Claude leaf to avoid a cycle when native runtime-check configuration moves behind that leaf.
- Installed-runtime command leaves cannot import installer, receipt, CLI application or report code.
  Source imports alone do not prove that the generated runtime is complete.
- Existing `healthy` installation status and hook trust must not become compatibility support claims.
  The repository report evaluates separate outcomes with exact identity and evidence-lane boundaries.

## Regression and Side-effect Preparation

Node v22.22.3 and npm 11.12.1 are locally available. The planned existing test scripts are present.
Inspected tests use temporary roots and injected executors; Copilot uses real local Git for fixture
transport. Capture baseline results before moving mechanisms. Test failures remain failures until
resolved and must not be hidden by the refactor. No product-test pass is claimed by this analysis.

The existing unrelated untracked asset remains outside scope. No host/cache installation, native
permission change, dependency upgrade, version bump, commit, push or deployment is authorized here.
Tests use isolated destinations; the report check never repairs or executes a host.

## Risks, Missing Evidence and Minimal Path

The decisive risks are exceptional effect-order regression, duplicate owners, generated import drift
and false promotion of evidence. The TP assigns baseline and negative-sensitive checks to each.
No unresolved product decision or second authority is needed to implement the approved design.
Native host/OS coverage is not yet observed and stays unverified; that gap blocks live support claims,
not work on the deterministic adapter contract and accurate report.

Minimal path: preserve the existing public entry points, extract one implementation of each native
mechanism, reuse existing transactions and fixtures, then add the repository-only evaluation path.
If a frozen contract cannot be preserved, stop the affected work and revise its governing design.

Context Graph impact remains link_only to CG-CREATE-AGDF-CLI-COMPOSITION,
CG-EXECUTABLE-SKILL-DISPATCH-AUTHORITY and CG-NATIVE-INTERACTION-AUTHORITY. The current graph and quality
contract confirm those owners. Actual reusable ownership links may be updated after implementation;
this preparation analysis does not claim implemented architecture or completed QA.
