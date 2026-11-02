# Solution Design: Lean Interaction Ownership and Version-Matched Local Validation

Status: approved
Gate: SD
Date: 2026-07-18
Derived from: `UR.md`; `BROWNFIELD_REVIEW.md`; approved `PRD.md`
Gate approval: `Approval: SD` provided on 2026-07-18 after same-run, same-gate, revision-11 and
durable-artefact revalidation.
Approval readiness: approved; the design retains existing gate authority and machine enums, defines
one runtime owner and provides fail-closed surface resolution without routine registry access.

## 1. Architecture Decision

Apply four coordinated, ownership-oriented changes without introducing a parallel governance path:

1. `plugin/meta/contracts/interaction.md` is the only normative owner of native interaction,
   localization, outcome and fallback semantics. `gate-check/SKILL.md` becomes a compact orchestrator
   that loads the focused contracts and performs only gate-specific work.
2. Brownfield Review owns proportional routing and records its Mode/Slice result in the same internal
   operation. Human output calls a post-UR `quick_task` **Compact Delivery**, while persisted and JSON
   values remain unchanged.
3. Global OpenCode `AGDF.md` owns the full surface boundary. Each of the nine global skills receives
   only a generated compact activation guard plus its focused Runtime Contract references.
4. `create-agdf/cli` remains the sole machine evaluator. A shared, thin surface resolver selects only
   an exact-version local runtime and reports availability explicitly. Codex and Claude receive a
   generated runtime bundle inside the full plugin; OpenCode resolves its existing config-local,
   version-pinned `create-agdf` package. Routine validation never invokes `npx` or the registry.

The runtime bundle is a derived release artefact, not an independently maintained implementation.
Its source, generation command, version and content digest are recorded and checked by integrity
tests.

## 2. Component Ownership

| Component | Responsibility | Design change |
|---|---|---|
| `plugin/meta/contracts/interaction.md` | Complete normative interaction semantics | Retain and consolidate all adapter, locale, native/fallback, waiting and outcome rules here. |
| `plugin/skills/gate-check/SKILL.md` | Gate-specific orchestration | Retain the six PRD responsibilities; replace detailed duplicated policy with focused contract loading. |
| Brownfield control evaluator and presentation | Determine proportional depth and explain the transition | Persist selection with completed review; render Compact Delivery only as human text for post-UR `quick_task`. |
| `plugin/meta/contracts/modes.md` and `gate-transition.md` | Machine-mode meaning and lifecycle transition | Clarify pure Quick Task versus Compact Delivery and preserve incomplete Mode/Slice recovery. |
| Global OpenCode `AGDF.md` generator | Full global/local activation boundary | Generate the full boundary once. |
| Global OpenCode skill generator | On-demand workflow instructions | Generate a compact fail-closed activation guard and keep skill-specific focused contract references. |
| `create-agdf/cli` | Doctor, gate-check, delivery-map and Delivery Path Search behavior | Remain the only command-policy and control-evaluation implementation. |
| Local runtime resolver | Locate, verify and invoke a validator | Add resolution and availability only; never interpret control state or approvals. |
| Runtime bundle generator | Produce the full-plugin local validator payload | Derive a deterministic bundle from the exact release's `create-agdf` sources and emit a signed-by-digest manifest. |
| Surface status/presentation | Expose evidence boundaries | Report owned/configured/external/unavailable/mismatch state without upgrading model inspection to machine evidence. |

## 3. Interaction Contract Consolidation

The gate-check skill keeps this executable sequence:

1. load the focused gate-transition and interaction contracts;
2. select and evaluate exactly one current run;
3. confirm the durable artefact is ready for the current gate;
4. consume the canonical approval presentation verbatim;
5. wait deliberately for input and revalidate the same run, gate and revision;
6. persist only an exact, currently valid approval through the existing control-state workflow.

Surface adapter tables, locale resolution, canonical option construction, transient outcomes, native
availability, timeouts, fallback authorization and permission ownership live only in
`interaction.md`. Integrity checks assert the six orchestration boundaries and the focused reference,
not copied phrases. Negative fixtures remove each required boundary independently so concision cannot
silently weaken execution.

## 4. Proportional Routing and Presentation

Brownfield Review completion becomes the normal atomic transition:

1. inspect the approved UR and affected system;
2. decide `quick_task | verified_change | structured_slice | structured_delivery | block`;
3. persist decision, reason, evidence and required next depth in the Brownfield record and run state;
4. render the next allowed action from the persisted result.

If a legacy or interrupted review lacks a selection, `Mode/Slice Decision` remains a blocking internal
recovery state. It is neither a gate nor a user approval.

Presentation mapping is context-sensitive and additive:

| Context | Human label | Machine value |
|---|---|---|
| Ungated eligible work | Quick Task | `quick_task` where a value is emitted |
| Approved UR, Brownfield-selected narrow delivery | Compact Delivery | `quick_task` |
| Wider governed work | Existing human labels | Existing enum values |

The immediate post-UR message says that Brownfield Review and proportional routing happen next and
that no user action is currently required. It does not predict PRD or present Brownfield Review as a
second decision for the user.

## 5. OpenCode Instruction Deduplication

`globalOpenCodeBoundary()` remains the generator for the full boundary but is consumed only by the
owned global `AGDF.md`. A separate `globalOpenCodeActivationGuard()` generates the short skill-local
guard. The guard performs only three jobs:

- require a valid `.agdf/control/config.json` before applying AGDF governance;
- fail closed when activation is missing or invalid; and
- point to the existing `opencode-repo` activation command.

It does not repeat namespace, global/local compatibility, installation or ownership explanations.
The current per-skill contract transformation remains, because those focused references differ and
are required when a skill is loaded on demand. Existing ownership markers, `agdf-global-*` names,
permissions and user-owned OpenCode configuration remain unchanged.

## 6. Local Validator Architecture

### 6.1 Common resolver contract

Add one small resolver owned with the CLI packaging code. It accepts:

- expected AGDF version;
- surface identifier;
- plugin or config root supplied by the active surface adapter;
- optional explicit `AGDF_VALIDATOR_PATH`; and
- command plus argument vector.

It returns a machine-readable envelope before or with invocation evidence:

```json
{
  "schema_version": "1",
  "machine_validation": "owned_version_matched",
  "surface": "codex",
  "expected_version": "0.10.1",
  "observed_version": "0.10.1",
  "source": "plugin_bundle",
  "registry_access": false
}
```

Allowed availability values are:

- `owned_version_matched`: active full surface owns an exact-version runtime;
- `configured_version_matched`: explicit local validator path passed exact-version verification;
- `external_required`: instruction-only distribution intentionally ships no runtime;
- `unavailable`: no eligible local runtime exists; agent-native inspection may continue where the
  interaction contract allows it, but it is not machine-validation evidence;
- `version_mismatch`: a candidate exists but differs from the active surface; fail closed and do not
  invoke normal commands.

The resolver performs no repository evaluation. It verifies metadata or `--version --json`, then
delegates the unchanged argument vector to `create-agdf/cli`. Adding a stable version query to the
canonical CLI is permitted; command semantics remain in the existing CLI modules.

### 6.2 Resolution order

1. Resolve the surface-owned runtime from a deterministic root, read its manifest and verify exact
   version plus digest before execution.
2. If absent, inspect the explicitly supplied absolute `AGDF_VALIDATOR_PATH`, query its version and
   accept it only on an exact match.
3. Otherwise return the surface's declared `external_required` or `unavailable` result.

The resolver never searches an unconstrained shell `PATH`, never selects `latest`, never installs a
package and never falls through to `npx`. A mismatch is terminal for machine validation so a stale
owned runtime cannot be hidden by a different global executable.

### 6.3 Codex and Claude full plugins

Add `plugin/runtime/` as an owned full-plugin resource containing:

- a deterministic entrypoint/resolver;
- the exact `create-agdf/cli` runtime payload required by supported commands; and
- `runtime-manifest.json` with AGDF version, source package version, entrypoint and content digest.

The payload is generated from the current `create-agdf` package during source synchronization and
checked in as a derived artefact for marketplace distribution. A generation banner and integrity
comparison prohibit hand maintenance. Both Codex and Claude manifests already distribute the same
plugin root, so their skills resolve the runtime relative to the loaded skill/plugin location without
requiring global `PATH` mutation or a target repository's `node_modules`.

### 6.4 OpenCode full installation

The OpenCode installer already installs the release-matched `create-agdf` package below its config
root. It adds a stable owned resolver entrypoint under the AGDF-owned global area. That resolver reads
the config-local package metadata, verifies it against the installed global AGDF version and invokes
its exported CLI. `opencode-status` reports runtime availability separately from package, activation
and live-session status.

Global skills reference this stable local entrypoint. Legacy repository-local OpenCode assets may use
it when the global installation is healthy; they are not silently rewritten.

### 6.5 Instruction-only and repository-only surfaces

Copilot/generic instruction-only output, and any repository scaffold that does not include a full
plugin runtime, declares `external_required`. Guidance may offer an explicit pinned command for
installation or repair, using the expected version rather than `latest`, but routine skill execution
does not run it automatically. Agent-native inspection remains available with an explicit evidence
boundary.

## 7. Generation and Release Integrity

The existing synchronization pipeline gains one canonical runtime-bundle step. It:

1. reads the plugin definition and `create-agdf/package.json` versions and fails if they differ;
2. derives the runtime payload from `create-agdf/cli` and its transitive local modules;
3. writes deterministic content and a manifest digest under `plugin/runtime/`;
4. propagates the full plugin, including the runtime directory, through existing Codex/Claude package
   flows; and
5. lets runtime integrity reproduce and compare the digest so edited or stale generated code fails.

No evaluator source is authored under `plugin/runtime/`. The generated payload may contain copied
release bytes, but ownership and edits remain exclusively in `create-agdf`. OpenCode continues to use
the installed package directly and therefore does not receive a second payload.

## 8. Failure and Security Behavior

- Missing local runtime: return `unavailable` or `external_required`; do not claim deterministic
  validation and do not access the network.
- Version mismatch or digest mismatch: fail closed before normal CLI execution and name expected and
  observed versions without selecting another executable implicitly.
- Invalid explicit path: return unavailable diagnostics; never pass it through a shell string.
- Command invocation: use an argument vector and inherited working directory; no shell interpolation.
- Machine output: keep validator availability distinct from approval authority and gate readiness.
- OpenCode activation failure: the compact guard remains fail closed even when a validator exists.

## 9. Compatibility and Migration

- Persisted mode enums, gate order, exact approval strings and current JSON meanings remain stable.
- New validator availability fields are additive. Existing consumers that ignore them continue to
  work; AGDF-owned presentation must not call agent inspection a machine pass.
- Existing full Codex/Claude plugin installs gain the runtime on normal version update; no global
  package install or target-repository migration is required.
- Existing OpenCode config-local packages are recognized when exact-version matched. Repair remains an
  explicit install/refresh action.
- Existing legacy OpenCode repository files, user permissions and unrelated instructions are
  preserved.
- `npx --yes @agdf/cli@latest` remains valid only in explicit bootstrap/install/refresh copy and is
  removed from routine validator instructions.

## 10. Verification Design

| Requirement | Verification |
|---|---|
| One interaction owner | Runtime integrity and negative fixtures assert contract ownership, focused references and six orchestration boundaries without duplicate policy phrases. |
| Atomic proportional routing | Control-state fixtures cover completed Brownfield persistence, interrupted legacy recovery and unchanged enums. |
| Human terminology | Presentation fixtures distinguish ungated Quick Task from post-UR Compact Delivery and assert corrected no-action post-UR narration. |
| One OpenCode full boundary | Clean global install fixture counts one full boundary, nine compact guards and all focused contract targets. |
| Owned local validator | Clean Codex, Claude and OpenCode fixtures run offline `doctor --json`, `gate-check --json` and `delivery-map --json`. |
| Version/digest safety | Mismatch, corrupt bundle, invalid configured path and missing runtime fixtures fail closed without fallback execution. |
| No registry access | Tests place rejecting `npx`, `npm` and network stubs on `PATH`; routine commands still pass locally or report availability. |
| Single evaluator owner | Generated-runtime reproduction/digest test and source scan reject authored control-evaluation logic outside `create-agdf`. |
| Package/release parity | Package smoke, installed-layout integrity and exact version checks cover both plugin manifests and OpenCode config-local package. |
| Overall regression | Skill evaluations, interaction presentation, control-state, Runtime Integrity, aggregate smoke and `git diff --check`. |

Repository fixtures prove packaging and deterministic execution, not live authenticated host UI. Final
UAT must keep any direct Codex, Claude or OpenCode observation separate from repository evidence.

## 11. Rejected Alternatives

| Alternative | Rejection reason |
|---|---|
| Require a global `agdf` executable on `PATH` | Reintroduces install, permission, version-skew and shell-discovery dependencies. |
| Continue routine `npx --yes @agdf/cli@latest` | Requires network/registry resolution and can mismatch the active plugin version. |
| Install a sidecar package during every host plugin install | Host marketplace installs do not provide one uniform safe post-install package hook and would add mutable global state. |
| Copy a small gate/doctor evaluator into each skill | Creates multiple policy owners and predictable semantic drift. |
| Introduce a new `@agdf/runtime` package | Adds a release unit and ownership boundary without improving on the existing `create-agdf/cli` owner. |
| Remove all per-skill Runtime Contract references | Breaks focused on-demand skill dependencies; only the identical global boundary is redundant. |
| Rename the persisted `quick_task` enum | Creates unnecessary migration and consumer compatibility risk for a presentation problem. |

## 12. Risks and Mitigations

- Generated runtime size may increase plugin payload: include only the transitive production runtime
  needed by supported commands and record size in package smoke.
- Runtime derivation could become stale: reproduce it in prepack/integrity checks and fail on version or
  digest drift.
- Skill concision could omit an execution boundary: assert all six operational responsibilities with
  independent negative fixtures.
- Compact Delivery could drift from `quick_task`: bind label and enum in one presentation mapping and
  test JSON separately.
- Global OpenCode instructions may not be present in a broken install: each skill retains its compact
  activation guard and fails closed.
- Host packaging details may change: validate installed layouts for Codex and Claude and avoid treating
  live-host behavior as proven by fixtures alone.

## 13. Traceability

| PRD requirement | Design owner |
|---|---|
| PRD-01 / AC-01 | interaction contract consolidation and ownership-oriented integrity fixtures |
| PRD-02 / AC-02 | atomic Brownfield transition and context-sensitive presentation mapping |
| PRD-03 / AC-03 | one global boundary generator plus compact skill activation guard |
| PRD-04 / AC-05 | common resolver, derived full-plugin bundle and OpenCode config-local adapter |
| AC-04 | generation, installed-layout, interaction, control-state and skill-evaluation regression plan |

## 14. Next Step

Request exact `Approval: SD`. Task Plan work, implementation and product-file changes remain forbidden
until SD is approved. After approval, draft the TP and request `Approval: TP`; repeat Brownfield Analysis
immediately before non-trivial implementation.
