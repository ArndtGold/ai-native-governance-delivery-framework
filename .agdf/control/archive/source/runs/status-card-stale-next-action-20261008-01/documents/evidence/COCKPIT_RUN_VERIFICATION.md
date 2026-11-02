# Cockpit Run Verification (T-010, SCN-015, SCN-016)

- run_id: status-card-stale-next-action-20261008-01
- observed run: agdf-cockpit-claude-host-20261008-01, persisted revision `36fc72e1-c95d-4b9c-ad74-c9b66206f92a` (revision 13), not edited
- date: 2026-10-08

## Repository CLI (SCN-015)

The status card (`node packages/cli/bin/create-agdf.js gate-check --dir . --run agdf-cockpit-claude-host-20261008-01 --status-card`) shows:

- current gate: `Implementierung und Tests (CD+Tests)`;
- next step: "TP freigegeben. Keine Antwort nötig. Ich setze den genehmigten Umfang um, führe die Tests aus und erfasse CD+Tests-Nachweise." This is the localized standard CD+Tests step, identical to a run whose stored text was never stale.

`skill-dispatch --skill gate-check --continue-delivery` for the same run returns outcome `skill_continuation`, phase `implementation`, gate `CD+Tests`, revision `36fc72e1-c95d-4b9c-ad74-c9b66206f92a`.

Afterwards the run's `RUN_STATE.md` still carries revision_id `36fc72e1-c95d-4b9c-ad74-c9b66206f92a`. No file of that run was written, and its approval rows are unchanged.

## Installed host (SCN-016)

Open. The host observation through the Claude MCP dispatcher requires a plugin reinstall from this repository (`npm --prefix packages/cli run install:claude`) and a Claude restart. Both need explicit user consent.
