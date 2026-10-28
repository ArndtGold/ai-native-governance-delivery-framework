# Code Review Verification: Reruns On The Corrected Tree

- run_id: `agdf-companion-chat-run-navigation-20261028-01`
- date: 2026-10-28
- tree: corrections CR-F01 to CR-F10 applied to `assignment.mjs`, `view.mjs`, `register.mjs`, the companion suites and `INSTALL.md`

| Check | Result |
|---|---|
| `npm run test:claude-companion` | Logic, adapter and integrity tests passed. |
| Mutation checks (`nav-mutations.mjs`) | 12 of 12 caught. Each mutation fails a logic or adapter assertion. The file was restored byte-identically after each mutation. The mutations cover turn start keeps browsing (SCN-007), status line follows the browsed run (SCN-011), no whole-token check (SCN-001), turn overlay hides waiting (SCN-012) and return control while the chat run is shown (SCN-009). They also cover CR-F01, CR-F02, CR-F03, CR-F06, CR-F05, CR-F07 and CR-F08. |
| `npm run build:prepare` | passed (`[verify-ci] prepare passed`) |
| `npm run compatibility:record` / `npm run compatibility:check` | Pass: 56 evaluated, 0 failed. Source fingerprint `250e20409643a5f2b4d288cdccf268872c168a870bf5d9c13665db662af2ae98`. One unreferenced observation file from an earlier record on this branch was removed, and the check still passes. |
| `claude plugin validate packages/cli/generated/plugins/agdf` | passed |
| `claude plugin test` (scratch copy, generated test, Claude Code 2.1.308) | 6 of 6 passed, including "a run named in the chat is followed, browsing returns with the next main-loop turn" |
| Installation of the corrected build (`probe-results/f9j`, through `explorer.exe` outside the desktop app package) | exit 0, `result: success`. All 13 installed companion files are byte-identical to the generated ones, and `plugin:agdf:agdf` is connected. |
