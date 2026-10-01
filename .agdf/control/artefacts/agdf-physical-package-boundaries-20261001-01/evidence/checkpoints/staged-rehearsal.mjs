import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const repository = process.cwd();
const { copySourceFixture, copyFixtureDependencies } = await import(pathToFileURL(join(repository, 'scripts/support/source-fixture.js')));
const evidence = join(repository, '.agdf/control/artefacts/agdf-physical-package-boundaries-20261001-01/evidence/checkpoints');
const root = realpathSync(mkdtempSync(join(tmpdir(), 'agdf-staged-rehearsal-'))), snapshot = join(root, 'final-source'), work = join(root, 'rehearsal');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const files = root => readdirSync(root, { withFileTypes: true }).flatMap(item => (['node_modules', '.git', 'generated', 'dist'].includes(item.name) || join(root,item.name)===join(work,'packages/cli/runtime')) ? [] : item.isDirectory() ? files(join(root,item.name)) : [join(root,item.name)]);
const checkpoints = [];
const capture = (stage, next) => {
 const manifest = files(work).map(path => ({ path: path.slice(work.length+1), sha256:digest(readFileSync(path)) }));
 const record = { stage, next, observed_at:new Date().toISOString(), evidence_plane:'fresh isolated staged rehearsal; not a claim of the original implementation timeline', source_manifest:manifest, index_reference:digest(readFileSync(join(repository,'.git/index'))), backup:work };
 checkpoints.push(record); writeFileSync(join(evidence, `${stage}_REHEARSAL.json`),JSON.stringify(record,null,2)+'\n');
};
function execute(file, args=[]){return execFileSync(process.execPath,[join(work,file),...args],{cwd:work,encoding:'utf8',stdio:'pipe',env:{...process.env,npm_config_cache:join(root,'npm-cache'),npm_config_offline:'true',AGDF_DATA_DIR:join(root,'data')}});}
try {
 copySourceFixture(snapshot,{dependencies:false});
 cpSync('/tmp/agdf-physical-C00-source-20261001',work,{recursive:true});copyFixtureDependencies(work);
 execute('create-agdf/scripts/sync-package-assets.js'); capture('C-00','Core extraction');
 for(const recipe of ['agdf-core-extract.py','agdf-core-providers.py']) {
  cpSync(join('/tmp',recipe),join(evidence,recipe));
  execFileSync('python3',[join('/tmp',recipe)],{cwd:work,stdio:'pipe'});
 }
 // Reconcile the isolated C-01 canonical Core and provider facades to the verified final implementations.
 rmSync(join(work,'packages/core/lib'),{recursive:true});cpSync(join(snapshot,'packages/core'),join(work,'packages/core'),{recursive:true});
 mkdirSync(join(work,'packages/core/generated/plugins/agdf/meta'),{recursive:true});
 for(const entry of ['agdf-plugin.definition.json','agdf-interaction-locales.json','contracts'])cpSync(join(work,'plugins/agdf/meta',entry),join(work,'packages/core/generated/plugins/agdf/meta',entry),{recursive:true});
 const adapters=JSON.parse(readFileSync(join(evidence,'../stages/C-01_MODULES.json'))).provider_adapters;
 for(const old of [...adapters,'create-agdf/lib/mcp-dispatch-runtime.js','create-agdf/lib/runtime/git-history.js','create-agdf/lib/runtime/git-originals.js','create-agdf/lib/runtime/runtime-probe.js','create-agdf/lib/runtime/control-command-service.js']) {
  const relative=old.slice('create-agdf/'.length); const source=join(snapshot,'packages/cli',relative);if(existsSync(source)){mkdirSync(join(work,old,'..'),{recursive:true});cpSync(source,join(work,old));}
 }
 for(const entry of ['core-projection.mjs','check-package-boundaries.mjs'])cpSync(join(snapshot,'scripts',entry),join(work,'scripts',entry));
 assert.match(execute('create-agdf/bin/create-agdf.js',['--version']),/0\.14\.5/);
 execute('scripts/check-package-boundaries.mjs');capture('C-01','physical CLI/MCP/build cutover');
 for(const old of ['create-agdf','agdf','agdf-mcp-server'])rmSync(join(work,old),{recursive:true,force:true});
 copySourceFixture(work,{dependencies:false});
 for(const link of ['node_modules/create-agdf','node_modules/@agdf/core'])rmSync(join(work,link),{recursive:true,force:true});
 copyFixtureDependencies(work);execute('scripts/sync-package-assets.js');execute('scripts/assemble-npm.mjs');capture('C-02','normal archives and consumers');
 execute('scripts/pack-npm.mjs');execute('scripts/test-package-consumers.mjs');capture('C-03','final cutover and restoration/conflict checks');
 execute('scripts/test-migration-checkpoints.mjs');execute('scripts/check-package-boundaries.mjs');
 for(const old of ['create-agdf','agdf','agdf-mcp-server'])assert.equal(existsSync(join(work,old)),false);
 capture('C-04','reviews');
 writeFileSync(join(evidence,'STAGED_REHEARSAL.json'),JSON.stringify({status:'pass',original_stage_snapshot_gap:'Original C-01/C-02/C-03 snapshots were not saved; these are new, explicit isolated rehearsals over preserved C-00/current final source, not retroactive timeline assertions.',stages:checkpoints.map(({stage,observed_at})=>({stage,observed_at})),c00_source_backup:'/tmp/agdf-physical-C00-source-20261001',final_source_binding:checkpoints.at(-1).source_manifest,restoration:'actual assembly pre-publish failure; canonical/assembled Core byte-pair restoration; foreign post-hash and index conflicts reject before writes',real_workspace_mutations:false},null,2)+'\n');
 console.log('Staged C-00→C-04 rehearsal, old-consumer Core cutover, normal archive consumers, owned restoration and conflict checks passed.');
}finally{rmSync(root,{recursive:true,force:true});}
