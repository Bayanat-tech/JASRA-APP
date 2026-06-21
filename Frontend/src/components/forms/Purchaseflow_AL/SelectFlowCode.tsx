import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface SelectFlowCodeProps {
  userCode: string;
  onSelectFlow: (flowCode: string) => void;
}

const SelectFlowCode: React.FC<SelectFlowCodeProps> = ({ userCode, onSelectFlow }) => {
  const [flowOptions, setFlowOptions] = useState<{ flow_code: string; flow_description: string }[]>([]);
  const [selectedFlow, setSelectedFlow] = useState<string>('');

  useEffect(() => {
    const fetchFlowData = async () => {
      try {
        console.log('inside select code')
        const response = await axios.get(`BT-FLOW/Transctions/${userCode}`);
        setFlowOptions(response.data);
      } catch (error) {
        console.error('Error fetching flow options:', error);
      }
    };

    fetchFlowData();
  }, [userCode]);

  const handleSelection = () => {
    if (selectedFlow) {
      onSelectFlow(selectedFlow);
    }
  };

  return (
    <div>
      <h3>Select Flow Code</h3>
      <select value={selectedFlow} onChange={(e) => setSelectedFlow(e.target.value)}>
        <option value="">--Select Flow--</option>
        {flowOptions.map((flow) => (
          <option key={flow.flow_code} value={flow.flow_code}>
            {flow.flow_description}
          </option>
        ))}
      </select>
      <button onClick={handleSelection} disabled={!selectedFlow}>
        Submit
      </button>
    </div>
  );
};

export default SelectFlowCode;
