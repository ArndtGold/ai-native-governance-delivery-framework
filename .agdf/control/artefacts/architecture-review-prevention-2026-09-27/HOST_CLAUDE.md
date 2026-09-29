# Claude host observation

Date: 2026-09-28
Status: `unobserved` for fresh-session behavior
Host: Claude Code CLI `2.1.193`
Installed AGDF: `0.14.5`; `claude plugin list` reports `agdf@agdf` enabled at user scope.
Installer: local `install:claude -- --plugin-only` completed and requested a restart.

Prompt attempted in a fresh print-mode session: read the installed Brownfield skill and report
owner-boundary relevance, evidence-backed not-applicable, and retained-debt fields without mutation.
Session: `d03df3ed-14ce-4d2c-b2c6-ebdab647976c`.

Observed result: `Not logged in · Please run /login`; zero model tokens and no skill read. No
relevant or low-impact Brownfield result, run artefact, or direct host acceptance exists.
Required next step: authenticate Claude Code, restart, and execute both cases in a fresh session.
