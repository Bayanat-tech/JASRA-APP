import React, { useEffect, useState } from 'react';
import SelectFlowCode from './SelectFlowCode';
import axios from 'axios';

interface CheckUserFlowProps {
  userCode: string; // Define userCode prop
}

const CheckUserFlow: React.FC<CheckUserFlowProps> = ({ userCode }) => {
  const [flowCount, setFlowCount] = useState<number | null>(null);
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);

  useEffect(() => {
    const checkUserFlow = async () => {
      try {
        console.log('inside CheckUserFlow');
        const response = await axios.get(`BT-FLOW/Transctions/${userCode}`);
        setFlowCount(response.data.count);
      } catch (error) {
        console.error('Error checking user flow:', error);
      }
    };

    checkUserFlow();
  }, [userCode]);

  // Handle selected flow from child component
  const handleFlowSelection = (flowCode: string) => {
    setSelectedFlow(flowCode);
  };

  return (
    <div>
      {flowCount !== null ? (
        flowCount > 0 ? (
          <SelectFlowCode userCode={userCode} onSelectFlow={handleFlowSelection} />
        ) : (
          <p>Selected Flow Code: NA</p>
        )
      ) : (
        <p>Loading...</p>
      )}

      {selectedFlow && <p>Selected Flow Code: {selectedFlow}</p>}
    </div>
  );
};

export default CheckUserFlow;
