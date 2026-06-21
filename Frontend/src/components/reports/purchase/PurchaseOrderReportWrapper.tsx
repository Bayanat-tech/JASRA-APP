import { Dialog, DialogActions, DialogContent, Button } from '@mui/material';
import PurchaseOrderReport from './PurchaseOrderReport';

interface PurchaseOrderReportWrapperProps {
  poNumber: string;
  isDialog?: boolean;
  onClose?: () => void;
}

const PurchaseOrderReportWrapper: React.FC<PurchaseOrderReportWrapperProps> = ({ poNumber, isDialog = true, onClose }) => {
  if (!isDialog) {
    return <PurchaseOrderReport poNumber={poNumber} />;
  }

  return (
    <Dialog open={true} onClose={onClose} fullWidth maxWidth="lg">
      <DialogContent>
        <PurchaseOrderReport poNumber={poNumber} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => window.print()} variant="contained" color="primary">
          PDF
        </Button>
        <Button onClick={onClose} variant="contained" color="primary">
          Back
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PurchaseOrderReportWrapper;
