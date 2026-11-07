---
language: en
chapter_role: troubleshooting
translation_of: ../de/06-fehlerbehebung.md
source_revision: sha256:92554dcd9a05e10992b5f5914087e60f1c6bf2b04db0b26408fc797b8161e6f4
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
node -p "require('./packages/cli/distribution/agdf/package.json').version"
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

Only the explicit `run-folders-v1` layout and Run version 4 are supported.
Unsupported layouts, versions and old records remain unchanged. There is no migration,
conversion, reset or legacy projection. Preserve those files and select a fresh current
target for new work. Inspect the selected current Run with `doctor --run <run_id> --json`
and `gate-check --run <run_id> --json`. These commands do not repair or approve anything.

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

## The next tool call fails

Ask the agent to identify the last call actually submitted and its response. The appropriate
recovery depends on the boundary involved:

| Observation | Next step |
|---|---|
| The host cannot execute the calling code or resolve the tool name. | Correct the call and its registered host entry point. This failure does not prove that MCP is unavailable. Earlier successful calls in the same sequence still count. |
| An offered reference is unknown or expired. | Use the reported recovery path for that exact project and run. Do not substitute the target, revision or identifiers. |
| Content validation identifies a missing or contradictory section. | Correct the specific finding through the offered authoring path, then validate and present the new revision. A justified rejection demonstrates working validation. |
| The outcome of a write attempt is unclear. | First inspect the original operation and its stored receipt. A missing continuation response alone does not justify a new write. |

Long documents must be passed as text data. When an agent inserts Markdown into its own calling
code, document characters can break the call before the intended AGDF action is reached.
Additional domain explanations do not repair that integration failure. The
[MCP integration guidelines](../../architecture/09-mcp-integrationsrichtlinien.md) describe the
responsible technical checks and remaining limits.

Report the submitted call, observed response, project/run and version together. A model's error
explanation alone does not replace this trace. The
[documented test example](../../development/native-authoring-recovery-2026-11-05.md#completed-resumption-campaign-on-2026-11-06)
shows why functional completion and error-free execution are reported separately.

## Version or package errors

A source test, installed plugin and public bundle provide different kinds of evidence. For version
errors, the canonical definition, packages, generated manifests and published artefacts must agree.
Do not change only a derived file and then claim that everything is consistent.

Run the documented integrity and package checks. Keep failed or unperformed host checks visible.

Back to the [handbook index](README.md).
