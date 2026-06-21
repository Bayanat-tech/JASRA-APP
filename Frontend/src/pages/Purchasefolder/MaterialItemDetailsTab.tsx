import React, { useEffect, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import MaterialRequestForm from './MaterialRequestForm';
import { openSnackbar } from 'store/reducers/snackbar';
import { dispatch } from 'store';
import axiosServices from 'utils/axios';
import { IApiResponse } from 'types/types.services';
import { TBasicMaterialRequest } from './type/materrequest_pf-types';

type MaterialItemDetailsTabProps = {
  onClose: () => void;
  isEditMode?: boolean;
  requestNumber?: string;
};

const MaterialItemDetailsTab: React.FC<MaterialItemDetailsTabProps> = ({ onClose, requestNumber, isEditMode = false }) => {
  const [materialRequest, setMaterialRequest] = useState<TBasicMaterialRequest | null>(null);
  // const [user] = useState<any>(undefined); // Removed unused user state
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setMaterialRequest(null);
    setLoading(true);

    if (!isEditMode) {
      localStorage.removeItem('itemDetails');
    }

    const fetchData = async () => {
      if (isEditMode && requestNumber) {
        try {
          const formatted = requestNumber.replace(/\//g, '$$');
          const response: IApiResponse<TBasicMaterialRequest> = await axiosServices.get(`api/pf/gm/getMaterialRequestNumber/${formatted}`);

          if (isMounted && response.data.success && response.data.data) {
            setMaterialRequest(response.data.data);
          } else {
            throw new Error('Unable to fetch data.');
          }
        } catch (error: any) {
          dispatch(
            openSnackbar({
              open: true,
              message: error.message || 'Error fetching material request',
              variant: 'alert',
              alert: { color: 'error' },
              severity: 'error',
              close: true
            })
          );
        } finally {
          if (isMounted) setLoading(false);
        }
      } else {
        // New request
        if (isMounted) {
          setMaterialRequest({
            request_number: '',
            request_date: new Date(),
            description: '',
            updated_by: '',
            requestor_name: '',
            need_by_date: new Date(),
            flow_level_running: 1, // ✅ Required field
            items: [] // ✅ Optional, if part of your type
          });
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
    };
  }, [isEditMode, requestNumber]);

  if (loading || !materialRequest) return <CircularProgress sx={{ mt: 2 }} />;

  return (
    <Box>
      <MaterialRequestForm materialRequest={materialRequest} setMaterialRequest={setMaterialRequest} isEditMode={isEditMode} />
    </Box>
  );
};

export default MaterialItemDetailsTab;
