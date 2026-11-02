# T-008 Evidence: Companion Documentation in INSTALL.md

Run: `agdf-begleiter-companion-20261025-01`
Task: T-008 (scenario SCN-023; owner review of the diff follows in CR / PR)
Recorded: 2026-10-26
Result: done, awaiting owner review of the documentation diff

## Change

`INSTALL.md`, Claude Code section: a new subsection "Optional AGDF companion panel" after the installation and first-start steps. It documents:

- What the panel shows. The panel is read-only toward `.agdf/control`, never asks for or records approvals and selects no delivery run.
- Switching on and off with `/agdf-companion`. The companion is off after installation, the choice persists, and closing with the panel mark hides it for the session only.
- What is kept and where: `companion-state.json` in the AGDF plugin data directory. Choices last for the session only when that directory is missing. Uninstall removes the directory, and the reason Claude Code's plugin store is not used.
- Which run is shown:
  1. the run changed in this session (the most recent wins; it stays shown when completed);
  2. otherwise the remembered selection;
  3. otherwise "No run assigned" with the open runs. It never guesses.
- Refresh cadence, and the marker after a transient read failure.
- Language behaviour: chat language, labels in English and German, locale-pack gate titles and next steps, the objective in the artefact language.
- Surfaces: desktop panel with figure and still pose; terminal text; other Claude Code surfaces not tested; no companion for Codex, Copilot or OpenCode.
- The early-access mod API with the observed range: Claude Code 2.1.302 (validate, installed load, isolation) and 2.1.308 (desktop prototype). Loading depends on Claude Code enabling installed-plugin hooks modules.
- Behaviour on an incompatible host: the companion is absent or neutral, and AGDF hook, MCP, `agdf_dispatch` and skills keep working, as checked with failing modules on 2.1.302.
- Known limits: concurrent sessions on one repository, legacy run states without `updated_at`, full read per refresh, the data-directory naming convention, no approvals or artefact content in the panel.
- Evidence status, separated into automated (Node tests in `verify:ci`), native (validate and the probes on 2.1.302, Windows) and live (a dated desktop check recorded separately).

## Checks

- `node scripts/community-health-test.mjs`: pass (reviewed baseline and 29 negative contracts).
- `npm run check:community-health`: pass (39 required files, 4 issue forms).
- `node packages/cli/scripts/cli-modularization-test.js`: pass. It requires INSTALL.md to keep naming Claude Code, Copilot, OpenCode, `AGENTS.md` and the Copilot disable commands.
- `npm --prefix pages run test:public-documents`: pass.
- `npm run compatibility:check`: pass, so the documentation change keeps the recorded source snapshot.
- Source-mode `check-runtime-integrity.mjs`: ok.
- The pages build rewrote `pages/.astro/content.d.ts` with a platform-dependent import path again. It was reverted.

## Open

- SCN-023 expects the owner's review of the documentation diff. It is part of CR / PR review.
- The "Live" line in the evidence status names no result yet; the dated desktop session follows in T-009. After T-009 the documentation should state its date and Claude Code version.
