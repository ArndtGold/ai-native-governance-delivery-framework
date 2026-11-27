// Prepare a disposable Codex profile for observing the real host message bridge.
// The recipient only claims a fixture marker. This probe cannot qualify a production install.
import { createHash, randomUUID } from 'node:crypto';
import { appendFileSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCodexContinuationAdmission } from '../../packages/core/lib/companion/codex-continuation.js';
import { requestDeclaresMcpAppUi } from '../../packages/mcp-server/src/ui-capability.js';

const script = fileURLToPath(import.meta.url);
const ui = new URL('../../packages/control-ui/', import.meta.url);
const sdk = createRequire(new URL('../../packages/mcp-server/package.json', import.meta.url));
const uri = 'ui://agdf-test/continuation.html';
const mimeType = 'text/html;profile=mcp-app';
const prefix = 'agdf-native-handoff-';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

async function prepare() {
  const { build } = await import(new URL('node_modules/vite/dist/node/index.js', ui));
  const [bundle] = await build({ root: fileURLToPath(ui), configFile: false, logLevel: 'silent',
    define: { 'process.env.NODE_ENV': '"production"' }, build: { write: false, target: 'es2022',
      lib: { entry: fileURLToPath(new URL('test/browser/native-continuation-probe.ts', ui)), formats: ['iife'], name: 'HandoffProbe' } } });
  const js = bundle.output.find(chunk => chunk.isEntry).code;
  const html = `<!doctype html><html lang="de"><meta charset="utf-8"><title>AGDF-Übergabetest</title>
    <style>body{font:1rem/1.5 system-ui;margin:1rem}button{font:inherit;padding:.5rem 1rem;cursor:pointer}</style>
    <h1>Übergabe an Codex testen</h1><p id="step">Der Testchat bestätigt den Empfang für einen fiktiven Run.</p>
    <div id="action" aria-live="polite">Die Verbindung zum Testchat wird hergestellt …</div>
    <script>${js.replace(/<\/script/gi, '<\\/script')}</script></html>`;
  const lab = mkdtempSync(join(realpathSync(tmpdir()), prefix));
  const home = join(lab, 'codex-home'), project = join(lab, 'project');
  for (const path of [home, project, join(lab, 'data')]) mkdirSync(path, { mode: 0o700 });
  const fixture = { run_id: 'run-' + randomUUID(), revision_id: randomUUID(),
    target_id: 'sha256:' + hash(project), operation_key: 'fixture.read', resource_sha256: hash(html) };
  writeFileSync(join(lab, 'probe.html'), html);
  writeFileSync(join(lab, 'fixture.json'), JSON.stringify(fixture));
  const quoted = JSON.stringify;
  writeFileSync(join(home, 'config.toml'), [
    'sandbox_mode = "read-only"', 'approval_policy = "on-request"', '',
    '[mcp_servers.agdf-handoff-probe]', 'command = ' + quoted(process.execPath),
    'args = [' + [script, 'serve', lab].map(s => quoted(s)).join(', ') + ']',
    '[mcp_servers.agdf-handoff-probe.env]', 'CODEX_HOME = ' + quoted(home), '',
  ].join('\n'));
  console.log(JSON.stringify({ lab, home, project, ...fixture }, null, 2));
}

function serve(lab) {
  // Resolve only the private profile made by prepare. Callers cannot supply projects or state paths.
  if (!lab || realpathSync(lab) !== lab || dirname(lab) !== realpathSync(tmpdir())
      || !basename(lab).startsWith(prefix) || process.env.CODEX_HOME !== join(lab, 'codex-home'))
    throw Error('A prepared isolated Codex profile is required.');
  const { McpServer } = sdk('@modelcontextprotocol/server');
  const { serveStdio, StdioServerTransport } = sdk('@modelcontextprotocol/server/stdio');
  const { z } = sdk('zod');
  const { resource_sha256, ...binding } = JSON.parse(readFileSync(join(lab, 'fixture.json'), 'utf8'));
  const html = readFileSync(join(lab, 'probe.html'), 'utf8');
  if (hash(html) !== resource_sha256) throw Error('The prepared test resource changed.');
  const project = join(lab, 'project'), scope = { ...binding, root: project };
  const target = { target_id: scope.target_id, display_path: project };
  const admission = createCodexContinuationAdmission(join(lab, 'data'));
  const eligible = () => true; // The only operation on this immutable fixture returns its marker.
  const log = (event, result) => appendFileSync(join(lab, 'observations.jsonl'), JSON.stringify({
    time: new Date().toISOString(), event, run_id: scope.run_id, state: result.state,
    attempt_id: result.attempt_id, send_permit: result.send === true, fixture_grant: result.admitted === true,
  }) + '\n');
  const reply = value => ({ structuredContent: value, content: [{ type: 'text', text: JSON.stringify(value) }] });
  serveStdio(() => {
    const server = new McpServer({ name: 'agdf-handoff-probe', version: '1' });
    const views = new Map();
    server.registerResource('AGDF-Übergabetest', uri, { mimeType },
      async () => ({ contents: [{ uri, mimeType, text: html }] }));
    server.registerTool('open_fixture', { description: 'Öffne den isolierten Übergabetest im Begleiter.',
      inputSchema: z.object({}).strict(), _meta: { ui: { resourceUri: uri, visibility: ['model', 'app'] } } }, async () => {
      const session_id = randomUUID(), snapshot_id = randomUUID();
      views.set(session_id, snapshot_id);
      return { ...reply({ test: 'Codex handoff', run_id: scope.run_id }), _meta: { fixture: { ...binding, session_id, snapshot_id } } };
    });
    server.registerTool('agdf_cockpit_continue', { description: 'Observe or reserve the displayed test marker.',
      _meta: { ui: { visibility: ['app'] } }, inputSchema: z.object({
        operation: z.enum(['status', 'reserve', 'publish', 'cancel']), session_id: z.string().uuid(),
        snapshot_id: z.string().uuid(), run_id: z.literal(scope.run_id), revision_id: z.literal(scope.revision_id),
        attempt_id: z.string().uuid().optional(),
      }).strict() }, async ({ session_id, snapshot_id, operation, attempt_id }, context) => {
      let result = { state: 'stale' };
      if (requestDeclaresMcpAppUi(server.server, context, mimeType) && views.get(session_id) === snapshot_id) {
        if (operation === 'status') result = admission.inspect(scope);
        if (operation === 'reserve') result = admission.reserve(scope, session_id, eligible);
        if (operation === 'publish' && attempt_id) result = admission.publish(scope, session_id, attempt_id, eligible);
        if (operation === 'cancel' && attempt_id) result = admission.cancelReservation(scope, session_id, attempt_id);
      }
      if (operation !== 'status') log(operation, result);
      return reply({ schema_version: '1', authorizes: false, ...result,
        ...(result.send || result.reserved ? { ...binding, target } : {}) });
    });
    server.registerTool('agdf_dispatch', { description: 'Confirm the test handoff once. Return only its fixture marker and end the turn.',
      inputSchema: z.object({ skill_id: z.literal('gate-check'), continue_delivery: z.literal(true), run_id: z.literal(scope.run_id),
        working_directory: z.literal(project), primary_target: z.literal(project), target_source: z.literal('continued_target'),
        continuation_attempt_id: z.string().uuid().optional(),
      }).strict() }, async ({ continuation_attempt_id }) => {
      const result = admission.claim(scope, { attemptId: continuation_attempt_id }, eligible);
      log(continuation_attempt_id ? 'bound_fixture_receiver' : 'ordinary_fixture_receiver', result);
      return reply({ state: result.state, granted: result.admitted === true, marker: result.admitted ? scope.run_id : null });
    });
    return server;
  }, { legacy: 'serve', transport: new StdioServerTransport() });
}

if (process.argv[2] === 'prepare') await prepare();
else if (process.argv[2] === 'serve') serve(process.argv[3]);
else throw Error('Use prepare to create a fresh disposable host profile.');
