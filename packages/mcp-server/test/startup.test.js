import { assertFacadeExit } from '../../cli/scripts/fixtures/facade-exit.js';
import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createOwnedRuntimeFixture } from './owned-runtime.js';
import { withStdioClient } from './helpers.js';
import { pluginRoot, offlineNpm } from '../../../scripts/support/plugin-mcp-fixture.js';
import { GENERATION_LIMITS } from '../src/generation-protocol.js';

const selectors = process.argv.slice(2);
assert.ok(selectors.length === 0 || selectors.length === 1 && selectors[0] === '--with-early-exit', 'invalid focused startup selector');
const workerModule = new URL('../src/worker.js', import.meta.url).href;
const independent = spawnSync(process.execPath, ['--input-type=module', '--eval', `
  import {register} from 'node:module';
  const hook = "export async function resolve(specifier,context,next){if(specifier.startsWith('@modelcontextprotocol/'))throw Error('worker_factory_sdk_coupling');if(['parse5','postcss'].includes(specifier))throw Error('startup_preview_parser_coupling');const result=await next(specifier,context);if(result.url.endsWith('/src/server.js'))throw Error('worker_factory_server_coupling');return result;}";
  register('data:text/javascript,'+encodeURIComponent(hook));
  const {createAgdfWorkerExecutor}=await import(${JSON.stringify(workerModule)});
  const executor=createAgdfWorkerExecutor({trustedContext:{surface:'codex',expectedVersion:'0.20.2',commandGroups:[]}});
  await executor.close();
  const {createMcpDispatchRuntime}=await import(${JSON.stringify(new URL('../../cli/lib/mcp-dispatch-runtime.js', import.meta.url).href)});
  const actual=createMcpDispatchRuntime({surface:'copilot'});
  await actual.close();
`], {encoding: 'utf8'});
assert.equal(independent.status, 0, independent.stderr);

// Actual owned processes and SDK bytes. A loader barrier makes generation
// qualification independent of facade SDK loading, rather than racing a timer.
// This is a synthetic startup fault test, never a native-host or timing sample.
const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-startup-overlap-')));
try {
  for (const failTransport of [false, true]) {
    const directory = join(root, failTransport ? 'transport-failure' : 'qualified');
    mkdirSync(directory);
    const trace = join(directory, 'trace.jsonl'), preload = join(directory, 'preload.mjs');
    const hook = `
      import {appendFileSync,existsSync,readFileSync} from 'node:fs';
      import {setTimeout} from 'node:timers/promises';
      const trace=${JSON.stringify(trace)};
      export async function load(url,context,next){
        if(!url.endsWith('/src/server.js')) return next(url,context);
        appendFileSync(trace,JSON.stringify({kind:'transport_wait',ns:process.hrtime.bigint().toString()})+'\\n');
        const until=Date.now()+${GENERATION_LIMITS.qualify};
        while(!(existsSync(trace)&&readFileSync(trace,'utf8').includes('"kind":"generation_qualified"'))){
          if(Date.now()>=until)throw Error('startup_generation_did_not_qualify_independently');
          await setTimeout(10);
        }
        appendFileSync(trace,JSON.stringify({kind:'transport_resume',ns:process.hrtime.bigint().toString()})+'\\n');
        if(${failTransport}) throw Error('startup_test_transport_failure');
        return next(url,context);
      }
    `;
    writeFileSync(preload, `
      import {register} from 'node:module';
      import {basename} from 'node:path';
      import {parentPort} from 'node:worker_threads';
      import {appendFileSync} from 'node:fs';
      const trace=${JSON.stringify(trace)};
      if(['facade-entry.js','facade-thread-entry.js'].includes(basename(process.argv[1] ?? '')))
        register(${JSON.stringify('data:text/javascript,' + encodeURIComponent(hook))},import.meta.url);
      if(['generation-entry.js','generation-thread-entry.js'].includes(basename(process.argv[1] ?? ''))){
        const channel=parentPort??process,key=parentPort?'postMessage':'send',original=channel[key];
        channel[key]=function(wire,...rest){
          const message=typeof wire==='string'?JSON.parse(wire):wire;
          if(['qualified','closed'].includes(message?.kind))appendFileSync(trace,JSON.stringify({kind:'generation_'+message.kind,ns:process.hrtime.bigint().toString()})+'\\n');
          return Reflect.apply(original,this,[wire,...rest]);
        };
      }
    `);
    const fixture = createOwnedRuntimeFixture({ pluginSourceRoot: pluginRoot, controlRuns: [] });
    let publicService = false;
    try {
      const run = () => withStdioClient({ ...fixture, env: { NODE_OPTIONS: `--import=${pathToFileURL(preload).href}` } }, async client => {
        publicService = true;
        const tools = await client.listTools();
        assert.ok(tools.tools.some(tool => tool.name === 'agdf_project'));
      });
      if (failTransport) {
        await assert.rejects(run, /startup_test_transport_failure|Connection closed|connection closed/);
        assert.equal(publicService, false, 'a transport failure cannot admit public MCP service');
      } else await run();
      const events = readFileSync(trace, 'utf8').trim().split('\n').map(line => JSON.parse(line));
      const qualified = events.find(event => event.kind === 'generation_qualified');
      const resumed = events.find(event => event.kind === 'transport_resume');
      assert.ok(qualified && resumed, JSON.stringify(events));
      assert.ok(BigInt(qualified.ns) <= BigInt(resumed.ns), 'the real generation qualifies while facade SDK loading is blocked');
      assert.ok(events.some(event => event.kind === 'generation_closed'), 'success and SDK-failure paths both await real generation teardown');
      if (process.env.AGDF_TEST_EVIDENCE_DIR) {
        mkdirSync(process.env.AGDF_TEST_EVIDENCE_DIR, { recursive: true });
        writeFileSync(join(process.env.AGDF_TEST_EVIDENCE_DIR, `startup-${failTransport ? 'failure' : 'success'}.json`), JSON.stringify({
          evidence_class: 'synthetic_actual_owned_startup', fail_transport: failTransport, public_service: publicService, events,
          producer: JSON.parse(readFileSync(join(fixture.root, '.agdf-mcp-owned.json'), 'utf8')),
          native_qualified: false, acceptance_sample: false, authorizes: false,
        }, null, 2) + '\n');
      }

      console.log(`Actual startup ${failTransport ? 'transport failure before service with generation teardown' : 'generation qualification before facade SDK availability'} passed; synthetic only.`);
    } finally { fixture.dispose(); }
  }
  // Hold actual launcher preparation until the SDK-free owner has booted.
  // This proves overlap without a timer race and also exercises cancellation
  // before activation when the installed source fails its original guard.
  for (const invalidSource of [false, true]) {
    const fixture = createOwnedRuntimeFixture({ pluginSourceRoot: pluginRoot, controlRuns: [] });
    const directory = join(root, invalidSource ? 'invalid-source' : 'owner-overlap');
    mkdirSync(directory);
    const trace = join(directory, 'trace.jsonl'), preload = join(directory, 'preload.mjs');
    writeFileSync(preload, `
      import fs from 'node:fs';import cp from 'node:child_process';import wt from 'node:worker_threads';
      import {syncBuiltinESMExports} from 'node:module';import {basename,dirname} from 'node:path';
      const trace=${JSON.stringify(trace)},append=kind=>fs.appendFileSync(trace,JSON.stringify({kind,ns:process.hrtime.bigint().toString()})+'\\n');
      const read=fs.readFileSync;let held=false;
      if(basename(process.argv[1]??'')==='agdf-mcp-launch.js'){
        fs.readFileSync=function(path,...args){
          if(!held&&basename(String(path))==='runtime-manifest.json'&&basename(dirname(String(path)))==='runtime'){
            held=true;append('preparation_wait');const until=Date.now()+10000;
            while(!(fs.existsSync(trace)&&read(trace,'utf8').includes('"kind":"owner_ready"'))){
              if(Date.now()>=until)throw Error('owner_boot_did_not_overlap_preparation');
              Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,5);
            }
            append('preparation_resume');
          }
          return Reflect.apply(read,this,[path,...args]);
        };
      }
      const NativeWorker=wt.Worker;wt.Worker=class ObservedWorker extends NativeWorker{constructor(...args){super(...args);if(basename(String(args[0]))==='facade-thread-entry.js')append('facade_worker')}};
      const fork=cp.fork;cp.fork=function(...args){if(basename(String(args[0]))==='facade-entry.js')append('facade_fork');return Reflect.apply(fork,this,args)};
      const send=process.send;if(send)process.send=function(message,...args){if(['owner_ready','owner_closed'].includes(message?.kind))append(message.kind);return Reflect.apply(send,this,[message,...args])};
      syncBuiltinESMExports();
    `);
    try {
      const env = { NODE_OPTIONS: `--import=${pathToFileURL(preload).href}` };
      if (invalidSource) {
        const manifestPath = join(fixture.args[0], '../../runtime/runtime-manifest.json');
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
        writeFileSync(manifestPath, JSON.stringify({ ...manifest, digest: '0'.repeat(64) }));
        const refused = spawnSync(fixture.command, fixture.args, { env: { ...process.env, ...env }, input: '', encoding: 'utf8', timeout: 10000 });
        assert.equal(refused.status, 1, refused.stderr);
        assert.match(refused.stderr, /^AGDF_MCP_PLUGIN_RUNTIME_INVALID:/u);
        assert.equal(existsSync(join(fixture.root, '.agdf-executable-claims')), false, 'source failure cannot create any executable claim');
      } else await withStdioClient({ ...fixture, env }, async client => assert.ok((await client.listTools()).tools.length));
      const events = readFileSync(trace, 'utf8').trim().split('\n').map(line => JSON.parse(line));
      const position = kind => events.findIndex(event => event.kind === kind);
      assert.ok(position('preparation_wait') >= 0 && position('owner_ready') > position('preparation_wait'), JSON.stringify(events));
      assert.ok(position('preparation_resume') > position('owner_ready'), 'actual owner boot completes while actual launcher preparation is held');
      assert.ok(position('owner_closed') > position('preparation_resume'), 'both activation and refused preparation observe orderly owner exit');
      if (invalidSource) { assert.equal(position('facade_fork'), -1); assert.equal(position('facade_worker'), -1); }
      else assert.ok(position('facade_worker') > position('preparation_resume'), 'actual facade Worker cannot start before preparation resumes and qualifies');
      if (process.env.AGDF_TEST_EVIDENCE_DIR) writeFileSync(join(process.env.AGDF_TEST_EVIDENCE_DIR, `owner-overlap-${invalidSource ? 'refused' : 'success'}.json`), JSON.stringify({
        evidence_class: 'synthetic_actual_owner_boot_overlap', invalid_source: invalidSource, events, native_qualified: false, acceptance_sample: false, authorizes: false,
      }, null, 2) + '\n');
      console.log(`Actual owner bootstrap overlap and ${invalidSource ? 'source refusal without facade/claims' : 'qualification before facade start'} passed.`);
    } finally { fixture.dispose(); }
  }
  // Actual SDK mutation after a valid local observation must still fail the
  // fresh under-lock claim, before the facade imports any SDK transport code.
  {
    const fixture = createOwnedRuntimeFixture({ pluginSourceRoot: pluginRoot, controlRuns: [] });
    const script = join(root, 'late-sdk-mutation.mjs'), touched = join(root, 'sdk-imported');
    const hook = `import {writeFileSync} from 'node:fs';export async function load(url,context,next){if(url.endsWith('/src/server.js')){writeFileSync(${JSON.stringify(touched)},'unexpected');throw Error('sdk_loaded_before_valid_claim');}return next(url,context);}`;
    writeFileSync(script, `
      import assert from 'node:assert/strict';import {register} from 'node:module';
      import {readFileSync,writeFileSync} from 'node:fs';import {dirname,basename,join} from 'node:path';
      register(${JSON.stringify('data:text/javascript,' + encodeURIComponent(hook))},import.meta.url);
      const {inspectMcpExecutableRoot,createMcpGenerationPublisher}=await import(${JSON.stringify(pathToFileURL(join(fixture.dispatcherRoot, 'lib/mcp-lifecycle/package.js')).href)});
      const protocol=await import(${JSON.stringify(pathToFileURL(join(fixture.dispatcherRoot, 'lib/mcp-protocol-runtime.js')).href)});
      const root=${JSON.stringify(fixture.root)};
      const observed=inspectMcpExecutableRoot({root,expectedVersion:'0.20.2'});
      const base={...observed,immutable:true,publication_id:basename(dirname(root)),publisher_root:dirname(dirname(dirname(root)))};
      const fresh=protocol.inspectMcpDispatcherRuntime();
      const runtime=protocol.createMcpTransportRuntime({surface:'codex'});
      assert.equal(runtime.trustedContext.provenanceStatus,'matched');assert.deepEqual(runtime.producerIdentity,fresh.generationIdentity);
      assert.deepEqual(runtime.tools.map(t=>t.definition),protocol.createMcpTransportRuntime({surface:'codex'}).tools.map(t=>t.definition));
      const marker=readFileSync(base.markerPath);try{
        writeFileSync(base.markerPath,JSON.stringify({...JSON.parse(marker),server_digest:'0'.repeat(64)}));
        assert.equal(protocol.createMcpTransportRuntime({surface:'codex'}).trustedContext.provenanceStatus,'unowned');
      }finally{writeFileSync(base.markerPath,marker)}
      const {runMcpServer}=await import(${JSON.stringify(pathToFileURL(join(fixture.serverRoot, 'src/main.js')).href)});
      await assert.rejects(runMcpServer({surface:'codex',runtime,ownedPublication:{...base,digest:'0'.repeat(64)},ownedPublisher:createMcpGenerationPublisher(base)}),/AGDF_MCP_FACADE_IDENTITY_INVALID/);
      const sdk=join(root,'node_modules/@modelcontextprotocol/server/dist/index.mjs'),bytes=readFileSync(sdk);
      try{writeFileSync(sdk,Buffer.concat([bytes,Buffer.from('\\n// controlled late startup mutation\\n')]));
        await assert.rejects(runMcpServer({surface:'codex',runtime,ownedPublication:base,ownedPublisher:createMcpGenerationPublisher(base)}),/AGDF_MCP_EXECUTABLE_CLAIM_INVALID/);
      }finally{writeFileSync(sdk,bytes)}
      await runtime.close?.();console.log('late_sdk_rejected_before_transport_import');
    `);
    try {
      const rejected = spawnSync(process.execPath, [script], { encoding: 'utf8' });
      assert.equal(rejected.status, 0, rejected.stderr);
      assert.match(rejected.stdout, /late_sdk_rejected_before_transport_import/);
      assert.equal(existsSync(touched), false, 'a stale local observation cannot load SDK code before fresh claim validation');
      console.log('Actual fresh inspection parity/marker drift and late SDK mutation refusal before transport import passed.');
    } finally { fixture.dispose(); }
  }
  // The canonical CLI suite owns all five cases. Focused engineering can run
  // just its two early-exit cases without repeating the full installer suite.
  if (selectors.length) for (const mode of ['startup-stop', 'startup-killed'])
    await assertFacadeExit(mode, { pluginRoot, offlineNpm });
} finally { rmSync(root, { recursive: true, force: true }); }
