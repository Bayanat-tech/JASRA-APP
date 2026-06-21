import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import {
  Button,
  Grid,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
// import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import clearanceServiceInstance from 'service/wms/transaction/inbound/service.qualityclearanceWms';
import * as yup from 'yup';

const AddInboundQualityClearanceForm = ({
  selectedRows,
  prin_code,
  job_no,
  onClose
}: {
  selectedRows: any[];
  prin_code: string;
  job_no: string;
  onClose: (refetchData?: boolean) => void;
}) => {
  const { user } = useAuth();

  const formik = useFormik<{
    company_code: string | undefined;
    prin_code: string;
    job_no: string;
    clearance: string;
  }>({
    initialValues: {
      company_code: user?.company_code,
      prin_code: prin_code,
      job_no: job_no,
      clearance: 'Y'
    },
    validationSchema: yup.object().shape({
      clearance: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      
      try {
        console.log('Selected rows for quality clearance:', selectedRows);
        
        // Validate that we have selected rows
        if (!selectedRows || selectedRows.length === 0) {
          console.error('No rows selected for quality clearance');
          return;
        }

        // Process each selected row
        const promises = selectedRows.map((row) => {
          const packdetNo = row.packdet_no || row.PACKDET_NO;
          
          if (!packdetNo) {
            console.error('Missing packdet_no in row:', row);
            return null;
          }

          const payload = {
            company_code: values.company_code,
            prin_code: values.prin_code,
            job_no: values.job_no,
            packdet_no: Number(packdetNo),
            clearance: values.clearance
          };

          console.log('Submitting quality clearance payload:', payload);
          return clearanceServiceInstance.createQualityClearance(payload);
        }).filter(Boolean); // Remove null entries

        // Wait for all requests to complete
        await Promise.all(promises);
        
        onClose(true);
      } catch (error) {
        console.error('Error submitting quality clearance:', error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12}>
        <Typography variant="h4" className="text-black py-2 font-semibold">
          Quality Clearance
        </Typography>
      </Grid>

      {/* Display selected items */}
      <Grid item xs={12}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Lot No.</TableCell>
                <TableCell>PO No.</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedRows.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.prod_name || row.PROD_NAME}</TableCell>
                  <TableCell>{row.qty_string || row.QTY_STRING}</TableCell>
                  <TableCell>{row.lot_no || row.LOT_NO}</TableCell>
                  <TableCell>{row.po_no || row.PO_NO}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>

      <Grid item xs={12}>
        <InputLabel>Clearance Status</InputLabel>
        <FormControlLabel
          control={
            <Checkbox 
              onChange={(event, checked) => formik.setFieldValue('clearance', checked ? 'Y' : 'N')}
              checked={formik.values.clearance === 'Y'}
            />
          }
          name="clearance"
          label={'Approved'}
        />
      </Grid>

      {/*----------------------Submit-------------------------- */}
      <Grid item xs={12} className="flex justify-end">
        <Button
          type="submit"
          variant="contained"
          disabled={formik.isSubmitting || selectedRows.length === 0}
          startIcon={formik.isSubmitting ? <LoadingOutlined /> : <SaveOutlined />}
        >
          <FormattedMessage id="Process Quality Clearance" />
        </Button>
      </Grid>
    </Grid>
  );
};
export default AddInboundQualityClearanceForm;