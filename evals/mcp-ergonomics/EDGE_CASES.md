# Codex MCP edge observations

`edge-tasks.v1.json` is separate from the historical six-task comparison and the
existing T7/Run-model qualification. It does not qualify a host or release.
The eight frozen scenarios contain six edge cases and two positive controls.
The confirmation cohort runs three fresh sessions per scenario, using Codex CLI,
`gpt-6-luna`, high reasoning and an existing ChatGPT login. No API credentials,
plugin installation or account/configuration changes are part of this runner.

Run model-free references before native observations:

```sh
node --test evals/mcp-ergonomics/test/edge.test.mjs
node evals/scripts/run-codex-mcp-edges.mjs /private/tmp/new-edge-preflight preflight
node evals/scripts/run-codex-mcp-edges.mjs /private/tmp/new-edge-diagnostic diagnostic
node evals/scripts/run-codex-mcp-edges.mjs /private/tmp/new-edge-confirmation confirm
# A changed candidate can first receive a declared subset confirmation:
node evals/scripts/run-codex-mcp-edges.mjs /private/tmp/new-edge-subset confirm E4,E6,P2
# Separate frontend mode; does not replace the original E4 agent-message test:
node evals/scripts/run-codex-mcp-edges.mjs /private/tmp/new-renderer confirm E4R
```

Output directories must be new, external directories. The macOS-only execution
guard denies writes to the owning repository and personal Codex settings. Run
the outer command without another OS sandbox so the single combined policy can
be applied; its actual denial and an owned positive-write control are checked
before any model invocation. The model only has the disposable MCP surface.

Diagnostic mode reserves eight sessions; confirmation reserves 24. Each session
has a 300-second limit and a 64 MiB output limit. The whole cohort has the sum of
its session limits plus two minutes. A changed candidate requires a new output
directory/cohort. Never overwrite failed attempts or rerun unchanged failures
until they happen to pass. Freeze prompts, graders and source before launching.
Subset runs explicitly carry `full_suite: false`; they cannot qualify the entire
matrix. Document text pages are bounded to 8 KiB, with the same immutable cursor,
digest, selection and UTF-8 validation. Full-text requests ask the host to show
each page before fetching the next one.

Fixtures contain synthetic intent and approvals. The revision race injects a real
canonical evidence write after the first status has been evaluated, before its
old response reaches the model. The lost-ack transport withholds the actual
accepted approval response; the client times out after 15 seconds. The private
fault journal proves the effect but is never included in the prompt. Canonical
server guards and approval checks remain unchanged.

Results distinguish task completion, protection and friction. A safe revision
preflight stop is different from an observed stale-write rejection. For a lost
acknowledgement, a matched original receipt proves recovery; an identical replay
is measured separately. One canonical approval effect is required. Document
grading checks exact bindings, digests, Unicode byte continuity, all pages and
complete delivery of the explicitly selected historical snapshot in actual agent
messages (including ordered pages across messages). Tool output and a claim of
having shown the text cannot satisfy delivery. Positive
controls must pass: universal refusal cannot satisfy the suite.
An unchanged target with no attempted write is safe even when a positive task
was not completed. That distinction never turns a refused positive task green.

The CLI context records that `crypto` is unavailable. The wrapper auditor admits
the complete, self-contained UUID-v4 replace idiom and data-only numeric
primitives (`Math.random()`, `Math.floor` of a proven numeric expression, numeric
hex conversion). Indexed-hex UUID builders use the same numeric proof. Objects
and strings are never coerced through these calls. This does not grant general Math access, imports,
arbitrary methods, tool calls, prototype access or write authority. Negative
counterexamples remain mandatory; a failed crypto call remains a failed call.

Keep raw events, exact rollout identity, prompts, source hashes, runtime identity,
fault journals, final replies and disposable control snapshots in the output.
These are local native observations on an assembled candidate, not evidence that
an installed plugin or another operating system was tested. Small cohorts do not
establish a general reliability rate.

`E4R` is opt-in and separate from the original eight cases. It uses the production
`agdf render-document` terminal frontend, consuming actual Codex JSONL, with only
`agdf_inspect` enabled for the model. It requires a completed native turn and
exact stdout bytes for the explicitly selected historical document. The renderer
independently validates the canonical envelope, both MCP channels, matched runtime,
all bindings, contiguous UTF-8 ranges and whole-document SHA256 before writing.
Identical duplicate reads are counted as friction and never duplicate output.
Missing pages, changed bindings, write tools and terminal control characters fail
closed. The renderer never reads the document body from disk or records approval.
Its receipt proves stdout bytes written, not model-agent delivery or human review.
The original E4 prompt, predicate and failed observations remain unchanged.
The renderer observer additionally proves literal `throw new Error("message")`
guards and zero-argument isolate `exit()` statements. That opt-in profile permits
neither Error/exit extraction or shadowing nor additional tools, imports or calls;
the historical wrapper profile is unchanged. Read only progress metadata back
into model context; the frontend receives the complete original MCP frames.
The final task uses the product's metadata-only `render-document --request`
generator, including original selectors, a literal tool call, the correct
`structuredContent.report` path and a bounded complete read loop. Dynamic tool
dispatch remains rejected; earlier failed raw grades are retained unchanged.
