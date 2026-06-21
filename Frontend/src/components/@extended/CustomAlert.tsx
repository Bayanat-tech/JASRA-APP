import React, { useEffect } from 'react';
import { Alert, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store';
import { clearAlert } from '../../store/CustomAlert/alertSlice';

const CustomAlert: React.FC = () => {
  const dispatch = useDispatch();
  const { message, severity } = useSelector((state: RootState) => state.alert);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        dispatch(clearAlert());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message, dispatch]);

  if (!message) return null;

  const getCustomIcon = () => {
    switch (severity) {
      case 'success':
        return <CheckCircleIcon />;
      case 'error':
        return <CancelIcon />;
      default:
        return undefined;
    }
  };

  const handleClose = () => {
    dispatch(clearAlert());
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Alert severity={severity} icon={getCustomIcon()} onClose={handleClose} sx={{ border: '1px solid #082a89' }}>
        {message}
      </Alert>
    </Box>
  );
};

export default CustomAlert;
