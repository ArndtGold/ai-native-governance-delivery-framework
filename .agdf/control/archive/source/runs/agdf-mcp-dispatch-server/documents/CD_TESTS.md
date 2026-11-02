# CD+Tests: Cross-Host AGDF Dispatch Through MCP

Status: done against approved TP Revision 2; direct host, controlled protocol and final OR presentation lanes pass
Date: 2026-09-06
Run: agdf-mcp-dispatch-server
Approved TP: Revision 2; exact approval bound to run revision `700BEC82-EA10-46BA-9F0C-DFADA23CC5E7`

Current boundary: the task and acceptance classifications below use approved TP Revision 2. Direct
host qualification uses only directly observable host behavior. Controlled clients independently
prove both required protocol generations against the same production server definition. Host
protocol telemetry is optional and is not inferred.
Implementation environment: macOS x64, Node.js 22.22.3

## Delivered implementation

- `create-agdf/lib/skill-dispatch/contract.js` is the canonical owner of the name, semantic
  description, input schema, output schema and MCP safety annotations for `agdf_dispatch`.
- `create-agdf/lib/mcp-dispatch-runtime.js` exposes one narrow version-matched runtime boundary.
- `agdf-mcp-server/` is a separate Node.js 20 package using exact
  `@modelcontextprotocol/server@2.0.0` and development-only client 2.0.0.
- One SDK v2 STDIO server definition negotiates MCP 2026-07-28 and 2025-11-25 and exposes exactly
  one tool.
- A single-active worker owner provides timeout, cancellation and shutdown behavior.
- The reachable application graph is read-only and offline. Control reads reject symlinks and
  special files, and repository discovery validates a structural Git worktree marker without a
  subprocess.
- `create-agdf` owns `mcp status|enable|disable` and exact package preparation for Codex, Claude
  Code and OpenCode. Project scope is the default and user scope is explicit.
- Runtime installation, reference changes, host registration, update and retirement are
  transactional. Foreign and ambiguous host configuration is preserved and rejected.
- Package provenance covers the server, dispatcher, SDK server, SDK core and Zod closure. The MCP
  client and SDK v1 are excluded from the production runtime.
- Release validation and publication order are `create-agdf`, `@agdf/mcp-server`, `@agdf/cli`,
  then the plugin release. The public Skills-only candidate rejects MCP content.
- The canonical locale registry covers the complete German OR delivery-closeout policy vocabulary,
  so the first post-UAT status projection remains available without mixed-language fallback.

## Task evidence

| task_id | status | evidence |
|---|---|---|
| MCP-TP-01 | done | Approved TP revalidated and `BROWNFIELD_ANALYSIS.md` records a passing pre-implementation analysis. |
| MCP-TP-02 | done | Contract, safety, provenance, package and lifecycle negatives cover extra fields, invalid targets, tampering, Node mismatch, foreign configuration, rollback and forbidden capabilities. Historical failing runs are retained below. |
| MCP-TP-03 | done | Canonical definition owns exact name, description, schemas and annotations; function-contract tests pass. |
| MCP-TP-04 | done | Shared target, control and presentation owners are reused through a narrow read-only runtime export; CLI behavior remains on its existing injected Git observation. |
| MCP-TP-05 | done | Separate package, manifest, lockfile, NOTICE, exact v2 server dependency and development-only client validate. |
| MCP-TP-06 | done | Node preflight, single server factory, exact tool discovery and both protocol generations pass. |
| MCP-TP-07 | done | Trusted package context, closed process arguments, semantic invalid-input preservation across the real worker, lossless text/structured output and sanitized recovery pass. |
| MCP-TP-08 | done | Single active worker, busy response, 10-second timeout owner, pre-cancellation, active cancellation and clean close/signal tests pass. |
| MCP-TP-09 | done | Static reachable-graph checks, control-boundary symlink negative, fake-repository negative, result limit and state snapshots pass. |
| MCP-TP-10 | done | Exact package staging, manifest and digest verification, atomic placement, exact Node executable and rollback tests pass. |
| MCP-TP-11 | done | CLI lifecycle command, project/user scope, read-only status, Node 18 manual path and non-authorizing envelopes pass. |
| MCP-TP-12 | done | Codex structural merge, ownership marker, preservation, update, rollback, disable, absent-directory restoration and ambiguous TOML negatives pass. |
| MCP-TP-13 | done | Claude native local/user add, get and remove shapes, collision behavior, update rollback and unavailable-host behavior pass in fixtures; actual CLI add/get/remove also passed in an isolated temporary Claude configuration. |
| MCP-TP-14 | done | OpenCode 1.x flat and 2.x nested configurations, permissions, foreign collision, update across config variants and disable pass. An AGDF-created config is removed after OpenCode adds `$schema`, while a pre-existing empty config is preserved. |
| MCP-TP-15 | done | Version coherence covers 39 surfaces, package inventory passes with 456 files, publication order is guarded and the 46-file public candidate rejects MCP content. |
| MCP-TP-16 | done | Root, install, package and release documentation plus capability metadata describe lifecycle, authority, permissions, support evidence and fallback boundaries. Context Graph reconciliation is recorded separately. |
| MCP-TP-17 | done | Focused, package, integration, performance and full regression suites pass on the final implementation snapshot. |
| MCP-TP-18 | done | Authorized OpenCode 1.18.3 and Codex CLI 0.145.0 with `gpt-5.6-sol` completed project registration, fresh discovery, valid call, controlled failure, terminal transfer, bounded continuation and exact removal on macOS x64. Controlled clients separately negotiate both required protocol generations against the production definition. OpenCode 2.x, Linux and Windows remain separate unverified lanes. |

## Acceptance-test evidence

| test_id | result | evidence boundary |
|---|---|---|
| MCP-C01 | pass | Legacy and modern MCP clients list exactly `agdf_dispatch`. |
| MCP-C02 | pass | Both protocol generations expose the same canonical input/output schemas and annotations. |
| MCP-C03 | pass | Resolved gate fixture returns the canonical target, control and presentation envelope with `authorizes: false`. |
| MCP-C04 | pass | Missing, ambiguous, mismatched and fake-repository target evidence stop before control evaluation. |
| MCP-C05 | pass | Judgement skills return one target/run/control-bound continuation. |
| MCP-C06 | pass | Malformed input, semantic `invalid_input`, unknown tool, version/provenance skew, renderer failure, timeout, close and secret-bearing failures remain distinct and sanitized. A real worker regression prevents semantic input errors from collapsing into `dispatch_worker_failed`. |
| MCP-C07 | pass | Static and runtime sentinels show no reachable write, subprocess or network operation; control snapshots remain unchanged. |
| MCP-C08 | pass | Existing exact same-run/gate/revision approval behavior is unchanged and MCP results cannot write approval. |
| MCP-C09 | pass | Final `create-agdf` smoke in clean Git-backed snapshot `/tmp/agdf-mcp-uat-closeout.jHCooB`, CLI smoke, gate/doctor, generation, German OR presentation and runtime-integrity suites pass. |
| MCP-C10 | pass | Lifecycle fixtures cover absent, matched, foreign, malformed, failed, rollback, update and disable paths for each adapter. |
| MCP-C11 | pass | OpenCode 1.18.3 and Codex CLI 0.145.0 directly pass project registration, fresh discovery, valid call, controlled failure and removal. Claude Code 2.1.193 remains a separate incomplete lane. |
| MCP-C12 | pass | Disabled, unsupported and Node 18 states name the existing version-matched CLI path without executing it. |
| MCP-C13 | pass | Final raw performance, timeout, cancellation, output limit and shutdown evidence is recorded below. |
| MCP-C14 | pass | The final support matrix claims only the executed native macOS x64 lane. Linux and Windows remain explicitly unverified and do not inherit fixture evidence. |
| MCP-C15 | pass | Public candidate has 46 inventoried files and rejects MCP metadata, runtime and command content. |
| MCP-C16 | pass | Owned update and disable use rollback-capable reference and retirement transactions; foreign and referenced runtimes survive. |
| MCP-C17 | pass | Production uses server/core 2.0.0 plus Zod; client is development-only; SDK v1 is absent from the owned runtime. |
| MCP-C18 | pass | Node 22 positive tests, real Node 18.20.8 early-preflight failure and non-mutating Node 18 lifecycle result pass; both protocol generations negotiate. |
| MCP-C19 | pass | Server, dispatcher, SDK and marker tampering fail closed; package staging and update order are tested. |
| MCP-C20 | pass | Project/user paths and unrelated Codex/OpenCode configuration and permissions are preserved. Direct removal restores originally absent OpenCode configuration and Codex `.codex` directory state. |
| MCP-C21 | pass | OpenCode plus Codex complete the directly observable functional matrix, linked to the independently passing dual-protocol lane. Capability metadata remains generically `unverified`; only the recorded exact host tuples and macOS x64 observations are qualified. |
| MCP-C22 | pass | Missing context, unsupported host and server failure paths stay non-authorizing and name one explicit recovery or fallback. |

## Final commands

| command | result |
|---|---|
| `npm --prefix create-agdf run smoke-test` | pass in a Git-backed `/tmp` copy of the exact TP2 working tree; complete aggregate suite, including 83/83 deterministic skill-eval cases |
| `npm --prefix agdf-mcp-server test` | pass; contract, protocol, safety, provenance, performance and package tests |
| `npm --prefix create-agdf run test:skill-dispatch` | pass after retaining semantic input validation inside the canonical dispatcher service |
| `npm --prefix create-agdf run test:mcp-lifecycle` | pass after Codex TOML collision hardening and exact Codex/OpenCode absent-config restoration |
| `npm --prefix agdf run smoke-test` | pass |
| `node create-agdf/bin/create-agdf.js mcp status --surface codex --dir <repository> --json` | `not_configured`, `changes: []`, `authorizes: false` |
| `npx -p node@18 node agdf-mcp-server/bin/agdf-mcp.js --surface codex` | expected exit 1 with only `AGDF_MCP_NODE_UNSUPPORTED`, Node 18.20.8 |

## Final TP Revision 2 validation

- The focused interaction-presentation, skill-dispatch, control-state and Copilot-profile suites pass
  with the PRD-gate localization and ordered terminal presentation correction.
- The current source dispatcher returns the German PRD approval sequence with non-empty
  `host_action.text`, exact `Approval: PRD`, `authorizes: false` and no presentation diagnostic.
- The complete `create-agdf` smoke suite passes in `/tmp/agdf-mcp-tp2-review`, a Git-backed copy
  containing the exact current working tree and repository tags. It includes both MCP protocol
  generations, all package and lifecycle suites and 83/83 deterministic skill evaluations.
- The first exact TP2 aggregate run correctly found one stale hard-coded lowercase no-action phrase
  in `control-state-test.js`. The test now consumes the canonical locale value. Focused control-state
  and interaction tests pass, and the complete exact-snapshot aggregate rerun passes.
- Two aggregate attempts in the source checkout encountered a generated-only filesystem collision:
  a transient `runtime/create-agdf 2` directory appeared while the ignored runtime projection was
  regenerated under `Documents`. The generator contains no such naming path. Canonical regeneration
  restored the exact projection, and the unchanged focused 5-second binding contract passes in the
  source checkout. This is environment evidence, not a product or host-support result.
- `npm --prefix agdf run smoke-test` passes in the source checkout. Final lifecycle status is
  `not_configured` for Codex, Claude Code and OpenCode; `opencode.json` and `.codex` are absent.
| `npx -p node@18 node create-agdf/bin/create-agdf.js mcp status --surface codex --dir <repository> --json` | expected exit 1 with `manual_compatible`, `changes: []`, `authorizes: false` |
| `git diff --check` | pass after final governance reconciliation |

## Performance evidence

Final TP Revision 2 aggregate run on Node.js 22.22.3, macOS x64, 20 samples per measure:

- cold `tools/list` milliseconds: `653.281, 596.882, 638.515, 604.251, 616.536, 604.183,
  623.981, 791.930, 718.580, 600.632, 584.394, 594.261, 597.454, 592.180, 599.328,
  875.214, 603.789, 589.151, 603.125, 632.483`
- cold p95: `791.930 ms`, budget `1500 ms`
- warm resolved dispatch milliseconds: `372.860, 274.109, 286.048, 297.266, 298.252,
  287.217, 290.642, 289.106, 288.169, 292.190, 292.467, 280.259, 284.565,
  286.340, 317.902, 293.134, 296.514, 312.983, 324.108, 296.132`
- warm p95: `324.108 ms`, budget `1000 ms`
- active workers: one per connection
- hard timeout: 10 seconds in production, shortened deterministic timeout exercised in tests
- serialized output: bounded by the canonical one MiB serializer

Earlier green runs measured cold/warm p95 `1160.881/834.693 ms`, `691.284/313.406 ms` and
`900.634/368.655 ms` during full suites. Separate green server runs include
`714.693/281.002 ms` after the Codex cleanup correction.

## Direct host and native evidence

- Copilot Skills-only negative observation: installed AGDF 0.14.5 successfully injected a valid
  schema-2 dispatcher binding into session `7db6a259-5817-4451-b2cd-bbf7aab202b8`, but the selected
  `mai-code-1.1-flash` model made 17 non-dispatch tool calls, including broad searches under
  `/Users`, and made zero dispatcher calls. This is direct instruction-conformance evidence, not MCP
  evidence or a Copilot support result. See `COPILOT_HOST_OBSERVATION.md`.
- OpenCode 1.18.3 on macOS x64 directly completes the functional local-development matrix. Fresh
  sessions discovered `agdf_agdf_dispatch`, returned a valid terminal control result, localized a
  semantic invalid-input result, transferred terminal text exactly, preserved a bounded QA
  continuation and used no other tools. Direct enable/discovery/disable restored the originally
  absent `opencode.json` and removed the runtime. See `DIRECT_HOST_EVIDENCE.md`.
- Codex CLI 0.145.0 with `gpt-5.6-sol` on macOS x64 directly completed the same functional matrix.
  Three fresh ephemeral read-only processes each made exactly one `agdf/agdf_dispatch` call and no
  other tool calls. Terminal text and localized recovery matched `host_action.text`; continuation
  preserved the exact skill, target, run and gate. The final disable retry removed registration,
  runtime and the AGDF-created `.codex` directory. See `DIRECT_HOST_EVIDENCE.md`.
- Claude Code 2.1.193 passed real project registration and `mcp get` connection. A fresh model
  process loaded the project and listed the server, then stopped with `authentication_failed`
  because the CLI was not logged in. The registration and runtime were removed. Claude remains
  unverified for calls and model behavior.
- macOS x64 is the only native execution environment used. Linux and Windows remain fixture or CI
  targets without current native evidence.
- All authorized real host settings were changed temporarily and restored to their exact relevant
  pre-test state. Retained evidence contains no credentials.

## Failures found and corrected

1. The first performance implementation exceeded cold p95 `1597.886 ms`. The control boundary was
   changed from per-entry `realpath` calls to equivalent `Dirent` symlink/type checks. Later loaded
   desktop runs also exposed cold p95 `1592.762` and `1909.362 ms` and warm p95 `1961.337 ms`;
   raw samples were made unconditional. Repeated final runs pass without changing either budget.
2. Full smoke intermittently lost the SessionStart dispatcher binding because the exact Node
   runtime probe allowed only one second during process scheduling delay. The bounded timeout is now
   five seconds; focused and repeated aggregate SessionStart tests pass.
3. Copilot payload growth guards correctly stopped after reviewed shared runtime changes. The limit
   was updated to the measured 95 files and 709141 bytes with a specific rationale; MCP packages and
   lifecycle files remain excluded.
4. Local development package tests inherited a root-owned user npm cache. The package owner now
   uses and removes an isolated cache beneath its own staging root; focused and full tests pass.
5. Code review found that quoted, array, parent-table and inline Codex TOML forms could evade the
   exact AGDF section detector. These forms now fail closed without changing the file, and all new
   negatives pass.
6. Initial release workflow ordering attempted aggregate MCP tests before installing the local
   server dependency. Dependency preparation now precedes aggregate smoke.
7. The first real OpenCode call exposed unregistered free-form English status fields. The current
   run now uses locale-registry semantic values, and the prescribed single retry returned the German
   status presentation.
8. Semantic input validation ran in the worker parser before the dispatcher service, collapsing an
   expected unknown-skill result into generic `dispatch_worker_failed`. Wire parsing now leaves
   semantic validation to the canonical service; real worker and OpenCode failures return localized
   `invalid_input`.
9. OpenCode inserted `$schema` into a file created by AGDF, and disable left the generated shell
   behind. The owned entry now records file origin. Focused tests and a direct host retry prove exact
   absent-file restoration without deleting pre-existing empty configuration.
10. Codex disablement removed the owned entry and runtime but initially left an empty AGDF-created
    `.codex/config.toml` and directory. The owned marker now records both origins. Focused tests and a
    direct retry prove exact absent-directory restoration while preserving pre-existing directories.
11. Resetting the run to PRD exposed two presentation defects in the current source dispatcher.
    Common PRD actions were missing from the canonical locale registry, and ordered approval blocks
    did not populate terminal `host_action.text`. The shared locale owner now covers the PRD policy
    vocabulary, and the existing dispatcher serializes its ordered presentation sequence. Focused
    presentation, dispatch, control-state and Copilot projection tests pass. Mandatory reviews must
    cover this post-TP-Review correction after the revised TP is approved.
12. Accepting PRD Revision 4 advanced the current run to SD and exposed the same missing locale
    coverage for the standard SD actions and post-approval transition. The canonical locale owner
    now covers that vocabulary in English and German, with one focused regression. The source
    dispatcher returns the complete German SD approval sequence with non-empty `host_action.text`
    and no presentation diagnostic.
13. Accepting SD Revision 3 advanced the current run to TP and exposed the same missing locale
    coverage for the standard TP actions and post-approval transition. The canonical locale owner
    now covers that vocabulary in English and German, with one focused regression. The synchronized
    payload contains 95 files and 715526 bytes. Interaction presentation, 40 dispatcher adapter
    cases, control state and Copilot profile tests pass. The source dispatcher returns the complete
    German TP approval sequence with non-empty `host_action.text` and no presentation diagnostic.
14. Accepting TP Revision 2 exposed missing locale coverage for the standard Brownfield Analysis,
    CD+Tests, Code Review and QA transition values. The canonical locale owner now covers the full
    post-TP path in English and German. The reviewed Copilot payload remains at 95 files and grows
    to 719956 bytes. The full rerun also replaced a duplicate lowercase no-action test literal with
    the canonical locale value. Focused and complete exact-snapshot validation pass.
15. Accepting UAT Revision 1 advanced the run to OR and exposed the remaining unregistered
    delivery-closeout policy values as `allowed_now_unlocalized`, `forbidden_now_unlocalized` and
    `next_step_unlocalized`. Four paired English/German values now live in the canonical locale
    owner, and a focused OR regression fails on any mixed English output. The reviewed Copilot
    payload remains at 95 files and grows to 721740 bytes. The source gate-check returns a complete
    German OR status with no presentation diagnostics, and the full clean-snapshot smoke passes.

## Implementation deviations

- The approved SD and TP name the OpenCode 1.x flat `mcp.agdf` form. Current official OpenCode v2
  documentation uses `mcp.servers.agdf`. The adapter therefore probes the installed major version,
  retains the approved flat form for 1.x and uses the nested form for 2.x. This adds no authority or
  new transport, but it is an explicit implementation-time compatibility adaptation. Both forms are
  tested; direct OpenCode 2.x host evidence remains absent.
- The read-only MCP path cannot use the CLI's Git subprocess observation. A narrow structural
  worktree reader validates `.git/HEAD` or a worktree `gitdir` pointer instead. The CLI keeps its
  existing Git owner, and fake or symlinked markers fail closed.

## Open evidence obligations

- Approved PRD Revision 4, SD Revision 3 and TP Revision 2 separate the complete direct host and
  controlled protocol lanes. The completed reviews and QA consume that contract without inferring
  unavailable host protocol telemetry.
- Keep generic host and cross-host support metadata `unverified` or false; the current evidence
  qualifies only the bounded OpenCode and Codex observations recorded for macOS x64.
- Keep OpenCode 2.x, Linux and Windows support claims absent until their direct lanes exist.
