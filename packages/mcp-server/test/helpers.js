import assert from "node:assert/strict";
import { Client } from "@modelcontextprotocol/client";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import { fileURLToPath } from "node:url";
import { appendFileSync, mkdirSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";

export const SERVER_COMMAND = process.execPath;
export const SERVER_ARGS = [fileURLToPath(new URL("./stdio-entry.js", import.meta.url))];

export async function withStdioClient({
  modern = false,
  command = SERVER_COMMAND,
  args = SERVER_ARGS,
  cwd = fileURLToPath(new URL("..", import.meta.url)),
  capabilities,
  env,
  root: ownedRuntimeRoot,
  onFailure,
} = {}, callback) {
  const transport = new StdioClientTransport({
    command,
    args,
    cwd,
    stderr: "pipe",
    ...(env ? { env: { ...process.env, ...env } } : {}),
  });
  let stderr = "";
  transport.stderr.on("data", (chunk) => { stderr += chunk; });
  const options = { ...(modern ? { versionNegotiation: { mode: { pin: "2026-07-28" } } } : {}), ...(capabilities ? { capabilities } : {}) };
  const client = new Client({ name: "agdf-mcp-test", version: "1.0.0" }, options);
  // Optional retained transport evidence for disposable tests only. This does not
  // supply runtime policy, host permission or human-origin qualification.
  if (process.env.AGDF_TEST_EVIDENCE_DIR) {
    const directory = resolve(process.env.AGDF_TEST_EVIDENCE_DIR);
    mkdirSync(directory, { recursive: true });
    const file = join(directory, `${basename(process.argv[1])}-${process.pid}.jsonl`);
    if (ownedRuntimeRoot) appendFileSync(file, JSON.stringify({ observed_at: new Date().toISOString(),
      evidence_class: "synthetic_owned_package_identity", protocol: modern ? "2026-07-28" : "legacy_negotiation",
      command, args, marker: JSON.parse(readFileSync(join(ownedRuntimeRoot, '.agdf-mcp-owned.json'), 'utf8')),
      native_qualified: false, authorizes: false }) + "\n");
    const original = client.callTool.bind(client);
    client.callTool = async (...parameters) => {
      const started=performance.now(); let result;
      try { result = await original(...parameters); }
      catch(error) {
        appendFileSync(file,JSON.stringify({observed_at:new Date().toISOString(),evidence_class:'synthetic_actual_stdio_failure',
          request:parameters[0],elapsed_ms:performance.now()-started,error:{code:error.code??null,message:error.message},native_qualified:false,authorizes:false})+'\n');
        throw error;
      }
      appendFileSync(file, JSON.stringify({ observed_at: new Date().toISOString(),
        evidence_class: "synthetic_actual_stdio_exchange", protocol: modern ? "2026-07-28" : "legacy_negotiation",
        request: parameters[0], elapsed_ms:performance.now()-started, result, native_qualified: false, authorizes: false }) + "\n");
      return result;
    };
  }
  try {
    await client.connect(transport);
    await callback(client);
    assert.equal(stderr, "", "STDERR must remain empty during a successful protocol exchange");
  } catch (error) {
    await onFailure?.(error);
    if (stderr) error.message = `${error.message}; server stderr: ${stderr.trim()}`;
    throw error;
  } finally {
    await client.close().catch(() => {});
  }
}

export const unresolvedArguments = Object.freeze({
  skill_id: "gate-check",
  presentation_language: "de",
  working_directory: tmpdir(),
});
