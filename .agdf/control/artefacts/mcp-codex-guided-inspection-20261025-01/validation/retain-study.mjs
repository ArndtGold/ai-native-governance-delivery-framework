import assert from 'node:assert/strict';
import { readdirSync, lstatSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, basename, resolve, relative } from 'node:path';
import { createHash } from 'node:crypto';
const output=resolve(process.argv[2]);const entries=[];
const sha=b=>createHash('sha256').update(b).digest('hex');
function add(source,destination,cohort,manifest={}) {
 const stat=lstatSync(source);assert(!stat.isSymbolicLink(),source);
 if(stat.isDirectory()){for(const name of readdirSync(source).sort())add(join(source,name),join(destination,name),cohort,manifest);return;}
 assert(stat.isFile()&&!/auth\.json|credential/i.test(basename(source)),source);
 const data=readFileSync(source),hash=sha(data);const rel=relative(cohort,source);
 if(manifest[rel])assert.equal(hash,manifest[rel].replace(/^sha256:/,''),source);
 entries.push({source,destination:relative(output,destination),bytes:data.length,sha256:hash,cohort,original_manifest_verified:!!manifest[rel]});
}
for(const group of ['agdf-inspect-evaluation','agdf-inspect-agent-ab','agdf-inspect-projection']) {
 const source='/private/tmp/'+group;const manifestPath=join(source,'artifact-manifest.json');let manifest={};
 try{manifest=JSON.parse(readFileSync(manifestPath));}catch(e){if(e.code!=='ENOENT')throw e;}
 for(const name of readdirSync(source).sort())if(/\.(?:json|md|mjs|py|log)$/.test(name))add(join(source,name),join(output,group,name),source,manifest);
 for(const name of group==='agdf-inspect-projection'?['protocol']:['evidence'])add(join(source,name),join(output,group,name),source,manifest);
}
const root=process.cwd();for(const rep of ['repetition-01','repetition-02'])for(const name of ['events.jsonl','rollouts.jsonl']){
 const s=join(root,'.agdf/control/artefacts/mcp-contract-completeness-20261025-01/evidence/c2-native',rep,name);add(s,join(output,'c2-native',rep,name),'retained-c2-native');
}
mkdirSync(output,{recursive:false});writeFileSync(join(output,'selection-before-copy.json'),JSON.stringify(entries,null,2)+'\n');
for(const row of entries){const target=join(output,row.destination);mkdirSync(resolve(target,'..'),{recursive:true});const bytes=readFileSync(row.source);assert.equal(sha(bytes),row.sha256);writeFileSync(target,bytes,{flag:'wx'});assert.equal(sha(readFileSync(target)),row.sha256);}
writeFileSync(join(output,'retention-index.json'),JSON.stringify({classification:'selected_immutable_bundle_not_full_study_checkout',model_invocations:0,entries},null,2)+'\n');
console.log(JSON.stringify({files:entries.length,bytes:entries.reduce((s,r)=>s+r.bytes,0),manifest_relationships:entries.filter(r=>r.original_manifest_verified).length}));
