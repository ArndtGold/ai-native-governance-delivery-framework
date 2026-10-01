# TP: Portable AGDF Plugin and Package Organization

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-01
Owner: Arndt Gold
Run: `agdf-portable-plugin-package-structure-20261001-01`
Language: en
Traceability contract: criteria-chain-v1

Sources: [Approved PRD](PRD.md); [Approved Solution Design](SD.md).
Execution status: planned; no implementation or test result is claimed by this plan.
Product acceptance stays in PRD.md; design decisions stay in SD.md.

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Perform required implementation-preparation Brownfield Analysis, capture current baseline and complete active path-consumer/shared-owner inventory; reconcile related-run revisions and identify interfering dirty files without changing them | Codex execution; Arndt Gold accountable | TP approval and fresh gate-check continuation |
| T-002 | Acquire hash-bound Agent Plugins schema snapshots and add exact Ajv build/test tooling to repository development dependencies; wire schema checks without runtime dependency leakage | Existing build owner; Arndt Gold | T-001 |
| T-003 | Extend existing manifest projector for portable identity and explicit inline/fallback selection; generate source/public/runtime variants and keep Copilot/OpenCode grammar separate | Existing public-plugin owner; Codex execution | T-002 |
| T-004 | Move canonical shared hook templates to build-only host-templates/shared/hooks/, compose runtime hooks explicitly, enforce profile discovery/resource/exclusion checks, and validate portable-format milestone A | Existing profile/build owner; Codex execution | T-003 |
| T-005 | Relocate canonical plugin source to plugins/agdf/, introduce shared source-root locator and migrate active build/versioning/conformance/fixture/workflow consumers without changing package exports or generated destinations; validate milestone B | Existing source/build owners; Codex execution | Milestone A passes; T-001 inventory current |
| T-006 | Verify all three actual packed packages, generated profile resources, reproducible projection and runtime provenance/consent/control invariants after both stages | Existing package/runtime owners; Codex execution | T-005 |
| T-007 | Update component/profile/migration documentation, current SoT paths and curated existing Context Graph nodes; check handbook translation provenance and path/command accuracy | Arndt Gold accountable; Codex execution | T-005 |
| T-008 | Run affected deterministic host-adapter, installer, update/recovery and MCP protocol regressions in isolated fixture roots; preserve command/package/dependency identities | Existing adapter/runtime owners; Codex execution | T-006 |
| T-009 | Record source/package/fixture evidence and any available isolated fresh-host observations with exact host/version/profile tuple, failure path and cleanup; mark unavailable native lanes unverified | Arndt Gold accountable; Codex execution | T-006 and T-008 |
| T-010 | Review actual diff, clean implementation and TP fulfillment; resolve findings through existing owners, then invoke sole qa-gate and prepare its report for the next human decision | Codex review/QA skills; Arndt Gold gate owner | T-006, T-007, T-008, T-009 |

### Execution order and checkpoints

T-001 is the mandatory post-TP internal Brownfield step, not permission supplied by this plan.
Stage A is T-002 through T-004 while the parent source root is still plugin/. Put schema inputs and
host templates in the corresponding current source subpaths, then move them with their canonical
parent in Stage B. This gives the format change an independent verification checkpoint before the
directory move. At milestone A, portable source/public/runtime identity and effective overlay
selection pass; source/public optional discovery is absent and runtime hooks/MCP paths still resolve.

Stage B is T-005. Its checkpoint requires one canonical plugins/agdf tree, no active executable
read of the old root, unchanged npm names/exports/generated destinations, valid resources, and
working version/conformance/build commands. T-006 through T-009 establish final evidence. T-010
does not bypass CR, QA approval, UAT or OR.

Before each stage, capture hashes and ownership of only task-touched files and canonical inputs in
a temporary task-owned snapshot plus evidence/BASELINE.md. If a checkpoint fails, repair within that
stage or reverse only its owned changes using that snapshot; do not use blanket git reset/clean,
overwrite dirty files or restore unrelated state. Generated outputs can be regenerated from the
previous task-owned inputs; the active installed plugin is untouched. A conflicting current
source or unsupported manifest bridge routes back to the existing design owner.

### Scope inventory for T-001 and T-005

Inventory current executable imports, string paths, copy lists, provenance labels and diagnostics
before replacing them. Known affected families are:

- Entire canonical plugin source tree, its conformance/integrity scripts and source hook templates.
- create-agdf/scripts/sync-package-assets.js, sync-plugin-runtime.js, sync-plugin-mcp.js,
  sync-request-activation-projections.js, build-public-plugin.js and their relevant tests.
- create-agdf/lib/public-plugin/, release/version-bump.js, release/version-coherence.js,
  release/profile-history.js, source fingerprint/evaluation consumers and installers' source handling.
- Root scripts/set-version.mjs, Node/support/community-health checks, .github workflows, native-probe
  source references, MCP/CLI fixtures and package tests that copy the old source tree.
- Current README/INSTALL/package READMEs, handbook source links and parity hashes,
  .agdf/control/SOT_REGISTRY.md and existing affected Context Graph node refs.

Search generated/installed paths separately: references to generated/plugins/agdf, runtime/create-agdf
or an actual host plugin directory are not old canonical-source paths and must not be mechanically
rewritten. Existing build-boundary methods remain unchanged in meaning. No new package, control
state store, public capability or acceptance criterion is created.

## 2. Verification Traceability

Every row has a concrete scenario and task; scenario IDs are unique. Planned evidence paths are
relative to this run's artefact directory and will be created only during execution.

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-002 | T-003 | SCN-001 | Source/public root fields and inline presentation match the definition; runtime root omits inline settings and preserves complete fallback | evidence/MANIFEST_MATRIX.json; projector/profile assertions in public-plugin-test.js |
| AC-001 | SDD-005 | T-002 | SCN-002 | Pinned plugin/MCP schemas compile with draft-2020-12; valid fixtures pass and unsupported root fields or missing transport type fail | evidence/SCHEMA_INPUTS.json; evidence/SCHEMA_CHECKS.md; new build/test schema scenarios |
| AC-002 | SDD-003 | T-004 | SCN-003 | Runtime hooks materialize at expected paths; source/public root hook, MCP and app files and all distributed host templates are absent | evidence/PROFILE_INVENTORIES.json; extended public-plugin/profile mutation assertions |
| AC-002 | SDD-005 | T-004 | SCN-004 | Actual-output validation rejects missing, case-mismatched, escaping and inappropriate resources with a failed validation result | evidence/PATH_NEGATIVE_CHECKS.md; existing validator tests extended with actual-output mutations |
| AC-003 | SDD-001 | T-005 | SCN-005 | Only plugins/agdf owns canonical content; active source consumers resolve the locator/new paths; no old mirror or symlink exists | evidence/SOURCE_PATH_AUDIT.md; source-root fixture checks and file inventory |
| AC-003 | SDD-002 | T-006 | SCN-006 | Repeated generation from identical canonical inputs yields identical manifest/profile content and unchanged identity | evidence/REPRODUCIBILITY.json; projector and public-plugin regression results |
| AC-004 | SDD-004 | T-006 | SCN-007 | Three npm names, public exports and exact create-agdf dependencies remain identical; no fourth published package or runtime schema-engine dependency appears | evidence/PACKAGE_BOUNDARIES.json; CLI/MCP package tests and dependency inventory |
| AC-005 | SDD-001 | T-005 | SCN-008 | After root move, source integrity, skill conformance, request-activation generation, version/release checks and CI paths resolve the new source root | evidence/MILESTONE_B.md; source conformance/version/workflow test logs |
| AC-005 | SDD-006 | T-004 | SCN-009 | Milestone A passes before parent root relocation; injected invalid profile prevents readiness and correction enables repeat validation | evidence/MILESTONE_A.md; build/profile mutation-and-retry result |
| AC-005 | SDD-006 | T-005 | SCN-010 | Task-owned Stage B failure/rollback fixture restores Stage A inputs without altering unrelated sentinel changes or installed/control paths | evidence/ROLLBACK_CHECKS.md; staged migration fixture |
| AC-005 | SDD-006 | T-008 | SCN-011 | Four deterministic host paths preserve commands, installed destinations and defined update/recovery behavior | evidence/ADAPTER_REGRESSIONS.md; host compatibility/local-development installer tests |
| AC-006 | SDD-002 | T-003 | SCN-012 | Inline settings replace rather than merge an intentionally contradictory overlay; runtime fallback still includes hooks and host MCP paths | evidence/OVERLAY_SELECTION.md; effective-settings negative fixture |
| AC-006 | SDD-003 | T-004 | SCN-013 | Injecting portable or legacy MCP, hook or app discovery into public skills-only output fails its profile check; Copilot/OpenCode formats remain unchanged | evidence/PROFILE_NEGATIVE_CHECKS.md; public-plugin and Copilot/OpenCode checks |
| AC-007 | SDD-007 | T-006 | SCN-014 | Target/run, gate and revision binding remain fail-closed; modified manifested payload changes provenance; consent/trust negatives remain rejected | evidence/AUTHORITY_REGRESSIONS.md; run/control/dispatch/provenance/consent suite results |
| AC-007 | SDD-007 | T-008 | SCN-015 | Installer-completed absolute Codex MCP paths normalize only the owned shape; altered launcher/identity/hook configuration fails integrity | evidence/PROVENANCE_CHECKS.md; Codex/Claude MCP and runtime-integrity negative tests |
| AC-008 | SDD-008 | T-009 | SCN-016 | Evidence report labels source, exact package, installed fixture and fresh-host observations independently with tuple/digest/date; missing native observations are unverified | evidence/EVIDENCE_MATRIX.md; existing readiness/host-evidence report inspection |
| AC-008 | SDD-008 | T-009 | SCN-017 | When isolated native prerequisites are available, discovery, one bound dispatch, defined failure and cleanup are observed; otherwise lane is explicitly unverified without claiming host acceptance | evidence/NATIVE_HOST_OBSERVATIONS.md; isolated existing native-probe outputs or prerequisite record |
| AC-009 | SDD-001 | T-007 | SCN-018 | Current navigation resolves canonical relocated components and valid build/profile commands; registry and curated node refs agree with source | evidence/DOCUMENTATION_CHECKS.md; community-health/link checks and five-component walkthrough |
| AC-009 | SDD-008 | T-007 | SCN-019 | Documentation and recovery walkthrough distinguish desired, generated, validated, installed and recognized states and link existing repair/retry paths | evidence/MAINTAINER_WALKTHROUGH.md; handbook parity and report inspection |
| AC-002 | SDD-005 | T-006 | SCN-020 | Unpacked actual npm tarball contains all declared resources for each shipped profile, no build-only templates/tooling and no unresolved references | evidence/PACKED_OUTPUTS.json; all three package-content tests and unpacked-resource checks |
| AC-005 | SDD-006 | T-001 | SCN-021 | Current baseline/related-run ownership is recorded; known unrelated deleted and duplicate paths are preserved or explicitly identified as interfering | evidence/BASELINE.md; evidence/OWNER_COORDINATION.md; implementation-preparation Brownfield Analysis |

## 3. Test Plan

### Locked external inputs and tooling

The schema bytes below were fetched read-only and hashed on 2026-10-01; both declare JSON Schema
draft-2020-12. T-002 acquires those exact bytes into canonical meta/schemas/agent-plugins/1.0.0/
(Stage A under plugin/, Stage B under plugins/agdf/) with a provenance record. A byte mismatch
requires explicit input reconciliation; do not silently update the schema target.

| Input | Source | Exact SHA-256 |
|---|---|---|
| plugin.schema.json, 1805 bytes | https://agent-plugins.org/schemas/1.0.0/plugin.schema.json | 0a4aad95ce337878ad38802ebf0daa3fde76abe3f65400c86bcbb1ec0b3ab883 |
| mcp.schema.json, 3408 bytes | https://agent-plugins.org/schemas/1.0.0/mcp.schema.json | 6539175bfcdf43085855183e86da40ea94b166547a72b47ae9a0a390516d3acb |

Select exact `ajv@8.20.0` in the private repository root devDependencies and root lockfile,
using its draft-2020-12 class (`ajv/dist/2020.js`) without coercion, default insertion or removal of
unknown properties. Verify local schema IDs and refuse remote reference loading.
[Ajv documentation](https://ajv.js.org/json-schema.html#draft-2020-12-breaking) establishes the
separate schema class; the [v8.20.0 release](https://github.com/ajv-validator/ajv/releases/tag/v8.20.0)
and read-only registry metadata were checked on 2026-10-01.
The published archive integrity is
`sha512-Thbli+OlOj+iMPYFBVBfJ3OmCAnaSyNn4M1vz9T6Gka5Jt9ba/HIR56joy65tY6kx/FCF5VXNB819Y7/GUrBGA==`.
Record resolved transitive versions/integrities in the lockfile during T-002.

Schema-engine imports stay in build/test entry points, not offline runtime modules or shipped
runtime dependency lists. Existing profile semantics/path validation stays with its existing owner.
Actual-output schema checks must finish before build readiness is reported; a missing schema tool
is a failed build prerequisite, not an optional skip. Network is only for approved dependency/input
acquisition, not schema validation or target-local governance checks.

### Automated verification groups

Run builders and tests that mutate shared generated assets serially. Start from root dependency
installation, generate required package assets, then run the applicable groups once at each relevant
checkpoint; repeat only changed/failed groups after repairs. Use current Node >=22 baseline.

1. **Format and profiles (Stage A, then changed cases after Stage B):**
   extend existing public-plugin-test.js and add focused schema/profile scenarios; run
   `npm --prefix create-agdf run test:public-plugin`, `test:distribution-profile-history`,
   `test:copilot-profile`, `test:opencode-hardening` and affected profile/build checks.
   New cases are exposed by a focused `test:portable-plugin` script in create-agdf and the existing
   release/CI preparation route. Preserve positive assertions while adding boundary mutations.
2. **Source relocation (Stage B):**
   run the source integrity script at plugins/agdf/scripts/check-runtime-integrity.mjs;
   `test:agent-skills-conformance`, `test:instruction-footprint`, affected request-activation tests,
   `test:release-bump`, `test:release-version-coherence`, `test:release-workflows` and
   `test:package-build`. Audit remaining plugin/ references semantically, distinguishing deliberate
   historical/host terminology from executable old-root access. The source integrity script currently
   assumes parentRoot/plugin and must be updated as a source consumer.
3. **Packed outputs and entry points:**
   build and unpack exact tarballs in task-owned temporary directories; run create-agdf
   `test:package-contents`, `test:control-command-package`, @agdf/cli `test:package`/`smoke-test`,
   and @agdf/mcp-server `test:package`. Check npm output in its actual supported array or object
   shape rather than assuming a single manifest representation. Do not publish or install globally.
4. **Control/runtime authority:**
   run affected `test:control-state`, `test:run-revision`, `test:control-command`,
   `test:cli-gates`, `test:task-target-resolution`, `test:skill-dispatch`,
   `test:runtime-check-consent`, `test:runtime-integrity-layout` and
   `test:runtime-integrity-negative` checks. Run additional lock/transaction/recovery tests only if
   those owners change or a relevant failure requires them; source organization does not redesign them.
5. **Adapters and MCP:**
   run `npm run test:host-compatibility`, affected create-agdf `test:local-marketplace`,
   `test:local-development-install`, `test:claude-cache-recovery`,
   `test:codex-plugin-mcp`, `test:claude-plugin-mcp`, `test:plugin-mcp-runtime`,
   `test:mcp-lifecycle` and @agdf/mcp-server protocol/continuation/safety/provenance tests.
   These tests use temporary target/data/config roots and injected host execution where supported.
6. **Documentation and final review:**
   run existing community-health/handbook parity checks, final source/path audit and diff whitespace
   checks. Record actual command, exit status, relevant scenario outputs and source/output digests.
   Existing clean-implementation-review, code-review and task-plan-review feed the sole qa-gate.

The checked-out file create-agdf/scripts/repository-control-startup-test.js is already deleted
and several files ending in " 2" are untracked. Do not restore/delete them silently to make a suite
pass. T-001 identifies exact interference. A required affected check that cannot run remains a
visible QA gap routed to its existing owner; do not weaken assertions or reclassify it as passed.

### Isolated host evidence and recovery

Use explicit temporary AGDF_DATA_DIR and supported host config roots for fixture installations;
never point an installer test at the active user configuration. Read existing test/probe isolation
contracts before running. For native observations use existing isolated codex-host-e2e and
claude-host-e2e routes only when their host/auth/model prerequisites are available and isolated
execution is supported. Preserve the configured or explicitly supplied model, record it, and never
persist credentials. Copilot/OpenCode native evidence is collected only through existing supported
isolation mechanisms; otherwise label those lanes unverified.

Native host observations are separate from deterministic adapters and protocol tests. Lack of native
access is not a schema-test failure, but prevents an affirmative fresh-host claim. Include defined
failure and removal/cleanup evidence when a native lane is executed. Record OS/client/version and
package/profile/digest tuple; existing older observations cannot transfer to the new built payload.

At each checkpoint, a failed schema, profile, resource, provenance, activation or recovery check
blocks advancement. Existing build/install recovery owners provide repair/retry. Stage rollback
is tested in a disposable fixture, with unrelated sentinel content; it never mutates the user's
installed cache, active run approvals or another run.

## 4. Brownfield Scope

T-001 must recheck approved source digests and current gate/control binding, registered owners,
source root assumptions, profile copy policies, runtime digest normalization, installer destinations
and schema-engine exclusion. Compare current shared owners with the public-distribution,
npm-payload-cleanup and host-adapter-compatibility runs without importing their approvals.
The current backlog reports public distribution at QA, payload cleanup at PRD and host compatibility
at UAT; verify their current revisions before implementation since those states can change.

Verify this run remains a clear scope; a conflicting concurrent edit to a shared generator requires
coordination or bounded retry, not a second source of truth. Preserve the approved SDD compatibility
adapter treatment. Missing routing/authority facts block Brownfield readiness; unexpected product
or design changes route to the relevant existing gate.

## 5. Out Of Scope

No fourth npm/core package, cosmetic relocation of all npm sources, new public MCP/hooks/app
capability, portable MCP launcher/data-root redesign, panel, Events, remote service, authentication,
policy change, transferred approval, historical artefact rewrite, active user install, publication,
release, commit/push/PR action or unrelated workspace repair.

This plan does not authorize moving or editing files before exact TP approval and the required
post-approval Brownfield readiness. It creates no parallel approval or evidence authority.

## 6. Risks And Blockers

- QA block: altered policy/authority, accidental optional activation, missing resources, identity
  drift, broken runtime provenance, a second maintained source tree or unsafe rollback.
- QA revise: incomplete required affected regression, shared-owner conflict, missing task/scenario
  evidence, inaccurate current documentation, missing Context Graph/SoT reconciliation.
- Evidence warning: unavailable native host lane or OS observation remains unverified with no
  positive support claim; exact-package acceptance still requires all its own evidence.
- Dependency/input mismatch: fail the acquisition/build prerequisite, record the discrepancy and
  reconcile the locked input through existing design/planning owners.
- Source move can alter conformance, release and translated handbook refs; current owners and
  source-provenance digests must change together without editing historical approved evidence.

No implementation result, QA decision or clean delivery closeout exists at this planning stage.

## 7. Next Step

Review this persisted Task/Test Plan and approve only with `Approval: TP`.
That approval permits implementation-preparation Brownfield Analysis first. Only a positive
required internal result opens CD+Tests. After execution and reviews, QA is the next user decision.

## AGDF Approval Summary (de; source=en)

- Plan: Zwei Stufen mit eigenem Prüfpunkt und Rückweg: A portables Plugin-Format, B Quellordner plugins/agdf/. Bestehende Paket-, Installations- und Control-Pfade bleiben erhalten.
- T-001: Nach TP-Freigabe Brownfield-Vorbereitung, aktuelle Quellen und fremde Änderungen erfassen; gemeinsame Besitzer mit den verwandten Runs abgleichen. Keine fremden Dateien still reparieren.
- T-002: Agent-Plugins-Schemata 1.0.0 anhand heute erhobener Prüfsummen pinnen; Ajv 8.20.0 nur als gesperrte Build/Test-Entwicklungsabhängigkeit. Offline-Runtime erhält diese Abhängigkeit nicht.
- T-003: Portables Manifest und vollständige Inline-/Fallback-Auswahl aus einer Quelle erzeugen. Copilot und OpenCode behalten ihre eigenen Formate.
- T-004: Hook-Vorlagen aus automatischer Discovery entfernen; nur Runtime-Profile enthalten ausführbare Hooks. Schema-, Ressourcen- und Negativprüfungen schließen Stufe A ab.
- T-005: Kanonischen Quellordner verschieben, aktive Pfadverbraucher samt Build-, Versions-, Workflow- und Conformance-Prüfungen migrieren. Rückweg nur für eigene Änderungen; historische Freigaben bleiben erhalten.
- T-006: Tatsächliche Tarballs aller drei Pakete, Ressourcen, reproduzierbare Erzeugung, Versionsbindungen, Provenance, Consent und Kontrollregeln prüfen.
- T-007: Komponenten-, Profil- und Recovery-Dokumentation sowie bestehende SoT-/Context-Graph-Verweise aktualisieren; Handbuch- und Pfadprüfungen durchführen.
- T-008: Vier Hostadapter, Installation, Update/Recovery und MCP-Protokoll in isolierten Testwurzeln prüfen. Aktive Nutzerkonfiguration bleibt unberührt.
- T-009: Evidenz je Quelle/Paket/Installation/frischem Host erfassen. Verfügbare native Prüfungen bleiben isoliert; fehlende Voraussetzungen ergeben sichtbar unverifiziert, keinen positiven Hostnachweis.
- T-010: Diff, saubere Implementierung und Planerfüllung prüfen, Befunde beheben und anschließend den alleinigen QA-Gate aufrufen. QA bleibt eine eigene Nutzerentscheidung.
- Zuordnung: AC-001 bis AC-009 und alle zugeordneten SDD-Entscheidungen sind in 21 konkreten Szenarien mit Aufgabe, erwartetem Ergebnis und Nachweisquelle abgedeckt.
- Grenzen: Keine neue Paketveröffentlichung, öffentliche MCP-Fähigkeit, aktive Installation, Policy-Änderung, historische Umschreibung oder VCS-Aktion. Fremde gelöschte und doppelte Dateien bleiben erhalten; echte Prüfblocker werden sichtbar berichtet.
- Freigabewirkung: Approval: TP erlaubt zuerst die Brownfield-Implementierungsvorbereitung. Danach wird nur bei positivem Ergebnis umgesetzt und getestet; weitere Gates bleiben bestehen.

