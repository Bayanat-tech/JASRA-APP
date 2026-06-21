import React, { useRef } from "react";
import {
  Box, Button, Dialog, DialogActions,
  DialogContent, DialogTitle,
  IconButton
} from "@mui/material";
import { useReactToPrint } from "react-to-print";
import CloseIcon from "@mui/icons-material/Close";

export interface ReportDialogPageProps {
  Report: React.ComponentType<{ required_values: any }>;
  required_values: any;
  onClose?: () => void;
  title?: string;
}

const ReportDialogPage = ({
  Report,
  required_values,
  onClose,
  title
}: ReportDialogPageProps) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const fileName = `${title || 'Report'}-${new Date().toISOString().slice(0, 10)}`;

  // ── Shared print config ──────────────────────────────────────────
  const printStyles = `
    @page { margin: 10mm; size: A4 portrait; }

    * { box-sizing: border-box; }

    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      font-size: 13px;
      color: #000;
      background: #fff;
    }

    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }

    /* Hide screen-only elements during print */
    .invoice-print-footer  { 
      position: fixed;
      bottom: 0; left: 0; right: 0;
      background: #fff;
      padding: 4px 24px;
      box-sizing: border-box;
      border-top: 1px solid #ccc;
    }
    .invoice-inline-footer { display: none !important; }
  `;

  // ── Print (opens browser print dialog) ──────────────────────────
  const handlePrint = useReactToPrint({
    contentRef: reportRef,
    documentTitle: fileName,
    pageStyle: printStyles,
  });

  return (
    <Dialog
      open={true}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          height: "80vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      <IconButton
        style={{ position: "absolute", top: "0", right: "0" }}
        onClick={onClose}
      >
        <CloseIcon />
      </IconButton>
      <DialogContent
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
          p: 0,
          minHeight: 0,
        }}
      >
        <DialogTitle>
          {title ?? `Report - ${required_values.doc_no ?? ''}`}
        </DialogTitle>

        <Box
          sx={{
            p: 2,
            backgroundColor: "#eef1f5",
            flex: 1,
            minHeight: 0,
            overflow: "auto",
          }}
        >
          <div ref={reportRef}>
            <Report required_values={required_values} />
          </div>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "flex-end",
          padding: 2,
          gap: 1,
          "@media print": { display: "none" },
        }}
      >

        {/* Print — standard browser print dialog */}
        <Button
          size="small"
          variant="contained"
          onClick={handlePrint}
        >
          Print
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReportDialogPage;