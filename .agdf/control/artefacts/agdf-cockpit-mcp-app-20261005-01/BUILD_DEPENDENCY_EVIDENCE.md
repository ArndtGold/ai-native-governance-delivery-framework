# Build and Dependency Evidence

- Date: 2026-10-05
- Status: minimal resource build passed; not host qualification
- Node: /usr/local/Cellar/node@22/22.22.3/bin/node
- Private UI exact dependencies: @modelcontextprotocol/ext-apps 2.0.3; @modelcontextprotocol/client 2.0.0; @modelcontextprotocol/core 2.0.0; zod 4.2.0. Registry version/integrity reads and npm installation succeeded; no version substitution.
- Lock digest: sha256:7715a0a2924773d796ed25fb4707a1ee4fd7de04e77fd5e21b15b42f68cff987
- Type check: passed.
- Build: node packages/control-ui/scripts/build-mcp.mjs passed; single self-contained HTML with inline JS/CSS, no external build asset references.
- UI bytes: 613427; limit: 4 MiB.
- UI digest: sha256:f27559b7b057552331572d46e679adfc61da2e808ecce3b3043d2ca2043ec163
- URI: ui://agdf/cockpit/v1.html
- MIME: text/html;profile=mcp-app
- Core/server SDK dependency resolution uses the existing owned runtime assembler and provenance writer.
- Build does not prove App initialization, usable larger display mode or model-context exchange in Codex.
