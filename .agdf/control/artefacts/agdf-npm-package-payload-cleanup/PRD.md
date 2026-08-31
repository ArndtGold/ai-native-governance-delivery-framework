# PRD: Runtime-Clean AGDF npm Package

Status: draft
Gate: PRD
Gate approval: open
Revision: 1
Date: 2026-08-30
Run: `agdf-npm-package-payload-cleanup`
Derived from: approved UR revision 1 and Brownfield Review revision 1

## 1. Product Outcome

The published `create-agdf` package contains only files required for its documented CLI, exports,
installation, scaffolding, validation and supported-host runtime profiles. Maintainer-only submission,
review and temporary build material remains reproducibly generated in the repository but is not
delivered to npm consumers.

## 2. Users And Needs

- An npm consumer needs a complete installable package without unrelated release-review material.
- A maintainer needs one deterministic package boundary that is understandable and difficult to
  drift.
- A release reviewer needs submission candidates and readiness evidence to remain locally buildable
  without making them installed product content.
- A host installer needs the Codex, Claude Code, OpenCode and Copilot payloads to remain complete and
  compatible with existing commands, provenance, integrity and rollback behavior.

## 3. Functional Requirements

### NPR-01 Semantic publish inventory

The package must have one explicit semantic publish inventory. It must distinguish:

- CLI and exported runtime;
- repository scaffolds;
- shared Codex/Claude runtime plugin;
- isolated Copilot runtime plugin;
- OpenCode runtime/configuration assets; and
- maintainer-only build and submission outputs.

The inventory must not rely on a broad rule that implicitly publishes every future child of
`generated/**`.

### NPR-02 Runtime completeness

All existing documented commands and exports must resolve from a clean packed package. Every
supported host profile must retain its required manifests, skills, contracts, hooks where applicable,
control templates, diagnostics, provenance metadata and exact offline validator runtime.

### NPR-03 Submission separation

The following material must remain reproducibly generated for maintainers but must not be present in
the npm tarball or an installed shared runtime profile:

- `generated/submissions/**`;
- shared-profile `submission/**`; and
- other review-only copies proven to have no installation, scaffold, validation or runtime consumer.

Canonical sources under `plugin/submission/**` remain unchanged unless a later design demonstrates a
separate, approved source-of-truth correction.

### NPR-04 Evidence-based classification

A file may be excluded only when repository references, clean-client execution and supported-host
lifecycle tests prove that it is not required. Names such as `test`, `check`, `source`, `meta` or
`generated` are not sufficient classification evidence.

### NPR-05 Positive and negative package contract

Package validation must:

- assert each required semantic component and every declared `bin` and export;
- reject submission, review, temporary build, recovery backup and retired projection paths;
- reject duplicate packed paths;
- retain host-profile isolation, including no Copilot-only files in the shared profile; and
- fail with a path-specific diagnostic when the contract is violated.

### NPR-06 Deterministic generation and packaging

Two consecutive asset generations and two consecutive package inventories from unchanged inputs must
be equivalent. Release preparation may generate local submission candidates before packing, but npm
selection must exclude them deterministically without deleting their repository copy.

### NPR-07 Compatibility and lifecycle proof

The final package must pass existing release preparation, package build, package contents, CLI
load/bootstrap, local-marketplace, Copilot profile, OpenCode, lifecycle, rollback, Runtime Integrity,
Agent Skills conformance and aggregate smoke checks without skipped or weakened assertions.

### NPR-08 Observable package result

The implementation evidence must record baseline and resulting values for:

- file count;
- packed bytes;
- unpacked bytes;
- excluded path classes; and
- retained runtime profile classes.

Size reduction is an outcome measurement, not a substitute for runtime completeness.

### NPR-09 Scope and authority preservation

The cleanup must not change plugin identities, marketplaces, skill semantics, gate behavior, exact
approval values, supported hosts, public CLI syntax, package version or external publication state.
It must not mutate an installed host, commit, push, open a pull request or release a package.

## 4. Acceptance Criteria

| ID | Acceptance criterion |
|---|---|
| AC-01 | `npm pack --dry-run --json` contains every declared `bin`, export and required semantic runtime component exactly once. |
| AC-02 | No packed path starts with `generated/submissions/`. |
| AC-03 | No packed shared-plugin path is beneath `generated/plugins/agdf/submission/`. |
| AC-04 | No packed temporary `.agdf-build-*`, `.previous`, recovery backup or retired Copilot repository projection exists. |
| AC-05 | The local public submission candidate is still generated, validates and remains byte-deterministic outside the published inventory. |
| AC-06 | Codex and Claude Code use the complete shared runtime profile; Copilot uses only its isolated runtime profile; OpenCode retains its required package/configuration assets. |
| AC-07 | Offline validator resolve-only checks report the exact expected version and matched provenance from every runtime-bearing packed profile. |
| AC-08 | Clean packed-package CLI, installer and lifecycle probes pass for all supported surfaces without source-checkout fallback. |
| AC-09 | Existing Runtime Integrity, conformance, release-coherence and aggregate smoke suites pass without weakened assertions. |
| AC-10 | A negative fixture for each forbidden path class fails package validation with the offending path. |
| AC-11 | Repeated generation and package inventory are deterministic from unchanged inputs. |
| AC-12 | Final evidence reports before/after file count and byte sizes and explains every excluded class and every intentionally retained diagnostic class. |
| AC-13 | No public command, export, plugin identity, marketplace identity, supported-host claim, gate semantic, version or external release state changes. |
| AC-14 | The independent Copilot run's approved scope and QA evidence are not rewritten; only compatibility regression evidence may be added to this cleanup run. |

## 5. Non-Functional Requirements

- Maintainability: one canonical publish-classification owner, no parallel handwritten manifests.
- Auditability: path classes and consumer evidence are machine-checkable and visible in test output.
- Safety: exclusion fails closed on unknown or ambiguous consumers.
- Portability: path handling and package assertions work on macOS, Linux and native Windows semantics.
- Determinism: stable path ordering and byte-identical generated assets from unchanged inputs.
- Compatibility: existing commands, exports, installations, provenance and rollback behavior remain
  unchanged.

## 6. Explicit Non-Goals

- Removing operational integrity or conformance diagnostics merely to reduce size.
- Redesigning the plugin generator, installer transaction, local validator or public submission
  format beyond what package separation requires.
- Introducing runtime download-on-demand, network fetching, optional dependencies or postinstall
  reconstruction.
- Deleting canonical or generated submission material from the maintainer checkout.
- Versioning, publishing, release workflow mutation, installed-host mutation or VCS delivery.

## 7. Evidence Plan

- Current and final `npm pack --dry-run --json` inventories with categorized paths and byte counts.
- Static reference/consumer map for every excluded class.
- Package contract positive and negative tests.
- Clean-client CLI, export and installation probes from the actual tarball.
- Shared and Copilot runtime resolve-only/provenance checks.
- Existing package-build, public-plugin, lifecycle, Runtime Integrity, conformance and full smoke
  results.
- Diff inspection proving no unrelated run, release, version or installed-host mutation.

## 8. Open Design Questions

- Should the semantic publish inventory be projected into an npm staging directory or represented by
  a narrower package allowlist with deterministic exclusions?
- Should shared runtime-profile exclusions be owned by a profile-aware copy policy or by a generated
  inventory that drives both copying and validation?
- Which build-only metadata beyond submission directories is provably safe to exclude without
  weakening provenance or conformance diagnostics?
- How should negative fixtures inject forbidden paths without mutating canonical generated outputs?

These are Solution Design decisions. They do not weaken the acceptance criteria.

## 9. Next Step

Review this PRD and approve only with:

`Approval: PRD`
