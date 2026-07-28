export function formatAmount(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
export function formatQty(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}
export function formatDate(d: string) {
  if (!d) return '-';
  const date = new Date(d);
  return isNaN(date.getTime())
    ? d
    : date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
export function parseDateStr(d: string): number {
  if (!d) return 0;
  return new Date(d).getTime() || 0;
}
export function formatFilterValue(v: string | string[]): string {
  return Array.isArray(v) ? v.join(', ') : v;
}

// Normalizes an API response that *should* be string[] but might come back
// as objects, nulls, or duplicates.
export function normalizeStringList(raw: any, keys: string[] = []): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const item of raw) {
    let val: any = item;
    if (item && typeof item === 'object') {
      for (const k of keys) {
        if (item[k] !== undefined && item[k] !== null) { val = item[k]; break; }
      }
      if (val && typeof val === 'object') continue;
    }
    if (val === null || val === undefined) continue;
    const str = String(val).trim();
    if (str) out.push(str);
  }
  return [...new Set(out)];
}

export type ReportFilters = Record<string, string | string[]>;

// Generic version — works for ANY report's filter shape, not just PO fields.
// Pass `excludeKey` when building the params used to fetch options for a
// field so that field doesn't filter its own option list.
export function buildFilterParams(
  companyCode: string | undefined,
  filters: ReportFilters,
  excludeKey?: string,
): string {
  const params = new URLSearchParams();
  if (companyCode) params.set('company_code', companyCode);
  Object.entries(filters).forEach(([key, value]) => {
    if (key === excludeKey) return;
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(','));
    } else if (value) {
      params.set(key, value);
    }
  });
  return params.toString();
}

export function isFiltersActive(filters: ReportFilters, extra?: string): boolean {
  const filtersActive = Object.values(filters).some(v => (Array.isArray(v) ? v.length > 0 : Boolean(v)));
  return filtersActive || Boolean(extra && extra.trim().length > 0);
}