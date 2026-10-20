# Native T4 attempt: host configuration failure and bounded next action

Date: 2026-10-20
Owner: Codex
Disposition: failed; required native proof unavailable

## Original observation

Exactly one codex exec was issued through the new single-T4 mode of scripts/native-probes/codex-host-e2e.mjs. The existing multi-session scenario was not entered. Original files remain unchanged under probe-results/codex-t4-2026-10-20T08-32-25-376Z/: observation.json, events.jsonl, rollouts.jsonl, final-message.txt and effective-config.toml. Their digests are retained in probe-results/mcp-inspect-contract-phase2/evidence-manifest.json.

Host: Codex CLI 0.163.0, darwin-x64, Node 22.22.3. Requested/observed model: gpt-6.1-sol, high configured reasoning. Git HEAD: 377b75474d3ab4415df75106cad30c08ffafc7d9; the original observation additionally binds all uncommitted Core/MCP source files, verifier inputs, candidate runtime marker and SDK digest. Actual discovered agdf_inspect: 4998 bytes, digest sha256:c850aeadcc1f4022b3d5e0602982faca2011bcec21a6e5310c4a20ad6c963fc9.

The model session ended with process exit 0, no timeout or output-limit violation. It made zero MCP calls, read zero of three document pages and returned no document to the user. The original predicate and strict_t4_document_flow_v1 both failed. CLI process success is not task success.

Actual stderr and a structured host error report `code-mode host is disabled`. The isolated harness configuration explicitly set code_mode_host=false. The model attempted two Code Mode metadata-discovery wrappers and both failed before reaching MCP. This is a harness defect, not evidence that the candidate catalog/document implementation failed. The first evaluator also mislabeled benign PascalCase event types and the pure discovery wrappers as detours, and its trace_complete field did not reflect the nested host error. Those original fields are retained as historical output; the corrected supplemental diagnosis marks the trace incomplete, with two pure wrappers, zero detours and zero MCP calls. No failure is converted into a pass.

## Usage and isolation

Reported usage: 32494 input tokens, including 28544 cached; 311 output tokens; 147 reasoning output tokens. Actual USD cost was unavailable. Existing ChatGPT-account auth was used with API-key inheritance/fallback disabled and no separately authorized API expenditure. Do not interpret that billing boundary as zero actual inference cost.

After cleanup, personal configuration and repository control manifest changes were empty. The temporary auth copy and temporary fixture/runtime roots were removed. Original frozen document evidence remains verifier-only: 77796 bytes, sha256:2191669a88137efcb281bb8bf428260c41a49e45d2697763c1c214895b2ac04f. No binding was injected into the original model prompt.

## Repair without another model invocation

The shared single-T4 feature configuration now enables code_mode_host while retaining shell_tool=false, memories=false, multi_agent=false and apps=false. A CLI features-list check rejects disabled/unobservable host configuration before the sole model spawn. The installed CLI reports code_mode_host stable true under the corrected setting, and its bundled codex-code-mode-host executable exists. These are free local readiness checks, not proof of a functioning native model session.

The evaluator now recognizes the observed PascalCase messages, treats fatal nested host errors as incomplete traces, and statically parses Code Mode wrappers without executing model code. Only metadata, local computations and the existing inspect tool are admissible; shell, process/filesystem, imports, eval and constructor access remain rejected. New regression cases reproduce the observed failure formats. The final deterministic suite passes 42/42 with no skipped tests. The protected original T4 inputs, predicate and historical baseline were not changed.

The correction was not tested in another native model invocation. It may reveal another host integration or trace-shape problem when actually executed; do not claim otherwise.

## Decision requested

The direct user instruction and approved TP authorize exactly one agent session. TP-EVIDENCE-01 says `no second runner, extra session, retry or resume`; Native Execution Details require a scoped next action after a failed/unavailable attempt. The authorized invocation has been consumed. No automatic retry, resume, Claude fallback, additional comparison session or second model connectivity test is permitted by this checkpoint.

Proposed narrow next action: authorize exactly one replacement Codex CLI T4 invocation using the corrected existing harness, gpt-6.1-sol/high, original T4 prompt/fixture/predicate, 300000-ms timeout, existing ChatGPT account, 0 USD additional API expenditure, no API-key fallback, temporary isolated staging and guaranteed cleanup. Retain this failed attempt separately and report the replacement as a new observation, never as a retroactive change to the first result. Missing native proof continues to prevent clean QA acceptance until an actual successful replacement result exists.
