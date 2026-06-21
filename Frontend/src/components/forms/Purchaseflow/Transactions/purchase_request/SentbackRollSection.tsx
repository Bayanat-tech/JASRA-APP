import React, { useState, useEffect } from 'react';
import { useSelector } from 'store';
import PfServiceInstance from 'service/service.purhaseflow';

interface Role {
  role_name: string;
  flow_level: number;
}

interface SentbackroleSectionProps {
  onClose: (level: number) => void; // Callback function to return the selected level
  flowLevel: number; // Flow level passed from the parent component
}

const SentbackroleSection: React.FC<SentbackroleSectionProps> = ({ onClose, flowLevel }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const { app } = useSelector((state) => state.menuSelectionSlice);

  // Fetch roles when the component mounts or flowLevel changes
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        console.log(flowLevel);

        const data = await PfServiceInstance.getSentbackrolls(app);
        console.log('Raw data from API:', data);

        if (Array.isArray(data) && data.length > 0) {
          const filteredRoles = data
            .filter((role) => role.flow_level < flowLevel && role.role_name)
            .map((role) => ({
              role_name: role.role_name,
              flow_level: role.flow_level
            }));

          console.log('Filtered Roles:', filteredRoles);

          if (filteredRoles.length > 0) {
            // Set roles and default to the highest flow level
            setRoles(filteredRoles);
            const highestRole = filteredRoles.reduce((max, role) => (role.flow_level > max.flow_level ? role : max));
            setSelectedRole(highestRole.role_name);
          } else {
            setRoles([]);
          }
        } else {
          console.error('No data or unexpected data format:', data);
          setRoles([]); // Clear roles if no valid data
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
        setRoles([]); // Clear roles on error
      }
    };

    fetchRoles();
  }, [app, flowLevel]); // Run effect when `app` or `flowLevel` changes

  const handleOk = () => {
    const selected = roles.find((role) => role.role_name === selectedRole);
    if (selected) {
      onClose(selected.flow_level); // Return selected flow_level to the parent
    }
  };

  const handleCancel = () => {
    onClose(0); // Close child without selecting a role
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
          width: '400px',
          maxWidth: '90%',
          textAlign: 'center'
        }}
      >
        <h3 style={{ marginBottom: '20px' }}>Select Role</h3>
        <label htmlFor="role-dropdown" style={{ display: 'block', marginBottom: '10px' }}>
          Role:
        </label>
        <select
          id="role-dropdown"
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            marginBottom: '20px',
            borderRadius: '4px',
            border: '1px solid #ccc'
          }}
        >
          <option value="">--Select a Role--</option>
          {roles.length > 0 ? (
            roles.map((role) => (
              <option key={role.role_name} value={role.role_name}>
                {role.role_name}
              </option>
            ))
          ) : (
            <option disabled>No roles available</option>
          )}
        </select>
        <div style={{ marginTop: '20px' }}>
          <button
            onClick={handleOk}
            disabled={!selectedRole}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              background: selectedRole ? '#007bff' : '#ccc',
              color: selectedRole ? '#fff' : '#000',
              cursor: selectedRole ? 'pointer' : 'not-allowed',
              marginRight: '10px'
            }}
          >
            OK
          </button>
          <button
            onClick={handleCancel}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '4px',
              background: '#f44336',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SentbackroleSection;
