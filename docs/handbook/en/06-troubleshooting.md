---
language: en
chapter_role: troubleshooting
translation_of: ../de/06-fehlerbehebung.md
source_revision: sha256:d92359d35f3906e77dce17e46d60f05aac1842395c63836b32f53a3d6d6e3081
translation_status: reviewed
---

# Troubleshooting

The [host compatibility comparison](../../compatibility/HOST_COMPATIBILITY.md) distinguishes whether
AGDF is installed, discovered, callable, correctly updated and recoverable after failure. It identifies
the date, environment and evidence class. Simulated tests do not prove a fresh session in a real host.
Missing evidence remains explicitly unverified.

Available skills, automatic checks, observed governance and technical enforcement are separate claims.
Approving a hook does not prove that a check ran. Inspect local status and the specific session. Manual
verification remains available when automatic checks are declined. After a failure, a retry becomes
successful only when its result has been observed.

When the agent stops, first identify which layer is affected:

1. **Installation:** Is the plugin or runtime installed and loaded at the expected version?
2. **Repository activation:** Does the target repository have valid AGDF configuration and
   valid run state?
3. **Delivery state:** Which run and gate are active, what is missing, and what is permitted next?

A healthy installation and a blocked delivery state can both be valid at the same time.

## An approval is missing

First confirm that you are looking at the correct run, gate and current artefact revision. If the
artefact matches your decision, enter the approval exactly:

```text
Approval: TP
```

`OK`, `Weiter`, `Leg los`, `Approved` and values with extra text such as
`Approval: TP (Recommended)` are not valid gate approvals.

If the artefact is not right, describe the correction. Do not approve the gate pre-emptively.

## Several active runs

AGDF must not guess when several runs are active. Name the work item or run ID explicitly, or ask
the agent to list candidates with their gate, artefacts and next step.

The plugin alone does not install an `agdf` shell command. Check first:

```bash
command -v agdf
```

If the command does not print a path, either use the complete registry command

```bash
npx --yes @agdf/cli@latest gate-check --run payment-limit-fix
```

or install the CLI globally as a deliberate step:

```bash
npm install --global @agdf/cli
```

The following short forms with `agdf` require that global installation and must be run in the target
repository. In contrast, `npx ...@latest` uses the currently published registry version, which may
differ from a local repository checkout. Replace `payment-limit-fix` with the run ID shown by AGDF.

Check the published, globally installed and local repository versions separately:

```bash
npm view @agdf/cli version
npm list --global --depth=0 @agdf/cli
node -p "require('./agdf/package.json').version"
```

The third line is useful only in the root of an AGDF repository checkout. An empty global npm list
means that `agdf` is not installed globally on that machine.

Select the run explicitly for one gate check:

```bash
agdf gate-check --run payment-limit-fix
```

Alternatively, apply the environment variable to this command only:

```bash
AGDF_RUN_ID=payment-limit-fix agdf gate-check
```

Inspect every active run independently with:

```bash
agdf doctor --all-active
```

## Repository activation is missing

A global installation proves only that AGDF is available on that surface. It does not prove that the
repository has durable control state. In the target repository, run exactly the status command for
the surface you use:

```bash
agdf status --surface codex
agdf status --surface claude
agdf status --surface opencode
```

You need only one of these three lines. See [INSTALL.md](../../../INSTALL.md) for the installation
and activation steps for each surface. Follow only the documented path for repository activation
and durable control state. A new agent-native request may still begin with a minimal UR in the
conversation when durable repository control is not yet needed.

A relative file glob or the mere presence of any `.agdf` file does not prove valid activation. If
the global CLI is the documented installation path for your surface, run the complete repository
check with:

```bash
agdf doctor --json
```

If your surface uses its own local validator instead, run the complete surface-specific command
from [INSTALL.md](../../../INSTALL.md).

## Legacy run state or mixed authority

The canonical mutable run file is:

```text
.agdf/control/runs/<run_id>/RUN_STATE.md
```

An older `.agdf/control/AGDF_RUN.md` may be migration input or an explicitly generated
non-authoritative projection. It is not a second mutable owner.

Do not delete or overwrite legacy files based on an assumption. First inspect the selected run:

```bash
agdf doctor --run payment-limit-fix --json
agdf gate-check --run payment-limit-fix --json
```

If the diagnosis requires a migration, run it explicitly for the same run ID:

```bash
agdf run-migrate --run payment-limit-fix
```

Replace `payment-limit-fix` with the affected run ID. Read-only commands such as `doctor` and
`gate-check` do not migrate the state automatically.

## The agent reports `revise` or `block`

`revise` means a correctable gap or missing evidence remains open. `block` means a hard
prerequisite, authority question or critical risk is unresolved.

Check the status for:

- the selected run;
- the current gate or internal step;
- permitted and forbidden actions;
- the blocker or open finding;
- the missing approval or evidence;
- exactly one next permitted step.

A finding is routed back to its responsible owner. It must not simply be overwritten at a later
gate. If the agent cannot name a concrete next step, request an AGDF gate check for the explicitly
named run.

## Version or package errors

A source test, installed plugin and public bundle provide different kinds of evidence. For version
errors, the canonical definition, packages, generated manifests and published artefacts must agree.
Do not change only a derived file and then claim that everything is consistent.

Run the documented integrity and package checks. Keep failed or unperformed host checks visible.

Back to the [handbook index](README.md).
