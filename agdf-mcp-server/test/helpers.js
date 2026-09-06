import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";

export const SERVER_COMMAND = process.execPath;
export const SERVER_ARGS = [new URL("./stdio-entry.js", import.meta.url).pathname];

export async function withStdioClient({
  modern = false,
  command = SERVER_COMMAND,
  args = SERVER_ARGS,
  cwd = new URL("..", import.meta.url).pathname,
} = {}, callback) {
  const transport = new StdioClientTransport({
    command,
    args,
    cwd,
    stderr: "pipe",
  });
  let stderr = "";
  transport.stderr.on("data", (chunk) => { stderr += chunk; });
  const options = modern ? { versionNegotiation: { mode: { pin: "2026-07-28" } } } : {};
  const client = new Client({ name: "agdf-mcp-test", version: "1.0.0" }, options);
  try {
    await client.connect(transport);
    await callback(client);
    assert.equal(stderr, "", "STDERR must remain empty during a successful protocol exchange");
  } catch (error) {
    if (stderr) error.message = `${error.message}; server stderr: ${stderr.trim()}`;
    throw error;
  } finally {
    await client.close().catch(() => {});
  }
}

export const unresolvedArguments = Object.freeze({
  skill_id: "gate-check",
  presentation_language: "de",
  working_directory: "/tmp",
});
