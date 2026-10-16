# UR: Skip file-symlink negative checks where Windows refuses symlinks

Status: draft
Gate: UR
Gate approval: open
Requirements clarification: complete
Date: 2026-10-15
Owner: Arndt Gold

## 1. Problem

On Windows without Developer Mode or elevation, `symlinkSync` for files fails with `EPERM`. Four
test fixtures create a file symlink for a negative check and abort the whole suite there, which
also stops every later suite of the `&&`-chained `smoke-test` and hides real results:

- `packages/cli/scripts/compact-continuation-test.js` (via `test:skill-dispatch`),
- `packages/core/test/decision-qualification-test.js` and `packages/core/test/presentation-document-test.js` (via `test:run-command-flow`),
- `packages/core/test/artifact-readiness-test.js` (via `test:control-inspect`).

The repository already has the shared helper `tryLinkFile` in `scripts/support/symlinks.js`, which
other suites use to skip only symlink-dependent assertions with a visible notice.

## 2. Goal

The four suites run to completion on Windows hosts without symlink privilege, skip only the
assertions that need a file symlink with a visible notice, and keep those assertions where symlinks
are available.

## Affected Users

AGDF maintainers and agents running the test suites on Windows without Developer Mode, including
inside Claude Desktop.

## 3. Scope

- Use `tryLinkFile` at the four file-symlink sites and guard only the dependent assertions.
- Keep every other assertion of these suites unchanged.

## 4. Non-Goals

- Enabling Windows Developer Mode or changing system settings.
- Changing product code, the symlink checks themselves or other suites.
- Changing the `smoke-test` chain.

## 5. Acceptance Signals

- On this Windows host the four suites pass and print one skip notice per affected check.
- Where symlinks are allowed (Linux CI, Developer Mode) the symlink assertions still run and pass.
- An `EPERM` outside Windows or any other error still fails the test (existing helper behaviour).

## 6. Existing Source Of Truth

- `scripts/support/symlinks.js` (`tryLinkFile`, `linkDirectory`).
- The four test files named in Problem.

## 7. Risks And Unknowns

- Reduced negative coverage on Windows hosts without symlink privilege; CI with symlinks keeps it.

## 8. Next Step

Review this UR and approve only with:

`Approval: UR`

## AGDF Approval Summary (de; source=en)

Problem: Unter Windows ohne Entwicklermodus schlägt das Anlegen von Datei-Symlinks mit EPERM fehl. Vier Tests legen für eine Negativprüfung einen Datei-Symlink an und brechen dort die ganze Suite ab: compact-continuation-test.js (test:skill-dispatch), decision-qualification-test.js und presentation-document-test.js (test:run-command-flow) sowie artifact-readiness-test.js (test:control-inspect). Weil die smoke-test-Kette mit && verknüpft ist, laufen danach auch alle folgenden Suiten nicht mehr. Das Repo hat dafür bereits den Baustein tryLinkFile in scripts/support/symlinks.js.

Ziel: Die vier Suiten laufen auf Windows-Rechnern ohne Symlink-Rechte vollständig durch, überspringen nur die Prüfungen, die einen Datei-Symlink brauchen, mit sichtbarem Hinweis, und behalten diese Prüfungen dort, wo Symlinks möglich sind.

Betroffene: Maintainer und Agenten, die die Testsuiten unter Windows ohne Entwicklermodus ausführen, auch innerhalb von Claude Desktop.

Umfang: tryLinkFile an den vier Stellen einsetzen und nur die davon abhängigen Prüfungen bedingt ausführen; alle anderen Prüfungen bleiben unverändert.

Grenzen: Kein Einschalten des Entwicklermodus und keine Systemeinstellungen, keine Änderung an Produktcode, an den Symlink-Prüfungen selbst, an anderen Suiten oder an der smoke-test-Kette.

Erfolg: Auf diesem Windows-Rechner laufen die vier Suiten durch und melden je übersprungene Prüfung einen Hinweis. Wo Symlinks erlaubt sind (Linux-CI, Entwicklermodus), laufen die Symlink-Prüfungen weiter und bestehen. Ein EPERM außerhalb von Windows oder jeder andere Fehler lässt den Test weiterhin scheitern.

Quellen: scripts/support/symlinks.js und die vier genannten Testdateien.

Risiken: Auf Windows-Rechnern ohne Symlink-Rechte sinkt die Abdeckung der Negativprüfungen; die CI mit Symlinks behält sie.

Nächster Schritt: UR prüfen und freigeben; danach folgt der Brownfield Review mit der Wahl des Lieferwegs.
