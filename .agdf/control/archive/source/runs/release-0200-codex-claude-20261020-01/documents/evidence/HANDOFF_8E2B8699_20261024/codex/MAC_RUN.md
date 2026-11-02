# Codex CLI on macOS — run for candidate 8e2b8699

Candidate 8e2b86992e009f5a597fdd45075c7e43f054b836f584fc68fc891c73f32bb692, commit 460027fabc58fe0da041bbabe117519dd1f696b7.
The general rules are in MACOS_TEST.md; this page is the concrete sequence. It replaces the 5e84374e handoff,
which was never run.

Inside the checkout the candidate file is named .release-candidate.json, which git ignores. A candidate.json in
the repository root, as the generic steps suggest, would make the checkout dirty and every record invalid.

## Prerequisites on the Mac

- A clone of ArndtGold/ai-native-governance-delivery-framework with branch
  feat/prepare-0.20.0-Desktop-evidence-handoff pulled. The branch contains this handoff directory.
- Node 22 or newer, npm, git and network access, for npm ci and the released 0.14.5 baseline.
- The Codex CLI, signed in freshly right before the run with `codex login`.
  - Each case copies auth.json into its isolated Codex home. A token refresh inside one case could invalidate the
    sign-in for the following cases. The Claude run on 2026-10-24 failed this way.
  - If Codex ships inside the ChatGPT app, export CODEX_BIN=/Applications/ChatGPT.app/Contents/Resources/codex
    before the run.
- The model you want to qualify. The script uses gpt-6-luna unless you export MODEL=... first. Preflight freezes
  exactly that model together with the Codex version.

## Run

```sh
cd <clone>/.agdf/control/artefacts/release-0200-codex-claude-20261020-01/evidence/HANDOFF_8E2B8699_20261024/codex
bash run-codex-cli-cases.sh
```

The script:
1. creates the clean worktree ~/agdf-rc-460027fa at the candidate commit and builds it;
2. runs preflight (macOS only);
3. runs the five cases dispatch, failure_case, skill_continuation, upgrade and recovery once each;
4. writes ~/agdf-rc-460027fa/probe-results/codex-cli-run.log.

Each case installs AGDF into an isolated Codex home, uses your sign-in only for its own sessions, and removes its
installation again.

## Return

The script packs ~/codex-cli-bundle-8e2b8699.tar.gz with:
- the candidate, the frozen tuple and the log;
- for each case, only release-records.json, observation.json, summary.txt and the referenced process and primary
  captures.

It never packs work-tmp. Copy the tar.gz to the Windows computer, for example into C:\Workspace\agdf-native-returns\.

Do not edit or rerun completed cases to change a result. Failed cases stay as they are and are reported. If a case
fails before any AGDF call because the sign-in expired, sign in again. A rerun of only the failed cases with the
same tuple is then possible, but needs the reviewer's agreement.

The reviewer then checks the primary captures, prepares the review with review-template and imports with
--host codex --surface cli. Nothing here grants a gate approval or publication.
