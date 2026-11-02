// Prepare an immutable candidate through the existing snapshot/provenance owner; no live switch.
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {prepareLocalMarketplace} from '../../../../packages/cli/lib/installers/local-marketplace.js';
import {digestPluginMcpDispatcherSource} from '../../../../packages/core/lib/runtime/plugin-provenance.js';
const root=process.cwd(),out='.agdf/control/artefacts/gate-internal-continuation-recovery-20261008-01/';
const tx=prepareLocalMarketplace({dataRoot:join(root,'dist/local/owner-recovery-qualification'),builtPluginRoot:join(root,'packages/cli/generated/plugins/agdf'),expectedVersion:'0.14.5',snapshotSource:true});
tx.commit();
const candidate={at:new Date().toISOString(),canonical_version:tx.version,codex_install_version:tx.codexInstallVersion,source_digest:tx.sourceDigest,plugin_digest:tx.digest,runtime_digest:tx.runtimeDigest,mcp_dispatcher_digest:digestPluginMcpDispatcherSource(join(tx.pluginRoot,'runtime/create-agdf'),tx.version),plugin_root:tx.pluginRoot,marketplace:tx.root,generated_manifest:JSON.parse(readFileSync('packages/cli/generated/plugins/agdf/runtime/runtime-manifest.json')),scope:'QF-003 unique already validated upstream targets in existing reason; no route, schema, phase, authority, locale or installer change',activated:false};
writeFileSync(out+'OWNER_CANDIDATE-01.json',JSON.stringify(candidate,null,2)+'\n');
writeFileSync(out+'QUALIFICATION_PLAN-05.md',`# Upstream owner diagnosis qualification

Prepared before live switch. Candidate ${candidate.codex_install_version}; source ${candidate.source_digest}; CLI runtime ${candidate.runtime_digest}; selected MCP dispatcher ${candidate.mcp_dispatcher_digest}. Different coverage, not interchangeable hashes.

Scope: QF-003 only adds unique validated upstream targets to the existing reason in qa-follow-up.js. Existing quality route table, terminal disposition, permissions, report schema, renderer and locale owners remain authoritative. Regression first reproduced missing SD; now verify SD and deduplicated SD/PRD in actual packaged EN/DE cards, terminal true and entire control no-write.

Finish OWNER_CHECKS-01.json; use canonical pinned reversible local installer under existing user authorization, preserve separate cockpit config, fresh stdio plus actual desktop MCP identity before behavior. In the already authorized independent test chat, use unchanged qa-upstream fixture for one fresh actual terminal SD card; exact final text and no later tool, parent compares full control bytes and approved source hashes. No new thread or model override.

Retain SUMMARY_CHECKS, root FINAL_NATIVE_OBSERVATIONS and independent FINAL_QUALIFICATION_EVIDENCE-08 by explicit applicability: PRD validation, UX correction, unchanged stop, evidence/implementation follow-up and QA recording, revision replay, invalid findings/input, external gap and pure status do not consume the changed upstream reason. Old generic upstream card is historical failure only. Fresh upstream observation and changed source/package/runtime tests are required; previous identities cannot qualify changed bytes. All prompt events, failed adapter attempts and limits remain. Fresh native displayed readability remains a separate observation requirement; no fabricated visual proof. No approved UR/PRD/SD/TP edit, QA approval, VCS or release action.
`);
console.log(JSON.stringify(candidate));
