# Native reconnection after user continuation

- Date: 2026-10-06
- Run: agdf-cockpit-mcp-app-20261005-01
- Observed control revision: 41 / 04c5de34-190e-48a4-a745-117d9d42b2c4
- Actual native invocation: agdf_cockpit({run_id: "agdf-cockpit-mcp-app-20261005-01"}).
- Outcome: the host call now returns schema_version 1, authorizes false and exact bound target sha256:a5c1daee7886f81d27b2b7718718fa7a3822b27a4bc1d057f99af01be7688a19. This invocation did not return Transport closed. This is current invocation evidence, not proof of native visual layout or navigation.
- Local prepared identity read back: server c593b914c276f7dbe1eb089312d8fa0ab0c45636ace3e88590bfb7a0a586825b; UI sha256:47270f91722834ddad9bfabd66d54a2b7777f471d9419761415e1a4e96e5c800, 995531 bytes. Loaded native resource identity is not yet independently observed.
- Native UI automation: the supported MCP Apps side-panel tab list is empty. Inline apps are not available to this automation backend; the user has been asked once to expand the just-opened app. No native app controls or undocumented bridge were used to bypass that access boundary.
- T-006: still partial, pending current named-Run display/document/return and loaded identity evidence. Historical accepted synthetic question remains historical; no automatic repeat was sent.
- Next: inspect the current app after user expansion, record actual results, then continue dependent T-007 onward only if the checkpoint passes.
- Lifecycle remains active for explicitly requested regular completion; no completion, QA/UAT or release inferred.
