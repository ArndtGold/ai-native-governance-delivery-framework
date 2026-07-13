# PRD: OpenCode Registry Installation and Runtime Integrity

Status: approved
Gate: PRD
Gate approval: approved on 2026-07-13
Based on: `.agdf/control/artefacts/opencode-registry-install/UR.md`, `.agdf/control/artefacts/opencode-registry-install/BROWNFIELD_REVIEW.md`
Date: 2026-07-13
Owner: AGDF installer and control-state maintainers

## 1. Product Scope

Deliver one coherent correction across the existing OpenCode installer and shared AGDF control-state runtime:

1. Install the published `create-agdf` package at the exact canonical version from the npm registry. Existing global OpenCode installations using an npx-cache `file:` dependency must migrate on rerun without losing unrelated dependencies or user-owned configuration.
2. Make the shared run-state parser retain internal artefact rows for `Brownfield Review`, `Brownfield Analysis`, `CD+Tests` and `CR`.
3. Make the shared transition function expose the canonical late-gate sequence deterministically: `Brownfield Analysis -> CD+Tests -> CR -> QA -> UAT -> OR`, including the pre-QA `Approval: QA` requirement and the correct allowed/forbidden actions.
4. Align the parser with the canonical `Mode/Slice Decision` heading while preserving a deliberate compatibility policy for older legacy headings if required by evidence.
5. Normalize the QA approval vocabulary at the parser boundary so the documented `pass`/`passed` forms produce the canonical approved state where the control contract requires it.
6. Remove or explicitly justify the unused `firstUnapprovedGate` helper.
7. Protect generated/global OpenCode guidance against namespace regression; the current global file already uses `agdf-global-*` and must remain so after installation/update.

## 2. Acceptance Criteria

- A clean `opencode` install writes an exact registry dependency such as `create-agdf: 0.6.9`; neither `package.json` nor `package-lock.json` contains an npx-cache or workspace `file:` dependency for `create-agdf`.
- Rerunning against the observed `file:` installation migrates only the AGDF package dependency and associated lock entry; unrelated dependencies, config, instructions, permissions and ownership protections remain intact.
- The installed package resolves from the configured OpenCode `node_modules/create-agdf` path after the original npx cache/source path is unavailable.
- Existing version/status output continues to report installed and expected versions correctly, and global native skills remain complete.
- Parser fixtures retain artefact rows for all four internal steps.
- A canonical `## Mode/Slice Decision` section is parsed with its decision, required next gate, scope reason and evidence; any legacy alias behavior is explicit and tested.
- Transition fixtures reach `Brownfield Analysis`, `CD+Tests`, `CR`, pre-QA `QA`, post-QA `UAT` and `OR` with the correct status, missing approval, allowed actions and forbidden actions.
- QA `pass` and `passed` normalize consistently at the parser boundary without changing the distinction between QA approval and QA report artefact status.
- No unused transition helper remains without an explicit call site, owner or test purpose.
- Generated and installed OpenCode guidance consistently routes global skills through `agdf-global-*`; the installer or integrity test detects stale namespace output.
- Existing installer preservation, OpenCode status/version, package loadability, control-state, smoke, runtime-integrity, release-readiness and doctor checks remain green.

## 3. Non-Goals

- No new command, required parameter, skill name or OpenCode repository activation model.
- No second OpenCode-specific gate model, parser or transition owner.
- No change to `.agdf/control/` as the repository authority or to Codex/Claude behavior except where they consume the shared corrected runtime.
- No production fallback to a local path, npx cache, workspace package or silent alternative registry.
- No broad rewrite of the control-state subsystem, no data migration outside the configured OpenCode package directory, and no unrelated Windows or package-manager refactor.
- No commit, push, pull request or release.

## 4. Users And Roles

- AGDF users installing OpenCode globally need a portable, cache-independent plugin.
- Agents and CLI consumers need deterministic late-gate status and next-step decisions.
- Installer maintainers own `create-agdf/bin/create-agdf.js` and the OpenCode surface.
- Control-state maintainers own `create-agdf/lib/control-state/run-state-parser.js` and the shared transition behavior.
- Release maintainers own npm publication readiness and exact-version availability.
- QA reviews the observable install, parser, transition and regression evidence; user approval remains required at the AGDF gates.

## 5. Constraints

- Canonical package name/version comes from `plugin/meta/agdf-plugin.definition.json`.
- The runtime transition order comes from `plugin/meta/agdf-runtime-contract.md`; skills and surfaces must not create a second table.
- Existing global OpenCode files must respect ownership/protection behavior.
- The public bootstrap command remains unchanged.
- Registry installation requires the exact package version to be published and visible before the installer runs.
- Compatibility aliases must be parser-boundary normalization, not competing canonical headings or status models.
- Generated assets must be synchronized through the existing package-asset generation path.

## 6. Evidence Requirements

- Focused installer fixture proving exact registry dependency, migration from `file:`, lockfile cleanup and preservation of unrelated dependencies/configuration.
- Cache/source-removal proof showing package loadability from the configured OpenCode installation only.
- Parser fixtures for internal artefacts, canonical Mode/Slice heading and QA `pass`/`passed` normalization.
- Transition fixtures for every late-gate boundary and the pre-QA missing-approval branch.
- Existing OpenCode smoke/status/version and package-loadability evidence.
- Runtime-integrity, control-state, doctor, diff and release/bootstrap readiness evidence.
- Generated/global guidance inspection proving `agdf-global-*` remains the active namespace.

## 7. Risks And Open Questions

- Should the production installer use `npm install --save-exact create-agdf@<version>` directly, or use an equivalent exact-version command that preserves npm's existing global-directory behavior? SD must choose one and test it.
- Should the parser accept both `Mode/Slice Decision` and the legacy `Mode / Slice Decision` heading? SD must define precedence and prevent ambiguous duplicate sections.
- Which exact QA statuses are canonical for approval versus artefact status? SD must preserve the existing QA report contract while making agent-produced `pass` deterministic.
- How should the smoke test simulate a published registry package without introducing a production local-path fallback? The test seam must remain isolated and visible.
- The active CLI run resolver currently reports an older completed run in this workspace; implementation artifacts for this scope must remain linked to `opencode-registry-install` and must not mutate the unrelated completed run.

## 8. Next Step

Review this PRD and approve only with:

`Approval: PRD`

## Approval

- `Approval: UR` provided on `2026-07-13` for the expanded scope.
- `Approval: PRD` provided on `2026-07-13`.
