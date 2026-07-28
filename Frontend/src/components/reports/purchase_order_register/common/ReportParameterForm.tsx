import React, { useCallback, useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { MultiSelectCombo } from './MultiSelectCombo';
import { ReportFilters } from './reportHelpers';

/**
 * `fetchOptions` owns the whole call: which endpoint, which HTTP method, which
 * service, how the response is shaped/normalized. This lets one field hit
 * axiosServices.get, another hit a POST, another call a completely different
 * client — the form no longer assumes "GET endpoint + shared response parser".
 */
export type ParamFieldConfig =
  | {
      type: 'multiselect';
      key: string;
      label: string;
      fetchOptions: (filters: ReportFilters, companyCode?: string) => Promise<string[]>;
      placeholder?: string;
    }
  | { type: 'date'; key: string; label: string }
  | { type: 'number'; key: string; label: string; placeholder?: string }
  | { type: 'text'; key: string; label: string; placeholder?: string };

interface ReportParameterFormProps {
  rows: ParamFieldConfig[][];
  filters: ReportFilters;
  onChange: (f: ReportFilters) => void;
  companyCode?: string;
}

const paramLabelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 700, color: '#6b7280',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em',
};
const paramInputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 10px', fontSize: 13, color: '#111',
  border: '1.5px solid #d1d5db', borderRadius: 7, background: '#fff',
  outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif",
};

export function ReportParameterForm({ rows, filters, onChange, companyCode }: ReportParameterFormProps) {
  const multiFields = useMemo(
    () => rows.flat().filter((f): f is Extract<ParamFieldConfig, { type: 'multiselect' }> => f.type === 'multiselect'),
    [rows],
  );

  // A field's dropdown data is only requested once the user actually opens it.
  // Nothing fires on mount, so switching to the Parameters tab is instant even
  // if the form has 6+ lookups on it.
  const [openedKeys, setOpenedKeys] = useState<Set<string>>(new Set());

  const queries = useQueries({
    queries: multiFields.map(f => ({
      queryKey: ['param-options', f.key, companyCode, filters],
      queryFn: () => f.fetchOptions(filters, companyCode),
      enabled: openedKeys.has(f.key),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const handleOpen = useCallback((key: string) => {
    setOpenedKeys(prev => (prev.has(key) ? prev : new Set(prev).add(key)));
  }, []);

  const optionsByKey: Record<string, string[]> = {};
  const loadingByKey: Record<string, boolean> = {};
  multiFields.forEach((f, i) => {
    optionsByKey[f.key] = queries[i].data || [];
    loadingByKey[f.key] = queries[i].isLoading || queries[i].isFetching;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: 'grid', gridTemplateColumns: `repeat(${row.length}, 1fr)`, gap: 14 }}>
          {row.map(field => (
            <div key={field.key}>
              <label style={paramLabelStyle}>{field.label}</label>

              {field.type === 'multiselect' && (
                <MultiSelectCombo
                  value={(filters[field.key] as string[]) || []}
                  options={optionsByKey[field.key] || []}
                  loading={loadingByKey[field.key]}
                  onOpen={() => handleOpen(field.key)}
                  onChange={v => onChange({ ...filters, [field.key]: v })}
                  placeholder={field.placeholder}
                />
              )}

              {field.type === 'date' && (
                <input
                  type="date"
                  value={(filters[field.key] as string) || ''}
                  onChange={e => onChange({ ...filters, [field.key]: e.target.value })}
                  style={paramInputStyle}
                />
              )}

              {(field.type === 'number' || field.type === 'text') && (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={(filters[field.key] as string) || ''}
                  onChange={e => onChange({ ...filters, [field.key]: e.target.value })}
                  style={paramInputStyle}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}