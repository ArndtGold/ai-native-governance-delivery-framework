# User Requirement: Reliable npm Bootstrap Readiness

## Status

- status: pending_approval
- approval: Approval: UR was provided before durable artefact creation; post-artefact confirmation required
- owner: agent

## Problem

Immediately after an AGDF release, `npx --yes @agdf/cli@latest codex` and the equivalent
`copilot`, `claude`, and other bootstrap commands can receive stale npm package metadata
and fail with `ETARGET`, even though the release has been published.

## Objective

Make AGDF release readiness robust enough that the existing public bootstrap commands remain
unchanged and a fresh user can resolve and execute the released package after publication.

## Non-Negotiable Interface

The public commands must remain exactly as documented, including:

```text
npx --yes @agdf/cli@latest codex
npx --yes @agdf/cli@latest copilot
npx --yes @agdf/cli@latest claude
```

No additional npm flags, parameters, alternate command syntax, or user-side cache commands
may be required.

## Acceptance Criteria

1. The release workflow verifies both published packages from a clean npm client context
   before release readiness is reported.
2. The workflow verifies the exact release version and the `latest` dist-tag through the
   real npm registry with bounded retries and actionable failure output.
3. A clean bootstrap smoke test executes the unchanged documented command shape and verifies
   the expected repository or plugin output without modifying a real user configuration.
4. All generated help, README, installation documentation, and website examples preserve
   the unchanged public command shape.
5. Focused tests prevent future changes from adding flags or alternate syntax to the public
   bootstrap commands.

## Scope

- In scope: npm release sequencing/readiness verification, clean-client bootstrap smoke
  coverage, and consistency checks for public command examples.
- Out of scope: changing npm, changing Codex/Claude/Copilot command syntax, adding user-side
  retry or cache instructions, changing package names, or altering repository-owned AGDF state.

## Risks

- npm registry and CDN propagation are external and eventually consistent; readiness checks
  must be bounded and must report the observed package/tag state.
- A clean CI client does not reproduce every user's stale local cache, so the implementation
  must remove the release-side race without promising control over arbitrary local caches.
