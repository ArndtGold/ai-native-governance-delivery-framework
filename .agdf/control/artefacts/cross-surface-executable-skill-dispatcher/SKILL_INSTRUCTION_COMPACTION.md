# Skill Instruction Compaction: Cross-surface Executable Skill Dispatcher

Status: done
Date: 2026-09-04
Baseline: canonical `plugin/skills/*/SKILL.md` at `c83d4e1b22b714c4f206dc3cc58b9aae65b94d2f`

## Measurement

| Skill | Before bytes | After bytes | Reduction |
|---|---:|---:|---:|
| `brownfield-analysis` | 10713 | 10626 | 87 |
| `clean-implementation-review` | 5130 | 5051 | 79 |
| `code-review` | 5114 | 5016 | 98 |
| `delivery-closeout` | 4821 | 4729 | 92 |
| `delivery-path-search` | 5603 | 5514 | 89 |
| `gate-check` | 19425 | 19403 | 22 |
| `qa-gate` | 7936 | 7834 | 102 |
| `release-or` | 7548 | 7449 | 99 |
| `task-plan-review` | 5884 | 5791 | 93 |
| `ux-intent-definition` | 5058 | 4898 | 160 |
| **Total** | **77232** | **76311** | **921** |

The static canonical instructions are 921 bytes smaller, approximately 230 tokens by the coarse
four-bytes-per-token estimate. The larger runtime saving is conditional loading: the normal
dispatcher path no longer asks each judgement skill to load the 40,430-byte, 636-line combined
`task-target-resolution.md` and `interaction.md` contracts before target resolution. Those owners
remain available only for a declared `instruction_only` fallback.

## Retained Semantics

- Every skill has exactly one `Executable Dispatch` block and names its canonical `--skill` value.
- `terminal: true` returns the canonical presentation verbatim, uses recovery only when presentation
  is absent and stops before downstream work.
- Judgement skills continue only with the returned target and control packet.
- Missing bindings report `dispatcher_unavailable`; skills do not search for another runtime.
- Dispatch remains non-authorizing. Skill-specific judgement, evidence, quality, gate and approval
  rules remain in their canonical owners.
- `instruction_only` retains explicit target and interaction contract access without claiming
  executable conformance.

## Evidence

- Runtime Integrity validates exactly one block, binding phrases, canonical skill id, terminality,
  localized-presentation preference, non-authority and fallback completeness for all ten skills.
- Agent Skills conformance passes for source and four generated surfaces.
- Deterministic Skill Evals pass 83/83 after behavior-owner fingerprints were refreshed.
- Copilot payload is measured at 84 files and 630,216 bytes; any further growth still fails closed.

## Evidence Boundary

This proves repository, generated-profile and deterministic semantic consistency. It does not prove
that Copilot, Codex, Claude Code or OpenCode invokes the binding promptly in a freshly restarted host.

