import React, { useState } from 'react';

const SysDateComponent: React.FC = () => {
  const [sysdate, setSysdate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSysDate = async () => {
    try {
      const response = await fetch('http://localhost:5000/getSysDate');

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: { sysdate: string } = await response.json();
      setSysdate(data.sysdate);
      setError(null); // Clear error on success
    } catch (err) {
      setError(`Failed to fetch SYSDATE: ${(err as Error).message}`);
      console.error('Error fetching SYSDATE:', err);
    }
  };

  return (
    <div>
      <h2>Fetch Oracle SYSDATE</h2>
      <button onClick={fetchSysDate}>Get SYSDATE</button>
      {sysdate && <p>SYSDATE: {sysdate}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default SysDateComponent;
