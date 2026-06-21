import { TextField, Button, MenuItem } from '@mui/material';
import React, { useState } from 'react';
import useAuth from 'hooks/useAuth';
import VendorSerivceInstance from 'service/wms/service.vendor';
import VendorServiceInstance from './services/service.vendor';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useIntl } from 'react-intl';

interface VendorSendBackProps {
  onClose: () => void;
  docNo: string;
  acCode: string;
  lastAction: string;
  flow_level?: string;
}

const VendorSendBack: React.FC<VendorSendBackProps> = ({ onClose, docNo, acCode, lastAction }) => {
  const { user } = useAuth();
  const [remarks, setRemarks] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const intl = useIntl();

  // 🔹 Fetch levels only if not reject
  const sql_string = `
   SELECT *
FROM VW_VENDOR_SENTBACK v
WHERE v.FLOW_LEVEL < (
    CASE 
        WHEN '${user?.loginid1}' IN (SELECT EMP_ID_LEVEL1 FROM MS_VENDOR_APPROVER) THEN 1
        WHEN '${user?.loginid1}' IN (SELECT EMP_ID_LEVEL2 FROM MS_VENDOR_APPROVER) THEN 2
        ELSE 0  -- fallback if the user is not found in either level
    END
)
  `;

  const { data: vendorDataSendBackLvl } = useQuery({
    queryKey: ['vendor_request_list', sql_string],
    queryFn: async () => {
      return await VendorSerivceInstance.executeRawSql(sql_string);
    },
    enabled: lastAction !== 'REJECTED'
  });

  // 🔹 Set default level when data arrives
  React.useEffect(() => {
    if (vendorDataSendBackLvl && vendorDataSendBackLvl.length > 0) {
      setSelectedLevel(vendorDataSendBackLvl[0].FLOW_LEVEL || '');
    }
  }, [vendorDataSendBackLvl]);

  // 🔹 Mutation for SendBack/Reject update
  const mutation = useMutation({
    mutationFn: (payload: any) => VendorServiceInstance.updateSendBackReject(payload),
    onSuccess: () => {
      onClose(); // Close popup after success
    }
  });

  // 🔹 Handle OK button
  const handleOk = () => {
    const payload = {
      doc_no: docNo,
      company_code: 'BSG',
      flow_level: lastAction === 'REJECTED' ? 0 : selectedLevel,
      remarks: `${remarks} - ${user?.username}`,
      action: lastAction as 'APPROVED' | 'REJECTED' | 'SENTBACK'
    };

    console.log('Sending payload:', payload);
    mutation.mutate(payload);
  };

  return (
    <div>
      <TextField label={intl.formatMessage({ id: 'DocNo' }) || 'Doc NO'}
        fullWidth margin="dense" value={docNo} InputProps={{ readOnly: true }} />

      {/* ✅ Hide Level field if rejected */}
      {lastAction !== 'REJECTED' && (
        <TextField
          select
          label={intl.formatMessage({ id: 'Level' }) || 'Level'}
          fullWidth
          value={selectedLevel}
          onChange={(e) => setSelectedLevel(e.target.value)}
          margin="dense"
        >
          {vendorDataSendBackLvl?.map((item: any, index: number) => (
            <MenuItem key={index} value={item.FLOW_LEVEL}>
              {item.EMPLOYEE_INFO}
            </MenuItem>
          ))}
        </TextField>
      )}

      <TextField label={intl.formatMessage({ id: 'Remarks' }) || 'Remarks'}
        fullWidth margin="dense" multiline rows={4} value={remarks} onChange={(e) => setRemarks(e.target.value)} />

      <div style={{ marginTop: '20px' }}>
        <Button variant="contained" color="primary" onClick={handleOk} disabled={mutation.isPending} style={{ marginRight: '10px' }}>
          {mutation.isPending
            ? intl.formatMessage({ id: 'Processing' }) || 'Processing...'
            : intl.formatMessage({ id: 'OK' }) || 'OK'}
        </Button>
        <Button onClick={onClose} variant="contained" color="secondary">
          {intl.formatMessage({ id: 'Cancel' }) || 'Cancel'}
        </Button>
      </div>
    </div>
  );
};

export default VendorSendBack;
