# SD: German User Guide for AGDF in Coding Agents

Status: approved
Gate: SD
Gate approval: `Approval: SD` provided on 2026-07-12
Based on: approved PRD and completed Brownfield Review
Date: 2026-07-12
Owner: agent

## 1. Solution Overview

Create one source-owned German Markdown guide cluster at `docs/agenten-handbuch/`:

```text
docs/agenten-handbuch/
├── README.md
├── 01-schnellstart.md
├── 02-gates-und-freigaben.md
├── 03-typische-arbeitsablaeufe.md
├── 04-mehrere-runs.md
├── 05-abschluss-und-auslieferung.md
└── 06-fehlerbehebung.md
```

`README.md` is the navigation and orientation page. Each chapter answers a user task and links to
the existing authoritative documentation where a normative, installation or CLI detail matters. The
root `README.md` receives one entry-point link. A website change is excluded from this slice.

## 2. Ownership And Source Of Truth

| Domain | Owner | Guide treatment |
|---|---|---|
| Framework concepts | `docs/00-07` and glossary | Explain in user language; link for depth |
| Gate semantics and approvals | Runtime Contract and skills | Use short examples; link instead of reproducing a complete rule table |
| Installation and supported surfaces | `INSTALL.md` | Link to the relevant installation section |
| CLI command reference | `agdf/README.md`, `create-agdf/README.md` | Mention only commands needed to orient users; link to reference |
| Durable run-state mechanics | `plugin/control/README.md` | Explain user effects; link to technical details |
| Public guide navigation | root `README.md` and guide `README.md` | This slice owns the links |

## 3. Architecture Decisions

1. The guide is a separate `docs/agenten-handbuch/` cluster; no existing numbered document moves.
2. The guide is German-first and task-oriented. File names stay ASCII and descriptive.
3. The index contains the only chapter navigation; individual chapters use relative links back to it.
4. The existing Banking example is the sole complete structured-delivery scenario. Guide chapters
   link to it and add only the missing user-facing approval and UAT perspective.
5. Normative rules are summarized only when necessary for user action and always point to their
   existing owner.
6. Surface-specific differences are short notes with installation links, not per-surface guide forks.
7. Website exposure is deferred; no second documentation representation is created.

## 4. Integration Points

- Root `README.md`: one guide link in the existing document-reading path.
- Existing `docs/00-07` and glossary: contextual cross-links only.
- `INSTALL.md`, package READMEs and `plugin/control/README.md`: outbound canonical links only.
- No API, data model, generated output, plugin manifest or runtime change.

## 5. Constraints And Compatibility

- Preserve all current public documentation paths.
- Do not claim that ordinary chat intent is an approval.
- Distinguish QA decision, QA approval, UAT approval and delivery authorization.
- Do not prescribe `--run` or `AGDF_RUN_ID` when a single active run is selected automatically.
- Do not turn the guide into a second Runtime Contract, CLI manual or installation guide.

## 6. Test And Evidence Strategy

- Verify all internal and outbound Markdown links.
- Manually read the first-request-to-UAT journey as a newcomer path.
- Search for copied complete approval/gate tables and installation command matrices.
- Run `git diff --check` and the smallest relevant documentation/runtime checks.
- Confirm root README navigation reaches the guide index.

## 7. Risks And Open Questions

- Examples can drift from runtime behavior; canonical links and targeted wording reduce this risk.
- The chapter set may be too broad for one slice; TP should keep chapters concise and preserve a
  single end-to-end journey.
- No website information architecture is designed here; a future website scope must not copy the
  guide body without a source-of-truth decision.

## 8. Next Step

Approved with:

`Approval: SD` provided on 2026-07-12.
