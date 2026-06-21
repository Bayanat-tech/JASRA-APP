import React from 'react';
import { Dialog, DialogActions, DialogContent, Button, ThemeProvider } from '@mui/material';
import { ImExit } from 'react-icons/im';
import PfReportView from '../PfReportView';
import useAuth from 'hooks/useAuth';
import reporttheme from 'themes/theme/reporttheme';

interface PurchaseOrderReportProps {
  poNumber: string;
  div_code?: string;
  onClose?: () => void;
}

const PurchaseOrderReport: React.FC<PurchaseOrderReportProps> = ({ poNumber, div_code, onClose }) => {
  const { user } = useAuth();

  if (!poNumber) {
    return <div>No PO number provided</div>;
  }

  const formattedPoNumber = poNumber.replace(/\$/g, '/');

  const resolvedDivCode = poNumber.startsWith('AND') ? '16' : '';

  const reportPath = resolvedDivCode === '16' ? '5c36baf8-061f-4f51-84a4-8e5d18f38d47' : 'deed0721-d433-4597-bfad-cfe8f7ca2e01';

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const reportContent = (
    <div style={{ height: '80vh', width: '100%' }}>
      <PfReportView
        reportPath={reportPath}
        parameters={{
          Ref_doc_no: formattedPoNumber,
          Company_code: user?.company_code || ''
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
            maxHeight: '90vh'
          }
        }}
      >
        <DialogContent>{reportContent}</DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            variant="contained"
            startIcon={<ImExit />}
            sx={{
              backgroundColor: '#082a89',
              '&:hover': {
                backgroundColor: '#1675f2'
              },
              marginRight: 2,
              marginBottom: 1
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
