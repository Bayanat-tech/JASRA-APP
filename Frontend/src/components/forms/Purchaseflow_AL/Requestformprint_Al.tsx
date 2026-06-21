import { DialogActions, Button } from '@mui/material';

import React, { useState } from 'react';
import SentbackRollSectionAl from './SentbackRollSection_Al';
import { TPurchaserequestPf_Al } from 'pages/Purchasefolder_Al/purchaserequestheader_pf-types_Al';
import GmPfServiceInstance_Al from 'service/Purchaseflow_Al/services.purchaseflow';

interface RequestFormProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (purchaseRequestData: TPurchaserequestPf_Al) => void;
  onReject: (purchaseRequestData: TPurchaserequestPf_Al) => void;
  onSentBack: (purchaseRequestData: TPurchaserequestPf_Al) => void;
  onBack: () => void;
  initialData?: TPurchaserequestPf_Al;
  loading?: boolean;
}

const PurchaseRequestFormprint_Al: React.FC<RequestFormProps> = ({
  open,
  onClose,
  onConfirm,
  onReject,
  onSentBack,
  onBack,
  initialData,
  loading = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  //const [selectedLevel] = useState<number | null>(null);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleUpdateRequest = async (
    action: string,
    l_flow_level: number,
    actionFunction: (data: TPurchaserequestPf_Al) => void,
    setModalComponent?: React.Dispatch<React.SetStateAction<React.ReactNode | null>>
  ) => {
    if (window.opener) {
      window.opener.postMessage({ type: 'SET_LAST_ACTION', action }, '*');
    } else {
      console.error('Parent window (opener) not available');
    }

    const purchaseRequestData = initialData!;
    purchaseRequestData.last_action = action;
    if (l_flow_level > 0) {
      purchaseRequestData.flow_level_running = l_flow_level;
    }

    await GmPfServiceInstance_Al.updatepurchaserequest(purchaseRequestData);
    if (!purchaseRequestData.request_number) {
      console.error('Request number is undefined.');
      return false;
    }

    actionFunction(purchaseRequestData);
    window.close();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveAsPDF = () => {
    const content = document.getElementById('print-content');
    if (content) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Purchase Request</title></head><body>');
        printWindow.document.write(content.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }
    }
  };

  return (
    <DialogActions sx={{ display: 'flex', flexDirection: 'row', gap: 2, justifyContent: 'flex-end' }}>
      <Button onClick={onBack} color="secondary" disabled={loading}>
        Back
      </Button>
      <Button
        onClick={async () => {
          await handleUpdateRequest('SENTBACK', 0, onSentBack);
          onBack();
        }}
        disabled={loading}
      >
        Sent Back
      </Button>
      <Button
        onClick={async () => {
          await handleUpdateRequest('SUBMITTED', 0, onConfirm);
          onBack();
        }}
        disabled={loading}
      >
        Confirm
      </Button>
      <Button
        onClick={async () => {
          await handleUpdateRequest('REJECTED', 0, onReject);
          onBack();
        }}
        color="error"
        disabled={loading}
      >
        Reject
      </Button>
      <Button onClick={handlePrint}>Print</Button>
      <Button onClick={handleSaveAsPDF}>Save as PDF</Button>
      <Button onClick={onClose}>Close</Button>
      <div>
        <button onClick={handleOpenModal}>SentBack1</button>
        {isModalOpen && (
          <SentbackRollSectionAl
            onClose={async (newFlowLevel: number) => {
              if (newFlowLevel > 0) {
                await handleUpdateRequest('SENTBACK', newFlowLevel, onSentBack);
                onBack();
              }
              setIsModalOpen(false);
            }}
            flowLevel={initialData?.flow_level_running || 0}
          />
        )}
      </div>
    </DialogActions>
  );
};

export default PurchaseRequestFormprint_Al;
