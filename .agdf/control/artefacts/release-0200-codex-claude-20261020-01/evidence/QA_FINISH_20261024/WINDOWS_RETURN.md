# Final Windows return package — 2026-10-24

The maintainer has accepted the missing Windows review/import as a residual evidence gap.
The instructions below are retained for a later actual import claim; no Windows action is claimed
or required to pretend that this gap is closed. Local canonical verification now passes all 27
stages and the complete reviewed ten-case matrix validator passes read-only. Current technical
QA is revise with a bounded internal-handoff deviation proposal; human QA acceptance is pending.
This package grants no commit, push, import, publication or changed-source qualification.

The final source correction requires its own clean candidate and applicable CI/native evidence
before publication. Preserve the original candidate identity and all original native bytes.

---

# Windows return: candidate 8e2b8699

The original tar.gz and all five completed native records are unchanged. This transfer package adds
an agent primary-capture review, the local producer/validator/test correction and its Code/Clean
review inputs. It does not claim a Windows review, import, human acceptance or release approval.

Original archive SHA-256:
2d9798679652f8bf80acd529496e4b0f09fdb35cb3b73ca1382c82f89241ea36

The archive contains 20 /Users/ path strings in 16 files. The performed scan found no token-like
secrets or email addresses, and no work-tmp, auth.json or configuration directory. Do not edit
records to redact these strings or to fill in the omitted authorizes summary field.

On the Windows computer:

1. Copy/extract this transfer package into C:\Workspace\agdf-native-returns\. Check MANIFEST.json
   and the original tar.gz SHA-256, then unpack the original archive into its own directory.
2. Review the primary captures and CODEX_PRIMARY_REVIEW.json. CODEX_BUNDLE_REVIEW.json locks the
   original record digest/tuple and names the actual agent reviewer; it is not human acceptance.
3. Apply codex-import-blocker.patch to a separate tooling checkout, not the clean candidate source
   checkout. No commit or push is implied. Install that checkout's locked dependencies as needed.
4. Run the corrected tool with the working directory set to the original clean candidate checkout
   (460027fa, or an evidence-only descendant with the same candidate/payloads). The patched tooling
   checkout and candidate checkout must remain distinct, otherwise candidate_content_mismatch is
   correct. Candidate source checks and review/tuple/reference checks are retained.

PowerShell outline (replace only the three machine-local directories with their actual locations):

    $ReturnRoot = 'C:\Workspace\agdf-native-returns'
    $ToolRoot = '<separate patched tooling checkout>'
    $CandidateRoot = '<clean original candidate checkout>'
    $BundleRoot = '<directory containing the unpacked original tar.gz>'
    Push-Location $CandidateRoot
    node "$ToolRoot\scripts\native-probes\release-evidence.mjs" import --candidate "$BundleRoot\.release-candidate.json" --bundle "$BundleRoot\probe-results" --review "$ReturnRoot\CODEX_BUNDLE_REVIEW.json" --host codex --surface cli
    Pop-Location

The maintainer has now instructed the agent to finish the open reviews/import without another
question. That instruction does not create Windows access or a gate approval. This chat has no
Windows executor and has not run the import. The current no-commit/no-push instruction remains
in force. An import changes repository evidence; the existing clean-source requirement can prevent
subsequent publication validation until the authorized evidence-only VCS step makes that checkout
clean. Do not bypass cleanliness, relabel candidate 8e2b8699 for the changed source, or repeat native
cases. Refresh the existing compatibility/readiness outputs and run complete reviewed matrix
validation under the appropriate clean snapshot, then renew TP Review and QA.
