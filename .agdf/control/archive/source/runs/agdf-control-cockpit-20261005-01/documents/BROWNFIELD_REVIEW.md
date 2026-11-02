# Brownfield Review: Local read-only AGDF control cockpit

Gate: Brownfield Review
Type: Brownfield Review
Mode: post_ur_review
Status: done
Decision: pass

## Run

- run_id: agdf-control-cockpit-20261005-01
- related_ur: .agdf/control/artefacts/agdf-control-cockpit-20261005-01/UR.md
- reviewed_ur_digest: sha256:b90a6fe3005cf0baeb15ac46798df902f5e5909a1256b8e44d6eec5fe0f35388
- reviewed_revision: e2ebb8e0-59e3-49f4-b231-a2cb8a2804ed
- reviewer: Codex
- reviewed_at: 2026-10-05

## Objective

Size and route the approved local read-only React cockpit: run overview, selected-run detail and registered artefact inspection. The approved UR and its original presentation were restored and UR approval recorded through run-approve. This review does not change that source or authorize implementation.

## UI / UX Impact Routing

- delivery_context: brownfield
- ui_ux_impact: medium
- ui_ux_impact_reason: The new bounded inspection capability introduces run selection, three connected reading views, provenance and freshness states, plus visible recovery from failed reads. It remains read-only and introduces no competing approval authority.
- ux_intent_definition_required: yes
- ux_intent_definition_result: ready
- ux_intent_definition_evidence: .agdf/control/artefacts/agdf-control-cockpit-20261005-01/UX_INTENT_DEFINITION.md
- ux_next_owner: prd-definition incorporates the ready analytical input; PRD approval remains separate

## Existing-System View

| Area | Existing owner or artefact | Evidence | Impact |
|---|---|---|---|
| Product semantics | Approved UR; Core gate policy | UR; packages/core/lib/control-evaluation/gate-check.js and gate-policy.js | medium: new presentation capability, unchanged gate and approval rules |
| Source of truth | Canonical per-run files and linked artefacts | packages/core/lib/control-state/run-state-reader.js discovers sorted runs, rejects malformed IDs, missing state and pending transactions; run-state-parser.js parses existing fields | medium: add read projection, keep files and evaluation canonical |
| Runtime path | Core inspection and bounded MCP adapter | packages/core/lib/index.js; control-inspect/service.js invokes existing doctor, gate-check and delivery-map; packages/mcp-server/src/server.js registers those tools | high: existing adapter is stdio, not a browser server; browser access adds a new trust boundary |
| UI / UX | Core interaction renderer and public Astro site | packages/core/lib/interaction-presentation.js; pages/src is the public documentation site; no cockpit React source found in packages | medium: new German reading interface, no reuse claim for a missing cockpit |
| Persistence / data | Run-State, artefact bindings, revision seals | packages/core/lib/control-state/run-seal.js and artefact-bindings.js | none: no schema migration, writes or durable browser storage in this scope |
| Tests / QA | Existing inventory, language, inspection and MCP safety tests | packages/cli/scripts/active-run-inventory-test.js; packages/cli/scripts/artifact-language-test.js; packages/mcp-server/test/safety.test.js and continuation.test.js | medium: reuse fixtures/parity concepts; add browser, snapshot and HTTP-boundary evidence under the approved TP |
| Release / operations | Repository build and separate MCP package | package.json builds projections and npm; packages/mcp-server/package.json has independent packaging; README documents unreleased MCP component | low: local developer startup only, no release, hosting or host installation |

Current coverage is partially_done: canonical parsing, discovery and evaluation exist. A browser-facing service, complete inventory projection including completed/invalid runs, a selected-run document reader and coherent freshness envelope are not exposed as an existing complete cockpit API. doctor --all-active alone cannot satisfy completed-run browsing. Low-level discoverRuns can supply the inventory source; it is not itself a stable browser contract.

## Architecture Impact

- architecture_relevance: relevant
- architecture_impact: high
- architecture_reason: Browser-origin requests must be mediated before access to local repository control files. Existing read checks do not themselves establish an HTTP-origin, session or coherent-snapshot policy.
- architecture_evidence: packages/core/lib/control-read-boundary.js recursively rejects symlinks and special entries under control. packages/core/lib/control-state/contained-file.js validates normalized repository-relative paths and real containment; it is repository-wide and does not alone restrict a browser to registered control documents. control-inspect/service.js owns evaluator reuse; packages/mcp-server/src/server.js is stdio-only.
- architecture_missing_evidence: No implemented browser endpoint or snapshot API exists. Their design and subsequent runtime proof are required downstream; this is an evidenced new-boundary trigger, not an unknown used to default to a deeper mode.
- architecture_next_owner_and_action: SD must assign snapshot and registered-document reading to the Core read owner, HTTP origin/session/path mediation to the local adapter and presentation/navigation to React. TP must test races, containment and zero-write behavior.

## Reuse And Parallel-Structure Risk

| Finding | Evidence | Risk | Required action |
|---|---|---|---|
| problem: governance rule duplication | Existing Core gate-check, doctor, parser and seals already own interpretation | block if introduced | PRD requires evaluator parity; SD keeps browser and HTTP adapter free of governance parsing/policy |
| problem: repository-wide file exposure | containedRegularFile allows any normalized contained repository file; read boundary is a filesystem check, not browser request authorization | block if introduced | Core read owner and HTTP adapter design a registered-resource allowlist and reject traversal, symlink escape and unsolicited browser origins |
| unresolved: consistent freshness boundary | discoverRuns and evaluators independently read mutable files; no transaction snapshot envelope is exposed | revise before SD approval | SD defines capture/revalidation and changed-state behavior; TP injects mutations between inventory/detail/document reads |
| unresolved: safe preview and bounded documents | Existing inspection returns evaluations, not a safe document viewer | revise before SD approval | PRD defines initial supported formats; SD selects inert rendering and size limits; TP verifies active content cannot execute |
| problem: coupling local cockpit into public packaging | Public site, Core generated runtime and independently packaged MCP adapter have different lifecycles | warn | Keep local UI startup isolated; no automatic npm payload or host-install change; SD specifies dependencies and ownership |
| problem: unrelated dirty language-fix scope | git status contains the previous config-language fix, independently authorized with AGDF disabled | warn | Exclude that change from cockpit scope and from any later blanket reset/commit; use exact named run artefacts |

No retained debt is accepted here. Unresolved implementation choices are explicitly assigned to SD/TP and remain approval prerequisites there; they do not prevent sizing because the new browser security boundary is already evidenced.

## Mode / Slice Decision

- decision: structured_delivery
- required_next_gate: PRD
- scope_reason: authority_policy_security_depth: browser access to local control files introduces a new trust/security boundary. structured_slice is rejected because authority_boundary and full_depth_impacts_absent cannot pass. The product remains one bounded read-only outcome; full depth covers the affected boundary rather than adding unrelated release work.
- evidence: This review's Architecture Impact and Structured Depth Evidence; approved UR scope and risks; Core read-boundary and contained-file owners.
- transparency_note: quick_task is ineligible because this is a new user-facing capability and browser security boundary. verified_change is ineligible because there is no single canonical changed owner and the prohibited architecture/security impact exists. No later approval is skipped.

## Structured Depth Evidence

- depth_policy_version: 1
- depth_facts_status: complete
- primary_reason_code: authority_policy_security_depth
- decisive_full_depth_triggers: authority/policy/security: new browser-to-local-files trust boundary
- rejected_alternative: structured_slice; authority_boundary and full_depth_impacts_absent fail for the evidenced new security boundary
- missing_or_conflicting_facts: none decisive for depth selection; snapshot and safe-rendering mechanisms remain named SD decisions
- depth_evidence_refs: UR.md; packages/core/lib/control-read-boundary.js; packages/core/lib/control-state/contained-file.js; packages/core/lib/control-inspect/service.js; packages/mcp-server/src/server.js

| check_id | result | evidence |
|---|---|---|
| coherent_outcome | pass | UR defines one local read-only three-view inspection journey |
| authority_boundary | fail | A browser becomes a new consumer of local filesystem control data; stdio and filesystem guards do not define its trust policy |
| owner_consumer_coordination | pass | Core owns reads/evaluation; new local adapter owns request mediation; React owns view interaction; no shared external cutover |
| full_depth_impacts_absent | fail | Browser security boundary is full-depth relevant even with unchanged governance policy |
| migration_propagation_bounded | pass | Read-only operation, existing file formats, no persistent schema migration or host install |
| failure_recovery_local | pass | Local reading service may stop/restart or reload; no remote state or irreversible write is required |
| independently_acceptable | pass | All three reading journeys have independent UR acceptance without future editing/MCP embedding |

## PRD / SD Open Questions

| Question | Required gate | Impact |
|---|---|---|
| Which initial formats, visible provenance, freshness and degraded states make the three reading journeys complete? | PRD; prd-definition informed by UX Intent | revise until specified |
| How are target binding, browser-origin/session trust, document allowlisting and bounded resource use enforced? | SD; local adapter and Core read owners | block until designed before implementation |
| How do inventory, evaluator result and document content share a provable data version during concurrent writes? | SD; Core read owner | revise until designed |
| Which deterministic tests and real browser observations prove zero writes, evaluator parity and recovery? | TP; implementation/test owner | revise until planned |

## Context Graph Impact

- context_graph_impact: none
- context_graph_refs: none
- context_graph_reconciliation: not_applicable
- context_graph_required_action: none
- context_graph_gate_effect: none
- context_graph_evidence: This is run-specific pre-design evidence; it does not declare a new reusable architecture node or alter existing source-of-truth ownership. Reassess at SD/OR if an implemented reusable Core read capability is introduced.
- memory_target: scope_artifact
- memory_reason: Preserve owner evidence and depth rationale with this run.
- memory_refs: BROWNFIELD_REVIEW.md

## Next Permissible Step

- next_allowed_action: Complete UX Intent Definition, then draft PRD under prd-definition and obtain its separate deliberate approval.
- forbidden_until_then: SD, TP, implementation, approval writes through the cockpit, release or host installation.

## Quality Outlook

- quality_outlook: Design the browser security and freshness boundaries before implementation. Verify the complete product journeys and existing evaluator parity under the future approved TP; this review is source evidence, not live browser proof.
