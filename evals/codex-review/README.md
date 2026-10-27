# Separate Codex reviewer calibration

This bounded experiment compares a standard review prompt with a critical review
prompt in fresh Codex CLI sessions. It is a packet-only evaluation: it does not
invoke AGDF, load its plugins, read a control Run, write control artifacts or grant
QA/implementation/approval authority. It is not yet a production review adapter.

The first local comparison and its limits are documented in [RESULTS.md](RESULTS.md).

The six synthetic cases comprise three defect/correct pairs: an inclusive
boundary, a duplicate side effect on retry, and browser evidence from the wrong
candidate and a synthetic host. Trusted hidden checks establish which examples
are defective. Only requirements, candidate source and reported test observations
go to the model. The expected findings, case family and check functions stay in
the parent. These tiny cases are calibration fixtures, not a held-out benchmark
of actual AGDF changes.

## Run

Prerequisites: Node 22+, repository dependencies (`npm ci --ignore-scripts`),
Codex CLI **0.163.0**, and an existing ChatGPT CLI login. This experiment does not
perform login, copy credentials, change user configuration or use API-key billing.
Choose an available model explicitly; use the same model and effort for both
variants. `CODEX_BIN` can select the executable.

```bash
npm run test:codex-review
mkdir -p probe-results
npm run eval:codex-review -- --live --model gpt-6.1-sol --effort high
```

An audit correction can be applied offline without repeating model calls or
changing the source capture:

```bash
npm run eval:codex-review -- --reassess probe-results/<original-run> --out probe-results/<new-assessment>
```

Reassessment verifies fixture and exact prompt identity and records source-report,
event and final-response digests in a new derived report. Process failures stay
invalid. Only the original runner's successful-exit audit observations can be
reclassified. It refuses changed cases and existing output directories.

The live command starts at most **12 sessions**, serially, with a 120-second
deadline each and no retry/resume. `--timeout-ms` accepts 1,000–300,000 milliseconds;
`--out` chooses a new output directory whose parent must exist. Existing result
directories are never overwritten. Interrupting the run retains the completed
observations and marks the comparison incomplete. Infrastructure failure stops
remaining calls. Offline tests run in the existing maintenance-contracts CI stage
and never start Codex or contact a model.

## Isolation and evidence

Each cell uses a fresh temporary working directory outside the repository,
`--ignore-user-config`, `--ephemeral`, a read-only sandbox and `approval_policy=never`.
MCP configuration is empty. Plugin, hook, shell, code execution, app, browser,
memory, subagent and skill discovery capabilities are disabled for the invocation.
The packet arrives through stdin; no repository checkout or oracle file is
placed in the review directory. An event audit rejects any reported tool/action
item. This records the configured restriction and observed absence of tool calls;
it is not a qualification of every possible host execution path.
Two specifically identified pre-turn CLI startup notices are recorded separately;
unknown errors and all tool/action items still invalidate a session.

`report.json` and `REPORT.md` preserve all observations and summaries. Each cell
keeps its exact prompt, invocation, event stream, stderr and final response.
The output echoes a SHA-256 packet binding. Parent validation rejects mismatched
bindings, contradictory dispositions, unknown requirements and unverifiable
file/line quotations. Session IDs, configured model, CLI/platform versions,
experiment source digests, time and available token usage are retained. Actual
server-side model resolution, monetary cost and human rework remain unmeasured.

Findings use the existing AGDF `implementation_gap` / `evidence_gap` vocabulary.
They have no automatic control writer. A future adapter must first bind real
Run/revision/code/evidence identity, revalidate the current state, map findings
through the existing review owners and leave the final decision with `qa-gate`.

## Interpretation

- Baseline means a **fresh-session standard reviewer**, not the implementer's own
  review or today's complete AGDF workflow. The comparison measures prompt effects;
  it cannot establish a gain from reviewer independence itself.
- Expected-finding recall uses an explicit proxy: requirement, gap type, source path and
  known defect line must match; quotations must exist on that line. Duplicate and
  unmatched findings are counted separately. Unmatched findings may be useful
  coverage observations or defects not anticipated by the oracle; they are not
  established false positives. Precision and a false-positive rate stay unavailable
  until independent adjudication. A human must audit the explanations before
  calling matching findings semantically correct.
- A `no_findings` result on a defective case is a false clear. Correct examples
  expose candidates for false-alarm adjudication. Failed processes, incomplete traces, tools, schema errors
  and invalid citations are invalid observations, never successful clean reviews.
- `complete` means every planned observation is valid, not that the critical
  variant is better. Inspect both absolute counts and invalid observations.
- One repetition on six small, visible fixtures does not establish statistical
  superiority, robust defect detection, reduced rework or production readiness.
  Expansion needs representative held-out changes and a measured human baseline.

CLI references: [noninteractive commands](https://learn.chatgpt.com/docs/developer-commands#codex-exec).
