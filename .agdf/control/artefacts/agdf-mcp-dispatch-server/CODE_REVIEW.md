# Code Review: Cross-Host AGDF Dispatch Through MCP

Status: done
Decision: pass
Revision: 2
Date: 2026-09-06
Run: `agdf-mcp-dispatch-server`
Scope: final product, lifecycle, package, release, documentation and test diff for approved TP Revision 2

## Code Review

- decision: pass
- findings: none open after six review corrections
- correctness: the server structurally validates wire input before target access, delegates semantic value validation to the canonical dispatcher service, verifies exact runtime provenance, serializes canonical output losslessly and isolates one active worker with bounded termination. Lifecycle updates are transactional across runtime reference, host configuration and prior-version retirement. OpenCode and Codex track whether AGDF created their configuration containers so disable can restore the exact absent pre-state without removing pre-existing content.
- security: the reachable server graph exposes one read-only/offline tool, rejects generic model-controlled executable or command input, performs no network or subprocess operation and fails closed for symlinked, special or fake repository/control paths. The local process access boundary is documented without an operating-system sandbox claim.
- regression: exact approval semantics, German PRD/SD/TP and internal post-TP status presentation, CLI Node.js 18 behavior, dispatcher outputs, runtime generation, public Skills-only packaging and existing release checks pass in the complete exact-TP2 aggregate suite.
- compatibility: one SDK v2 server definition negotiates both required MCP generations. Codex configuration is structurally guarded, Claude uses its native lifecycle, and OpenCode selects the tested 1.x or 2.x configuration form by installed major version.
- maintainability: semantic, runtime, worker, package lifecycle and host configuration responsibilities have distinct modules and tests; package and capability metadata use exact versions and fail on drift.
- missing_evidence: none for the approved first-release scope. OpenCode and Codex complete the direct functional lane on macOS x64, and controlled clients independently prove both required protocol generations. Host-selected protocol telemetry is optional under approved TP Revision 2 and is not inferred.
- risks: Claude native read-back parsing depends on the tested CLI output contract; an interrupted best-effort deletion can leave an unreferenced retired runtime directory for later cleanup; Codex 0.145.0 required an explicit model override; OpenCode 2.x, Linux and Windows remain unobserved.
- required_next_step: QA must consume the renewed 18/18 TP coverage, clean-review pass, resolved review findings and complete exact-snapshot validation.

## Review Correction Applied

The first Codex adapter review found that quoted, array, parent-table, subtable and dotted or inline
TOML forms could evade the exact `mcp_servers.agdf` ownership detector. The detector now rejects all
ambiguous forms without mutating the file, and focused lifecycle tests pass after the correction.

The direct OpenCode semantic-failure observation found that the worker parser performed semantic
normalization too early and converted an expected `invalid_input` result into
`dispatch_worker_failed`. The parser now owns only the closed wire shape and target-field pairing;
the canonical dispatcher service owns semantic values and produces the localized result. Contract
and real owned-runtime regressions pass.

The direct OpenCode removal observation found that the host-added `$schema` value left a generated
`opencode.json` shell behind. The owned entry now records whether AGDF created the file. Disable
removes only an empty or exact schema-only generated shell and preserves pre-existing or unrelated
configuration. Fixture and direct lifecycle retries pass.

The first direct Codex removal observation found the same class of restoration defect for an
AGDF-created empty `.codex/config.toml` and directory. The owned Codex marker now records file and
directory origin. Disable removes only those generated empty containers, preserves pre-existing
directories and content, and rolls back a failed transaction safely. Focused and direct retries pass.

Resetting the run to PRD exposed an empty terminal action for ordered approval presentation. The
dispatcher now serializes the existing canonical presentation sequence into `host_action.text`
without creating another renderer or decision owner. PRD, SD and TP terminal regressions pass.

Progressing through the revised gates exposed missing German operational values through QA and one
duplicate lowercase no-action test literal. The canonical locale registry now owns all of those
values, and the control-state test consumes that owner. The first exact-TP2 aggregate run found the
stale literal; the focused tests and complete exact-snapshot rerun pass after correction.

## Normalized Findings

| finding_id | gap_type | routing_target | gap_status | evidence | required_next_step |
|---|---|---|---|---|---|
| MCP-CR-01 | implementation_gap | CD+Tests | resolved | `create-agdf/lib/mcp-lifecycle/host-config.js` rejects ambiguous Codex TOML ownership forms and `npm --prefix create-agdf run test:mcp-lifecycle` passes the added negative cases. | No further code correction is required; retain the regression cases in the aggregate suite. |
| MCP-CR-02 | implementation_gap | CD+Tests | resolved | `create-agdf/lib/skill-dispatch/contract.js` leaves semantic validation to the canonical service; the contract test and `agdf-mcp-server/test/provenance.test.js` prove localized `invalid_input` through the owned worker. | Retain the semantic-failure regression. |
| MCP-CR-03 | implementation_gap | CD+Tests | resolved | `create-agdf/lib/mcp-lifecycle/host-config.js` records generated-file origin and removes only the exact safe shell; fixture tests and direct OpenCode disablement restore the absent pre-state. | Retain origin and pre-existing-file regressions. |
| MCP-CR-04 | implementation_gap | CD+Tests | resolved | The Codex marker records generated file and directory origin; focused tests and direct disablement restore an absent `.codex` pre-state while preserving a pre-existing directory. | Retain Codex absent-directory and pre-existing-directory regressions. |
| MCP-CR-05 | implementation_gap | CD+Tests | resolved | `skill-dispatch/service.js` serializes the existing ordered approval-presentation blocks into a non-empty exact terminal action; dispatcher and interaction regressions cover PRD, SD and TP. | Retain ordered terminal presentation regressions. |
| MCP-CR-06 | implementation_gap | CD+Tests | resolved | `agdf-interaction-locales.json` owns the complete German gate and internal-transition vocabulary, while `control-state-test.js` reads the canonical no-action value. Focused and complete exact-snapshot tests pass. | Retain locale completeness and canonical-owner regressions. |
