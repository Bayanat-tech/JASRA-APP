/**
 * GroupedReportTable — Generic grouped/hierarchical report table
 *
 * Props:
 *  - rows          : T[]                     Raw flat data
 *  - columns       : ColumnDef<T>[]          Column definitions
 *  - groupBy       : GroupByConfig<T>[]      Ordered list of grouping levels (outer → inner)
 *  - amountKey     : keyof T                 Field used for subtotals / grand total
 *  - title         : string                  Report title shown in header bar
 *  - filterDefs    : FilterDef<T>[]          Filter fields for the side panel
 *  - isLoading?    : boolean
 *  - logo?         : string                  Logo image URL / import
 *  - printUser?    : string
 *  - onExcel?      : (rows: T[]) => void     Override Excel export
 *  - onPDF?        : (rows: T[]) => void     Override PDF export
 *  - searchKeys?   : (keyof T)[]             Fields searched by the search box
 */

import React, {
  useState, useMemo, useCallback, ReactNode,
} from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// Public types
// ─────────────────────────────────────────────────────────────────────────────

export type ColumnDef<T> = {
  key:       keyof T;
  label:     string;
  width?:    string;          // e.g. '22%' or '140px'
  align?:    'left' | 'right' | 'center';
  mono?:     boolean;         // courier font
  format?:   (val: any, row: T) => ReactNode;
  sortable?: boolean;
};

export type GroupByConfig<T> = {
  key:        keyof T;            // field to group on
  label:      string;             // e.g. "Division"
  /** Secondary label field shown alongside groupKey value */
  subKey?:    keyof T;
  subLabel?:  string;
};

export type FilterDef<T> = {
  key:    keyof T;
  label:  string;
  type:   'select' | 'date';
};

// ─────────────────────────────────────────────────────────────────────────────
// Internal types
// ─────────────────────────────────────────────────────────────────────────────

type SortConfig<T> = { col: keyof T | null; dir: 'asc' | 'desc' };

type GroupNode<T> = {
  key:      string;
  label:    string;
  children: GroupNode<T>[] | T[];
  total:    number;
  depth:    number;
  isLeaf:   boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

export function formatAmount(n: number): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(d: string): string {
  if (!d) return '-';
  const date = new Date(d);
  return isNaN(date.getTime())
    ? d
    : date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function parseDateNum(d: string): number {
  if (!d) return 0;
  return new Date(d).getTime() || 0;
}

function buildGroups<T>(
  rows: T[],
  groupBy: GroupByConfig<T>[],
  amountKey: keyof T,
  depth = 0,
): GroupNode<T>[] {
  if (groupBy.length === 0) return [];

  const [current, ...rest] = groupBy;
  const map = new Map<string, { rows: T[]; label: string }>();

  for (const row of rows) {
    const val = String((row as any)[current.key] ?? 'Unassigned');
    const sub = current.subKey ? String((row as any)[current.subKey] ?? '') : '';
    const label = sub ? `${val}  |  ${sub}` : val;
    if (!map.has(val)) map.set(val, { rows: [], label });
    map.get(val)!.rows.push(row);
  }

  return Array.from(map.entries()).map(([, { rows: groupRows, label }]) => {
    const total = groupRows.reduce(
      (s, r) => s + (parseFloat(String((r as any)[amountKey])) || 0), 0,
    );
    const isLeaf = rest.length === 0;
    return {
      key: label,
      label,
      total,
      depth,
      isLeaf,
      children: isLeaf
        ? groupRows
        : buildGroups(groupRows, rest, amountKey, depth + 1),
    } as GroupNode<T>;
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CSS (injected once via <style>)
// ─────────────────────────────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

.grt-root {
  font-family: 'DM Sans', sans-serif;
  background: #f4f6f9;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Toolbar */
.grt-toolbar {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 28px; background: #fff; border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0; z-index: 100; gap: 12px;
}
.grt-toolbar-left  { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.grt-toolbar-right { display: flex; gap: 8px; flex-shrink: 0; }

.grt-btn {
  padding: 7px 13px; border-radius: 7px; font-size: 13px; font-weight: 600;
  cursor: pointer; display: flex; align-items: center; gap: 6px;
  transition: all 0.15s; font-family: 'DM Sans', sans-serif; white-space: nowrap;
}
.grt-btn-ghost  { border: 1.5px solid #d1d5db; background: #fff; color: #374151; }
.grt-btn-ghost:hover { background: #f9fafb; border-color: #9ca3af; }
.grt-btn-primary { border: none; background: #1e3a5f; color: #fff; }
.grt-btn-primary:hover { background: #162d4a; }
.grt-btn-success { border: none; background: #16a34a; color: #fff; }
.grt-btn-success:hover { background: #15803d; }
.grt-btn-filter { border: 1.5px solid #d1d5db; background: #fff; color: #374151; position: relative; }
.grt-btn-filter.active { border-color: #1e3a5f; color: #1e3a5f; background: #eef2f7; }
.grt-filter-dot {
  width: 7px; height: 7px; border-radius: 50%; background: #ef4444;
  position: absolute; top: 5px; right: 5px;
}

.grt-search-wrap { position: relative; display: flex; align-items: center; }
.grt-search-icon { position: absolute; left: 10px; color: #9ca3af; font-size: 14px; pointer-events: none; }
.grt-search {
  padding: 7px 12px 7px 34px; border: 1.5px solid #d1d5db; border-radius: 7px;
  font-size: 13px; font-family: 'DM Sans', sans-serif; color: #111;
  outline: none; width: 220px; background: #fff; transition: border-color 0.15s;
}
.grt-search:focus { border-color: #1e3a5f; }

/* Body */
.grt-body        { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.grt-report-area { padding: 12px 28px 0; flex: 1; overflow-y: auto; }
.grt-page        {
  background: #fff; border-radius: 8px 8px 0 0;
  border: 1px solid #e5e7eb; border-bottom: none; overflow: hidden;
}

/* Grand total bar */
.grt-grand-total {
  flex-shrink: 0; margin: 0 28px 20px;
  background: #1e3a5f; border-radius: 0 0 8px 8px;
  border: 1px solid #1e3a5f; overflow: hidden;
}
.grt-grand-total table { width: 100%; border-collapse: collapse; font-size: 13px; }
.grt-grand-total td    { padding: 11px 14px; font-weight: 700; color: #fff; }
.grt-grand-total td.num { text-align: right; font-variant-numeric: tabular-nums; }

/* Report header */
.grt-report-header {
  padding: 16px 24px 14px; border-bottom: 1px solid #e5e7eb;
  display: flex; justify-content: space-between; align-items: center;
}
.grt-report-header-right { text-align: right; font-size: 12px; color: #6b7280; line-height: 2; padding-top: 20px; }
.grt-title-bar {
  background: #1e3a5f; color: #fff; text-align: center;
  padding: 11px; font-size: 14px; font-weight: 700; letter-spacing: 0.02em;
}
.grt-meta {
  display: flex; gap: 32px; padding: 9px 24px;
  background: #f9fafb; border-bottom: 1px solid #e5e7eb;
  font-size: 12px; color: #6b7280; flex-wrap: wrap;
}

/* Table */
.grt-table-wrap { overflow-x: auto; }
table.grt-table {
  width: 100%; border-collapse: collapse; font-size: 13px;
}
.grt-table thead th {
  background: #1e3a5f; color: #fff; font-weight: 700;
  font-size: 13.5px; padding: 11px 14px; text-align: left;
  white-space: nowrap; border-right: 1px solid rgba(255,255,255,0.12);
  overflow: hidden; text-overflow: ellipsis; user-select: none; cursor: pointer;
}
.grt-table thead th:last-child { border-right: none; }
.grt-table thead th.num { text-align: right; }
.grt-table thead th:hover { background: #162d4a; }

/* Group rows — depth-aware colours */
.grt-table tr.group-row-0 td {
  background: #1e3a5f; color: #fff; font-weight: 700;
  font-size: 12px; padding: 4px 14px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  border-bottom: 1px solid rgba(255,255,255,0.08); cursor: pointer;
}
.grt-table tr.group-row-0:hover td { background: #162d4a; }

.grt-table tr.group-row-1 td {
  background: #e8ecf2; color: #1e3a5f; font-weight: 700;
  font-size: 12px; padding: 6px 14px 6px 24px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  border-bottom: 1px solid #d5dce8; cursor: pointer;
}
.grt-table tr.group-row-1:hover td { background: #dde3ed; }

.grt-table tr.group-row-2 td {
  background: #f1f4f8; color: #374151; font-weight: 600;
  font-size: 12px; padding: 3px 14px 3px 36px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  border-bottom: 1px solid #e5e7eb;
}

/* Data rows */
.grt-table tbody tr.data-row td {
  padding: 3px 10px; border-bottom: 1px solid #e5e7eb;
  color: #374151; vertical-align: middle; font-size: 12px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; line-height: 1.3;
}
.grt-table tbody tr.data-row:hover td { background: #f9fafb; }
.grt-table td.num  { text-align: right; font-variant-numeric: tabular-nums; }
.grt-table td.mono { font-family: 'Courier New', monospace; font-size: 11.5px; }

/* Subtotals */
.grt-table tr.total-row-2 td {
  background: #f1f4f8; padding: 3px 14px; font-size: 12px;
  font-weight: 600; color: #374151; border-top: 1px solid #e5e7eb;
  white-space: nowrap;
}
.grt-table tr.total-row-1 td {
  background: #e8ecf2; padding: 3px 14px; font-size: 12px;
  font-weight: 700; color: #1e3a5f; white-space: nowrap;
}
.grt-table tr.total-row-0 td {
  background: #d5dce8; padding: 3px 14px; font-size: 12px;
  font-weight: 700; color: #1e3a5f; white-space: nowrap;
}

.grt-empty { text-align: center; padding: 60px 20px; color: #9ca3af; font-size: 14px; }
.grt-chevron { display: inline-block; margin-right: 6px; font-size: 10px; transition: transform 0.15s; }
.grt-chevron.open { transform: rotate(90deg); }
.grt-badge {
  font-size: 11px; background: #eef2f7; color: #1e3a5f;
  border-radius: 4px; padding: 3px 9px; font-weight: 600;
}

/* Filter panel */
.grt-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.18);
  z-index: 199; backdrop-filter: blur(1px);
}
.grt-panel {
  position: fixed; top: 0; right: 0; height: 100vh; width: 300px;
  background: #fff; border-left: 1px solid #e5e7eb;
  box-shadow: -4px 0 32px rgba(0,0,0,0.12); z-index: 200;
  display: flex; flex-direction: column; font-family: 'DM Sans', sans-serif;
}
.grt-panel-header {
  padding: 50px 20px 16px; border-bottom: 1px solid #e5e7eb;
  display: flex; justify-content: space-between; align-items: center;
  background: #fafafa;
}
.grt-panel-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 18px; }
.grt-panel-footer {
  padding: 16px 20px 40px; border-top: 1px solid #e5e7eb;
  display: flex; gap: 10px; background: #fafafa;
}
.grt-label {
  display: block; font-size: 11px; font-weight: 700; color: #6b7280;
  margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.06em;
}
.grt-input, .grt-select {
  width: 100%; padding: 9px 10px; font-size: 13px; color: #111;
  border: 1.5px solid #d1d5db; border-radius: 7px; background: #fff;
  outline: none; box-sizing: border-box; font-family: 'DM Sans', sans-serif;
}
.grt-select { cursor: pointer; }

@media print {
  @page { margin: 0; }
  .grt-toolbar, .grt-grand-total, .no-print { display: none !important; }
  .grt-root { background: white; height: auto; overflow: visible; }
  .grt-body { overflow: visible; }
  .grt-report-area { padding: 0; overflow: visible; flex: none; }
  .grt-page { border: none; border-radius: 0; box-shadow: none; }
  .grt-table tbody tr.data-row td { border-bottom: 1px solid #e5e7eb !important; border-right: 1px solid #e5e7eb; }
  .print-logo-only { display: block !important; }
}
.print-logo-only { display: none; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function SortArrow<T>({ col, sort }: { col: keyof T; sort: SortConfig<T> }) {
  if (sort.col !== col) return <span style={{ opacity: 0.35, marginLeft: 4 }}>⇅</span>;
  return <span style={{ marginLeft: 4 }}>{sort.dir === 'asc' ? '↑' : '↓'}</span>;
}

function FilterPanel<T>({
  open, onClose, defs, rows, filters, onChange, onApply, onReset,
}: {
  open:     boolean;
  onClose:  () => void;
  defs:     FilterDef<T>[];
  rows:     T[];
  filters:  Record<string, string>;
  onChange: (f: Record<string, string>) => void;
  onApply:  () => void;
  onReset:  () => void;
}) {
  if (!open) return null;

  const optionsFor = (key: keyof T) =>
    [...new Set(rows.map(r => String((r as any)[key] ?? '')).filter(Boolean))].sort();

  return (
    <>
      <div className="grt-overlay" onClick={onClose} />
      <div className="grt-panel">
        <div className="grt-panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16, color: '#1e3a5f' }}>⚙</span>
            <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>Parameters</span>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none', background: '#f3f4f6', cursor: 'pointer',
              width: 30, height: 30, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: '#6b7280', marginRight: 8,
            }}
          >×</button>
        </div>

        <div className="grt-panel-body">
          {defs.map(def => (
            <div key={String(def.key)}>
              <label className="grt-label">{def.label}</label>
              {def.type === 'date' ? (
                <input
                  type="date"
                  className="grt-input"
                  value={filters[String(def.key)] ?? ''}
                  onChange={e => onChange({ ...filters, [String(def.key)]: e.target.value })}
                />
              ) : (
                <select
                  className="grt-select"
                  value={filters[String(def.key)] ?? ''}
                  onChange={e => onChange({ ...filters, [String(def.key)]: e.target.value })}
                >
                  <option value="">All</option>
                  {optionsFor(def.key).map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              )}
            </div>
          ))}
        </div>

        <div className="grt-panel-footer">
          <button
            onClick={onReset}
            style={{ flex: 1, padding: '9px', border: '1.5px solid #d1d5db', borderRadius: 7, background: '#fff', cursor: 'pointer', fontSize: 13, color: '#374151', fontWeight: 600 }}
          >Reset</button>
          <button
            onClick={() => { onApply(); onClose(); }}
            style={{ flex: 2, padding: '9px', border: 'none', borderRadius: 7, background: '#1e3a5f', cursor: 'pointer', fontSize: 13, color: '#fff', fontWeight: 700 }}
          >Apply Filters</button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Recursive row renderer
// ─────────────────────────────────────────────────────────────────────────────

function GroupRows<T>({
  nodes, columns, amountKey, groupBy, sortedRows, collapsed, toggleCollapse,
}: {
  nodes:          GroupNode<T>[];
  columns:        ColumnDef<T>[];
  amountKey:      keyof T;
  groupBy:        GroupByConfig<T>[];
  sortedRows:     (rows: T[]) => T[];
  collapsed:      Set<string>;
  toggleCollapse: (key: string) => void;
}): React.ReactElement {
  const colCount = columns.length;

  const renderNode = (node: GroupNode<T>): React.ReactElement => {
    const isOpen    = !collapsed.has(node.key);
    const groupDef  = groupBy[node.depth];
    const depthCls  = `group-row-${node.depth}`;
    const totalCls  = `total-row-${node.depth}`;
    const amtColIdx = columns.findIndex(c => c.key === amountKey);

    return (
      <React.Fragment key={node.key}>
        {/* Group header row */}
        <tr className={depthCls} onClick={() => toggleCollapse(node.key)}>
          <td colSpan={colCount}>
            <span className={`grt-chevron ${isOpen ? 'open' : ''}`}>▶</span>
            {groupDef.label} : {node.label}
          </td>
        </tr>

        {isOpen && (
          node.isLeaf
            /* Leaf level — render data rows */
            ? <>
                {sortedRows(node.children as T[]).map((row, ri) => (
                  <tr key={ri} className="data-row">
                    {columns.map(col => {
                      const val = (row as any)[col.key];
                      return (
                        <td
                          key={String(col.key)}
                          className={[col.align === 'right' ? 'num' : '', col.mono ? 'mono' : ''].filter(Boolean).join(' ')}
                        >
                          {col.format ? col.format(val, row) : val ?? '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {/* Leaf subtotal */}
                <tr className={totalCls}>
                  <td colSpan={amtColIdx > 0 ? amtColIdx : colCount - 1}
                      style={{ paddingLeft: node.depth === 0 ? 14 : node.depth === 1 ? 24 : 36 }}>
                    {groupDef.label} Total : {node.label}
                  </td>
                  {amtColIdx >= 0 && (
                    <td className="num">{formatAmount(node.total)}</td>
                  )}
                  {amtColIdx >= 0 && amtColIdx < colCount - 1 && (
                    <td colSpan={colCount - amtColIdx - 1} />
                  )}
                </tr>
              </>
            /* Non-leaf — recurse */
            : <>
                {(node.children as GroupNode<T>[]).map(child => renderNode(child))}
                {/* Subtotal for this group */}
                <tr className={totalCls}>
                  <td colSpan={amtColIdx > 0 ? amtColIdx : colCount - 1}
                      style={{ paddingLeft: node.depth === 0 ? 14 : 24 }}>
                    {groupDef.label} Total : {node.label}
                  </td>
                  {amtColIdx >= 0 && (
                    <td className="num">{formatAmount(node.total)}</td>
                  )}
                  {amtColIdx >= 0 && amtColIdx < colCount - 1 && (
                    <td colSpan={colCount - amtColIdx - 1} />
                  )}
                </tr>
              </>
        )}
      </React.Fragment>
    );
  };

  return <>{nodes.map(n => renderNode(n))}</>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

export type GroupedReportTableProps<T extends Record<string, any>> = {
  rows:        T[];
  columns:     ColumnDef<T>[];
  groupBy:     GroupByConfig<T>[];
  amountKey:   keyof T;
  title:       string;
  filterDefs?: FilterDef<T>[];
  isLoading?:  boolean;
  logo?:       string;
  printUser?:  string;
  onExcel?:    (rows: T[]) => void;
  onPDF?:      (rows: T[]) => void;
  searchKeys?: (keyof T)[];
  /** Extra toolbar actions */
  toolbarActions?: React.ReactNode;
};

function GroupedReportTable<T extends Record<string, any>>({
  rows,
  columns,
  groupBy,
  amountKey,
  title,
  filterDefs = [],
  isLoading  = false,
  logo,
  printUser  = 'USER',
  onExcel,
  onPDF,
  searchKeys = [],
  toolbarActions,
}: GroupedReportTableProps<T>) {
  const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // Filters
  const EMPTY: Record<string, string> = {};
  const [panelOpen, setPanelOpen] = useState(false);
  const [applied,   setApplied]   = useState<Record<string, string>>(EMPTY);
  const [pending,   setPending]   = useState<Record<string, string>>(EMPTY);

  // Search
  const [search, setSearch] = useState('');

  // Sort
  const [sort, setSort] = useState<SortConfig<T>>({ col: null, dir: 'asc' });

  // Collapse
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // ── Filter rows client-side ──
  const filteredRows = useMemo(() => {
    return rows.filter(r => {
      for (const def of filterDefs) {
        const val = applied[String(def.key)];
        if (!val) continue;
        if (def.type === 'date') continue; // handled below for date range pairs
        if (String((r as any)[def.key]) !== val) return false;
      }
      // Date range: look for *_from / *_to pairs
      for (const def of filterDefs) {
        if (def.type !== 'date') continue;
        const key    = String(def.key);
        const fromKey = `${key}_from`;
        const toKey   = `${key}_to`;
        const fromVal = applied[fromKey];
        const toVal   = applied[toKey];
        const rowDate = parseDateNum(String((r as any)[def.key]));
        if (fromVal && rowDate < new Date(fromVal).getTime()) return false;
        if (toVal   && rowDate > new Date(toVal).getTime() + 86399999) return false;
      }
      // Search
      if (search.trim() && searchKeys.length > 0) {
        const q = search.trim().toLowerCase();
        if (!searchKeys.some(k => String((r as any)[k] ?? '').toLowerCase().includes(q))) return false;
      }
      return true;
    });
  }, [rows, applied, search, filterDefs, searchKeys]);

  // ── Sort within leaf rows ──
  const sortedRows = useCallback((leafRows: T[]) => {
    if (!sort.col) return leafRows;
    return [...leafRows].sort((a, b) => {
      const col  = sort.col!;
      let av: any = (a as any)[col];
      let bv: any = (b as any)[col];
      if (typeof av === 'string' && !isNaN(Number(av))) { av = parseFloat(av); bv = parseFloat(bv); }
      else if (typeof av === 'string') { av = av.toLowerCase(); bv = String(bv).toLowerCase(); }
      if (av < bv) return sort.dir === 'asc' ? -1 : 1;
      if (av > bv) return sort.dir === 'asc' ?  1 : -1;
      return 0;
    });
  }, [sort]);

  const groups     = useMemo(() => buildGroups(filteredRows, groupBy, amountKey), [filteredRows, groupBy, amountKey]);
  const grandTotal = groups.reduce((s, g) => s + g.total, 0);
  const isFiltered = Object.values(applied).some(Boolean) || search.trim().length > 0;

  // ── Collect all group keys for collapse-all ──
  function collectKeys(nodes: GroupNode<T>[]): string[] {
    return nodes.flatMap(n => [n.key, ...(n.isLeaf ? [] : collectKeys(n.children as GroupNode<T>[]))]);
  }
  const allKeys      = useMemo(() => collectKeys(groups), [groups]);
  const allCollapsed = collapsed.size === allKeys.length && allKeys.length > 0;

  const toggleCollapse = (key: string) =>
    setCollapsed(prev => { const s = new Set(prev); s.has(key) ? s.delete(key) : s.add(key); return s; });

  const handleCollapseAll = () =>
    allCollapsed ? setCollapsed(new Set()) : setCollapsed(new Set(allKeys));

  const handleSort = (col: keyof T) =>
    setSort(prev => prev.col === col && prev.dir === 'asc' ? { col, dir: 'desc' } : { col, dir: 'asc' });

  const amtColIdx = columns.findIndex(c => c.key === amountKey);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{CSS}</style>

      <div className="grt-root">
        {/* Toolbar */}
        <div className="grt-toolbar no-print">
          <div className="grt-toolbar-left">
            <span style={{ fontSize: 15, fontWeight: 700, color: '#111', whiteSpace: 'nowrap' }}>{title}</span>
            {isFiltered && <span className="grt-badge">Filtered</span>}
            {searchKeys.length > 0 && (
              <div className="grt-search-wrap">
                <span className="grt-search-icon">🔍</span>
                <input
                  className="grt-search"
                  placeholder="Search…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="grt-toolbar-right">
            {toolbarActions}
            <button className="grt-btn grt-btn-ghost" onClick={handleCollapseAll}>
              {allCollapsed ? '⊞ Expand All' : '⊟ Collapse All'}
            </button>
            {filterDefs.length > 0 && (
              <button className={`grt-btn grt-btn-filter ${isFiltered ? 'active' : ''}`} onClick={() => setPanelOpen(true)}>
                {isFiltered && <span className="grt-filter-dot" />}
                ⚙ Parameters
              </button>
            )}
            <button className="grt-btn grt-btn-ghost"   onClick={() => window.print()}>🖨 Print</button>
            {onExcel && (
              <button className="grt-btn grt-btn-success" onClick={() => onExcel(filteredRows)}>📊 Excel</button>
            )}
            {onPDF && (
              <button className="grt-btn grt-btn-primary" onClick={() => onPDF(filteredRows)}>⬇ PDF</button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="grt-body">
          <div className="grt-report-area">
            <div className="grt-page">

              {/* Report header */}
              <div className="grt-report-header">
                {logo
                  ? <img src={logo} alt="Logo" className="print-logo-only" style={{ height: 54, objectFit: 'contain' }} />
                  : <div />
                }
                <div className="grt-report-header-right">
                  <div><b style={{ color: '#374151' }}>Print Date:</b> {printDate}</div>
                  <div><b style={{ color: '#374151' }}>Print User:</b> {printUser}</div>
                </div>
              </div>

              <div className="grt-title-bar">{title}</div>

              {isFiltered && (
                <div className="grt-meta">
                  <span>
                    <b>Filter:</b>{' '}
                    {[
                      ...Object.entries(applied).filter(([, v]) => v).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`),
                      ...(search.trim() ? [`search: "${search.trim()}"`] : []),
                    ].join(' | ')}
                  </span>
                </div>
              )}

              {/* Table */}
              <div className="grt-table-wrap">
                {isLoading ? (
                  <div className="grt-empty">Loading data…</div>
                ) : groups.length === 0 ? (
                  <div className="grt-empty">No records found.</div>
                ) : (
                  <table className="grt-table">
                    <colgroup>
                      {columns.map(col => (
                        <col key={String(col.key)} style={{ width: col.width }} />
                      ))}
                    </colgroup>
                    <thead>
                      <tr>
                        {columns.map(col => (
                          <th
                            key={String(col.key)}
                            className={col.align === 'right' ? 'num' : ''}
                            onClick={() => col.sortable !== false && handleSort(col.key)}
                            style={{ cursor: col.sortable === false ? 'default' : 'pointer' }}
                          >
                            {col.label}
                            {col.sortable !== false && <SortArrow col={col.key} sort={sort} />}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <GroupRows
                        nodes={groups}
                        columns={columns}
                        amountKey={amountKey}
                        groupBy={groupBy}
                        sortedRows={sortedRows}
                        collapsed={collapsed}
                        toggleCollapse={toggleCollapse}
                      />
                    </tbody>
                  </table>
                )}
              </div>

            </div>
          </div>

          {/* Pinned Grand Total */}
          {!isLoading && groups.length > 0 && amtColIdx >= 0 && (
            <div className="grt-grand-total no-print">
              <table>
                <tbody>
                  <tr>
                    <td colSpan={amtColIdx > 0 ? amtColIdx : columns.length - 1}>Grand Total :</td>
                    <td className="num">{formatAmount(grandTotal)}</td>
                    {amtColIdx < columns.length - 1 && (
                      <td colSpan={columns.length - amtColIdx - 1} />
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Filter panel */}
      {filterDefs.length > 0 && (
        <FilterPanel
          open={panelOpen}
          onClose={() => setPanelOpen(false)}
          defs={filterDefs}
          rows={rows}
          filters={pending}
          onChange={setPending}
          onApply={() => setApplied({ ...pending })}
          onReset={() => { setPending(EMPTY); setApplied(EMPTY); }}
        />
      )}
    </>
  );
}

export default GroupedReportTable;