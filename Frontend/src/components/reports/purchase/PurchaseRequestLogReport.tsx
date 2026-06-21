import React, { useRef } from 'react';
import { Dialog, DialogActions, DialogContent, Button, ThemeProvider } from '@mui/material';
import { ImExit } from 'react-icons/im';
import useAuth from 'hooks/useAuth';
import PfReportView from 'components/reports/PfReportView';
import reporttheme from 'themes/theme/reporttheme';

interface PurchaseRequestLogReportProps {
  requestNumber: string;
  onClose?: () => void;
}

const PurchaseRequestLogReport: React.FC<PurchaseRequestLogReportProps> = ({ requestNumber, onClose }) => {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  // Ensure onClose is called
  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  if (!requestNumber) {
    return <div>No request number provided</div>;
  }

  // Format request number if it contains slashes
  const formattedRequestNumber = requestNumber.replace(/\$/g, '/');

  const reportContent = (
    <div ref={containerRef} style={{ height: '80vh', width: '100%' }}>
      <PfReportView
        reportPath="39026f3f-1d6c-4e7a-81c1-ea001780d13b"
        parameters={{
          Request_Number: formattedRequestNumber,
          Company_Code: user?.company_code || ''
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

export default PurchaseRequestLogReport;
