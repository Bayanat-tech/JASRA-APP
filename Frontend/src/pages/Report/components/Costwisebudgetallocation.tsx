import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import companyLogo from 'assets/Al_jasra_logo.jpg';
import useAuth from 'hooks/useAuth';
import axiosServices from 'utils/axios';
import { ReportPage } from 'components/reports/purchase_order_register/common/ReportPage';
import { ReportParameterForm, ParamFieldConfig } from 'components/reports/purchase_order_register/common/ReportParameterForm';
import {
  formatAmount,
  formatFilterValue,
  isFiltersActive,
  ReportFilters,
} from 'components/reports/purchase_order_register/common/reportHelpers';

type ViewType = 'cost' | 'project';

// ─────────────────────────────────────────────────────────────────────────
// Raw SQL endpoint - same as PR report
// ─────────────────────────────────────────────────────────────────────────
const RAW_SQL_ENDPOINT = '/api/wms/inbound/executeRawSql';

async function runRawSql<T = any>(raw_sql: string): Promise<T[]> {
  const res = await axiosServices.post(RAW_SQL_ENDPOINT, { raw_sql });
  return (res.data?.data ?? []) as T[];
}

function sqlStr(v: any): string {
  return `'${String(v).replace(/'/g, "''")}'`;
}

// ── Row type — matches your view ────────────────────────────────────────
type BudgetRow = {
  COMPANY_CODE?: string;
  DIV_CODE?: string;
  DIV_NAME?: string;
  PROJECT_CODE?: string;
  PROJECT_NAME?: string;
  COST_CODE?: string;
  COST_NAME?: string;
  TOTAL_APPROVED_AMT?: number;
};

// ── Grouping structures ─────────────────────────────────────────────────
type CostGroup = {
  costCode: string;
  costName: string;
  amount: number;
};

type ProjectGroup = {
  projectCode: string;
  projectName: string;
  costs: CostGroup[];
  total: number;
};

type DivisionGroup = {
  divCode: string;
  divName: string;
  projects: ProjectGroup[];
  total: number;
};

// ── Group functions ─────────────────────────────────────────────────────
function groupByDivisionAndProject(rows: BudgetRow[], viewType: ViewType): DivisionGroup[] {
  const divMap: Record<string, any> = {};

  for (const r of rows) {
    const divKey = r.DIV_CODE || 'UNKNOWN';
    const projKey = r.PROJECT_CODE || 'UNKNOWN';
    const amount = parseFloat(String(r.TOTAL_APPROVED_AMT)) || 0;

    if (!divMap[divKey]) {
      divMap[divKey] = {
        divCode: r.DIV_CODE || '',
        divName: r.DIV_NAME || '',
        projects: {},
        total: 0,
      };
    }
    const div = divMap[divKey];

    if (!div.projects[projKey]) {
      div.projects[projKey] = {
        projectCode: r.PROJECT_CODE || '',
        projectName: r.PROJECT_NAME || '',
        costs: [],
        total: 0,
      };
    }
    const proj = div.projects[projKey];

    if (viewType === 'cost') {
      const costKey = r.COST_CODE || 'UNKNOWN';
      let cost = proj.costs.find((c: CostGroup) => c.costCode === costKey);
      if (!cost) {
        cost = { costCode: r.COST_CODE || '', costName: r.COST_NAME || '', amount: 0 };
        proj.costs.push(cost);
      }
      cost.amount += amount;
    }

    proj.total += amount;
    div.total += amount;
  }

  return Object.values(divMap).map((div: any) => ({
    ...div,
    projects: Object.values(div.projects),
  }));
}

// ── Base SQL ─────────────────────────────────────────────────────────────
function buildDetailQuery(filters: ReportFilters, viewType: ViewType, companyCode?: string) {
  const viewName = viewType === 'project'
    ? 'VW_PROJECT_WISE_ALLOCATION'
    : 'VW_PROJECT_COST_BUDGET_ALLOCATION';

  const where: string[] = [];

  if (companyCode) {
    where.push(`COMPANY_CODE = ${sqlStr(companyCode)}`);
  }

  const divName = (filters.div_name as string[]) || [];
  const projectName = (filters.project_name as string[]) || [];
  const costCode = (filters.cost_code as string[]) || [];

  if (divName.length) where.push(`DIV_NAME IN (${divName.map(sqlStr).join(', ')})`);
  if (projectName.length) where.push(`PROJECT_NAME IN (${projectName.map(sqlStr).join(', ')})`);
  if (costCode.length) where.push(`COST_CODE IN (${costCode.map(sqlStr).join(', ')})`);

  const whereClause = where.length ? `WHERE ${where.join('\n  AND ')}` : '';
  const orderBy = viewType === 'project'
    ? 'ORDER BY DIV_CODE, PROJECT_NAME'
    : 'ORDER BY DIV_CODE, PROJECT_NAME, COST_CODE';

  return `
    SELECT *
    FROM ${viewName}
    ${whereClause}
    ${orderBy}
  `;
}

// ── Parameter dropdown options ──────────────────────────────────────────
function getDistinctOptions(column: string, filterKey: string, viewType: ViewType) {
  return async (filters: ReportFilters, companyCode?: string): Promise<string[]> => {
    const viewName = viewType === 'project'
      ? 'VW_PROJECT_WISE_ALLOCATION'
      : 'VW_PROJECT_COST_BUDGET_ALLOCATION';

    const where: string[] = [];

    if (companyCode) {
      where.push(`COMPANY_CODE = ${sqlStr(companyCode)}`);
    }

    // Build filter clauses excluding the current field
    const divName = (filters.div_name as string[]) || [];
    const projectName = (filters.project_name as string[]) || [];
    const costCode = (filters.cost_code as string[]) || [];

    if (filterKey !== 'div_name' && divName.length) where.push(`DIV_NAME IN (${divName.map(sqlStr).join(', ')})`);
    if (filterKey !== 'project_name' && projectName.length) where.push(`PROJECT_NAME IN (${projectName.map(sqlStr).join(', ')})`);
    if (filterKey !== 'cost_code' && costCode.length) where.push(`COST_CODE IN (${costCode.map(sqlStr).join(', ')})`);

    const whereClause = where.length ? `WHERE ${where.join('\n  AND ')}` : '';

    const sql = `
      SELECT DISTINCT ${column} AS value
      FROM ${viewName}
      ${whereClause}
      ORDER BY ${column}
    `;

    const rows = await runRawSql<any>(sql);
    return rows.map((r) => String(r.VALUE ?? r.value ?? '').trim()).filter(Boolean);
  };
}

// ── Project Name options — sourced directly from MS_PS_PROJECT_MASTER ────
// NOTE: MS_PS_PROJECT_MASTER has DIV_CODE but no DIV_NAME column, so this
// dropdown only filters by COMPANY_CODE and is NOT cascaded off the
// Division filter (unlike Cost Code, which still cascades off the view).
function getProjectNameOptionsFromMaster() {
  return async (_filters: ReportFilters, companyCode?: string): Promise<string[]> => {
    const where: string[] = [];

    if (companyCode) {
      where.push(`COMPANY_CODE = ${sqlStr(companyCode)}`);
    }

    const whereClause = where.length ? `WHERE ${where.join('\n  AND ')}` : '';

    const sql = `
      SELECT DISTINCT PROJECT_NAME AS value
      FROM MS_PS_PROJECT_MASTER
      ${whereClause}
      ORDER BY PROJECT_NAME
    `;

    const rows = await runRawSql<any>(sql);
    return rows.map((r) => String(r.VALUE ?? r.value ?? '').trim()).filter(Boolean);
  };
}

// ── Field configurations ────────────────────────────────────────────────
const budgetReportFields: ParamFieldConfig[][] = [
  [
    {
      type: 'multiselect',
      key: 'div_name',
      label: 'Division',
      fetchOptions: getDistinctOptions('DIV_NAME', 'div_name', 'cost'),
      placeholder: 'All Divisions',
    },
    {
      type: 'multiselect',
      key: 'project_name',
      label: 'Project Name',
      fetchOptions: getProjectNameOptionsFromMaster(),
      placeholder: 'All Projects',
    },
  ],
  [
    {
      type: 'multiselect',
      key: 'cost_code',
      label: 'Cost Code',
      fetchOptions: getDistinctOptions('COST_CODE', 'cost_code', 'cost'),
      placeholder: 'All Cost Codes',
    },
  ],
];

const EMPTY_FILTERS: ReportFilters = {
  div_name: [],
  project_name: [],
  cost_code: [],
  amount_from: '',
  amount_to: '',
  date_from: '',
  date_to: '',
};

const paramLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: '#6b7280',
  marginBottom: 8,
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
};

// ── CSS: matches PR report styling ──────────────────────────────────────
const TABLE_CSS = `
  .budget-print-logo-row td, .budgets-print-logo-row td { padding: 10px 24px; }
  .budget-print-logo-flex, .budgets-print-logo-flex { display: flex; justify-content: space-between; align-items: center; }
  .budget-print-logo-flex img, .budgets-print-logo-flex img { height: 44px; width: auto; object-fit: contain; }
  .budget-print-meta-text, .budgets-print-meta-text { text-align: right; font-size: 11px; color: #6b7280; line-height: 1.8; }
  .budget-title-bar td, .budgets-title-bar td { background: #1e3a5f; color: #fff; text-align: center; padding: 11px; font-size: 14px; font-weight: 700; letter-spacing: 0.02em; }
  .budget-meta-row td, .budgets-meta-row td { padding: 9px 24px; background: #f9fafb; font-size: 12px; color: #6b7280; }

  table.budget-table, table.budgets-table { width: 100%; border-collapse: collapse; font-size: 12.5px; table-layout: fixed; }
  .budget-table col.c0 { width: 22%; } .budget-table col.c1 { width: 43%; } .budget-table col.c2 { width: 35%; }
  .budgets-table col.c0 { width: 35%; } .budgets-table col.c1 { width: 65%; }

  /* Cost-wise table keeps full grid borders (all four sides) */
  .budget-table th, .budget-table td {
    border: 1px solid #9d9db3;
    padding: 7px 10px;
    vertical-align: top;
  }

  /* Project-wise table: keep horizontal row lines, drop the internal vertical divider */
  .budgets-table th, .budgets-table td {
    border-top: 1px solid #9d9db3;
    border-bottom: 1px solid #9d9db3;
    border-left: none;
    border-right: none;
    padding: 7px 10px;
    vertical-align: top;
  }
  .budgets-table th:first-child, .budgets-table td:first-child {
    border-left: 1px solid #9d9db3;
  }
  .budgets-table th:last-child, .budgets-table td:last-child {
    border-right: 1px solid #9d9db3;
  }

  .budget-table thead th, .budgets-table thead th {
    background: #d9d6e8;
    color: #1f1f2e;
    font-weight: 700;
    font-size: 12.5px;
    text-align: center;
    white-space: nowrap;
  }
  .budget-table thead th { cursor: pointer; user-select: none; }
  .budget-table thead th:hover, .budgets-table thead th:hover { background: #cbc7e0; }
  .budget-table thead th.num, .budgets-table thead th.num { text-align: right; }
  .budget-table thead th.left, .budgets-table thead th.left { text-align: left; padding-left: 12px; }

  .budget-table tr.project-banner td, .budgets-table tr.project-banner td {
    background: #e7eefc;
    color: #1e3a5f;
    font-weight: 700;
    font-size: 12.5px;
    padding: 8px 10px;
  }
  .budget-table tr.data-row td, .budgets-table tr.data-row td {
    background: #fff;
    color: #1f1f2e;
    vertical-align: top;
    line-height: 1.55;
  }
  .budget-table td.num, .budgets-table td.num {
    text-align: right;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    padding-right: 70px;
  }
  .budget-table thead th.num, .budgets-table thead th.num {
    padding-right: 70px;
  }

  .budget-table tr.project-total td, .budgets-table tr.project-total td {
    background: #eef1fb;
    font-weight: 700;
    color: #1e3a5f;
    font-size: 12.5px;
  }
  .budget-table tr.division-total td, .budgets-table tr.division-total td {
    background: #ece9f3;
    font-weight: 700;
    color: #1e3a5f;
    font-size: 12.5px;
  }

  @media print {
    table.budget-table thead, table.budgets-table thead { display: table-header-group; }
    table.budget-table tr, table.budgets-table tr { page-break-inside: avoid; }
  }
`;

const BudgetAllocationReport: React.FC = () => {
  const { user } = useAuth();

  const [viewType, setViewType] = useState<ViewType>('cost');
  const [hasGeneratedReport, setHasGeneratedReport] = useState(false);
  const [activeTab, setActiveTab] = useState<'parameters' | 'report'>('parameters');
  const [applied, setApplied] = useState<ReportFilters>(EMPTY_FILTERS);
  const [pending, setPending] = useState<ReportFilters>(EMPTY_FILTERS);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ col: keyof CostGroup | keyof ProjectGroup | null; dir: 'asc' | 'desc' }>({
    col: null,
    dir: 'asc',
  });

  const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const printUser = user?.username;
  const appliedFiltersRef = useRef<ReportFilters>(EMPTY_FILTERS);

  // ── ONE raw-SQL query powers both views ──
  const { data: allRows = [], isLoading, isFetching, refetch } = useQuery<BudgetRow[]>({
    queryKey: ['budget_allocation', viewType],
    queryFn: async () => {
      const sql = buildDetailQuery(appliedFiltersRef.current, viewType, user?.company_code);
      return runRawSql<BudgetRow>(sql);
    },
    enabled: false,
    staleTime: Infinity,
  });

  const dataLoading = isLoading || isFetching;

  const filteredRows = useMemo(() => {
    if (!search.trim()) return allRows;
    const q = search.trim().toLowerCase();
    return allRows.filter((r) => {
      return (
        r.PROJECT_NAME?.toLowerCase().includes(q) ||
        r.PROJECT_CODE?.toLowerCase().includes(q) ||
        r.COST_NAME?.toLowerCase().includes(q) ||
        r.COST_CODE?.toLowerCase().includes(q) ||
        r.DIV_NAME?.toLowerCase().includes(q)
      );
    });
  }, [allRows, search]);

  // Group data based on view type
  const groupedData = useMemo(() => {
    return groupByDivisionAndProject(filteredRows, viewType);
  }, [filteredRows, viewType]);

  // ── Sorting — mirrors PR Register's column-header sort behaviour.
  //    For 'cost' view we sort each project's cost rows; for 'project'
  //    view we sort each division's project rows. ─────────────────────
  const sortCosts = useCallback((costs: CostGroup[]) => {
    if (viewType !== 'cost' || !sort.col) return costs;
    const col = sort.col as keyof CostGroup;
    return [...costs].sort((a, b) => {
      let aVal: any = a[col];
      let bVal: any = b[col];
      if (col === 'amount') {
        aVal = parseFloat(String(aVal)) || 0;
        bVal = parseFloat(String(bVal)) || 0;
      } else {
        aVal = String(aVal ?? '').toLowerCase();
        bVal = String(bVal ?? '').toLowerCase();
      }
      if (aVal < bVal) return sort.dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sort, viewType]);

  const sortProjects = useCallback((projects: ProjectGroup[]) => {
    if (viewType !== 'project' || !sort.col) return projects;
    const col = sort.col as keyof ProjectGroup;
    return [...projects].sort((a, b) => {
      let aVal: any = a[col];
      let bVal: any = b[col];
      if (col === 'total') {
        aVal = parseFloat(String(aVal)) || 0;
        bVal = parseFloat(String(bVal)) || 0;
      } else {
        aVal = String(aVal ?? '').toLowerCase();
        bVal = String(bVal ?? '').toLowerCase();
      }
      if (aVal < bVal) return sort.dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [sort, viewType]);

  const handleSort = (col: keyof CostGroup | keyof ProjectGroup) => {
    setSort((prev) => (prev.col === col && prev.dir === 'asc' ? { col, dir: 'desc' } : { col, dir: 'asc' }));
  };

  const grandTotal = useMemo(
    () => groupedData.reduce((s, d) => s + d.total, 0),
    [groupedData]
  );

  const filtersActive = isFiltersActive(applied, search);
  const reportTitle = viewType === 'project' ? 'Project Wise Budget Allocation' : 'Cost Wise Budget Allocation';

  const handlePrint = () => window.print();

  const handleGenerateReport = async () => {
    setApplied({ ...pending });
    appliedFiltersRef.current = { ...pending };
    try { await refetch(); } finally { setHasGeneratedReport(true); setActiveTab('report'); }
  };

  const handleReset = () => {
    setPending(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
    setHasGeneratedReport(false);
    setActiveTab('parameters');
  };

  // ── Excel Export ──
  const handleExcel = async () => {
    const XLSX = await import('xlsx');
    const wb = XLSX.utils.book_new();

    const rows: any[][] = [
      [reportTitle],
      [`Print Date: ${printDate}`, '', `Print User: ${printUser}`],
      [],
    ];

    if (viewType === 'cost') {
      rows.push(['Division', 'Project Code', 'Project Name', 'Cost Code', 'Cost Name', 'Total Approved Amount']);

      groupedData.forEach((div) => {
        div.projects.forEach((proj: ProjectGroup) => {
          sortCosts(proj.costs).forEach((cost) => {
            rows.push([
              div.divName,
              proj.projectCode,
              proj.projectName,
              cost.costCode,
              cost.costName,
              cost.amount,
            ]);
          });
          rows.push(['', '', '', '', `Project Total: ${proj.projectName}`, proj.total]);
        });
        rows.push(['', '', '', '', `Division Total: ${div.divName}`, div.total]);
      });
    } else {
      rows.push(['Division', 'Project Code', 'Project Name', 'Total Approved Amount']);

      groupedData.forEach((div) => {
        sortProjects(div.projects).forEach((proj) => {
          rows.push([
            div.divName,
            proj.projectCode,
            proj.projectName,
            proj.total,
          ]);
        });
        rows.push(['', '', `Division Total: ${div.divName}`, div.total]);
      });
    }

    rows.push([]);
    rows.push(['', '', '', 'Grand Total', grandTotal]);

    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = viewType === 'cost'
      ? [{ wch: 20 }, { wch: 18 }, { wch: 25 }, { wch: 16 }, { wch: 35 }, { wch: 18 }]
      : [{ wch: 20 }, { wch: 18 }, { wch: 35 }, { wch: 18 }];

    XLSX.utils.book_append_sheet(wb, ws, 'Budget Allocation');
    XLSX.writeFile(wb, `Budget_Allocation_${viewType === 'cost' ? 'Cost' : 'Project'}_Wise.xlsx`);
  };

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

  // ── PDF Export ──
  const handleDownloadPDF = async () => {
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 14;
    const NAVY = [30, 58, 95] as [number, number, number];
    const WHITE = [255, 255, 255] as [number, number, number];
    const DARK = [55, 65, 81] as [number, number, number];
    const BORDER = [209, 213, 219] as [number, number, number];

    let logoBase64 = '';
    try { logoBase64 = await getBase64FromUrl(companyLogo); } catch { /* skip */ }

    const HEADER_H = 36, TITLE_Y = 27, TABLE_TOP = filtersActive ? 44 : 39;

    const drawPageHeader = (data: any) => {
      const pg = data.pageNumber as number;
      if (logoBase64) pdf.addImage(logoBase64, 'PNG', margin, 5, 32, 16);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      pdf.text(`Page ${pg}`, pageW - margin, 9, { align: 'right' });
      pdf.text(`Print Date : ${printDate}`, pageW - margin, 14, { align: 'right' });
      pdf.text(`Print User : ${printUser}`, pageW - margin, 19, { align: 'right' });
      pdf.setFillColor(...NAVY);
      pdf.rect(margin, TITLE_Y, pageW - margin * 2, 8, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(...WHITE);
      pdf.text(reportTitle, pageW / 2, TITLE_Y + 5.5, { align: 'center' });
      if (pg === 1 && filtersActive) {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7.5);
        pdf.setTextColor(107, 114, 128);
        const parts = Object.entries(applied)
          .filter(([, v]) => (Array.isArray(v) ? v.length > 0 : Boolean(v)))
          .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${formatFilterValue(v as string | string[])}`)
          .join(' | ');
        if (parts) pdf.text(`Filter: ${parts}`, margin, TABLE_TOP - 2);
      }
    };

    const cellPad = { top: 1.5, bottom: 1.5, left: 5, right: 5 };

    if (viewType === 'cost') {
      const body: any[] = [];

      groupedData.forEach((div) => {
        div.projects.forEach((proj: ProjectGroup) => {
          body.push([{
            content: `Project : ${proj.projectCode} ${proj.projectName ? `| ${proj.projectName}` : ''}`,
            colSpan: 3,
            styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9.5, cellPadding: cellPad },
          }]);

          sortCosts(proj.costs).forEach((cost) => {
            body.push([
              { content: cost.costCode || '', styles: { fontSize: 9, halign: 'left' } },
              { content: cost.costName || '', styles: { fontSize: 9, halign: 'left' } },
              { content: formatAmount(cost.amount), styles: { halign: 'right', fontSize: 9, fontStyle: 'bold' } },
            ]);
          });

          body.push([
            { content: `Project Total : ${proj.projectName}`, colSpan: 2, styles: { fillColor: [213, 220, 232], textColor: NAVY, fontStyle: 'bold', fontSize: 9.5 } },
            { content: formatAmount(proj.total), styles: { fillColor: [213, 220, 232], textColor: NAVY, fontStyle: 'bold', halign: 'right', fontSize: 9.5 } },
          ]);
        });

        body.push([
          { content: `Division Total : ${div.divName}`, colSpan: 2, styles: { fillColor: [236, 233, 243], textColor: NAVY, fontStyle: 'bold', fontSize: 9.5 } },
          { content: formatAmount(div.total), styles: { fillColor: [236, 233, 243], textColor: NAVY, fontStyle: 'bold', halign: 'right', fontSize: 9.5 } },
        ]);
      });

      body.push([{ content: '', colSpan: 3, styles: { fillColor: [255, 255, 255], cellPadding: { top: 2, bottom: 2 } } }]);
      body.push([
        { content: 'Grand Total :', colSpan: 2, styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
        { content: formatAmount(grandTotal), styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', halign: 'right', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
      ]);

      autoTable(pdf, {
        startY: TABLE_TOP,
        margin: { left: margin, right: margin, top: HEADER_H + 4 },
        columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 'auto' as any }, 2: { cellWidth: 35 } },
        head: [[
          { content: 'Cost Code', styles: { halign: 'left', fontSize: 9 } },
          { content: 'Cost Name', styles: { halign: 'left', fontSize: 9 } },
          { content: 'Total Approved Amount', styles: { halign: 'right', fontSize: 9 } },
        ]],
        body,
        headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } },
        bodyStyles: { fontSize: 8, textColor: DARK, cellPadding: { top: 3, bottom: 3, left: 5, right: 5 }, overflow: 'linebreak', minCellHeight: 0 },
        tableLineColor: BORDER,
        tableLineWidth: 0.25,
        didDrawPage: drawPageHeader,
        didDrawCell: (data) => {
          const { cell, doc } = data;
          doc.setDrawColor(...BORDER);
          doc.setLineWidth(0.2);
          doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
          doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
        },
      });
    } else {
      const body: any[] = [];

      groupedData.forEach((div) => {
        body.push([{
          content: `Division : ${div.divName}`,
          colSpan: 2,
          styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9.5, cellPadding: cellPad },
        }]);

        sortProjects(div.projects).forEach((proj) => {
          body.push([
            { content: proj.projectCode || '', styles: { fontSize: 9, halign: 'left' } },
            { content: proj.projectName || '', styles: { fontSize: 9, halign: 'left' } },
            { content: formatAmount(proj.total), styles: { halign: 'right', fontSize: 9, fontStyle: 'bold' } },
          ]);
        });

        body.push([
          { content: `Division Total : ${div.divName}`, colSpan: 1, styles: { fillColor: [236, 233, 243], textColor: NAVY, fontStyle: 'bold', fontSize: 9.5 } },
          { content: formatAmount(div.total), styles: { fillColor: [236, 233, 243], textColor: NAVY, fontStyle: 'bold', halign: 'right', fontSize: 9.5 } },
        ]);
      });

      body.push([{ content: '', colSpan: 2, styles: { fillColor: [255, 255, 255], cellPadding: { top: 2, bottom: 2 } } }]);
      body.push([
        { content: 'Grand Total :', colSpan: 1, styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
        { content: formatAmount(grandTotal), styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', halign: 'right', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
      ]);

      autoTable(pdf, {
        startY: TABLE_TOP,
        margin: { left: margin, right: margin, top: HEADER_H + 4 },
        columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 'auto' as any }, 2: { cellWidth: 35 } },
        head: [[
          { content: 'Project Code', styles: { halign: 'left', fontSize: 9 } },
          { content: 'Project Name', styles: { halign: 'left', fontSize: 9 } },
          { content: 'Total Approved Amount', styles: { halign: 'right', fontSize: 9 } },
        ]],
        body,
        headStyles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } },
        bodyStyles: { fontSize: 8, textColor: DARK, cellPadding: { top: 3, bottom: 3, left: 5, right: 5 }, overflow: 'linebreak', minCellHeight: 0 },
        tableLineColor: BORDER,
        tableLineWidth: 0.25,
        didDrawPage: drawPageHeader,
        didDrawCell: (data) => {
          const { cell, doc } = data;
          doc.setDrawColor(...BORDER);
          doc.setLineWidth(0.2);
          doc.line(cell.x, cell.y + cell.height, cell.x + cell.width, cell.y + cell.height);
          doc.line(cell.x + cell.width, cell.y, cell.x + cell.width, cell.y + cell.height);
        },
      });
    }

    pdf.save(`Budget_Allocation_${viewType === 'cost' ? 'Cost' : 'Project'}_Wise.pdf`);
  };

  const filterMetaRow = (colSpan: number, className: string) => filtersActive && (
    <tr className={className}>
      <td colSpan={colSpan}>
        <b>Filter:</b>{' '}
        {[
          ...Object.entries(applied)
            .filter(([, v]) => (Array.isArray(v) ? v.length > 0 : Boolean(v)))
            .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${formatFilterValue(v as string | string[])}`),
          ...(search.trim() ? [`search: "${search.trim()}"`] : []),
        ].join(' | ')}
      </td>
    </tr>
  );

  // ── Cost Wise table markup ──
  const costWiseTable = groupedData.length === 0 ? (
    <div className="rp-empty">No records found.</div>
  ) : (
    <table className="budget-table">
      <colgroup>
        <col className="c0" /><col className="c1" /><col className="c2" />
      </colgroup>
      <thead>
        <tr className="budget-print-logo-row">
          <td colSpan={3}>
            <div className="budget-print-logo-flex">
              <img src={companyLogo} alt="Logo" />
              <div className="budget-print-meta-text">
                <div><b>Print Date:</b> {printDate}</div>
                <div><b>Print User:</b> {printUser}</div>
              </div>
            </div>
          </td>
        </tr>
        <tr className="budget-title-bar"><td colSpan={3}>Cost Wise Budget Allocation</td></tr>
        {filterMetaRow(3, 'budget-meta-row')}
        <tr>
          <th className="left" onClick={() => handleSort('costCode')}>Cost Code</th>
          <th className="left" onClick={() => handleSort('costName')}>Cost Name</th>
          <th className="num" onClick={() => handleSort('amount')}>Total Approved Amount</th>
        </tr>
      </thead>
      <tbody>
        {groupedData.map((div) => (
          <React.Fragment key={div.divCode}>
            {div.projects.map((proj: ProjectGroup) => (
              <React.Fragment key={proj.projectCode}>
                <tr className="project-banner">
                  <td colSpan={3}>
                    Project : {proj.projectCode} {proj.projectName ? `| ${proj.projectName}` : ''}
                  </td>
                </tr>
                {sortCosts(proj.costs).map((cost, idx) => (
                  <tr key={`${cost.costCode}-${idx}`} className="data-row">
                    <td>{cost.costCode || ''}</td>
                    <td>{cost.costName || ''}</td>
                    <td className="num">{formatAmount(cost.amount)}</td>
                  </tr>
                ))}
                <tr className="project-total">
                  <td colSpan={2}>Project Total : {proj.projectName}</td>
                  <td className="num">{formatAmount(proj.total)}</td>
                </tr>
              </React.Fragment>
            ))}
            <tr className="division-total">
              <td colSpan={2}>Division Total : {div.divName}</td>
              <td className="num">{formatAmount(div.total)}</td>
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );

  // ── Project Wise table markup ──
  const projectWiseTable = groupedData.length === 0 ? (
    <div className="rp-empty">No records found.</div>
  ) : (
    <table className="budgets-table">
      <colgroup>
        <col className="c0" /><col className="c1" />
      </colgroup>
      <thead>
        <tr className="budgets-print-logo-row">
          <td colSpan={2}>
            <div className="budgets-print-logo-flex">
              <img src={companyLogo} alt="Logo" />
              <div className="budgets-print-meta-text">
                <div><b>Print Date:</b> {printDate}</div>
                <div><b>Print User:</b> {printUser}</div>
              </div>
            </div>
          </td>
        </tr>
        <tr className="budgets-title-bar"><td colSpan={2}>Project Wise Budget Allocation</td></tr>
        {filterMetaRow(2, 'budgets-meta-row')}
        <tr>
          <th className="left" onClick={() => handleSort('projectCode')}>Project Code</th>
          <th className="num" onClick={() => handleSort('total')}>Total Approved Amount</th>
        </tr>
      </thead>
      <tbody>
        {groupedData.map((div) => (
          <React.Fragment key={div.divCode}>
            <tr className="project-banner">
              <td colSpan={2}>Division : {div.divName}</td>
            </tr>
            {sortProjects(div.projects).map((proj) => (
              <tr key={proj.projectCode} className="data-row">
                <td>{proj.projectCode} {proj.projectName ? `| ${proj.projectName}` : ''}</td>
                <td className="num">{formatAmount(proj.total)}</td>
              </tr>
            ))}
            <tr className="division-total">
              <td>Division Total : {div.divName}</td>
              <td className="num">{formatAmount(div.total)}</td>
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );

  const tableContent = viewType === 'cost' ? costWiseTable : projectWiseTable;

  return (
    <ReportPage
      title={reportTitle}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      hasGeneratedReport={hasGeneratedReport}
      dataLoading={dataLoading}
      filtersActive={filtersActive}
      paramsContent={
        <>
          <div style={{ marginBottom: 20 }}>
            <label style={paramLabelStyle}>Report View</label>
            <div style={{ display: 'flex', gap: 10 }}>
              {(['cost', 'project'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setViewType(v)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 7,
                    fontSize: 13,
                    fontWeight: 600,
                    border: viewType === v ? '1.5px solid #1e3a5f' : '1.5px solid #d1d5db',
                    background: viewType === v ? '#1e3a5f' : '#fff',
                    color: viewType === v ? '#fff' : '#374151',
                    cursor: 'pointer',
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {v === 'cost' ? 'Cost Wise' : 'Project Wise'}
                </button>
              ))}
            </div>
          </div>
          <ReportParameterForm
            rows={budgetReportFields}
            filters={pending}
            onChange={setPending}
            companyCode={user?.company_code}
          />
        </>
      }
      onGenerate={handleGenerateReport}
      onReset={handleReset}
      generateDisabled={dataLoading}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder={viewType === 'cost' ? 'Search cost code / cost name / project…' : 'Search project code / project name / division…'}
      onPrint={handlePrint}
      onExcel={handleExcel}
      onPdf={handleDownloadPDF}
      reportContent={tableContent}
      showGrandTotal={groupedData.length > 0}
      grandTotalValue={formatAmount(grandTotal)}
      css={TABLE_CSS}
    />
  );
};

export default BudgetAllocationReport;