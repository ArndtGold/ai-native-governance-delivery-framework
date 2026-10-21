# AGDF 0.20.0: preparation and host evidence

This is a release candidate preparation, not a publication announcement. Versions and dependent
packages move together through the existing release transaction. Canonical support intent and
qualification policy live in `plugins/agdf/meta/agdf-plugin.definition.json`; the old Codex policy
file is a checked generated projection. No separate host version line is introduced.

| Integration | Intent for 0.20.0 | Required native release observations |
|---|---|---|
| Codex CLI | Qualification target | Native Linux and Windows; CLI 0.157.1, model gpt-6-luna; five scenarios on each OS |
| Claude CLI | Qualification target | Native Windows on the other test computer; exact installed version/model captured before execution; five scenarios |
| Claude Code in the Desktop app | Qualification target | Separate Windows coding-session, post-upgrade and post-recovery observations; actual app/session and loaded candidate identity |
| GitHub Copilot | Experimental | Adapter and deterministic regression coverage retained; no native qualification promised |
| OpenCode | Experimental | Adapter and deterministic regression coverage retained; no native qualification promised |

CLI scenarios are dispatch, controlled invalid input, skill continuation, released-baseline upgrade
and supported owned-state recovery. Each has installation/discovery and cleanup obligations.
Native hooks and embedded MCP App rendering need their own observations and are not inferred.
The published 0.14.5 package is the upgrade baseline; today's same-version development tree is not.

## Prepare a candidate

Run the existing preparation and verification path before native testing. Relevant source/policy/probe,
lockfile or shipped-content changes invalidate candidate identity. Native result files and their
defined compatibility manifest pointers are outputs; they do not change tested software identity.
Codex still requires its exact clean release CI SHA, including after a result-only import commit.

```sh
npm run build:prepare
npm --prefix packages/mcp-server ci --ignore-scripts
npm run compatibility:record
npm run build
npm run verify:ci
node scripts/native-probes/release-evidence.mjs candidate --output .release-candidate.json
```

Candidate creation reports source dirtiness. A dirty candidate is diagnostic and cannot qualify or
produce an executable handoff. After the final authorized clean ref is available, create the manifest
again and export the test instructions into ignored local results:

```sh
node scripts/native-probes/release-evidence.mjs handoff --candidate .release-candidate.json --output probe-results/windows-0200-handoff
```

The handoff carries candidate/policy/package checksums, the source commit and required case inventory.
It does not contain credentials, install a remote service or contact the other computer. Native
execution always validates the complete prepared source and payload inventories against the manifest.
Hashes establish content equality; they do not independently attest human identity or execution.

## Windows Claude execution

Use that exact clean source/candidate on the Windows test computer and prepare it with lockfile
dependencies. Authentication stays there. Do not modify the daily-use Desktop profile merely to
obtain a pass: use a verified supported test profile or dedicated test environment. Do not assume
Desktop honors CLI isolation variables or loads the CLI's payload.

Capture the actual model ID and runtime tuple; replace the example model/version values below with
observed values. The script rejects current/latest placeholders. Desktop version evidence must be
an actual local capture or native version diagnostic, not this document.

```powershell
node scripts/native-probes/release-evidence.mjs preflight --candidate .release-candidate.json --surface cli --model "ACTUAL_MODEL_ID" --output probe-results/claude-cli-tuple.json
node scripts/native-probes/release-evidence.mjs preflight --candidate .release-candidate.json --surface desktop-code --model "ACTUAL_MODEL_ID" --version "ACTUAL_APP_VERSION" --version-evidence "PATH_TO_NATIVE_VERSION_CAPTURE" --output probe-results/claude-desktop-tuple.json
```

Run each case once; retain every actual output and failure. The release probe uses an isolated CLI
home and bounded existing authentication. It resolves npm command shims through the existing Windows
host-command owner, verifies the installed/loaded runtime and measures native uninstall before
discarding its temporary profile.

```powershell
npm run native:claude-e2e -- --candidate .release-candidate.json --tuple probe-results/claude-cli-tuple.json --model "ACTUAL_MODEL_ID" --scenario dispatch
```

Repeat with `failure_case`, `skill_continuation`, `upgrade`, and `recovery`. The baseline download
validates the exact published package integrity, rejects unsafe archive entries and never executes
archive lifecycle scripts. Upgrade/recovery capture a fresh model invocation after the transition.
Unknown ownership or unsupported repair fails the case rather than replacing foreign state.

Create separate Desktop templates for `session`, `upgrade`, `recovery`:

```powershell
node scripts/native-probes/release-evidence.mjs desktop-template --candidate .release-candidate.json --tuple probe-results/claude-desktop-tuple.json --scenario session --output probe-results/desktop-session.json
```

Templates start unverified. Complete them only from actual fresh Claude **Code** sessions in the
Desktop app, recording session identity, loaded plugin/runtime diagnostics, AGDF access and cleanup.
For upgrade/recovery, complete the separate transition fields from that Desktop test scope: verified
released baseline integrity/source digest, foreign-state and permission preservation, and the actual
owned stale-state repair for recovery. Supply references for these observations as well.
Each needs contained hashed native JSON/log references and an image capture identifying the coding
surface. A screenshot alone, generic Desktop chat, CLI trace or model claim is insufficient.
Keep unavailable capabilities unverified and state the exact missing observation.

Return only the redacted `release-records.json` files, the three `desktop-*.json` records, their
referenced native/capture files, the candidate and frozen tuples. Preserve relative directory
structure. Never return authentication files or complete personal profiles. Keep failed attempts
separately; do not mix duplicate success/failure cases in one acceptance bundle.

## Review and import

On a matching clean candidate, create a review template for the returned local bundle:

```sh
node scripts/native-probes/release-evidence.mjs review-template --candidate .release-candidate.json --bundle probe-results/returned-windows --output probe-results/windows-review.json
```

It starts with `reviewed: false` and no reviewer. Inspect primary observations, exact tuple/model,
baseline, preservation, cleanup and Desktop assurance before completing the reviewer and review
decision. This cooperative record is evidence review, not an AGDF gate approval.

```sh
node scripts/native-probes/release-evidence.mjs import --candidate .release-candidate.json --bundle probe-results/returned-windows --review probe-results/windows-review.json
npm run compatibility:record
npm run compatibility:check
```

Import rejects missing, duplicate, failed, dirty, mismatched or altered records and unsafe paths.
It copies only verified references into an immutable candidate-scoped evidence directory. The
existing compatibility producer receives only measured native claims with lane/mechanism/tuple and
bounded public references. Other capabilities remain unverified. Native release records retain the
complete required-case evidence; compatibility vocabulary does not invent additional skills or UI proof.

## Publication eligibility and remaining decisions

The existing publication graph depends on both the Codex native gate and the all-host validation
job. It requires ten Codex, five Claude CLI and three Desktop Code observations. Missing Windows
evidence blocks publication before any npm package is published. Existing native job limits remain
unchanged; a timeout is a failure, not permission to omit coverage or raise the limit.

No native results are supplied by adding this tooling. Package preparation, native qualification,
QA/UAT/OR, an authorized clean VCS ref and publication remain distinct. No commit, push, tag,
marketplace submission or package publication is performed by these preparation commands.
