import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Icon } from './mcp/Icon';

export function StatusFilter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return <SelectionFilter label={label} value={value} options={[{value:'', label:'Alle Status'}, ...options.map(item => ({value:item, label:item}))]} onChange={onChange}/>;
}

export function areaCount(count: number | null, coverage: 'complete' | 'partial' | 'unavailable') {
  if (count === null || coverage === 'unavailable') return 'Anzahl nicht verfügbar';
  if (coverage === 'partial') return `Mindestens ${count} Vorhaben`;
  return count === 0 ? 'Keine Vorhaben' : `${count} Vorhaben`;
}

export function SelectionFilter({ label, value, options, onChange, focusId }: { label: string; value: string; options: { value: string; label: string; detail?: string }[]; onChange: (value: string) => void; focusId?: string }) {
  const id = useId(), root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false), [active, setActive] = useState(0);
  const values = options.map(option => option.value);
  useEffect(() => {
    if (!open) return;
    const dismiss = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, [open]);
  useEffect(() => { if (open) document.getElementById(`${id}-option-${active}`)?.scrollIntoView?.({ block: 'nearest' }); }, [open, active, id]);
  const show = () => { setActive(Math.max(0, values.indexOf(value))); setOpen(true); };
  const choose = (index: number) => { onChange(values[index]); setOpen(false); };
  const keyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Escape' && open) { event.preventDefault(); setOpen(false); }
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) show(); else setActive(index => (index + (event.key === 'ArrowDown' ? 1 : -1) + values.length) % values.length);
    } else if (open && (event.key === 'Home' || event.key === 'End')) { event.preventDefault(); setActive(event.key === 'Home' ? 0 : values.length - 1); }
    else if (open && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); choose(active); }
    else if (event.key === 'Tab') setOpen(false);
  };
  return <div className="backlog-filter" ref={root}>
    <span id={`${id}-label`}>{label}</span>
    <button type="button" role="combobox" data-focus-id={focusId} aria-labelledby={`${id}-label`} aria-expanded={open} aria-controls={`${id}-list`} aria-haspopup="listbox"
      aria-activedescendant={open ? `${id}-option-${active}` : undefined} onKeyDown={keyDown} onClick={() => open ? setOpen(false) : show()}>
      <span>{options.find(option => option.value === value)?.label ?? 'Nicht verfügbar'}</span><span className="backlog-filter-chevron" aria-hidden="true">⌄</span>
    </button>
    {open && <div className="backlog-filter-menu" role="listbox" id={`${id}-list`} aria-labelledby={`${id}-label`}>
      {values.map((item, index) => <div role="option" id={`${id}-option-${index}`} aria-selected={item === value} data-active={index === active} key={item || 'all'}
        onMouseEnter={() => setActive(index)} onMouseDown={event => event.preventDefault()} onClick={() => choose(index)}>
        <span>{options[index].label}</span>{options[index].detail && <span className="backlog-filter-detail">{options[index].detail}</span>}{item === value && <Icon name="check"/>}
      </div>)}
    </div>}
  </div>;
}
