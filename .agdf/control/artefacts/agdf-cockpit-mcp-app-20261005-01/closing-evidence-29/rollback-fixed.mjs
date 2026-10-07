import assert from 'node:assert/strict';
import { readFileSync,writeFileSync,readdirSync,lstatSync,readlinkSync,existsSync,renameSync,unlinkSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join,relative } from 'node:path';
import { createHash } from 'node:crypto';
import { inspectMcpServerPackage,createMcpRuntimeRetirementTransaction } from '/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/packages/cli/lib/mcp-lifecycle/package.js';
const root='/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework';
const config=join(root,'.codex/config.toml'), prepPath=join(root,'dist/local/codex-cockpit/preparation.json');
const dataRoot=join(root,'dist/local/codex-cockpit/runtime'), hash=b=>createHash('sha256').update(b).digest('hex');
const configBefore=readFileSync(config),statBefore=lstatSync(config),prepBefore=readFileSync(prepPath);
assert(!statBefore.isSymbolicLink() && statBefore.isFile());
assert.equal(hash(configBefore),'9a0a10a5ff4eb139d05946ec610ae7432bf595bfca469ad8a07ad6bd0f4401a9');
assert.equal(configBefore.toString(),readFileSync(join(root,'dist/local/codex-cockpit/codex-project-config.toml'),'utf8'));
assert.equal((configBefore.toString().match(/^\[/gm)||[]).length,1,'only the exact owned named registration may be removed');
const prep=JSON.parse(prepBefore),before=inspectMcpServerPackage({dataRoot,expectedVersion:'0.14.5'});
assert.equal(before.status,'matched');assert.equal(before.references.length,0);assert.equal(before.digest,prep.server_digest);assert.equal(before.dispatcherDigest,prep.dispatcher_digest);assert.equal(before.sdkDigest,prep.sdk_digest);
function assertNoProcess(){const result=spawnSync('/bin/ps',['-axo','pid=,command='],{encoding:'utf8'});assert.equal(result.status,0);assert.equal(result.stdout.split('\n').filter(line=>line.trim().replace(/^\d+\s+/,'').startsWith(prep.node+' '+before.entrypoint+' ')).length,0,'named process must be stopped before retiring owned runtime');}
function inventory(dir){const out={};function walk(path){for(const name of readdirSync(path).sort()){const p=join(path,name),s=lstatSync(p);if(s.isSymbolicLink())out[relative(dir,p)]={link:readlinkSync(p)};else if(s.isDirectory())walk(p);else out[relative(dir,p)]={digest:hash(readFileSync(p)),bytes:s.size,mode:s.mode};}}walk(dir);return out;}
function replaceConfig(expected,next){assert.deepEqual(readFileSync(config),expected,'foreign configuration edit must never be overwritten');assert(!lstatSync(config).isSymbolicLink());const tmp=join(root,'.codex/.config-cockpit-rollback-29-'+process.pid+'.tmp');try{writeFileSync(tmp,next,{flag:'wx',mode:statBefore.mode&0o777});assert.deepEqual(readFileSync(config),expected);renameSync(tmp,config);}finally{if(existsSync(tmp))unlinkSync(tmp);}}
const files=inventory(before.root),tx=createMcpRuntimeRetirementTransaction(before),empty=Buffer.alloc(0);
const proof={schema_version:'1',run_id:'agdf-cockpit-mcp-app-20261005-01',starting_revision_id:'043bf9c7-f24c-4830-92a0-2905277dd029',authorizes:false,started_at:new Date().toISOString(),before,config_before_digest:hash(configBefore),preparation_digest:hash(prepBefore),operation:'exact owned named project registration removed; owned runtime retired with existing transaction; same bytes restored; no rebuild or deletion commit',global_or_plugin_configuration_changed:false};
writeFileSync('/private/tmp/cockpit-config-before-29-fixed.toml',configBefore,{mode:0o600});
let removed=false,applied=false;
try{assertNoProcess();assert.equal(hash(readFileSync(prepPath)),hash(prepBefore));replaceConfig(configBefore,empty);removed=true;assertNoProcess();tx.apply();applied=true;assert.equal(existsSync(before.root),false);assert.equal(existsSync(before.entrypoint),false);assert.deepEqual(inventory(tx.retiredRoot),files);assert.equal(readFileSync(config).length,0);proof.registration_removed=true;proof.registered_output_absent=true;proof.retired_files_preserved=true;}
finally{try{if(applied)tx.rollback();}finally{if(removed)replaceConfig(empty,configBefore);}}
assert.deepEqual(inventory(before.root),files);assert.deepEqual(readFileSync(config),configBefore);assert.deepEqual(readFileSync(prepPath),prepBefore);assert.equal(existsSync(tx.retiredRoot),false);assertNoProcess();
proof.after=inspectMcpServerPackage({dataRoot,expectedVersion:'0.14.5'});assert.equal(proof.after.status,'matched');proof.config_exactly_restored=true;proof.runtime_exactly_restored=true;proof.files_restored=Object.keys(files).length;proof.completed_at=new Date().toISOString();proof.native_reconnect='not yet verified; old host channel must be reopened by host';
writeFileSync('/private/tmp/cockpit-owned-rollback-29-fixed.json',JSON.stringify(proof,null,2)+'\n');
console.log(JSON.stringify({status:'pass',registration_removed:true,registered_output_absent:true,files_restored:proof.files_restored,config_exactly_restored:true,runtime_exactly_restored:true,server_digest:before.digest}));
