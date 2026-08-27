# SD: Informed Installation Consent for Automatic AGDF Runtime Checks

Status: approved; revision 2
Gate: SD
Gate approval: exact `Approval: SD` recorded 2026-08-27 after same-run, same-gate and revision-2 revalidation
Based on: approved `PRD.md` revision 1, completed `BROWNFIELD_REVIEW.md` and ready
`UX_INTENT_DEFINITION.md`
Date: 2026-08-27
Owner: Arndt Gold

## 1. Solution Summary

Extend the existing AGDF installation lifecycle with one shared runtime-check consent contract and
three thin host adapters. The installer asks before the first consent-dependent mutation. It can
enable the narrow capability, retain manual mode or cancel. Status and revocation use the same
contract and existing lifecycle presentation.

Replace the shell-oriented session-start path with one generated, argument-free Node entrypoint that
calls the existing version-matched validator in read-only mode. The fixed entrypoint is the only
automatic executable capability. It accepts no arbitrary command, path or validator subcommand,
performs no write or network operation and returns one bounded orientation envelope.

```text
install/update command
  -> consent preflight and disclosure
  -> deliberate enable | manual | cancel
  -> existing host plugin installation
  -> resolve installed runtime and capability identity
  -> host adapter applies or preserves host-native state
  -> verify host state + write non-authoritative intent receipt
  -> existing lifecycle result and one next action

fresh host session
  -> host-native hook/plugin activation
  -> fixed agdf-session-check.js entrypoint
  -> existing local validator read-only composition
  -> bounded orientation envelope
```

No adapter receives AGDF gate authority. No general Bash, PowerShell, Node, filesystem or network
permission is added.

## 2. Source Of Truth And Ownership

| Concern | Canonical owner | Design action |
|---|---|---|
| Product and host capability metadata | `plugin/meta/agdf-plugin.definition.json` | Add a versioned `automaticRuntimeChecks` contract and per-host adapter declarations. |
| Consent contract and capability identity | new `create-agdf/lib/runtime-check-consent/contract.js` | Normalize the disclosed operations and calculate one deterministic capability identity. |
| Intent receipt and state derivation | new `create-agdf/lib/runtime-check-consent/state.js` | Read/write only an AGDF-owned, non-authoritative receipt and combine it with host evidence. |
| Consent orchestration | new `create-agdf/lib/runtime-check-consent/coordinator.js` | Preflight, deliberate outcome, apply, verify, rollback and renewal orchestration. |
| Fixed automatic check | new `create-agdf/lib/runtime/session-check.js` and generated `runtime/agdf-session-check.js` | Compose existing read-only validator functions; accept no user command or subcommand. |
| Codex/Claude installation | `create-agdf/lib/installers/plugin-installers.js` | Return installed-root and provenance evidence; delegate consent application to the coordinator. |
| OpenCode installation/configuration | `create-agdf/lib/installers/opencode.js` | Preserve missing-only config merge and explicit decisions; expose plugin/config evidence to its adapter. |
| Host adapters | new `create-agdf/lib/runtime-check-consent/adapters/{codex,claude,opencode}.js` | Translate shared intent into host-native trust, permission or plugin state only. |
| CLI interaction and options | `create-agdf/lib/cli/{parse-args,command-registry,application}.js` | Add explicit consent options and one narrow status/revocation command path. |
| Lifecycle result and presentation | `create-agdf/lib/lifecycle/{result,presentation,status}.js` | Add one `automatic_runtime_checks` projection; keep existing card and status owners. |
| Plugin hooks | canonical plugin definition plus generated host manifests | Invoke the fixed entrypoint with host-native command shape; remove the shared Bash wrapper assumption. |
| Provenance, staging and rollback | existing `local-marketplace.js`, `plugin-provenance.js` and lifecycle owners | Reuse version, digest, ownership and atomic-write evidence. |
| Generated outputs | existing sync pipeline | Generate Codex, Claude Code and OpenCode projections; never edit installed caches or generated bundles manually. |

## 3. Shared Consent Contract

### AD-1: One canonical capability manifest

Add `automaticRuntimeChecks.schemaVersion = 1` to the canonical plugin definition. It declares:

```json
{
  "entrypoint": "runtime/agdf-session-check.js",
  "arguments": [],
  "operations": [
    "resolve_installed_runtime",
    "verify_version_digest_and_provenance",
    "read_repository_agdf_control",
    "derive_selected_run_orientation"
  ],
  "filesystem": { "mode": "read_only", "classes": ["installed_plugin", "repository_agdf_control"] },
  "network": "none",
  "writes": "none"
}
```

`contract.js` validates this closed vocabulary and produces canonical JSON. Unknown operations,
arguments, write modes or network modes fail Runtime Integrity and cannot be consented to.

### AD-2: Capability identity is content and scope bound

The identity is SHA-256 over canonical fields:

```text
schema_version
surface
canonical capability manifest
runtime digest
installed source digest
normalized fixed command descriptor
permission adapter contract version
```

Version text and path alone are insufficient. A material change to any field creates a new identity
and makes prior automatic mode `renewal_required`. An unchanged identity may survive a version-only
update. The host adapter never treats a receipt hash as permission evidence.

### AD-3: One non-authoritative intent receipt

Store a small owner-marked JSON receipt below the existing AGDF data/config root, scoped by surface:

```json
{
  "schema_version": 1,
  "owner": "create-agdf",
  "surface": "claude",
  "requested_mode": "enabled",
  "capability_id": "sha256:...",
  "adapter_contract_version": 1,
  "owned_host_mutations": [],
  "recorded_at": "..."
}
```

The receipt records intent, identity and exact installer-owned mutations for inspection and safe
revocation. It is written atomically only after host application. It never establishes effective
permission, never contains AGDF approvals and is not stored in a repository. Missing, malformed,
unowned or mismatched receipts yield manual or renewal-required state.

The location follows native platform roots already owned by the installers: the AGDF data root for
Codex and Claude Code and the selected OpenCode config root for OpenCode. Path construction uses
`path.win32` for injected/native Windows and `path.posix` otherwise.

## 4. Fixed Read-Only Session Check

### AD-4: Replace shell composition with an argument-free Node entrypoint

Generate `runtime/agdf-session-check.js` beside `agdf-local.js`. It:

1. rejects every CLI argument;
2. derives its installed plugin/config-local root from `import.meta.url` and existing provenance;
3. resolves the current working repository without accepting an arbitrary path argument;
4. calls existing local-validator library functions for resolve-only identity, focused doctor and
   selected-run orientation;
5. performs no initialization, persistence, registry access or network request; and
6. prints one versioned JSON envelope plus bounded human orientation for the host hook.

It is a composition entrypoint, not a second validator. Gate order, approvals, selection and health
semantics remain in the existing control-evaluation owners. No `exec`, shell interpolation, dynamic
module path or arbitrary subcommand is accepted.

The entrypoint reads only the installed plugin/runtime files and `.agdf/control/` within the session
working directory. Symlink, ownership and provenance checks reuse existing validators. Missing or
ambiguous control state produces a bounded non-mutating orientation, not an installation failure.

### AD-5: Host-specific generated hook commands

Stop projecting one POSIX Bash wrapper as the shared host command.

- Codex manifest uses its native command plus `commandWindows` override and the installed plugin-root
  variable supported by the generated Codex bundle.
- Claude Code manifest uses its plugin root and separate command/argument fields supported by its
  plugin hook schema; Windows uses `node.exe` and native path expansion without `bash -lc`.
- OpenCode invokes the shared library entrypoint from its existing plugin process. It does not spawn
  a shell command or widen `permission.bash`.

Generated manifest tests assert POSIX and Windows command construction separately. Native-Windows
evidence remains mandatory before any Windows cell is marked supported.

## 5. Host Adapter Decisions

### AD-6: Codex delegates consent to hash-bound hook trust

Official Codex behavior requires users to review and trust the exact non-managed hook definition;
trust is recorded against its current hash and changed hooks require review again. The Codex adapter
therefore does not write or bypass hook trust.

- Enable means install the plugin, show the disclosure and direct the user to the native hook review
  when the current hook hash is not trusted.
- Effective state is `enabled` only when a fresh Codex session runs the current fixed hook from the
  intended installed root.
- Changed hook definitions rely on Codex's native hash renewal and also change the AGDF capability
  identity.
- `--dangerously-bypass-hook-trust` is never invoked or recommended by this flow.
- Revocation directs the user to `/hooks` or disables the plugin through the existing host lifecycle;
  AGDF does not edit Codex trust storage.

The installer choice can be `decision_required` until native review is complete. Installation
success is not trust success.

### AD-7: Claude Code receives only exact fixed-entrypoint rules

The Claude adapter may update the user-scope permissions file only after explicit enablement and
ownership/conflict preflight. It adds the exact host-native rule for the argument-free installed
entrypoint:

```text
macOS/Linux: Bash(<exact node executable> <exact installed agdf-session-check.js path>)
Windows:     PowerShell(<exact node executable> <exact installed agdf-session-check.js path>)
```

No wildcard, shell operator, variable command, validator subcommand or directory-wide rule is
allowed. The exact installed path and capability identity are derived only after installation.
Existing deny and ask rules retain precedence. If they conflict, no override is attempted and the
result is manual with the authoritative conflict shown.

The adapter parses and validates the current JSON, snapshots the exact permission array, applies one
minimal additive mutation atomically and re-reads it. The receipt records the exact inserted rule.
Revocation removes only that recorded exact rule after revalidation. If ownership or current content
is ambiguous, it leaves configuration unchanged and points to Claude Code `/permissions`.

On update, a changed capability identity removes the old recorded exact rule only as part of the
same consent transaction. The new rule is not added without renewed enablement. A failed permission
write restores the prewrite file when its transaction evidence still matches; the plugin remains
installed and usable in manual mode.

### AD-8: OpenCode preserves explicit decisions and avoids Bash allow rules

The OpenCode adapter keeps the existing missing-only merge behavior and never changes an explicit
`allow`, `ask` or `deny`. It does not add a Bash or shell permission for runtime checks. The installed
AGDF plugin invokes the fixed read-only session-check library internally only when the current
receipt requests enablement and the installed package, plugin activation and capability identity all
match.

Effective state requires:

1. the AGDF package is configured and loadable from the selected config root;
2. the plugin hook is active in the observed host SDK;
3. the intent receipt matches the current capability identity; and
4. no explicit host or managed policy blocks the plugin path.

If live hook execution cannot be observed, status remains unverified or manual. Existing
`permission.bash: ask` and user-defined rules remain unchanged.

## 6. Interaction And CLI Design

### AD-9: Consent happens before mutation

For `codex`, `claude` and `opencode` install/update commands:

- default with an interactive TTY: render the canonical disclosure and ask enable, manual or cancel;
- `--automatic-runtime-checks enable|manual`: explicit non-interactive-safe selection;
- `--json` or no TTY without the explicit option: select manual, report `consent_not_provided`, and
  do not prompt;
- cancel: stop before marketplace, plugin, config or receipt mutation.

The parser rejects missing/unknown values and rejects interactive prompting with `--json`. The
prompt implementation uses `node:readline/promises` through an injectable adapter for tests. A host
plugin UI may supply the same canonical values, but decorated labels never become authority.

Add one narrow lifecycle command:

```text
npx --yes @agdf/cli@latest runtime-checks --surface <codex|claude|opencode> status [--json]
npx --yes @agdf/cli@latest runtime-checks --surface <surface> enable [--json]
npx --yes @agdf/cli@latest runtime-checks --surface <surface> manual [--json]
```

`status` is read-only. `enable` repeats disclosure and deliberate confirmation unless the exact
non-interactive option was supplied. `manual` revokes only verified installer-owned state and leaves
the plugin installed. This is routed through existing lifecycle result/presentation owners and is
not a second settings product.

### AD-10: Additive lifecycle projection

Keep lifecycle `schema_version: 1` and add:

```json
{
  "automatic_runtime_checks": {
    "requested": "enabled",
    "effective": "decision_required",
    "capability_id": "sha256:...",
    "host_authority": "codex_hook_trust",
    "verification": "pending_host_review",
    "mutation": "none",
    "next_action": "Review the current AGDF hook in /hooks."
  }
}
```

Canonical effective values are `decision_required | enabled | manual | renewal_required |
unavailable | degraded | cancelled | failed`. The overall lifecycle `next_action` remains exactly
one action and prioritizes a required host review or restart truthfully. JSON never exposes sensitive
configuration content.

General status composes installation, activation, automatic runtime checks and delivery as separate
sections. None inherits health or authority from another.

## 7. Transaction, Migration And Rollback

### AD-11: Installation and consent are separate recoverable phases

The coordinator uses these phases:

1. inspect current installation, receipt and host state without mutation;
2. build disclosure and obtain deliberate outcome;
3. cancel or record the intended manual path before host permission changes;
4. run the existing plugin installation transaction;
5. resolve and verify the final installed root and capability identity;
6. snapshot and apply only the host adapter mutation;
7. verify effective host configuration and atomically write the receipt; and
8. render the combined lifecycle result.

If phase 6 or 7 fails, roll back only the proven consent/config mutation. Keep a successfully
installed plugin and report manual mode plus recovery. Existing marketplace rollback remains owned
by its installer transaction and is not duplicated.

Existing installations without a current receipt migrate to `decision_required` in interactive
status or `manual` in non-interactive operation. No existing host rule is claimed as AGDF-owned.
Explicit deny/ask/manual decisions are never upgraded. A legacy AGDF receipt format is accepted only
if a future migration is explicitly designed and digest matched; revision 1 defines no legacy format.

On Windows, atomic receipt/config writes use the existing bounded `EPERM` retry and ownership-safe
swap mechanics. Rollback paths use native path semantics, no symlink assumption and no POSIX
executable-bit dependency.

## 8. Security And Authority Invariants

1. Installation consent never produces or consumes `Approval: <GateName>`.
2. The fixed entrypoint accepts no arguments and cannot dispatch arbitrary commands.
3. Automatic checks make no write and no network call.
4. A broad Bash, PowerShell, Node, filesystem or directory rule is invalid output.
5. Host-native trust, permissions and managed policy remain execution authority.
6. A receipt without matching host evidence cannot produce `enabled`.
7. A changed capability identity cannot inherit prior automatic mode silently.
8. Unknown ownership, malformed config or conflicting policy performs no mutation.
9. Repository, package, installed-root and fresh-session evidence remain distinct.
10. No generated bundle, host cache or user configuration is edited outside its existing owner and
    transaction boundary.

## 9. Platform Capability And Evidence Plan

| Surface | macOS/Linux design | Native Windows design | Release evidence |
|---|---|---|---|
| Codex | Native exact-hash hook review; fixed Node hook command | `commandWindows`, native Node path and Codex hook review | Direct install, review, enabled, changed-hash renewal, revoke/disable and fresh-session observation per OS |
| Claude Code | Exact `Bash(...)` fixed-entrypoint rule with conflict preservation | Exact `PowerShell(...)` fixed-entrypoint rule, native settings path and atomic rollback | Direct enable/manual/cancel/conflict/update/revoke/rollback/fresh-session observation per OS |
| OpenCode | Plugin-internal fixed entrypoint gated by matching receipt and active plugin evidence | Native config root/path handling and plugin-internal execution without shell allow | Direct config, plugin activation, enable/manual/revoke/update/fresh-session observation per OS |

Repository tests include injected `path.posix` and `path.win32`, quoting fixtures, JSON ownership,
permission precedence and `EPERM` rollback. They are supporting evidence only. Native-Windows release
support remains blocked until direct execution proves PowerShell command matching, actual config
locations, ACL behavior, atomic replacement, restart and fresh-session state.

## 10. Integration Points

| Integration point | Required change |
|---|---|
| `plugin/meta/agdf-plugin.definition.json` | Add capability manifest, adapter versions and host command templates. |
| generated Codex/Claude manifests | Render host-specific session hook commands including Windows overrides. |
| `create-agdf/lib/runtime/session-check.js` | Add argument-free composition over existing validator/control evaluators. |
| `create-agdf/lib/runtime-check-consent/` | Add contract, identity, receipt, coordinator and thin adapters. |
| `create-agdf/lib/installers/plugin-installers.js` | Expose final installed root/provenance; coordinate post-install consent without weakening marketplace rollback. |
| `create-agdf/lib/installers/opencode.js` | Expose config/plugin evidence and preserve explicit permissions; no Bash allow mutation. |
| `create-agdf/lib/cli/` | Add consent option, narrow `runtime-checks` command and injectable deliberate prompt. |
| `create-agdf/lib/lifecycle/` | Add automatic-runtime-check projection and combined one-action presentation. |
| `plugin/scripts/check-runtime-integrity.mjs` | Enforce capability vocabulary, fixed entrypoint, generated command parity and no broad permission rule. |
| existing installer/runtime/lifecycle tests | Add interaction, identity, migration, ownership, rollback and evidence-plane fixtures. |
| `INSTALL.md` and package README | Document disclosure, manual default, status, revocation, renewal and host/OS limitations. |
| `plugin/meta/agdf-plugin.definition.json` public distribution fields | Own the concise public promise, legal/support URLs and install-surface wording. |
| `plugin/submission/openai/{capability-matrix.json,reviewer-cases.json,release-notes.md,availability.md}` | Carry review-ready capability boundaries, positive/negative cases, release delta and availability truth. |
| `create-agdf/lib/public-plugin/{builder,contract,validator}.js` | Generate and validate `listing.json`, the candidate inventory/readiness evidence and required submission material without hand-editing generated output. |

## 11. Verification Plan

1. Contract tests reject arguments, writes, network, unknown operations and broad host rules.
2. Identity tests cover changed runtime digest, source digest, operation scope, command and adapter
   version; an identity-equivalent version update remains stable.
3. Prompt tests cover enable, manual, cancel, empty/invalid input, no TTY, JSON and explicit CLI
   selection without automatic timeout.
4. Fixed-entrypoint tests prove no arguments, no registry/network/write path, bounded output and
   delegation to existing gate/doctor semantics.
5. Codex fixtures cover native trust pending, observed execution, changed hook hash, disabled hook
   and no trust-store mutation.
6. Claude fixtures cover exact Bash/PowerShell rules, deny/ask precedence, malformed/unowned config,
   minimal write, update replacement, revoke, rollback and no wildcard.
7. OpenCode fixtures prove missing-only config behavior, preserved explicit decisions, no Bash allow
   change, receipt mismatch and unobserved hook state.
8. Lifecycle fixtures cover requested/effective separation, one next action and simultaneous healthy
   installation with manual or renewal-required automatic checks.
9. POSIX and win32 path/quoting suites run without platform skips; `EPERM` retry remains bounded.
10. Public-plugin contract tests prove that listing copy, capability matrix, release notes, legal and
    support URLs, and reviewer cases describe consent, manual mode, revocation, host authority and
    unverified host/OS cells consistently.
11. Existing lifecycle, installer, local-marketplace, Runtime Integrity, package, public-candidate,
    smoke, doctor and
    whitespace suites pass without weakened assertions.
12. Direct host evidence covers every release-claimed host/OS matrix cell. Native Windows must cover
    installation, disclosure, enable, manual, status, revoke, renewal, rollback and fresh session.

## 12. Rejected Alternatives

- Blanket Bash, PowerShell or Node allow rules: too broad and survive unrelated command changes.
- Trusting a stable script path without content identity: stale permission could execute changed
  code.
- Using one wildcard Claude rule for validator subcommands: wildcard text can cover unintended shell
  content and violates the fixed-capability requirement.
- Writing Codex trust state: Codex owns exact-hash hook review and renewal.
- Making OpenCode `permission.bash` allow: the plugin can use its internal read-only entrypoint and
  existing explicit decisions must remain untouched.
- Treating the AGDF receipt as permission authority: it cannot prove host-effective state.
- Per-repository consent: the capability belongs to one installed host/runtime identity; repository
  state may narrow but not widen it.
- One shared Bash hook wrapper: not native-Windows-safe and creates shell/quoting drift.
- MCP or hosted validation service: unnecessary parallel runtime and authority surface for a local
  fixed check.

## 13. Compatibility And Rollout

- Existing commands remain compatible; absent consent options preserve installation and select the
  safe interactive/manual behavior defined above.
- Existing host permissions and plugin configuration are preserved unless one exact new capability
  is deliberately enabled or a proven AGDF-owned rule is revoked.
- Lifecycle schema version remains 1 with additive data.
- Existing installations remain usable in manual mode.
- Generated assets are refreshed through `npm run release:prepare`; no installed cache is patched.
- Release may be partial by host/OS cell. Documentation must label manual, degraded, unsupported and
  unverified outcomes honestly.
- The Context Graph updates existing nodes `CG-NATIVE-INTERACTION-AUTHORITY` and
  `CG-CREATE-AGDF-CLI-COMPOSITION`; no parallel authority node is introduced.

## 14. Public Codex Plugin Documentation And Review Material

The installation-consent behavior is part of the public product promise and must be visible before
and after installation. It must not live only in this SD or in developer-facing implementation
notes. Reuse the existing public-distribution pipeline and assign each level one clear role:

| Documentation surface | Required content | Owner |
|---|---|---|
| Public plugin listing | State that AGDF can run narrow local read-only runtime checks, that the user chooses enable or manual mode, that no network/write/general shell permission is requested, and that host-native trust remains authoritative. | Canonical `publicDistribution` metadata projected by `public-plugin/builder.js` to generated `listing.json` |
| Plugin install surface | Present the concise permission purpose and manual alternative before installation consent; link to details and support. | Generated `.codex-plugin/plugin.json` interface metadata and host-native hook review |
| `INSTALL.md` | Explain the full enable/manual/cancel journey, exact covered checks, status, revocation, renewal, host differences, non-interactive default and Windows evidence boundary. | Existing installation documentation owner |
| Package README | Provide the command reference for install options and `runtime-checks` status/enable/manual operations without duplicating the full policy narrative. | Existing CLI package documentation owner |
| Privacy and support pages | Confirm that the covered automatic checks are local, read-only, non-telemetric and network-free; explain support and recovery without implying broader data access. | Existing public URLs from canonical plugin definition |
| Capability matrix | Record each Codex/Claude/OpenCode and OS outcome as supported, manual, degraded, unsupported or unverified with the correct evidence plane. | `plugin/submission/openai/capability-matrix.json` |
| Reviewer cases | Add positive install/enable/manual/revoke/renewal cases and negative broad-permission, stale-consent, managed-denial and unsupported-Windows cases. | `plugin/submission/openai/reviewer-cases.json` |
| Release notes | Name the new consent decision, migration/default behavior, renewal trigger, revocation path and any unsupported host/OS cells. | `plugin/submission/openai/release-notes.md` |

The public listing stays concise and user-oriented. Technical command patterns, receipt fields and
adapter internals remain in `INSTALL.md`, the package README and review evidence. Copy must use the
same canonical capability manifest as the implementation; a separate marketing description of the
permission scope is forbidden.

The public candidate builder must fail when:

- required consent/manual/revocation disclosure is missing from the canonical listing source;
- the capability matrix claims a host/OS cell without the required evidence reference;
- release notes omit the behavior or migration change;
- reviewer cases do not cover both deliberate enablement and safe denial/manual behavior;
- privacy, support or terms URLs drift from the canonical plugin definition; or
- generated listing/install copy implies that installation consent grants AGDF delivery authority.

Repository and bundle validation can establish documentation coherence. They cannot establish
publisher verification, portal acceptance, publication, installed-host behavior or human UAT. Those
remain separate release evidence and authority.

## 15. External Capability Evidence

- Codex hooks: `https://learn.chatgpt.com/docs/hooks` documents exact-hash trust for non-managed
  hooks, re-review after changes, `/hooks`, plugin hook participation and `commandWindows`.
- Codex plugins: `https://learn.chatgpt.com/docs/plugins` keeps plugin installation separate from
  requested permissions and requires plugin hook review/trust.
- Claude Code permissions: `https://code.claude.com/docs/en/permissions` documents exact command
  rules, deny/ask/allow precedence, user/repository settings and PowerShell behavior.
- Claude Code hooks: `https://code.claude.com/docs/en/hooks` documents plugin hook locations,
  SessionStart, command/argument configuration and native Windows PowerShell examples.
- OpenCode permissions and plugins: `https://opencode.ai/docs/permissions/` and
  `https://opencode.ai/docs/plugins/` are capability evidence only; the checked-in installer and
  observed installed SDK remain implementation evidence.

External documentation does not prove installed-host behavior. TP and QA must retain direct evidence
obligations and version the observed host capabilities.

## 16. Next Gate

Solution Design Revision 2 is approved. A Task and Test Plan may be drafted; implementation remains
forbidden until exact TP approval and the mandatory pre-implementation Brownfield Analysis pass.
