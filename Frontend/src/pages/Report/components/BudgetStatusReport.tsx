import { forwardRef, useRef, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import WmsSerivceInstance from 'service/wms/service.wms';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface BudgetStatusData {
    REQUESTED_AMT: string;
    REQ_APPROVED_AMT: string;
    PROJECT_NAME: string;
    PROJECT_CODE: string;
    COST_CODE: string;
    COMPANY_CODE: string;
    MONTH_BUDGET: string;
    BUDGET_YEAR: string;
    APPROVED_AMT: string;
    PO_AMOUNT: string;
    PR_AMOUNT: string;
    COST_NAME: string;
    DIV_NAME: string;
    MONTH_NUMBER: string;
    TOT_UTILISED: string;
    BALANCE_AMT: string;
}

export interface BudgetReportDesignProps {
    required_values: {
        divCode: string;
        companyCode?: string;
    };
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const MONTH_MAP: Record<string, string> = {
    '1': 'Jan', '2': 'Feb', '3': 'Mar', '4': 'Apr',
    '5': 'May', '6': 'Jun', '7': 'Jul', '8': 'Aug',
    '9': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec',
};

const MONTH_OPTIONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function fmtAmt(val: string | number | null | undefined): number {
    if (val === null || val === undefined || val === '') return 0;
    const n = typeof val === 'number' ? val : parseFloat(String(val));
    return isNaN(n) ? 0 : n;
}

function fmtDisplay(n: number): string {
    if (n === 0) return '0.00';
    return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtBalance(n: number): string {
    if (n < 0) return `(${fmtDisplay(Math.abs(n))})`;
    return fmtDisplay(n);
}

function balanceColor(n: number): string {
    if (n < 0) return '#c0392b';
    if (n > 0) return '#27ae60';
    return '#888';
}

// ── SQL Builder ────────────────────────────────────────────────────────────────

function buildSqlString(params: {
    divCode: string;
    companyCode?: string;
    projects: string[];
    months: string[];
    costCodes: string[];
}): string {
    const { divCode, companyCode, projects, months, costCodes } = params;
    const inList = (values: string[]) => values.map(v => `'${v.replace(/'/g, "''")}'`).join(', ');
    const projectFilter = projects.length === 0 ? `'All' IN ('All')` : `PROJECT_NAME IN (${inList(projects)})`;
    const monthFilter = months.length === 0 ? `'All' IN ('All')` : `MONTH_BUDGET IN (${inList(months)})`;
    const costCodeFilter = costCodes.length === 0 ? `'All' IN ('All')` : `COST_CODE IN (${inList(costCodes)})`;
    const staticConditions: string[] = [];
    if (divCode) staticConditions.push(`DIV_CODE = '${divCode.replace(/'/g, "''")}'`);
    if (companyCode) staticConditions.push(`COMPANY_CODE = '${companyCode.replace(/'/g, "''")}'`);
    const whereClause = [
        projectFilter, monthFilter, costCodeFilter,
        `COST_CODE IS NOT NULL`, `COST_NAME IS NOT NULL`,
        ...staticConditions,
    ].join('\n    AND ');
    return `
SELECT
    REQUESTED_AMT, REQ_APPROVED_AMT, PROJECT_NAME, PROJECT_CODE, COST_CODE,
    COMPANY_CODE, MONTH_BUDGET, BUDGET_YEAR, APPROVED_AMT, PO_AMOUNT,
    PR_AMOUNT, COST_NAME, DIV_NAME, MONTH_NUMBER,
    (PO_AMOUNT + PR_AMOUNT)                  AS TOT_UTILISED,
    (APPROVED_AMT - (PO_AMOUNT + PR_AMOUNT)) AS BALANCE_AMT
FROM VW_BO_BASIC_BUDGET_INFO_V1
WHERE ${whereClause}
ORDER BY PROJECT_NAME, COST_CODE, BUDGET_YEAR, MONTH_NUMBER
FETCH FIRST 1000000 ROWS ONLY
    `.trim();
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

.bsr-root {
    font-family: 'DM Sans', sans-serif;
    background: #f4f6f9;
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

/* ── Toolbar ── */
.bsr-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 28px;
    background: #fff;
    border-bottom: 1px solid #e5e7eb;
    flex-shrink: 0;
    z-index: 100;
    gap: 12px;
}
.bsr-toolbar-left  { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
.bsr-toolbar-right { display: flex; gap: 8px; flex-shrink: 0; }

.bsr-btn {
    padding: 7px 13px;
    border-radius: 7px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s;
    font-family: 'DM Sans', sans-serif;
    white-space: nowrap;
    border: 1.5px solid #d1d5db;
    background: #fff;
    color: #374151;
}
.bsr-btn:hover        { background: #f9fafb; border-color: #9ca3af; }
.bsr-btn-primary      { border: none; background: #1e3a5f; color: #fff; }
.bsr-btn-primary:hover{ background: #162d4a; }
.bsr-btn-filter       { position: relative; }
.bsr-btn-filter.active{ border-color: #1e3a5f; color: #1e3a5f; background: #eef2f7; }
.bsr-filter-dot {
    width: 7px; height: 7px; border-radius: 50%; background: #ef4444;
    position: absolute; top: 5px; right: 5px;
}

/* ── Body ── */
.bsr-body        { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
.bsr-report-area { padding: 12px 28px 0; flex: 1; overflow-y: auto; max-height: calc(100vh - 100px); }
.bsr-page {
    background: #fff;
    border-radius: 8px 8px 0 0;
    border: 1px solid #e5e7eb;
    border-bottom: none;
    overflow: visible;
    width: 100%;
}

/* Report header */
.bsr-report-header {
    padding: 16px 24px 14px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}
.bsr-company-name  { font-weight: 700; font-size: 13px; color: #111; }
.bsr-company-sub   { font-size: 11px; color: #6b7280; margin-top: 2px; }
.bsr-header-right  { text-align: right; font-size: 12px; color: #6b7280; line-height: 2; }

/* Title bar */
.bsr-title-bar {
    background: #1e3a5f;
    color: #fff;
    text-align: center;
    padding: 11px;
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 0.02em;
}

/* Meta */
.bsr-meta {
    display: flex;
    gap: 32px;
    padding: 9px 24px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    font-size: 12px;
    color: #6b7280;
    flex-wrap: wrap;
    min-height: 10px;
}

/* Table */
.bsr-table-wrap { overflow-x: auto; overflow-y: visible; }
table.bsr-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    table-layout: fixed;
}
.bsr-table col.c0 { width: 9%;  }
.bsr-table col.c1 { width: 10%; }
.bsr-table col.c2 { width: 17%; }
.bsr-table col.c3 { width: 14%; }
.bsr-table col.c4 { width: 14%; }
.bsr-table col.c5 { width: 14%; }
.bsr-table col.c6 { width: 12%; }

.bsr-table thead th {
    background: #1e3a5f;
    color: #fff;
    font-weight: 700;
    font-size: 13px;
    padding: 11px 14px;
    text-align: left;
    white-space: nowrap;
    border-right: 1px solid rgba(255,255,255,0.12);
    overflow: hidden;
    text-overflow: ellipsis;
}
.bsr-table thead th:last-child { border-right: none; }
.bsr-table thead th.num { text-align: right; }

/* Project row */
.bsr-table tr.proj-row td {
    background: #1e3a5f;
    color: #fff;
    font-weight: 700;
    font-size: 12px;
    padding: 5px 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    cursor: pointer;
}
.bsr-table tr.proj-row:hover td { background: #162d4a; }

/* Cost row */
.bsr-table tr.cost-row td {
    background: #e8ecf2;
    color: #1e3a5f;
    font-weight: 700;
    font-size: 12px;
    padding: 6px 14px 6px 24px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-bottom: 1px solid #d5dce8;
    cursor: pointer;
}
.bsr-table tr.cost-row:hover td { background: #dde3ed; }

/* Data rows */
.bsr-table tbody tr.data-row td {
    padding: 4px 10px;
    border-bottom: 1px solid #e5e7eb;
    color: #374151;
    vertical-align: middle;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
}
.bsr-table tbody tr.data-row:hover td { background: #f9fafb; }
.bsr-table td.num { text-align: right; font-variant-numeric: tabular-nums; }

/* Cost subtotal */
.bsr-table tr.cost-total td {
    background: #f1f4f8;
    padding: 3px 14px;
    font-size: 12px;
    font-weight: 600;
    color: #374151;
    border-top: 1px solid #e5e7eb;
    white-space: nowrap;
}

/* Project total */
.bsr-table tr.proj-total td {
    background: #d5dce8;
    padding: 5px 14px;
    font-size: 12px;
    font-weight: 700;
    color: #1e3a5f;
    white-space: nowrap;
}

/* Grand total bar */
.bsr-grand-bar {
    flex-shrink: 0;
    margin: 0 28px 20px;
    background: #1e3a5f;
    border-radius: 0 0 8px 8px;
    border: 1px solid #1e3a5f;
    overflow: hidden;
}
.bsr-grand-bar table { width: 100%; border-collapse: collapse; font-size: 13px; }
.bsr-grand-bar td    { padding: 11px 14px; font-weight: 700; color: #fff; }
.bsr-grand-bar td.num { text-align: right; font-variant-numeric: tabular-nums; }

.bsr-empty { text-align: center; padding: 60px 20px; color: #9ca3af; font-size: 14px; }

/* Chevron */
.bsr-chev { display: inline-block; margin-right: 6px; font-size: 10px; transition: transform 0.15s; }
.bsr-chev.open { transform: rotate(90deg); }

/* Badge */
.bsr-badge {
    font-size: 11px;
    background: #eef2f7;
    color: #1e3a5f;
    border-radius: 4px;
    padding: 3px 9px;
    font-weight: 600;
}

/* ── Drawer overlay ── */
.bsr-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.18);
    z-index: 199;
    backdrop-filter: blur(1px);
}

/* ── Drawer ── */
.bsr-drawer {
    position: fixed;
    top: 0;
    right: 0;
    height: 100vh;
    width: 310px;
    background: #fff;
    border-left: 1px solid #e5e7eb;
    box-shadow: -4px 0 32px rgba(0,0,0,0.12);
    z-index: 200;
    display: flex;
    flex-direction: column;
    font-family: 'DM Sans', sans-serif;
}
.bsr-drawer-head {
    padding: 50px 20px 16px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fafafa;
}
.bsr-drawer-title { font-weight: 700; font-size: 15px; color: #111; display: flex; align-items: center; gap: 8px; }
.bsr-close-btn {
    border: none;
    background: #f3f4f6;
    cursor: pointer;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    color: #6b7280;
}
.bsr-close-btn:hover { background: #fee2e2; color: #ef4444; }
.bsr-drawer-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 18px; }
.bsr-drawer-footer {
    padding: 16px 20px 40px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    flex-direction: column;
    gap: 10px;
    background: #fafafa;
}
.bsr-field-label {
    display: block;
    font-size: 11px;
    font-weight: 700;
    color: #6b7280;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

/* Project checkbox list */
.bsr-cb-box {
    border: 1.5px solid #3b2db5;
    border-radius: 6px;
    overflow: hidden;
}
.bsr-cb-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
    font-size: 13px;
    color: #333;
}
.bsr-cb-search {
    padding: 5px 8px;
    border-bottom: 1px solid #e8e8e8;
    background: #fafafa;
}
.bsr-cb-search input {
    width: 100%;
    border: 1px solid #ddd;
    border-radius: 4px;
    padding: 4px 8px;
    font-size: 12px;
    outline: none;
    box-sizing: border-box;
    font-family: 'DM Sans', sans-serif;
}
.bsr-cb-list { max-height: 200px; overflow-y: auto; }
.bsr-cb-item {
    display: flex;
    align-items: center;
    padding: 4px 8px;
    cursor: pointer;
    gap: 6px;
    font-size: 12px;
    color: #333;
}
.bsr-cb-item:hover { background: #f5f5f5; }
.bsr-cb-item input[type='checkbox'] { accent-color: #3b2db5; }

/* MUI-like select */
.bsr-select {
    width: 100%;
    padding: 9px 10px;
    font-size: 13px;
    color: #111;
    border: 1.5px solid #d1d5db;
    border-radius: 7px;
    background: #fff;
    outline: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
}
.bsr-select:focus { border-color: #1e3a5f; }

/* Drawer action buttons */
.bsr-drawer-btn {
    width: 100%;
    padding: 10px;
    border-radius: 6px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    text-transform: none;
}
.bsr-drawer-btn-primary { background: #3b2db5; color: #fff; border: none; }
.bsr-drawer-btn-primary:hover { background: #2e22a0; }
.bsr-drawer-btn-secondary { background: #fff; color: #333; border: 1.5px solid #ccc; }
.bsr-drawer-btn-secondary:hover { border-color: #999; background: #f5f5f5; }

@media print {
    @page { margin: 0; size: A4 landscape; }

    /* Hide UI chrome */
    .bsr-toolbar,
    .bsr-grand-bar,
    .no-print { 
        display: none !important; 
    }

    /* Kill all flex/overflow constraints so page flows naturally */
    html, body {
        margin: 0;
        padding: 0;
        background: white;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }

    .bsr-root {
        background: white;
        height: auto;
        overflow: visible;
        display: block;
        margin: 0;
        padding: 0;
    }
    
    .bsr-body {
        overflow: visible;
        display: block;
        height: auto;
        margin: 0;
        padding: 0;
    }
    
    .bsr-report-area {
        padding: 0;
        overflow: visible;
        flex: none;
        display: block;
        height: auto;
        max-height: none;
        margin: 0;
    }
    
    .bsr-page {
        border: none;
        border-radius: 0;
        box-shadow: none;
        overflow: visible;
        height: auto;
        width: 100%;
        padding: 0;
        margin: 0;
    }
    
    .bsr-table-wrap {
        overflow: visible;
        height: auto;
    }

    /* Repeat header on every page */
    thead { 
        display: table-header-group; 
    }

    /* Add right border on data cells so columns are visible when printed */
    .bsr-table tbody tr.data-row td {
        border-bottom: 1px solid #e5e7eb !important;
        border-right: 1px solid #e5e7eb;
    }

    /* Keep row backgrounds */
    .bsr-table tr.proj-row td  { background: #1e3a5f !important; color: #fff !important; }
    .bsr-table tr.cost-row td  { background: #e8ecf2 !important; color: #1e3a5f !important; }
    .bsr-table tr.cost-total td{ background: #f1f4f8 !important; }
    .bsr-table tr.proj-total td{ background: #d5dce8 !important; color: #1e3a5f !important; }
    .bsr-table thead th        { background: #1e3a5f !important; color: #fff !important; }

    /* Avoid page breaks inside a row group */
    .bsr-table tr { 
        page-break-inside: avoid; 
    }

    /* Report header */
    .bsr-report-header {
        padding: 16px 24px 14px !important;
        page-break-inside: avoid;
    }

    /* Title bar */
    .bsr-title-bar {
        page-break-inside: avoid;
    }

    /* Meta */
    .bsr-meta {
        page-break-inside: avoid;
    }
}
`;

// ── Parameter Drawer ───────────────────────────────────────────────────────────

interface ParameterDrawerProps {
    open: boolean;
    onClose: () => void;
    projectOptions: string[];
    selectedProjects: string[];
    onProjectsChange: (v: string[]) => void;
    projectSearch: string;
    onProjectSearchChange: (v: string) => void;
    selectedMonths: string[];
    onMonthsChange: (v: string[]) => void;
    groupByCost: 'Yes' | 'No';
    onGroupByCostChange: (v: 'Yes' | 'No') => void;
    costCodeOptions: [string, string][];
    selectedCostCodes: string[];
    onCostCodesChange: (v: string[]) => void;
    onViewReport: () => void;
    onSave: () => void;
}

function ParameterDrawer({
    open, onClose,
    projectOptions, selectedProjects, onProjectsChange,
    projectSearch, onProjectSearchChange,
    selectedMonths, onMonthsChange,
    groupByCost, onGroupByCostChange,
    costCodeOptions, selectedCostCodes, onCostCodesChange,
    onViewReport, onSave,
}: ParameterDrawerProps) {
    if (!open) return null;

    const filteredProjects = projectOptions.filter(p =>
        p.toLowerCase().includes(projectSearch.toLowerCase())
    );

    const allSelected = selectedProjects.length === 0 || selectedProjects.length === projectOptions.length;

    const toggleProject = (p: string) => {
        const next = selectedProjects.includes(p)
            ? selectedProjects.filter(x => x !== p)
            : [...selectedProjects, p];
        onProjectsChange(next);
    };

    const toggleAllProjects = () => {
        onProjectsChange(selectedProjects.length === projectOptions.length ? [] : [...projectOptions]);
    };

    const toggleMonth = (m: string) => {
        const next = selectedMonths.includes(m)
            ? selectedMonths.filter(x => x !== m)
            : [...selectedMonths, m];
        onMonthsChange(next);
    };

    const toggleCostCode = (c: string) => {
        const next = selectedCostCodes.includes(c)
            ? selectedCostCodes.filter(x => x !== c)
            : [...selectedCostCodes, c];
        onCostCodesChange(next);
    };

    const projLabel =
        selectedProjects.length === 0 ? 'All Projects' :
        selectedProjects.length === 1 ? selectedProjects[0] :
        `${selectedProjects.length} selected`;

    return (
        <>
            <div className="bsr-overlay" onClick={onClose} />
            <div className="bsr-drawer">
                {/* Header */}
                <div className="bsr-drawer-head">
                    <span className="bsr-drawer-title">
                        <span style={{ fontSize: 16, color: '#1e3a5f' }}>⚙</span>
                        Parameters
                    </span>
                    <button className="bsr-close-btn" onClick={onClose}>×</button>
                </div>

                {/* Body */}
                <div className="bsr-drawer-body">

                    {/* Project Name */}
                    <div>
                        <span className="bsr-field-label">Project Name</span>
                        <div className="bsr-cb-box">
                            <div className="bsr-cb-header">
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{projLabel}</span>
                                {selectedProjects.length > 0 && (
                                    <span
                                        style={{ cursor: 'pointer', fontSize: 13, color: '#555', flexShrink: 0 }}
                                        onClick={() => onProjectsChange([])}
                                    >✕</span>
                                )}
                            </div>
                            <div className="bsr-cb-search">
                                <input
                                    placeholder="Search…"
                                    value={projectSearch}
                                    onChange={e => onProjectSearchChange(e.target.value)}
                                />
                            </div>
                            <div className="bsr-cb-list">
                                <div className="bsr-cb-item" onClick={toggleAllProjects}>
                                    <input
                                        type="checkbox"
                                        readOnly
                                        checked={allSelected}
                                        ref={el => { if (el) el.indeterminate = selectedProjects.length > 0 && selectedProjects.length < projectOptions.length; }}
                                    />
                                    <span style={{ fontWeight: 500 }}>Select All</span>
                                </div>
                                {filteredProjects.map(p => (
                                    <div key={p} className="bsr-cb-item" onClick={() => toggleProject(p)}>
                                        <input type="checkbox" readOnly checked={selectedProjects.length === 0 || selectedProjects.includes(p)} />
                                        <span>{p}</span>
                                    </div>
                                ))}
                                {filteredProjects.length === 0 && (
                                    <div style={{ fontSize: 12, color: '#aaa', padding: '8px 16px' }}>No results</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Select Month */}
                    <div>
                        <span className="bsr-field-label">Select Month</span>
                        <div style={{ border: '1.5px solid #d1d5db', borderRadius: 7, overflow: 'hidden' }}>
                            {MONTH_OPTIONS.map(m => (
                                <div key={m} className="bsr-cb-item" onClick={() => toggleMonth(m)}>
                                    <input type="checkbox" readOnly checked={selectedMonths.length === 0 || selectedMonths.includes(m)} />
                                    <span>{m}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Grouping on Cost */}
                    <div>
                        <span className="bsr-field-label">Grouping on Cost</span>
                        <select
                            className="bsr-select"
                            value={groupByCost}
                            onChange={e => onGroupByCostChange(e.target.value as 'Yes' | 'No')}
                        >
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>

                    {/* Cost Code */}
                    <div>
                        <span className="bsr-field-label">Cost Code</span>
                        <div style={{ border: '1.5px solid #d1d5db', borderRadius: 7, overflow: 'hidden', maxHeight: 200, overflowY: 'auto' }}>
                            {costCodeOptions.map(([code, name]) => (
                                <div key={code} className="bsr-cb-item" onClick={() => toggleCostCode(code)}>
                                    <input type="checkbox" readOnly checked={selectedCostCodes.length === 0 || selectedCostCodes.includes(code)} />
                                    <span>{code} | {name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bsr-drawer-footer">
                    <button
                        className="bsr-drawer-btn bsr-drawer-btn-primary"
                        onClick={() => { onViewReport(); onClose(); }}
                    >
                        View Report
                    </button>
                    <button className="bsr-drawer-btn bsr-drawer-btn-secondary" onClick={onSave}>
                        Save
                    </button>
                </div>
            </div>
        </>
    );
}

// ── Report Content Component ──────────────────────────────────────────────────

interface BudgetReportContentProps {
    reportRows: BudgetStatusData[];
    grouped: ProjectMap;
    appliedFilters: {
        projects: string[];
        months: string[];
        groupByCost: 'Yes' | 'No';
        costCodes: string[];
    };
    collapsedProjects: Set<string>;
    collapsedCosts: Set<string>;
    grandTotals: { approved: number; tot: number; bal: number };
    isFetching: boolean;
    today: string;
    isFiltered: boolean;
    toggleProject: (key: string) => void;
    toggleCostGroup: (key: string) => void;
}

const BudgetReportContent = forwardRef<HTMLDivElement, BudgetReportContentProps>(
    ({
        reportRows, grouped, appliedFilters, collapsedProjects, collapsedCosts,
        grandTotals, isFetching, today, isFiltered, toggleProject, toggleCostGroup,
    }, ref) => {
        return (
            <div className="bsr-body">
                <div className="bsr-report-area" ref={ref}>
                    <div className="bsr-page" data-report-page>

                        {/* Report header */}
                        <div className="bsr-report-header">
                            <div className="bsr-header-right">
                                <div><b style={{ color: '#374151' }}>Printed on:</b> {today}</div>
                                <div><b style={{ color: '#374151' }}>Print user:</b> BTADMIN</div>
                            </div>
                        </div>

                        <div className="bsr-title-bar">Budget Status Report</div>

                        {/* Table */}
                        <div className="bsr-table-wrap">
                            {isFetching ? (
                                <div className="bsr-empty">Loading report…</div>
                            ) : reportRows.length === 0 ? (
                                <div className="bsr-empty">No records found for the selected filters.</div>
                            ) : (
                                <table className="bsr-table">
                                    <colgroup>
                                        <col className="c0" /><col className="c1" />
                                        <col className="c2" /><col className="c3" />
                                        <col className="c4" /><col className="c5" /><col className="c6" />
                                    </colgroup>
                                    <thead>
                                        <tr>
                                            <th>Year</th>
                                            <th>Month</th>
                                            <th className="num">Approved Amount</th>
                                            <th className="num">PR Amount</th>
                                            <th className="num">PO Amount</th>
                                            <th className="num">Total Utilised</th>
                                            <th className="num">Balance Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...grouped.entries()].map(([projName, projData]) => {
                                            const projOpen = !collapsedProjects.has(projName);
                                            let projApproved = 0, projTot = 0;

                                            return (
                                                <>
                                                    {/* Project row */}
                                                    <tr key={`proj-${projName}`} className="proj-row" onClick={() => toggleProject(projName)}>
                                                        <td colSpan={7}>
                                                            <span className={`bsr-chev${projOpen ? ' open' : ''}`}>▶</span>
                                                            Project : {projData.projectCode} | {projName}
                                                        </td>
                                                    </tr>

                                                    {projOpen && [...projData.costs.entries()].map(([costCode, costData]) => {
                                                        const costKey = `${projName}|||${costCode}`;
                                                        const costOpen = !collapsedCosts.has(costKey);
                                                        let costApproved = 0, costTot = 0;

                                                        costData.rows.forEach(r => {
                                                            costApproved += fmtAmt(r.APPROVED_AMT);
                                                            costTot += fmtAmt(r.TOT_UTILISED);
                                                        });
                                                        projApproved += costApproved;
                                                        projTot += costTot;
                                                        const costBal = costApproved - costTot;

                                                        return (
                                                            <>
                                                                {/* Cost row */}
                                                                {appliedFilters.groupByCost === 'Yes' && (
                                                                    <tr key={`cost-${costKey}`} className="cost-row" onClick={() => toggleCostGroup(costKey)}>
                                                                        <td colSpan={7}>
                                                                            <span className={`bsr-chev${costOpen ? ' open' : ''}`}>▶</span>
                                                                            Cost : {costCode} | {costData.costName}
                                                                        </td>
                                                                    </tr>
                                                                )}

                                                                {/* Data rows */}
                                                                {(appliedFilters.groupByCost !== 'Yes' || costOpen) &&
                                                                    costData.rows.map((row, ri) => {
                                                                        const approved = fmtAmt(row.APPROVED_AMT);
                                                                        const po = fmtAmt(row.PO_AMOUNT);
                                                                        const pr = fmtAmt(row.PR_AMOUNT);
                                                                        const tot = fmtAmt(row.TOT_UTILISED) || (po + pr);
                                                                        const bal = fmtAmt(row.BALANCE_AMT) || (approved - tot);
                                                                        const month = MONTH_MAP[row.MONTH_NUMBER] ?? row.MONTH_BUDGET ?? '-';
                                                                        return (
                                                                            <tr key={`data-${costKey}-${ri}`} className="data-row">
                                                                                <td className="num">{row.BUDGET_YEAR}</td>
                                                                                <td style={{ textAlign: 'center' }}>{month}</td>
                                                                                <td className="num">{fmtDisplay(approved)}</td>
                                                                                <td className="num">{fmtDisplay(pr)}</td>
                                                                                <td className="num">{fmtDisplay(po)}</td>
                                                                                <td className="num">{fmtDisplay(tot)}</td>
                                                                                <td className="num" style={{ color: balanceColor(bal) }}>{fmtBalance(bal)}</td>
                                                                            </tr>
                                                                        );
                                                                    })
                                                                }

                                                                {/* Cost subtotal */}
                                                                {appliedFilters.groupByCost === 'Yes' && (
                                                                    <tr key={`costsub-${costKey}`} className="cost-total">
                                                                        <td colSpan={2} style={{ paddingLeft: 24 }}>Total for {costData.costName}</td>
                                                                        <td className="num">{fmtDisplay(costApproved)}</td>
                                                                        <td className="num" colSpan={2} />
                                                                        <td className="num">{fmtDisplay(costTot)}</td>
                                                                        <td className="num" style={{ color: balanceColor(costBal) }}>{fmtBalance(costBal)}</td>
                                                                    </tr>
                                                                )}
                                                            </>
                                                        );
                                                    })}

                                                    {/* Project total */}
                                                    {projOpen && (() => {
                                                        const projBal = projApproved - projTot;
                                                        return (
                                                            <tr key={`projtot-${projName}`} className="proj-total">
                                                                <td colSpan={2}>Total for {projName}</td>
                                                                <td className="num">{fmtDisplay(projApproved)}</td>
                                                                <td className="num" colSpan={2} />
                                                                <td className="num">{fmtDisplay(projTot)}</td>
                                                                <td className="num" style={{ color: balanceColor(projBal) }}>{fmtBalance(projBal)}</td>
                                                            </tr>
                                                        );
                                                    })()}
                                                </>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pinned Grand Total Bar */}
                {!isFetching && reportRows.length > 0 && (
                    <div className="bsr-grand-bar no-print">
                        <table>
                            <tbody>
                                <tr>
                                    <td colSpan={5}>Grand Total :</td>
                                    <td className="num">{fmtDisplay(grandTotals.tot)}</td>
                                    <td className="num" style={{ color: grandTotals.bal < 0 ? '#ff8f8f' : grandTotals.bal > 0 ? '#6ee7b7' : '#ccc' }}>
                                        {fmtBalance(grandTotals.bal)}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    },
);

BudgetReportContent.displayName = 'BudgetReportContent';

// ── Main Component ─────────────────────────────────────────────────────────────

type CostMap = Map<string, { costName: string; rows: BudgetStatusData[] }>;
type ProjectMap = Map<string, { projectCode: string; costs: CostMap }>;

const BudgetStatusReport = forwardRef<HTMLDivElement, BudgetReportDesignProps>(
    ({ required_values }, ref) => {
        const { divCode, companyCode } = required_values;

        // ── Drawer / filter state ─────────────────────────────────────────────
        const [drawerOpen, setDrawerOpen] = useState(false);
        const [projectSearch, setProjectSearch] = useState('');
        const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
        const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
        const [groupByCost, setGroupByCost] = useState<'Yes' | 'No'>('Yes');
        const [selectedCostCodes, setSelectedCostCodes] = useState<string[]>([]);

        const [appliedFilters, setAppliedFilters] = useState({
            projects: [] as string[],
            months: [] as string[],
            groupByCost: 'Yes' as 'Yes' | 'No',
            costCodes: [] as string[],
        });

        // ── Collapse state ────────────────────────────────────────────────────
        const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());
        const [collapsedCosts, setCollapsedCosts] = useState<Set<string>>(new Set());
        const reportContentRef = useRef<HTMLDivElement>(null);

        // ── SQL ───────────────────────────────────────────────────────────────
        const initialSql = useMemo(() =>
            buildSqlString({ divCode, companyCode, projects: [], months: [], costCodes: [] }),
            [divCode, companyCode],
        );

        const filteredSql = useMemo(() =>
            buildSqlString({
                divCode, companyCode,
                projects: appliedFilters.projects,
                months: appliedFilters.months,
                costCodes: appliedFilters.costCodes,
            }),
            [divCode, companyCode, appliedFilters.projects, appliedFilters.months, appliedFilters.costCodes],
        );

        // ── Queries ───────────────────────────────────────────────────────────
        const { data: allData } = useQuery<BudgetStatusData[]>({
            queryKey: ['budget_status_options', divCode, companyCode],
            staleTime: 1000 * 60 * 5,
            queryFn: () => WmsSerivceInstance.executeRawSql(initialSql) as Promise<BudgetStatusData[]>,
        });

        const { data: filteredData, isFetching, refetch } = useQuery<BudgetStatusData[]>({
            queryKey: [
                'budget_status_report',
                divCode, companyCode,
                appliedFilters.projects.join(','),
                appliedFilters.months.join(','),
                appliedFilters.costCodes.join(','),
            ],
            staleTime: 1000 * 60 * 5,
            queryFn: () => WmsSerivceInstance.executeRawSql(filteredSql) as Promise<BudgetStatusData[]>,
        });

        const allRows = useMemo(() => (Array.isArray(allData) ? allData : []), [allData]);
        const reportRows = useMemo(() => (Array.isArray(filteredData) ? filteredData : []), [filteredData]);

        // ── Dropdown options ──────────────────────────────────────────────────
        const projectOptions = useMemo(
            () => [...new Set(allRows.map(r => r.PROJECT_NAME))].filter(Boolean).sort(),
            [allRows],
        );
        const costCodeOptions = useMemo(
            () => [...new Map(allRows.map(r => [r.COST_CODE, r.COST_NAME])).entries()]
                .sort((a, b) => a[0].localeCompare(b[0])),
            [allRows],
        );

        // ── Grouping ──────────────────────────────────────────────────────────
        const grouped = useMemo<ProjectMap>(() => {
            const map: ProjectMap = new Map();
            reportRows.forEach(row => {
                if (!map.has(row.PROJECT_NAME))
                    map.set(row.PROJECT_NAME, { projectCode: row.PROJECT_CODE, costs: new Map() });
                const proj = map.get(row.PROJECT_NAME)!;
                if (!proj.costs.has(row.COST_CODE))
                    proj.costs.set(row.COST_CODE, { costName: row.COST_NAME, rows: [] });
                proj.costs.get(row.COST_CODE)!.rows.push(row);
            });
            return map;
        }, [reportRows]);

        // ── Grand totals ──────────────────────────────────────────────────────
        const grandTotals = useMemo(() => {
            let approved = 0, tot = 0;
            reportRows.forEach(r => { approved += fmtAmt(r.APPROVED_AMT); tot += fmtAmt(r.TOT_UTILISED); });
            return { approved, tot, bal: approved - tot };
        }, [reportRows]);

        // ── Collapse helpers ──────────────────────────────────────────────────
        const allProjKeys = [...grouped.keys()];
        const allCollapsed = allProjKeys.length > 0 && allProjKeys.every(k => collapsedProjects.has(k));

        const toggleProject = (key: string) => {
            setCollapsedProjects(prev => {
                const n = new Set(prev);
                n.has(key) ? n.delete(key) : n.add(key);
                return n;
            });
        };

        const toggleCostGroup = (key: string) => {
            setCollapsedCosts(prev => {
                const n = new Set(prev);
                n.has(key) ? n.delete(key) : n.add(key);
                return n;
            });
        };

        const handleCollapseAll = () => {
            if (allCollapsed) {
                setCollapsedProjects(new Set());
                setCollapsedCosts(new Set());
            } else {
                setCollapsedProjects(new Set(allProjKeys));
            }
        };

        const handlePrint = () => {
            if (!reportContentRef.current) {
                console.warn('Report content not found');
                return;
            }

            // Clone the report element
            const reportElement = reportContentRef.current.cloneNode(true) as HTMLElement;

            // Create a new window for printing
            const printWindow = window.open('', '', 'width=1200,height=800');
            if (!printWindow) return;

            // Prepare HTML with complete styles
            const styles = `
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; }
                    html, body { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    .bsr-page { width: 100%; padding: 20px; }
                    .bsr-report-header { display: flex; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
                    .bsr-company-name { font-size: 18px; font-weight: bold; color: #1e3a5f; }
                    .bsr-company-sub { font-size: 12px; color: #666; }
                    .bsr-header-right { text-align: right; font-size: 12px; color: #666; }
                    .bsr-title-bar { font-size: 16px; font-weight: bold; color: #fff; background: #1e3a5f; padding: 10px 15px; margin: 15px 0; }
                    .bsr-meta { font-size: 12px; color: #666; margin: 10px 0; padding: 10px; background: #f5f5f5; }
                    .bsr-table-wrap { margin-top: 15px; }
                    .bsr-table { width: 100%; border-collapse: collapse; font-size: 12px; }
                    .bsr-table th, .bsr-table td { padding: 8px; text-align: left; border: 1px solid #ddd; }
                    .bsr-table th { background: #1e3a5f; color: white; font-weight: bold; }
                    .bsr-table tr.proj-row td { background: #1e3a5f; color: white; font-weight: bold; }
                    .bsr-table tr.cost-row td { background: #e8ecf2; color: #1e3a5f; font-weight: 600; }
                    .bsr-table tr.data-row td { background: white; }
                    .bsr-table td.amount { text-align: right; }
                    .bsr-grand-bar { display: none !important; }
                    .no-print { display: none !important; }
                    @page { size: A4 landscape; margin: 10mm; }
                    @media print {
                        body { margin: 0; padding: 0; }
                        .bsr-page { padding: 0; }
                    }
                </style>
            `;

            printWindow.document.open();
            printWindow.document.write(`<!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Budget Status Report</title>
                    ${styles}
                </head>
                <body>
                    ${reportElement.innerHTML}
                </body>
                </html>
            `);
            printWindow.document.close();

            // Wait for content to load, then print
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        };

        const handleViewReport = () => {
            setAppliedFilters({
                projects: selectedProjects,
                months: selectedMonths,
                groupByCost,
                costCodes: selectedCostCodes,
            });
        };

        const isFiltered =
            appliedFilters.projects.length > 0 ||
            appliedFilters.months.length > 0 ||
            appliedFilters.costCodes.length > 0;

        const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

        // ── Render ────────────────────────────────────────────────────────────
        return (
            <>
                <style>{CSS}</style>

                <ParameterDrawer
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    projectOptions={projectOptions}
                    selectedProjects={selectedProjects}
                    onProjectsChange={setSelectedProjects}
                    projectSearch={projectSearch}
                    onProjectSearchChange={setProjectSearch}
                    selectedMonths={selectedMonths}
                    onMonthsChange={setSelectedMonths}
                    groupByCost={groupByCost}
                    onGroupByCostChange={setGroupByCost}
                    costCodeOptions={costCodeOptions}
                    selectedCostCodes={selectedCostCodes}
                    onCostCodesChange={setSelectedCostCodes}
                    onViewReport={handleViewReport}
                    onSave={() => console.log('Save', { selectedProjects, selectedMonths, groupByCost, selectedCostCodes })}
                />

                <div className="bsr-root">

                    {/* ── Toolbar ── */}
                    <div className="bsr-toolbar no-print">
                        <div className="bsr-toolbar-left">
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#111', whiteSpace: 'nowrap' }}>
                                Budget Status Report
                            </span>
                            {isFiltered && <span className="bsr-badge">Filtered</span>}
                        </div>
                        <div className="bsr-toolbar-right">
                            <button className="bsr-btn" onClick={handleCollapseAll}>
                                {allCollapsed ? '⊞ Expand All' : '⊟ Collapse All'}
                            </button>
                            <button
                                className={`bsr-btn bsr-btn-filter${isFiltered ? ' active' : ''}`}
                                onClick={() => setDrawerOpen(true)}
                            >
                                {isFiltered && <span className="bsr-filter-dot" />}
                                ⚙ Parameters
                            </button>
                            <button className="bsr-btn" onClick={() => refetch()}>↻ Refresh</button>
                            <button className="bsr-btn" onClick={handlePrint}>🖨 Print</button>
                        </div>
                    </div>

                    <BudgetReportContent
                        ref={reportContentRef}
                        reportRows={reportRows}
                        grouped={grouped}
                        appliedFilters={appliedFilters}
                        collapsedProjects={collapsedProjects}
                        collapsedCosts={collapsedCosts}
                        grandTotals={grandTotals}
                        isFetching={isFetching}
                        today={today}
                        isFiltered={isFiltered}
                        toggleProject={toggleProject}
                        toggleCostGroup={toggleCostGroup}
                    />
                </div>
            </>
        );
    },
);

BudgetStatusReport.displayName = 'BudgetStatusReport';
export default BudgetStatusReport;