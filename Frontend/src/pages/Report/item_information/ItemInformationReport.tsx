import React, { useEffect, useRef, useState } from "react";
import {
  Autocomplete,
  TextField,
  Button,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { useQuery } from "@tanstack/react-query";
import { useReactToPrint } from "react-to-print";
import * as XLSX from "xlsx";
import WmsServiceInstance from "service/wms/service.wms";
import ItemInformationReportPrint from "./ItemInformationReportPrint";
import useAuth from "hooks/useAuth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DivisionOption {
  DIV_CODE: string;
  DIV_NAME: string;
}

interface ProjectOption {
  PROJECT_CODE: string;
  PROJECT_NAME: string;
}

interface ItemRow {
  ADDL_ITEM_DESC?: string;
  L_UOM?: string;
  ITEM_L_QTY?: number | string;
  ITEM_RATE?: number | string;
  AMOUNT?: number | string;
  REF_DOC_NO?: string;
  SUPP_NAME?: string;
  DLVR_TERM?: string;
  PROJECT_NAME?: string;
  DIV_NAME?: string;
  PO_DATE?: string;
  [key: string]: any;
}

// ─── Small hook to run raw SQL ────────────────────────────────────────────────

const useRunQuery = <T,>(sql: string, queryKey: string) => {
  const { data, isLoading } = useQuery<T[]>({
    queryKey: [queryKey],
    queryFn: async () => {
      const response = await WmsServiceInstance.executeRawSql(sql);
      return Array.isArray(response) ? (response as T[]) : [];
    },
  });
  return { data: data ?? [], isLoading };
};

/** Format a JS date value to Oracle-friendly YYYY-MM-DD string */
const toSqlDate = (val: string) => val; // input[type=date] already gives YYYY-MM-DD

/** Escape single quotes so free-text input can't break out of the SQL literal */
const escapeSql = (val: string) => val.replace(/'/g, "''");

/** Debounce a fast-changing value (e.g. keystrokes) before it's used elsewhere */
function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ItemInformationReport: React.FC = () => {
  const { user } = useAuth();
  const COMPANY_CODE = user?.company_code ?? "DEFAULT_COMPANY";
  const reportRef = useRef<HTMLDivElement>(null);

  // ── Master data ────────────────────────────────────────────────────────────
  const { data: divList, isLoading: divLoading } = useRunQuery<DivisionOption>(
    `SELECT DIV_CODE, DIV_NAME FROM MS_HR_DIVISION_JASRA ORDER BY DIV_NAME`,
    "div_list"
  );

  const { data: projectList, isLoading: projectLoading } =
    useRunQuery<ProjectOption>(
      `SELECT PROJECT_CODE, PROJECT_NAME FROM MS_PS_PROJECT_MASTER ORDER BY PROJECT_NAME`,
      "project_list"
    );

  // ── Filter state ───────────────────────────────────────────────────────────
  // All filters are now optional. Leaving any of them blank means "ALL" for
  // that field instead of blocking the report.
  const [selectedDiv, setSelectedDiv] = useState<DivisionOption | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectOption | null>(null);
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  // The textbox updates instantly; the SQL call only fires 400ms after typing stops.
  const debouncedDescription = useDebouncedValue(description, 400);
  const isSearching = description !== debouncedDescription;

  // ── Report data ────────────────────────────────────────────────────────────
  // The report always runs (COMPANY_CODE is the only mandatory condition);
  // every other filter is appended to the WHERE clause only when it's set.
  const {
    data: reportItems,
    isLoading: reportLoading,
    isFetching: reportFetching,
  } = useQuery<ItemRow[]>({
    queryKey: [
      "item_information",
      selectedDiv?.DIV_CODE ?? "ALL",
      selectedProject?.PROJECT_CODE ?? "ALL",
      fromDate || "ALL",
      toDate || "ALL",
      debouncedDescription || "ALL",
    ],
    queryFn: async () => {
      const conditions: string[] = [`COMPANY_CODE = '${escapeSql(COMPANY_CODE)}'`];

      if (selectedProject) {
        conditions.push(`PROJECT_CODE = '${escapeSql(selectedProject.PROJECT_CODE)}'`);
      }
      if (selectedDiv) {
        conditions.push(`DIV_CODE = '${escapeSql(selectedDiv.DIV_CODE)}'`);
      }
      if (debouncedDescription.trim()) {
        conditions.push(`ADDL_ITEM_DESC LIKE '%${escapeSql(debouncedDescription.trim())}%'`);
      }
      if (fromDate) {
        conditions.push(`PO_DATE >= TO_DATE('${toSqlDate(fromDate)}', 'YYYY-MM-DD')`);
      }
      if (toDate) {
        conditions.push(`PO_DATE <= TO_DATE('${toSqlDate(toDate)}', 'YYYY-MM-DD')`);
      }

      const sql = `
        SELECT * FROM VW_ITEM_INFORMATION
        WHERE ${conditions.join("\n          AND ")}
      `;
      const response = await WmsServiceInstance.executeRawSql(sql);
      return Array.isArray(response) ? (response as ItemRow[]) : [];
    },
  });

  // ── Print ──────────────────────────────────────────────────────────────────
  const printStyles = `
    @page { margin: 10mm; size: A4 landscape; }
    * { box-sizing: border-box; }
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      margin: 0; padding: 0;
      font-family: Arial, sans-serif;
      font-size: 11px;
      color: #000;
      background: #fff;
    }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
  `;

  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: `Item-Information-${selectedProject?.PROJECT_CODE ?? "Report"}-${new Date()
      .toISOString()
      .slice(0, 10)}`,
    pageStyle: printStyles,
  });

  // ── Excel export ───────────────────────────────────────────────────────────
  const handleExportExcel = () => {
    const items = reportItems ?? [];
    if (items.length === 0) return;

    const metaRows: (string | number)[][] = [
      ["Item Description Information"],
      [],
      [
        "Div Name",
        selectedDiv?.DIV_NAME ?? "All Divisions",
        "",
        "Project",
        selectedProject
          ? `${selectedProject.PROJECT_CODE} (${selectedProject.PROJECT_NAME})`
          : "All Projects",
      ],
      ["From Date", fromDate || "All", "", "To Date", toDate || "All"],
      ["Description Search", debouncedDescription || "All"],
      [],
    ];

    const headerRow = [
      "Description",
      "Unit",
      "LPO Qty",
      "Unit Price",
      "Amount LPO/Cash",
      "L.P.O Number",
      "Delivery Period",
    ];

    const dataRows = items.map((item) => [
      item.ADDL_ITEM_DESC ?? "",
      item.L_UOM ?? "",
      item.ITEM_L_QTY !== undefined && item.ITEM_L_QTY !== "" ? Number(item.ITEM_L_QTY) : "",
      item.ITEM_RATE !== undefined && item.ITEM_RATE !== "" ? Number(item.ITEM_RATE) : "",
      item.AMOUNT !== undefined && item.AMOUNT !== "" ? Number(item.AMOUNT) : "",
      item.REF_DOC_NO ?? item.SUPP_NAME ?? "",
      item.DLVR_TERM ?? "",
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([...metaRows, headerRow, ...dataRows]);

    worksheet["!cols"] = [
      { wch: 45 },
      { wch: 8 },
      { wch: 10 },
      { wch: 12 },
      { wch: 16 },
      { wch: 20 },
      { wch: 16 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Item Information");

    const fileName = `Item-Information-${selectedProject?.PROJECT_CODE ?? "Report"}-${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // ── Values for print component ─────────────────────────────────────────────
  const firstRow = reportItems?.[0];
  const requiredValues = {
    div_name: selectedDiv?.DIV_NAME ?? (firstRow ? "All Divisions" : ""),
    project_code: selectedProject?.PROJECT_CODE ?? "",
    project_name:
      selectedProject?.PROJECT_NAME ?? (firstRow ? "All Projects" : ""),
    company_code: COMPANY_CODE,
    div_code: selectedDiv?.DIV_CODE ?? "",
    from_date: fromDate,
    to_date: toDate,
    description: debouncedDescription,
    items: reportItems ?? [],
  };

  const isBusy = reportLoading || reportFetching || isSearching;
  const hasItems = (reportItems?.length ?? 0) > 0;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: 2 }}>
      {/* ── Filter bar ──────────────────────────────────────────────────── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        {/* Division */}
        <Autocomplete<DivisionOption>
          options={divList}
          loading={divLoading}
          value={selectedDiv}
          onChange={(_e, v) => setSelectedDiv(v)}
          getOptionLabel={(o) => `${o.DIV_CODE} – ${o.DIV_NAME}`}
          isOptionEqualToValue={(o, v) => o.DIV_CODE === v.DIV_CODE}
          sx={{ minWidth: 240 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Division"
              placeholder="All Divisions"
              size="small"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {divLoading && <CircularProgress color="inherit" size={14} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        {/* Project */}
        <Autocomplete<ProjectOption>
          options={projectList}
          loading={projectLoading}
          value={selectedProject}
          onChange={(_e, v) => setSelectedProject(v)}
          getOptionLabel={(o) => `${o.PROJECT_CODE} – ${o.PROJECT_NAME}`}
          isOptionEqualToValue={(o, v) => o.PROJECT_CODE === v.PROJECT_CODE}
          sx={{ minWidth: 280 }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Project"
              placeholder="All Projects"
              size="small"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {projectLoading && <CircularProgress color="inherit" size={14} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
            />
          )}
        />

        {/* Description search */}
        <TextField
          label="Description"
          size="small"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Search item description"
          sx={{ minWidth: 220 }}
          InputProps={{
            endAdornment: isSearching ? (
              <CircularProgress color="inherit" size={14} />
            ) : undefined,
          }}
        />

        {/* From Date */}
        <TextField
          label="From Date"
          type="date"
          size="small"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ max: toDate || undefined }}
          sx={{ minWidth: 160 }}
        />

        {/* To Date */}
        <TextField
          label="To Date"
          type="date"
          size="small"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: fromDate || undefined }}
          sx={{ minWidth: 160 }}
        />

        {/* Export Excel */}
        <Button
          variant="outlined"
          size="small"
          startIcon={<FileDownloadIcon />}
          disabled={!hasItems || isBusy}
          onClick={handleExportExcel}
          sx={{ ml: "auto", whiteSpace: "nowrap" }}
        >
          Excel
        </Button>

        {/* Print */}
        <Button
          variant="contained"
          size="small"
          startIcon={<PrintIcon />}
          disabled={!hasItems || isBusy}
          onClick={() => handlePrint()}
          sx={{ whiteSpace: "nowrap" }}
        >
          Print
        </Button>
      </Box>

      {/* ── Report area ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          backgroundColor: "#eef1f5",
          borderRadius: 1,
          p: 2,
          height: "calc(100vh - 180px)",
          overflow: "auto",
        }}
      >
        {/* Loading */}
        {isBusy && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
            <CircularProgress size={32} />
          </Box>
        )}

        {/* No data */}
        {!isBusy && !hasItems && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", mt: 6 }}
          >
            No items found for the selected filters.
          </Typography>
        )}

        {/* Report */}
        {!isBusy && hasItems && (
          <Box
            ref={reportRef}
            sx={{
              backgroundColor: "#fff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.12)",
              borderRadius: 1,
            }}
          >
            <ItemInformationReportPrint required_values={requiredValues} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ItemInformationReport;