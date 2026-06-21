import React, { useRef, useState } from 'react';
import { Box, Button, TextField, Alert } from '@mui/material';

interface PurchaseRequestData {
  [key: string]: any;
  remarks?: string;
  last_action?: string;
  ref_doc_no?: string;
  company_code?: string;
}

interface POModifyRemarksProps {
  purchaseRequestData: PurchaseRequestData | null;
  setPurchaseRequestData: (data: PurchaseRequestData | null) => void;
  setLoading: (loading: boolean) => void;
  setIsModalOpen: (open: boolean) => void;
  setModifiedData: (data: any) => void;
  GmPfServiceInstance: {
    updatepurchaserorder: (data: PurchaseRequestData) => Promise<any>;
    updateReasonForPO: (refDocNo: string, company_code: string, remarks: string) => Promise<any>;
  };
  remarksText: string;
  setRemarksText: (text: string) => void;
  onSuccess?: () => void;
  closeParentModal: () => void;  // Add this line
}

const POModifyRemarks: React.FC<POModifyRemarksProps> = ({
  purchaseRequestData,
  setPurchaseRequestData,
  setLoading,
  setIsModalOpen,
  setModifiedData,
  GmPfServiceInstance,
  remarksText,
  setRemarksText,
  onSuccess,
  closeParentModal
}) => {
  const remarksRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateRequest = async (action: string) => {
    if (!purchaseRequestData) {
      alert('No purchase request data available to update.');
      setIsModalOpen(false);
      return;
    }

    const remarks = remarksText.trim();

    try {
      setLoading(true);
      setError(null);

      const dataToUpdate = {
        ...purchaseRequestData,
        last_action: action,
        remarks
      };

      console.log('Payload being sent:', dataToUpdate);

      // First API call
      const response = await GmPfServiceInstance.updatepurchaserorder(dataToUpdate);
      console.log('Update successful:', response);

      // Second API call
      console.log('ref_doc_no', dataToUpdate.ref_doc_no);
      console.log('ref_doc_no', dataToUpdate.ref_doc_no);
      console.log('remarks', remarks);
      await GmPfServiceInstance.updateReasonForPO(dataToUpdate.ref_doc_no ?? '', dataToUpdate.company_code ?? '', remarks);
      console.log('Remarks update successful');

      setModifiedData(dataToUpdate);
      setIsModalOpen(false);
      closeParentModal(); // Close the parent PO modify form modal
      onSuccess?.(); // This should refresh the table data
    } catch (err) {
      console.error('Error updating purchase order:', err);
      setError('Failed to update purchase order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box width="600px">
      <TextField 
        fullWidth 
        multiline 
        rows={4} 
        variant="outlined" 
        placeholder="Enter reason for revision" 
        value={remarksText}
        onChange={(e) => setRemarksText(e.target.value)}
        inputRef={remarksRef}
      />
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Box mt={3} display="flex" justifyContent="flex-end">
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleUpdateRequest('Pomodify')}
          disabled={!(remarksText.trim().length > 0)}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default POModifyRemarks;
