# SD: Sicherer projektbezogener Plugin-Opt-out über alle Oberflächen

Status: approved
Gate: SD
Gate approval: `Approval: SD`
Revision: 1
Based on: PRD revision 1
Date: 2026-09-02
Owner: Arndt Gold

## 1. Solution Overview

Der bestehende Lifecycle-Befehl bleibt der einzige öffentliche Owner für Deaktivierung und globale
Entfernung. Der Repository-Opt-out wird für GitHub Copilot um zwei klar getrennte Modi erweitert:

- `disable --surface copilot --scope repository` ist der persönliche Standard. Er setzt ausschließlich
  `enabledPlugins["agdf@agdf"] = false` in `.github/copilot/settings.local.json`.
- `disable --surface copilot --scope repository --shared` ist die ausdrückliche gemeinsame Auswahl.
  Er setzt denselben exakten Eintrag in `.github/copilot/settings.json`.

`--shared` ist nur für `disable`, `--surface copilot` und `--scope repository` gültig. Jede andere
Kombination wird vor Planung und Mutation als Nutzungsfehler abgelehnt. Codex behält seinen
bestehenden Repository-Pfad. Claude Code und OpenCode erhalten keinen erfundenen lokalen
Disable-Mechanismus.

Beide Copilot-Modi verwenden einen gemeinsamen Settings-Owner für Lesen, reine Planung, atomisches
Schreiben und Postcondition-Verifikation. Der persönliche Modus schreibt nur, wenn Git bereits
belegt, dass `.github/copilot/settings.local.json` ignoriert wird. AGDF verändert weder eine geteilte
`.gitignore` noch `.git/info/exclude` automatisch. Ist der Schutz nicht belegt, stoppt der Vorgang vor
jeder Mutation mit dem exakten Pfad und der Aufforderung, ihn bewusst zu ignorieren oder `--shared`
zu wählen.

## 2. Ownership And Source Of Truth

| Concern | Authoritative owner | Design consequence |
|---|---|---|
| CLI parsing and compatibility | `create-agdf/lib/cli/parse-args.js` and command option validation | `shared` is one boolean option with a fail-closed compatibility matrix. |
| Lifecycle routing and reporting | `create-agdf/lib/cli/application.js`; `create-agdf/lib/lifecycle/operations.js`; `create-agdf/lib/lifecycle/result.js` | Existing plan, apply, verify and one-next-action flow remains authoritative. |
| Copilot settings safety | `create-agdf/lib/installers/copilot-settings.js` | One reusable owner handles user, personal-local and shared paths without a second parser or writer. |
| Copilot plugin identity | `pluginDefinition` plus canonical selector `agdf@agdf` | Only the exact map key may change. No fuzzy matching or deletion is allowed. |
| Personal commit protection | Git ignore resolution for the target repository | A successful `git check-ignore` preflight is required. Git metadata is evidence, not an AGDF-owned mutation target. |
| Host effectiveness | GitHub Copilot effective configuration and fresh restarted session | Repository files prove configuration only. They do not prove a managed override or live-host deactivation. |
| Instructions | Host-native instruction discovery | `AGENTS.md`, `.github/copilot-instructions.md` and related files remain independent and untouched. |
| Public guidance | `INSTALL.md`, root `README.md`, `create-agdf/README.md` and CLI help | One four-surface matrix and matching examples must remain synchronized. |
| Context Graph | `CG-CREATE-AGDF-CLI-COMPOSITION` | Existing composition and focused adapter boundaries are extended, not duplicated. |

## 3. Architecture Decisions

### SD-01: Explicit shared mode

The public option is `--shared`. Parsing records `shared: false` by default. Command validation accepts
`shared: true` only for the exact Copilot repository-disable tuple. It rejects the flag for Codex,
Claude Code, OpenCode, global scope and every other command before filesystem inspection.

### SD-02: Deterministic target paths

The Copilot settings owner exposes repository path resolution with exactly two outcomes:

- personal: `<repository>/.github/copilot/settings.local.json`
- shared: `<repository>/.github/copilot/settings.json`

The resolved path must remain under the resolved repository root. An existing target must be a regular
file and must not be a symbolic link. Existing parent path components are checked for symbolic links.
Missing directories may be created only during apply after every preflight succeeds.

### SD-03: Strict JSON round-trip boundary

The existing strict JSON reader is generalized to an explicit path and reused. Missing files start as
an empty object. Existing files must parse as a JSON object. `enabledPlugins`, when present, must be a
JSON object. JSONC, comments, arrays, scalars and invalid JSON are rejected without mutation because
the current owner cannot preserve them losslessly. The error names the file and explains that it must
be converted or edited manually. No comment stripping or lossy reserialization is introduced.

### SD-04: Exact merge and idempotency

Planning clones the validated object and changes only `enabledPlugins["agdf@agdf"]` to `false`.
Every unrelated top-level key and every other plugin key is retained semantically. If the exact value
is already `false`, the plan is an idempotent no-op and reports the observed path. A non-boolean value
for the exact key is ambiguous and fails closed instead of being overwritten.

### SD-05: Personal Git-ignore precondition

Before a personal plan is returned, Git must confirm the exact repository-relative target is ignored.
The check runs in the explicit target directory and does not depend on the process working directory.
No repository settings file or ignore file is written when Git is unavailable, the directory is not a
Git worktree, or the target is not ignored. The recovery message instructs the user to add the exact
path to an appropriate ignore source and retry. This prevents a hidden shared mutation while making
the non-commit guarantee observable.

### SD-06: Atomic apply through one settings owner

The Copilot settings owner separates a pure `plan` result from `apply`. Apply uses the existing
same-directory temporary-file and rename strategy, preserves an existing file mode, defaults a new
personal file to mode `0600`, removes temporary artifacts on failure and verifies the exact persisted
value by reading it again. Lifecycle operations delegate Copilot settings mutations to this owner.
Generic direct `writeFileSync` is not used for Copilot settings.

Because a successful Copilot plan contains at most one settings mutation and the ignore state is a
read-only precondition, there is no cross-file partial state. A failed atomic rename leaves the prior
file intact. Postcondition failure returns `failed` and never reports effective deactivation.

### SD-07: Evidence-bounded verification and reporting

`verifyRepositoryDisabled` becomes surface-aware and receives the selected Copilot mode. It verifies
the exact path and exact boolean value. This yields configuration status only. The lifecycle result
reports activation as `pending_restart`, retains global AGDF availability and `.agdf/control`, and has
exactly one next action: restart Copilot, then inspect `/plugin list`; documentation separately directs
users to `/instructions` when they also need to assess independent instructions.

Managed-policy or live-host effectiveness is never inferred from the written file. If direct host
evidence is unavailable, the report says so. Shared mode additionally exposes that its file is
commit-relevant and can affect collaborators or supported cloud agents.

### SD-08: Honest cross-surface matrix

The support matrix has distinct columns for status, personal repository opt-out, shared repository
opt-out, repository activation and global uninstall:

| Surface | Personal repository opt-out | Shared repository opt-out | Repository activation | Global uninstall |
|---|---|---|---|---|
| Codex | existing repository disable | existing repository configuration semantics only, no new `--shared` mode | existing generated repository plugin path | supported |
| Claude Code | not supported without verified host mechanism | not supported | no new mechanism | supported |
| GitHub Copilot | `settings.local.json`, default and ignored | `settings.json`, explicit `--shared` | host plugin discovery remains separate | supported |
| OpenCode | not supported as disable | not supported | existing repository activation marker | supported |

Unsupported combinations retain all files and provide one supported alternative. No row equates
plugin disablement with instruction disablement.

## 4. Integration Points

- `parseArgs` adds `shared` and returns it in command options.
- Command validation owns the exact allowed tuple and help text owns the public examples.
- `runDisable` passes `{ shared }` into planning and verification and maps configuration evidence to
  `pending_restart`, not `active`.
- `planRepositoryDisable` keeps Codex behavior unchanged and delegates Copilot planning to the
  settings owner. Claude Code and OpenCode continue to fail without mutation.
- `applyLifecyclePlan` recognizes the focused Copilot settings mutation and invokes its atomic owner.
- `verifyRepositoryDisabled` dispatches by surface and chosen mode rather than assuming Codex.
- Lifecycle `changes`, `retained`, `failure` and `next_action` fields expose path, audience and
  evidence boundary without changing schema version 1.
- Documentation and CLI help use the same option name, path names and support classifications.

## 5. Constraints And Compatibility

- Existing Codex disable behavior, selector resolution and ambiguous-state rejection are unchanged.
- Existing global uninstall flows and their confirmation requirement remain unchanged for all four
  surfaces.
- Existing user-level Copilot installation settings continue through the same settings owner.
- The solution may normalize whitespace and key indentation in valid JSON, but it must preserve all
  values outside the exact AGDF key. This is semantic retention, not byte retention.
- Personal settings are never created until Git proves the path ignored. Shared settings are never
  touched without `--shared`.
- No settings path, parent symlink or malformed schema is repaired automatically.
- No instruction file, `.agdf/control`, global plugin state or managed policy is changed.
- Deterministic fixtures prove repository behavior only. Fresh-session behavior remains UAT evidence.
- The implementation must remain compatible with native Windows path and atomic rename behavior
  already owned by the settings writer. Git preflight commands must use argument arrays, not a shell.

## 6. Test And Evidence Strategy

TP must map at least the following evidence groups to executable tests:

1. CLI parsing and validation: default personal mode, explicit `--shared`, help output and rejection of
   every incompatible command, scope or surface combination.
2. Personal mode: missing-file creation only when ignored, exact path selection, merge, idempotency,
   foreign-key retention, file mode and postcondition verification.
3. Shared mode: explicit path selection, creation, merge, idempotency, foreign-key retention and
   commit-relevance in the report.
4. Negative settings fixtures: invalid JSON, JSONC/comments, non-object root, non-object
   `enabledPlugins`, non-boolean exact entry, file symlink and parent symlink. Each must prove zero
   target mutation.
5. Ignore boundary: ignored path passes; unignored path, unavailable Git and non-worktree fail before
   mutation; neither `.gitignore` nor `.git/info/exclude` is changed.
6. Atomicity: injected temporary-write, rename and verification failures preserve the prior settings
   file and remove temporary artifacts.
7. Lifecycle output: personal/shared audience, changes, retained data, `pending_restart`, one next
   action and no claim of managed-policy or live-host effectiveness.
8. Regression: current Codex repository-disable tests, all global uninstall tests, Claude/OpenCode
   unsupported paths, user-level Copilot install/update/status and aggregate package smoke remain green.
9. Documentation: all four surfaces, both Copilot commands, both paths, ignore precondition,
   instruction independence and `/plugin list` versus `/instructions` are asserted.
10. UAT: after deterministic QA, use a fresh Copilot session to observe plugin state and instruction
    discovery separately. Record managed-policy limits rather than inferring them.

## 7. Risks And Open Questions

| Risk | Disposition before TP |
|---|---|
| A personal command fails in repositories that do not yet ignore the local file. | Accepted fail-closed behavior. Documentation gives the exact prerequisite and shared alternative. |
| Git ignore rules can come from several sources. | Use Git's effective decision as evidence; do not infer from `.gitignore` text alone. |
| JSONC is host-valid but not losslessly writable by the existing owner. | Reject with recovery guidance. JSONC preservation is outside this run. |
| A managed policy can override repository settings. | Keep activation pending and require separate host evidence. |
| Generic lifecycle writes are not atomic. | Copilot mutations must use the dedicated atomic settings mutation; broader lifecycle transaction refactoring is outside scope. |
| Shared configuration can affect more consumers than the local CLI. | Require `--shared` and surface this impact in preview/result documentation. |

No unresolved product or architecture decision blocks task planning. TP must turn these decisions into
bounded implementation tasks and acceptance-test mappings without widening the approved scope.

## 8. Next Step

SD revision 1 was approved with exact approval after same-run, same-gate and revision revalidation.
The next artefact is Task and Test Plan revision 1.

Review the Task and Test Plan and approve only with `Approval: TP`.
