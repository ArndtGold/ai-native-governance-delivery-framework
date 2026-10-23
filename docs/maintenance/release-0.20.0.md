# AGDF 0.20.0: CLI-qualified release scope and evidence handoff

This is candidate preparation, not a publication announcement. Canonical hostSupport schema 3 in
plugins/agdf/meta/agdf-plugin.definition.json owns release scope. Existing generators derive the
diagnostic Codex CLI pin; one 0.20.0 version line remains shared by all integrations.

| Surface | 0.20.0 treatment | Current evidence and limit |
|---|---|---|
| Claude Code CLI on Windows | **Mandatory** qualified target: dispatch, failure_case, skill_continuation, upgrade, recovery | Needs five fresh reviewed records for the final candidate; the five cases for 830d8b94 stay historical |
| Codex CLI on macOS | **Mandatory** qualified target: the same five cases | Needs five fresh reviewed records for the final candidate with the preflight-frozen tuple; earlier dirty-candidate runs stay diagnostic |
| Codex Desktop | Manually checked; not qualified; not required for publication | Maintainer reports invocation, upgrade and recovery passed; OS/app/model/session/candidate unknown |
| Claude Desktop | Manually checked on Windows; not qualified; not required for publication | Same reported manual passes; Desktop identity unknown; CLI identity is separate |
| Codex CLI Windows/Linux | **Unqualified**, outside the mandatory matrix | Pinned diagnostic probes (Codex 0.157.1, gpt-6-luna) retained; ordinary platform regression tests remain required |
| Copilot / OpenCode | **Experimental** | Adapters and regression tests retained; no native qualification claimed |

The maintainer's original Desktop handcheck statement is preserved under
evals/host-compatibility/native/reported/desktop-handchecks-20261022/. Recording date is not execution
date and unknown identities stay unknown. The generated compatibility report keeps these
human_reported assertions at zero qualified coverage. No CLI result qualifies a Desktop surface, and
no result for one operating system qualifies another.

## Prepare and freeze the candidate

Use the existing locked preparation and verification order:

```sh
npm run build:prepare
npm --prefix packages/mcp-server ci --ignore-scripts
npm run compatibility:record
npm run compatibility:check
npm run build
npm --prefix packages/cli run release:prepare
npm run verify:ci
node scripts/native-probes/release-evidence.mjs candidate --output .release-candidate.json
```

Source, policy, probe, lock or shipped changes invalidate identity; only fixed evidence-output classes
are excluded. Compute the final candidate in a clean isolated worktree of the final commit. Do not
remove foreign or ignored daily host settings to manufacture a clean checkout. No staging, commit,
tag or publication is performed by these commands. Records for an earlier candidate are never
relabelled for a new one.

## Per-host handoff and native runs

Each mandatory host runs on its own computer with its existing authentication:

```sh
node scripts/native-probes/release-evidence.mjs handoff --candidate .release-candidate.json --host claude --output probe-results/claude-cli-handoff
node scripts/native-probes/release-evidence.mjs handoff --candidate .release-candidate.json --host codex --output probe-results/codex-cli-handoff
```

The handoff writes the candidate, the five required cases of that host and its instructions
(WINDOWS_TEST.md or MACOS_TEST.md). On the executing computer, use a clean checkout of the candidate
commit, run build:prepare and the MCP package install, then freeze the actual tuple and run the cases:

```sh
node scripts/native-probes/release-evidence.mjs preflight --candidate candidate.json --host claude --surface cli --model ACTUAL_MODEL --output tuple.json
npm run native:claude-e2e -- --candidate candidate.json --tuple tuple.json --model ACTUAL_MODEL --scenario dispatch
```

Repeat for failure_case, skill_continuation, upgrade and recovery. Claude runs on native Windows from a
terminal outside the Claude Desktop app package, for example one opened through explorer.exe. Codex
runs on macOS with --host codex and npm run native:codex-e2e; set CODEX_BIN when the client ships
inside the ChatGPT app. Preflight refuses Codex CLI on another OS and Claude outside Windows. The
harness refuses a tuple that changed after preflight.

Each case installs AGDF deliberately in an isolated scope, checks discovery, makes the non-authorizing
call and removes its own installation. Upgrade starts from the actually released 0.14.5 baseline with
integrity and source digest and verifies the fresh effective candidate; recovery uses the supported
owned_stale_install path. Foreign state, permissions and governance are preserved. Keep failed
attempts and stop on unknown ownership; never broaden cache deletion or permissions.

Return only the probe-results directories with release-records.json and their referenced captures,
plus tuple.json and candidate.json. Credentials, profiles and unrelated transcripts stay on the
executing computer.

## Tuple binding

A mandatory target is bound by its reviewed frozen tuple: host, surface cli, OS, architecture, client
version, Node and model. Codex records additionally carry the exact candidate commit, so later
evidence-only commits keep them valid. The Codex 0.157.1 / gpt-6-luna pin applies only to the
Linux/Windows diagnostic scope (validate-cli) and never satisfies the macOS row.

## Reviewed scoped import and full eligibility

A reviewer inspects identity, primary captures, the non-authorizing calls, baseline, preservation and
cleanup, then completes the exact tuple/bundle review. Templates start reviewed false. This is
cooperative evidence review and grants no AGDF gate approval.

```sh
node scripts/native-probes/release-evidence.mjs review-template --candidate .release-candidate.json --bundle probe-results/claude-cli --output probe-results/claude-review.json
node scripts/native-probes/release-evidence.mjs import --candidate .release-candidate.json --host claude --surface cli --bundle probe-results/claude-cli --review probe-results/claude-review.json
```

Repeat for Codex with --host codex. Imports are immutable, copy only validated references, reject
unsafe, mixed, duplicate or failed records and roll back only their owned output. Records live in the
cli folder of each host below evals/host-compatibility/native/CANDIDATE_ID/ with their review.json.
With schema 3, --surface cli always selects the mandatory scope, so a diagnostic record cannot be
imported as qualification.

```sh
node scripts/native-probes/release-evidence.mjs validate --candidate .release-candidate.json --directory evals/host-compatibility/native/CANDIDATE_ID --all-hosts
npm run compatibility:record
npm run compatibility:check
```

The validate command requires all ten mandatory rows, including on its default route; the
publication path additionally rejects schema 1 and 2. All npm publication paths depend on this
release-evidence job, normal verification and the existing tag/version/registry/credential/integrity
controls. Existing CI timeouts and all ordinary test commands remain.

## Optional Desktop evidence

Desktop surfaces stay manually checked for 0.20.0. The strict schema-3 Desktop record format,
desktop-template, preflight for --surface desktop-code and scoped import remain available. A supplied
Desktop folder must hold a complete, reviewed, strictly valid set for its host (session, upgrade and
recovery, each in its own fresh Desktop session with native rollouts or Desktop transcript lines,
primary proof and a real image capture); a partial or invalid set fails validation rather than being
ignored. Absent Desktop folders add no obligation, and a valid set does not change the 0.20.0
support label.

Hashes prove content integrity, not independent execution truth or operator authenticity.
Preparation, native qualification, current QA, deliberate human UAT/OR, an authorized VCS handoff and
publication remain separate. A documented manual pass or a successful validator fixture is no release
authorization. Embedded MCP Apps, hook trust/execution and other capabilities need their own proof.
