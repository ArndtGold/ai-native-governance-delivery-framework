# AGDF Release Process

AGDF releases are coupled across the repository packages and public surfaces.
Use one version and one release tag for the whole release.

## Release Scope

A release includes:

- `create-agdf`
- `@agdf/cli`
- AGDF plugin manifests
- website package metadata
- generated package assets produced during package build

The `@agdf/cli` package depends on the matching `create-agdf` version and
delegates command execution through the shared `create-agdf/cli` export.

## Prepare A Version

From the repository root, run:

```bash
npm run set-version -- <version>
```

The script updates the coupled package, plugin and site versions. It also checks
that `create-agdf@<version>` and `@agdf/cli@<version>` are not already published.

Run the validation printed by the script before tagging:

```bash
npm --prefix create-agdf run smoke-test
npm --prefix agdf run smoke-test
node plugin/scripts/check-runtime-integrity.mjs
npm --prefix pages run build
```

## Publish

Commit and push the versioned release changes first. Do not tag unpublished or
uncommitted local changes.

Publish with one tag:

```bash
git tag agdf-v<version>
git push origin agdf-v<version>
```

The `.github/workflows/publish-agdf.yml` workflow validates both packages, then
publishes `create-agdf` first and `@agdf/cli` second in the same workflow run.
This avoids race conditions between package publication and wrapper validation.

The repository secret `NPM_TOKEN` must have publish rights for `create-agdf` and
for the `@agdf` npm organization.

## Do Not Use Legacy Split Tags

Do not use separate package release tags such as:

- `create-agdf-v<version>`
- `agdf-cli-v<version>`

Those tags can start independent workflows in parallel and reintroduce the
registry visibility race that the sequenced release workflow avoids.
