# SD: Pinned and verified plugin MCP SDK acquisition

Status: draft
Gate: SD
Gate approval: open
Based on: PRD
Date: 2026-10-02
Owner: Repository owner
Traceability contract: criteria-chain-v1

## 1. Solution Overview

The runtime plugin ships a small, generated SDK lock bundle under `mcp/sdk/`:

- `package.json` — `{ "private": true, "dependencies": { "@modelcontextprotocol/server": "2.0.0" } }`
- `package-lock.json` — the runtime-only closure (`@modelcontextprotocol/server`, `@modelcontextprotocol/core`,
  `zod`) with `version`, `resolved` and `integrity`, derived from `packages/mcp-server/package-lock.json`
- `expected-sdk.json` — `{ schema_version: 1, sdk_digest, packages: [...] }`

The launcher copies `package.json` and `package-lock.json` into the stage and runs
`npm ci --ignore-scripts --no-audit --no-fund --omit=dev` instead of `npm install <spec>`. npm verifies every
tarball against the locked `integrity`. Before the marker is written, the stage is checked for the exact
package set and the expected digest. Existing runtimes are compared with the expected digest on every
start. An explicit environment override restores today's unverified install, visibly and recorded.

## 2. Ownership And Source Of Truth

- Reviewed dependency tree: `packages/mcp-server/package-lock.json` (unchanged owner).
- Expected SDK digest: new committed source file `packages/mcp-server/sdk-runtime-digest.json`, written by a
  maintainer script from an installed reviewed tree and verified in CI against `packages/mcp-server/node_modules`.
- Bundle rendering: `scripts/sync-plugin-mcp.js` (existing owner of the plugin `mcp/` payload).
- Digest algorithm: `digestMcpSdkRuntime` / `MCP_SDK_RUNTIME_ENTRIES` in
  `packages/core/lib/runtime/plugin-provenance.js` (unchanged).
- Install and verification: `prepareMcpServerPackage` / `inspectMcpServerPackage` in
  `packages/cli/lib/mcp-lifecycle/package.js`; plugin orchestration in `plugin-runtime.js`.

## 3. Architecture Decisions

- SDD-001: Install the SDK with `npm ci` from a generated runtime-only `package.json` plus `package-lock.json` shipped in `mcp/sdk/`; rationale: npm then enforces locked versions and sha512 integrity for every package, and dev dependencies of `@agdf/mcp-server` stay out; consequence: a registry or mirror serving different bytes fails, and the lock must be regenerated whenever the SDK is upgraded.
- SDD-002: Ship the expected SDK digest as `mcp/sdk/expected-sdk.json`, copied from the committed `packages/mcp-server/sdk-runtime-digest.json`; a CI test recomputes `digestMcpSdkRuntime` over the reviewed installed tree and fails on drift; rationale: the build environment does not always have the SDK installed, while CI does; consequence: SDK upgrades need one extra maintainer step (`npm run mcp:sdk-digest`).
- SDD-003: Before writing the marker, the stage's `node_modules` package set (scoped and unscoped, dot entries ignored) must equal the locked set plus the plugin-copied `@agdf/mcp-server` and `create-agdf`, and `digestMcpSdkRuntime(stage)` must equal the expected digest; failures throw `AGDF_MCP_SDK_PACKAGE_SET_MISMATCH` or `AGDF_MCP_SDK_DIGEST_MISMATCH` and the stage is removed; rationale: closes finding F1 (packages outside the digested entries); consequence: verification lives in `prepareMcpServerPackage` behind an optional `expectedSdk` argument, so the registered MCP path is unchanged.
- SDD-004: `ensurePluginMcpRuntime` treats an existing runtime as matching only when its recomputed SDK digest equals the expected digest and its marker is not `unverified_override` (unless the override is active); otherwise it uses the existing discard-and-re-prepare branch; rationale: reuses the current owned-root replacement path; consequence: runtimes with a different tree are replaced once, a matching runtime starts without network access.
- SDD-005: The override is the environment variable `AGDF_MCP_ALLOW_UNVERIFIED_SDK=1`; when set, the launcher uses the previous `npm install --save-exact @modelcontextprotocol/server@2.0.0`, skips SDD-003, writes `sdk_verification: "unverified_override"` into the marker and prints `AGDF_MCP_SDK_UNVERIFIED_OVERRIDE` with a one-line explanation to stderr on prepare and every start; verified runtimes record `sdk_verification: "verified"`; rationale: deliberate, user-controlled and auditable, cannot be set by the plugin payload; consequence: stderr is the only channel, shown in the installer output and the host MCP log.
- SDD-006: Launcher failures print the stable code followed by cause and one recovery action on one stderr line in English (technical channel), while `--prepare` keeps its JSON stdout contract; rationale: today only the bare code is printed; consequence: tests assert code prefix and presence of a recovery phrase, not exact prose.

## 4. Integration Points

- Plugin payload: `mcp/sdk/{package.json,package-lock.json,expected-sdk.json}` for the Claude and Codex
  runtime plugins (`scripts/sync-plugin-mcp.js`, `syncPluginMcp` expected-file set and pruning).
- Runtime provenance and payload inventories: any digest or inventory over `mcp/` changes.
- npm: `npm ci` instead of `npm install` through `npmInvocation` (same executable resolution).
- Installer `--prepare` (Claude and Codex host adapters) and host-started launcher.
- Test fixture `scripts/support/plugin-mcp-fixture.js` (`offlineNpm` must accept the `ci` form).
- Docs: `docs/architecture/README.md` §6.1, `PRIVACY.md`.

## 5. Constraints And Compatibility

- Node.js 22+, `--ignore-scripts` stays, no new dependency.
- Marker stays schema 2; `sdk_verification` is an additional field. A missing field is treated as
  "not verified yet" and handled by the digest comparison of SDD-004.
- Registered MCP path (`mcp enable`) calls `prepareMcpServerPackage` without `expectedSdk` and is
  unchanged (follow-up run per PRD decision).
- Digest stability: `digestSelectedEntries` hashes normalized relative paths and file bytes only; npm
  extracts tarballs byte-identically on all platforms, so the value is OS-independent.

## 6. Test And Evidence Strategy

- Unit tests on `prepareMcpServerPackage` with offline fixtures: clean closure passes; extra package,
  missing package, modified file and wrong expected digest each fail with the named code and leave no
  stable root.
- Fixture simulating an integrity failure of `npm ci` (non-zero exit) → no committed runtime.
- `ensurePluginMcpRuntime`: matching existing runtime reused without exec call; mismatching or
  `unverified_override` runtime discarded and re-prepared.
- Override on/off cycle with marker and stderr assertions.
- Build test: generated `mcp/sdk/*` equals rendering from `packages/mcp-server/package-lock.json` and the
  committed digest; CI test: committed digest equals the digest of the installed reviewed tree.
- Existing suites: MCP lifecycle, Claude/Codex plugin MCP, package, runtime integrity.

## 7. Acceptance Traceability

| criterion_id | design_response | source_of_truth | design_decision_ids | compatibility_risk |
|---|---|---|---|---|
| AC-001 | Stage installs via `npm ci` from the shipped runtime-only lock | `packages/mcp-server/package-lock.json`; `plugin-runtime.js` | SDD-001 | Mirrors must serve identical tarballs; mitigated by the override (SDD-005) |
| AC-002 | Exact package-set and expected-digest check before marker write | `package.js` `prepareMcpServerPackage` | SDD-003 | Registered path unaffected because `expectedSdk` is optional |
| AC-003 | npm integrity verification during `npm ci`; failure maps to acquisition failure and stage removal | `package.js` install step | SDD-001 | Integrity errors are not distinguished from network errors; message names both causes |
| AC-004 | Recompute and compare the SDK digest of existing runtimes on every start; reuse or replace | `plugin-runtime.js` `ensurePluginMcpRuntime` | SDD-004 | One-time re-preparation for runtimes from a divergent tree needs network access |
| AC-005 | Environment override, marker field, stderr warning; re-verification once the override is gone | `plugin-runtime.js`, `package.js` marker | SDD-005 | Override weakens the guarantee only for that user and is always visible |
| AC-006 | Bundle generated by `syncPluginMcp`; committed digest verified in CI; drift fails tests | `scripts/sync-plugin-mcp.js`, `packages/mcp-server/sdk-runtime-digest.json` | SDD-002 | Extra maintainer step on SDK upgrades |
| AC-007 | One-line messages with stable code, cause and recovery; plugin skills and hooks do not depend on the launcher | `plugin-runtime.js` `launchPluginMcpServer` | SDD-006 | none — message format only, codes stay stable |
| AC-008 | Update §6.1 and PRIVACY.md wording to the locked, verified acquisition, the override and the remaining registered-path gap | `docs/architecture/README.md`, `PRIVACY.md` | none — documentation follows SDD-001 to SDD-005 without a new decision | none — documentation only |
| AC-009 | Run the existing suites; adapt the offline fixture to the `ci` form | existing test scripts, `scripts/support/plugin-mcp-fixture.js` | none — no new design decision; fixture follows SDD-001 | Fixture change could mask regressions; keep its spec assertion strict |

## 8. Risks And Open Questions

- Payload inventories and provenance digests over `mcp/` must include the new files; exact checks are
  located in TP/implementation-preparation Brownfield Analysis.
- `npm ci` with a lock whose `resolved` URLs point to registry.npmjs.org: npm rewrites the default
  registry host to a configured one; verify in Brownfield Analysis.
- Real npm-backed preparation on Windows remains host evidence outside QA prerequisites.

## 9. Next Step

Review this solution design and approve only with:

`Approval: SD`

## AGDF Approval Summary (de; source=en)
- Lösung: Das Plugin liefert unter mcp/sdk/ ein erzeugtes Laufzeit-Lockfile samt package.json und einen Soll-Digest; der Launcher installiert per npm ci und prüft vor der Übernahme exakten Paketsatz und Digest.
- Entscheidungen: SDD-001 npm ci aus mitgeliefertem Lockfile; SDD-002 Soll-Digest als committete Quelle, in CI gegen den geprüften Baum verifiziert; SDD-003 Paketsatz- und Digest-Prüfung vor dem Marker; SDD-004 Neuprüfung bestehender Laufzeiten bei jedem Start; SDD-005 Override per AGDF_MCP_ALLOW_UNVERIFIED_SDK=1 mit Marker-Vermerk und Warnung; SDD-006 einzeilige Fehlermeldungen mit Ursache und Recovery.
- Kompatibilität: Registrierter MCP-Weg bleibt unverändert; Marker bleibt Schema 2 mit neuem Feld; Mirrors mit abweichenden Paketen brauchen den Override.
- Nachweise: Offline-Fixtures für Erfolg, fremdes/fehlendes Paket, geänderte Datei, falschen Digest, Integritätsfehler, Bestand und Override; Build- und CI-Test gegen Drift.
