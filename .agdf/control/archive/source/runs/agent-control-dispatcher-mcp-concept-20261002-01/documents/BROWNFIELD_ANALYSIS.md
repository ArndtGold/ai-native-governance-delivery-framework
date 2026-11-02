# Brownfield Analysis: Joint Coding-Agent Control Concept

- mode: pre_implementation_analysis
- decision: pass
- run_id: agent-control-dispatcher-mcp-concept-20261002-01
- reviewed_at: 2026-10-02
- reviewer: authoring coding agent; no independent review claim
- approved_scope: TP.md T-001 through T-010; concept production and verification only
- baseline_commit: a6ba40c64a77bbb490519e978a5a30cd73be2d1a
- baseline_worktree: git status --short showed only modified .agdf/control/MASTER_BACKLOG.md and this run's untracked artefact/run directories; no runtime or unrelated source changes were present

## Existing Owners And Reuse

| Boundary | Existing owner / evidence | Reuse decision |
|---|---|---|
| Rules and permitted work | packages/core/lib/control-evaluation/; gate/modes contracts | Explain the existing authority; propose mediation as a dependent boundary, not a replacement evaluator |
| Dispatcher | packages/core/lib/skill-dispatch/; docs/architecture/dispatcher.md | Reuse routing and bounded continuation; distinguish them from tool interception |
| State, presentation and approval | packages/core/lib/control-state/run-presentation.js; gate-approval-validator.js; run-recording.js | Use existing writer and binding semantics; explicitly preserve cooperative provenance limits |
| Idempotent approval commands | packages/core/lib/control-state/approval-command.js and approval-command-contract.js | Source already contains receipt/operation identity, payload conflict, lock and recovery handling; the concept must not incorrectly describe all idempotency as future work |
| Display semantics | packages/core/lib/interaction-presentation.js; interaction.md | Common projection remains authoritative; host rendering changes only presentation |
| MCP transport | packages/mcp-server/src/server.js; packages/cli/lib/mcp-dispatch-runtime.js | Current tools-only projection is baseline; no new schema or write exposure in this run |
| Quality / review | Existing review skills and quality.md | Review actual concept and document diff; disclose producer and independence |
| Host capabilities | Official MCP, OpenAI and Claude documentation fetched on 2026-10-02 | Product/protocol documentation is evidence of documented capabilities, not installed/live AGDF support |

## Interfaces, Data And Compatibility

No executable interface, persistence schema, package, installation or host setting is changed. Approved UR, PRD, SD and TP remain immutable scope sources. New concept, verification and review artefacts are isolated under this run's directory. Canonical bookkeeping uses revision-bound writers and explicit chain links.

The concept describes proposed action envelopes and MCP operation families, not production schemas. Existing current idempotent approval-command behavior must be differentiated from proposed general execution idempotency. Existing presentation preparation proves preparation rather than human visibility. Current gate approval remains cooperative_local; independently attested human input is not established.

## Regression And Parallel-Structure Risks

- Document claims could overstate host capabilities: require dated primary sources and separate documented/installed/live/unsupported/unknown classes.
- A proposed control catalogue could become a second policy authority: keep it a concept proposal; PRD owns acceptance, current contracts own runtime behavior.
- Diagrammed mediation could be mistaken for installed prevention: label proposed boundaries and unmanaged action paths explicitly.
- Concept review could fabricate code-review or independent assurance: inspect actual document diff, state no executable changes, and disclose same-agent review. CR completion records the performed document/change review, not a claim that runtime code was reviewed.
- All tasks are mandatory concept tasks; TP defines no P0/P1 prioritization. Later QA must assess all tasks conservatively rather than invent a priority scheme.

## Minimal Safe Production Path

Create the single indexed CONCEPT.md, fill control/operation/host matrices and thirteen substantive walkthroughs, reconcile related scopes, derive the roadmap, and verify all criteria/decisions/UR signals. Perform structural and semantic checks; record CD_TESTS.md and actual diff. Then use the existing review and QA routes. No installation, runtime test harness, external write or subagent is needed for this document scope.

## Evidence And Limits

- evidence: approved TP/SD; live git baseline; source reads of approval-command.js and canonical owners; fetched official documentation references
- missing_evidence: no live native-form/event/interception qualification or independent human attestation; these remain explicit concept limits with later evidence obligations
- context_graph_impact: none at preparation; reusable findings remain run-scoped until concept closeout reconciliation
- context_graph_reconciliation: not_applicable
- memory_target: scope_artifact
- required_next_step: Record this passed internal step, re-evaluate the same run, then produce the approved concept within its bounded scope.
