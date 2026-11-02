import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {inspectMcpServerPackage} from '/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/packages/cli/lib/mcp-lifecycle/package.js';
const root='/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework';
const node='/usr/local/Cellar/node@22/22.22.3/bin/node';
const config=`${root}/.codex/config.toml`;
const original=fs.readFileSync(config,'utf8');
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
if(hash(original)!=='9a0a10a5ff4eb139d05946ec610ae7432bf595bfca469ad8a07ad6bd0f4401a9') throw Error('project config changed; review required');
const section=original.match(/^\[mcp_servers\.agdf-cockpit-local\]\n[\s\S]*?(?=^\[|$(?![\s\S]))/m);
const expected=`${node} ${root}/dist/local/codex-cockpit/runtime/0.14.5/node_modules/@agdf/mcp-server/bin/agdf-mcp.js --surface codex --cockpit-dir ${root}`;
if(!section || !section[0].includes(node) || !section[0].includes(`${root}/dist/local/codex-cockpit/runtime/`)) throw Error('named connection identity mismatch');
const inspect=()=>execFileSync('ps',['-axo','pid=,ppid=,command='],{encoding:'utf8'}).split('\n').map(line=>line.trim().match(/^(\d+)\s+(\d+)\s+(.+)$/)).filter(row=>row?.[3]===expected);
const running=inspect();
const expectedPids=new Set([]);
if(running.length!==0 || running.some(row=>!expectedPids.has(row[1]) || row[2]!=='49616')) throw Error('current named project connections changed; review required');
const baseline=JSON.parse(fs.readFileSync('/private/tmp/cockpit-document-preparation-06.json'));
const owned=inspectMcpServerPackage({dataRoot:`${root}/dist/local/codex-cockpit/runtime`,expectedVersion:'0.14.5'});
if(owned.status!=='matched' || owned.entrypoint!==expected.split(' ')[1] || owned.digest!=='39a2cfc81e905b86cd3cb2004f4efe1e908bf2f1b296a583db3f1160c0c17b24') throw Error('owned registered runtime identity mismatch');
const oldManifest=fs.readFileSync(`${root}/dist/local/codex-cockpit/preparation.json`);
fs.writeFileSync('/private/tmp/cockpit-document-project-config-backup-07.toml',original,{mode:0o600});
fs.writeFileSync('/private/tmp/cockpit-document-runtime-before-07.json',oldManifest,{mode:0o600});
const removed=original.slice(0,section.index)+original.slice(section.index+section[0].length);
let prepared;
fs.writeFileSync(config,removed);
try {
 for(const row of running) process.kill(Number(row[1]),'SIGTERM');
 const deadline=Date.now()+8000;
 for(const row of running) for(;;) {
  try {process.kill(Number(row[1]),0);} catch(error) {if(error.code==='ESRCH') break; throw error;}
  if(Date.now()>deadline) throw Error('owned connection shutdown unconfirmed');
  await new Promise(resolve=>setTimeout(resolve,100));
 }
 if(inspect().length) throw Error('new named connection started during retirement');
 const output=execFileSync(node,[`${root}/scripts/prepare-cockpit-local.mjs`,'--dir',root],{cwd:root,encoding:'utf8',maxBuffer:4*1024*1024,timeout:90000});
 fs.writeFileSync('/private/tmp/cockpit-document-active-preparation-07.log',output);
 prepared=JSON.parse(output);
 for(const key of ['server_digest','dispatcher_digest','sdk_digest']) if(prepared[key]!==baseline[key]) throw Error(`prepared identity mismatch: ${key}`);
 if(prepared.ui.digest!==baseline.ui.digest || prepared.ui.bytes!==baseline.ui.bytes) throw Error('prepared UI identity mismatch');
} finally {
 if(fs.readFileSync(config,'utf8')!==removed) throw Error('concurrent project config change; backup retained, scoped restoration required');
 fs.writeFileSync(config,original);
}
if(hash(fs.readFileSync(config))!==hash(original)) throw Error('project config restoration failed');
const result={schema_version:'1',observed_at:new Date().toISOString(),requested_action:'continued project-local activation authorized by aktiviere es; current document UX change requested by leg los',status:'current_production_prepared_for_fresh_connection',replaced_only_named_project_runtime:true,
 stopped_connections:running.map(row=>({pid:Number(row[1]),parent:Number(row[2]),exact_command:row[3]})),
 config_restored:true,config_digest:hash(original),prepared_runtime:prepared,
 actual_native_load:'not_yet_observed',historical_host_context_erasure:'not_claimed',authorizes:false};
fs.writeFileSync('/private/tmp/cockpit-document-runtime-refresh-07.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({status:result.status,config_restored:true,stopped_connections:running.length,ui:prepared.ui,record:'/private/tmp/cockpit-document-runtime-refresh-07.json'}));
