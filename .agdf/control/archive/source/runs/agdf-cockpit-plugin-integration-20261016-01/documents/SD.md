# SD: Plugin-owned Cockpit with project-bound read views

Status: draft
Gate: SD
Gate approval: open
Based on: approved PRD
Date: 2026-10-16
Owner: Codex
Traceability contract: criteria-chain-v1
Design Decisions contract: sd-decisions-v1

## 1. Solution Overview

The Codex AGDF plugin declares two internal MCP servers through its existing generated `mcp.json`: the unchanged `agdf` governance/Decision App server and an `agdf-cockpit` read-only server. Both use the existing plugin launcher, exact-version package publication and runtime store. The feature and UI resource are named **Cockpit**. Existing tool names `agdf_cockpit` and `agdf_cockpit_read`, their UI resource URI and the existing React application are retained. The governance server's Decision App reader is not replaced or merged into the Cockpit reader. Display labels, declared server keys and host-exposed tool identities are distinct. Plugin membership alone is not assumed to prevent collisions; actual provider attribution is required before qualification or cutover.

The plugin Cockpit starts without a repository argument. Its opening tool accepts explicit target context and creates a view bound to the checked project. Every subsequent read carries only the existing opaque session/snapshot selectors. There is no global current project and no host-variable or cwd inference. The existing directory-bound local/Claude modes retain their current input contract.

Clean installation requires no extra setup. An existing local connection is transitioned separately through the existing CLI lifecycle owner after installed replacement verification. Retirement sets that exact legacy section to `enabled = false`, preserving its runtime, configuration and rollback information. Read/render tools never change host configuration. Lifecycle work is performed by the installing agent through the installed maintenance command, not through a setup form or user-authored MCP snippet.

## 2. Ownership And Source Of Truth

| Concern | Existing authoritative owner | Selected extension |
|---|---|---|
| Product acceptance | Approved PRD.md and its stable criteria | No acceptance prose copied into another authority |
| Codex server declaration and installed-path normalization | packages/core/lib/runtime/plugin-provenance.js | Add the cockpit declaration to the Codex runtime profile; validate/normalize both entries together |
| Build and exact UI bytes | scripts/sync-package-assets.js, sync-plugin-mcp.js, cockpit-ui-build.mjs, assemble-npm.mjs | Include verified Cockpit UI in the Codex plugin and its required MCP payload through existing projections |
| Installed package and executable identity | packages/cli/lib/installers/local-marketplace.js and mcp-lifecycle/plugin-runtime.js | Same source, stage/commit, runtime generation and provenance validation; new explicit launcher mode |
| Target resolution and target identity | packages/core/lib/task-target-resolution.js and control-state/approval-command-contract.js | Reuse checked repository resolution and existing target_id; no new target authority |
| Tool schemas and view/context lifetime | packages/core/lib/control-inspect/cockpit-contract.js and cockpit-session.js | An additional target-bearing render definition for plugin mode; one bounded session/publication owner across its projects |
| MCP protocol and generation routing | packages/mcp-server/src/main.js, server.js, generation.js, generation-entry.js and generation-protocol.js | Carry the explicit plugin-Cockpit mode into the existing facade and child qualification |
| Host registration inspection and mutation | packages/cli/lib/mcp-lifecycle/service.js and adapters/codex.js | Exact transition proof, atomic targeted disable and reversible marker; existing snapshots/locks, not a second installer |
| Visible states | Existing lifecycle presentation/locales and Cockpit tool/UI feedback | Report actual phase and recovery; retain host ownership of activation and permissions |
| Verification and documentation | Existing package/Core/MCP/browser tests, native evidence, INSTALL.md and cockpit architecture documentation | Extend coverage and record the final installed/native tuple |

## 3. Architecture Decisions

- SDD-001: Ship a second plugin-provided server with stable technical key `agdf-cockpit` and visible feature name Cockpit, using the common Codex launcher, its existing plugin data root and the explicit `--cockpit` mode flag; rationale: isolate the read-only application from governance/Decision App tools while reusing installation and runtime publication; consequence: two plugin processes may share immutable package bytes, but each keeps its own bounded connection state. No separate host registration or per-project launcher is required. The lifecycle owner checks effective provider identities before activation/cutover; a matching name is never ownership proof, and conflict handling never silently renames a server.
- SDD-002: Resolve the project at render time and bind it immutably to each view inside the existing Cockpit session owner; rationale: a globally installed plugin must serve confirmed projects without a startup-directory guess or mutable current project; consequence: plugin render has a target-bearing schema, while local/Claude render and all scoped read inputs retain their compatibility contracts. The existing four-view quota and exclusive context-publication slot apply across all projects of one connection.
- SDD-003: Carry Cockpit assets and the explicit mode through the existing package/provenance/generation path; rationale: manifest-only registration cannot deliver a working UI and must not bypass generation identity; consequence: source, server/UI manifests, installed normalization, package budgets and facade/child qualification must change coherently. A missing or mismatched required UI fails preparation rather than silently dropping the feature.
- SDD-004: Retire only an exactly identified local legacy section, only after matching installed/native replacement evidence, by reversible targeted disablement through the existing MCP lifecycle owner; rationale: the current unmarked setup must be recognized by provenance rather than its name, and rollback must preserve a functioning route; consequence: keep the original section/runtime, add a bounded transition marker and `enabled = false`, reject foreign/changed state, and never garbage-collect legacy runtimes during this transition.
- SDD-005: Keep Cockpit rendering and reading free of host configuration writes and gate effects; rationale: an application view or model-selected project is not installation or approval authority; consequence: session-bound reads remain read-only, transient failures expose retry, unsupported UI produces an explicit limitation and legacy retirement stays pending.
- SDD-006: Bind transition completion and support claims to one exact installed plugin/server/UI/host/project tuple with separate discovery, rendering and interaction observations; rationale: configuration and tools/list cannot prove that the replacement works in Codex; consequence: extend the existing lifecycle evidence validator with a Cockpit-specific branch, retaining current dispatch qualification semantics. The evidence remains cooperative observed evidence, not independent human proof or a gate approval.
- SDD-007: Limit this rollout to the Codex runtime profile and preserve existing public/source, Copilot, OpenCode and Claude behavior; rationale: the approved first surface is Codex, while other profiles have different payload and host contracts; consequence: explicit profile selection and regression checks prevent accidental capability claims or a silent global payload/profile change.

## 4. Integration Points

### 4.1 Plugin and launcher

`renderCodexPluginMcpConfig` remains the sole Codex declaration renderer. Its reviewed Codex runtime variant adds `agdf-cockpit` beside `agdf`. The new entry uses the same final plugin root and existing AGDF-owned data root; its only additional launcher flag is `--cockpit`. The existing local-marketplace installer substitutes installation paths only, never a repository path. The normalization/provenance reader recognizes the complete generated shape, including both entries, and does not normalize an arbitrary extra server into a trusted declaration.

`parseLauncherArguments` accepts the new exact Codex argument shape, rejects combination with `--cockpit-dir`, rejects other surfaces for this mode and preserves existing argument forms. It passes an explicit `cockpitMode: 'plugin'` through `launchPluginMcpServer` and `runMcpServer`. No environment-based current target or new executable is added. Both launches use existing concurrent package preparation and executable claims.

`syncPluginMcp` is made explicit about the host profile whose declarations it is generating: including a Codex Cockpit UI must not accidentally activate the existing optional Claude Cockpit declaration. Verified `cockpit.html`/manifest bytes join the existing Decision UI files through the existing generator. Normal Codex local preparation and published MCP assembly include that verified UI through the same assembly owner, replacing the need for the separate codex-cockpit user profile. Other profile projections keep their reviewed capability boundaries. Package/schema and payload baselines are updated only to the measured final inventory.

### 4.1.1 Names, provider identity and conflict admission

| Layer | Binding value | Meaning and compatibility rule |
|---|---|---|
| Plugin package | `agdf` | Existing product identity is retained |
| Visible feature and UI resource label | Cockpit | Short user-facing label; host settings may display the technical key instead |
| Plugin MCP server key | `agdf-cockpit` | Stable AGDF-prefixed key; no bare `cockpit`, auto-generated suffix or per-project variant |
| Render/read tools | `agdf_cockpit`, `agdf_cockpit_read` | Existing protocol names retained; names alone do not identify the supplying connection |
| UI resource URI | `ui://agdf/cockpit/v1.html` | Existing URI retained and resolved through the connection that opened the view |
| Historical local keys | `agdf-cockpit`, `agdf-cockpit-local` | Legacy candidates only; never aliases silently redirected to the plugin |

The existing Codex lifecycle adapter owns the read-only inventory and collision decision. Before a candidate is reported available or an old section is mutated, inspect the applicable project/user declarations, enabled plugin declarations and available host discovery for the bound target. Inspect all relevant server names, including other publishers; do not limit collision detection to the current `agdf-*` registration filter. An unavailable, unsupported or ambiguous source means unresolved coverage, never evidence of absence. Recheck inventory under the existing installation/config snapshot guards before committing a transition. This extends the existing projection and transaction owners; it creates no global name registry or second installer.

Provider identity is the tuple of declaration origin (plugin identity or config path/scope), declared server key, verified launcher/runtime identity and the connection/host identity observed in native discovery. Require native attribution that distinguishes the plugin render/read pair from the governance reader and any retained legacy provider. Do not derive a host namespace by concatenating strings or transfer another manufacturer's naming rules to Codex. Hyphen/underscore variants and any other host-normalized names are potential aliases until actual host discovery establishes distinct routing. Ambiguous or missing attribution blocks qualification, even if a tool call returns plausible data.

| Observed case | Required action and effective result |
|---|---|
| No competing declaration or observed identity | Install through the normal plugin path; qualify exact provider discovery, rendering and interaction |
| Owned legacy `agdf-cockpit-local`, distinct host identity | Verify the plugin provider while the old route remains available; then perform the guarded legacy retirement and fresh-session check |
| Owned legacy `agdf-cockpit`, same declared key | Never assume plugin scoping makes coexistence safe. Use the qualification-before-cutover sequence below; do not overwrite or hide the old section |
| Foreign, modified or uncertain provider with the same key or possible host alias | Preserve its bytes and the prior working installation; report the exact source/key and bounded conflict-resolution action; do not activate an ambiguous replacement or claim completion |
| Distinct keys but duplicate/ambiguous host tool attribution, or incomplete inventory | Report unresolved provider identity; retain the prior route and require fresh complete discovery before continuing |

For an owned same-key legacy entry, qualify the exact final plugin/server/UI build against the same confirmed project in an explicitly isolated, host-supported qualification context which excludes the legacy declaration from its effective configuration. Keep the original configuration and working installation intact during that observation. This is native verification of the same package, not a temporary server name, synthetic protocol proof or another installation mechanism. If such a context cannot be established and attributed on the actual supported host, stop with a compatibility blocker; do not disable legacy merely to make the candidate testable. After successful qualification, the existing installation/lifecycle transaction records both installation and config preconditions, reversibly disables only the verified legacy section after qualification, and then activates the qualified candidate. Never reconnect in an intermediate state with two ambiguous providers enabled; use existing compensating rollback for a partial failure rather than claiming a cross-file atomic commit. A reload is part of this pending transition. Fresh discovery, rendering and interaction in the final normal host context are required before completion. If final verification fails, restore the exact prior plugin installation/activation state and legacy enabled state through existing guarded rollback; report any concurrent-edit or rollback failure explicitly. Never leave two indistinguishable providers enabled or declare that an unverified replacement has preserved working access.

### 4.2 Render-time project contract

The plugin-mode tool remains named `agdf_cockpit`. Its strict input adds:

```text
working_directory: absolute accessible execution context
target_source: explicit_target | continued_target | current_repository
primary_target: exactly one absolute confirmed target
run_id: optional existing run selector
```

The three target fields are required for a successful open. The agent fills them from the established conversation; a missing/ambiguous project is clarified once before invocation. `resolveTaskTarget` performs existing repository checks and yields the canonical governance root. Working directory alone, an MCP roots advertisement, recency and an installed-plugin location cannot supply semantic target authority. `resolveControlCommandTarget` supplies the existing stable target identity. No file path or target override is accepted by `agdf_cockpit_read`.

The contract owner provides an explicit plugin-render definition/parser and keeps the current bound-render parser unchanged. The session service receives the resolved project per new view, rather than acquiring a second project/session registry. Each session stores its immutable target/root and creates its existing `ReadWorkerPool` for that root. Failure envelopes use that session's target; pre-binding failures have no target and allocate no worker. The render metadata retains `agdf_cockpit.session_id`, target, time bounds and optional initial_run_id, so the existing UI bootstrap and transport remain usable.

The single `sessions` map counts all projects, active views and unconfirmed retirements toward `COCKPIT_LIMITS.sessions` (currently four). No idle per-project service or worker survives the last view. The existing one-connection publication slot remains shared across projects: preparing context in one view excludes another project/view until the original owner completes acknowledged invalidation. Close, expiry, source refresh and owner-loss quarantine retain their existing behavior. Tests must prevent a session ID from being reused to switch projects and prove that cross-project context publication cannot bypass ownership.

### 4.3 Generation and transport

The plugin read runtime still has `mode: 'cockpit'`, one Cockpit UI resource and the existing read-only tool pair. It uses the existing generation facade. The facade sends `cockpitMode` into qualification; the child constructs the same plugin runtime variant before comparing tool/resource manifests. `cockpitDir` and plugin mode are mutually exclusive. The target-neutral mode is not routed into `createMcpDecisionRuntime` or the dispatch worker. Session IDs continue to route to the generation which created them; views from a draining generation cannot migrate to a new generation implicitly.

The Cockpit server exposes no runtime-generation replacement command. Package updates use the existing plugin lifecycle and a fresh connection; this design does not introduce live replacement of a Cockpit session owner. A connection's four-view limit and publication exclusion therefore cannot be multiplied by opening a second project or asking a governance server to replace its own independent generation. Active old view/context owners must be closed or acknowledgedly invalidated before transition completion; uncertainty retains the old runtime and prevents a clean-cutover claim.

The `agdf` server retains its existing Decision UI, command groups, approval handling and bounded `agdf_cockpit_read`. The two declared servers avoid a same-server duplicate tool definition and do not require multiple UI-resource multiplexing. This structural separation is not proof of collision-free host discovery. Native evidence must show that App calls return to the exact provider connection that opened the resource, including the two readers with identical protocol names. The plugin Cockpit's render tool requires the host UI capability before allocating a view; an unsupported host receives a concrete limitation and the existing documented fallback where actually available. Capability advertisement is still separate from observed rendering qualification.

### 4.4 Legacy transition and rollback

The lifecycle adapter recognizes two eligible legacy categories at the explicitly bound project only:

1. Existing correctly marked Cockpit registrations with their verified executable identity and matching role/server/target references.
2. The bounded historical unmarked form used by the current local setup: one unique `agdf-cockpit` or `agdf-cockpit-local` section; exact Node command and five-argument directory-bound entrypoint; cwd, when present, matching the selected project; only supported command/args/cwd/timeout/enabled fields; a real contained AGDF-owned runtime marker plus matching server/dispatcher/SDK digests and the original preparation record matching that entrypoint. No env/auth/unknown fields, symlinked files, duplicate/unsupported TOML sections or higher-precedence conflict are adopted.

The same-key and alias cases must first pass section 4.1.1; an eligible legacy identity does not itself prove that simultaneous activation is safe. A name or path under dist/local alone is insufficient. The current section has command, args, cwd and timeout fields but no ownership marker; its historical preparation and runtime marker supply candidate evidence, not a current qualified replacement. A failed identity/digest check preserves the section and reports an ownership conflict. No general foreign-registration adoption is introduced.

Extend the existing `mcp` command and service with narrowly scoped maintenance options, rather than a new command family or installer:

```text
mcp disable --surface codex --scope project --dir <root>
  --retire-cockpit <agdf-cockpit|agdf-cockpit-local> --evidence <transition-record.json>
mcp enable --surface codex --scope project --dir <root>
  --restore-cockpit <same-id> --evidence <rollback-record.json>
```

These options are mutually exclusive, Codex/project-only, and rejected on other actions or surfaces. Existing unqualified `mcp enable/disable` behavior remains unchanged. The agent uses them during the normal installation/verification continuation; users do not manually author configuration or execute a separate Cockpit setup command. Rendering and ordinary status never invoke them automatically. The existing setup consent/result describes the affected legacy entry and transition before mutation; the original integration request covers this task's bounded local transition, while future installs retain the existing consent rules.

The transition record binds schema/version, canonical target identity, selected config path and full pre-change digest, exact legacy section digest/identity, installed plugin identity, runtime generation and server/UI digests, host/client/session tuple, complete inventory coverage and digest, declared and observed provider identities including any normalized aliases, and hashed native discovery/render/interaction evidence references. For same-key cutover it also identifies the isolated qualification context, exact candidate package and guarded prior plugin installation/activation state needed for rollback. It is bounded, contained and verified by the lifecycle evidence owner. Configuration presence, an unsupported UI, another build/project or missing actual observation cannot satisfy it. Observations are cooperative records with raw evidence, not cryptographic proof that a human saw the UI.

Under the existing config lock and snapshot checks, revalidate every input and atomically insert or set `enabled = false` in that exact section. Preserve all unrelated bytes. Add a bounded AGDF transition comment immediately associated with the section, containing the original-section digest, original enabled-field presence/value, target/plugin identities and transition evidence digest. Preserve original legacy content, including safe timeouts and comments. A rollback reconstructs only that original section from the retained lines and recorded delta, verifies its digest, and restores it only if the current disabled section still matches the recorded transition. Concurrent/foreign edits abort rollback rather than overwrite them. For a same-key transition, restoring the old section alone is insufficient: the candidate plugin route must first be removed by guarded restoration of the recorded prior installation/activation state, so rollback cannot introduce a collision. A changed installation or config precondition stops restoration and reports the remaining effective state. No second durable migration database or control-state source is introduced.

The old runtime and any references stay intact; this transition does not claim process exit or free shared runtime storage. Configuration retirement is followed by a fresh Codex discovery check: the plugin Cockpit remains available and the old Cockpit is absent from the effective offering. A restart requirement is reported explicitly. Until this final check, status is transition-pending, not complete. Failure after retirement invokes the guarded restore path and verifies restoration; uncertainty is reported and never replaced with an unconditional file restore. The retained disabled legacy entry is an explicit rollback resource; deletion or garbage collection is outside this transition and must use the existing eligible lifecycle cleanup after its own ownership/reference checks.

### 4.5 State and documentation

Use the existing lifecycle output/locales and setup projection for configured, discovered, rendered, interacted, disabled, conflict and pending-reconnect states. Extend their existing vocabulary only where the transition needs a distinct next action; do not add another status evaluator. The render/read envelope retains checked project identity, retryable failure and authorizes:false. The visible feature/resource name is Cockpit; technical and historical identifiers appear in maintenance/conflict diagnostics when needed to identify the affected provider; ordinary opening keeps the short feature name. The plugin cannot promise that Codex settings show a custom display label independent of its server key.

Normal INSTALL.md guidance becomes install/update AGDF and open Cockpit. Architecture/UI documentation distinguishes the plugin path, retained legacy rollback and unsupported host limitations. Source/protocol, installed payload and actual native evidence remain separate. No claim that normal plugin disablement deletes its shared runtime files is added; existing owned-runtime retirement rules remain authoritative.

## 5. Constraints And Compatibility

- Preserve approved UR and PRD bytes, all gate/approval semantics and existing governance/Decision App tool schemas. The plugin render schema is new on a new plugin server; old local and Claude render/read contracts remain unchanged.
- Keep the shared runtime publication and SDK/executable checks. Never patch generated or installed cache files as the implementation source. Rebuild through the existing canonical pipeline and validate the installed projection.
- No project-path substitutions in global plugin manifests. Input labels remain cooperative context; they grant neither filesystem access nor human approval.
- Keep session, worker, HTML, response, time and generation bounds, including slots whose cleanup is unconfirmed. Across projects, do not multiply the existing view or context-publication capacity.
- Preserve foreign configuration byte-for-byte, avoid project scans, retain disabled legacy content and never remove unrelated/shared runtime references. A supported historical registration must pass all selected identity checks.
- The additional entry changes the generated manifest and native discovery footprint. Update associated definition, provenance, payload, packaging and host tests coherently; do not weaken assertions or reuse historical host evidence as final-build proof.
- Reserve `agdf-cockpit` as the generated technical key and Cockpit as the feature label. A name prefix reduces accidental overlap but guarantees neither uniqueness nor Codex plugin isolation. No foreign overwrite, automatic suffix, tool rename or silent precedence-based fallback resolves a conflict.
- Normal plugin lifecycle owns availability; external legacy routes are reported separately. No automatic reopening, data replay or gate action follows from retry, update, view selection or disablement.
- Continue keeping the run recovery archive outside this shared checkout. Later source/build qualification uses isolated snapshots where suitable; no branch switch or cleanup may discard another chat's work.

## 6. Test And Evidence Strategy

TP must supply executable mappings for every criterion/decision and named failure expectations. Extend existing suites for declaration generation/normalization, exact UI bytes, launcher arguments, plugin publication and role-specific Codex configuration. Add Core scenarios for two simultaneous projects, immutable session target, shared four-view capacity including retirement, and cross-project publication exclusion/invalidation. Preserve existing single-project and Decision App tests.

Name/provider tests cover a clean inventory, owned same-key and distinct-key legacy entries, foreign same-key providers from project/user/other-plugin sources, possible hyphen/underscore aliases, repeated reader names, incomplete discovery, stale inventory and concurrent installation/config changes. Assert precise provider attribution and unchanged foreign/unrelated bytes. Verify qualification-before-cutover and combined installation/config rollback for the same-key case; an unavailable isolated native context must leave the original route active and completion blocked. A manifest-only or mocked namespace result does not satisfy native routing evidence.

Protocol/generation tests must demonstrate that facade and child select the same mode, schema and UI digest; a mismatched candidate cannot take over existing views. App/browser evidence covers bootstrap, checked project identity, run/document reads, refresh/retry and current context handoff behavior without canonical writes. Registration tests cover exact historical recognition, modified/foreign/env/duplicate sections, stale config/evidence, reversible disable, interrupted/failing write, rollback conflict, retries and unchanged unrelated bytes.

Record final clean-install and existing-user journeys on a freshly loaded Codex plugin: exact host/client/session, plugin/server/UI identities, declaration origins and actual exposed provider/tool identities, tools discovery, rendered UI, actual read interaction, legacy retirement followed by final fresh discovery, and preserved governance behavior. The current historical Codex/Claude evidence is reuse input only. Extend the existing evidence validator with a Cockpit discriminator and required render/interaction/transition facts; do not loosen the original agdf_dispatch qualification branch or claim independent human-origin proof. Missing native observations keep migration/completion unqualified.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Second plugin declaration, common verified assets/launcher and target-neutral opening | Core plugin-provenance renderer; shared build scripts; CLI plugin-runtime | SDD-001, SDD-003, SDD-007 | Installed normalization, payload and host discovery must be validated together; no extra project setup; AGDF-prefixed key plus observed provider identity, no assumed plugin isolation |
| AC-002 | Strict opening context resolves canonical project, then immutable per-view binding | Core task-target-resolution, approval-command-contract and cockpit-session | SDD-002, SDD-005 | Old bound schema retained; target-bearing plugin schema rejects incomplete/unavailable bindings |
| AC-003 | Reuse existing read schema/UI and one shared view/publication owner; governance stays separate | Core cockpit-contract/session and existing Decision runtime | SDD-001, SDD-002, SDD-005 | Multi-project state must not leak, multiply quotas or bypass context invalidation; no new writers |
| AC-004 | Verify installed replacement, exact legacy identity and reversible disable, then fresh discovery | CLI mcp-lifecycle service, Codex adapter and evidence validator | SDD-004, SDD-006 | Same-key replacement is qualified in an isolated native context before cutover; final normal-context checks and guarded installation/config rollback required |
| AC-005 | Reject unrecognized or changed state; lock/snapshot and exact delta preserve unrelated bytes | Existing Codex config adapter, file-utils and lifecycle owner | SDD-001, SDD-004, SDD-006 | All relevant origins and host aliases checked; incomplete/ambiguous attribution blocks qualification; foreign edits stop retirement and restore |
| AC-006 | Shared runtime publication and plugin lifecycle; exact mode qualification and separate legacy state | CLI local-marketplace/plugin-runtime; MCP generation facade/child | SDD-001, SDD-003, SDD-004, SDD-007 | Package/UI skew blocks readiness; existing runtime reference/retirement rules retained |
| AC-007 | Capability-aware opening, target-specific failure envelopes and existing refresh/retry paths | MCP server; Core session service; existing UI/lifecycle presentation | SDD-002, SDD-005, SDD-006 | Unsupported UI allocates no view and cannot qualify migration; unknown cleanup is never treated as success |
| AC-008 | Final-build test/host identities and documentation update through existing evidence owners | Existing test suites/evidence validator; INSTALL.md and cockpit architecture docs | SDD-003, SDD-006, SDD-007 | Historical host proof is not final evidence; other profiles and public release remain outside claimed support |

## 8. Risks And Open Questions

All binding architecture choices above are resolved for this design. Remaining work is implementation verification: historical identity fixtures may expose an unrecognized variant, host plugin grouping/display and normalization may differ, isolated same-key native qualification may be unavailable, native reload may require user interaction, and final package growth must remain within reviewed limits. These outcomes must surface as a concrete compatibility/evidence gap, not trigger automatic widening of recognition or false completion. A newly discovered product/design conflict routes to its existing earliest owner rather than a test-only workaround.

The chosen additional process avoids changing the governance/Decision runtime's UI resource and read semantics, at the cost of another plugin-owned connection/process. It shares immutable runtime assets and existing limits; no extra product, installer or state authority is introduced. Retaining the disabled legacy section is a deliberate rollback resource, not a second effective Cockpit. Its finite exit condition is successful final installed/native transition plus user acceptance; any subsequent deletion remains a separately checked existing lifecycle cleanup, not implicit during rollback or plugin rendering.

## Design Decisions

| Decision | Timing | Status | Resolution | Owner |
|---|---|---|---|---|
| Plugin decomposition and naming | before_sd | resolved | SDD-001: agdf plus stable agdf-cockpit; visible Cockpit; unchanged protocol names/URI; explicit origin and native-provider checks, no assumed plugin namespace or auto-renaming | Codex, SD author |
| Project, view and context ownership | before_sd | resolved | SDD-002: strict render context, existing target resolver, immutable per-view root and shared connection quotas/publication | Codex, SD author |
| Required assets and runtime mode | before_sd | resolved | SDD-003: verified Codex payload and explicit plugin mode through existing generation qualification; no Decision resource multiplexing | Codex, SD author |
| Historical recognition, retirement and rollback | before_sd | resolved | SDD-004: exact legacy proof plus collision admission; isolated native qualification before same-key cutover; reversible enabled=false and guarded combined installation/config rollback, no runtime deletion | Codex, SD author |
| Read/write and host capability boundary | before_sd | resolved | SDD-005: read/render never mutate setup/control; existing lifecycle does transition; unsupported UI is explicit and unqualified | Codex, SD author |
| Evidence and completion authority | before_sd | resolved | SDD-006: extend existing evidence owner with Cockpit-specific tuple/render/interaction checks; observations remain cooperative, not approvals | Codex, SD author |
| Profile and compatibility boundary | before_sd | resolved | SDD-007: Codex runtime first; other existing profiles/contracts remain unchanged; verify scope and exact installed payload | Codex, SD author |
| Executable scenario inventory and native observation sequence | later_tp | deferred | TP selects concrete task IDs, commands and evidence paths for all criterion/decision pairs without changing the above design | Codex, TP author |

## 9. Next Step

Review this persisted design and approve only with `Approval: SD` for its presented revision. This permits the Task/Test Plan. Implementation and the local plugin/legacy cutover remain subject to TP approval and implementation-preparation checks.

## AGDF Approval Summary (de; source=en)

- Ziel: Das vorhandene Cockpit wird durch die normale AGDF-Plugin-Installation bereitgestellt.
- Lösung: Das Plugin liefert intern die beiden Server `agdf` und `agdf-cockpit` über denselben vorhandenen Launcher und dieselbe geprüfte Laufzeitverwaltung. Die Oberfläche heißt **Cockpit**. Bestehende AGDF- und Entscheidungswerkzeuge behalten ihre Schnittstellen.
- Namenskonflikte: **Cockpit** ist der sichtbare Funktionsname; `agdf-cockpit` ist die stabile technische Kennung. Werkzeugnamen und UI-Adresse bleiben erhalten. Eine automatische Trennung durch Codex wird nicht vorausgesetzt: Herkunft, mögliche Namensangleichungen und tatsächliche Werkzeugzuordnung werden geprüft. Fremde oder unklare Belegungen bleiben unverändert und blockieren einen unklaren Ersatz; es gibt keine automatische Umbenennung.
- Projektbindung: Der Agent übergibt beim Öffnen das eindeutig bestätigte Projekt. Jede Ansicht bleibt daran gebunden; Leseaufrufe verwenden nur ihre Sitzung. Es gibt kein globales aktuelles Projekt. Die vorhandene Grenze von vier Ansichten und die exklusive Kontextübergabe gelten gemeinsam über alle Projekte einer Verbindung.
- Paketierung: Der Codex-Plugin-Build enthält die geprüften Cockpit-Dateien. Manifest, UI, Laufzeit und Kindprozesse müssen zusammenpassen; unvollständige oder unpassende Pakete werden nicht als betriebsbereit gemeldet. Andere Hostprofile werden nicht still erweitert.
- Ablösung: Die bestehende lokale Verbindung wird erst nach Nachweis des funktionierenden Plugin-Ersatzes deaktiviert. Alte Einträge ohne Marker werden nur anhand ihrer genauen Konfiguration und passender AGDF-Paketnachweise erkannt. Fremde oder veränderte Einträge bleiben erhalten. Die Abschaltung erhält den alten Abschnitt und seine Laufzeit als geprüften Rückweg; eine Wiederherstellung überschreibt keine zwischenzeitlichen Änderungen. Ist bereits dieselbe Kennung belegt, muss der Ersatz zuerst in einem unterstützten isolierten Codex-Kontext für dasselbe Projekt nachgewiesen werden; andernfalls bleibt der alte Zugang aktiv und der Übergang blockiert. Beim Fehlschlag nach dem Wechsel werden Plugin-Zustand und alter Eintrag zusammen geschützt wiederhergestellt. Die abschließende normale frische Sitzung muss genau einen eindeutig zugeordneten Cockpit-Zugang samt Rendering und Interaktion zeigen.
- Zuständigkeiten und Risiken: Lesen und Öffnen ändern weder Hostkonfiguration noch Freigaben. Die vorhandene Installationsverwaltung übernimmt den Übergang; der Nutzer muss keinen zusätzlichen Server einrichten. Risiken sind Versionsabweichungen, Sitzungsvermischung und unklare Altbestände. Diese werden durch Paketprüfungen, Projekt-/Sitzungstests, genaue Besitzprüfung und frische Codex-Nachweise abgesichert. Sichtbares Rendering und Interaktion bleiben eigene Nachweise.
- Nächster Schritt: Alle acht Produktkriterien sind auf die Designentscheidungen und bestehenden Verantwortlichen abgebildet. `Approval: SD` erlaubt den Task- und Testplan; Codeumsetzung, Installation und Abschaltung folgen erst nach den weiteren Voraussetzungen.
