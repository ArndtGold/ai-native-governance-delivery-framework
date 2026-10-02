# TP: Pinned and verified plugin MCP SDK acquisition

Status: draft
Gate: TP
Gate approval: open
Based on: SD
Date: 2026-10-02
Owner: Repository owner
Traceability contract: criteria-chain-v1

## 1. Task List

| task_id | Task | Owner | Dependencies |
|---|---|---|---|
| T-001 | Add committed `packages/mcp-server/sdk-runtime-digest.json`, a maintainer script `npm run mcp:sdk-digest` that writes it from the installed reviewed tree, and a drift test that recomputes `digestMcpSdkRuntime` over `packages/mcp-server/node_modules` | Repository owner | none |
| T-002 | Extend `scripts/sync-plugin-mcp.js` to render `mcp/sdk/package.json`, a runtime-only `mcp/sdk/package-lock.json` filtered from `packages/mcp-server/package-lock.json`, and `mcp/sdk/expected-sdk.json`; add them to the expected-file set | Repository owner | T-001 |
| T-003 | Extend `prepareMcpServerPackage` with an optional `expectedSdk` (packages, digest): exact package-set check and digest check before marker write, stable `AGDF_MCP_SDK_PACKAGE_SET_MISMATCH` / `AGDF_MCP_SDK_DIGEST_MISMATCH`, marker field `sdk_verification` | Repository owner | none |
| T-004 | Change `ensurePluginMcpRuntime` to copy the bundle into the stage and run `npm ci --ignore-scripts --no-audit --no-fund --omit=dev`, compare existing runtimes against the expected digest and `sdk_verification`, and implement the `AGDF_MCP_ALLOW_UNVERIFIED_SDK=1` override with marker and stderr warning | Repository owner | T-002, T-003 |
| T-005 | Change `launchPluginMcpServer` failure output to one stderr line with stable code, cause and one recovery action; emit the override warning on prepare and start | Repository owner | T-004 |
| T-006 | Update `scripts/support/plugin-mcp-fixture.js` (`offlineNpm` accepts only the `ci` form in the stage with the shipped lock, plus the override `install` form) and add the scenario tests below | Repository owner | T-003, T-004, T-005 |
| T-007 | Update `docs/architecture/README.md` §6.1 and `PRIVACY.md` | Repository owner | T-004 |
| T-008 | Regenerate payloads, update provenance/integrity expectations if they cover `mcp/`, run all affected suites | Repository owner | T-001 to T-007 |

## 2. Verification Traceability

| criterion_id | design_decision_id | task_id | scenario_id | expected_result | evidence |
|---|---|---|---|---|---|
| AC-001 | SDD-001 | T-004 | SCN-001 | Stage receives `package.json` and `package-lock.json` from `mcp/sdk/`; the npm call is `ci` with `--ignore-scripts --omit=dev`; prepared runtime matches | plugin runtime test with `offlineNpm` call assertions |
| AC-002 | SDD-003 | T-003 | SCN-002 | Extra package in stage `node_modules` → `AGDF_MCP_SDK_PACKAGE_SET_MISMATCH`, no stable root | `mcp-lifecycle-test.js` new case |
| AC-002 | SDD-003 | T-003 | SCN-003 | Missing locked package → `AGDF_MCP_SDK_PACKAGE_SET_MISMATCH`, no stable root | `mcp-lifecycle-test.js` new case |
| AC-002 | SDD-003 | T-003 | SCN-004 | Modified file in `zod` or wrong expected digest → `AGDF_MCP_SDK_DIGEST_MISMATCH`, no stable root | `mcp-lifecycle-test.js` new case |
| AC-003 | SDD-001 | T-006 | SCN-005 | `npm ci` exits non-zero (simulated EINTEGRITY) → `AGDF_MCP_PACKAGE_ACQUISITION_FAILED`, stage removed, no stable root | plugin runtime test |
| AC-004 | SDD-004 | T-004 | SCN-006 | Existing matching runtime is reused with zero npm calls | plugin runtime test (`npmCalls` empty) |
| AC-004 | SDD-004 | T-004 | SCN-007 | Existing runtime with tampered SDK file is discarded and re-prepared with one `ci` call | plugin runtime test |
| AC-005 | SDD-005 | T-004 | SCN-008 | Override set → `install` form used, marker `sdk_verification: unverified_override`, stderr contains `AGDF_MCP_SDK_UNVERIFIED_OVERRIDE` on prepare and start | plugin runtime and launcher test |
| AC-005 | SDD-005 | T-004 | SCN-009 | Override removed → runtime marked unverified is re-prepared via `ci` and marked `verified` | plugin runtime test |
| AC-006 | SDD-002 | T-001 | SCN-010 | Drift test passes for the committed digest and fails when the digest file is altered | new mcp-server digest test (CI) |
| AC-006 | SDD-002 | T-002 | SCN-011 | Generated `mcp/sdk/*` equals the rendering from the lockfile and committed digest; a dev-only package never appears | sync/plugin MCP test |
| AC-007 | SDD-006 | T-005 | SCN-012 | Launcher failure prints one stderr line starting with the stable code and containing a recovery phrase; `--prepare` stdout JSON unchanged on success | launcher test |
| AC-007 | SDD-006 | T-005 | SCN-013 | When the launcher refuses to start, plugin skills and the session hook still run (no dependency on the launcher) | inspection of hook/skill entrypoints plus existing hook test |
| AC-008 | none — documentation follows SDD-001 to SDD-005 without a new decision | T-007 | SCN-014 | §6.1 and PRIVACY.md name lockfile install, digest check, override and the registered-path gap; links resolve | doc diff and link check |
| AC-009 | none — no new design decision; fixture follows SDD-001 | T-008 | SCN-015 | MCP lifecycle, Claude/Codex plugin MCP, package, CLI modularization and runtime integrity suites pass | test command output |

## 3. Test Plan

- Automated: `packages/cli/scripts/mcp-lifecycle-test.js`, `codex-plugin-mcp-test.js`, Claude plugin MCP
  tests, new launcher/plugin-runtime cases, new digest drift test, sync test, `plugins/agdf/scripts/check-runtime-integrity.mjs`.
- Prerequisite: `npm ci` in `packages/mcp-server` (dev dependencies provide the reviewed SDK tree for
  fixtures and the drift test).
- Inspection: generated `mcp/sdk/package-lock.json` contains exactly server, core and zod.
- Manual, optional (host evidence, not a QA prerequisite): one real `--prepare` against the npm
  registry on Windows.

## 4. Brownfield Scope

Implementation-preparation Brownfield Analysis must inspect:

- `packages/cli/lib/mcp-lifecycle/package.js`, `plugin-runtime.js`, `npm-invocation.js`
- `scripts/sync-plugin-mcp.js`, `scripts/sync-package-assets.js`, `scripts/sync-plugin-runtime.js`
- `packages/core/lib/runtime/plugin-provenance.js` (digest helpers, any inventory over `mcp/`)
- `plugins/agdf/scripts/check-runtime-integrity.mjs`, payload inventory and budget scripts
- `scripts/support/plugin-mcp-fixture.js` and all tests that use it
- how `npm ci` treats `resolved` URLs when a different registry is configured

## 5. Out Of Scope

- Registered MCP path (`mcp enable`) hardening — follow-up run.
- Vendoring the SDK; changing the digest algorithm; release or publish.

## 6. Risks And Blockers

- Block QA if any scenario lacks passing evidence or if the drift test cannot run in CI.
- Revise if payload inventory or integrity checks need broader changes than adding the new files.
- Warn if no real npm-backed preparation was observed (host evidence gap).

## 7. Next Step

Review this task and test plan and approve only with:

`Approval: TP`

## AGDF Approval Summary (de; source=en)
- Aufgaben: T-001 committeter Soll-Digest mit Pflege-Skript und Drift-Test; T-002 Erzeugung von mcp/sdk/ im Sync; T-003 Paketsatz- und Digest-Prüfung in prepareMcpServerPackage; T-004 npm ci, Bestandsprüfung und Override in der Plugin-Laufzeit; T-005 einzeilige Launcher-Meldungen; T-006 Fixture und Tests; T-007 Doku und PRIVACY.md; T-008 Payload neu erzeugen und alle Suiten ausführen.
- Szenarien: SCN-001 bis SCN-015 decken alle Kriterien AC-001 bis AC-009 und Entscheidungen SDD-001 bis SDD-006 ab, inklusive Fehlerfällen für fremdes/fehlendes Paket, geänderte Datei, falschen Digest, Integritätsfehler, Bestand und Override.
- Nachweise: Automatisierte Tests mit Offline-Fixtures; Drift-Test in CI; optional ein echter npm-Bezug unter Windows als Host-Nachweis.
- Risiken: QA blockiert ohne Nachweis je Szenario oder ohne lauffähigen Drift-Test; Überarbeitung, falls Inventar- oder Integritätsprüfungen breiter angepasst werden müssen.
