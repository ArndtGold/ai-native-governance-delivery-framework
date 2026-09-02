# TP: Projektbezogener Plugin-Opt-out über alle Oberflächen

Status: approved
Gate: TP
Gate approval: `Approval: TP`
Revision: 1
Based on: SD revision 1
Date: 2026-09-02
Owner: Arndt Gold

## 1. Task List

| task_id | Task | Acceptance mapping | Evidence required |
|---|---|---|---|
| CSO-T01 | Pre-Implementation Brownfield Analysis ausführen. Aktuellen Diff, fremde aktive Runs, CLI-Parser und -Validierung, Lifecycle-Plan/Apply/Verify, Copilot-Settings-Owner, Git-Ausführung, Dokumentation und bestehende Tests erneut inventarisieren. Erlaubte Pfade und Baseline festhalten. | PRD-01..09; SD-01..08 | `BROWNFIELD_ANALYSIS.md` mit `pass`, Scope-Isolation, Owner-Map, Baseline und konkreten Stop-Bedingungen. Kein Code davor. |
| CSO-T02 | `--shared` in Parser, Optionsobjekt, Hilfe und Command-Validierung ergänzen. Nur die exakte Kombination `disable --surface copilot --scope repository --shared` zulassen. Persönlicher Modus bleibt der Default. | PRD-02, PRD-03; SD-01 | Parser- und Validierungstests für Default, explizit shared und alle unzulässigen Kombinationen. |
| CSO-T03 | Den vorhandenen Copilot-Settings-Owner um explizite Repository-Zielauflösung und eine reine Opt-out-Planung erweitern. Exakten Key `agdf@agdf` semantisch erhalten und nur auf `false` setzen. | PRD-02..04; SD-02..04 | Positive Fixtures für beide Pfade, Neuerstellung, Merge, Idempotenz und Fremdwert-Retention. |
| CSO-T04 | Pfadsicherheit und strikte JSON-Grenze implementieren: Ziel und vorhandene Eltern auf Symlinks prüfen, Root und `enabledPlugins` typisieren, JSONC/Kommentare und mehrdeutige exakte Werte vor Mutation ablehnen. | PRD-04; SD-02..04 | Negative Fixtures beweisen den jeweiligen Fehlercode und unveränderte Ausgangsbytes. |
| CSO-T05 | Persönlichen Git-Ignore-Preflight über eine injizierbare argumentbasierte Git-Ausführung implementieren. Der exakte lokale Pfad muss effektiv ignoriert sein. Keine automatische Änderung von `.gitignore` oder `.git/info/exclude`. | PRD-02; SD-05 | Tests für ignored, unignored, Git nicht verfügbar und kein Worktree. Settings- und Ignore-Dateien bleiben in Fehlerfällen unverändert. |
| CSO-T06 | Copilot-Opt-out atomar über den bestehenden Settings-Writer anwenden. Lifecycle-Mutation gezielt an diesen Owner delegieren, Dateimodus erhalten, neue persönliche Datei mit `0600` anlegen, temporäre Dateien bereinigen und Postcondition lesen. | PRD-02..05; SD-06 | Tests mit injizierten Write-, Rename- und Verify-Fehlern. Vorzustand bleibt erhalten und es entsteht kein Teilzustand. |
| CSO-T07 | Repository-Lifecycle surface- und mode-aware erweitern. Codex unverändert behandeln, Copilot-Pfad und Audience korrekt planen/verifizieren, Claude Code und OpenCode weiterhin ohne Mutation ablehnen. | PRD-02, PRD-03, PRD-05, PRD-07, PRD-08; SD-07, SD-08 | Lifecycle-Tests für alle vier Oberflächen, beide Copilot-Modi und unveränderte Codex-Regression. |
| CSO-T08 | `runDisable` auf den neuen Plan/Apply/Verify-Vertrag umstellen. Resultat zeigt geänderten Pfad, persönlichen oder gemeinsamen Wirkungskreis, Retention, `pending_restart`, Evidenzgrenze und genau einen nächsten Schritt. | PRD-02, PRD-03, PRD-05, PRD-06; SD-07 | JSON- und Textausgabe-Assertions. Konfigurationsnachweis wird nicht als verwalteter oder frischer Hostzustand ausgegeben. |
| CSO-T09 | Copilot-Retention-Integrationstest erweitern. Erfolgreichen persönlichen und gemeinsamen Disable, unveränderte Instruktionsdateien, `.agdf/control`, globale Verfügbarkeit sowie alle Fehlerpfade abdecken. | PRD-02..06, PRD-09 | `test:copilot-repository-retention` mit byte-genauer Retention der unabhängigen Dateien und semantischer Settings-Retention. |
| CSO-T10 | Öffentliche Support-Matrix und exakte Beispiele in `INSTALL.md`, root `README.md`, `create-agdf/README.md` und CLI-Hilfe synchronisieren. Persönlich/shared, Ignore-Voraussetzung, Commit-Wirkung, Claude/OpenCode-Grenzen, globale Entfernung sowie `/plugin list` und `/instructions` getrennt erklären. | PRD-01, PRD-03, PRD-06, PRD-08, PRD-09; SD-08 | Dokumentationsassertionen und manuelle Konsistenzprüfung ohne unbelegte Host-Parität. |
| CSO-T11 | Fokussierte Tests und vollständigen Package-Smoke ausführen. Relevante Fehler beheben, ohne Scope oder Owner zu erweitern. | alle | Alle Testplan-Kommandos grün, `git diff --check` grün und keine unerwartete generierte oder fremde Änderung. |
| CSO-T12 | Task Plan Review, Clean Implementation Review und Code Review gegen den tatsächlichen Diff durchführen. Findings beheben oder offen an den richtigen Gate-Owner zurückführen. Danach QA-Gate evidenztreu ausführen. | alle | Drei dauerhafte Review-Artefakte, vollständige Task-Coverage und QA-Ergebnis `pass`, `revise` oder `block`. |

## 2. Test Plan

| test_id | Scope | Command or mechanism | Expected evidence |
|---|---|---|---|
| CSO-TEST-01 | AGDF control state | version-matched `gate-check --run cross-surface-plugin-opt-out --json` and `doctor --all-active --json` | Run remains canonical, relationships pass and unrelated active runs are not mutated. |
| CSO-TEST-02 | CLI parsing and option matrix | `npm --prefix create-agdf run test:cli-modularization` | `shared` defaults false, exact Copilot tuple passes, all other tuples fail before filesystem work and usage contains both commands. |
| CSO-TEST-03 | Settings planning and path safety | focused Copilot settings assertions in `test:lifecycle` or a focused settings test owned by Brownfield Analysis | Personal/shared paths, exact merge, idempotency and foreign retention pass. Invalid JSON, JSONC, types and symlinks fail with zero mutation. |
| CSO-TEST-04 | Effective ignore decision | focused Git preflight fixtures with injected executor and temporary repositories | Ignored path passes. Unignored, unavailable Git and non-worktree fail. Neither Git ignore source changes. |
| CSO-TEST-05 | Atomicity and recovery | injected settings-writer failure matrix | Write, rename and verification failures preserve previous bytes, remove temporary artifacts and never report success. |
| CSO-TEST-06 | Repository lifecycle | `npm --prefix create-agdf run test:lifecycle` | Both Copilot modes pass, Codex behavior remains unchanged and Claude/OpenCode unsupported combinations retain files. |
| CSO-TEST-07 | Copilot end-to-end retention | `npm --prefix create-agdf run test:copilot-repository-retention` | Personal and shared commands affect only the exact settings key. Instructions and `.agdf/control` remain byte-identical. |
| CSO-TEST-08 | Lifecycle presentation | focused text and JSON assertions in lifecycle tests | Audience, path, retention, `pending_restart`, exactly one next action and host-evidence limitation are visible. |
| CSO-TEST-09 | Global uninstall regression | existing lifecycle and Copilot retention fixtures | Preview remains non-mutating, confirmation remains required and all four surface uninstall paths retain unrelated repository data. |
| CSO-TEST-10 | Documentation contract | focused assertions plus inspection of `INSTALL.md`, root `README.md`, `create-agdf/README.md` and rendered CLI help | Four-surface matrix, both Copilot modes and paths, ignore prerequisite, instruction independence and verification commands agree. |
| CSO-TEST-11 | Runtime and package regression | `node plugin/scripts/check-runtime-integrity.mjs`; `npm --prefix create-agdf run test:package-contents`; `npm --prefix create-agdf run test:package-build` | Runtime and packaged assets remain coherent. |
| CSO-TEST-12 | Aggregate regression | `npm --prefix create-agdf run smoke-test` | Entire package smoke chain passes without lifecycle, installer, gate, routing or release-coherence regression. |
| CSO-TEST-13 | Diff quality | `git diff --check` plus scoped diff inventory | No whitespace errors, no unplanned files and no unrelated user change absorbed. |
| CSO-TEST-14 | Mandatory reviews and QA | `task-plan-review`, `clean-implementation-review`, `code-review`, then `qa-gate` | Every `CSO-T*` has evidence, no unresolved relevant finding is hidden and QA owns the decision. |
| CSO-TEST-15 | Fresh Copilot UAT | after QA only, restart Copilot in a bounded repository and inspect `/plugin list` and `/instructions` separately | Plugin configuration and independent instruction discovery are observed separately. Managed-policy limits remain explicit. |

## 3. Brownfield Scope

Before implementation, Brownfield Analysis must revalidate:

- `create-agdf/lib/cli/parse-args.js`, `command-registry.js` and CLI usage tests as the public option owner;
- `create-agdf/lib/cli/application.js` as the lifecycle composition and reporting owner;
- `create-agdf/lib/lifecycle/operations.js` and `result.js` as plan/apply/verify and result owners;
- `create-agdf/lib/installers/copilot-settings.js` and `fs-swap.js` as the sole settings and atomic rename owners;
- current Git execution/injection conventions. No shell string may be introduced;
- `create-agdf/scripts/lifecycle-test.js`, `cli-modularization-test.js` and
  `copilot-repository-retention-test.js` as primary regression surfaces;
- `INSTALL.md`, root `README.md`, `create-agdf/README.md` and CLI help as public lifecycle guidance;
- `CG-CREATE-AGDF-CLI-COMPOSITION` as the reusable Context Graph owner; and
- the current working tree, especially unrelated release-profile, status-card and image changes.

The analysis must stop implementation if a clean isolation from existing user changes is not possible,
if a second settings parser/writer is required, if Git-ignore safety needs an automatic shared
repository mutation, or if official Copilot behavior conflicts with the approved PRD or SD.

## 4. Out Of Scope

- JSONC-preserving editing or a general JSONC parser/writer.
- Automatic edits to `.gitignore`, `.git/info/exclude` or any instruction file.
- A repository-local Claude Code disable mechanism without separate verified host support.
- A new OpenCode disable semantic beside its existing repository activation path.
- Changes to gate order, approval values, AGDF control authority or lifecycle result schema version.
- Managed-policy override, host-permission mutation or a claim of cross-host parity.
- Commit, push, pull request, publication, release or installed-plugin/cache mutation.

## 5. Risks And Blockers

- **Block:** Brownfield Analysis is not `pass` or cannot isolate overlapping working-tree changes.
- **Block:** personal settings could be created without effective Git-ignore evidence.
- **Block:** any error path can leave a partial or incorrectly reported successful settings mutation.
- **Block:** implementation overwrites ambiguous, invalid, JSONC or symlinked configuration.
- **Block:** `--shared` can affect a non-Copilot surface, another command or a non-repository scope.
- **Block:** plugin disablement is presented as disabling independent instructions.
- **Revise:** a second parser, writer, lifecycle route or support-matrix owner is introduced.
- **Revise:** Codex disable or any global uninstall behavior regresses.
- **Revise:** documentation, CLI help and actual behavior disagree.
- **Warn:** deterministic repository tests cannot prove fresh-session or managed-policy effectiveness.

## 6. Execution Order And Gate Boundary

1. `CSO-T01` only: Pre-Implementation Brownfield Analysis. No implementation beforehand.
2. `CSO-T02` through `CSO-T08`: parser, settings safety and lifecycle behavior.
3. `CSO-T09` and `CSO-T10`: integration evidence and public guidance.
4. `CSO-T11`: focused and aggregate verification.
5. `CSO-T12`: mandatory reviews and QA.
6. Fresh-session evidence occurs only after QA and explicit UAT routing.

This TP does not yet authorize implementation. Exact `Approval: TP` authorizes first the
Pre-Implementation Brownfield Analysis. Only its recorded `pass` opens CD+Tests.

## 7. Next Step

TP revision 1 was approved with exact approval after same-run, same-gate and revision revalidation.
Pre-Implementation Brownfield Analysis revision 1 passed. CD+Tests may now implement only the
approved tasks and paths.

Implementation does not grant QA or release authority.
