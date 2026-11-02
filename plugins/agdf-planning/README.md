# AGDF Planning

Optional planning dialogue for Codex CLI. Requires compatible AGDF Core exposing
`planned-ur-v1` protocol 1 and the existing `ur-definition` owner. Core remains
fully usable without this package. Missing or disabled Core produces a dependency
diagnosis before writing; there is no automatic installation or CLI fallback.

Install explicitly with `create-agdf codex --package planning --plugin-only` after
installing Core. Remove only this extension with
`codex plugin remove agdf-planning@agdf-planning`; Core and project sources remain.

Invoke `$planning` to capture or refine a planned UR and optional priority. Planning
stops at the UR. Starting delivery requires deliberate source-bound handoff, then
ordinary UR review and explicit approval. Only the current explicit `run-folders-v1` layout and version-4 Runs are supported.
Unsupported stores remain unchanged; this package never migrates or resets them.

Sources: this directory owns orchestration and dependency metadata. The shared
repository generator supplies version-matched portable/Codex manifests. No Core
runtime, MCP server, UR template, gate engine or editable inventory is bundled.
Native qualification in this Run targets Codex CLI only; no Desktop or other-host
qualification follows from package or repository tests.
