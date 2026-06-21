import React, { useState } from 'react';
import { TextField, Button, Grid, Box, Tooltip, Typography, Paper, Stack } from '@mui/material';
import MaterialItemDetailsGrid from 'components/forms/Purchaseflow/MaterialItemDetailsGrid';
import MaterialItemPopupForm, { MaterialItemData } from 'components/forms/Purchaseflow/MaterialItemPopupForm';
import { IoPrintSharp, IoSendSharp } from 'react-icons/io5';
import { dispatch } from 'store';
import { showAlert } from 'store/CustomAlert/alertSlice';
import GmMatServiceInstance from '../../../service/Purchaseflow/services.material';
import { TBasicMaterialRequest, TItemMaterialRequest } from '../../../../src/pages/Purchasefolder/type/materrequest_pf-types';

interface MaterialRequestFormProps {
  materialRequest: TBasicMaterialRequest | null;
  setMaterialRequest: React.Dispatch<React.SetStateAction<TBasicMaterialRequest | null>>;
  user: any;
  isEditMode: boolean;
  prodOptions: any[];
  costOptions: any[];
  projectOptions: any[];
}

const MaterialRequestForm: React.FC<MaterialRequestFormProps> = ({
  materialRequest,
  setMaterialRequest,
  user,
  isEditMode,
  prodOptions,
  costOptions,
  projectOptions
}) => {
  const [openPopup, setOpenPopup] = useState(false);

  const handleChange = (field: keyof TBasicMaterialRequest, value: string) => {
    if (materialRequest) {
      setMaterialRequest({ ...materialRequest, [field]: value });
    }
  };

  const handleItemsChange = (updatedItems: TItemMaterialRequest[]) => {
    if (materialRequest) {
      setMaterialRequest({ ...materialRequest, items: updatedItems });
    }
  };

  const handleSubmit = async () => {
    if (!materialRequest) return;
    const cleanedItems = (materialRequest.items || []).filter((item) => !!item.item_code);
    try {
      const success = await GmMatServiceInstance.updatematerialrequest({
        ...materialRequest,
        items: cleanedItems
      });

      if (success) {
        dispatch(
          showAlert({
            open: true,
            message: 'Material Request updated successfully!',
            severity: 'success'
          })
        );
      } else throw new Error('Update failed');
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

  const handlePRPrint = () => console.log('PR Print clicked');

  const handleAddRow = (data: MaterialItemData) => {
    const newItem: TItemMaterialRequest = {
      item_code: data.prod_code,
      item_rate: data.item_rate,
      item_p_qty: data.item_p_qty,
      item_l_qty: data.item_l_qty,
      p_uom: data.p_uom,
      l_uom: data.l_uom,
      from_cost_code: data.from_cost_code,
      to_cost_code: data.to_cost_code,
      from_project_code: data.from_project_code,
      to_project_code: data.to_project_code
    };

    const updatedItems = [...(materialRequest?.items || []), newItem];
    handleItemsChange(updatedItems);
    setOpenPopup(false);
  };

  return (
    <Box sx={{ p: 2, width: '100%' }}>
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        Material Request
      </Typography>

      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Request Number"
              variant="outlined"
              value={materialRequest?.request_number || ''}
              InputProps={{ readOnly: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="date"
              label="Request Date *"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              value={materialRequest?.request_date || ''}
              onChange={(e) => handleChange('request_date', e.target.value)}
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
      </Paper>

      <Box>
        <Stack direction="row" justifyContent="flex-end" mb={2}>
          <Button variant="outlined" onClick={() => setOpenPopup(true)}>
            + Add Row
          </Button>
        </Stack>

        <MaterialItemDetailsGrid
          items={(materialRequest?.items || []).filter((item) => !!item?.item_code)}
          isEditMode={isEditMode}
          onItemsChange={handleItemsChange}
        />
      </Box>

      <Grid container justifyContent="space-between" alignItems="center" mt={3}>
        <Button variant="outlined" color="primary" size="small" endIcon={<IoSendSharp />} onClick={handleSubmit}>
          Submit
        </Button>

        <Tooltip title="Print & View">
          <Button variant="outlined" color="primary" onClick={handlePRPrint}>
            <IoPrintSharp />
          </Button>
        </Tooltip>
      </Grid>

      <MaterialItemPopupForm
        open={openPopup}
        onClose={() => setOpenPopup(false)}
        onSubmit={handleAddRow}
        prodOptions={prodOptions}
        costOptions={costOptions}
        projectOptions={projectOptions}
      />
    </Box>
  );
};

export default MaterialRequestForm;
