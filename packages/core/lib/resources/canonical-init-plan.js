import { readFileSync, lstatSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { resources } from './context.js';
import { resolveLanguagePreference, languageConfigContent } from './language-preference.js';
import { resolveArtefactTemplatePath } from './artefact-templates.js';
import { containedRegularFile, hasSymlinkComponent } from '../control-state/contained-file.js';

// Fixed canonical seeds; callers supply only language.
export function canonicalInitPlan(languagePreference, context = resources) {
  const language = typeof languagePreference === 'object' && languagePreference !== null
    ? languagePreference : resolveLanguagePreference(languagePreference, undefined, context);
  const root = context.templatesRoot;
  if (!root || lstatSync(root).isSymbolicLink()) throw Error('canonical_init_resources_unavailable');
  const load = (base, relative) => {
    if (hasSymlinkComponent(base, relative)) throw Error('canonical_init_resources_unsafe');
    const file = containedRegularFile(base, relative);
    if (file.status !== 'valid' || lstatSync(file.path).size > 131072) throw Error('canonical_init_resources_unavailable');
    return readFileSync(file.path, 'utf8');
  };
  const files = [{ path: '.agdf/control/config.json', content: languageConfigContent(language) },
    { path: '.agdf/control/README.md', content: load(dirname(root), 'README.md') }];
  for (const name of ['SOT_REGISTRY.md', 'CONTEXT_GRAPH.md', 'AGENT_QUALITY_CONTRACTS.json'])
    files.push({ path: `.agdf/control/${name}`, content: load(root, name) });
  for (const id of ['UR', 'BROWNFIELD_REVIEW', 'VERIFIED_CHANGE', 'PRD', 'UX_INTENT_DEFINITION', 'SD', 'TP', 'QA_REPORT', 'OR']) {
    resolveArtefactTemplatePath(id, context);
    files.push({ path: `.agdf/control/templates/artefacts/${id}.md`, content: load(root, `artefacts/${id}.md`) });
  }
  if (files.reduce((n, f) => n + Buffer.byteLength(f.content), 0) > 524288) throw Error('canonical_init_plan_budget_exceeded');
  return files;
}
