import React, { JSX } from 'react';

interface CheckbudgetStatusProps {
  setModalComponent: React.Dispatch<React.SetStateAction<JSX.Element | null>>;
  isVisible: boolean;
  onClose: () => void;
  data: string; // Adjust data type as needed
}

const CheckbudgetStatus: React.FC<CheckbudgetStatusProps> = ({ setModalComponent, isVisible, onClose, data }) => {
  if (!isVisible) return null; // Do not render if not visible

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Budget Status: {data}</h2>
        <button onClick={onClose}>Close</button> {/* Closes the modal */}
      </div>
    </div>
  );
};

export default CheckbudgetStatus;
