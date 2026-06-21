import React, { useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, Button, ThemeProvider } from '@mui/material';
import { ImExit } from 'react-icons/im';
import PfReportView from '../PfReportView';
import useAuth from 'hooks/useAuth';
import reporttheme from 'themes/theme/reporttheme';

interface PurchaseRequestFormReportProps {
  requestNumber?: string;
  onClose?: () => void;
  divCode?: string;
}

const PurchaseRequestFormReport: React.FC<PurchaseRequestFormReportProps> = ({ requestNumber, onClose, divCode }) => {
  const { user } = useAuth();

  useEffect(() => {
    console.log('Request Number:', requestNumber);
    console.log('Div Code:', divCode);
    console.log('Company Code:', user?.company_code);
  }, [requestNumber, divCode, user?.company_code]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Helper function to extract div_code from requestNumber prefix
  const extractDivCodeFromPrefix = (reqNumber: string): string => {
    if (!reqNumber) return '16';

    // Extract prefix before first "/" or "$"
    const prefix = reqNumber.split(/[/$]/)[0];

    if (prefix.toUpperCase() === 'AJSS') return '13';
    if (prefix.toUpperCase() === 'MFS') return '10';
    if (prefix.toUpperCase() === 'AND') return '16';

    // Default fallback
    return divCode || '16';
  };

  if (!requestNumber) {
    console.warn('No request number provided to PurchaseRequestFormReport');
    return <div>No request number provided</div>;
  }

  // Format request number if it contains dollar signs replace them with slashes
  const formattedRequestNumber = requestNumber.replace(/\$/g, '/');

  // Resolve div_code: use passed prop, or extract from requestNumber
  const resolvedDivCode = divCode || extractDivCodeFromPrefix(requestNumber);

  // Get report ID based on resolved div_code
  const getReportId = () => {
    switch (resolvedDivCode) {
      case '13':
        return 'fb96d345-bc85-409d-8934-92140d59efb9';
      case '10':
        return 'da868bb0-05c6-4603-aa4f-291f3584b67c';
      case '16':
        return '2a68d0b7-b0d4-4e93-b056-80c1dc3a33c8';
      default:
        return 'da868bb0-05c6-4603-aa4f-291f3584b67c';
    }
  };

  // Add error boundary for report rendering
  const renderReport = () => {
    try {
      return (
        <PfReportView
          reportPath={getReportId()}
          parameters={{
            Request_number: formattedRequestNumber,
            company_code: user?.company_code || '',
            requestNumber: formattedRequestNumber
          }}
        />
      );
    } catch (error) {
      console.error('Error rendering report:', error);
      return <div>Error rendering report. Please check parameters.</div>;
    }
  };

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
        <DialogContent>{renderReport()}</DialogContent>
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

export default PurchaseRequestFormReport;
