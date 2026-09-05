# Codex Hook Observation, 2026-09-05

Run: `installation-consent-runtime-checks`
Scope: SD Revision 3 AD-2/AD-6; TP Revision 2 IRC-07/10/14/16.

## Observations

The original native `hooks/list` probe reported the enabled AGDF SessionStart hook as `modified`.
Its current hash was
`sha256:2bc3e28fe16a0fdf44c2c8f9f9a52f61ad2845f8c7d292ab769add454f343846`;
the saved trust hash was
`sha256:151eeb3425b8fccc04716c2a22ebd8983c31431f91052df9c7c0eb7852bf6292`.
This proves stale native trust, but the old trusted hook definition was not recovered.
Do not attribute that old hash to a particular source edit.

Later probes reported the same current hash as `trusted`. The implemented observer was then
executed against both local binaries, using only `initialize`, `initialized` and `hooks/list`:

| Native executable | Version observed in this investigation | Hook enabled | Native trust | Current hash |
|---|---|---|---|---|
| Codex CLI on PATH | 0.145.0 | true | trusted | `2bc3e28fe16a0fdf44c2c8f9f9a52f61ad2845f8c7d292ab769add454f343846` |
| `/Applications/ChatGPT.app/Contents/Resources/codex` | 0.153.4 | true | trusted | `2bc3e28fe16a0fdf44c2c8f9f9a52f61ad2845f8c7d292ab769add454f343846` |

Hook key: `agdf@agdf:hooks/hooks.json:session_start:0:0`.
Observed installed root: `/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.14.5`.
The earlier `0.14.5+codex.local-3f17b01eff82` plugin root produced this same native hash.
The hypothesis that the plugin cache-root change alone invalidated trust is not supported.
The hook command and trust store were therefore left unchanged by this correction.

The observer's projection of these metadata reports is `hook_trusted_session_unverified`.
The projection was tested with an explicit pending-state input; this is not a claim about the
currently installed AGDF receipt or successful automatic execution.

## Evidence And Limits

- Native output from the implemented observer:
  `/private/tmp/agdf-codex-hook-fix-native-verification.json`.
- Earlier hash and binary comparison:
  `/private/tmp/agdf-native-hook-hash-probe.json` and
  `/private/tmp/agdf-hook-cli-app-comparison.json`.
- Original diagnosis: `/private/tmp/agdf-hook-diagnosis-01a070cc/`.
- Protocol fixtures cover modified, untrusted, disabled, trusted, managed, missing, ambiguous,
  malformed and failed native responses, fragmented output, timeout, output limits and cleanup.
- CLI fixtures cover install completion, the narrow runtime-check status command and general
  status. They prove rendered CLI output, not a restarted desktop session.
- No trust write, reinstall, hook execution or native task creation was performed for the probe.
- The implementation exists in this checkout. It has not been installed into the user's plugin.
- Existing-task context refresh, the revised installed installer UI and the complete
  enabled/change/disable cycle remain unverified. Native Windows and the other outstanding
  host-matrix cells remain under `TPR-01`.

## Prevention

Use native metadata before requesting hook approval. Review a modified/untrusted definition in
Codex `/hooks`; preserve existing trust when Codex already recognizes the enabled hook. Fully
restart Codex and open a fresh task after installation or an update. Unsupported observation must
remain explicit. Genuine native definition changes still require review; AGDF must never suppress
that review or replace the native trust hash.
