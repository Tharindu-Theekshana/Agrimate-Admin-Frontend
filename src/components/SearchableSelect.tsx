import { useEffect, useRef, useState } from 'react';

export interface SearchableSelectOption {
  value: number;
  label: string;
  keywords?: string;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: SearchableSelectOption[];
  value: number | '';
  onChange: (value: number | '') => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = query.trim()
    ? options.filter((o) => `${o.label} ${o.keywords ?? ''}`.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <input
        value={open ? query : (selected?.label ?? '')}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setOpen(true);
          setQuery('');
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false);
            setQuery('');
            e.currentTarget.blur();
          }
        }}
        placeholder={placeholder ?? 'Search…'}
        style={{ width: '100%' }}
      />
      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 20,
            marginTop: 4,
            maxHeight: 240,
            overflowY: 'auto',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            boxShadow: 'var(--shadow)',
          }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '10px 12px', color: 'var(--ink-faint)', fontSize: 13 }}>No matches</div>
          ) : (
            filtered.map((o) => (
              <div
                key={o.value}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                  setQuery('');
                }}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: 13,
                  background: o.value === value ? 'var(--pale)' : 'transparent',
                }}>
                {o.label}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
