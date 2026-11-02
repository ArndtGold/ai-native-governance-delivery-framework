import {mkdtempSync,mkdirSync,readFileSync,writeFileSync,existsSync,cpSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {prepareLocalMarketplace} from '/private/tmp/agdf-cockpit-cli-source/packages/cli/lib/installers/local-marketplace.js';
import {inspectCodexCockpitPlugin} from '/private/tmp/agdf-cockpit-cli-source/packages/cli/lib/mcp-lifecycle/adapters/codex.js';
const root=mkdtempSync('/private/tmp/agdf-codex-lifecycle-20261018-');
for(const name of ['codex-home','project','evidence'])mkdirSync(join(root,name));
const production=['/Users/arndtgold/.codex/config.toml','/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/.codex/config.toml',...['agdf','agdf.backup'].flatMap(name=>['.agdf-owned.json','.agents/plugins/marketplace.json','plugins/agdf/mcp.json','plugins/agdf/.codex-plugin/plugin.json'].map(file=>'/Users/arndtgold/Library/Application Support/agdf/marketplaces/'+name+'/'+file)),'/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf.transaction.json'];
const before=Object.fromEntries(production.map(path=>[path,existsSync(path)?createHash('sha256').update(readFileSync(path)).digest('hex'):null]));
writeFileSync(join(root,'evidence','production-before.json'),JSON.stringify(before,null,2)+'\n');
const packages=[];
for(const [label,source] of [['old','/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf.backup/plugins/agdf'],['candidate','/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf/plugins/agdf']]){
 const dataRoot=join(root,label+'-data');
 const sourceCopy=join(root,label+'-source'); cpSync(source,sourceCopy,{recursive:true});
 // Installed manifests carry a local version. Restore canonical build input only
 // in this disposable copy; the normal owner recreates its local version.
 for(const rel of ['.codex-plugin/plugin.json','.agents/plugins/plugin.json']){
   const path=join(sourceCopy,rel);if(!existsSync(path))continue;
   const manifest=JSON.parse(readFileSync(path,'utf8'));manifest.version='0.14.5';writeFileSync(path,JSON.stringify(manifest,null,2)+'\n');
 }
 const prepared=prepareLocalMarketplace({dataRoot,builtPluginRoot:sourceCopy,expectedVersion:'0.14.5',snapshotSource:true});
 const identity=inspectCodexCockpitPlugin(prepared.pluginRoot);
 const originalIdentity=inspectCodexCockpitPlugin(source);
 if(identity.status!=='matched'||identity.digest!=='sha256:'+prepared.sourceDigest||identity.digest!==originalIdentity.digest)throw Error('prepared identity mismatch');
 const declaration=JSON.parse(readFileSync(join(prepared.pluginRoot,'mcp.json'),'utf8'));
 for(const row of Object.values(declaration.mcpServers)){
   if(!row.args[0].startsWith(root+'/')||!row.args[4].startsWith(root+'/'))throw Error('unsafe test launcher paths');
 }
 prepared.commit();
 packages.push({label,source,dataRoot,pluginRoot:prepared.pluginRoot,marketplaceRoot:prepared.root??join(dataRoot,'marketplaces/agdf'),version:prepared.codexInstallVersion,sourceDigest:prepared.sourceDigest,identity,declaration});
}
const state={schema_version:1,authorizes:false,root,home:join(root,'codex-home'),project:join(root,'project'),evidence:join(root,'evidence'),packages,production};
writeFileSync(join(root,'state.json'),JSON.stringify(state,null,2)+'\n');
console.log(JSON.stringify({root,state:join(root,'state.json'),packages:packages.map(p=>({label:p.label,version:p.version,digest:p.sourceDigest}))}));
