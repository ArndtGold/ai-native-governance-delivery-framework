# Installed MCP follow-up: flow without unplanned errors, 2026-11-01

The maintainer requested a direct repair without AGDF until a smooth complete native flow exists. No governance workflow, gate approval or new delivery Run was used for the repair. Synthetic Runs are confined to disposable test repositories. This follows the earlier `mcp-installed-reliability-20261101.md` assessment, whose corrected-but-failing calls remain preserved as baseline evidence.

## Result and exact boundary

A fresh, unassisted installed Codex CLI session completed the supported core flow in **25 MCP calls, with zero unplanned rejected calls and zero orchestration script failures**. The sole rejection was the deliberately unsupported old-layout negative fixture. The CLI exited zero in 98.26 seconds; the existing strict validators independently confirmed the result.

- CLI thread: `01a19883-b766-7891-8361-f4986baa5c51`.
- Installed plugin: `0.20.2+codex.local-f0b51cb42f76`; enabled and healthy through the regular installer.
- Source digest: `f0b51cb42f76bfc23fdbdd8f9a8a6b289201972e8d75745276db1434df2fcbcb`.
- Plugin digest: `e1ee10ded641fe40255ab563dfdba22ca3a610f53c3de89545fc7bbbe5845e40`.
- Actual MCP runtime digest: `a7e60db5fce666f877cdfb09482abfce8b42096aa8c8e8d84d1aaa3f6decdbc7`, `local_exact_version_digest`, provenance `matched`.
- Host: Codex CLI 0.163.0, gpt-6.1-sol / low, macOS darwin-x64, normal installed plugin transport and existing ChatGPT authentication.

The actual flow initialized the fresh target in English, staged and saved one planned UR, handed it into exactly one Run, inspected current state and paths, prepared and completely read the UR document, replayed the original handoff request byte-identically, and refused the independent old-layout Git target without modifying it. The Run seal and retained planning snapshot were valid. The document read covered all 1518 bytes and matched digest `sha256:f270a05b396d1b01c8047f48609dab04c5a52bb5bb877a380d3ec609728cda17`. No approval was requested or recorded.

This proves one smooth supported MCP flow, not a statistical reliability rate, a warning-free host installation, human acceptance, Cockpit qualification or other-host support. Three pre-existing Codex startup warning events remain visible: two configuration-key warnings and one experimental-feature warning. They were not suppressed or counted as successful tool calls. The installer's aggregate result remains `partial` / exit 1 for fresh-session hook verification; its plugin update itself succeeded. The actual MCP session was separately verified.

## Production causes repaired

- MCP `contract` without `module` now returns an index of actual runtime modules, exact command modules and operation-specific Inspect help. This removes the circular requirement to guess a module before discovering its name. Modules are drawn from the current resource context. The ordinary CLI `contract` still requires `--module`.
- Discovery explicitly says to omit Run bindings on project/planned/global inventory reads, omit revisions on status reads, and omit planning scope on command-contract help. On-demand help exposes each operation's excluded fields. The schema's equivalent project/planned target rules were combined to keep discovery at **6135 bytes**, below the unchanged **6144-byte** limit.
- Successful planning capture, Run creation/handoff and presentation preparation return complete, copyable `agdf_inspect` `next_calls`. Each request uses only the fields its operation accepts. Presentation reading preserves the exact target, gate, original revision and presentation identity.
- SDK input validation still rejects the same invalid requests before execution. Its error message is supplemented with Core-owned field-specific correction hints, such as removing `expected_revision_id` and `run_id` for inventory. Output validation, target checks, revision checks and command authority were not relaxed. Hints use fixed field/operation names without echoing arbitrary input values.

Canonical sources: Core Inspect contract/selection/service and Core service composition; Run-command response composition; shared protocol error support; the MCP server's existing SDK validator adapter. The regular installer regenerated the payload. No installed cache was patched.

## Checks

All final affected-surface checks passed:

| Check | Result / local log |
| --- | --- |
| Core planning/index/help/error projection and worker lifecycle | 20/20 tests, `/private/tmp/agdf-mcp-friction-unit-final.log` |
| Actual planned flow through both negotiated STDIO protocol eras | 2/2; executes returned follow-up requests through document completion and checks SDK field-specific rejections, `agdf-mcp-friction-stdio.log` |
| CLI/Inspect parity, scope policy, read-only behavior and schema budget | pass, `agdf-mcp-friction-inspect.log` |
| Defaulted inputs, SDK protocols, skill names, error transport and doctor observations | pass, `agdf-mcp-friction-protocol.log` |
| Compiled worker, semantic contracts and transport forwarding | pass, `agdf-mcp-friction-contract3.log` |
| Static capability/write boundary, actual worker lock release and deadlines | pass, `agdf-mcp-friction-safety.log` |
| Owner thread/startup/generation lifecycle | pass, `agdf-mcp-friction-generation.log` |
| Installed native strict core flow, no unplanned tool/script failures | pass, `agdf-mcp-friction-native-1/friction-audit.json` |
| Diff whitespace and closed control-data preservation | pass |

Earlier failing check logs were retained. The obsolete contract-without-module rejection assertion was updated to test a still-invalid missing command module. A subsequent build check overlapped installer regeneration of its generated plugin source and failed before execution with `ENOENT`; after installation completed, the stable-source build/contract check passed. That fixture setup failure is not counted as valid product-test evidence. No limits were raised and no SDK dependency versions changed. Full CI, Nightly and a new performance qualification were not run for this follow-up.

## Native test and preservation evidence

The test retained the previous bounded natural-language task except for removing its impossible demand for a separate handoff preview/confirmation operation, which the current contract does not provide. It added no module names, field combinations, sequencing instructions or operator recovery hints. All other steps and the old-layout negative case remained. The test used a fresh Git target, disabled shell/memories/multi-agent features, and an actual sandbox denying writes to the owning repository and personal settings. Hashes confirm unchanged personal settings, unsupported old control and the three pre-existing foreign compatibility files. Closed Run records are outside the repair diff.

The existing strict `current_run_model_v1` and complete-document validators were reused. The auditor also reads the actual CLI rollout's tool outputs to reject JavaScript orchestration failures; successful MCP recovery alone is insufficient. CLI exit zero and model prose are not the success criterion. Raw traces and prompts remain outside the repository.

Local evidence is under `/private/tmp/agdf-mcp-friction-evidence-20261101` (hashed check logs, native audit, preservation facts and repair patch) and `/private/tmp/agdf-mcp-friction-native-1` (actual CLI events/results). These temporary paths are not durable CI artifacts. Evidence was collected before VCS closeout. This report does not establish CI, merge, release or human QA/UAT acceptance.
