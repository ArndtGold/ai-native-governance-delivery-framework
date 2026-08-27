# TP: Informed Installation Consent for Automatic AGDF Runtime Checks

Status: approved; revision 2
Gate: TP
Gate approval: exact `Approval: TP` recorded 2026-08-27 after same-run, same-gate and revision-2 revalidation
Based on: approved `SD.md` revision 3 and approved `PRD.md` revision 2
Date: 2026-08-27
Owner: Arndt Gold

## 1. Delivery Boundary

Implement the approved consent capability through existing installer, runtime, lifecycle,
public-plugin and host-adapter owners. Deliver one argument-free local read-only session check, one
content-bound consent identity, one non-authoritative intent receipt, a deliberate choice during
every interactive install or update, narrow host-specific application, status/revocation, safe
renewal and coherent public Codex submission material. Existing consent may inform the displayed
current state but must never bypass the interactive choice.

Implementation must not create a second validator, gate evaluator, installer, lifecycle renderer,
permission authority or public listing source. No broad Bash, PowerShell, Node, filesystem or network
permission is allowed.

TP approval permits mandatory pre-implementation Brownfield Analysis first. It does not authorize
real user-host configuration mutation, plugin reinstallation, publication, portal submission,
release, commit, push or pull-request creation. Repository tests use isolated temporary roots and
injected host adapters. Direct host evidence remains a separately controlled QA/UAT activity.

## 2. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| IRC-01 | Capture tracked and untracked baseline, revalidate the selected run, inspect current installer/runtime/lifecycle/public-plugin owners and protect unrelated user work. | PRD-IC-11, PRD-IC-12 | Exact before-change path snapshot; Brownfield Analysis pass; no unexplained pre-existing drift in implementation paths. |
| IRC-02 | Add and validate the canonical `automaticRuntimeChecks` manifest and one deterministic capability-identity implementation using existing runtime/source provenance. | PRD-IC-03, PRD-IC-04, PRD-IC-06 | Contract and identity tests reject arguments, writes, network, unknown operations, broad rules and independent digest/scope drift. |
| IRC-03 | Implement the argument-free `session-check` composition over existing validator/control evaluators and generate `runtime/agdf-session-check.js` once through the runtime sync owner. | PRD-IC-03, PRD-IC-04, PRD-IC-11, PRD-IC-12 | No-argument/no-network/no-write tests; bounded healthy/missing/ambiguous output; source scan proves no second gate or validator semantics. |
| IRC-04 | Generate host-specific Codex and Claude session hook commands, including Codex `commandWindows` and native Claude Code command/argument projections; route OpenCode through its plugin process without shell permission widening. | PRD-IC-03, PRD-IC-09, PRD-IC-10 | POSIX/win32 manifest fixtures, quoting negatives, generated parity and no shared Bash-wrapper assumption. |
| IRC-05 | Implement owner-marked intent receipt, atomic persistence, content-bound renewal state and effective-state derivation that requires intent, current identity and host evidence. | PRD-IC-04, PRD-IC-06, PRD-IC-07 | Receipt ownership/malformed/tamper/mismatch fixtures; atomic write/rollback; receipt alone never yields enabled. |
| IRC-06 | Make the consent coordinator invoke the injectable enable, manual and cancel interaction on every interactive install or update, including when a valid receipt exists; retain explicit non-interactive policy handling. | PRD-IC-01, PRD-IC-02, PRD-IC-08 | First-install plus enabled/manual receipt update fixtures; current state is visible but never preselected; no retained-consent bypass; cancel produces zero plugin, permission or receipt mutation. |
| IRC-07 | Implement the Codex adapter as native exact-hash hook-trust observation only. Never write trust state or invoke/recommend bypass. | PRD-IC-03, PRD-IC-04, PRD-IC-06, PRD-IC-07 | Pending review, observed current hook, changed hash and disabled-hook fixtures; source scan proves no trust-store mutation or bypass flag. |
| IRC-08 | Implement the Claude Code adapter with one exact fixed-entrypoint Bash or PowerShell rule, deny/ask precedence, minimal atomic mutation, exact-rule revocation and renewal replacement. | PRD-IC-03, PRD-IC-05, PRD-IC-06, PRD-IC-07, PRD-IC-10 | Exact-rule positives; wildcard/broad-rule rejection; malformed/conflicting/user-setting preservation; update/revoke/rollback fixtures on POSIX and win32. |
| IRC-09 | Implement the OpenCode adapter using plugin/config evidence and matching receipt while preserving every explicit permission decision and leaving `permission.bash` unchanged. | PRD-IC-04, PRD-IC-05, PRD-IC-09, PRD-IC-12 | Missing-only merge regressions; receipt/plugin mismatch; unobserved hook; no Bash allow change; config ownership fixtures. |
| IRC-10 | Extend CLI parsing/routing with install/update consent options and the narrow `runtime-checks status|enable|manual` path. Show the current requested state before every interactive update choice and extend lifecycle result/status/presentation with requested/effective state and exactly one next action. | PRD-IC-01, PRD-IC-02, PRD-IC-04, PRD-IC-07, PRD-IC-08 | CLI help/validation tests; current enabled/manual context plus three outcomes; human/JSON parity; healthy installation can coexist with manual/renewal state; no gate-authority coupling. |
| IRC-11 | Integrate installation, post-install host application, verification, partial-failure behavior, revocation, migration and rollback without weakening existing marketplace/config transactions. | PRD-IC-04, PRD-IC-05, PRD-IC-06, PRD-IC-07, PRD-IC-09 | Phase-classified install/update/revoke fixtures; permission failure rolls back owned mutation and retains usable manual installation; unowned state blocks. |
| IRC-12 | Complete native-platform path, command, configuration and atomic-swap behavior, including bounded Windows `EPERM` handling and PowerShell rule construction. | PRD-IC-03, PRD-IC-09, PRD-IC-10 | Full injected path/quoting matrix plus direct native-Windows obligation; no POSIX path or executable-bit assumption. |
| IRC-13 | Update `INSTALL.md` and package README, canonical public listing metadata, capability matrix, reviewer cases, release notes, privacy/support consistency and public-candidate validation. | PRD-IC-01, PRD-IC-02, PRD-IC-07, PRD-IC-09, PRD-IC-10, PRD-IC-12 | Listing/install/update/manual/revoke/renewal assertions explicitly forbid silent interactive reuse; at least five relevant positive and three relevant negative review cases; evidence-backed matrix; generated `listing.json` only through builder. |
| IRC-14 | Extend Runtime Integrity and focused test owners for contract, entrypoint, hook projection, permission breadth, consent identity, generated/public parity and evidence-plane separation. | All PRD-IC criteria | Negative integrity fixtures fail on broad/stale/drifted output; portable/public profile remains honest; no weakened existing assertion. |
| IRC-15 | Regenerate only through canonical sync, run focused and aggregate verification, inspect exact changed paths and reconcile existing Context Graph nodes. | PRD-IC-11, PRD-IC-12 | `release:prepare`, focused suites, full smoke, Runtime Integrity, audit, selected-run checks and `git diff --check` pass; generated drift explained. |
| IRC-16 | Persist `CD_TESTS.md` with task-by-task and criterion-by-criterion evidence, keeping repository, package, installed-host, fresh-session and native-Windows planes separate. | All PRD-IC criteria | Complete IRC-01 through IRC-15 map; missing direct-host evidence remains explicit; no QA/UAT/support claim from lower planes. |

## 3. Approved Implementation Paths

Implementation may change only these owners and their direct generated/test consumers:

- `plugin/meta/agdf-plugin.definition.json`
- canonical and generated Codex/Claude plugin hook manifests under `plugin/` and
  `create-agdf/generated/`, with generated files changed only by sync
- `plugin/hooks/` where retained compatibility or source generation requires it
- `plugin/scripts/check-runtime-integrity.mjs`
- `create-agdf/lib/runtime/` for the focused session-check owner and necessary existing-runtime reuse
- new `create-agdf/lib/runtime-check-consent/` containing only contract, state, coordinator and thin
  Codex/Claude/OpenCode adapters
- `create-agdf/lib/installers/plugin-installers.js`
- `create-agdf/lib/installers/opencode.js`
- existing marketplace/provenance/atomic-write helpers only where direct integration requires it
- `create-agdf/lib/cli/{parse-args,command-registry,application}.js`
- `create-agdf/lib/lifecycle/{result,presentation,status}.js`
- existing sync scripts that compose the runtime and public candidate
- directly corresponding existing and new focused tests under `create-agdf/scripts/`
- `INSTALL.md` and `create-agdf/README.md`
- `plugin/submission/openai/{capability-matrix.json,reviewer-cases.json,release-notes.md,availability.md}`
- canonical public-distribution metadata and `create-agdf/lib/public-plugin/` validators/builders
- `create-agdf/generated/**` only through canonical generation
- existing Context Graph nodes `CG-NATIVE-INTERACTION-AUTHORITY` and
  `CG-CREATE-AGDF-CLI-COMPOSITION`
- this run's `.agdf/control/` artefacts and canonical backlog row

If implementation requires another persistent authority, broad permission rule, MCP/hosted service,
new validator semantics, gate changes, a second public listing source or a path outside this boundary,
stop and return to SD or TP revision.

## 4. Stable State And Failure Contract

Canonical automatic-runtime-check states:

```text
decision_required
enabled
manual
renewal_required
unavailable
degraded
cancelled
failed
```

Required stable reason classes include:

```text
consent_not_provided
host_review_required
host_permission_conflict
host_permission_unverified
capability_identity_changed
receipt_missing
receipt_invalid
receipt_unowned
installed_identity_mismatch
unsupported_host_capability
configuration_invalid
configuration_unowned
rollback_incomplete
native_evidence_missing
```

Exact copy may be refined, but these classes must remain independently testable. None authorizes an
AGDF gate or a recovery mutation.

## 5. Test Plan

| test_id | Scope | Required assertion |
|---|---|---|
| IRC-T01 | Capability manifest | Closed operation vocabulary; no args, writes or network; invalid/broad declarations fail. |
| IRC-T02 | Capability identity | Runtime/source digest, command, scope and adapter-version changes invalidate independently; identity-equivalent version update stays stable. |
| IRC-T03 | Session check | Rejects arguments; composes existing read-only evaluation; bounded outputs; no init, persistence, registry or network call. |
| IRC-T04 | Host hook generation | Codex and Claude POSIX/win32 projections are deterministic, native-safe and invoke only the fixed entrypoint. |
| IRC-T05 | Receipt and authority | Valid receipt plus missing host evidence is not enabled; malformed/unowned/mismatched receipt fails closed. |
| IRC-T06 | Deliberate interaction | First install and updates with enabled/manual receipts all ask; current state is visible; enable/manual/cancel are distinct; no option is preselected; invalid/empty input performs no mutation. |
| IRC-T07 | Non-interactive policy | No TTY and JSON default manual; only the exact explicit value requests enablement; environment/CI detection never implies consent. |
| IRC-T08 | Codex adapter | Trust store is never written; current observed hook can be enabled; missing/changed/disabled hash requires native review or renewal. |
| IRC-T09 | Claude POSIX adapter | One exact `Bash(...)` rule only; deny/ask conflict remains authoritative; wildcards and compound commands fail. |
| IRC-T10 | Claude Windows adapter | One exact `PowerShell(...)` rule only; native paths/quoting/settings and rollback are deterministic; no Bash fallback. |
| IRC-T11 | OpenCode adapter | Explicit permission decisions and `bash: ask` remain unchanged; enabled requires matching receipt, loadable package and observed plugin hook. |
| IRC-T12 | Install/update transaction | Every interactive install/update asks before mutation even with a valid receipt; cancel leaves plugin, permission and receipt state unchanged; post-install identity is verified; permission failure retains a usable manual install and rolls back only owned config. |
| IRC-T13 | Renewal | Material identity change removes eligibility before execution; unchanged identity may preserve native host trust after a new enable choice but cannot suppress the installer interaction; stale exact rules are not silently inherited. |
| IRC-T14 | Revocation | Removes only the recorded exact owned rule or routes to native host control; plugin remains installed in manual mode. |
| IRC-T15 | Lifecycle/status | Requested and effective state remain separate; one next action; installation, activation, automatic checks and delivery do not inherit from each other. |
| IRC-T16 | Evidence planes | Repository/package success cannot satisfy installed-host, fresh-session or native-Windows claims. |
| IRC-T17 | Public documentation | Listing, install docs, privacy/support, capability matrix, reviewer cases and release notes share the canonical scope and never imply AGDF gate approval. |
| IRC-T18 | Public candidate | Builder emits coherent `listing.json`, inventory and readiness; missing consent disclosure/evidence blocks candidate validation. |
| IRC-T19 | Native platform fixtures | POSIX and win32 path, command, settings and atomic-write cases run without weakened assertions or platform inference. |
| IRC-T20 | Full regression | Existing installer, lifecycle, OpenCode, public plugin, Runtime Integrity, package, control and interaction suites remain clean. |

## 6. Verification Commands

Focused commands, selected and refined during Brownfield Analysis:

```text
npm --prefix create-agdf run test:cli-modularization
npm --prefix create-agdf run test:local-validator
npm --prefix create-agdf run test:local-marketplace
npm --prefix create-agdf run test:local-development-install
npm --prefix create-agdf run test:lifecycle
npm --prefix create-agdf run test:opencode-hardening
npm --prefix create-agdf run test:public-plugin
npm --prefix create-agdf run test:runtime-integrity-layout
npm --prefix create-agdf run test:runtime-integrity-negative
npm --prefix create-agdf run test:package-build
npm --prefix create-agdf run test:package-contents
```

Canonical and aggregate verification:

```text
npm --prefix create-agdf run release:prepare
node plugin/scripts/check-runtime-integrity.mjs
npm --prefix create-agdf run smoke-test
node create-agdf/generated/plugins/agdf/runtime/agdf-local.js --resolve-only --json
node create-agdf/generated/plugins/agdf/runtime/agdf-local.js doctor --run installation-consent-runtime-checks --json
node create-agdf/generated/plugins/agdf/runtime/agdf-local.js gate-check --run installation-consent-runtime-checks --json
node create-agdf/generated/plugins/agdf/runtime/agdf-local.js delivery-map --run installation-consent-runtime-checks --json
npm --prefix create-agdf audit
git diff --check
```

All repository tests use temporary homes/config roots and injected command executors. They must not
touch real Codex, Claude Code or OpenCode configuration, caches, marketplaces or installed plugins.

## 7. Direct Host Evidence Obligations

Direct host evidence is required before the corresponding support claim but is not authorized by TP
approval alone:

| evidence_id | Surface | Required observation |
|---|---|---|
| IRC-H01 | Codex macOS/Linux | First install and identity-equivalent update both show the choice; cancel is mutation-free; native hook review, enabled fresh session, changed-hook renewal and disable/revoke boundary. |
| IRC-H02 | Claude Code macOS/Linux | First install and identity-equivalent update both show the choice; exact-rule enablement, preserved conflict, manual, revoke, identity renewal, rollback and fresh session. |
| IRC-H03 | OpenCode macOS/Linux | First install and identity-equivalent update both show the choice; preserved explicit permissions, matching receipt/plugin activation, manual/revoke/update and fresh session. |
| IRC-H04 | Codex native Windows | Native install, `commandWindows`, hook review/hash renewal, disable and fresh session with actual paths. |
| IRC-H05 | Claude Code native Windows | PowerShell exact rule, settings location, ACL/atomic rollback, manual/revoke/renewal and fresh session. |
| IRC-H06 | OpenCode native Windows | Native config root, plugin-internal session check, preserved permissions, rollback and fresh session. |
| IRC-H07 | Public Codex candidate | Rendered listing/install disclosure and reviewer evidence match the implemented capability; portal/publisher/publication state remains separate. |

If a host or OS does not expose sufficient effective-state evidence, record `unverified`, `manual`,
`degraded` or `unsupported`; do not infer parity from another cell.

## 8. Brownfield Scope Before Implementation

After TP approval, mandatory Brownfield Analysis must revalidate:

- current canonical plugin definition and generated Codex/Claude manifests;
- runtime sync, `session-start.sh`, local validator and provenance owners;
- Codex/Claude installers, OpenCode missing-only permission merge and lifecycle result/status owners;
- public plugin definition, builder, contract, validator, capability matrix, reviewer cases and release
  notes;
- actual current host documentation or installed capability evidence where SD assumptions may have
  drifted;
- tracked, untracked and unrelated baseline paths; and
- whether the proposed new focused modules reuse rather than duplicate existing transaction,
  interaction, hashing and atomic-write helpers.

A new authority boundary, unsupported host contract, required broad rule, conflicting user state or
path outside Section 3 routes back to SD or TP before implementation.

## 9. Review And QA Sequence

After CD+Tests:

1. Task Plan Review maps every IRC task and PRD criterion to evidence.
2. Clean Implementation Review rejects broad permissions, duplicate validators, parallel stores,
   shell fallbacks and documentation drift.
3. Mandatory Code Review covers correctness, security, rollback and maintainability.
4. QA Gate separates repository, package, host and native-Windows evidence and cannot pass a support
   claim whose required plane is missing.
5. Human UAT follows an approved QA report. Publication and VCS delivery remain separate actions.

## 10. Out Of Scope

- General shell, Node, PowerShell, filesystem or network permission management.
- A second validator, gate evaluator, permission authority, settings product or public listing owner.
- MCP or hosted validation, telemetry, accounts or automatic registry fallback.
- Silent migration of ambiguous/user-owned configuration or direct cache editing.
- AGDF gate, approval syntax, delivery-mode or release-authority changes.
- Real host configuration mutation during repository tests.
- Portal submission, publication, release, commit, push or pull-request creation.

## 11. Blocking Rules

- Any broad or wildcard Claude permission rule blocks implementation acceptance.
- Any Codex trust-store write or hook-trust bypass blocks acceptance.
- Any OpenCode change that overwrites an explicit permission decision blocks acceptance.
- Receipt-only enabled state, stale identity inheritance or automatic non-interactive consent blocks
  acceptance.
- Missing rollback, unowned config mutation, shell command injection or network/write behavior blocks
  acceptance.
- A lower evidence plane presented as installed-host, fresh-session or Windows proof blocks QA.
- Missing direct native-Windows evidence blocks only the corresponding Windows automatic-mode claim;
  it must remain manual/unverified rather than being generalized.
- Public listing, privacy, capability matrix, reviewer cases and release notes that drift from the
  implemented consent contract block public-candidate readiness.
- Unexplained generated drift, out-of-scope paths, failed aggregate tests or modified unrelated user
  work blocks QA.
- Existing Context Graph warnings remain open until reconciled before closeout.

## 12. Next Step

Task and Test Plan Revision 2 is approved. Brownfield Analysis Revision 2 passed and the bounded
implementation plus repository tests are complete. QA remains `revise` until the declared direct-host
evidence obligations are complete.
