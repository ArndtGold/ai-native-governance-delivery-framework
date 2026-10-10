import { appendFileSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { runMcpServer } from "../src/main.js";
import { COCKPIT_LIMITS, COCKPIT_MIME, COCKPIT_READ_DEFINITION, COCKPIT_RENDER_DEFINITION, COCKPIT_UI_URI } from "../../core/lib/control-inspect/cockpit-contract.js";

// Cockpit-mode server with recording tools: it isolates the capability gate from Core reads.
const [surface, uiDirectory, marker] = process.argv.slice(2);
const version = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;
const tools = [COCKPIT_RENDER_DEFINITION, COCKPIT_READ_DEFINITION].map((definition) => ({
  name: definition.name, definition, parse: (value) => value,
  execute: async () => { appendFileSync(marker, `${definition.name}\n`); return { schema_version: "1", authorizes: false, tool: definition.name }; },
}));
await runMcpServer({ surface, runtime: Object.freeze({
  mode: "cockpit", definition: COCKPIT_RENDER_DEFINITION, tools, uiCapabilityRequired: surface === "claude", responseLimit: 8 * 1024 * 1024,
  ui: { uri: COCKPIT_UI_URI, mimeType: COCKPIT_MIME, limit: COCKPIT_LIMITS.html, directory: pathToFileURL(`${uiDirectory}/`) },
  serialize: (value) => JSON.stringify(value), failure: (code) => ({ schema_version: "1", authorizes: false, state: "error", code }),
  close: async () => {}, trustedContext: { surface, expectedVersion: version, provenanceStatus: "matched" },
}) });
