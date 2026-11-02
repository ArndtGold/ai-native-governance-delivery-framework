# Compatibility Evidence

Status: open finding; not final T-011 qualification.

- Default MCP tools/protocol tests passed; cockpit resource capability is opt-in only.
- Separate project connection compatibility regression passed; targeted Codex package-assets owner ran successfully.
- First full asset synchronization reported Copilot payload-budget failure: observed 208 files / 1,732,014 bytes against baseline 203 files / 1,716,129 bytes. This was the first intermediate source state; later source changes have not been measured with a fresh full profile.
- The canonical Copilot baseline was not increased. Targeted Codex assembly is not proof that full cross-host compatibility passed.
- Remaining owner: T-011 implementing/review agent must measure current complete payload, correct propagation/scope or route an evidenced policy decision, and run required compatibility checks.
- This payload finding is distinct from the actual host Transport closed error; no causal link is claimed.
