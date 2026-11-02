import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdtempSync,readFileSync,writeFileSync,realpathSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';
import {join,resolve} from 'node:path';
const repository=process.cwd(),temporary=realpathSync(mkdtempSync('/private/tmp/agdf-cycle-final-pack-'));
const raw=JSON.parse(execFileSync('npm',['pack','--offline','--ignore-scripts','--json','--pack-destination',temporary],{cwd:resolve('dist/npm/create-agdf'),encoding:'utf8',env:{...process.env,npm_config_cache:join(temporary,'cache')}}));
const report=Array.isArray(raw)?raw[0]:raw['create-agdf'];assert.ok(report.filename.endsWith('.tgz'));
execFileSync('tar',['-xzf',report.filename],{cwd:temporary});const core=join(temporary,'package/runtime/core');
const load=path=>import(pathToFileURL(join(core,'lib',path)).href);
const{createCoreServices}=await load('index.js');assert.equal(createCoreServices().readRuntimeContract('quality').ok,true);
const groups=[['control-state/run-seal.js','control-state/run-seal-compute.js',['canonicalRunText','APPROVAL_GATES','APPROVAL_SECTIONS','runRootFromStatePath','artefactFileDigest','listedArtefactPaths','pendingArtefactPaths','approvalRecord','approvalSeal','computeRunSeals','applyRunSeals','sealRunState']],['control-state/run-state-parser.js','control-state/run-state-document.js',['scalarFields','sectionTableRows','duplicateArtefactRowTypes','parseArtefactPathCell','parseControlState']],['control-state/presentation-decision.js','control-state/decision-material-contract.js',['validDecisionMaterial','decisionMaterialVersion']],['control-evaluation/run-state.js','control-evaluation/run-state-policy.js',['userGateOrder','durableGateArtefacts','internalStepArtefacts','closeoutArtefacts','gateApprovalStatus','gateArtefactStatus','isDurableGateArtefactSatisfied','expectedDurableArtefactStatuses','describeDurableArtefactStatuses','isInternalStepSatisfied','modeSliceDecision']],['control-state/run-presentation.js','control-state/run-presentation-envelope.js',['validateRunPresentationEnvelope']]];
let exports=0;for(const[facade,owner,names]of groups){const a=await load(facade),b=await load(owner);for(const name of names){assert.ok(b[name]);assert.equal(a[name],b[name]);exports++;}}
const{canonicalRunText}=await load('control-state/run-seal.js');assert.equal(canonicalRunText('\uFEFFa\r\nb\rc'),'a\nb\rc');
const{renderPreview,PREVIEW_CSP}=await load('control-state/preview-render.js');const entry='previews/v1/index.html';
const output=renderPreview({entry},[{path:entry,media_type:'text/html',data:Buffer.from('<link rel="stylesheet" href="style.css"><p>Proof missing</p>')},{path:'previews/v1/style.css',media_type:'text/css',data:Buffer.from('p{color:inherit}') }]);
assert.ok(output.includes(PREVIEW_CSP));assert.ok(output.includes('Proof missing'));
const require=createRequire(join(core,'lib/control-state/preview-render.js'));
for(const[name,version]of [['parse5','7.3.0'],['postcss','8.5.29']]){assert.ok(require.resolve(name).startsWith(join(core,'node_modules/') ));assert.equal(JSON.parse(readFileSync(join(core,'node_modules',name,'package.json'))).version,version);}
const result={captured_at:new Date().toISOString(),files:report.files.length,tarball_sha256:createHash('sha256').update(readFileSync(join(temporary,report.filename))).digest('hex'),checks:['actual tarball outside checkout Core import','contained pinned parser resolution and renderer','canonical normalization unchanged','31 public export identities'],exports,scope:'Exact final generated package; synthetic local smoke, no native-host qualification'};
writeFileSync(join(repository,'.agdf/control/artefacts/prd-preview-review-integration-20261018-01/evidence/core-cycle-fix/final-packed-smoke.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
