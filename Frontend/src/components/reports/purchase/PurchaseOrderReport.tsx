import React, { useState } from 'react';
import { Dialog, DialogActions, DialogContent, Button, ThemeProvider } from '@mui/material';
import { ImExit } from 'react-icons/im';
import { FiDownload } from 'react-icons/fi';
import PfReportView from '../PfReportView';
import useAuth from 'hooks/useAuth';
import reporttheme from 'themes/theme/reporttheme';
import {
  exportPurchaseOrderToExcel,
  fetchPurchaseOrderExportData,
} from '../../../pages/Report/components/purchaseOrderExcelExport'; 

interface PurchaseOrderReportProps {
  poNumber: string;
  div_code?: string;
  onClose?: () => void;
}

const PurchaseOrderReport: React.FC<PurchaseOrderReportProps> = ({
  poNumber,
  div_code,
  onClose,
}) => {
  const { user } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  if (!poNumber) {
    return <div>No PO number provided</div>;
  }

  const formattedPoNumber = poNumber.replace(/\$/g, '/');

  const resolvedDivCode = poNumber.startsWith('AND') ? '16' : '';

  const reportPath =
    resolvedDivCode === '16'
      ? '5c36baf8-061f-4f51-84a4-8e5d18f38d47'
      : 'deed0721-d433-4597-bfad-cfe8f7ca2e01';

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const data = await fetchPurchaseOrderExportData(formattedPoNumber);
      if (!data) {
        // eslint-disable-next-line no-alert
        alert('No data found for this Purchase Order.');
        return;
      }
      exportPurchaseOrderToExcel(data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Failed to export PO to Excel:', err);
      // eslint-disable-next-line no-alert
      alert('Failed to export to Excel. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const reportContent = (
    <div style={{ height: '80vh', width: '100%' }}>
      <PfReportView
        reportPath={reportPath}
        parameters={{
          Ref_doc_no: formattedPoNumber,
          Company_code: user?.company_code || '',
        }}
      />
    </div>
  );

  return (
    <ThemeProvider theme={reporttheme}>
      <Dialog
        open={true}
        onClose={handleClose}
        fullWidth
        maxWidth="lg"
        PaperProps={{
          sx: {
            minHeight: '80vh',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogContent>{reportContent}</DialogContent>
        <DialogActions>
          <Button
            onClick={handleExportExcel}
            variant="contained"
            startIcon={<FiDownload />}
            disabled={isExporting}
            sx={{
              backgroundColor: '#1f7a3a',
              '&:hover': { backgroundColor: '#26a34a' },
              marginRight: 2,
              marginBottom: 1,
              textTransform: 'none',
            }}
          >
            {isExporting ? 'Exporting…' : 'Export to Excel'}
          </Button>

          <Button
            onClick={handleClose}
            variant="contained"
            startIcon={<ImExit />}
            sx={{
              backgroundColor: '#082a89',
              '&:hover': { backgroundColor: '#1675f2' },
              marginRight: 2,
              marginBottom: 1,
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default PurchaseOrderReport;