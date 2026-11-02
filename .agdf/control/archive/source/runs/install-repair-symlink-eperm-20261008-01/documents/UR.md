# UR: Guard Windows symlink EPERM in install-control-repair test

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-08
Owner: Arndt Gold
Run: install-repair-symlink-eperm-20261008-01
Language: en

## 1. Problem

On native Windows without Developer Mode, `npm --prefix packages/cli run test:install-control-repair` aborts with `Error: EPERM: operation not permitted, symlink 'elsewhere.md' -> …`. The test `packages/cli/scripts/install-control-repair-test.js` calls `symlinkSync` without a guard in two places: the `source-link` case near line 289 and the `linked` case near line 299. The `smoke-test` chain in `packages/cli/package.json` joins its suites with `&&`, so this single environment restriction stops every later suite on Windows. Observed on 2026-10-08 during the smoke run of `status-card-stale-next-action-20261008-01`. The test file itself is unchanged since 2026-10-01.

## 2. Goal

On Windows without symlink permission, `test:install-control-repair` skips only the two symlink-dependent checks, logs a visible reason, and runs all other checks to completion. On platforms that can create symlinks, both checks run exactly as today.

## Affected Users

- The AGDF maintainer, who runs the test suites and the `smoke-test` chain on native Windows.
- CI and other environments with symlink permission. They must see no change.

## 3. Scope

- Guard the two `symlinkSync` calls in `packages/cli/scripts/install-control-repair-test.js` with the existing repository pattern: catch `EPERM` on `win32`, log a SKIPPED line naming EPERM, and skip only the assertions that depend on that symlink. Every other error is still thrown.
- Keep all non-symlink assertions of the test unchanged and running.

## 4. Non-Goals

- No change to production symlink-rejection or repair logic.
- No change to other test files, the smoke chain order or CI configuration.
- No weakening of the symlink assertions where symlinks can be created.
- No release, commit or push.

## 5. Acceptance Signals

1. On this Windows machine, `npm --prefix packages/cli run test:install-control-repair` passes and prints one SKIPPED line per guarded symlink case.
2. Where symlinks can be created, the guarded assertions still execute. The code path is unchanged apart from the guard.
3. An error other than `EPERM` on `win32` during symlink creation still fails the test.

## 6. Existing Source Of Truth

- `packages/cli/scripts/install-control-repair-test.js:287-302`, the two unguarded `symlinkSync` cases.
- The existing guard pattern in `packages/cli/scripts/control-command-test.js:289-295` (SCN-011) and `packages/core/test/control-cockpit-fixtures.js` (`symlinkOrSkip`).
- The Context Graph invariant in `.agdf/control/CONTEXT_GRAPH.md`, node CG-RUN-SCOPED-CONTROL-STATE: symlink-dependent test fixtures catch `EPERM` and skip only the dependent assertions with a logged reason.

## 7. Risks And Unknowns

- A too-broad catch could hide real failures. The guard must be limited to `win32` plus `EPERM`.
- The `source-link` case commits the symlink to git before deleting it. When the symlink cannot be created, the whole case (commit, unlink and plan assertion) must be skipped, not just the `symlinkSync` call.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)

**Problem.** Unter Windows ohne Developer Mode bricht `test:install-control-repair` mit `EPERM` ab, weil `install-control-repair-test.js` an zwei Stellen ungeschützt `symlinkSync` aufruft (Fall `source-link` um Zeile 289, Fall `linked` um Zeile 299). Die `smoke-test`-Kette verknüpft ihre Suiten mit `&&`, deshalb stoppt diese eine Umgebungsgrenze alle späteren Suiten unter Windows. Beobachtet am 2026-10-08. Die Testdatei ist seit dem 2026-10-01 unverändert.

**Ziel.** Unter Windows ohne Symlink-Recht überspringt der Test nur die zwei symlink-abhängigen Prüfungen, meldet das sichtbar und führt alle übrigen Prüfungen vollständig aus. Wo Symlinks möglich sind, laufen beide Prüfungen unverändert.

**Betroffen** sind der AGDF-Maintainer, der die Suiten und die Smoke-Kette unter Windows ausführt, und CI sowie andere Umgebungen mit Symlink-Recht. Für sie ändert sich nichts.

**Umfang.** Die zwei `symlinkSync`-Aufrufe erhalten das bestehende Repository-Muster: `EPERM` unter `win32` abfangen, eine SKIPPED-Zeile mit dem Grund EPERM ausgeben und nur die davon abhängigen Prüfungen überspringen. Andere Fehler werden weiter geworfen. Alle anderen Prüfungen bleiben unverändert.

**Nicht enthalten:**

- keine Änderung an der produktiven Symlink-Abwehr oder der Reparaturlogik;
- keine Änderung an anderen Tests, an der Reihenfolge der Smoke-Kette oder an CI;
- keine Abschwächung der Symlink-Prüfungen dort, wo Symlinks möglich sind;
- kein Release, kein Commit und kein Push.

**Abnahmefähig** ist der Umfang unter drei Bedingungen:

1. Der Test läuft auf diesem Windows-Rechner durch und meldet je geschütztem Fall eine SKIPPED-Zeile.
2. Mit Symlink-Recht laufen die Prüfungen weiterhin.
3. Ein anderer Fehler als `EPERM` unter `win32` lässt den Test weiterhin scheitern.

**Maßgebliche Quellen:**

- die beiden Stellen in `install-control-repair-test.js`;
- das bestehende Muster in `control-command-test.js` (SCN-011) und `control-cockpit-fixtures.js` (`symlinkOrSkip`);
- die Invariante im Kontextgraph-Knoten CG-RUN-SCOPED-CONTROL-STATE.

**Risiken.** Ein zu breites Abfangen könnte echte Fehler verdecken, deshalb nur `win32` plus `EPERM`. Im Fall `source-link` muss bei fehlendem Symlink der ganze Fall entfallen, also Commit, Löschen und Planprüfung, nicht nur der Aufruf.

**Nächster Schritt.** Nach `Approval: UR` folgt der Brownfield Review mit Mode/Slice-Entscheidung.
