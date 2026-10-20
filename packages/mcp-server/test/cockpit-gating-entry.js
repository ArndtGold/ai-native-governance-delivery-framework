import { createTestRuntime } from './runtime-fixture.js';
import { appendFileSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { runMcpServer } from "../src/main.js";
import { COCKPIT_LIMITS, COCKPIT_MIME, COCKPIT_READ_DEFINITION, COCKPIT_RENDER_DEFINITION, COCKPIT_UI_URI } from "../../core/lib/control-inspect/cockpit-contract.js";

// Cockpit-mode server with recording tools: it isolates the capability gate from Core reads.
const [surface, uiDirectory, marker] = process.argv.slice(2);
const plugin = surface === 'codex-plugin';
const version = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version;
const envelope = { schema_version: '1', authorizes: false, target: null, snapshot_id: null, observed_as_of: null, source_digest: null, state: 'available', code: null, retryable: false, data: null };
const tools = [COCKPIT_RENDER_DEFINITION, COCKPIT_READ_DEFINITION].map((definition) => ({
  name: definition.name, definition, parse: (value) => value,
  execute: async () => { appendFileSync(marker, `${definition.name}\n`); return { ...envelope, tool: definition.name }; },
}));
await runMcpServer({ surface, runtime: Object.freeze({
  ...createTestRuntime(surface), mode: "cockpit", definition: COCKPIT_RENDER_DEFINITION, tools, uiCapabilityRequired: plugin || surface === "claude", responseLimit: 8 * 1024 * 1024,
  ui: { uri: COCKPIT_UI_URI, mimeType: COCKPIT_MIME, limit: COCKPIT_LIMITS.html, directory: pathToFileURL(`${uiDirectory}/`) },
  serialize: (value) => JSON.stringify(value), failure: (code) => ({ ...envelope, state: "error", code }),
  close: async () => {}, trustedContext: { surface: plugin ? 'codex' : surface, expectedVersion: version, provenanceStatus: "matched" },
}) });
