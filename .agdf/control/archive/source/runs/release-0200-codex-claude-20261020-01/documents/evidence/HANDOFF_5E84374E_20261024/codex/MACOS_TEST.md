# Codex CLI on macOS: release qualification

Candidate: 5e84374e54be68685b1ded7edf71e1e1688d58011db405c87c50aa4a3121a130
Version: 0.20.0
Clean source commit: 7a41879e742a95579755020b04ccb6e93b81d257

Mandatory cases on macOS: dispatch, failure_case, skill_continuation, upgrade, recovery. Each case installs, discovers, invokes and removes AGDF in an isolated scope.

1. Use a clean checkout of that commit with complete history and lockfile dependencies. Run npm run build:prepare, then npm --prefix packages/mcp-server ci --ignore-scripts. Recompute and validate the candidate content before execution.
2. Use the legitimately authenticated Codex CLI on this Mac. When the client ships inside the ChatGPT app, set CODEX_BIN to that executable for preflight and every case.
3. Freeze the actual tuple: node scripts/native-probes/release-evidence.mjs preflight --candidate candidate.json --host codex --surface cli --model MODEL --output tuple.json, where MODEL is the model actually available.
4. For each case run npm run native:codex-e2e -- --candidate candidate.json --tuple tuple.json --model MODEL --scenario CASE. The harness refuses a changed tuple; never edit a completed record.
5. Return only the probe-results directories with release-records.json and their referenced captures, plus tuple.json and candidate.json. Credentials, profiles and unrelated transcripts stay on this computer.
6. A reviewer runs review-template, checks the primary captures, marks the review and imports with --host codex --surface cli. Missing or failed cases stay open; this handoff grants no gate approval or publication.
