# Codex CLI on macOS — run for candidate 5e84374e

Candidate 5e84374e54be68685b1ded7edf71e1e1688d58011db405c87c50aa4a3121a130, commit 7a41879e742a95579755020b04ccb6e93b81d257.
The general rules are in MACOS_TEST.md; this page is the concrete sequence.

Inside the checkout the candidate file is named .release-candidate.json, which git ignores. A candidate.json in
the repository root, as the generic steps suggest, would make the checkout dirty and every record invalid.

## Prerequisites on the Mac

- A clone of ArndtGold/ai-native-governance-delivery-framework with branch
  feat/prepare-0.20.0-Desktop-evidence-handoff pulled (it contains this handoff directory).
- Node 22 or newer, npm, git and network access (npm ci and the released 0.14.5 baseline).
- The Codex CLI signed in with your account (`codex login`). If Codex ships inside the ChatGPT app,
  export CODEX_BIN=/Applications/ChatGPT.app/Contents/Resources/codex before the run.
- The model you want to qualify. The script uses gpt-6-luna unless you export MODEL=... first;
  preflight freezes exactly that model together with the Codex version.

## Run

```sh
cd <clone>/.agdf/control/artefacts/release-0200-codex-claude-20261020-01/evidence/HANDOFF_5E84374E_20261024/codex
bash run-codex-cli-cases.sh
```

The script creates the clean worktree ~/agdf-rc-7a41879e at the candidate commit, builds it, runs preflight
(macOS only) and the five cases dispatch, failure_case, skill_continuation, upgrade and recovery once each,
and writes ~/agdf-rc-7a41879e/probe-results/codex-cli-run.log. Each case installs AGDF into an isolated
Codex home, uses your sign-in only for its own sessions and removes its installation again.

## Return

The script packs ~/codex-cli-bundle-5e84374e.tar.gz with the candidate, the frozen tuple, the log, and per
case only release-records.json, observation.json, summary.txt and the referenced process and primary
captures. It never packs work-tmp. Copy the tar.gz to the Windows computer (for example into
C:\Workspace\agdf-native-returns\). Do not edit or rerun completed cases to change a result; failed cases stay
as they are and are reported.

The reviewer then checks the primary captures, prepares the review with review-template and imports with
--host codex --surface cli. Nothing here grants a gate approval or publication.
