import React, { useEffect, useState } from 'react';
import { TextField, Button, Grid, Box, ButtonGroup, Tooltip, Typography, Tabs, Tab, Paper } from '@mui/material';
import MaterialItemDetailsGrid from 'components/forms/Purchaseflow/MaterialItemDetailsGrid';
import { IoPrintSharp, IoSendSharp } from 'react-icons/io5';
import { MdCancelScheduleSend } from 'react-icons/md';
import { RiArrowGoBackFill } from 'react-icons/ri';
import { dispatch } from 'store';
import { showAlert } from 'store/CustomAlert/alertSlice';
import GmMatServiceInstance from '../../service/Purchaseflow/services.material';
import { TBasicMaterialRequest, TItemMaterialRequest } from './type/materrequest_pf-types';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { SentBackPopup } from 'pages/Purchasefolder/MyTaskPendingRequestTab';
// import SentbackRollSection from './SentbackRollSection';
import UniversalDialog from 'components/popup/UniversalDialog';
import CustomAlert from 'components/@extended/CustomAlert';
import useAuth from 'hooks/useAuth';

interface MaterialRequestFormProps {
  materialRequest: TBasicMaterialRequest | null;
  setMaterialRequest: React.Dispatch<React.SetStateAction<TBasicMaterialRequest | null>>;

  isEditMode: boolean;
}

const MaterialRequestForm: React.FC<MaterialRequestFormProps> = ({ materialRequest, setMaterialRequest, isEditMode }) => {
  const { user } = useAuth();

  console.log('Material Request Form - User:', user);

  const [activeTab, setActiveTab] = useState(0);

  const [sentBackPopup, setSentBackPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'sm'
    },
    title: 'Send Back Request',
    data: { request_number: '', remarks: '', level: '' }
  });

  const handlePRPrint = () => console.log('PR Print clicked');

  const handleSentBackPopupOpen = (request_number: string, flow_Level: number) => {
    setSentBackPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: true },
      data: { request_number, remarks: '', level: flow_Level }
    }));
  };

  const handleSentBackPopupClose = () => {
    setSentBackPopup((prev) => ({
      ...prev,
      action: { ...prev.action, open: false },
      data: { request_number: '', remarks: '', level: '' }
    }));
  };

  const handleChange = (field: keyof TBasicMaterialRequest, value: string) => {
    if (materialRequest) {
      setMaterialRequest({
        ...materialRequest,
        [field]: value
      });
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleItemsChange = (updatedItems: TItemMaterialRequest[]) => {
    if (materialRequest) {
      setMaterialRequest({
        ...materialRequest,
        items: updatedItems
      });
    }
  };

  function formatDateForInput(date: string | number | Date) {
    if (!date) return '';
    // Ensure it's a Date object
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  useEffect(() => {
    if (materialRequest) {
      console.log('Material Request date:', materialRequest?.request_date);
    }
  }, [materialRequest]);

  const handleSubmit = async (P_last_action: string, flow_level_running?: number, remarks?: string) => {
    if (!materialRequest) return;

    console.log('Material Request:', materialRequest);

    if (!materialRequest.request_date) {
      dispatch(
        showAlert({
          open: true,
          message: 'Request Date is required.',
          severity: 'error'
        })
      );
    }

    // ✅ Check if at least one item is added
    if (!materialRequest.items || materialRequest.items.length === 0) {
      dispatch(
        showAlert({
          open: true,
          message: 'At least one item is required.',
          severity: 'error'
        })
      );
      return; // Stop submission
    }

    // Set mandatory fields
    materialRequest.last_action = P_last_action;
    materialRequest.updated_by = user?.loginid ?? '';

    // Conditionally set optional fields
    if (flow_level_running !== undefined) {
      materialRequest.flow_level_running = flow_level_running;
    }

    try {
      const success = await GmMatServiceInstance.updatematerialrequest(materialRequest);

      if (success) {
        dispatch(
          showAlert({
            open: true,
            message: 'Material Request updated successfully!',
            severity: 'success'
          })
        );
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      dispatch(
        showAlert({
          open: true,
          message: 'Something went wrong!',
          severity: 'error'
        })
      );
    }
  };

  return (
    <Box sx={{ p: 2, width: '100%' }}>
      <CustomAlert />
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
        Material Request
      </Typography>
      <Paper elevation={1}>
        <Tabs value={activeTab} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
          <Tab label="Request Information" />
          <Tab label="Item Details" />
        </Tabs>

        {activeTab === 0 && (
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Request Number"
                  variant="outlined"
                  value={materialRequest?.request_number || ''}
                  InputProps={{ readOnly: true }}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="Request Date *"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formatDateForInput(materialRequest?.request_date || '')}
                  onChange={(e) => handleChange('request_date', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Requestor Name*"
                  variant="outlined"
                  value={materialRequest?.requestor_name || ''}
                  onChange={(e) => handleChange('requestor_name', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="need by date*"
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={formatDateForInput(materialRequest?.need_by_date || '')}
                  onChange={(e) => handleChange('need_by_date', e.target.value)}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Remarks / Description"
                  variant="outlined"
                  multiline
                  rows={3}
                  value={materialRequest?.description || ''}
                  onChange={(e) => handleChange('description', e.target.value)}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        {activeTab === 1 && (
          <Box sx={{ p: 2, overflowX: 'auto', maxWidth: '100%' }}>
            <MaterialItemDetailsGrid items={materialRequest?.items || []} isEditMode={isEditMode} onItemsChange={handleItemsChange} />
          </Box>
        )}
      </Paper>

      <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center" mt={3}>
        <ButtonGroup variant="contained" size="small">
          <Button sx={{ backgroundColor: '#082a89' }} endIcon={<IoSendSharp />} onClick={() => handleSubmit('SAVEASDRAFT')}>
            Save As Draft
          </Button>
          <Button sx={{ backgroundColor: '#082a89' }} endIcon={<IoSendSharp />} onClick={() => handleSubmit('SUBMITTED')}>
            Submit
          </Button>
          {/* <Button sx={{ backgroundColor: '#082a89' }} endIcon={<IoSendSharp />} onClick={handleSubmit}>
            Submit
          </Button> */}
          <Button sx={{ backgroundColor: '#082a89' }} endIcon={<MdCancelScheduleSend />} onClick={() => handleSubmit('REJECTED')}>
            Reject
          </Button>

          <Button
            sx={{ backgroundColor: '#082a89' }}
            color="primary"
            onClick={() => {
              handleSentBackPopupOpen(materialRequest?.request_number ?? '', Number(materialRequest?.flow_level_running));
            }}
            endIcon={<RiArrowGoBackFill />}
          >
            Send Back
          </Button>
        </ButtonGroup>

        {sentBackPopup.action.open && (
          <UniversalDialog
            action={{ ...sentBackPopup.action }}
            onClose={handleSentBackPopupClose}
            title={sentBackPopup.title}
            hasPrimaryButton={false}
          >
            <SentBackPopup
              request_number={sentBackPopup?.data?.request_number}
              flowLevel={sentBackPopup.data.level}
              onClose={handleSentBackPopupClose}
              onLevelChange={(level) => setSentBackPopup((prev) => ({ ...prev, data: { ...prev.data, level } }))}
              onRemarksChange={(remarks) => setSentBackPopup((prev) => ({ ...prev, data: { ...prev.data, remarks } }))}
            />
          </UniversalDialog>
        )}

        <Tooltip title="Print & View">
          <Button variant="outlined" color="primary" onClick={handlePRPrint}>
            <IoPrintSharp />
          </Button>
        </Tooltip>
      </Grid>
    </Box>
  );
};

export default MaterialRequestForm;
