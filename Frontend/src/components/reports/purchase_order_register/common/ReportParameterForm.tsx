import React, { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import axiosServices from 'utils/axios';
import { MultiSelectCombo } from './MultiSelectCombo';
import { buildFilterParams, normalizeStringList, ReportFilters } from './reportHelpers';

export type ParamFieldConfig =
  | { type: 'multiselect'; key: string; label: string; endpoint: string; responseKeys?: string[]; placeholder?: string }
  | { type: 'date';   key: string; label: string }
  | { type: 'number'; key: string; label: string; placeholder?: string }
  | { type: 'text';   key: string; label: string; placeholder?: string };

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

  const queries = useQueries({
    queries: multiFields.map(f => {
      const params = buildFilterParams(companyCode, filters, f.key);
      return {
        queryKey: [f.endpoint, params],
        queryFn: async () => {
          const response = await axiosServices.get(`${f.endpoint}?${params}`);
          return normalizeStringList(response.data, f.responseKeys || []);
        },
        staleTime: 5 * 60 * 1000,
      };
    }),
  });

  const optionsByKey: Record<string, string[]> = {};
  multiFields.forEach((f, i) => { optionsByKey[f.key] = queries[i].data || []; });
  const isLoading = queries.some(q => q.isLoading);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 16,
      cursor: isLoading ? 'wait' : 'default', opacity: isLoading ? 0.6 : 1,
      pointerEvents: isLoading ? 'none' : 'auto', transition: 'opacity 0.15s ease',
    }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: 'grid', gridTemplateColumns: `repeat(${row.length}, 1fr)`, gap: 14 }}>
          {row.map(field => (
            <div key={field.key}>
              <label style={paramLabelStyle}>{field.label}</label>
              {field.type === 'multiselect' && (
                <MultiSelectCombo
                  value={(filters[field.key] as string[]) || []}
                  options={optionsByKey[field.key] || []}
                  onChange={v => onChange({ ...filters, [field.key]: v })}
                  placeholder={field.placeholder}
                  disabled={isLoading}
                />
              )}
              {field.type === 'date' && (
                <input
                  type="date"
                  value={(filters[field.key] as string) || ''}
                  onChange={e => onChange({ ...filters, [field.key]: e.target.value })}
                  style={paramInputStyle}
                  disabled={isLoading}
                />
              )}
              {(field.type === 'number' || field.type === 'text') && (
                <input
                  type={field.type}
                  placeholder={field.placeholder}
                  value={(filters[field.key] as string) || ''}
                  onChange={e => onChange({ ...filters, [field.key]: e.target.value })}
                  style={paramInputStyle}
                  disabled={isLoading}
                />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}