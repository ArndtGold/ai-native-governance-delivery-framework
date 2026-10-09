// User-authorized update, pinned to the reviewed candidate. Reuses canonical installer/rollback owners.
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {installCodexGlobalPlugin} from '../../../../packages/cli/lib/host-adapters/codex/plugin.js';
import {prepareLocalMarketplace,defaultAgdfDataRoot} from '../../../../packages/cli/lib/installers/local-marketplace.js';
const root=process.cwd(),base=join(root,'.agdf/control/artefacts/gate-internal-continuation-recovery-20261008-01');
const candidate=JSON.parse(readFileSync(join(base,'CANDIDATE-01.json')));
const sha=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const cockpitConfig=join(root,'.codex/config.toml'),cockpitBefore=sha(cockpitConfig);
const prepare=options=>{
 const tx=prepareLocalMarketplace({...options,dataRoot:defaultAgdfDataRoot(),builtPluginRoot:join(root,'packages/cli/generated/plugins/agdf'),snapshotSource:true});
 if(tx.sourceDigest!==candidate.candidate.source_digest || tx.runtimeDigest!==candidate.candidate.runtime_digest || tx.codexInstallVersion!==candidate.candidate.codex_install_version){tx.rollback();throw Error('Candidate identity changed; no host switch permitted');}
 return tx;
};
try{
 const result=installCodexGlobalPlugin({prepare});
 const cockpitAfter=sha(cockpitConfig);if(cockpitBefore!==cockpitAfter)throw Error('Separate cockpit config changed');
 writeFileSync(join(base,'INSTALLATION-01.json'),JSON.stringify({at:new Date().toISOString(),authorization:'Current deliberate user confirmation of the prepared candidate installation, connection and qualification',...result,cockpit_config_sha256:cockpitAfter,cockpit_unchanged:true,qualification:'not yet observed'},null,2)+'\n');
 console.log(JSON.stringify({installed:result.installedVersion,verification:result.verificationStatus,runtime_digest:result.runtimeDigest,source_digest:result.sourceDigest,evidence:result.evidence}));
}catch(error){writeFileSync(join(base,'INSTALLATION_ERROR-01.json'),JSON.stringify({at:new Date().toISOString(),message:error.message,evidence:error.evidence??null},null,2)+'\n');throw error;}
