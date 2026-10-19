// Agent-side orchestration of the existing publication owner; no product changes.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { settleCodexCockpitPublication } from '/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework/packages/cli/lib/installers/local-marketplace.js';
const checks=JSON.parse(readFileSync('/private/tmp/agdf-sdk-canonical-20261017/result.json','utf8'));
if (checks.length!==2 || checks.some(row=>row.exit_code!==0) || checks[1].stage!=='canonical') throw Error('Final canonical lane has not passed; no mutation allowed.');
const base='/Users/arndtgold/Library/Application Support/agdf/marketplaces/agdf';
const journal=JSON.parse(readFileSync(base+'.transaction.json','utf8'));
const source='c3bfb8c791e68cf2a681d3edb3860e632716b4183439d0669001ab65a0183a5c';
const previous='fb1def114314338c2d49ac9e03eceb3f939a23e9827e189221f35d4b39c9b235';
const target='/Users/arndtgold/Documents/GitHub/ai-native-governance-delivery-framework';
if (journal.owner!=='create-agdf'||journal.phase!=='cockpit_qualification_pending'||journal.source_digest!==source||journal.previous_source_digest!==previous||journal.cockpit_target!==target) throw Error('Pending publication has changed.');
const out='/private/tmp/agdf-sdk-native-upgrade-20261017/publication-rollback.json';
if(existsSync(out))throw Error('Refuse a repeated settlement or evidence overwrite.');
const result=settleCodexCockpitPublication({pluginRoot:base+'/plugins/agdf',target,sourceDigest:source,previousSourceDigest:previous,action:'rollback'});
writeFileSync(out,JSON.stringify({observed_at:new Date().toISOString(),authorizes:false,...result},null,2)+'\n');
console.log(JSON.stringify(result));
