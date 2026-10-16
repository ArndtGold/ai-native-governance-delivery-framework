# CD+Tests: Skip file-symlink negative checks where Windows refuses symlinks

Gate: CD+Tests
Type: CD+Tests
Status: done
Decision: pass

## Result

The four file-symlink fixtures use the shared `tryLinkFile` helper from `scripts/support/symlinks.js`;
only the assertions that need the link run inside the guard, every other assertion is unchanged.

| File | Guarded check |
|---|---|
| `packages/core/test/artifact-readiness-test.js` | symlinked draft is denied (`artifact_read_resource_denied`) |
| `packages/core/test/decision-qualification-test.js` | symlinked evidence is rejected (`qualification_evidence_symlink`) |
| `packages/core/test/presentation-document-test.js` | symlinked presentation snapshot is invalid and blocks approval |
| `packages/cli/scripts/compact-continuation-test.js` | symlinked UR yields `evaluator_error` |

## Evidence

- `node` on each of the four files: pass, each printing one `SKIPPED file-symlink assertions` notice (EPERM on this Windows host).
- `npm run test:skill-dispatch`: pass (1 skip notice).
- `npm run test:control-inspect`: pass (1 skip notice).
- `npm run test:run-command-flow`: pass, 18 of 18 (2 skip notices).
- Environment: Windows 11, Node 22.22.3, inside Claude Desktop (MSIX), no Developer Mode.

## Risk

- On Windows hosts without symlink privilege these four negative checks are skipped visibly; hosts with
  symlinks (Linux CI, Developer Mode) still run them. The helper rethrows any other error and EPERM
  outside Windows.
