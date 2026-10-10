---
language: en
chapter_role: multiple_runs
translation_of: ../de/04-mehrere-runs.md
source_revision: sha256:f7e0284c5923d5e21ee7989c9f8bb6bc6815e57f355b390af4cb33b017469831
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
