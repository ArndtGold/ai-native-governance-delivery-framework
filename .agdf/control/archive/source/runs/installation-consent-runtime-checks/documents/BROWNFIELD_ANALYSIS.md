# Brownfield Analysis: Installation Consent for Automatic Runtime Checks

Revision: 3

## Codex Hook Correction, 2026-09-05

- mode: `pre_implementation_analysis`
- decision: `pass` for the bounded correction below
- approved scope: UR Revision 2, SD Revision 3 AD-2/AD-6, TP Revision 2 IRC-07/10/14/16
- baseline: `4d38db394d05bf2afb5280dc3af92dfee042a2bb`; tracked and untracked
  snapshot and both existing diffs captured before edits in
  `/private/tmp/agdf-codex-hook-fix-baseline/`
- existing changes: dispatcher and Copilot work already modify the CLI and tests; preserve every
  pre-existing hunk. This correction owns only its native Codex observation, projection and tests.
- coverage before correction: `partially_done`. `codexRuntimeCheckEvidence` can return enabled even when
  `reviewRequired` is true. CLI install/status paths never obtain the native `hooks/list` result,
  so their generic permission guidance cannot distinguish modified from already trusted hooks.
- initial normalized finding: `IRC-CODEX-01 | implementation_gap | CD+Tests | open`
- correction outcome: `resolved`; native observer and adapter/CLI regression evidence are recorded
  in `CD_TESTS.md`, `CODE_REVIEW.md` and `CODEX_HOOK_EVIDENCE.md`.
- reuse strategy: extend the existing runtime-check consent adapter and existing async CLI
  handlers. One bounded stdio client reads only initialization metadata and `hooks/list`; it
  creates no task, executes no hook, writes no trust and exposes no general RPC operation.
- evidence: the original desktop probe returned enabled plus `trustStatus: modified`; the current
  CLI 0.145.0 and desktop 0.153.4 both return trusted and the same hash. The installed plugin hash
  is also identical across the previously observed local-digest root and current release root.
- corrected hypothesis: the cache path change does not explain the stale trust record. Codex
  normalizes plugin-root differences. Do not change the hook command or add a stable-path wrapper
  to solve an unproven path problem. The older trusted definition remains unknown.
- change boundary: `runtime-check-consent/`, existing CLI async handlers, lifecycle copy and
  directly corresponding tests. Preserve the shared capability identity, receipt schema, plugin
  hook definition, dispatcher binding and native trust authority.
- effective-state boundary: trusted metadata proves permission, not execution. It must never
  produce `enabled` or a fresh-session pass without the required runtime evidence. Manual mode
  and content-bound renewal remain authoritative.
- tests: modified/untrusted/disabled/trusted/ambiguous/unavailable native observations, bounded
  transport failure, no mutating RPC, retained trust on an identity-equivalent update, explicit
  review on a changed native definition and CLI human/JSON recovery parity.
- context_graph_impact: `update_existing_node`, reusing `CG-NATIVE-INTERACTION-AUTHORITY`
  and `CG-CREATE-AGDF-CLI-COMPOSITION`; reconcile before closeout.
- required_next_step: implement IRC-CODEX-01, refresh the existing reviews and retain unrelated
  host/OS evidence gaps. No new gate approval or scope expansion is needed for this correction.

The sections below retain the previous implementation baseline and analysis for traceability.

## Decision

- mode: `pre_implementation_analysis`
- decision: `pass`
- mode_slice_decision: `structured_delivery`
- required_next_gate: `CD+Tests`
- artefact: `.agdf/control/artefacts/installation-consent-runtime-checks/BROWNFIELD_ANALYSIS.md`

## Scope

Validate approved TP Revision 2 against the current consent coordinator, CLI interaction, receipt,
installer transaction and regression owners. Confirm that every interactive install or update can
offer enable, manual or cancel without creating another interaction owner, weakening non-interactive
policy or causing a second native host trust prompt for identity-equivalent content.

## Baseline And Selected Run

- selected run: `installation-consent-runtime-checks`
- approved plan: TP Revision 2 through exact `Approval: TP` on 2026-08-27
- repository baseline: `753124e20adebb44acf53817823300cf73ea0ac8`
- observed worktree before this revision: the existing implementation paths are already dirty from
  this run's prior delivery; the new correction remains bounded to the current CLI consent owner,
  focused tests, documentation and this run's evidence artefacts
- source version: canonical plugin definition `0.13.7`
- validation boundary: the active Codex session runtime is version-matched
  `0.13.7+codex.local-b397dc228a8a`; repository verification still uses canonical source generation
  and must not infer fresh-session success

## Existing Owners And Reuse Path

| TP tasks | Existing owner | Coverage before implementation | Reuse action |
|---|---|---|---|
| IRC-02/05 | `plugin/meta/agdf-plugin.definition.json`; `create-agdf/lib/runtime/plugin-provenance.js`; `.agdf-installation.json` | partially_done | Add one canonical capability declaration and derive its identity from existing normalized source/runtime digest evidence. Persist only a bounded owner-marked intent receipt; do not duplicate installation provenance or host-effective state. |
| IRC-03 | `create-agdf/lib/runtime/local-validator.js`; validator handlers; generated runtime sync | partially_done | Compose the argument-free session check from existing resolution and read-only evaluation owners. Add no gate, validator or lifecycle semantics. |
| IRC-04/07 | canonical Codex hook manifest; `plugin/hooks/`; Codex native exact-hash review | partially_done | Generate native POSIX and Windows commands through the canonical manifest owner. Observe Codex trust only; never write or bypass the host trust store. |
| IRC-04/08 | Claude plugin hooks; `create-agdf/lib/installers/plugin-installers.js`; host permission settings | partially_done | Use one exact fixed-entrypoint rule only when the installed command identity and settings ownership are observable. Preserve deny/ask precedence and degrade to manual when exact effective state cannot be proven. |
| IRC-04/09 | `create-agdf/lib/installers/opencode.js`; config-local runtime and plugin hook evidence | partially_done | Extend the existing missing-only merge and plugin/config inspection. Preserve all explicit permissions and leave `permission.bash` unchanged. |
| IRC-06/10/11 | `installConsentDecision()` in `create-agdf/lib/cli/application.js`; `retainCurrentInstallConsent()`; lifecycle result/status/presentation; installer transactions | partially_done | Keep one interaction owner. Interactive calls must read retained state only for visible context and always invoke the existing decision adapter. Explicit CLI, JSON and no-TTY paths remain non-interactive. Cancel still returns before every plugin, permission or receipt mutation. |
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

- Removing the interactive retained-consent shortcut must not remove `retainCurrentInstallConsent()`
  from non-interactive compatibility paths or state inspection without evidence. Branch first on
  explicit option, then interactive presentation, then retained/no-TTY behavior.
- The prompt must expose `Current decision: enabled|manual` without treating it as a default. Empty
  or invalid input remains cancel.
- Choosing enable again for an unchanged capability may preserve native Codex or Claude trust, but
  the installer must still persist and report the deliberate current decision.
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
- first install plus identity-equivalent updates with enabled and manual receipts must all invoke
  the deliberate enable/manual/cancel adapter before mutation; current state is visible and no
  option is preselected;
- cancel on an update with retained consent must leave plugin, permission and receipt state intact;
- explicit CLI values, JSON and no-TTY behavior remain non-interactive and deterministic;
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
- context_graph_reconciliation: `resolved`
- context_graph_gate_effect: `none`
- context_graph_required_action: `update`
- rationale: `automatic_runtime_check_consent_2026_08_27` already records that every interactive
  install or update presents enable/manual/cancel while identical native trust may remain valid.

## Minimal Clean Implementation Path

Change only the current CLI consent decision composition so an interactive run never returns early
from retained consent. Add focused first-install, enabled-update, manual-update and cancel tests using
the existing injectable decision adapter and isolated data roots. Update install documentation and
run evidence only where their current wording permits silent reuse. Then run focused and aggregate
verification and refresh reviews. Keep unsupported or unobservable host/profile cells manual,
unavailable or unverified.

## Required Next Step

Proceed to `CD+Tests` for the TP Revision 2 delta within Section 3. Do not mutate real host
configuration, publish, release, commit, push or create a pull request under TP approval.
