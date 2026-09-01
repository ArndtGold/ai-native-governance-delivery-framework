# AGDF Release Process

AGDF releases are coupled across the repository packages and public surfaces.
Use one version and one release tag for the whole release.

## Release scope

A release includes:

- `create-agdf`
- `@agdf/cli`
- AGDF plugin manifests
- website package metadata
- generated package assets produced during package build

The `@agdf/cli` package depends on the matching `create-agdf` version and
delegates command execution through the shared `create-agdf/cli` export.

## Prepare a version

From the repository root, run:

```bash
npm run set-version -- <version>
```

The script updates the coupled package, plugin, site and OpenAI submission-source versions. It also
checks that `create-agdf@<version>` and `@agdf/cli@<version>` are not already published.

Run the validation printed by the script before tagging:

```bash
npm --prefix create-agdf run smoke-test
npm --prefix agdf run smoke-test
node plugin/scripts/check-runtime-integrity.mjs
npm --prefix pages run build
```

Before preparing or tagging every release, append its exact version to
`plugin/meta/distribution-profile-history.json`. Reuse an existing contract only when the complete
`distributionProfiles` object is identical; otherwise add a new contract. Recompute both digests,
retain every previously supported record unchanged and run `release:prepare` to verify the source,
generated package copies and exact local release-tag lineage. Never infer a record from an
incoherent tag (notably `agdf-v0.14.0`), delete a record as implicit deprecation or use a range.
Retirement requires a separately reviewed compatibility design.

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

The publish workflow reports release readiness only after it verifies both exact
package versions and that `@agdf/cli@latest` resolves to the same release version.
It then runs a disposable clean-client bootstrap smoke test using the documented
command shape. These checks are maintainer/CI evidence; they do not add flags or
parameters to the public bootstrap commands.

## Do not use legacy split tags

Do not use separate package release tags such as:

- `create-agdf-v<version>`
- `agdf-cli-v<version>`

Those tags can start independent workflows in parallel and reintroduce the
registry visibility race that the sequenced release workflow avoids.
