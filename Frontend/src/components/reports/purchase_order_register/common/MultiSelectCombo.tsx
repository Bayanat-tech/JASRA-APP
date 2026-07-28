import React from 'react';

interface MultiSelectComboProps {
  value: string[];
  options: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  onOpen?: () => void;   // call once when the dropdown is opened
  loading?: boolean;     // show a "Loading…" row while true
}

export function MultiSelectCombo({
  value, options, onChange, placeholder = 'Select...', disabled = false, onOpen, loading = false,
}: MultiSelectComboProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (disabled) { setIsOpen(false); setSearch(''); }
  }, [disabled]);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filteredOptions = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  const toggleOption = (opt: string) => {
    if (disabled) return;
    onChange(value.includes(opt) ? value.filter(v => v !== opt) : [...value, opt]);
  };

  const handleTriggerClick = () => {
    if (disabled) return;
    setIsOpen(prev => {
      const next = !prev;
      if (next) onOpen?.(); // opening now → tell the parent to fetch options
      return next;
    });
  };

  const displayText = value.length === 0 ? placeholder : value.length === 1 ? value[0] : `${value.length} selected`;

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={handleTriggerClick}
        disabled={disabled}
        aria-disabled={disabled}
        style={{
          width: '100%', textAlign: 'left', padding: '8px 12px', borderRadius: 6,
          border: '1px solid #d0d5dd', background: disabled ? '#f2f4f7' : '#fff',
          color: disabled ? '#98a2b3' : value.length === 0 ? '#98a2b3' : '#101828',
          cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 14,
        }}
      >
        {displayText}
      </button>

      {isOpen && !disabled && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
          background: '#fff', border: '1px solid #d0d5dd', borderRadius: 6,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)', zIndex: 20, maxHeight: 260, overflowY: 'auto',
        }}>
          <input
            autoFocus type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            style={{
              width: '100%', boxSizing: 'border-box', padding: '8px 12px', border: 'none',
              borderBottom: '1px solid #eaecf0', outline: 'none', fontSize: 14,
            }}
          />
          {loading ? (
            <div style={{ padding: '8px 12px', color: '#98a2b3', fontSize: 14 }}>Loading…</div>
          ) : filteredOptions.length === 0 ? (
            <div style={{ padding: '8px 12px', color: '#98a2b3', fontSize: 14 }}>No options</div>
          ) : (
            filteredOptions.map(opt => (
              <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 14 }}>
                <input type="checkbox" checked={value.includes(opt)} onChange={() => toggleOption(opt)} />
                {opt}
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}