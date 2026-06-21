import React from 'react';
import { Dialog, DialogActions, DialogContent, Button, ThemeProvider } from '@mui/material';
import { ImExit } from 'react-icons/im';
import PfReportView from '../PfReportView';
import reporttheme from 'themes/theme/reporttheme';

interface BudgetRequestFormReportProps {
  requestNumber?: string;
  onClose?: () => void;
}

const BudgetRequestFormReport: React.FC<BudgetRequestFormReportProps> = ({ requestNumber, onClose }) => {
  //   const { user } = useAuth();

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  if (!requestNumber) {
    console.warn('No request number provided to BudgetRequestFormReport');
    return <div>No request number provided</div>;
  }

  // Format request number if it contains dollar signs replace them with slashes
  const formattedRequestNumber = requestNumber.replace(/\//g, '$');

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
        <DialogContent>
          <PfReportView
            reportPath="af6d37bb-a1d2-44dc-bc0a-bcadf8bea0ff"
            parameters={{
              REQUEST_NUMBER: formattedRequestNumber
            }}
          />
        </DialogContent>
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

export default BudgetRequestFormReport;
