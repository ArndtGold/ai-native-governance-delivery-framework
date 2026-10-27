# Development verification reference

[CONTRIBUTING.md](../../CONTRIBUTING.md#verify-the-change-proportionately) explains when to run
checks. The [Quality Contract](../../plugins/agdf/meta/contracts/quality.md) owns shared quality
rules. This page explains existing commands and prerequisites; it adds no universal local test
requirement. Canonical npm scripts, [verify-ci.mjs](../../scripts/verify-ci.mjs) and
[ci-plan.mjs](../../scripts/ci-plan.mjs) define what the commands actually execute.

## Prepare only what the selected checks need

Node.js 22 or later is the local baseline. Install repository dependencies when needed:

```bash
npm ci --ignore-scripts
```

Some checks read source only; others import generated resources or test assembled packages.
For the latter, the normal checked preparation is:

```bash
npm run build
npm --prefix packages/cli run release:prepare
```

The build installs the separate Control UI lock and builds MCP resources before generating
profiles. It checks source/generated gate contracts, deterministic skill evaluations and current
compatibility evidence before assembly. A failed stage stops the command; it never refreshes
evidence automatically. Package assembly and profile ownership are described in
[Package structure](../architecture/05-paketstruktur.md#build-und-normale-npm-archive).

Checks that use the MCP SDK also need its separate lockfile installation after the CLI payload
has been prepared:

```bash
npm --prefix packages/mcp-server ci --ignore-scripts
```

That development lock packs `file:../cli`; installing it before the generated CLI payload exists
does not provide a valid full-source fixture environment. Reuse unchanged prepared inputs when
they remain applicable to the selected checks.

## Build, prepare and full verification

| Command | Purpose and boundary |
|---|---|
| `npm run build` | Checked source generation and assembly; stops on stale evidence or failed build checks. |
| `npm run build:prepare` | Produce a candidate for evidence review/recording when the checked build is blocked by stale evidence; not a successful checked build. |
| `npm run verify:ci` | Execute the full ordered repository verification plan in the current working copy. |
| `npm run verify:commit` | Export the staged index into an isolated checkout and execute the full plan. Untracked files, installed dependencies and ignored assets cannot repair that snapshot. |
| `npm run verify:commit -- --ref HEAD` | Execute the same full isolated plan for the exact selected commit. |

Use one full snapshot command when its result is needed, rather than routinely checking both
index and commit. The full plan installs locked dependencies, prepares payloads, checks contracts
and evidence, tests the actual archives, runs smoke suites and checks Pages. The source checkout
and index remain unchanged. Results apply only to the selected sources and local Node/OS.
Required CI results and native host observations retain their own evidence boundaries.

## Updating the MCP SDK

`packages/mcp-server/package-lock.json` is the reviewed SDK tree shipped with the Codex/Claude
plugin. `packages/mcp-server/sdk-runtime-digest.json` records its expected digest. After changing
the SDK version or lock, prepare the CLI payload as above, then use:

```bash
npm --prefix packages/mcp-server ci --ignore-scripts
npm run mcp:sdk-digest
npm run build
npm --prefix packages/mcp-server run test:sdk-digest
```

Commit the lock and digest together. Do not edit the digest by hand. The build verifies that
its package list matches the lock; the targeted test compares it with the installed tree.

## Refreshing compatibility evidence

For `source_snapshot_changed`, inspect the changed owners and the applicability of existing
observations first. Prepare the candidate without claiming a checked build:

```bash
npm run build:prepare
```

With the MCP dependencies available, use the existing recorder and check:

```bash
npm run compatibility:record
npm run compatibility:check
```

Review the generated report, snapshot, facts and new immutable observation JSON together.
Commit them together when the refresh is needed for the contribution. Other evidence errors
require their diagnosed repair, not automatic recording. After the refresh, `npm run build`
can establish the checked build result; preparation alone cannot.

The recorder exercises adapter fixtures and retains existing reviewed native inputs; it does
not start new native agent sessions or establish fresh host compatibility or human UAT.
Runtime-selected imports require exact `dynamic_imports` entries in
[`evals/host-compatibility/manifest.json`](../../evals/host-compatibility/manifest.json); unknown
or changed bindings must be reviewed instead of omitted from the source snapshot.

The [compatibility-evidence workflow](../../.github/workflows/host-compatibility-evidence.yml)
also refreshes stale evidence on `main` and can be started manually there. It uses the same
preparation/recording owners and opens an evidence PR when configured repository permissions
allow it. Review that PR normally; generated fixture results do not grant native qualification.
Automatic PR creation requires the repository setting **Allow GitHub Actions to create and
approve pull requests**. The workflow uses its existing `GITHUB_TOKEN`; it does not need a new
secret. Enabling that repository permission is a separate maintainer action.

## Inspect or reproduce CI work

The [Guardrails caller](../../.github/workflows/agdf-guardrails.yml) and
[reusable workflow](../../.github/workflows/verify-agdf.yml) use the canonical planner and
verification stages. The matrix retains the required test inventory in each applicable
platform/Node lane. Local success does not establish other lanes.

```bash
node scripts/ci-plan.mjs --matrix true
node scripts/ci-plan.mjs --job linux-22-activation
node scripts/ci-plan.mjs --job linux-22-revision-ur-during-qa
node scripts/ci-plan.mjs --job linux-22-checks-distribution
```

Choose the affected partition from the current planner output. Tests within each group retain
their canonical order and prepare their own platform-specific payloads. The planner expands
compound suites and source/phase cases, groups tests by functional responsibility and balances
only within those areas. It rejects unsupported or oversized work instead of dropping coverage.
[`ci-test-domains.mjs`](../../scripts/ci-test-domains.mjs) supplies functional ownership;
[`ci-duration-baseline.json`](../../scripts/ci-duration-baseline.json) supplies scheduling
estimates, not an additional inventory or proof of current performance.

The workflow groups test areas and repository checks in parallel after planning. Individual
jobs retain their ten-minute ceiling, with partition execution bounded to eight minutes.
Test groups budget at most six estimated minutes, including 50% headroom; preparation and
cleanup have separate reserve. Job summaries and `ci-timings.json` report
command durations, including failures; actual GitHub job timestamps establish total job duration.
Queue time and total workflow duration are separate. A timeout is not a passing result.

For a narrower diagnosis, select an existing npm test script or a stage such as
`node scripts/verify-ci.mjs --stage community`. Ensure its prerequisites are available; a
single stage does not establish that the complete plan passed. Changes to workflow layout,
partitions or budgets need the planner tests; do not weaken assertions or remove inventory.

## Separate validation from installation and release

Repository/adapter checks, package contents, installed-host observations and human acceptance
are distinct evidence classes. Use [INSTALL.md](../../INSTALL.md) for deliberately selected
local-host testing. Use [RELEASE.md](../../RELEASE.md) for candidate qualification, publishing
and propagation checks. Contributor validation does not authorize a host installation or release.
