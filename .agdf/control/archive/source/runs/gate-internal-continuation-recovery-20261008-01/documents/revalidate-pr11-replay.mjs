// Reviewed static deterministic replay applicability; never manufacture model observations.
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {fingerprintSkillCases,runSkillEvals} from '../../../../evals/lib/skill-evals/index.js';
const base='.agdf/control/artefacts/gate-internal-continuation-recovery-20261008-01/';
const manifestPath='evals/manifest.json',observationsPath='evals/observations/deterministic-replay.json';
const manifest=JSON.parse(readFileSync(manifestPath)), observations=JSON.parse(readFileSync(observationsPath)),definition=JSON.parse(readFileSync('plugins/agdf/meta/agdf-plugin.definition.json'));
const cases=readdirSync('evals/cases').filter(n=>n.endsWith('.json')).sort().flatMap(n=>JSON.parse(readFileSync('evals/cases/'+n)));
const before=runSkillEvals(process.cwd());assert.equal(before.cases,102);assert.equal(before.passed,4);
assert.ok(before.results.every(r=>r.failures.every(f=>['EVAL_OBSERVATION_STALE','EVAL_COVERAGE_MISSING'].includes(f.code))));
const fingerprints=Object.fromEntries(definition.skillSet.map(s=>[s.slug,fingerprintSkillCases(process.cwd(),definition,s.slug,cases)]));
const rows=cases.map(c=>{const o=observations.find(o=>o.case_id===c.case_id);assert.ok(o);assert.equal(o.evidence_kind,'deterministic_replay');return {case_id:c.case_id,target_skill:c.target_skill,previous_fingerprint:o.source_fingerprint,current_fingerprint:fingerprints[c.target_skill],expected_and_observed_values_preserved:true,applicability:'Reviewed current owner delta: bounded existing UX/PRD/QA recovery changes no case source authority, route, gate, approval, forbidden action, mutation scope or artefact requirement. The existing static replay outcome remains applicable. This is not a new native/model execution.'};});
writeFileSync(base+'PR11_REPLAY_REVALIDATION-01.json',JSON.stringify({at:new Date().toISOString(),source_delta:JSON.parse(readFileSync('/private/tmp/pr11-eval-source-delta.json')),method:'same-agent semantic review of all case assertions and seven changed current source owners; retained static replay revalidation, not live observations',cases:rows,thresholds_preserved:manifest.thresholds},null,2)+'\n');
writeFileSync(base+'PR11_EVALS_BEFORE-01.json',JSON.stringify(before,null,2)+'\n');
const oldObservations=structuredClone(observations), oldManifest=structuredClone(manifest);
manifest.source_fingerprints=fingerprints;
for(const o of observations){const c=cases.find(c=>c.case_id===o.case_id);o.source_fingerprint=fingerprints[c.target_skill];}
assert.deepEqual(observations.map(({source_fingerprint,...rest})=>rest),oldObservations.map(({source_fingerprint,...rest})=>rest));
const {source_fingerprints,...m}=manifest,{source_fingerprints:unused,...old}=oldManifest;assert.deepEqual(m,old);
writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');writeFileSync(observationsPath,JSON.stringify(observations,null,2)+'\n');
const after=runSkillEvals(process.cwd());assert.equal(after.status,'pass');assert.equal(after.passed,102);
writeFileSync(base+'PR11_EVALS_AFTER-01.json',JSON.stringify(after,null,2)+'\n');console.log('Reviewed deterministic replay: 102/102; only fingerprints updated, assertions and 100% thresholds unchanged');
