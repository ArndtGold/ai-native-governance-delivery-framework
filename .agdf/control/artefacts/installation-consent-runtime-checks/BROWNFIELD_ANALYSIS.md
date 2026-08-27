# Brownfield Analysis: Installation Consent for Automatic Runtime Checks

## Decision

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `CD+Tests`
- artefact: `.agdf/control/artefacts/installation-consent-runtime-checks/BROWNFIELD_ANALYSIS.md`

## Scope

Validate approved TP Revision 1 against the current installer, runtime, provenance, lifecycle,
interaction, public-plugin, generated-surface and native-platform owners before code changes. Confirm
that the implementation can add informed installation consent without creating another validator,
permission authority, public listing source or host-security bypass.

## Baseline And Selected Run

- selected run: `installation-consent-runtime-checks`
- approved plan: TP Revision 1 through exact `Approval: TP` on 2026-08-27
- repository baseline: `753124e20adebb44acf53817823300cf73ea0ac8`
- observed worktree before implementation: only this run's canonical backlog row and untracked run
  artefacts; no unrelated implementation-path change was observed
- source version: canonical plugin definition `0.13.7`
- validation boundary: the active session runtime is version-matched `0.13.6`; implementation and
  generated verification must use the source-matched `0.13.7` validator produced by canonical sync

## Existing Owners And Reuse Path

| TP tasks | Existing owner | Coverage before implementation | Reuse action |
|---|---|---|---|
| IRC-02/05 | `plugin/meta/agdf-plugin.definition.json`; `create-agdf/lib/runtime/plugin-provenance.js`; `.agdf-installation.json` | partially_done | Add one canonical capability declaration and derive its identity from existing normalized source/runtime digest evidence. Persist only a bounded owner-marked intent receipt; do not duplicate installation provenance or host-effective state. |
| IRC-03 | `create-agdf/lib/runtime/local-validator.js`; validator handlers; generated runtime sync | partially_done | Compose the argument-free session check from existing resolution and read-only evaluation owners. Add no gate, validator or lifecycle semantics. |
| IRC-04/07 | canonical Codex hook manifest; `plugin/hooks/`; Codex native exact-hash review | partially_done | Generate native POSIX and Windows commands through the canonical manifest owner. Observe Codex trust only; never write or bypass the host trust store. |
| IRC-04/08 | Claude plugin hooks; `create-agdf/lib/installers/plugin-installers.js`; host permission settings | partially_done | Use one exact fixed-entrypoint rule only when the installed command identity and settings ownership are observable. Preserve deny/ask precedence and degrade to manual when exact effective state cannot be proven. |
| IRC-04/09 | `create-agdf/lib/installers/opencode.js`; config-local runtime and plugin hook evidence | partially_done | Extend the existing missing-only merge and plugin/config inspection. Preserve all explicit permissions and leave `permission.bash` unchanged. |
| IRC-06/10/11 | CLI parser, registry and application; lifecycle result/status/presentation; installer transactions | partially_done | Add one coordinator behind current command and lifecycle owners. Consent precedes mutation; partial host-permission failure leaves a usable manual installation and rolls back only AGDF-owned state. |
| IRC-12 | `create-agdf/lib/fs-swap.js`; target-platform path construction; native command adapters | partially_done | Reuse the bounded win32 `EPERM` retry and injected platform fixtures. Keep direct native-Windows evidence separate from simulation. |
| IRC-13/14 | public distribution definition; public builder/contract; Runtime Integrity; submission sources | partially_done | Extend canonical metadata and validators. Generate `listing.json` only through the builder and preserve evidence-plane distinctions. |
| IRC-15/16 | `sync-package-assets.js`; existing focused/aggregate suites; run artefacts | fully_done as generation and evidence boundary | Regenerate through the canonical owner, verify focused-to-aggregate, and record task/criterion evidence without promoting repository proof to host proof. |

## Runtime And Source-Of-Truth Evidence

- `resolveLocalValidator()` already validates distribution profile, canonical/plugin/runtime versions,
  runtime digest, installed provenance and exact plugin root before it exposes an executable.
- `plugin-provenance.js` is the sole current normalized source/runtime digest and installation marker
  owner. Capability identity must consume this evidence rather than define another hash policy.
- `plugin-installers.js` already owns Codex and Claude marketplace classification, install/update
  sequencing, version verification and rollback. Claude same-version refresh deliberately reinstalls
  the cached plugin.
- `opencode.js` already fills only missing canonical permissions and preserves every explicit user
  decision. The new feature must not convert `permission.bash` from `ask` to `allow`.
- `run-state-writer.js` and marketplace/public builders already provide atomic-write or atomic-swap
  patterns. Consent persistence should extract or reuse a narrow shared primitive without coupling
  user consent to run-state authority.
- lifecycle result, presentation and status modules already own human/JSON operational output and
  remain the only place for requested/effective-state projection.
- the current source hook is POSIX-oriented and lacks a native Windows command projection. Generated
  hook commands must replace the shared-wrapper assumption and retain the existing session
  orientation as a consumer of the new fixed check.

## Public Codex Distribution Boundary

The approved public distribution is currently `submissionType: skills` and maps to the
`portable-skills` profile. `createCodexPluginManifest(..., { publicCandidate: true })` intentionally
omits hooks, while Runtime Integrity requires that portable Skills have no runtime and machine
validation be unavailable or external.

This is a supported profile boundary, not a reason to add runtime or hooks to the public candidate.
Implementation passes only under these constraints:

- the public Skills-only candidate remains executable-free and hook-free;
- its listing, capability matrix, reviewer cases and release notes disclose automatic local runtime
  checks as unavailable for that profile and describe the manual/external validation path;
- automatic-mode claims apply only to runtime-bearing installations with direct host evidence; and
- changing the public submission into a runtime-bearing plugin requires a separately approved SD/TP
  revision and must not occur inside this implementation.

## Host Feasibility Boundaries

| Surface | Implementable repository boundary | Evidence that remains required |
|---|---|---|
| Codex | Generate the fixed hook command and observe native exact-hash review/effective hook evidence. Never mutate trust. | Fresh-session observation for current hash, changed-hash renewal and disable behavior on each claimed OS. |
| Claude Code | Construct and mutate only one exact fixed-entrypoint Bash or PowerShell rule when an exact installed command identity and owned settings target are available. Otherwise return manual, unavailable or unverified. | Direct proof of rule syntax, precedence, installed path identity, rollback and fresh-session behavior on POSIX and native Windows. |
| OpenCode | Use plugin/config evidence and a matching receipt without widening shell permissions. | Direct plugin-hook invocation and fresh-session evidence; declared hooks alone do not prove effective execution. |

The Claude adapter must not guess a cache path, use a wildcard, authorize a stable mutable root or
claim enabled state from an intent receipt. If the exact installed command identity is not available
from the host adapter, the clean result is manual or unavailable until host evidence closes the gap.

## Change Impact And Regression Risk

- A receipt can record deliberate intent but cannot become permission authority. Effective enabled
  state requires current identity plus observable native host evidence.
- Content changes can stale Codex trust or Claude exact rules. Capability identity and renewal tests
  must fail closed independently for command, scope, runtime digest, source digest and adapter version.
- Installer success, plugin activation, automatic checks and AGDF delivery state are separate facts;
  additive lifecycle output must not collapse them.
- Claude settings and OpenCode configuration are user-owned mixed documents. Mutation must reject
  malformed, ambiguous or unowned state and preserve unrelated values byte-for-semantics.
- Windows paths, quoting, settings roots, ACL behavior and locked directory swaps cannot be inferred
  from POSIX success. Injected fixtures support design confidence only; the Windows claim remains
  gated by IRC-H04 through IRC-H06.
- Generated plugin/runtime/public outputs can drift if edited directly. Canonical definition and
  sync remain authoritative.
- Public documentation can overstate the portable profile. Public candidate validation must reject
  runtime-check claims that are not qualified by distribution profile and evidence plane.

## Parallel-Structure And Visible-Ownership Check

The implementation remains clean only if one capability manifest defines scope, one identity
function consumes existing provenance, one intent-receipt owner stores non-authoritative user intent,
one session-check entrypoint composes existing validators, and lifecycle modules render state. Codex,
Claude and OpenCode adapters may translate and observe host state but may not redefine consent,
approval, hashing, validation or status semantics. The public builder remains the sole listing output
owner. Any second validator, permission store, trust writer, mutable-runtime authorization or public
listing source is a blocking parallel structure.

## Test And Verification Obligations

- capability schema and identity drift negatives for command, scope, runtime/source digest and
  adapter version;
- no-argument, no-network and no-write session-check fixtures using existing evaluator injection;
- native POSIX/win32 hook command and quoting fixtures without a shared Bash fallback;
- receipt ownership, atomicity, malformed/tampered/mismatched identity and receipt-only negatives;
- deliberate enable/manual/cancel and non-interactive default-manual behavior before mutation;
- Codex trust observation with no trust-store write; Claude exact-rule and precedence fixtures;
  OpenCode explicit-decision and unchanged-Bash fixtures;
- install/update/revoke/renewal rollback and lifecycle human/JSON parity;
- honest portable-public profile plus submission metadata, reviewer-case and builder validation;
- focused suites, canonical `release:prepare`, Runtime Integrity, package tests, aggregate smoke,
  source-matched doctor/gate-check/delivery-map, audit and `git diff --check`;
- direct host obligations IRC-H01 through IRC-H07 remain separate and cannot be satisfied by tests.

## Context Graph

- context_graph_impact: `update_existing_node`
- context_graph_refs: `CG-NATIVE-INTERACTION-AUTHORITY`; `CG-CREATE-AGDF-CLI-COMPOSITION`
- context_graph_reconciliation: `open_gap`
- context_graph_gate_effect: `warning`
- context_graph_required_action: `update`
- rationale: implementation extends the existing permission-versus-gate authority and CLI/runtime
  composition invariants with content-bound renewal, explicit-decision preservation, honest
  distribution-profile capability and direct host-evidence separation. Durable graph evidence should
  be added only after implementation and verification establish the invariant.

## Minimal Clean Implementation Path

Add and validate the canonical capability manifest and identity first. Build the pure receipt/state
and argument-free session-check components against existing provenance and validator owners. Add
focused host adapters and their negative fixtures before installer/CLI integration. Extend lifecycle
projection and partial-failure handling. Then update canonical documentation and public submission
sources, synchronize generated assets, run focused-to-aggregate verification and persist `CD_TESTS.md`.
Keep unsupported or unobservable host/profile cells manual, unavailable or unverified.

## Required Next Step

Proceed to `CD+Tests` for IRC-01 through IRC-16 within TP Section 3. Do not mutate real host
configuration, publish, release, commit, push or create a pull request under TP approval.
