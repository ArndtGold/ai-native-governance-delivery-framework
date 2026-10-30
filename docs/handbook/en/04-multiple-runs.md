---
language: en
chapter_role: multiple_runs
translation_of: ../de/04-mehrere-runs.md
source_revision: sha256:9ff856097d47cffdbf51579c48b97d4759e33499fe9900d754ecbe2063ccbb99
translation_status: reviewed
---

# Multiple runs

A **run** is the durable AGDF control state for one work item. Each run has its own artefacts,
approvals, evidence, risks and next permitted step.

A run is not a technical working copy. It does not automatically isolate a branch, worktree, files,
processes or external systems.

## Run selection

You normally do not need to select the run yourself:

- If exactly one run is active, AGDF can select it automatically.
- If several active runs are plausible, the agent must show the candidates.
- If your request is ambiguous, the agent stops and asks for the smallest necessary clarification.
- If you explicitly name a new target, it replaces any previously assumed target.

The working directory, branch name, current diff or chat history alone is not enough to select an
authoritative run.

## Overview of all runs

When you ask "Show the active AGDF runs in this project", the agent answers with the run inventory
(`agdf_inspect`, operation `inventory`). In the shell, `agdf inventory --json` returns the same list.
The inventory reads only the stored `RUN_STATE.md` files and lists every run once with title,
lifecycle, current step, attention class, last activity and revision:

- **Decision required:** an exact approval is pending.
- **Clarification required:** the stored result is `revise`, `decline` or a change request.
- **Blocked:** the result is `block` or the run state is invalid; `doctor --run` shows why.
- **In progress** and **Unclear** for the remaining active runs.

The list starts with these classes, followed by the most recently worked runs. Last activity is the
newest receipt, else the date of the latest approval (day precision), else unknown. Completed,
superseded and abandoned runs appear as history. The classes describe the stored state and are not a
live evaluation; `gate-check` gives the current state of one run. `doctor --all-active` still checks
every active run in full and carries the same inventory.

## Multiple tasks in one repository

AGDF may use separate runs for a defect, a new feature and a documentation change. Their control
states remain separate, but changes in a shared working directory can still overlap.

The agent must therefore:

- confirm the affected run and scope before changing files;
- keep existing unrelated changes visible;
- leave unrelated files untouched;
- stop and fail closed when paths overlap, artefacts conflict or authority is unclear;
- use a separate branch or worktree for technical isolation when needed.

A run does not replace a Git or worktree strategy.

## Completed runs

A completed run remains as evidence. It can later show:

- which decision was made;
- which artefacts and approvals were available;
- which checks were run;
- which risks or boundaries were documented.

New work does not silently reuse state from a completed run. It needs a new run or another explicitly
selected active run. Historical evidence may be linked without rewriting the completed run.

## Ending runs without delivery

Not every run is delivered. When another run replaces a piece of work, or it will not be pursued,
end it explicitly:

- **superseded**: replaced, with a successor and a reason. The successor is an existing run id or a
  free reference, such as a pull request, recorded as unverified.
- **abandoned**: not pursued, with a reason.

There are two steps. First a preview shows each selected run with its gate, open approvals, last
activity and warnings; it changes nothing. Then you confirm exactly that preview with the phrase
`Close runs: <preview_id>`. An agent prepares the preview and forwards only your verbatim reply.
Every run that has not changed since the preview is closed and receives its own receipt with the
reason, the time and your Git identity. The result names every run. While an interrupted write
anywhere in the repository waits for recovery, nothing is closed.

An ended run is final. It leaves every list of active runs, stays readable as history and accepts no
further steps, approvals or continuations. To continue the work, start a new run that may reference
the old one.

In the shell you do the same with `run-close`. The preview prints the preview id and the exact
phrase; only the second command closes:

```bash
agdf run-close --action preview --run payment-limit-v1 --outcome superseded --reason "Replaced by the limit redesign" --successor-run payment-limit-v2
agdf run-close --action apply --preview-id 3f2a9c1e --confirmation "Close runs: 3f2a9c1e"
```

`--successor-run` requires an existing run id. For a free reference such as a pull request use
`--successor-ref`; for `abandoned` leave the successor out. To close several runs at once, describe
them in a JSON file and pass it with `--closure-file`. Replace the run ids and the preview id with
the values AGDF shows you.

## How the CLI chooses a run

You normally need to select a run only when several runs are active. The AGDF status shows the run
ID. For example, it might be `payment-limit-fix`.

The plugin and the CLI are separate installations. Installing the plugin therefore does not
automatically provide the `agdf` shell command. First check whether the globally installed CLI is
available:

```bash
command -v agdf
```

If the command does not print a path, you have two options:

```bash
npm install --global @agdf/cli
agdf gate-check --run payment-limit-fix
```

Alternatively, run the same check through the published npm package without a global installation:

```bash
npx --yes @agdf/cli@latest gate-check --run payment-limit-fix
```

`npx ...@latest` may download the currently published package from the npm registry. That version
may be behind a local repository checkout. Use `npx ...@latest` for bootstrap, installation or a
deliberate registry lookup, and use the globally installed CLI for repeated local checks. See
[INSTALL.md](../../../INSTALL.md) for the complete installation paths. Run all commands below in the
target repository.

For a single CLI command, provide the run ID with `--run`:

```bash
agdf gate-check --run payment-limit-fix
```

If several commands should use the same run, set the environment variable for your current shell:

```bash
export AGDF_RUN_ID=payment-limit-fix
agdf doctor
agdf gate-check
unset AGDF_RUN_ID
```

`unset AGDF_RUN_ID` removes the selection afterwards. Replace `payment-limit-fix` in these examples
with the run ID that AGDF shows for your work item.

The CLI checks an explicit `--run` first and then `AGDF_RUN_ID`. Without either value, it selects a
run automatically only when exactly one run is active. If several runs remain possible, AGDF stops
instead of guessing.

Run selection determines only which AGDF control state the command uses. It does not create or
switch a Git branch or worktree.

Next: [Closeout and delivery](05-closeout-and-delivery.md).
