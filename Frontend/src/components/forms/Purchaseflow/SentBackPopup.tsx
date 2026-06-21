import React, { useState, useEffect } from 'react';
import { TextField, MenuItem, Button } from '@mui/material';
import { useSelector } from 'store';
import PfServiceInstance from 'service/service.purhaseflow';

interface Role {
  role_name: string;
  flow_level: number;
}

interface SentBackPopupProps {
  request_number: string;
  flowLevel: number;
  onClose: () => void;
  onLevelChange: (level: number) => void;
  onRemarksChange: (remarks: string) => void;
}

const SentBackPopup: React.FC<SentBackPopupProps> = ({ request_number, flowLevel, onClose, onLevelChange, onRemarksChange }) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [remarks, setRemarks] = useState<string>('');
  const { app } = useSelector((state) => state.menuSelectionSlice);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
    let data;
    console.log("request_number", request_number)
        if (request_number.includes('MAT')) {
          data = await PfServiceInstance.getSentbackrolls_Mat(app);
          console.log("data", data)
        } else {
          data = await PfServiceInstance.getSentbackrolls(app);
        }
        if (Array.isArray(data) && data.length > 0) {
          const filteredRoles = data
            .filter((role) => role.flow_level < flowLevel && role.role_name)
            .map((role) => ({
              role_name: role.role_name,
              flow_level: role.flow_level
            }));
          setRoles(filteredRoles);
          if (filteredRoles.length > 0) {
            const highestRole = filteredRoles.reduce((max, role) => (role.flow_level > max.flow_level ? role : max));
            setSelectedRole(highestRole.role_name);
          }
        }
      } catch (error) {
        console.error('Error fetching roles:', error);
      }
    };
    fetchRoles();
  }, [app, flowLevel]);

  const handleOk = () => {
    const selected = roles.find((role) => role.role_name === selectedRole);
    if (selected) {
      onLevelChange(selected.flow_level);
      onRemarksChange(remarks);
      onClose();
      console.log("clicked")
    }
  };

  return (
    <div>
      <TextField label="Request Number" value={request_number} fullWidth disabled style={{ marginBottom: '20px' }} />
      <TextField
        label="Level"
        select
        fullWidth
        value={selectedRole}
        onChange={(e) => setSelectedRole(e.target.value)}
        style={{ marginBottom: '20px' }}
      >
        {roles.map((role) => (
          <MenuItem key={role.role_name} value={role.role_name}>
            {role.role_name}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        label="Remarks"
        fullWidth
        multiline
        rows={4}
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        style={{ marginBottom: '20px' }}
      />
      <div style={{ marginTop: '20px' }}>
        <Button onClick={handleOk} disabled={!selectedRole} variant="contained" color="primary" style={{ marginRight: '10px' }}>
          OK
        </Button>
        <Button onClick={onClose} variant="contained" color="secondary">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default SentBackPopup;
