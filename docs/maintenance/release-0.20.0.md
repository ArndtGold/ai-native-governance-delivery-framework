# AGDF 0.20.0: Desktop scope and evidence handoff

This is candidate preparation, not a publication announcement. Canonical hostSupport schema 2 in
plugins/agdf/meta/agdf-plugin.definition.json owns release scope. Existing generators derive the
optional Codex CLI policy; one 0.20.0 version line remains shared by all integrations.

| Surface | 0.20.0 treatment | Current evidence and limit |
|---|---|---|
| Codex Desktop | Mandatory release target: session, upgrade, recovery | Maintainer reports all three manual checks passed; actual OS/app/model/session/candidate and primary captures remain unverified |
| Claude Desktop | Mandatory Windows release target: session, upgrade, recovery | Same reported manual passes; actual Desktop identity/candidate/captures remain unverified; CLI identity is separate |
| Claude CLI Windows | Separate retained evidence | Five validator-accepted cases on original candidate 830d8b94; review/import/applicability remain distinct from current Desktop qualification |
| Codex CLI macOS | Diagnostic only | Earlier dirty-candidate observations; no current or other-OS qualification |
| Codex CLI Windows/Linux | **Unqualified**, outside mandatory matrix | Optional pinned native probes retained; ordinary platform regression tests remain required |
| Copilot / OpenCode | **Experimental** | Adapters and regression tests retained; no native qualification claimed |

The maintainer's original handcheck statement is preserved with the reported input under
evals/host-compatibility/native/reported/desktop-handchecks-20261022/. Recording date is not execution
date. Unknown identities stay unknown. The generated compatibility report distinguishes these
human_reported assertions from candidate-bound operator_observed native records. Reports have zero
qualified coverage. No CLI result, protocol test or green OS build qualifies another surface.

## Prepare and freeze the candidate

Use the existing locked preparation and verification order:

```sh
npm run build:prepare
npm --prefix packages/mcp-server ci --ignore-scripts
npm run compatibility:record
npm run compatibility:check
npm run build
npm --prefix packages/cli run release:prepare
npm run verify:ci
node scripts/native-probes/release-evidence.mjs candidate --output .release-candidate.json
```

Source, policy, probe, lock or shipped changes invalidate identity; only fixed evidence-output classes
are excluded. Use a clean prepared source/export for release-grade evidence. Do not remove foreign or
ignored daily host settings to manufacture a clean checkout. No staging, commit, tag or publication
is performed by these commands.

Recover original Desktop facts first. Reuse only matching candidate/tuple evidence; a changed policy
is a different candidate and old records are never relabelled. Identify concrete remaining facts and
justify targeted verification only where originals cannot establish them. There is no blanket request
to repeat all previously reported handchecks.

```sh
node scripts/native-probes/release-evidence.mjs handoff --candidate .release-candidate.json --output probe-results/desktop-0200-handoff
```

The handoff describes both required Desktop targets. Authentication stays on each executor. It
neither contacts the other computer nor assumes Desktop shares the CLI's profile/isolation/payload.
Use a verified host-supported test scope or dedicated environment; missing safe access is a blocker.

## Actual Desktop identity and templates

Run preflight on the actual Desktop executor with observed app/model/version evidence, not example
values or the CLI version. The native version-evidence JSON supplies the exact host, surface, os,
arch, version, node and model tuple; the helper process version/architecture is not substituted. Claude Desktop preflight runs on native Windows; Codex Desktop records
its actual OS, without claiming other OS support.

```sh
node scripts/native-probes/release-evidence.mjs preflight --candidate .release-candidate.json --host codex --surface desktop-code --model ACTUAL_MODEL --version ACTUAL_APP_VERSION --version-evidence PATH_TO_NATIVE_VERSION_CAPTURE --output probe-results/codex-desktop-tuple.json
node scripts/native-probes/release-evidence.mjs desktop-template --candidate .release-candidate.json --tuple probe-results/codex-desktop-tuple.json --scenario session --output probe-results/desktop-session.json
```

Use --host claude for the separate Windows Desktop preflight. Create session, upgrade and recovery
templates for each host. Templates are unverified; they are never completed by copying this guide or
converting the human report into synthetic traces.

Qualified Desktop schema-3 records carry kind qualified_desktop, operator_observed assurance, exact
candidate/policy/source/loaded identity, environment/tuple digest, session, case/result and hashed
contained references. They require an app-identifying PNG, JPEG or WebP capture (checked by its file
signature) and desktop-primary.json with matching scenario/session/environment/candidate/loaded
identity, coding_surface code, fresh_session true and a named owned test scope. Session, upgrade and
recovery each use their own fresh Desktop session per host; an upgrade record carries no repair.
Each host review locks exactly the one tuple of its own host and surface. Native installation/discovery/cleanup diagnostics identify effective payload,
deliberate consent, plugin discovery and actual absence of owned leftovers. Session calls include
dispatch, failure_case and skill_continuation; transition cases include fresh dispatch. Each call
retains its native Codex Desktop session rollout in rollouts or, for Claude Desktop, the unmodified
lines of its Desktop session transcript in stdout, with actual model, non-authorizing result and
verified contract content/digests. A Codex rollout has one session_meta id equal to the record's
session_id and no exec or cli session source; `codex exec` also reports originator Codex Desktop, so
the source decides. Claude Desktop lines carry entrypoint claude-desktop and one sessionId equal to
the record's session_id; a CLI stream-json init event or sidechain is rejected. See the strict
checks in release-observation.mjs.
Booleans, generic chat, a screenshot alone or a separately successful CLI trace cannot satisfy them.

Upgrade/recovery requires the actually released 0.14.5 baseline and integrity/source digest,
supported owned-state action, fresh effective candidate, foreign-state and permission preservation,
and cleanup. Recovery must use the supported owned_stale_install path. Keep actual failed attempts
and stop on unknown ownership or unsupported repair; never broaden cache deletion or permissions.

Hashes prove content integrity, not independent execution truth or operator authenticity. Review
actual native material and retain operator assurance. Redact credentials and unrelated private data;
return only the records and their bounded referenced files, not complete profiles or transcripts.

## Reviewed scoped import and full eligibility

A reviewer inspects original identity, primary observations, capability checks, baseline, preservation
and cleanup, then completes the exact tuple/bundle review. Templates start reviewed false. This is
cooperative evidence review and grants no AGDF gate approval.

```sh
node scripts/native-probes/release-evidence.mjs review-template --candidate .release-candidate.json --bundle probe-results/codex-desktop --output probe-results/codex-review.json
node scripts/native-probes/release-evidence.mjs import --candidate .release-candidate.json --host codex --surface desktop-code --bundle probe-results/codex-desktop --review probe-results/codex-review.json
```

Repeat the scoped import for Claude Desktop. Imports are immutable, copy only validated references,
reject unsafe/mixed/duplicate/failed records and roll back only their owned output. Native records live
under evals/host-compatibility/native/<candidate>/<host>/desktop-code/ with their review.json.
Optional CLI ingestion is explicit and cannot satisfy Desktop coverage. Historical schema-2 CLI
records retain original policy/tuple/candidate semantics.

The common validate command always requires both Desktop targets under policy schema 2, including
its default route. The publication path additionally rejects legacy policy:

```sh
node scripts/native-probes/release-evidence.mjs validate --candidate .release-candidate.json --directory evals/host-compatibility/native/CANDIDATE_ID --all-hosts
npm run compatibility:record
npm run compatibility:check
```

All npm publication paths depend on complete reviewed Desktop evidence, normal verification and the
existing tag/version/registry/credential/integrity controls. Missing exact Desktop binding keeps
qualification and publication blocked. Existing CI timeouts and all ordinary test commands remain.

Preparation, native qualification, current QA, deliberate human UAT/OR, an authorized VCS handoff and
publication remain separate. A documented manual pass or a successful validator fixture is no release
authorization. Embedded MCP Apps, hook trust/execution and other capabilities need their own proof.
