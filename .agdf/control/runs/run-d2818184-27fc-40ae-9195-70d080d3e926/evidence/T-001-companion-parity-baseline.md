# T-001 companion regression cases on unchanged code

- base commit: 53e8e900ac71989fd750afdb021771ca69bee59e (branch feat/companion-core-run-view, sources unchanged)
- command: node --test packages/cli/scripts/claude-companion-parity-test.js
- expected: all cases fail for the intended reason (divergence), pass after T-004/T-006
- recorded: 2026-11-05T11:30:10Z

```text
not ok 1 - F01 open UR without artefact: the companion shows the status card missing approval and next step
  error: |-
    + actual - expected
    +   next: 'Fill the current UR control state, persist the UR draft, and request exact approval: Approval: UR.'
    -   next: 'formulate and persist UR'
not ok 2 - F08 legacy v2 only: the unreadable reason is the MCP reason code
  error: |-
    + actual - expected
    +   'format'
    -   'run_version_unsupported'
not ok 3 - F08 legacy v2 only: the companion names the count instead of "no open runs"
  error: 'a legacy-only store is not reported as having no open runs'
# pass 0
# fail 3
```
