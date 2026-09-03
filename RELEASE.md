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

When advancing to a newer version, the current version must already have its exact local
`agdf-v<current-version>` tag. This prevents an untagged catalogue entry from silently becoming
historical compatibility evidence. A same-version catalogue repair remains possible without that
tag. Fetch the complete tag history before running the command; do not create a tag only to bypass
this check.

The script checks that `create-agdf@<version>` and `@agdf/cli@<version>` are not already published,
then updates the coupled package, plugin, site and OpenAI submission-source versions together with the
exact `plugin/meta/distribution-profile-history.json` release record. Do not edit these release
surfaces individually.

When the complete `distributionProfiles` contract is unchanged, the command reuses its existing
contract automatically. When it changed, the command performs no writes and reports
`profile_history_contract_review_required` with the proposed SHA-256 digest. Review the complete
contract, then deliberately rerun with that exact digest:

```bash
npm run set-version -- <version> --accept-profile-contract-digest <sha256>
```

The command stages and validates every target before replacement and maintains an owned recovery
journal plus exact backups while replacing files. If an earlier invocation was interrupted, the next
invocation restores or completes only that declared transaction and asks you to rerun the command.

Run the validation printed by the script before tagging:

```bash
npm --prefix create-agdf run smoke-test
npm --prefix agdf run smoke-test
node plugin/scripts/check-runtime-integrity.mjs
npm --prefix pages run build
```

`release:prepare` verifies the automatic snapshot, generated package copies and exact local
release-tag lineage. The exact current source version may be validated before its tag exists. Every
historical supported release still requires its immutable exact tag, and a present current tag must
also match. Never infer a record from an incoherent tag (notably `agdf-v0.14.0`), delete a record as
implicit deprecation or use a range. Retirement requires a separately reviewed compatibility design.

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
