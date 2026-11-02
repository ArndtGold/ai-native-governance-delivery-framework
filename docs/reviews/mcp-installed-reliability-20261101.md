# Installed MCP repair evidence — 2026-11-01

Direct repair requested by the maintainer, without an AGDF workflow, gate or new delivery Run. Closed Run records and approvals were preserved. Test Runs exist only in disposable repositories. This report is technical evidence, not QA/UAT approval or release authorization.

The installed plugin's three observed weaknesses were reproducible: the future create UUID/plan identity was hidden, a copied confirmed target hash was rejected on ordinary Inspect reads, and simultaneous Inspect calls returned `dispatch_busy`.

- The on-demand planning contract now explains reserving the create UUID before staging and using `plan-<create UUID>` across material/create. Wrong identity yields a typed, actionable `not_dispatched` rejection; it cannot consume material or write canonical state.
- A supplied Inspect target hash is optional on target-bound reads and must match the confirmed target. Exact presentation bindings remain required. A mismatched hash is rejected before control observation.
- Inspect requests use a bounded FIFO queue (eight waiting reads) behind one worker. Waiting consumes the original deadline. Commands keep contention semantics. Cancellation, close, overload and unknown termination cannot launch queued work or release unconfirmed capacity.
- The first repaired installation trial exposed a further contradictory instruction: create material must omit Planning metadata, because the writer inserts it; replacement material must retain the selected metadata. The contract now distinguishes these cases. A metadata rejection explains restaging and retains `not_dispatched` semantics. Recovery with the original create UUID is tested.

Canonical owners are the Core Inspect contract/service, Run-command contract/schema/service, the shared MCP error projector, and the MCP worker executor. No installed cache was patched. The regular local installer regenerated the Codex payload from canonical sources. Existing parity and safety fixtures were ported to the current layout; obsolete legacy migration write ownership was removed from the exact static allowlist.

## Repository checks

All listed checks passed. Limits were unchanged.

| Check | Evidence |
| --- | --- |
| Core planning, error projection and worker deadlines/cancellation/queue/termination | `agdf-mcp-fix-final-unit3.log`: 18 tests passed; shared error projector includes its classification/correction matrix |
| Actual planned material/create/replace/handoff/replay, parallel reads, metadata rejection/recovery | `agdf-mcp-fix-stdio-final.log`: both negotiated STDIO protocol eras passed |
| CLI/Inspect parity, schema budget and read-only behavior | `agdf-mcp-fix-inspect-latest.log`: passed; Inspect discovery 6065 bytes, cap 6144 |
| Safety, actual worker lock release and protected foreign content | `agdf-mcp-fix-safety-latest.log`: passed |
| Owner threads, startup and generation lifecycle | `agdf-mcp-fix-generation-final.log`: passed |
| SDK protocols, skill names, error transport and doctor observations | `agdf-mcp-fix-protocol-latest.log`: passed |
| Compiled worker and semantic/callback contracts | `agdf-mcp-fix-contract-final.log`: passed |
| Pinned SDK digest | `agdf-mcp-fix-sdk-check.log`: passed |
| Performance, 20 cold + 20 warm samples | cold p95 2338.384 ms < 2500; warm p95 933.108 ms < 1000 |

The incomplete source SDK prerequisite was preserved separately, then restored from the existing lockfile. Dependency/lockfile versions were not changed. This is a targeted affected-surface verification, not a full CI or Nightly result.

## Actual installed Codex CLI observations

Plugin `0.20.2+codex.local-8096e21ca043`; canonical version `0.20.2`; source digest `8096e21ca043cd4f50ebbca98388c75832d82e6fd717c5228fa507509e1568fb`; plugin digest `d37d6195cbc1085b88f1a54e5894f889955a4ef3803c713debacce0213a0a704`.

Actual MCP runtime digest `d88028e6333e0fff070fdb6f7ddc68169a62439f77cb73c7965112f4c8b79e3a`, observed as `local_exact_version_digest` / provenance `matched` in every final trial. Plugin payload and MCP runtime are distinct identities.

Three independent fresh sessions used the same unchanged installed candidate, Codex CLI 0.163.0, gpt-6.1-sol / low, macOS darwin-x64, normal installed plugin transport and existing ChatGPT authentication. Each used a fresh Git repository and a separate Git-rooted old-layout negative fixture. Shell, memories and multi-agent features were disabled. An actual sandbox denied writes to the owning repository and personal settings; hashes confirmed settings and old control content were unchanged. Other configured MCP servers could start, but the observed task calls used AGDF only.

| Trial | CLI thread | Seconds | MCP calls | Rejected calls corrected/abandoned | Complete document bytes | Core flow |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| 1 | `01a19872-cf35-70f0-afda-bd6dcd38d887` | 140.49 | 40 | 8 | 1541 | pass |
| 2 | `01a19876-9825-7122-96b0-f173411e71f1` | 75.57 | 27 | 4 | 1027 | pass |
| 3 | `01a19878-0914-7b93-b547-25b6264bd4eb` | 127.26 | 35 | 7 | 1561 | pass |

The existing strict `current_run_model_v1` and complete-document validators were reused. They check actual init/create/handoff receipts, exactly one Run, byte-identical original-request replay, valid Run seal, retained planning snapshot digest, Run-owned UR path, complete ordered document bytes/digest, absence of approvals and unchanged unsupported old control. CLI exit zero and model prose alone were not treated as success. Codex JSON events omit `isError`; failed domain outcomes and SDK validation-only responses were normalized as failed calls before applying the validators. The expected old-layout refusal is separate from the correction counts above.

These are three successful bounded core flows, not three error-free model conversations. Remaining invalid selector/module calls were rejected and the model recovered without operator hints. The original prompt additionally asks for a separate handoff preview/confirmation; the current published handoff contract has no such operation. That requested feature is not claimed as passed or introduced by this repair. Complete MCP document reading does not prove a human UI presentation or acceptance. The tests do not qualify Cockpit or other hosts.

The installer verified a healthy enabled plugin but returned `partial` / exit 1 because its aggregate setup state still requires fresh-session hook verification. Fresh CLI MCP discovery/execution and one runtime-facts context marker were observed afterward; this does not imply native Cockpit acceptance or a persisted installer-state transition.

## Preservation and evidence

Raw pre-repair failures and the first repaired diagnostic trial were retained, not overwritten or counted in the final three successes. The first repaired trial used `45b38547f184`, exposed the metadata issue and omitted the old-fixture backlog file; it is excluded from the strict final qualification.

Local evidence: `/private/tmp/agdf-mcp-fix-evidence-20261101/logs.json` contains hashes of the check/install logs. Final trial directories are `/private/tmp/agdf-mcp-fixed-native-2`, `-3`, `-4`, each with `audit.json`, actual CLI events, result and settings/negative-fixture observations. Raw prompts/reasoning/authentication material are not copied into this repository. These local temporary paths are not durable CI artifacts.

The three pre-existing foreign files under retained compatibility evidence match their original SHA-256 values (`foreign-preservation.json`). Closed governance records are outside the repair diff. Evidence was collected before VCS closeout. Commit, push, CI and merge status require separate verification.
