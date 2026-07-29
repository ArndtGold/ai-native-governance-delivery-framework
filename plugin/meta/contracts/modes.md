# AGDF Runtime Contract — Modes

## Mode Selection

| Mode | Default | Escalate When |
|---|---|---|
| Quick Task Mode | small questions, reviews, debugging, local fixes without new product semantics | a new user capability, architecture/policy/persistence impact, formal artefacts, or approvals are involved |
| Structured Delivery Mode | formal delivery runs, gate-relevant work, release-critical changes | always use gate discipline, internal reviews, and OR |

Quick Task Mode must not become ritual gate overhead.
Structured Delivery must not bypass missing approvals.
New product semantics, functional change, user-visible behaviour, policy, persistence, architecture or release-critical work requires a durable UR in `.agdf/control/` or a linked authoritative repository SoT before later artefacts or implementation.
UR, PRD, SD, TP and QA report approvals require durable artefacts or linked authoritative repository SoT entries before the next gate can open.

## Quick Task Output

Quick Tasks are intentionally lightweight, but they must not become invisible.
Use this compact output shape when no formal gate artefact is required:

- `result`: what changed or was concluded
- `evidence`: files, commands, observations, or reasoning that support the result
- `risk`: remaining risk or `none`
- `next_step`: the single next useful action or `none`

Do not add a separate `Quality outlook` line for pure Quick Tasks unless the task became a relevant run.

### Quick Task and Compact Delivery

Use **Quick Task** for ungated questions, reviews, debugging and eligible narrow fixes that introduce
no new product semantics or formal artefacts. When an approved UR is followed by a Brownfield Review
that selects the persisted `quick_task` mode, use **Compact Delivery** as the human-facing label. The
stored and JSON value remains `quick_task`; Compact Delivery is not a new mode or approval gate.

Brownfield Review owns the Mode/Slice selection. A completed review records its decision, scope
reason, evidence and required next depth in the same internal operation. `Mode/Slice Decision` remains
only a fail-closed recovery step for incomplete or legacy records and is not a normal second user
decision.

### Structured Depth Decision

This section is the sole normative owner for choosing between `structured_slice` and
`structured_delivery`. Apply it only after an approved durable UR, a Brownfield Review of the
existing-system context, and unchanged evaluation of Quick Task/Compact Delivery and Verified
Change. A compact path must be ineligible or explicitly escalated, and the decisive depth facts must
be durably evidenced before a positive structured decision is recorded.

Choose `structured_delivery` when any one evidenced full-depth trigger applies:

1. **Authority, policy or security** — a trust or authority boundary, permission, security,
   compliance or normative policy changes, or independent decision owners require coordinated
   approval.
2. **Architecture or runtime** — execution, orchestration, durable execution, concurrency, failure
   or recovery boundaries change beyond a local slice.
3. **Persistence, data or migration** — persistent schema or meaning changes, data migration,
   irreversible state transition, coordinated cutover, an extended compatibility window or
   non-local rollback is required.
4. **External or public contract** — an external API, public CLI behavior, protocol, file format or
   compatibility-sensitive integration contract changes, including independent consumer
   coordination or versioning.
5. **Release, deployment or cross-host** — the work needs its own rollout, deployment, rollback,
   feature-flag or release plan, or coordinated activation across hosts, products or operational
   boundaries.
6. **Unbounded consumer or owner coordination** — the outcome cannot be delivered as an
   independently acceptable and reversible slice, or consumers or owners require a shared cutover
   or compatibility window.

A single trigger is decisive because of its effect, never because of a numeric count.

Choose `structured_slice` only when `depth_facts_status` is `complete`, no full-depth trigger is
evidenced, and all seven bounded-slice checks are positively evidenced as `pass`:

| Check ID | Required evidence |
|---|---|
| `coherent_outcome` | One coherent user or product outcome has a clear acceptance boundary. |
| `authority_boundary` | Authority and source of truth are known and no new trust, policy, permission or security boundary is introduced. |
| `owner_consumer_coordination` | Owners and consumers are identified and coordination stays inside the slice without a shared external cutover. |
| `full_depth_impacts_absent` | Architecture, runtime, persistence, data, external API, public CLI, release and cross-host effects are evidenced as not full-depth relevant. |
| `migration_propagation_bounded` | Migration and propagation are bounded, compatible, testable and locally reversible. |
| `failure_recovery_local` | Failure, recovery and rollback remain controllable inside the slice. |
| `independently_acceptable` | The slice has independent acceptance signals and hides no unknown later work as a prerequisite. |

Multiple files, owners, consumers or derived paths do not fail these checks by themselves. File,
owner, consumer, task or derived-path counts are not a decision proxy and must never be used as a
threshold for either structured mode.

If a decisive fact is missing or conflicting and no evidenced full-depth trigger already supports
`structured_delivery`, the product-language result is `depth_unresolved`. This is not a persisted
mode. Persist the existing Mode/Slice value `block`, use `depth_facts_missing` or
`depth_facts_conflicting`, name the affected facts and evidence owner where known, link the
Brownfield Review, forbid later artefacts and implementation, and provide a precise next action for
evidence completion and Brownfield/Mode-Slice re-evaluation. Unknown facts must not default to
`structured_delivery`.

Positive decisions persist the existing `structured_slice | structured_delivery` value, required
next gate, a `scope_reason` containing the primary reason code and decisive rationale plus the
rejected alternative, and evidence linking the complete Structured Depth Evidence. Re-evaluate
before continuing whenever scope growth reveals a new full-depth trigger.

Normalized reason codes are audit and rationale categories, not new modes or gates:

- `bounded_structured_slice`
- `authority_policy_security_depth`
- `architecture_runtime_depth`
- `persistence_migration_depth`
- `external_contract_depth`
- `release_cross_host_depth`
- `unbounded_consumer_coordination`
- `depth_facts_missing`
- `depth_facts_conflicting`

Structured Slice and Structured Delivery use the same existing gate and approval sequence. Their
difference is artefact depth: Slice artefacts cover only the coherent bounded outcome and its owners,
contracts, propagation, recovery, tasks and tests; Full Delivery covers every affected authority,
architecture, runtime, consumer, migration, operational and release boundary.

Historical or deterministic benchmark observations are non-authorizing evidence. They do not define
this policy, retroactively regrade historical runs or prove live-host behavior. A future benchmark
may apply this policy only with complete, versioned neutral depth facts.

### Verified Change

`verified_change` is a compact, fail-closed path for a bounded user-visible change with one canonical owner and deterministic proof. It is neither a prose exception nor a new user approval gate.

After `Approval: UR`, Brownfield Review may select `verified_change` only when a durable `VERIFIED_CHANGE.md` record can prove all of the following before implementation:

1. exactly one repository-relative canonical owner and bounded source/derived paths;
2. no gate, permission, security, persistence, architecture, external API, CLI or release behavior impact;
3. deterministic propagation when derived paths exist, plus at least one deterministic validation command;
4. a full baseline commit plus tracked and untracked worktree baseline paths captured before eligibility, with no candidate path already dirty; and
5. an explicit `structured_slice` or `structured_delivery` escalation target.

The record is the compact Brownfield selection, eligibility, execution and mini-closeout artefact. The selected run may link the same normalized record path as Brownfield Review, Verified Change and OR only in `verified_change` mode and only with lifecycle-consistent role states; separate Brownfield and OR files remain supported. Permitted control paths derive only from recognized, explicitly linked artefacts beneath the selected run's own artefact directory.

A missing, failed, unknown or ambiguous field/check must fail closed: mark the record `escalated` and continue at its declared structured target. Unrelated paths already dirty at baseline remain isolated; newly introduced unlisted paths invalidate the compact path. An executed record requires a machine-readable exact changed-path snapshot with passing scope status, passing validation evidence and, where applicable, passing propagation evidence. Active runs compare that snapshot with the current post-baseline worktree. Completed executed runs validate the persisted snapshot and record evidence without being retroactively invalidated by later unrelated live-worktree changes.

### Non-Normative Trivial Change Boundary

A `quick_task` whose entire diff stays fully outside all of the following paths may close using only
the compact output shape above, and must not create, rewrite or expand any selected canonical
`RUN_STATE.md` core
sections (Run Meta, Objective, Current Control State, Source And Scope State, Run Status Card,
Approvals, Artefacts, Mode/Slice Decision, Artefact Chain, Evidence, Missing Evidence, Risks, Context
Graph Impact, Knowledge Persistence Decision, Closeout):

- `plugin/skills/**`
- `plugin/control/templates/**`
- `plugin/meta/**`
- `create-agdf/lib/**`
- `create-agdf/bin/**`
- any other executable code file, in any language, anywhere in the repository

A `MASTER_BACKLOG.md` entry is required only when the change is otherwise a "Relevant Run" below. A
change that is not clearly and fully outside every listed path fails closed to the existing, unchanged
ceremony — ambiguity is never read as permission for the lighter path.

#### Narrow Code-Fix Criterion

A change that touches one of the otherwise-excluded code paths above may still close with only the
compact Quick Task Output shape — Code Review remains mandatory regardless — when **all** of the
following hold. Any single condition failing, or any ambiguity about whether a condition holds, keeps
the full existing ceremony unchanged:

1. The diff is confined to a single function, or a function together with its direct,
   necessarily-coupled caller, in exactly one file.
2. A new or updated automated regression test exercises the fixed behavior and passes.
3. No PRD, SD, TP, gate name, exact approval formula, or documented CLI flag/output-schema field is
   added, removed, or changed — only internal correctness of already-approved behavior.
4. `doctor` (or the locally available equivalent) and the directly affected existing test suite both
   pass unchanged in shape after the fix, with no assertion skipped or weakened beyond what the fix
   itself introduces.


## Bug Lightweight Track

For narrow defect work, a repository may use a lightweight bug scope instead of the full UR/PRD/SD/TP chain when all of the following are true:

- the defect is tied to a concrete symptom or ticket
- the expected behavior is clear enough to test
- no new product semantics, architecture, policy, persistence or cross-owner decision is introduced
- a durable bug artefact or linked authoritative issue records reproduction, actual behavior, expected behavior, fix boundary, open questions and evidence plan

The Bug Lightweight Track does not remove QA, OR, evidence, Brownfield fit or exact approvals required by the target repository.
If the bug grows beyond the stated boundary, escalate to normal AGDF gate flow.
