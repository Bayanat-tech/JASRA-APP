import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RotateCcw, Printer, ChevronDown, Check, BarChart2 } from 'lucide-react';
import companyLogo from 'assets/Al_jasra_logo.jpg';
import useAuth from 'hooks/useAuth';
import commonServiceInstance from 'service/Attendance/common_service'; // <-- adjust path
import GroupedReportTable, {
  ColumnDef,
  GroupByConfig,
  formatAmount,
} from '../../../components/reports/GroupedReport';

// ── Props ──────────────────────────────────────────────────────────────────────
interface BudgetStatusSummaryProps {
  required_values: {
    divCode: string;
    companyCode?: string;
  };
}

// ── Row types ─────────────────────────────────────────────────────────────────
type BudgetRow = {
  BUDGET_YEAR:    string;
  MONTH_NUMBER:   string;
  MONTH_BUDGET:   string;
  APPROVED_AMT:   number;
  PR_AMOUNT:      number;
  PO_AMOUNT:      number;
  TOT_UTILISED:   number;
  BALANCE_AMT:    number;
  PROJECT_NAME:   string;
  PROJECT_CODE:   string;
  COST_CODE:      string;
  COST_NAME:      string;
  DIV_CODE:       string;
  DIV_NAME:       string;
};

type DivisionRow = { DIV_CODE: string; DIV_NAME: string };
type ProjectRow  = { PROJECT_CODE: string; PROJECT_NAME: string };
type MonthRow    = { MONTH_NUMBER: string; MONTH_BUDGET: string };
type CostRow     = { COST_CODE: string; COST_NAME: string };

// ── Month helpers ──────────────────────────────────────────────────────────────
const MONTH_MAP: Record<string, string> = {
  '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr',
  '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug',
  '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
};

const monthLabel = (row: BudgetRow) =>
  MONTH_MAP[String(row.MONTH_NUMBER)] ?? row.MONTH_BUDGET ?? '-';

// ── Column definitions ────────────────────────────────────────────────────────
const COLUMNS: ColumnDef<BudgetRow>[] = [
  { key: 'BUDGET_YEAR',  label: 'Year',            width: '9%',  align: 'center' },
  { key: 'MONTH_NUMBER', label: 'Month',           width: '9%',  align: 'center', format: (_v, row) => monthLabel(row as BudgetRow) },
  { key: 'APPROVED_AMT', label: 'Approved Amount', width: '20%', align: 'right', format: (v) => formatAmount(parseFloat(String(v)) || 0) },
  { key: 'PR_AMOUNT',    label: 'PR Amount',       width: '17%', align: 'right', format: (v) => formatAmount(parseFloat(String(v)) || 0) },
  { key: 'PO_AMOUNT',    label: 'PO Amount',       width: '17%', align: 'right', format: (v) => formatAmount(parseFloat(String(v)) || 0) },
  { key: 'TOT_UTILISED', label: 'Total Utilised',  width: '14%', align: 'right', format: (v) => formatAmount(parseFloat(String(v)) || 0) },
  { key: 'BALANCE_AMT',  label: 'Balance Amount',  width: '14%', align: 'right', format: (v) => formatAmount(parseFloat(String(v)) || 0) },
];

const GROUP_BY_WITH_COST: GroupByConfig<BudgetRow>[] = [
  { key: 'PROJECT_NAME', label: 'Project',   subKey: 'PROJECT_CODE' },
  { key: 'COST_NAME',    label: 'Cost Code', subKey: 'COST_CODE'    },
];

const GROUP_BY_PROJECT_ONLY: GroupByConfig<BudgetRow>[] = [
  { key: 'PROJECT_NAME', label: 'Project', subKey: 'PROJECT_CODE' },
];

// ── Filters / options ─────────────────────────────────────────────────────────
interface Option {
  value: string;
  label: string;
}

interface Filters {
  division:      string[];
  project:       string[];
  month:         string;
  cost_code:     string[];
  group_by_cost: 'Yes' | 'No';
}

const DEFAULT_FILTERS: Filters = {
  division:      ['All'],
  project:       ['All'],
  month:         'All',
  cost_code:     ['All'],
  group_by_cost: 'Yes',
};

/** Multi-select → quoted list for IN (...): ['01','02'] → '01','02' */
const buildCodeParam = (vals: string[]) => {
  if (!vals?.length || vals.includes('All')) return 'All';
  return vals.map((v) => `'${String(v).replace(/'/g, "''")}'`).join(',');
};

// ── Shared proc call helper ───────────────────────────────────────────────────
interface BudgetProcParams {
  parameter: string;
  loginid?: string;
  code1: string;   // COMPANY_CODE from user.company_code
  code2?: string;  // DIV_CODE filter
  code3?: string;  // PROJECT_CODE filter
  code4?: string;  // COST_CODE filter
  number1?: number; // MONTH_NUMBER filter
}

function uppercaseKeys<T>(row: Record<string, any>): T {
  const out: Record<string, any> = {};
  for (const k of Object.keys(row)) out[k.toUpperCase()] = row[k];
  return out as T;
}

async function callBudgetProc<T>(params: BudgetProcParams, label: string): Promise<T[]> {
  console.log(`[${label}] sending:`, params);
  const rows = await commonServiceInstance.proc_build_dynamic_sql_common(params);
  if (!rows) {
    console.warn(`[${label}] proc returned no data`, params);
    return [];
  }
  if (!Array.isArray(rows)) {
    console.warn(`[${label}] Expected array, got:`, rows);
    return [];
  }
  return rows.map((r) => uppercaseKeys<T>(r));
}

// ── Shared field styling ──────────────────────────────────────────────────────
const fieldLabelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 500,
  color: '#6b7280',
  marginBottom: 2,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const BG = '#EEF5FD';

function FloatLabel({ label, required, children, bgColor = '#fff' }: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  bgColor?: string;
}) {
  return (
    <div style={{ position: 'relative', marginTop: 6 }}>
      <span style={{
        position: 'absolute', top: -8, left: 10, fontSize: 11, color: '#6b7280',
        background: bgColor, padding: '0 4px', zIndex: 1,
        textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500,
      }}>
        {label} {required && <span style={{ color: '#dc2626' }}>*</span>}
      </span>
      {children}
    </div>
  );
}

const selectBaseStyle: React.CSSProperties = {
  width: '100%', padding: '7px 10px', fontSize: 12, color: '#111827',
  border: '1px solid #d1d5db', borderRadius: 6, outline: 'none',
  background: '#fff', boxSizing: 'border-box', fontFamily: 'inherit', cursor: 'pointer',
};

// ── MultiSelectField ──────────────────────────────────────────────────────────
const MultiSelectField: React.FC<{
  label: string;
  options: Option[];
  value: string[];
  onChange: (v: string[]) => void;
  loading?: boolean;
  placeholder?: string;
}> = ({ label, options, value, onChange, loading, placeholder }) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAll = value.includes('All') || value.length === 0;
  const toggleAll = () => onChange(['All']);
  const toggleValue = (v: string) => {
    if (isAll) { onChange([v]); return; }
    if (value.includes(v)) {
      const next = value.filter((x) => x !== v);
      onChange(next.length ? next : ['All']);
    } else {
      onChange([...value, v]);
    }
  };

  const summaryText = isAll
    ? (placeholder ?? 'All')
    : value.length === 1
      ? (options.find((o) => o.value === value[0])?.label ?? value[0])
      : `${value.length} selected`;

  return (
    <div ref={rootRef} style={{ marginBottom: 14, position: 'relative' }}>
      {label && <label style={fieldLabelStyle}>{label}</label>}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        style={{
          ...selectBaseStyle, display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', textAlign: 'left', color: '#111827',
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {loading ? 'Loading…' : summaryText}
        </span>
        <ChevronDown size={14} style={{ flexShrink: 0, marginLeft: 6, color: '#6b7280' }} />
      </button>

      {open && !loading && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
          background: '#fff', border: '1px solid #d1d5db', borderRadius: 6,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 50,
          maxHeight: 220, overflowY: 'auto', padding: 4,
        }}>
          <div
            onClick={toggleAll}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
              fontSize: 12, borderRadius: 4, cursor: 'pointer', fontWeight: 600,
              color: '#185FA5', background: isAll ? '#EEF5FD' : 'transparent',
            }}
          >
            <span style={{
              width: 14, height: 14, borderRadius: 3, border: '1px solid #185FA5',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: isAll ? '#185FA5' : '#fff',
            }}>
              {isAll && <Check size={10} color="#fff" />}
            </span>
            All
          </div>

          {options.map((opt) => {
            const checked = !isAll && value.includes(opt.value);
            return (
              <div
                key={opt.value}
                onClick={() => toggleValue(opt.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                  fontSize: 12, borderRadius: 4, cursor: 'pointer', color: '#374151',
                  background: checked ? '#EEF5FD' : 'transparent',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}
              >
                <span style={{
                  width: 14, height: 14, borderRadius: 3, border: '1px solid #d1d5db',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: checked ? '#185FA5' : '#fff',
                  borderColor: checked ? '#185FA5' : '#d1d5db', flexShrink: 0,
                }}>
                  {checked && <Check size={10} color="#fff" />}
                </span>
                {opt.label}
              </div>
            );
          })}

          {options.length === 0 && (
            <div style={{ padding: '10px 8px', fontSize: 12, color: '#9ca3af' }}>No options</div>
          )}
        </div>
      )}
    </div>
  );
};

const SingleSelectField: React.FC<{
  label: string;
  value: string;
  options: Option[];
  onChange: (v: string) => void;
  loading?: boolean;
}> = ({ label, value, options, onChange, loading }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={fieldLabelStyle}>{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={loading}
      style={{ ...selectBaseStyle, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
    >
      <option value="All">{loading ? 'Loading…' : 'All'}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const BudgetStatusSummary: React.FC<BudgetStatusSummaryProps> = ({ required_values }) => {
  const { user } = useAuth();
  const printUser = user?.username;
  const loginid = user?.loginid ?? '';
  const printDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });

  // Same as BudgetAllocationReport — company code from useAuth
  const companyCode: string = user?.company_code?.trim() || 'All';

  const [hasGeneratedReport, setHasGeneratedReport] = useState(false);
  const [activeTab, setActiveTab] = useState<'parameters' | 'report'>('parameters');
  const [pending, setPending] = useState<Filters>(DEFAULT_FILTERS);
  const [applied, setApplied] = useState<Filters>(DEFAULT_FILTERS);

  const setPendingField = <K extends keyof Filters>(key: K, val: Filters[K]) =>
    setPending((prev) => ({ ...prev, [key]: val }));

  // Shared param strings for the currently-pending selections
  const divParam   = buildCodeParam(pending.division);
  const projParam  = buildCodeParam(pending.project);
  const costParam  = buildCodeParam(pending.cost_code);
  const monthParam = pending.month === 'All' ? undefined : Number(pending.month);

  // ── 1. DIVISIONS ──────────────────────────────────────────────────────────
  // Filtered by: company, project, cost, month (everything EXCEPT division itself)
  const { data: divisionRows = [], isLoading: isDivisionLoading } = useQuery<DivisionRow[]>({
    queryKey: ['budget_get_divisions', companyCode, loginid, projParam, costParam, pending.month],
    queryFn: () =>
      callBudgetProc<DivisionRow>(
        {
          parameter: 'BSTATUS_GET_DIVISIONS',
          loginid,
          code1: companyCode,
          code3: projParam,
          code4: costParam,
          number1: monthParam,
        },
        'BSTATUS_GET_DIVISIONS'
      ),
  });

  const divisionOptions = useMemo<Option[]>(
    () =>
      divisionRows
        .filter((r) => r.DIV_CODE)
        .sort((a, b) => a.DIV_CODE.localeCompare(b.DIV_CODE))
        .map((r) => ({ value: r.DIV_CODE, label: `${r.DIV_CODE} | ${r.DIV_NAME}` })),
    [divisionRows]
  );

  // ── 2. PROJECTS ───────────────────────────────────────────────────────────
  // Filtered by: company, division, cost, month (everything EXCEPT project itself)
  const { data: projectRows = [], isLoading: isProjectLoading } = useQuery<ProjectRow[]>({
    queryKey: ['budget_get_projects', companyCode, loginid, divParam, costParam, pending.month],
    queryFn: () =>
      callBudgetProc<ProjectRow>(
        {
          parameter: 'BSTATUS_GET_PROJECTS',
          loginid,
          code1: companyCode,
          code2: divParam,
          code4: costParam,
          number1: monthParam,
        },
        'BSTATUS_GET_PROJECTS'
      ),
  });

  const projectOptions = useMemo<Option[]>(
    () =>
      projectRows
        .filter((r) => r.PROJECT_CODE)
        .sort((a, b) => a.PROJECT_NAME.localeCompare(b.PROJECT_NAME))
        .map((r) => ({ value: r.PROJECT_CODE, label: `${r.PROJECT_CODE} | ${r.PROJECT_NAME}` })),
    [projectRows]
  );

  // ── 3. MONTHS ─────────────────────────────────────────────────────────────
  // Filtered by: company, division, project, cost (everything EXCEPT month itself)
  const { data: monthRows = [], isLoading: isMonthLoading } = useQuery<MonthRow[]>({
    queryKey: ['budget_get_months', companyCode, loginid, divParam, projParam, costParam],
    queryFn: () =>
      callBudgetProc<MonthRow>(
        {
          parameter: 'BSTATUS_GET_MONTHS',
          loginid,
          code1: companyCode,
          code2: divParam,
          code3: projParam,
          code4: costParam,
        },
        'BSTATUS_GET_MONTHS'
      ),
  });

  const monthOpts = useMemo<Option[]>(
    () =>
      monthRows
        .filter((r) => r.MONTH_NUMBER != null)
        .sort((a, b) => Number(a.MONTH_NUMBER) - Number(b.MONTH_NUMBER))
        .map((r) => ({
          value: String(r.MONTH_NUMBER),
          label: MONTH_MAP[String(r.MONTH_NUMBER)] ?? r.MONTH_BUDGET ?? String(r.MONTH_NUMBER),
        })),
    [monthRows]
  );

  // ── 4. COST CODES ─────────────────────────────────────────────────────────
  // Filtered by: company, division, project, month (everything EXCEPT cost code itself)
  const { data: costRows = [], isLoading: isCostLoading } = useQuery<CostRow[]>({
    queryKey: ['budget_get_cost_codes', companyCode, loginid, divParam, projParam, pending.month],
    queryFn: () =>
      callBudgetProc<CostRow>(
        {
          parameter: 'BSTATUS_GET_COST_CODES',
          loginid,
          code1: companyCode,
          code2: divParam,
          code3: projParam,
          number1: monthParam,
        },
        'BSTATUS_GET_COST_CODES'
      ),
  });

  const costOpts = useMemo<Option[]>(
    () =>
      costRows
        .filter((r) => r.COST_CODE)
        .sort((a, b) => a.COST_CODE.localeCompare(b.COST_CODE))
        .map((r) => ({
          value: r.COST_CODE,
          label: `${r.COST_CODE} | ${r.COST_NAME}`,
        })),
    [costRows]
  );

  // ── 5. MAIN REPORT ────────────────────────────────────────────────────────
  const { data: reportRows = [], isLoading: isReportLoading, isFetching: isReportFetching } =
    useQuery<BudgetRow[]>({
      queryKey: [
        'budget_status_summary',
        applied.division,
        applied.project,
        applied.month,
        applied.cost_code,
        companyCode,
        loginid,
      ],
      enabled: hasGeneratedReport,
      queryFn: () =>
        callBudgetProc<BudgetRow>(
          {
            parameter: 'BSTATUS_BUDGET_STATUS_SUMMARY',
            loginid,
            code1: companyCode,
            code2: buildCodeParam(applied.division),
            code3: buildCodeParam(applied.project),
            code4: buildCodeParam(applied.cost_code),
            number1: applied.month === 'All' ? undefined : Number(applied.month),
          },
          'BSTATUS_BUDGET_STATUS_SUMMARY'
        ),
    });

  const groupBy =
    applied.group_by_cost === 'Yes' ? GROUP_BY_WITH_COST : GROUP_BY_PROJECT_ONLY;

  const handleGenerateReport = () => {
    setApplied({ ...pending });
    setHasGeneratedReport(true);
    setActiveTab('report');
  };

  const handleReset = () => {
    setPending(DEFAULT_FILTERS);
    setApplied(DEFAULT_FILTERS);
    setHasGeneratedReport(false);
    setActiveTab('parameters');
  };

  const isLoading =
    isDivisionLoading || isProjectLoading || isMonthLoading || isCostLoading;

  // ── Excel export ───────────────────────────────────────────────────────────
  const handleExcel = async (filteredRows: BudgetRow[]) => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();
    const withCost = applied.group_by_cost === 'Yes';

    type ProjMap = Record<string, {
      projectName: string; projectCode: string; approved: number; utilised: number;
      costs: Record<string, {
        costName: string; costCode: string; rows: BudgetRow[]; approved: number; utilised: number;
      }>;
    }>;

    const projMap: ProjMap = {};
    for (const r of filteredRows) {
      const projKey = `${r.PROJECT_NAME}|||${r.PROJECT_CODE}`;
      const costKey = withCost ? r.COST_CODE : 'ALL';
      const approved = parseFloat(String(r.APPROVED_AMT)) || 0;
      const utilised = parseFloat(String(r.TOT_UTILISED)) || 0;

      if (!projMap[projKey])
        projMap[projKey] = { projectName: r.PROJECT_NAME, projectCode: r.PROJECT_CODE, approved: 0, utilised: 0, costs: {} };
      if (!projMap[projKey].costs[costKey])
        projMap[projKey].costs[costKey] = {
          costName: withCost ? r.COST_NAME : '',
          costCode: withCost ? r.COST_CODE : '',
          rows: [], approved: 0, utilised: 0,
        };

      projMap[projKey].costs[costKey].rows.push(r);
      projMap[projKey].costs[costKey].approved += approved;
      projMap[projKey].costs[costKey].utilised += utilised;
      projMap[projKey].approved += approved;
      projMap[projKey].utilised += utilised;
    }

    const projects = Object.values(projMap).map((p: any) => ({
      ...p,
      costs: Object.values(p.costs),
    }));

    const grandApproved = projects.reduce((s: number, p: any) => s + p.approved, 0);
    const grandUtilised = projects.reduce((s: number, p: any) => s + p.utilised, 0);

    const summaryData: any[][] = [
      ['Budget Status Report — Summary'],
      [`Print Date: ${printDate}`, '', `Print User: ${printUser}`],
      [],
      ['Year', 'Month', 'Approved Amount', 'PR Amount', 'PO Amount', 'Total Utilised', 'Balance Amount', 'Cost Code', 'Project'],
    ];

    projects.forEach((proj: any) => {
      proj.costs.forEach((cg: any) => {
        cg.rows.forEach((row: BudgetRow) => {
          const approved = parseFloat(String(row.APPROVED_AMT)) || 0;
          const pr = parseFloat(String(row.PR_AMOUNT)) || 0;
          const po = parseFloat(String(row.PO_AMOUNT)) || 0;
          const util = parseFloat(String(row.TOT_UTILISED)) || 0;
          const bal = parseFloat(String(row.BALANCE_AMT)) || (approved - util);
          summaryData.push([
            row.BUDGET_YEAR, monthLabel(row), approved, pr, po, util, bal,
            withCost ? row.COST_CODE : '', proj.projectName,
          ]);
        });
        if (withCost) {
          summaryData.push(['', '', cg.approved, '', '', cg.utilised, cg.approved - cg.utilised, `Cost Total: ${cg.costName}`, '']);
        }
      });
      summaryData.push(['', '', proj.approved, '', '', proj.utilised, proj.approved - proj.utilised, '', `Project Total: ${proj.projectName}`]);
    });
    summaryData.push([]);
    summaryData.push(['', '', grandApproved, '', '', grandUtilised, grandApproved - grandUtilised, '', 'Grand Total']);

    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    ws['!cols'] = [{ wch: 10 }, { wch: 10 }, { wch: 16 }, { wch: 14 }, { wch: 14 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Budget Summary');
    XLSX.writeFile(wb, 'Budget_Status_Summary.xlsx');
  };

  // ── PDF export ─────────────────────────────────────────────────────────────
  const handlePDF = async (filteredRows: BudgetRow[]) => {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const withCost = applied.group_by_cost === 'Yes';

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 14;

    const NAVY = [30, 58, 95] as [number, number, number];
    const COST = [232, 236, 242] as [number, number, number];
    const CTOT = [241, 244, 248] as [number, number, number];
    const PTOT = [213, 220, 232] as [number, number, number];
    const WHITE = [255, 255, 255] as [number, number, number];
    const DARK = [55, 65, 81] as [number, number, number];
    const NAVY_TEXT = [30, 58, 95] as [number, number, number];
    const BORDER = [209, 213, 219] as [number, number, number];

    const getBase64FromUrl = (url: string): Promise<string> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext('2d')!.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = url;
      });

    let logoBase64 = '';
    try { logoBase64 = await getBase64FromUrl(companyLogo); } catch { /* skip */ }

    type ProjMap = Record<string, any>;
    const projMap: ProjMap = {};
    for (const r of filteredRows) {
      const projKey = `${r.PROJECT_NAME}|||${r.PROJECT_CODE}`;
      const costKey = withCost ? r.COST_CODE : 'ALL';
      const approved = parseFloat(String(r.APPROVED_AMT)) || 0;
      const utilised = parseFloat(String(r.TOT_UTILISED)) || 0;
      if (!projMap[projKey])
        projMap[projKey] = { projectName: r.PROJECT_NAME, approved: 0, utilised: 0, costs: {} };
      if (!projMap[projKey].costs[costKey])
        projMap[projKey].costs[costKey] = { costName: withCost ? r.COST_NAME : '', rows: [], approved: 0, utilised: 0 };
      projMap[projKey].costs[costKey].rows.push(r);
      projMap[projKey].costs[costKey].approved += approved;
      projMap[projKey].costs[costKey].utilised += utilised;
      projMap[projKey].approved += approved;
      projMap[projKey].utilised += utilised;
    }
    const projects = Object.values(projMap).map((p: any) => ({ ...p, costs: Object.values(p.costs) }));
    const grandApproved = projects.reduce((s: number, p: any) => s + p.approved, 0);
    const grandUtilised = projects.reduce((s: number, p: any) => s + p.utilised, 0);

    const HEADER_H = 36;
    const TITLE_Y = 27;
    const TABLE_TOP = 39;

    const drawPageHeader = (data: any) => {
      const pg = data.pageNumber as number;
      if (logoBase64) pdf.addImage(logoBase64, 'PNG', margin, 5, 32, 16);
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(107, 114, 128);
      pdf.text(`Page ${pg}`, pageW - margin, 9, { align: 'right' });
      pdf.text(`Print Date : ${printDate}`, pageW - margin, 14, { align: 'right' });
      pdf.text(`Print User : ${printUser}`, pageW - margin, 19, { align: 'right' });
      pdf.setFillColor(...NAVY);
      pdf.rect(margin, TITLE_Y, pageW - margin * 2, 8, 'F');
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10); pdf.setTextColor(...WHITE);
      pdf.text('Budget Status Report (Summary)', pageW / 2, TITLE_Y + 5.5, { align: 'center' });
    };

    const body: any[] = [];
    const cellPad = { top: 3.5, bottom: 3.5, left: 5, right: 5 };
    const indPad1 = { top: 3, bottom: 3, left: 12, right: 5 };
    const fmtBal = (n: number) => (n < 0 ? `(${formatAmount(Math.abs(n))})` : formatAmount(n));

    projects.forEach((proj: any) => {
      body.push([{
        content: `Project :  ${proj.projectName}`, colSpan: 7,
        styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9.5, cellPadding: cellPad },
      }]);
      proj.costs.forEach((cg: any) => {
        if (withCost) {
          body.push([{
            content: `Cost :  ${cg.costName}`, colSpan: 7,
            styles: { fillColor: COST, textColor: NAVY_TEXT, fontStyle: 'bold', fontSize: 9, cellPadding: indPad1 },
          }]);
        }
        cg.rows.forEach((row: BudgetRow) => {
          const approved = parseFloat(String(row.APPROVED_AMT)) || 0;
          const pr = parseFloat(String(row.PR_AMOUNT)) || 0;
          const po = parseFloat(String(row.PO_AMOUNT)) || 0;
          const util = parseFloat(String(row.TOT_UTILISED)) || 0;
          const bal = parseFloat(String(row.BALANCE_AMT)) || (approved - util);
          body.push([
            { content: row.BUDGET_YEAR, styles: { fontSize: 8, halign: 'center' } },
            { content: monthLabel(row), styles: { fontSize: 8, halign: 'center' } },
            { content: formatAmount(approved), styles: { halign: 'right', fontSize: 8 } },
            { content: formatAmount(pr), styles: { halign: 'right', fontSize: 8 } },
            { content: formatAmount(po), styles: { halign: 'right', fontSize: 8 } },
            { content: formatAmount(util), styles: { halign: 'right', fontSize: 8 } },
            { content: fmtBal(bal), styles: { halign: 'right', fontSize: 8 } },
          ]);
        });
        if (withCost) {
          body.push([
            { content: `Cost Total :  ${cg.costName}`, colSpan: 5, styles: { fillColor: CTOT, textColor: DARK, fontStyle: 'bold', fontSize: 8.5, cellPadding: indPad1 } },
            { content: formatAmount(cg.utilised), styles: { fillColor: CTOT, textColor: DARK, fontStyle: 'bold', fontSize: 8.5, halign: 'right' } },
            { content: fmtBal(cg.approved - cg.utilised), styles: { fillColor: CTOT, textColor: DARK, fontStyle: 'bold', fontSize: 8.5, halign: 'right' } },
          ]);
        }
      });
      body.push([
        { content: `Project Total :  ${proj.projectName}`, colSpan: 5, styles: { fillColor: PTOT, textColor: NAVY_TEXT, fontStyle: 'bold', fontSize: 9, cellPadding: cellPad } },
        { content: formatAmount(proj.utilised), styles: { fillColor: PTOT, textColor: NAVY_TEXT, fontStyle: 'bold', fontSize: 9, halign: 'right' } },
        { content: fmtBal(proj.approved - proj.utilised), styles: { fillColor: PTOT, textColor: NAVY_TEXT, fontStyle: 'bold', fontSize: 9, halign: 'right' } },
      ]);
    });

    body.push([
      { content: 'Grand Total :', colSpan: 5, styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
      { content: formatAmount(grandUtilised), styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 10.5, halign: 'right', cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
      { content: fmtBal(grandApproved - grandUtilised), styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 10.5, halign: 'right', cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
    ]);

    autoTable(pdf, {
      startY: TABLE_TOP,
      margin: { left: margin, right: margin, top: HEADER_H + 4 },
      columnStyles: {
        0: { cellWidth: 18 }, 1: { cellWidth: 20 }, 2: { cellWidth: 32 },
        3: { cellWidth: 28 }, 4: { cellWidth: 28 }, 5: { cellWidth: 28 }, 6: { cellWidth: 28 },
      },
      head: [[
        { content: 'Year', styles: { halign: 'center', fontSize: 10 } },
        { content: 'Month', styles: { halign: 'center', fontSize: 10 } },
        { content: 'Approved Amount', styles: { halign: 'right', fontSize: 10 } },
        { content: 'PR Amount', styles: { halign: 'right', fontSize: 10 } },
        { content: 'PO Amount', styles: { halign: 'right', fontSize: 10 } },
        { content: 'Total Utilised', styles: { halign: 'right', fontSize: 10 } },
        { content: 'Balance Amount', styles: { halign: 'right', fontSize: 10 } },
      ]],
      body,
      headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 10, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } },
      bodyStyles: { fontSize: 8, textColor: DARK, cellPadding: { top: 3, bottom: 3, left: 5, right: 5 }, overflow: 'ellipsize', minCellHeight: 0 },
      alternateRowStyles: {},
      tableLineColor: BORDER,
      tableLineWidth: 0.25,
      didDrawPage: drawPageHeader,
      didDrawCell: (data) => {
        const { cell, doc } = data;
        doc.setDrawColor(...BORDER); doc.setLineWidth(0.2);
        doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
        doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
      },
    });

    pdf.save('Budget_Status_Summary.pdf');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#f3f4f6', padding: '6px 10px', fontFamily: 'system-ui, sans-serif', minHeight: '100vh' }}>
      <style>{`
        .action-btn-primary:hover { background: #1e40af !important; }
        .action-btn-ghost:hover { background: #EBF4FF !important; border-color: #185FA5 !important; color: #185FA5 !important; }
        .field-row { background: #EEF5FD; border-radius: 8px; padding: 10px 12px; }
      `}</style>

      <div style={{ maxWidth: 1400, margin: '0 auto' }}>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 10,
          padding: 5, marginBottom: 10,
        }}>
          <button
            onClick={() => setActiveTab('parameters')}
            style={{
              flex: 1, padding: '8px 14px', borderRadius: 7, border: 'none',
              cursor: 'pointer', fontSize: 12.5, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: activeTab === 'parameters' ? '#185FA5' : 'transparent',
              color: activeTab === 'parameters' ? '#fff' : '#374151',
              transition: 'background 0.15s',
            }}
          >
            ⚙ Parameters
          </button>
          <button
            onClick={() => hasGeneratedReport && setActiveTab('report')}
            disabled={!hasGeneratedReport}
            title={hasGeneratedReport ? undefined : 'Generate a report first'}
            style={{
              flex: 1, padding: '8px 14px', borderRadius: 7, border: 'none',
              cursor: hasGeneratedReport ? 'pointer' : 'not-allowed',
              fontSize: 12.5, fontWeight: 600,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              background: activeTab === 'report' ? '#185FA5' : 'transparent',
              color: !hasGeneratedReport ? '#9ca3af' : (activeTab === 'report' ? '#fff' : '#374151'),
              transition: 'background 0.15s',
            }}
          >
            <BarChart2 size={13} /> Report
            {hasGeneratedReport && (
              <span style={{
                fontSize: 9.5,
                background: activeTab === 'report' ? 'rgba(255,255,255,0.25)' : '#d1fae5',
                color: activeTab === 'report' ? '#fff' : '#065f46',
                padding: '1px 7px', borderRadius: 10, fontWeight: 600,
              }}>
                Generated
              </span>
            )}
          </button>
        </div>

        <div style={{
          display: activeTab === 'parameters' ? 'block' : 'none',
          background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: 12,
          padding: '8px 12px', marginBottom: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
              Budget Status Report — Summary
            </span>
            {hasGeneratedReport && (
              <span style={{
                fontSize: 10, background: '#d1fae5', color: '#065f46',
                padding: '2px 10px', borderRadius: 12, fontWeight: 500,
              }}>
                Report Generated
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="field-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <FloatLabel label="Division" bgColor={BG}>
                <MultiSelectField
                  label=""
                  options={divisionOptions}
                  value={pending.division}
                  onChange={(v) => setPendingField('division', v)}
                  loading={isDivisionLoading}
                />
              </FloatLabel>
              <FloatLabel label="Project" bgColor={BG}>
                <MultiSelectField
                  label=""
                  options={projectOptions}
                  value={pending.project}
                  onChange={(v) => setPendingField('project', v)}
                  loading={isProjectLoading}
                />
              </FloatLabel>
            </div>

            <div className="field-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <FloatLabel label="Month" bgColor={BG}>
                <SingleSelectField
                  label=""
                  options={monthOpts}
                  value={pending.month}
                  onChange={(v) => setPendingField('month', v)}
                  loading={isMonthLoading}
                />
              </FloatLabel>
              <FloatLabel label="Cost Code" bgColor={BG}>
                <MultiSelectField
                  label=""
                  options={costOpts}
                  value={pending.cost_code}
                  onChange={(v) => setPendingField('cost_code', v)}
                  loading={isCostLoading}
                />
              </FloatLabel>
            </div>

            <div className="field-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              <FloatLabel label="Grouping on Cost" bgColor={BG}>
                <select
                  value={pending.group_by_cost}
                  onChange={(e) => setPendingField('group_by_cost', e.target.value as 'Yes' | 'No')}
                  style={selectBaseStyle}
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </FloatLabel>
              <div />
            </div>
          </div>

          <div style={{
            display: 'flex', justifyContent: 'flex-end', gap: 8,
            marginTop: 10, paddingTop: 8, borderTop: '0.5px solid #e5e7eb',
          }}>
            <button
              className="action-btn-ghost"
              onClick={handleReset}
              disabled={isLoading}
              style={{
                padding: '7px 16px', border: '0.5px solid #d1d5db', background: '#fff',
                cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex',
                alignItems: 'center', gap: 6, fontSize: 12, borderRadius: 6,
                color: '#374151', opacity: isLoading ? 0.6 : 1,
              }}
            >
              <RotateCcw size={13} /> Reset
            </button>

            <button
              className="action-btn-primary"
              onClick={handleGenerateReport}
              disabled={isLoading}
              style={{
                padding: '7px 16px', border: '0.5px solid #185FA5',
                background: isLoading ? '#94a3b8' : '#185FA5',
                cursor: isLoading ? 'not-allowed' : 'pointer', display: 'flex',
                alignItems: 'center', gap: 6, fontSize: 12, borderRadius: 6,
                color: '#fff', transition: 'background 0.2s',
              }}
            >
              <Printer size={13} /> {isLoading ? 'Loading…' : 'Generate Report'}
            </button>
          </div>
        </div>

        {hasGeneratedReport && activeTab === 'report' && (
          <GroupedReportTable<BudgetRow>
            title="Budget Status Report — Summary"
            rows={reportRows}
            isLoading={isReportLoading || isReportFetching}
            columns={COLUMNS}
            groupBy={groupBy}
            amountKey="TOT_UTILISED"
            balanceKey="BALANCE_AMT"
            filterDefs={[]}
            searchKeys={['PROJECT_NAME', 'COST_NAME']}
            logo={companyLogo}
            printUser={printUser}
            onExcel={handleExcel}
            onPDF={handlePDF}
          />
        )}
      </div>
    </div>
  );
};

export default BudgetStatusSummary;