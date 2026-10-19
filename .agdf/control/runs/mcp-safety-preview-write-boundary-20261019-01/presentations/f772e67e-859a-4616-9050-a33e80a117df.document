# UR: Declare the preview snapshot writer in the MCP safety write boundary

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-19
Owner: Arndt Gold

## 1. Problem

The MCP server safety test fails on `main` since PR #23 (a66a14ca) and on the branch `fix/agdf-core-approval-defects-20261017` (PR #22): `npm --prefix packages/mcp-server run test:safety` stops with "module runtime/core/lib/control-state/preview-snapshot.js exceeds its declared filesystem write boundary" (actual `writeFileSync`, `openSync`, `fsyncSync`; declared none).

PR #23 added `packages/core/lib/control-state/preview-snapshot.js`. Its `publishPreviewSnapshot` writes a run-local UI preview snapshot through one exclusive-create open (`O_WRONLY | O_CREAT | O_EXCL | O_NOFOLLOW`, mode 0600), a write and an fsync. `run-presentation.js`, already a declared write owner, composes it when it publishes a presentation. The MCP server reaches it through `mcp-dispatch-runtime.js` → `control-inspect/service.js` → `run-presentation.js` → `preview-snapshot.js`. The finite map `continuationWriteOwners` in `packages/mcp-server/test/safety.test.js` does not declare it, so the scan of the reachable module graph fails. A scan of the full graph (121 modules) and of the read-only graph (89 modules) shows `preview-snapshot.js` as the only module beyond its declared boundary.

CI runs this test through the CLI smoke suite (`test:mcp-server` → `npm --prefix ../mcp-server test`). The "AGDF Guardrails" workflow on `main` at a66a14ca (run 39255054874) fails in the MCP partitions on Windows (Node 22) and Linux (Node 22 and 24) with exactly this assertion. PR #22 inherits the failure, and the mcp-server suite is an acceptance signal of its D5 run.

## 2. Goal

The MCP server safety test passes again and its filesystem write boundary stays finite and reviewed:

- `preview-snapshot.js` is declared with exactly the write symbols it uses, like the other Core write owners that the MCP route reaches.
- The test asserts that the snapshot writer opens files only for exclusive creation without following links, so the declaration cannot silently cover an overwrite.

## Affected Users

- Maintainers who need a green CI on `main` and on PR #22, and coding agents who run the mcp-server test suite before merging.
- Reviewers who rely on the safety test to notice new filesystem writers reachable from the MCP server.

## 3. Scope

1. In `packages/mcp-server/test/safety.test.js`, declare `runtime/core/lib/control-state/preview-snapshot.js` in `continuationWriteOwners` with `writeFileSync`, `openSync` and `fsyncSync`.
2. Add a structural assertion, next to the existing ones for `snapshot.js` and `run-presentation.js`, that `preview-snapshot.js` contains exactly one `openSync` call and that it uses `O_CREAT`, `O_EXCL` and `O_NOFOLLOW`.
3. Implementation on the branch `fix/agdf-core-approval-defects-20261017` in its worktree; the change joins PR #22.

## 4. Non-Goals

- Changing `preview-snapshot.js`, `run-presentation.js` or the import structure of the MCP route.
- Declaring or widening any other module's write boundary.
- The machine-dependent warm p95 limit of the mcp-server performance test (known finding F09).
- Any write to run `mcp-ergonomics-baseline-20261016-01` or to the shared main checkout; release or reinstalling the plugin.

## 5. Acceptance Signals

- `npm --prefix packages/mcp-server run test:safety` passes locally, and the MCP partitions of the "AGDF Guardrails" workflow pass on PR #22.
- The new assertion fails when the snapshot writer's open loses `O_EXCL` or `O_NOFOLLOW`, or when a second `openSync` call appears.
- The mcp-server suite passes, apart from the known machine-dependent performance limit F09; `npm run test:verification` and `npm run build:prepare` pass.
- No module other than `preview-snapshot.js` gains a declared write symbol.

## 6. Existing Source Of Truth

- `packages/mcp-server/test/safety.test.js` (`continuationWriteOwners`, `assertWriteBoundary`, the read-only graph checks).
- `packages/core/lib/control-state/preview-snapshot.js` (`publishPreviewSnapshot`) and `packages/core/lib/control-state/run-presentation.js` (presentation publishing).
- `.github/workflows/agdf-guardrails.yml`, `scripts/ci-plan.mjs` and `packages/cli/package.json` (`test:mcp-server`, which CI runs in the MCP partitions).

## 7. Risks And Unknowns

- Declaring a writer that the read route can import widens the reviewed boundary. The test already states that import reachability is not function authority and keeps a finite symbol boundary plus no-write tests; the structural assertion keeps the declaration limited to exclusive creation.
- Other mcp-server tests that run after `test:safety` may reveal further failures once it passes; they are reported, not fixed here unless they share this cause.

## 8. Next Step

Review this UR and approve only with `Approval: UR`. Then the Brownfield Review and Mode/Slice decision follow. Nothing is implemented yet.

## AGDF Approval Summary (de; source=en)

- Problem: Der Safety-Test des MCP-Servers schlägt seit PR #23 auf main und auf dem Fix-Branch von PR #22 fehl. Die mit PR #23 neue Datei preview-snapshot.js schreibt Preview-Snapshots (exklusives Neuanlegen ohne Linkfolgen, Schreiben, fsync). Sie ist über run-presentation.js aus dem MCP-Server erreichbar, steht aber nicht in der deklarierten Schreibgrenze continuationWriteOwners. Sie ist das einzige Modul über seiner Grenze. Die CI führt den Test über die CLI-Smoke-Suite aus: Der Workflow „AGDF Guardrails“ ist auf main bei a66a14ca in den MCP-Partitionen unter Windows und Linux genau daran gescheitert, und PR #22 erbt den Fehler.
- Ziel: Der Safety-Test läuft wieder durch, und die Schreibgrenze bleibt endlich und geprüft: preview-snapshot.js wird mit genau seinen drei Schreibsymbolen deklariert, und der Test sichert ab, dass es Dateien nur exklusiv neu anlegt und keinen Links folgt.
- Betroffene: Maintainer, die eine grüne CI auf main und für PR #22 brauchen, und Coding-Agenten, die vor dem Merge die mcp-server-Suite ausführen; Reviewer, die sich auf den Test verlassen, um neue Schreiber zu bemerken.
- Umfang: Nur packages/mcp-server/test/safety.test.js: Eintrag für preview-snapshot.js in continuationWriteOwners und eine Strukturprüfung (genau ein openSync, mit O_CREAT, O_EXCL und O_NOFOLLOW) neben den bestehenden Prüfungen für snapshot.js und run-presentation.js. Umsetzung auf dem Fix-Branch, Teil von PR #22.
- Abnahme: test:safety läuft lokal durch, und die MCP-Partitionen von „AGDF Guardrails“ sind für PR #22 grün; die neue Prüfung schlägt an, wenn O_EXCL oder O_NOFOLLOW fehlen oder ein zweites openSync dazukommt; die mcp-server-Suite ist grün bis auf das bekannte maschinenabhängige Performance-Limit F09; test:verification und build:prepare laufen durch; kein anderes Modul bekommt neue Schreibsymbole.
- Quellen und Abgrenzung: Zuständig bleiben safety.test.js, preview-snapshot.js, run-presentation.js sowie der Guardrails-Workflow mit ci-plan.mjs. Nicht enthalten: Änderungen an preview-snapshot.js, run-presentation.js oder an der Importstruktur, weitere Schreibgrenzen, F09 und jede Änderung am Ergonomie-Run.
- Risiken und Klärung: Die Deklaration erweitert die geprüfte Grenze um einen Schreiber, den der lesende Pfad importieren kann; der Test behandelt Importerreichbarkeit ausdrücklich nicht als Schreibrecht, und die Strukturprüfung begrenzt die Deklaration auf exklusives Neuanlegen. Weitere Fehler in später laufenden Tests werden gemeldet, aber nur behoben, wenn sie dieselbe Ursache haben.
- Nächster Schritt: Diese UR prüfen und nur mit `Approval: UR` freigeben. Danach folgen Brownfield Review und Mode/Slice-Entscheidung.
