import { SettingOutlined } from '@ant-design/icons';
import { Button, Grid, TextField } from '@mui/material';
import { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import clearanceServiceInstance from 'service/wms/transaction/inbound/service.qualityclearanceWms';
import { TPackingDetails } from 'pages/WMS/Transaction/Inbound/types/packingDetails.types';
import useAuth from 'hooks/useAuth';

type TQuality = {
  truck_condition: string;
  container_condition: string;
  container_type: string;
  ref_box_temp: string;
  prod_temp: string;
  prod_con_acceptance: string;
};

interface QualityClearanceModalProps {
  selectedRows: TPackingDetails[];
  prin_code: string;
  job_no: string;
  onClose: (shouldRefresh?: boolean) => void;
}

const QualityClearanceModal = ({ selectedRows, prin_code, job_no, onClose }: QualityClearanceModalProps) => {
  const { user } = useAuth();
  const [isProcessingClearance, setIsProcessingClearance] = useState<boolean>(false);
  const [qualityClearance, setQualityClearance] = useState<TQuality>({
    truck_condition: '',
    container_condition: '',
    container_type: '',
    ref_box_temp: '',
    prod_temp: '',
    prod_con_acceptance: ''
  });

  const handleQualityClearance = async () => {
    console.log('handleQualityClearance called');

    if (!selectedRows.length) {
      console.error('No rows selected for quality clearance');
      return;
    }

    // If prod_con_acceptance is filled, skip other validations
    if (qualityClearance.prod_con_acceptance && qualityClearance.prod_con_acceptance.trim().length > 0) {
      // proceed to API call
    } else {
      // Validate all required fields are filled
      const requiredFields = Object.values(qualityClearance);
      if (!requiredFields.every(field => field && field.trim().length > 0)) {
        console.error('All quality clearance fields must be filled');
        return;
      }
    }

    console.log('Selected rows:', selectedRows);
    console.log('Quality clearance data:', qualityClearance);

    try {
      setIsProcessingClearance(true);

      // Process each selected row using the same API as AddInboundQualityClearanceForm
      const promises = selectedRows.map((row) => {
        const packdetNo = row.packdet_no || row.PACKDET_NO;
        
        if (!packdetNo) {
          console.error('Missing packdet_no in row:', row);
          return null;
        }

        const payload = {
          company_code: user?.company_code,
          prin_code: prin_code,
          job_no: job_no,
          packdet_no: Number(packdetNo),
          clearance: 'Y',
          // Add quality fields to payload
          truck_condition: qualityClearance.truck_condition.trim(),
          container_condition: qualityClearance.container_condition.trim(),
          container_type: qualityClearance.container_type.trim(),
          ref_box_temp: qualityClearance.ref_box_temp.trim(),
          prod_temp: qualityClearance.prod_temp.trim(),
          prod_con_acceptance: qualityClearance.prod_con_acceptance.trim()
        };

        console.log('Submitting quality clearance payload:', payload);
        return clearanceServiceInstance.createQualityClearance(payload);
      }).filter(Boolean);

      // Wait for all requests to complete
      await Promise.all(promises);

      console.log('Quality clearance processed successfully');

      // Reset form and close modal with refresh
      setQualityClearance({
        truck_condition: '',
        container_condition: '',
        container_type: '',
        ref_box_temp: '',
        prod_temp: '',
        prod_con_acceptance: ''
      });

      onClose(true);
    } catch (error) {
      console.error('Error processing quality clearance:', error);
    } finally {
      setIsProcessingClearance(false);
    }
  };

  return (
    <Grid container spacing={3} className="p-2">
      {/* Display total value */}
      <Grid container item xs={12} spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            value={qualityClearance.truck_condition}
            onChange={(event) => setQualityClearance((prev) => ({ ...prev, truck_condition: event.target.value }))}
            size="small"
            fullWidth
            label={<FormattedMessage id="Truck Condition" />}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            value={qualityClearance.container_condition}
            onChange={(event) => setQualityClearance((prev) => ({ ...prev, container_condition: event.target.value }))}
            size="small"
            fullWidth
            label={<FormattedMessage id="Container Condition" />}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            value={qualityClearance.container_type}
            onChange={(event) => setQualityClearance((prev) => ({ ...prev, container_type: event.target.value }))}
            size="small"
            fullWidth
            label={<FormattedMessage id="Container Type" />}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            value={qualityClearance.ref_box_temp}
            onChange={(event) => setQualityClearance((prev) => ({ ...prev, ref_box_temp: event.target.value }))}
            size="small"
            fullWidth
            label={<FormattedMessage id="Refer Box Temperature" />}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            value={qualityClearance.prod_temp}
            onChange={(event) => setQualityClearance((prev) => ({ ...prev, prod_temp: event.target.value }))}
            size="small"
            fullWidth
            label={<FormattedMessage id="Product Temperature" />}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            value={qualityClearance.prod_con_acceptance}
            onChange={(event) => setQualityClearance((prev) => ({ ...prev, prod_con_acceptance: event.target.value }))}
            size="small"
            fullWidth
            label={<FormattedMessage id="Product Condition Acceptance" />}
            required
          />
        </Grid>
      </Grid>
      
      <Grid item xs={12} className="flex justify-end space-x-2 pt-4">
        <Button variant="outlined" onClick={() => onClose(false)}>
          <FormattedMessage id="Cancel" />
        </Button>
        <Button 
          sx={{
            backgroundColor: "#082A89",
            color: "#fff",
            '&:hover': {
              backgroundColor: "#051f5e"
            }
          }}
          variant="contained"
          onClick={handleQualityClearance}
          startIcon={<SettingOutlined />}
          disabled={
            isProcessingClearance || 
            selectedRows.length === 0 || 
            (
              !qualityClearance.prod_con_acceptance.trim() &&
              Object.values(qualityClearance).some(field => !field.trim())
            )
          }
        >
          <FormattedMessage id={isProcessingClearance ? "Processing..." : "Process Quality Clearance"} />
        </Button>
      </Grid>
    </Grid>
  );
};

export default QualityClearanceModal;
