import {readFileSync,writeFileSync,rmSync,cpSync,existsSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {prepareLocalMarketplace} from '../../../../packages/cli/lib/installers/local-marketplace.js';
import {digestDirectory} from '../../../../packages/core/lib/runtime/plugin-provenance.js';
const root=process.cwd(), out=join(root,'.agdf/control/artefacts/gate-internal-continuation-recovery-20261008-01');
const sha=p=>'sha256:'+createHash('sha256').update(readFileSync(p)).digest('hex');
const built=join(root,'packages/cli/generated/plugins/agdf');
const snapshot=prepareLocalMarketplace({dataRoot:join(root,'dist/local/gate-continuation-qualification'),builtPluginRoot:built,expectedVersion:'0.14.5',snapshotSource:true});
snapshot.commit();
const fixtures=JSON.parse(readFileSync(join(out,'native-fixtures.json')));
if(!/^\/private\/tmp\/agdf-gate-qualification-[a-zA-Z0-9]+$/u.test(fixtures.bundle))throw Error('Unexpected fixture bundle');
fixtures.setup_runtime_manifest=JSON.parse(readFileSync(join(fixtures.plugin,'runtime/runtime-manifest.json')));
rmSync(fixtures.plugin,{recursive:true});cpSync(built,fixtures.plugin,{recursive:true});
fixtures.candidate_prepared_at=new Date().toISOString();
fixtures.candidate_runtime_manifest=JSON.parse(readFileSync(join(fixtures.plugin,'runtime/runtime-manifest.json')));
fixtures.setup_applicability='Synthetic setup uses unchanged canonical approval/artefact writers and initial Brownfield no-UX scope. No native behavior has been observed. Test-owned plugin bundle refreshed to the final candidate before qualification.';
writeFileSync(join(out,'native-fixtures.json'),JSON.stringify(fixtures,null,2));
const changed=execFileSync('git',['diff','--name-only'],{encoding:'utf8'}).trim().split('\n').filter(p=>p&&!p.startsWith('.agdf/'));
const added=execFileSync('git',['ls-files','--others','--exclude-standard','packages/core/lib'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
const files=Object.fromEntries([...new Set([...changed,...added])].sort().filter(existsSync).map(p=>[p,sha(p)]));
const installed='/Users/arndtgold/.codex/plugins/cache/agdf/agdf/0.14.5+codex.local-f71d0e16599d';
const result={at:new Date().toISOString(),source_head:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),source_files:files,
 source_tree_fingerprint:'sha256:'+createHash('sha256').update(JSON.stringify(files)).digest('hex'),
 candidate:{marketplace:snapshot.root,plugin_root:snapshot.pluginRoot,canonical_version:snapshot.version,codex_install_version:snapshot.codexInstallVersion,source_digest:snapshot.sourceDigest,plugin_digest:snapshot.digest,runtime_digest:snapshot.runtimeDigest},
 generated:{runtime_manifest:JSON.parse(readFileSync(join(built,'runtime/runtime-manifest.json'))),locales:sha(join(built,'meta/agdf-interaction-locales.json')),quality_contract:sha(join(built,'meta/contracts/quality.md'))},
 assembled:{root:join(root,'dist/npm/create-agdf'),directory_digest:digestDirectory(join(root,'dist/npm/create-agdf')),assembly_manifest:sha(join(root,'dist/npm/assembly.json'))},
 loaded_binding:{root:installed,runtime_manifest:JSON.parse(readFileSync(join(installed,'runtime/runtime-manifest.json'))),locales:sha(join(installed,'meta/agdf-interaction-locales.json')),observation:'Current trusted dispatcher binding plus on-disk manifest, not a new native candidate session'},
 host:{supported_surface:'codex',desktop_version:'not independently observed in this turn',configured_model:'gpt-6.1-sol',configured_reasoning_effort:'high',active_native_model:'not independently observed in this turn',node:process.version,node_executable:process.execPath},
 native_qualification:{status:'not_observed',fixtures_manifest:join(out,'native-fixtures.json'),case_count:fixtures.cases.length},activated:false,authorizes:false};
writeFileSync(join(out,'CANDIDATE-01.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify({prepared:result.candidate,native_cases:fixtures.cases.length,activated:false}));
