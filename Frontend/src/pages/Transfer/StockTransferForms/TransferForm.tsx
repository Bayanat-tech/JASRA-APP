import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import TransferRequestTab1 from './TransferRequestTab1';

interface TransferFormProps {
  onClose: () => void;
  data?: any; // Accepts data for edit mode. If empty, it's add mode.
}

const TransferForm: React.FC<TransferFormProps> = ({ onClose, data }) => {
  const [activeTab, setActiveTab] = useState(0);

  

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };



  // You can optionally handle submit here if you move it up from TransferRequestTab1

  return (
    <Box>
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tab label="Transfer Entry" />
        <Tab label="Process Transfer" />
        <Tab label="Confirm Transfer" />
        <Tab label="Cancel Transfer" />
        <Tab label="Cancel Confirmed Transfer" />
      </Tabs>

      {activeTab === 0 && <TransferRequestTab1 />}
      {activeTab === 1 && <TransferRequestTab1 />}
      {activeTab === 2 && <TransferRequestTab1 />}
      {activeTab === 3 && <TransferRequestTab1 />}
      {activeTab === 4 && <TransferRequestTab1 />}
    </Box>
  );
};

export default TransferForm;
