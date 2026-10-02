import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { pathToFileURL } from 'node:url';
import { repoRoot, coreRoot } from './core-projection.mjs';
import { createOwnedRuntimeFixture } from '../packages/mcp-server/test/owned-runtime.js';
import { withStdioClient } from '../packages/mcp-server/test/helpers.js';
import { digestDirectory, digestMcpDispatcherPackage, digestMcpSdkRuntime, digestNormalizedPluginSource } from '../packages/core/lib/runtime/plugin-provenance.js';
const version = JSON.parse(readFileSync(join(repoRoot, 'plugins/agdf/meta/agdf-plugin.definition.json'))).version;
const fixture = createOwnedRuntimeFixture();
const evidence = { node: process.version, platform: process.platform, archive_packages: [], cli: [], exports: [], offline: [], mcp: [] };
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
try {
  for (const [archive, target, expected] of [
    [`create-agdf-${version}.tgz`, fixture.dispatcherRoot, 'create-agdf'],
    [`agdf-cli-${version}.tgz`, join(fixture.root, 'node_modules/@agdf/cli'), '@agdf/cli'],
    [`agdf-mcp-server-${version}.tgz`, fixture.serverRoot, '@agdf/mcp-server'],
  ]) {
    const archivePath = join(repoRoot, 'dist/tarballs', archive);
    assert.ok(existsSync(archivePath), 'normal npm pack must run before consumers');
    rmSync(target, { recursive: true, force: true }); mkdirSync(target, { recursive: true });
    // Keep GNU tar away from drive-letter archive names, which denote remote hosts.
    cpSync(archivePath, join(fixture.root, archive));
    execFileSync('tar', ['-xzf', archive, '--strip-components=1', '-C', relative(fixture.root, target).replaceAll('\\', '/')], { cwd: fixture.root });
    const manifest = JSON.parse(readFileSync(join(target, 'package.json')));
    assert.equal(manifest.name, expected); assert.equal(manifest.version, version); assert.equal(manifest.engines.node, '>=22');
    assert.equal(Object.keys(manifest.devDependencies ?? {}).length, 0);
    for (const dependency of Object.values(manifest.dependencies ?? {})) assert.doesNotMatch(dependency, /^(?:file:|workspace:)/u);
    assert.equal(manifest.dependencies?.['@agdf/core'], undefined);
    evidence.archive_packages.push({ name: expected, manifest, tarball_sha256: hash(readFileSync(archivePath)) });
  }
  // Every canonical Core module is byte-identical apart from the explicit resource binding descriptor.
  const visit = root => readdirSync(root, { withFileTypes: true }).flatMap(item => item.isDirectory() ? visit(join(root, item.name)) : [join(root, item.name)]);
  for (const source of visit(join(coreRoot, 'lib'))) {
    const relative = source.slice(join(coreRoot, 'lib').length + 1);
    if (relative !== 'resources/binding.js') assert.deepEqual(readFileSync(join(fixture.dispatcherRoot, 'runtime/core/lib', relative)), readFileSync(source), relative);
  }
  const environment = { ...process.env, HOME: join(fixture.root, 'home'), CLAUDE_CONFIG_DIR: join(fixture.root, 'claude'), CODEX_HOME: join(fixture.root, 'codex'), AGDF_DATA_DIR: join(fixture.root, 'data'), npm_config_offline: 'true' };
  function node(args, expected = 0, env = environment) {
    const result = spawnSync(process.execPath, args, { cwd: fixture.root, env, encoding: 'utf8', timeout: 20000 });
    assert.equal(result.status, expected, `${args.join(' ')}\n${result.stdout}\n${result.stderr}`); return result.stdout;
  }
  for (const [name, bin] of [['create-agdf', join(fixture.dispatcherRoot, 'bin/create-agdf.js')], ['agdf', join(fixture.root, 'node_modules/@agdf/cli/bin/agdf.js')]]) {
    assert.match(node([bin, '--version']), new RegExp(version.replaceAll('.', '\\.'))); assert.match(node([bin, '--help']), /Bootstrap and lifecycle commands/u);
    evidence.cli.push({ name, version: 'pass', help: 'pass' });
  }
  const bin = join(fixture.dispatcherRoot, 'bin/create-agdf.js');
  mkdirSync(join(fixture.root, 'archive-target')); const target = realpathSync(join(fixture.root, 'archive-target'));
  execFileSync('git', ['init', '-q'], { cwd: target });
  node([bin, 'init', '--dir', target, '--language', 'de']);
  assert.ok(existsSync(join(target, '.agdf/control')));
  const doctor = JSON.parse(node([bin, 'doctor', '--dir', target, '--json'], 2));
  assert.ok(doctor.findings.some(finding => finding.code === 'AGDF_ACTIVE_RUN_MISSING')); evidence.cli.push({ command: 'init/doctor', isolated_target: true, report: doctor });
  node([bin, 'run-create', '--dir', target, '--run', 'archive-parity']);
  const auditPath = join(fixture.root, 'audit.mjs');
  writeFileSync(auditPath, `import fs from 'node:fs'; import cp from 'node:child_process'; import {syncBuiltinESMExports} from 'node:module';
for(const name of ['writeFileSync','mkdirSync','renameSync','unlinkSync','rmSync']) fs[name]=()=>{throw Error('unexpected import write '+name)};
for(const name of ['spawn','spawnSync','exec','execSync','execFile','execFileSync','fork']) cp[name]=()=>{throw Error('unexpected import process '+name)};
syncBuiltinESMExports();
for(const specifier of ['create-agdf','create-agdf/control-command','create-agdf/mcp-dispatch-runtime','create-agdf/opencode-plugin']) await import(specifier);
console.log('public imports passed');`);
  assert.match(node([auditPath]), /public imports passed/u);
  evidence.exports = ['.', './control-command', './mcp-dispatch-runtime', './opencode-plugin', './cli (--version/--help)'];
  const guard = join(fixture.root, 'offline-guard.cjs');
  writeFileSync(guard, `const fs=require('node:fs'),cp=require('node:child_process'),moduleAPI=require('node:module');
for(const name of ['net','http','https','tls','dgram','dns']) {const api=require('node:'+name); for(const key of ['connect','createConnection','request','get','lookup','resolve']) if(typeof api[key]==='function') api[key]=()=>{throw Error('offline network forbidden')};}
const spawn=cp.spawnSync; cp.spawnSync=(exe,args,opts)=>{if(exe!==process.execPath) throw Error('offline non-Node process forbidden: '+exe); return spawn(exe,args,opts)};
for(const key of ['spawn','exec','execSync','execFile','execFileSync','fork']) cp[key]=()=>{throw Error('offline process forbidden')}; moduleAPI.syncBuiltinESMExports();`);
  for (const profile of ['agdf', 'copilot/agdf']) {
    const plugin = join(fixture.dispatcherRoot, 'generated/plugins', profile);
    const standalone = join(fixture.root, 'offline', profile); mkdirSync(standalone, { recursive: true }); cpSync(plugin, standalone, { recursive: true });
    const runtimeManifest = JSON.parse(readFileSync(join(standalone, 'runtime/runtime-manifest.json')));
    const pluginVersion = profile === 'agdf' ? JSON.parse(readFileSync(join(standalone, '.codex-plugin/plugin.json'))).version : version;
    const inventory = join(standalone, '.agdf-payload-inventory.json');
    writeFileSync(join(standalone, '.agdf-installation.json'), JSON.stringify({ schema_version: 1, owner: 'create-agdf', profile_id: profile === 'agdf' ? 'runtime-plugin' : 'copilot-runtime-plugin', marketplace_id: 'agdf', canonical_version: version, codex_install_version: pluginVersion, source_digest: digestNormalizedPluginSource(standalone, version), runtime_digest: runtimeManifest.digest, ...(existsSync(inventory) ? { inventory_digest: hash(readFileSync(inventory)) } : {}) }));
    const validator = join(standalone, 'runtime/agdf-local.js');
    const output = node(['--require', guard, validator, 'contract', '--module', 'quality', '--json'], 0, { ...environment, PATH: '', NODE_OPTIONS: `--require=${guard}` });
    assert.match(output, /quality/u);
    const negative = spawnSync(process.execPath, ['--require', guard, validator, 'contract', '--module', '../../secret', '--json'], { cwd: fixture.root, env: { ...environment, PATH: '' }, encoding: 'utf8' });
    assert.notEqual(negative.status, 0); evidence.offline.push({ profile, network_and_non_node_processes_blocked: true, quality: 'pass', invalid_module: 'rejected' });
  }
  writeFileSync(join(fixture.root, '.agdf-mcp-owned.json'), JSON.stringify({ schema_version: 1, owner: 'create-agdf:mcp-runtime', version: version, server_digest: digestDirectory(fixture.serverRoot), dispatcher_digest: digestMcpDispatcherPackage(fixture.dispatcherRoot), sdk_digest: digestMcpSdkRuntime(fixture.root), references: [] }));
  for (const modern of [false, true]) await withStdioClient({ command: process.execPath, args: fixture.args, cwd: fixture.root, modern }, async client => {
    const { tools } = await client.listTools(); assert.deepEqual(tools.map(tool => tool.name), ['agdf_dispatch', 'agdf_inspect']);
    const dispatch = await client.callTool({ name: 'agdf_dispatch', arguments: { skill_id: 'gate-check', presentation_language: 'de', working_directory: fixture.root } });
    assert.equal(dispatch.structuredContent.authorizes, false); assert.equal(dispatch.structuredContent.runtime.provenance_status, 'matched');
    const inspect = await client.callTool({ name: 'agdf_inspect', arguments: { operation: 'doctor', presentation_language: 'de', working_directory: fixture.root } });
    assert.equal(inspect.structuredContent.authorizes, false);
    const boundInspect = await client.callTool({ name: 'agdf_inspect', arguments: { operation: 'doctor', presentation_language: 'de', working_directory: target, target_source: 'explicit_target', primary_target: target, run_id: 'archive-parity' } });
    assert.equal(boundInspect.structuredContent.outcome, 'inspect_result');
    assert.equal(boundInspect.structuredContent.authorizes, false);
    const stable = value => JSON.stringify(value, (key, item) => key === 'checked_at' ? undefined : item);
    assert.equal(stable(boundInspect.structuredContent.report), stable(JSON.parse(node([bin, 'doctor', '--dir', target, '--run', 'archive-parity', '--json']))));
    evidence.mcp.push({ protocol: client.getNegotiatedProtocolVersion(), names: tools.map(tool => tool.name), dispatch: dispatch.structuredContent.outcome, inspect: inspect.structuredContent.outcome, bound_inspect: 'inspect_result', cli_report_parity: 'pass', provenance: 'matched' });
  });
  if (process.env.AGDF_MIGRATION_EVIDENCE) writeFileSync(join(process.env.AGDF_MIGRATION_EVIDENCE, 'ARCHIVE_CONSUMERS.json'), JSON.stringify(evidence, null, 2)+'\n');
  console.log('Three normal archives: manifests, Core bytes, CLI/bootstrap, exports, blocked-network offline profiles and both MCP protocols passed.');
} finally { fixture.dispose(); }
