import React from 'react';
import { useQuery } from '@tanstack/react-query';
import WmsSerivceInstance from 'service/wms/service.wms';
import companyLogo from 'assets/Al_jasra_logo.jpg';
import useAuth from 'hooks/useAuth';
import GroupedReportTable, {
  ColumnDef,
  GroupByConfig,
  FilterDef,
  formatAmount,
  formatDate,
} from '../../../components/reports/GroupedReport';

// ── Row type ──────────────────────────────────────────────────────────────────
type PRRow = {
  REQUEST_NUMBER: string;
  HEADER_AMOUNT:  number;
  PROJECT_NAME:   string;
  PROJECT_CODE:   string;
  REQUEST_DATE:   string;
  STATUS:         string;
  TYPE_OF_PR:     string;
  DIV_CODE:       string;
  DIV_NAME:       string;
  CREATED_BY:     string;
};

// ── Column definitions ────────────────────────────────────────────────────────
const COLUMNS: ColumnDef<PRRow>[] = [
  {
    key: 'REQUEST_NUMBER',
    label: 'Request No',
    width: '22%',
    mono: true,
  },
  {
    key: 'REQUEST_DATE',
    label: 'Request Date',
    width: '13%',
    format: (v) => formatDate(v),
  },
  {
    key: 'CREATED_BY',
    label: 'Create User',
    width: '17%',
  },
  {
    key: 'HEADER_AMOUNT',
    label: 'Amount',
    width: '14%',
    align: 'right',
    format: (v) => formatAmount(parseFloat(String(v)) || 0),
  },
  {
    key: 'TYPE_OF_PR',
    label: 'Type of PR',
    width: '34%',
  },
];

// ── Grouping: Division → Project → Status ────────────────────────────────────
const GROUP_BY: GroupByConfig<PRRow>[] = [
  { key: 'DIV_NAME',     label: 'Division',       subKey: 'DIV_CODE'    },
  { key: 'PROJECT_NAME', label: 'Project',         subKey: 'PROJECT_CODE' },
  { key: 'STATUS',       label: 'Project Status'                         },
];

// ── Filter panel definitions ──────────────────────────────────────────────────
const FILTER_DEFS: FilterDef<PRRow>[] = [
  { key: 'REQUEST_DATE', label: 'Request Date From', type: 'date'   },
  { key: 'REQUEST_DATE', label: 'Request Date To',   type: 'date'   },
  { key: 'TYPE_OF_PR',   label: 'PR Type',           type: 'select' },
  { key: 'STATUS',       label: 'Status',            type: 'select' },
  { key: 'PROJECT_NAME', label: 'Project Name',      type: 'select' },
  { key: 'DIV_NAME',     label: 'Division Name',     type: 'select' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const PurchaseRequestSummary: React.FC = () => {
  const { user } = useAuth();
  const printUser = user?.username;
  const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  // ── Data fetch (unchanged) ────────────────────────────────────────────────
  const { data: allRows = [], isLoading } = useQuery<PRRow[]>({
    queryKey: ['pr_register_all'],
    queryFn: async () => {
      const sql = `
        SELECT DISTINCT
          r.request_number, r.header_amount, r.project_name, r.project_code,
          r.request_date, r.status, r.type_of_pr, r.div_code,
          COALESCE(d.div_name, r.div_code, 'Unassigned') AS div_name,
          r.created_by
        FROM VW_BO_PR_REGISTER r
        LEFT JOIN MS_HR_DIVISION_JASRA d ON r.div_code = d.div_code
      `;
      const response = await WmsSerivceInstance.executeRawSql(sql);
      return (response as PRRow[]) || [];
    },
  });

  // ── Excel export (unchanged — keeps per-division sheets) ─────────────────
  const handleExcel = async (filteredRows: PRRow[]) => {
    const XLSX = await import('xlsx');
    const wb   = XLSX.utils.book_new();

    // Group the already-filtered rows the same way as before
    type DivMap = Record<string, {
      divName: string; divCode: string; total: number;
      projects: Record<string, {
        projectName: string; projectCode: string; total: number;
        statuses: Record<string, { status: string; rows: PRRow[]; total: number }>;
      }>;
    }>;

    const divMap: DivMap = {};
    for (const r of filteredRows) {
      const divKey  = r.DIV_NAME || 'Unassigned';
      const projKey = `${r.PROJECT_NAME}|||${r.PROJECT_CODE}`;
      const statKey = r.STATUS;
      const amount  = parseFloat(String(r.HEADER_AMOUNT)) || 0;

      if (!divMap[divKey])
        divMap[divKey] = { divName: divKey, divCode: r.DIV_CODE, projects: {}, total: 0 };
      if (!divMap[divKey].projects[projKey])
        divMap[divKey].projects[projKey] = { projectName: r.PROJECT_NAME, projectCode: r.PROJECT_CODE, statuses: {}, total: 0 };
      if (!divMap[divKey].projects[projKey].statuses[statKey])
        divMap[divKey].projects[projKey].statuses[statKey] = { status: r.STATUS, rows: [], total: 0 };

      divMap[divKey].projects[projKey].statuses[statKey].rows.push(r);
      divMap[divKey].projects[projKey].statuses[statKey].total += amount;
      divMap[divKey].projects[projKey].total                   += amount;
      divMap[divKey].total                                     += amount;
    }

    const divisions = Object.values(divMap).map((div: any) => ({
      ...div,
      projects: Object.values(div.projects).map((proj: any) => ({
        ...proj,
        statuses: Object.values(proj.statuses),
      })),
    }));

    const grandTotal = divisions.reduce((s: number, d: any) => s + d.total, 0);

    // Summary sheet
    const summaryData: any[][] = [
      ['Purchase Request Register — Summary'],
      [`Print Date: ${printDate}`, '', `Print User: ${printUser}`],
      [],
      ['Request No', 'Request Date', 'Create User', 'Amount', 'Type of PR', 'Project', 'Project Code', 'Status', 'Division'],
    ];

    divisions.forEach((div: any) => {
      div.projects.forEach((proj: any) => {
        proj.statuses.forEach((sg: any) => {
          sg.rows.forEach((row: PRRow) => {
            summaryData.push([
              row.REQUEST_NUMBER,
              formatDate(row.REQUEST_DATE),
              row.CREATED_BY,
              parseFloat(String(row.HEADER_AMOUNT)) || 0,
              row.TYPE_OF_PR,
              proj.projectName,
              proj.projectCode,
              sg.status,
              div.divName,
            ]);
          });
          summaryData.push(['', '', `Status Total: ${sg.status}`, sg.total, '', '', '', '', '']);
        });
        summaryData.push(['', '', `Project Total: ${proj.projectName}`, proj.total, '', '', '', '', '']);
      });
      summaryData.push(['', '', `Division Total: ${div.divName}`, div.total, '', '', '', '', '']);
    });
    summaryData.push([]);
    summaryData.push(['', '', 'Grand Total', grandTotal, '', '', '', '', '']);

    const ws = XLSX.utils.aoa_to_sheet(summaryData);
    ws['!cols'] = [{ wch: 26 }, { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 20 }, { wch: 30 }, { wch: 14 }, { wch: 14 }, { wch: 28 }];
    XLSX.utils.book_append_sheet(wb, ws, 'PR Summary');

    // Per-division sheets
    divisions.forEach((div: any) => {
      const sheetData: any[][] = [
        [`Division: ${div.divName}`],
        ['Request No', 'Request Date', 'Create User', 'Amount', 'Type of PR', 'Project', 'Status'],
      ];
      div.projects.forEach((proj: any) => {
        proj.statuses.forEach((sg: any) => {
          sg.rows.forEach((row: PRRow) => {
            sheetData.push([
              row.REQUEST_NUMBER,
              formatDate(row.REQUEST_DATE),
              row.CREATED_BY,
              parseFloat(String(row.HEADER_AMOUNT)) || 0,
              row.TYPE_OF_PR,
              proj.projectName,
              sg.status,
            ]);
          });
        });
      });
      sheetData.push(['', '', 'Division Total', div.total]);
      const divWs = XLSX.utils.aoa_to_sheet(sheetData);
      divWs['!cols'] = [{ wch: 26 }, { wch: 14 }, { wch: 18 }, { wch: 14 }, { wch: 20 }, { wch: 30 }, { wch: 14 }];
      const safeName = div.divName.replace(/[:\\/?*[\]]/g, '').slice(0, 31);
      XLSX.utils.book_append_sheet(wb, divWs, safeName);
    });

    XLSX.writeFile(wb, 'PR_Register_Summary.xlsx');
  };

  // ── PDF export (unchanged) ────────────────────────────────────────────────
  const handlePDF = async (filteredRows: PRRow[]) => {
    const { jsPDF }           = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const pdf   = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const margin = 14;

    const NAVY      = [30, 58, 95]    as [number, number, number];
    const PROJ      = [232, 236, 242] as [number, number, number];
    const STAT      = [241, 244, 248] as [number, number, number];
    const DTOT      = [213, 220, 232] as [number, number, number];
    const WHITE     = [255, 255, 255] as [number, number, number];
    const DARK      = [55,  65,  81]  as [number, number, number];
    const NAVY_TEXT = [30,  58,  95]  as [number, number, number];
    const BORDER    = [209, 213, 219] as [number, number, number];

    const getBase64FromUrl = (url: string): Promise<string> =>
      new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width  = img.naturalWidth;
          canvas.height = img.naturalHeight;
          canvas.getContext('2d')!.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = reject;
        img.src = url;
      });

    let logoBase64 = '';
    try { logoBase64 = await getBase64FromUrl(companyLogo); } catch { /* skip */ }

    // Re-group filtered rows for PDF body
    const divMap: Record<string, any> = {};
    for (const r of filteredRows) {
      const divKey  = r.DIV_NAME || 'Unassigned';
      const projKey = `${r.PROJECT_NAME}|||${r.PROJECT_CODE}`;
      const statKey = r.STATUS;
      const amount  = parseFloat(String(r.HEADER_AMOUNT)) || 0;
      if (!divMap[divKey])
        divMap[divKey] = { divName: divKey, projects: {}, total: 0 };
      if (!divMap[divKey].projects[projKey])
        divMap[divKey].projects[projKey] = { projectName: r.PROJECT_NAME, projectCode: r.PROJECT_CODE, statuses: {}, total: 0 };
      if (!divMap[divKey].projects[projKey].statuses[statKey])
        divMap[divKey].projects[projKey].statuses[statKey] = { status: r.STATUS, rows: [], total: 0 };
      divMap[divKey].projects[projKey].statuses[statKey].rows.push(r);
      divMap[divKey].projects[projKey].statuses[statKey].total += amount;
      divMap[divKey].projects[projKey].total                   += amount;
      divMap[divKey].total                                     += amount;
    }
    const divisions = Object.values(divMap).map((div: any) => ({
      ...div,
      projects: Object.values(div.projects).map((proj: any) => ({
        ...proj, statuses: Object.values(proj.statuses),
      })),
    }));
    const grandTotal = divisions.reduce((s: number, d: any) => s + d.total, 0);

    const HEADER_H  = 36;
    const TITLE_Y   = 27;
    const TABLE_TOP = 39;

    const drawPageHeader = (data: any) => {
      const pg = data.pageNumber as number;
      if (logoBase64) pdf.addImage(logoBase64, 'PNG', margin, 5, 32, 16);
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(107, 114, 128);
      pdf.text(`Page ${pg}`,                pageW - margin, 9,  { align: 'right' });
      pdf.text(`Print Date : ${printDate}`, pageW - margin, 14, { align: 'right' });
      pdf.text(`Print User : ${printUser}`, pageW - margin, 19, { align: 'right' });
      pdf.setFillColor(...NAVY);
      pdf.rect(margin, TITLE_Y, pageW - margin * 2, 8, 'F');
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10); pdf.setTextColor(...WHITE);
      pdf.text('Purchase Request Register (Summary)', pageW / 2, TITLE_Y + 5.5, { align: 'center' });
    };

    const body: any[] = [];
    const cellPad = { top: 3.5, bottom: 3.5, left: 5,  right: 5 };
    const indPad1 = { top: 3,   bottom: 3,   left: 12, right: 5 };
    const indPad2 = { top: 2.5, bottom: 2.5, left: 20, right: 5 };

    divisions.forEach((div: any) => {
      body.push([{ content: `Division :  ${div.divName}`, colSpan: 5, styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 9.5, cellPadding: cellPad } }]);
      div.projects.forEach((proj: any) => {
        body.push([{ content: `Project :  ${proj.projectName}   |   ${proj.projectCode}`, colSpan: 5, styles: { fillColor: PROJ, textColor: NAVY_TEXT, fontStyle: 'bold', fontSize: 9, cellPadding: indPad1 } }]);
        proj.statuses.forEach((sg: any) => {
          body.push([{ content: `Project Status :  ${sg.status}`, colSpan: 5, styles: { fillColor: STAT, textColor: DARK, fontStyle: 'bold', fontSize: 8.5, cellPadding: indPad2 } }]);
          sg.rows.forEach((row: PRRow) => {
            body.push([
              { content: row.REQUEST_NUMBER,                                         styles: { font: 'courier', fontSize: 8 } },
              { content: formatDate(row.REQUEST_DATE),                               styles: { fontSize: 8 } },
              { content: row.CREATED_BY,                                             styles: { fontSize: 8 } },
              { content: formatAmount(parseFloat(String(row.HEADER_AMOUNT)) || 0),  styles: { halign: 'right', fontSize: 8 } },
              { content: row.TYPE_OF_PR,                                             styles: { fontSize: 8 } },
            ]);
          });
          body.push([
            { content: `Status Total :  ${sg.status}`, colSpan: 3, styles: { fillColor: STAT, textColor: DARK, fontStyle: 'bold', fontSize: 8.5, cellPadding: indPad2 } },
            { content: formatAmount(sg.total),          styles: { fillColor: STAT, textColor: DARK, fontStyle: 'bold', halign: 'right', fontSize: 8.5 } },
            { content: '',                              styles: { fillColor: STAT } },
          ]);
        });
        body.push([
          { content: `Project Total For :  ${proj.projectName}`, colSpan: 3, styles: { fillColor: PROJ, textColor: NAVY_TEXT, fontStyle: 'bold', fontSize: 9, cellPadding: indPad1 } },
          { content: formatAmount(proj.total),                    styles: { fillColor: PROJ, textColor: NAVY_TEXT, fontStyle: 'bold', halign: 'right', fontSize: 9 } },
          { content: '',                                          styles: { fillColor: PROJ } },
        ]);
      });
      body.push([
        { content: `Division Total :  ${div.divName}`, colSpan: 3, styles: { fillColor: DTOT, textColor: NAVY_TEXT, fontStyle: 'bold', fontSize: 9.5, cellPadding: cellPad } },
        { content: formatAmount(div.total),             styles: { fillColor: DTOT, textColor: NAVY_TEXT, fontStyle: 'bold', halign: 'right', fontSize: 9.5 } },
        { content: '',                                  styles: { fillColor: DTOT } },
      ]);
    });

    body.push([
      { content: 'Grand Total :', colSpan: 3, styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
      { content: formatAmount(grandTotal),    styles: { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', halign: 'right', fontSize: 10.5, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } } },
      { content: '',                          styles: { fillColor: NAVY } },
    ]);

    autoTable(pdf, {
      startY: TABLE_TOP,
      margin: { left: margin, right: margin, top: HEADER_H + 4 },
      columnStyles: { 0: { cellWidth: 46 }, 1: { cellWidth: 32 }, 2: { cellWidth: 34 }, 3: { cellWidth: 30 }, 4: { cellWidth: 40 } },
      head: [[
        { content: 'Request No',   styles: { halign: 'left',  fontSize: 10 } },
        { content: 'Request Date', styles: { halign: 'left',  fontSize: 10 } },
        { content: 'Create User',  styles: { halign: 'left',  fontSize: 10 } },
        { content: 'Amount',       styles: { halign: 'right', fontSize: 10 } },
        { content: 'Type of PR',   styles: { halign: 'left',  fontSize: 10 } },
      ]],
      body,
      headStyles:    { fillColor: NAVY, textColor: WHITE, fontStyle: 'bold', fontSize: 10, cellPadding: { top: 5, bottom: 5, left: 5, right: 5 } },
      bodyStyles:    { fontSize: 8, textColor: DARK, cellPadding: { top: 3, bottom: 3, left: 5, right: 5 }, overflow: 'ellipsize', minCellHeight: 0 },
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

    pdf.save('PR_Register_Summary.pdf');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <GroupedReportTable<PRRow>
      title="Purchase Request Register — Summary"
      rows={allRows}
      isLoading={isLoading}
      columns={COLUMNS}
      groupBy={GROUP_BY}
      amountKey="HEADER_AMOUNT"
      filterDefs={FILTER_DEFS}
      searchKeys={['REQUEST_NUMBER', 'CREATED_BY']}
      logo={companyLogo}
      printUser={printUser}
      onExcel={handleExcel}
      onPDF={handlePDF}
    />
  );
};

export default PurchaseRequestSummary;