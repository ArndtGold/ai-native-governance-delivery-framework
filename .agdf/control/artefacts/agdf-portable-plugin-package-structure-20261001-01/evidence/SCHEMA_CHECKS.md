# Schema verification

Pinned draft-2020-12 snapshots and strict Ajv 8.20.0 pass valid plugin/MCP fixtures; unsupported root fields, missing transport type and reserved environment mutations fail. Missing schema callback blocks readiness. Exact bytes: SCHEMA_INPUTS.json; executable assertions: create-agdf/scripts/portable-plugin-test.js; result: [portable log](workspace-create-agdf-test-portable-plugin.log).
