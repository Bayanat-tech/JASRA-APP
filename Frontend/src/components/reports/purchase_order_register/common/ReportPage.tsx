import React from 'react';

export interface ReportPageProps {
  /** Report title shown in the parameters card and the report toolbar */
  title: string;

  activeTab: 'parameters' | 'report';
  onTabChange: (tab: 'parameters' | 'report') => void;
  hasGeneratedReport: boolean;

  /** true while the report's own query is fetching */
  dataLoading: boolean;
  /** true if any filter/search is currently applied — shows the "Filtered" pill */
  filtersActive: boolean;

  /** Parameters tab: the <ReportParameterForm .../> (or anything) + Reset/Generate handlers */
  paramsContent: React.ReactNode;
  onGenerate: () => void;
  onReset: () => void;
  generateDisabled?: boolean;
  generateLabel?: string;

  /** Report tab toolbar */
  search: string;
  onSearchChange: (v: string) => void;
  searchPlaceholder?: string;
  onPrint: () => void;
  onExcel: () => void;
  onPdf: () => void;

  /** The actual table/body for the report tab. Empty-state handling is the caller's job
   *  (so different reports can word their own "No records found"). */
  reportContent: React.ReactNode;

  /** Optional grand-total footer bar shown below the scroll area (non-print) */
  showGrandTotal?: boolean;
  grandTotalLabel?: string;
  grandTotalValue?: string;

  /**
   * Extra CSS specific to this report — e.g. table column widths, banner/total row
   * colors, a different print header layout. It is appended AFTER the built-in
   * default CSS below, so any selector here simply overrides the default.
   * If omitted, the report renders with the plain default look.
   */
  css?: string;
}

const DEFAULT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  .rp-shell { font-family: 'DM Sans', sans-serif; background: #f4f6f9; height: 100vh; display: flex; flex-direction: column; padding: 14px 28px; box-sizing: border-box; overflow: hidden; }

  .rp-tabbar { display: flex; align-items: center; gap: 6px; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; padding: 5px; margin-bottom: 14px; flex-shrink: 0; }
  .rp-tab { flex: 1; padding: 9px 14px; border-radius: 7px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; display: flex; align-items: center; justify-content: center; gap: 6px; font-family: 'DM Sans', sans-serif; transition: background 0.15s; background: transparent; color: #374151; }
  .rp-tab.active { background: #1e3a5f; color: #fff; }
  .rp-tab:disabled { color: #9ca3af; cursor: not-allowed; }
  .rp-tab-badge { font-size: 9.5px; padding: 1px 7px; border-radius: 10px; font-weight: 600; background: #dcfce7; color: #16a34a; }
  .rp-tab.active .rp-tab-badge { background: rgba(255,255,255,0.25); color: #fff; }

  .rp-param-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 22px 24px; overflow-y: auto; }
  .rp-param-title { font-size: 15px; font-weight: 700; color: #111; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
  .rp-param-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb; }

  .rp-report-root { flex: 1; min-height: 0; display: flex; flex-direction: column; }
  .rp-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; background: #fff; border-bottom: 1px solid #e5e7eb; flex-shrink: 0; gap: 12px; }
  .rp-toolbar-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
  .rp-toolbar-right { display: flex; gap: 8px; flex-shrink: 0; }
  .rp-title-text { font-size: 15px; font-weight: 700; color: #111; white-space: nowrap; }
  .rp-filtered-badge { font-size: 11px; background: #eef2f7; color: #1e3a5f; border-radius: 4px; padding: 3px 9px; font-weight: 600; }

  .rp-btn { padding: 7px 13px; border-radius: 7px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.15s; font-family: 'DM Sans', sans-serif; white-space: nowrap; border: none; }
  .rp-btn-ghost { border: 1.5px solid #d1d5db; background: #fff; color: #374151; }
  .rp-btn-ghost:hover { background: #f9fafb; border-color: #9ca3af; }
  .rp-btn-primary { background: #1e3a5f; color: #fff; }
  .rp-btn-primary:hover { background: #162d4a; }
  .rp-btn-success { background: #16a34a; color: #fff; }
  .rp-btn-success:hover { background: #15803d; }

  .rp-search { padding: 7px 12px 7px 34px; border: 1.5px solid #d1d5db; border-radius: 7px; font-size: 13px; font-family: 'DM Sans', sans-serif; color: #111; outline: none; width: 240px; background: #fff; }
  .rp-search:focus { border-color: #1e3a5f; }
  .rp-search-wrap { position: relative; display: flex; align-items: center; }
  .rp-search-icon { position: absolute; left: 10px; color: #9ca3af; font-size: 14px; pointer-events: none; }

  .rp-report-scroll { flex: 1; min-height: 0; overflow-y: auto; margin-top: 12px; }
  .rp-page { background: #fff; border-radius: 8px; border: 1px solid #e5e7eb; overflow: hidden; }
  .rp-empty { text-align: center; padding: 60px 20px; color: #9ca3af; font-size: 14px; }

  .rp-grand-total-bar { background: #1e3a5f; border-radius: 8px; border: 1px solid #1e3a5f; overflow: hidden; margin-top: 10px; flex-shrink: 0; }
  .rp-grand-total-bar table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .rp-grand-total-bar td { padding: 11px 14px; font-weight: 700; color: #fff; }
  .rp-grand-total-bar td.num { text-align: right; font-variant-numeric: tabular-nums; }

  @media print {
    @page { margin: 10mm; size: A4 landscape; }
    .rp-tabbar, .rp-toolbar, .no-print, .rp-grand-total-bar, .rp-param-card { display: none !important; }
    .rp-shell { height: auto; overflow: visible; padding: 0; background: #fff; }
    .rp-report-root { flex: none; }
    .rp-report-scroll { overflow: visible; height: auto; max-height: none; margin-top: 0; }
    .rp-page { border: none; border-radius: 0; }
  }
`;

export const ReportPage: React.FC<ReportPageProps> = ({
  title,
  activeTab,
  onTabChange,
  hasGeneratedReport,
  dataLoading,
  filtersActive,
  paramsContent,
  onGenerate,
  onReset,
  generateDisabled,
  generateLabel,
  search,
  onSearchChange,
  searchPlaceholder,
  onPrint,
  onExcel,
  onPdf,
  reportContent,
  showGrandTotal,
  grandTotalLabel,
  grandTotalValue,
  css,
}) => {
  return (
    <>
      <style>{DEFAULT_CSS + (css || '')}</style>

      <div className="rp-shell">
        <div className="rp-tabbar no-print">
          <button className={`rp-tab ${activeTab === 'parameters' ? 'active' : ''}`} onClick={() => onTabChange('parameters')}>
            ⚙ Parameters
          </button>
          <button
            className={`rp-tab ${activeTab === 'report' ? 'active' : ''}`}
            onClick={() => hasGeneratedReport && onTabChange('report')}
            disabled={!hasGeneratedReport}
            title={hasGeneratedReport ? undefined : 'Generate a report first'}
          >
            📊 Report{hasGeneratedReport && <span className="rp-tab-badge">Generated</span>}
          </button>
        </div>

        {activeTab === 'parameters' && (
          <div className="rp-param-card">
            <div className="rp-param-title">
              {title}
              {hasGeneratedReport && <span className="rp-tab-badge">Report Generated</span>}
            </div>
            {paramsContent}
            <div className="rp-param-actions">
              <button className="rp-btn rp-btn-ghost" onClick={onReset} disabled={generateDisabled}>Reset</button>
              <button className="rp-btn rp-btn-primary" onClick={onGenerate} disabled={generateDisabled}>
                {generateDisabled ? 'Loading data…' : (generateLabel || 'Generate Report')}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'report' && hasGeneratedReport && (
          <div className="rp-report-root">
            <div className="rp-toolbar no-print">
              <div className="rp-toolbar-left">
                <span className="rp-title-text">{title}</span>
                {filtersActive && <span className="rp-filtered-badge">Filtered</span>}
                <div className="rp-search-wrap">
                  <span className="rp-search-icon">🔍</span>
                  <input
                    className="rp-search"
                    placeholder={searchPlaceholder || 'Search…'}
                    value={search}
                    onChange={e => onSearchChange(e.target.value)}
                  />
                </div>
              </div>
              <div className="rp-toolbar-right">
                <button className="rp-btn rp-btn-ghost" onClick={onPrint}>🖨 Print</button>
                <button className="rp-btn rp-btn-success" onClick={onExcel}>📊 Excel</button>
                <button className="rp-btn rp-btn-primary" onClick={onPdf}>⬇ PDF</button>
              </div>
            </div>

            <div className="rp-report-scroll">
              <div className="rp-page">
                {dataLoading ? <div className="rp-empty">Loading data…</div> : reportContent}
              </div>
            </div>

            {showGrandTotal && !dataLoading && (
              <div className="rp-grand-total-bar no-print">
                <table>
                  <tbody>
                    <tr>
                      <td colSpan={7}>{grandTotalLabel || 'Grand Total :'}</td>
                      <td className="num">{grandTotalValue}</td>
                      <td style={{ width: 120 }} />
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ReportPage;