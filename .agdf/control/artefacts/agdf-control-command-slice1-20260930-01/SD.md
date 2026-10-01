# SD: One Explicit Approval-Recording Command

Status: draft
Gate: SD
Gate approval: open
Based on: Approved PRD.md
Date: 2026-09-30
Owner: Arndt Gold
Traceability contract: criteria-chain-v1

## 1. Solution Overview

Expose one versioned local command, `record_gate_approval`, through the existing `run-approve` CLI and an exported programmatic function. Both consumers call the same approval application service in `create-agdf/lib/control-state/run-recording.js`. Existing gate policy, reply validation, presentation validation and Run writing remain authoritative. This is a bounded refactoring of the existing approval operation, not a generic control-state mutation API.

For the explicit command lane, a caller supplies a stable operation UUID before its first submission. The service commits the approval and its operation receipt together in one atomic replacement of `RUN_STATE.md`, under the existing owned Run lock. A receipt identifies a historical committed effect; it never grants new execution permission or proves that a human saw the presentation. Repeating the same operation and payload returns that receipt without another revision. The current Run decision is reported separately and can have progressed, been revised or been recovered since the original effect.

The existing invocation without an operation UUID remains supported, delegates to the same service and preserves its legacy result and rejection semantics. The new replay contract is explicit and is not retroactively inferred for historical approvals. MCP remains an existing read-only observer.

The local API is a documented package subpath, `create-agdf/control-command`, backed by a thin facade and runtime-owned composition. Establish this module/package boundary inside the existing package now. Extracting a separate npm runtime package, changing package names or introducing independently released packages is a later scope, not a prerequisite or hidden task in this slice. This refinement realizes the approved CLI/local-consumer contract and package evidence in AC-001, AC-008 and AC-009; it does not change PRD acceptance or authority.

## 2. Ownership And Source Of Truth

| Responsibility | Existing authoritative owner | Design treatment |
|---|---|---|
| Gate eligibility and next permitted action | `create-agdf/lib/control-evaluation/gate-policy.js` and existing `evaluateGateCheck` composition | Reuse current policy; an adapter cannot decide eligibility from strings or cached cards. |
| Exact reply and current presentation binding | `create-agdf/lib/control-state/gate-approval-validator.js`, `run-presentation.js` | Reuse validation for a new effect and recheck immediately before commit. A prepared presentation proves a prepared binding, not human visibility. |
| Approval application service | `create-agdf/lib/control-state/run-recording.js` | Own the typed command, request identity, replay/conflict decision and approval candidate. Extract reusable internal helpers from `approveRunGate`; no second policy implementation. |
| Current Run, historical operation receipts and integrity | The selected canonical `RUN_STATE.md`; existing `run-state-parser.js` and `run-seal.js` | Add an optional versioned receipt section in this same file. Approval rows remain the authority for current effective approval. Receipts are retained historical facts, protected with the approval seal. |
| Lock, revision and atomic persistence | `create-agdf/lib/control-state/run-state-writer.js` | Hold `withRunLock` over lookup, decision and commit; use `writeRunLocked` once with a preselected next revision UUID. Preserve the existing ownership and stale-lock rules. |
| CLI parsing and result projection | `create-agdf/lib/cli/parse-args.js`, `command-registry.js`, `validation-handlers.js` | Add an explicit operation option; pass input to the service and project its result. Do not interpret human identity or write Run sections. |
| Public programmatic contract | `create-agdf/package.json` exports; thin facade `create-agdf/lib/control-command.js` over the existing approval-service owner | Add only `./control-command`; preserve every existing export. Consumers use the package subpath, not internal files. The facade owns no gate policy or receipt writes. |
| Shared runtime composition | Runtime owner: `create-agdf/lib/runtime/control-command-service.js`; canonical approval service remains `run-recording.js` | Compose the existing evaluator/observation provider and approval service once for both consumers. No caller-supplied authorization callback in the public command contract. |
| Shared runtime configuration and locale resources | Existing metadata/locale sources in `plugin/meta/`; shared loader `create-agdf/lib/runtime/control-context.js`; existing asset synchronization | Move shared reads/configured-language resolution out of CLI ownership while preserving their validation and resource paths. CLI context re-exports existing names; evaluators/rendering depend on shared runtime context. No second configuration register. |
| MCP observation, generated assets and evidence qualification | Existing AGDF inspect/dispatch services and package synchronization owners | No mutating MCP registration; propagate source through normal build/package synchronization only. Installation/publication remain outside this Run. |

## 3. Architecture Decisions

- SDD-001: Introduce only `record_gate_approval` as a versioned command over the existing approval application service; rationale: both consumers need identical eligibility and mutation behavior without a broad kernel rewrite; consequence: CLI and programmatic callers share one implementation, while unrelated control operations remain outside the public command contract.
- SDD-002: Bind the explicit command to canonical target, Run, gate, expected revision, presentation, exact reply, stable operation UUID and `cooperative_local` assurance; rationale: an actor label or successful tool call cannot establish independent human authority; consequence: stronger assurance requests and undeclared authority fields are rejected before mutation, and every result states the cooperative ceiling.
- SDD-003: Store an append-only operation receipt in the same canonical Run file as its approval, with one preselected resulting revision; rationale: a sidecar receipt can disagree with an already committed approval after interruption; consequence: one atomic Run replacement is the logical commit and the receipt is protected as approval evidence, with no separate authoritative ledger.
- SDD-004: Decide replay before current-gate freshness, after validating the canonical state and receipt integrity; rationale: a completed request must remain recognizable after its original gate has advanced; consequence: exact identity plus payload returns the original effect, changed payload conflicts, and a fresh request still needs all current prerequisites.
- SDD-005: Keep the owned Run lock from canonical read through policy/presentation revalidation and atomic write; rationale: independent consumers must not both commit from one pre-transition snapshot; consequence: a held lock yields a safe retry result, identical competitors converge on the receipt and distinct competitors cannot overwrite the winner.
- SDD-006: Resolve write exceptions and interruptions against the canonical destination; rationale: rename may have committed before a later flush or response fails; consequence: absent valid receipt permits safe same-request retry, a valid matching receipt identifies one committed effect, and unresolvable integrity/durability state requires recovery rather than guessed success.
- SDD-007: Preserve legacy inputs/results and legacy seals when no receipt section exists; rationale: historical Runs and supported consumers must retain their meaning; consequence: replay is opt-in, new receipt-bearing Runs require a receipt-aware runtime, and normal updates/revisions/recovery must preserve receipts without treating them as effective approval.
- SDD-008: Return original effect, current observation, assurance and evidence availability as distinct fields; rationale: a historical success, current permission and visible human-host proof are different facts; consequence: consumers can display a useful next step without upgrading an unavailable observation or asserting an unmeasured workflow improvement.
- SDD-009: Publish the local command through the additive ESM subpath `create-agdf/control-command` and a thin facade inside the current package; rationale: a programmatic consumer needs a stable supported import rather than private-file coupling; consequence: existing exports and package names remain unchanged, while separate npm package extraction and independent release/version management are deferred.
- SDD-010: Make runtime composition and shared configuration independent of CLI parsing, installers and MCP initialization; rationale: the existing evaluator/rendering path imports cli/runtime-context.js and needs a real dependency boundary before later package extraction; consequence: narrowly move shared context to runtime ownership, enforce dependency direction, and reuse identical policy/observation wiring for CLI and API without a second source of truth.
- SDD-011: Qualify the public API by executing an external consumer against the actual packed-and-extracted package and by checking its transitive dependency/resource closure; rationale: repository imports and package file lists do not prove the delivered API works; consequence: TP must cover hermetic packed CLI/API behavior, missing resources, inert import and generated runtime propagation, with no install or publication action.

## 4. Integration Points

### 4.1 Command and result contracts

The public synchronous function is `recordGateApprovalCommand(root, command)`, imported from `create-agdf/control-command`; its composition uses the existing runtime's policy service internally. Its result is the structured command result defined below. Expected input/state/IO failures become typed non-success results where the state is knowable; unknown/unresolvable state becomes recovery-required, never successful approval. The API does not print results, set process exit state or run a CLI parser. The CLI supplies `root` from its normal target resolution; a local caller must supply an explicit root. Canonicalize it using the existing target/containment utilities, including realpath resolution, before binding identity. A working directory is not authority.

The same subpath exports the read-only `resolveControlCommandTarget(root)` helper to obtain the canonical root/target_id and `CONTROL_COMMAND_SCHEMA_VERSION` with value `1`. The helper selects no Run, creates no presentation and grants no permission; consumers need not duplicate hashing/path rules. These are the complete initial public exports, with documented input/result schemas and version semantics. Internal schema validation and service helpers are not additional supported APIs. No TypeScript build or new type-package dependency is required by this slice.

| Input field | Rule |
|---|---|
| `schema_version` | Exact command contract version `1`; reject unsupported versions and unknown fields. |
| `action` | Exact `record_gate_approval`; reject arbitrary action/state-write requests. |
| `target_id` | Hash of a domain-separated canonical local target path; service recomputes and compares. This is a local binding, not a portable identity or authorization token. |
| `run_id`, `gate` | Explicit selected Run and an existing supported approval gate; no automatic Run selection. |
| `expected_revision_id`, `presentation_id` | UUIDs of the current evaluated Run and prepared presentation for a new effect. |
| `response` | Caller-forwarded verbatim deliberate reply, subject to the existing exact-formula validator; its bytes also participate in request identity. |
| `operation_id` | Caller-generated UUID retained across retries; no server-generated replacement on retry. |
| `assurance` | Exact `cooperative_local`; any independent-human-verification claim is unsupported and rejected. |

Compute `request_digest` over a fixed-order, domain-separated UTF-8 JSON representation of all command fields except `operation_id`; the UUID plus digest identifies the logical request. Do not normalize reply text differently from existing validation, and do not omit its bytes from identity. Audit timestamps and producer/runtime observations are generated by the service and excluded from request identity, so a later retry is not changed by the clock or runtime path. No arbitrary actor, origin, role, proof or signature field is accepted as assurance evidence.

Add `--operation <uuid>` and `--assurance cooperative_local` to `run-approve`. The operation option selects the explicit command lane; assurance defaults visibly to `cooperative_local` if omitted. Assurance options, including unsupported stronger values, are validated even without the operation option and cannot silently select a weaker legacy lane. Existing required Run/gate/revision/presentation/response inputs remain. The CLI constructs the same typed command as a programmatic caller and uses the canonical result; it does not build receipts.

Explicit command results use the following common shape. Field names are binding design commitments; textual error messages may remain owned by existing localization.

| Result field | Meaning |
|---|---|
| `schema_version`, `action`, `operation_id`, `request_digest`, `binding` | Contract identity and original target/Run/gate/revision/presentation binding, when input is valid enough to establish it. |
| `outcome`, `reason` | `accepted`, `already_applied`, `rejected`, `retryable_failure` or `recovery_required`; rejection reasons distinguish stale binding, conflicting identity/state, unsupported authority and unmet prerequisites. |
| `effect` | Present only for a verified committed receipt: original previous/resulting revision IDs, resulting numeric revision, approved gate, artefact/presentation digests and the original next transition. A replay retains this original value. |
| `current` | Separate fresh observed revision, effective gate approval status, gate and permitted next action, or explicit unavailable fields and reasons. Never copy the original next action into a claim about the current Run. |
| `assurance` | Lane `cooperative_local`, caller-forwarded reply provenance and `independent_human_proof: unavailable`; no accepted result reports independently verified human authority. |
| `observations`, `recovery` | Available/missing observations with their producer and evidence class, and a canonical safe next action. No guessed host, model or user identity. |

Only accepted/already-applied command outcomes are successful CLI exits. Retryable, rejected and recovery-required outcomes remain non-successful and distinguishable in JSON. The legacy wrapper keeps existing schema/version, `outcome: approved` and existing fields/reasons, with an additive assurance description; it does not acquire historical receipts or implicit replay semantics.

### 4.2 Receipt representation and integrity

Add optional `## Approval Operations` with explicit version `1` and a table containing `operation_id`, `request_digest` and `receipt`. The receipt cell is base64url of canonical UTF-8 JSON, avoiding Markdown delimiter ambiguity. The decoded schema is closed and contains the original command binding/digest, cooperative assurance, full validated artefact/presentation digests, audit time, producer contract version and original `effect`. The exact reply participates in the digest; do not persist an expanded conversation or pretend the receipt is a human-signed message.

The service preselects the next revision UUID, constructs both approval and receipt, and passes that UUID into the existing writer. Receipt `effect` must name that exact next revision and numeric increment. The parser rejects duplicate operation IDs, malformed encoding/schema, inconsistent row/receipt identity, unsupported section versions and incomplete effect records. A receipt never substitutes for a missing current approval row.

Retain the current approval-seal algorithm byte-for-byte for Runs with no receipt section. For a version-1 section, use a domain-separated version-2 approval-seal computation over the existing approval record plus canonical parsed operation receipts. This extends the existing approval-evidence protection rather than adding a second seal/ledger. A malformed or duplicate receipt section is invalid, not an empty legacy section. Content seals continue to cover the entire Run and listed artefacts.

Ordinary `run-update` cannot add, edit or delete receipt evidence because that changes the protected approval seal. Approval recording may only append a validated new receipt; every other approval-changing writer path must explicitly preserve the receipt set. Revision/supersession and supported recovery can clear current approval but retain historical receipts unchanged. A receipt-aware recovery must never reseal malformed/unverifiable receipts into trusted effect evidence; it reports recovery-required and does not extend the historical provenance-repair scope.

An old runtime will not validate the new approval seal; that is a declared compatibility limit, not a silent migration. Source, generated package and execution paths must be version-matched before the new lane is qualified. No existing Run is migrated simply by inspection or by drafting these artefacts. Seals and local file containment remain cooperative integrity checks and do not resist an actor deliberately rewriting files and their seals.

### 4.3 Decision and commit sequence

1. Validate command schema, action, requested assurance and explicit target/Run binding. Reject unsupported authority before any Run mutation. Resolve only the selected contained Run path.
2. Acquire the existing owned Run lock. Re-read canonical state; check parsing, seal, Run/path identity, supported receipt version and pending Run-step transaction. Unknown lock ownership remains blocked; reclaim only an owner proven dead under the existing protocol.
3. Look up `operation_id`. A valid receipt with the same request digest returns `already_applied` and its original effect, plus a fresh current observation. A different digest returns identity conflict. Replay is a historical acknowledgement and never reapplies a revoked approval or bypasses a pending recovery condition.
4. With no receipt, evaluate the current gate via the existing evaluator, exact reply validator and presentation validator against the locked snapshot. Reject stale/mismatched bindings and unmet prerequisites without revision/evidence changes. An earlier legacy approval without a receipt cannot be adopted as this operation's historical success.
5. Construct the existing approval/artefact/control-row changes through the shared helpers. Derive the original next action from existing gate policy. Preselect the next revision UUID, append its receipt and revalidate the same presentation, artefact digests and expected Run bytes immediately before `writeRunLocked`.
6. Commit once using the existing temporary-file flush, atomic replacement and supported directory flush. Approval and receipt have one logical commit point. Verify/read the canonical destination when an exception can occur after replacement; never infer that an exception means no effect.
7. Return the canonical effect and current observation. Consumer rendering/response failure cannot roll back the effect. A later exact retry needs no new presentation or human decision; a material new request does.

The lock covers cooperating Run writers, not arbitrary artefact/shell writers. The final presentation/digest check detects observable changes immediately before commit; it is not a filesystem transaction over every referenced artefact. A subsequent external content change invalidates the Run seal and must not become a claim of current approval readiness. This design does not expand the approved guarantee into prevention of arbitrary filesystem writes.

### 4.4 Failure and recovery rules

| Observed boundary | Canonical result and safe action |
|---|---|
| Lock held by a live or unverified owner | Retryable lock result with no effect claim; retry the same operation. Do not delete another owner's lock. |
| Failure before replacement; valid unchanged Run, no receipt | Retryable failure; preserve original operation UUID and payload. Temporary files are not receipts. |
| Replacement completed; matching receipt and valid authoritative state | Return/acknowledge that one original committed effect. Lost consumer response produces `already_applied` on retry. |
| Post-replacement flush fails | Report observed commit plus recovery-required without a fully successful acknowledgement; retry checks the destination and completes/verifies the supported flush through the canonical writer, with no new approval/revision. Continued uncertainty stays recovery-required. |
| Process killed after replacement and before reply | New process uses existing abandoned-lock recovery, validates the receipt and acknowledges the original effect. No response cache or journal is required. |
| Different operation from the original pre-transition revision wins first | No receipt for the losing identity; current revision/gate mismatch is a conflict with current-state guidance, never a second approval. |
| Existing receipt identity is reused with changed payload | Identity conflict without mutation, even if the new payload would otherwise be eligible. |
| State/receipt is malformed, seal invalid, or pending transaction unresolved | Recovery-required with named owner/path; never reconstruct success from presentation files, a temporary file, a caller assertion or an earlier approval row. |
| Later valid progress, supersession or recovery reset | Exact receipt replay reports the historical effect and current effective status separately. A revoked approval stays revoked. |

The selected guarantee covers process interruption and the tested filesystem/flush behavior. It does not promise hardware power-loss durability or network-filesystem semantics. Windows directory-flush behavior is qualified separately; unavailable native evidence must remain unqualified.

### 4.5 Module and package boundary

Add `"./control-command": "./lib/control-command.js"` to the current `create-agdf` exports map. Keep the existing root OpenCode export, CLI entry, MCP runtime export and package dependencies intact. The facade declares the public entry and delegates; `lib/runtime/control-command-service.js` owns production composition; `lib/control-state/run-recording.js` remains the single approval application service. Internal consumers use relative imports to that same facade/composition, while external consumers use the package export. Neither route may assemble its own evaluator or request a generic set-state capability.

The permitted dependency direction for the selected command's transitive import graph is:

`CLI adapter or public facade -> shared runtime composition -> existing approval service and evaluators -> policy, validators, readers, writer and shared runtime context`.

Application/evaluator modules in this closure must not import CLI parsing/handlers/application, installers, install-setup, host installation/lifecycle services or MCP server/bootstrap modules. The command does not require those systems to initialize. Existing pure policy/parser/validator functions retain their current responsibilities; this design does not claim the filesystem writer or full evaluator is pure.

The inspected coupling is concrete: `control-evaluation/gate-check.js`, `control-evaluation/delivery-map.js` and `control-state/run-presentation-render.js` currently import shared locale/configured-language values from `cli/runtime-context.js`. Move only the shared package context, metadata/locale reads and configured-language resolution plus necessary helpers to `lib/runtime/control-context.js`. Re-export existing CLI-facing names for compatibility; update the touched evaluator/rendering imports to the shared owner. CLI argument preferences and CLI orchestration remain in their adapter. Preserve canonical `plugin/meta/agdf-plugin.definition.json` and `plugin/meta/agdf-interaction-locales.json` as resource sources; the existing sync pipeline owns their version-matched generated projections. No manually maintained duplicate manifests, locales or policy registry.

For both explicit consumers, production composition uses the same existing gate evaluator and read-only local Git-observation provider. Moving the wiring out of CLI ownership must not silently change prerequisite checks or Git availability semantics. Public callers cannot inject callbacks that accept a gate or bypass observations. Private fault-injection harnesses may exercise the same service boundaries without becoming part of the published contract. MCP keeps its existing read-only composition and declared observation limits.

Importing the public subpath must not inspect a user target, choose a Run, mutate files, spawn children, start a host/server, print to stdout/stderr or call process.exit/set exitCode. Bounded reads of declared package-owned resources are allowed; missing or incompatible resources must be diagnosable and never become a weaker acceptance policy. Invocation may perform the existing bounded target/Run reads and read-only Git observation and may commit only the selected approval/receipt transition.

### 4.6 Resource closure and distribution qualification

The package must include the facade, composition, shared context, transitive code dependencies and the required metadata, locale and contract resources already owned by the current pipeline. Resolve those resources relative to the executing package module, not cwd, the original checkout, user plugin caches or an independently installed host. Existing generated paths may be retained where correctly package-local and version-matched; this slice does not create a second generated runtime-resource tree solely to obtain a new directory name.

Extend the existing package/runtime synchronization and content/build test owners. The selected API's module/resource closure is also included wherever the generated local validator uses the shared command service; explicitly register new runtime modules in the existing `sync-plugin-runtime.js` entry inventory and preserve runtime-manifest digest/version checks. Do not ship the full installer/MCP bootstrap closure merely to satisfy a missing import in the local command. Canonical source and generated copies have one-way derivation; generated files are not edited as independent source.

An executable qualification fixture must build and pack an isolated source snapshot, extract the actual tarball into a disposable external consumer's node_modules, and import `create-agdf/control-command` by package name. Disable original-repository resolution and execute from an unrelated cwd. Use a fresh bound fixture Run outside the source snapshot, with presentation prepared by that same packed runtime. Compare packed CLI and API semantic results on equivalent fixtures, execute response-loss replay against the same canonical Run, and assert the declared assurance and no duplicate revision. No registry fetch, global install, plugin installation or publication is required.

Check import effects and transitive module dependencies, not only textual export presence. Remove one required package resource in a separate extracted fixture and require a diagnosable failure with no target mutation; missing data must not fall back to the developer checkout or host cache. Validate existing exports and legacy packed CLI behavior remain functional. Generated local-validator execution is a separate propagation check; it does not substitute for the public npm entry test or establish installed/live-host behavior.

## 5. Constraints And Compatibility

The approved exact formulas, earliest-gate routing, gate-specific artefact rules (including QA and UAT), prepared presentation and stale-revision checks remain in their existing owners. Read/status operations keep their existing non-mutating semantics; presentation bookkeeping creates no approval and adds no routine human gate.

Legacy `run-approve` inputs/results and historical receipt-free seals remain supported. The explicit operation lane is additive, requires a version-matched runtime and has stricter closed-schema identity rules. A moved/copied repository has a different local target binding: a copied historical receipt cannot authorize or acknowledge an operation for the new target. Diagnose it as binding conflict; do not rewrite target identity or migrate authority silently.

Receipt retention is bounded by this local Run's lifecycle and existing retention practice. No pruning, external receipt store or historical backfill is introduced. Tests must prove ordinary revision, gate progression and supported recovery preserve receipt evidence while retaining their effective-approval semantics. An unrelated direct edit that invalidates the whole Run seal remains recovery-required; the replay contract does not authorize bypassing that integrity check.

The approval transition must reuse the same evaluator composition across CLI and local API. Relevant source/runtime Git observations are exposed with availability; unavailable MCP Git-child observations cannot become an acceptance condition invented by an adapter. No new mutating MCP tool, install, release or VCS action is part of this design. Existing unrelated working-tree changes are outside this Run and must not be folded into its evidence.

The package refinement is confined to the additive public subpath, documented schemas, shared composition/context and their necessary propagation/tests. No package rename, repository-wide file relocation, npm workspace conversion, separate @agdf/runtime publication, changed dependency-version policy or payload-cleanup program is introduced. A later physical extraction may use this tested boundary as evidence but needs its own accepted scope. Public command schema version, package release version and on-disk receipt/seal version remain distinct and explicitly recorded.

## 6. Test And Evidence Strategy

TP must map every AC and SDD to executable tasks and evidence. Use fresh isolated Runs, contained temporary targets and real child processes for concurrency/interruption; never corrupt an active user Run for a fixture. Keep the baseline workflow and new reference workflow identical in product intent: prepare a UR, present it, obtain one exact reply, record it, observe its effect and exercise selected retries.

Required scenario families are shared CLI/API success, all read/non-approval cases, fabricated authority/unsupported schema, each target/Run/gate/revision/artefact/presentation mismatch, two real simultaneous consumers with identical and different identities, response loss, progress/revocation before replay, changed-payload identity reuse, pre/post-replacement fault injection and real process termination, lock ownership and unknown receipt/state recovery. Assert Run bytes/revisions and unrelated files, not only return strings. Validate receipt-bearing Run parsing/seals and preservation across every existing approval-changing writer touched by the integration.

Existing relevant control-state, presentation, gate-policy, CLI, Run-writer/recovery, traceability and package synchronization regressions must retain their legitimate baseline assertions. Add specific receipt/command tests rather than replacing earlier negative tests with broader success allowances. Qualification must inspect the actual packaged module paths, exports and generated runtime; no claim of installed-path behavior is established by passing repository tests.

For SDD-009 through SDD-011, require the external packed-consumer scenario, allowed dependency closure, import-effect assertions, missing-resource negative case, shared Git-observation behavior, existing-export compatibility and generated runtime module/resource completeness. Static boundary checks and executable packaged evidence complement each other: neither a new export declaration nor a repository import is enough. Task planning must name each scenario and its expected result, and run any potentially source-mutating packaging/build fixture in an isolated copy.

Record dated baseline/result counts for tool calls, repeated presentations, manual corrections and retry/recovery steps, with the same observation boundary. Report no improvement if none is observed. Source/protocol fixtures, generated-package checks, installed-path execution and visible multi-turn host/user observation are separate evidence classes. The last class remains cooperative even when observed. Linux and native Windows scenarios are required for corresponding platform claims; absent environments are explicitly unqualified and cannot be reported as passing QA evidence.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Closed one-action command through a supported package export and shared runtime composition, with bound canonical effect/current result. | Public entry owner: package.json/lib/control-command.js; composition: runtime/control-command-service.js; approval/policy owner: run-recording.js and evaluateGateCheck/gate-policy.js; canonical RUN_STATE.md. | SDD-001, SDD-002, SDD-003, SDD-008, SDD-009, SDD-010 | Existing exports/CLI JSON/inputs retain their contracts; explicit lane is additive and its dependency graph must not duplicate policy or pull in installer/MCP startup. |
| AC-002 | Existing read/presentation paths remain separate; non-approval replies reject before candidate/receipt creation. | Presentation/approval owners: run-presentation.js and gate-approval-validator.js; Run approval rows. | SDD-001, SDD-002 | Prepared binding is bookkeeping only; tests distinguish it from approval/revision advancement. |
| AC-003 | Only cooperative_local assurance; closed-schema rejection of stronger claims and explicit unavailable independent proof. | Approval-service/validator owner: run-recording.js and gate-approval-validator.js; canonical result assurance fields. | SDD-002, SDD-008 | Existing forwarded-reply meaning is retained; no historical or new receipt gains independent human provenance. |
| AC-004 | Fresh operation validates canonical target, Run/gate/revision, presentation/digests under lock and immediately before commit. | Gate/presentation owners: gate-policy.js, run-presentation.js; writer: run-state-writer.js. | SDD-002, SDD-005 | Cooperating lock and digest checks do not prevent arbitrary filesystem edits; subsequent invalid seals block readiness. |
| AC-005 | Locked receipt lookup plus one canonical Run commit; identical competitors retry to original effect, distinct losers conflict. | Run persistence owner: run-state-writer.js; receipt/application owner: run-recording.js. | SDD-003, SDD-004, SDD-005 | Existing nonblocking lock may initially return retryable; convergence must be proved with actual child processes. |
| AC-006 | Exact completed identity/digest replays historical effect before current-gate freshness; current observation is separate and never restores approval. | Canonical Run approval-operation section and seal; run-recording.js; current gate policy. | SDD-003, SDD-004, SDD-007, SDD-008 | No receipt/backfill for legacy approvals; moved targets, altered payloads and invalid state cannot be adopted as a replay. |
| AC-007 | Atomic approval/receipt commit; destination inspection after failure; safe retry or recovery-required; no new revision for acknowledgement. | Lock/atomic/flush owner: run-state-writer.js; receipt integrity: run-seal.js; supported recovery owner. | SDD-003, SDD-005, SDD-006, SDD-007 | Process-interruption guarantee is qualified by filesystem/platform; malformed evidence is not resealed into approval. |
| AC-008 | Legacy wrapper/seal and package exports preserved; receipt-aware paths preserve evidence; additive API has bounded resource closure, external packed-consumer proof and generated propagation; MCP stays read-only; comparable workflow counts. | CLI/public-export and shared runtime-context owners; run-recording.js/run-seal.js; package/runtime sync and package-content/build test owners; existing MCP observer. | SDD-001, SDD-007, SDD-008, SDD-009, SDD-010, SDD-011 | New receipt seal requires upgraded runtime; shared-context move preserves existing names/resources; no package split, migration/install, extra human gate or claimed percentage improvement. |
| AC-009 | Evidence availability/producer classes separate from effect/current state; external packed API, generated runtime and installed/visible-host evidence are independently qualified. | Existing evaluators/shared composition and command result owner; package qualification owner; CD+Tests evidence and QA decision owner. | SDD-002, SDD-008, SDD-011 | A packed import/result does not prove installation or human visibility; absent required platform/resource observations cannot silently grant stronger readiness. |

## 8. Risks And Open Questions

All PRD decisions deferred to SD are resolved by SDD-001 through SDD-011. There is no open product or authority choice required before TP. TP must determine exact test harness points and package regression commands against the then-current source without changing these decisions.

Material risks are the receipt-aware approval seal's mixed-runtime limit, ensuring every approval-changing writer preserves receipts, distinguishing a committed rename from a failed acknowledgement, and platform-dependent filesystem/lock behavior. These require concrete TP coverage and QA evidence; they are not permissions to weaken the contract. Receipt-aware recovery preserves valid historical effects but does not repair an unverifiable receipt or close another Run's historical provenance gap.

Package risks are an apparently public API that still reaches CLI/installer initialization, hidden dependence on checkout/cache resources, omission of a new module from generated runtime inventories, and a shared-context move that changes language or Git-observation behavior. The dependency rules and hermetic executable qualification above make these acceptance-relevant risks testable within existing PRD criteria. A future physical package split is intentionally deferred; this SD defines the boundary needed to assess it, not its migration/release design.

The host remains a cooperative forwarder. No receipt, digest, actor assertion or local programmatic interface provides an independently verified human-decision channel. Direct filesystem tampering and hardware power loss remain outside the approved guarantee. Installed/live qualification is not yet performed, and no production command or receipt implementation is created by this SD.

## 9. Next Step

Review this exact solution design and approve only with `Approval: SD`. A new deliberate approval permits TP drafting; implementation still requires the subsequent TP approval and the existing implementation-preparation route.

## AGDF Approval Summary (de; source=en)

- Lösung: Ein versionierter Freigabeauftrag nutzt denselben Service über CLI und den öffentlichen ESM-Export create-agdf/control-command. Freigabe und Wiederholungsbeleg werden gemeinsam in RUN_STATE.md gespeichert; Wiederholung erzeugt keine neue Revision. Historische Wirkung und heutiger Zustand bleiben getrennt. Die Paketgrenze wird jetzt im bestehenden Paket geprüft; eine Aufteilung in neue npm-Pakete folgt gegebenenfalls später mit eigenem Scope.
- Verantwortung: Gate-Policy, Antwort-/Präsentationsprüfung und Run-Writer bleiben maßgeblich. Eine dünne API-Fassade und gemeinsame Runtime-Komposition verbinden beide Verbraucher. Gemeinsame Konfiguration und Sprachdaten werden aus der CLI-Abhängigkeit in Runtime-Verantwortung überführt, mit denselben kanonischen Quellen und kompatiblen Re-Exports. Aktuelle Approval-Zeilen bestimmen heutige Freigaben; Belege beschreiben frühere Wirkungen. Der Host reicht Nutzerentscheidungen weiterhin kooperativ weiter.
- Entscheidungen: SDD-001 bis SDD-011 binden Auftrag und kooperative Beleggrenze, atomare Aufzeichnung, Wiederholung, Lock, Recovery und Altkompatibilität. Hinzu kommen ein stabiler öffentlicher API-Export, eine geprüfte Abhängigkeitsrichtung ohne Installer-/MCP-Initialisierung sowie ausführbarer Nachweis aus dem gepackten Paket. Kein zweiter Policy-/Konfigurationsbesitzer und keine unabhängige Human-Verifikation werden eingeführt.
- Integration: run-approve erhält Operation-ID und kooperative Assurance. create-agdf/control-command exportiert die Freigabefunktion, einen lesenden Zielbindungshelfer und die Schema-Version. Bestehende Exports bleiben erhalten. Code und benötigte Ressourcen müssen paketlokal sowie im generierten Validator vollständig sein. Ein externer Verbraucher importiert und verwendet das tatsächlich entpackte npm-Paket außerhalb des Repositories; fehlende Ressourcen und Import-Nebenwirkungen werden negativ geprüft. TP plant außerdem Parallelität, verlorene Antwort, Abbruch und Bedienaufwand.
- Offen: Vor Umsetzung folgen TP und dessen Freigabe. Paketprüfung, generierte Runtime, installierter Pfad und sichtbarer Host-Nachweis bleiben getrennte Belegklassen; fehlende Plattformnachweise bleiben unqualifiziert. Neue Beleg-Runs benötigen eine passende Runtime. Die physische Paketaufteilung ist zurückgestellt. Unabhängiger menschlicher Entscheidungsnachweis, Schutz gegen beliebige Dateischreibzugriffe und Hardware-Stromausfallgarantie bleiben außerhalb dieser Zusage.
