import { readWorkInventory } from '../control-state/planned-inventory.js';
import { digest, canonicalJson } from '../control-state/approval-command-contract.js';
import { COCKPIT_WORK_SECTIONS as sections } from './cockpit-list.js';

// Compatibility DTO for the existing list/session protocol. The explicit layout
// discriminator changes policy: order and per-row source identity come from Core,
// never a Markdown table, stored rank, or adapter-specific lifecycle database.
export function projectCockpitWork(root) {
  const inventory = readWorkInventory(root, { language: 'de' });
  if (inventory.state === 'unavailable') return { state: 'error', code: 'work_inventory_unavailable', data: null };
  const entries = inventory.entries.map(row => {
    const planned = row.kind === 'planned';
    const section = planned ? sections[1] : row.lifecycle === 'active' || row.lifecycle === null ? sections[0] : sections[2];
    const key = planned ? row.plan_id : row.run_id;
    return { kind: row.kind, identity: row.identity, section, key, original_key: key, title: row.title,
      stored_status: planned ? ({ ready: 'Bereit zur Übergabe', draft: 'UR in Klärung', recovery_required: 'Wiederherstellung erforderlich', unconfirmed: 'Zuordnung ungeklärt', unavailable: 'Quelle nicht verfügbar' })[row.coverage]
        : row.attention.label, scope: planned ? 'UR-Planung' : 'Run', priority: row.priority ?? null,
      stored_next_step: planned ? row.actions.join(' · ') : row.next_action ?? '', source_links: row.source.path,
      current_spec: null, source: row.source, coverage: row.coverage, actions: row.actions,
      handoff_ready: planned ? row.handoff_ready : false, planning_origins: row.planning_origins ?? [],
      selectable: planned ? row.source.digest !== null && row.coverage !== 'unavailable' : row.valid, authorizes: false };
  });
  return { state: inventory.state === 'partial' ? 'partial' : entries.length ? 'available' : 'empty',
    code: inventory.state === 'partial' ? 'work_inventory_partial' : null,
    data: { kind: 'work', layout: 'run-folders-v1', entries, diagnostics: inventory.findings,
      source_path: '.agdf/control/', content_digest: digest(canonicalJson(inventory)).slice(7),
      counts: Object.fromEntries(sections.map(section => [section, entries.filter(row => row.section === section).length])),
      planning_references: inventory.planning_references, authorizes: false } };
}
