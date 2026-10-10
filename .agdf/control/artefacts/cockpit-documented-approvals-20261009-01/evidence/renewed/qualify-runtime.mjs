import * as fs from 'node:fs';
import {join,resolve} from 'node:path';
import {tmpdir} from 'node:os';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const repo=resolve(import.meta.dirname,'../../../../../..'),evidence=import.meta.dirname;
const suffix=process.env.AGDF_COCKPIT_QUALIFICATION_SUFFIX ?? '';
if(!['','-final','-boundary','-review','-quality'].includes(suffix))throw Error('Unknown qualification round');
const {copySourceFixture}=await import(pathToFileURL(join(repo,'scripts/support/source-fixture.js')));
const {createOwnedRuntimeFixture}=await import(pathToFileURL(join(repo,'packages/mcp-server/test/owned-runtime.js')));
const {digestDirectory}=await import(pathToFileURL(join(repo,'packages/core/lib/runtime/plugin-provenance.js')));
const root=fs.realpathSync(fs.mkdtempSync(join(tmpdir(),'agdf-documents-source-')));
copySourceFixture(root,{dependencies:true});
execFileSync(process.execPath,[join(root,'packages/cli/scripts/prepare-local-plugin.js'),'codex'],{cwd:root,stdio:'pipe'});
const qualifiedUi=join(evidence,'qualified-mcp'+(suffix==='-quality'?'-review':suffix));
fs.cpSync(qualifiedUi,join(root,'packages/control-ui/dist-mcp'),{recursive:true});
const assembly=JSON.parse(execFileSync(process.execPath,['--input-type=module','-e',`import {assembleNpm} from './scripts/assemble-npm.mjs';console.log(JSON.stringify(assembleNpm({surface:'codex',cockpit:true})))`],{cwd:root,encoding:'utf8'}));
const dispatcher=assembly.find(p=>p.name==='create-agdf').output;
const runtime=createOwnedRuntimeFixture({dispatcherSourceRoot:dispatcher});
fs.cpSync(qualifiedUi,join(runtime.serverRoot,'ui'),{recursive:true});
const markerPath=join(runtime.root,'.agdf-mcp-owned.json'),marker=JSON.parse(fs.readFileSync(markerPath));marker.server_digest=digestDirectory(runtime.serverRoot);fs.writeFileSync(markerPath,JSON.stringify(marker,null,2)+'\n');
const files=['control-inspect/cockpit.js','control-inspect/artifact-readiness.js','control-state/artefact-binding-proof.js'];
const hashes={};
for(const path of files){
  const source=fs.readFileSync(join(repo,'packages/core/lib',path));
  const candidate=fs.readFileSync(join(runtime.dispatcherRoot,'runtime/core/lib',path));
  assert.deepEqual(candidate,source,path);hashes[path]=createHash('sha256').update(candidate).digest('hex');
}
const ui=JSON.parse(fs.readFileSync(join(runtime.serverRoot,'ui/manifest.json')));
const preparation={schema_version:'1',node:process.execPath,entrypoint:join(runtime.serverRoot,'bin/agdf-mcp.js'),ui,
 source_fixture:root,runtime_root:runtime.root,dispatcher_root:runtime.dispatcherRoot,server_root:runtime.serverRoot,
 server_digest:marker.server_digest,dispatcher_digest:marker.dispatcher_digest,sdk_digest:marker.sdk_digest,qualified_core_sha256:hashes,
 native_host_observed:false,installation_performed:false,connection_config_written:false};
fs.writeFileSync(join(evidence,'RUNTIME_QUALIFICATION'+suffix+'.json'),JSON.stringify(preparation,null,2)+'\n');
console.log(JSON.stringify(preparation));
