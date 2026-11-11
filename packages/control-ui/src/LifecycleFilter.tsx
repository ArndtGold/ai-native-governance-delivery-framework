import { SelectionFilter } from './StatusFilter';

export const lifecycleOptions = [
  { value: '', label: 'Alle' }, { value: 'active', label: 'Aktiv' },
  { value: 'completed', label: 'Abgeschlossen' }, { value: 'superseded', label: 'Abgelöst' },
  { value: 'abandoned', label: 'Abgebrochen' },
];
export function LifecycleFilter({ value, unknown, onChange }: { value: string; unknown: boolean; onChange: (value: string) => void }) {
  return <SelectionFilter label="Lifecycle" value={value} options={unknown || value === 'unknown'
    ? [...lifecycleOptions, { value: 'unknown', label: 'Unbekannt' }] : lifecycleOptions} onChange={onChange}/>;
}
