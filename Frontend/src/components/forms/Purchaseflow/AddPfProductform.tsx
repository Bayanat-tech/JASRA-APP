import { Button, ButtonGroup, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, Tooltip } from '@mui/material';
import TextField from '@mui/material/TextField';
import { useQuery } from '@tanstack/react-query';
import CustomAlert from 'components/@extended/CustomAlert';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { useEffect } from 'react';
import { ImExit } from 'react-icons/im';
import { IoSendSharp } from 'react-icons/io5';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import { dispatch } from 'store';
import { TProduct } from '../../../pages/WMS/types/product-wms.types';
import { showAlert } from 'store/CustomAlert/alertSlice';
import * as yup from 'yup';
import PfServiceInstance from 'service/service.purhaseflow';
//import app from 'antd/es/app';
const AddPfProductform = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: boolean;
  existingData?: TProduct;
}) => {
  const { user } = useAuth();
  const handleAlert = async () => {
    let popupMessage: string | null = null;
    let severity: 'success' | 'info' | 'warning' | 'error' = 'success'; // Default

    try {
      if (!user?.loginid || !user?.company_code) {
        console.error('User information is incomplete. Cannot fetch message box.');
        return;
      }
      const messageBoxData = await GmPfServiceInstance.Fetchmessagebox(user.loginid, user.company_code);
      console.log('messagebox', messageBoxData);

      if (messageBoxData && messageBoxData.length > 0) {
        const box = messageBoxData[0] as any;
        popupMessage = box.MESSAGE_BOX ?? 'Records saved successfully!';
        severity = (box.MESSAGE_TYPE?.toLowerCase() as typeof severity) ?? 'success';
      } else {
        popupMessage = 'Contact Help desk for checking Message!';
      }
      //  await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
      console.log('popupMessage', popupMessage);
      console.log('severity', severity);

      dispatch(
        showAlert({
          severity,
          message: popupMessage ?? '',
          open: true
        })
      );
      return severity;
    } catch (error) {
      console.error('Error fetching alert message:', error);
      dispatch(
        showAlert({
          severity: 'error',
          message: 'An error occurred while fetching the alert message.',
          open: false
        })
      );
    }
  };
  const formik = useFormik<any>({
    initialValues: {
      prod_name: '',
      prod_code: '',
      company_code: user?.company_code ?? '',
      updated_by: user?.updated_by ?? '',
      prin_code: '',
      uom_count: 0
    },
    validationSchema: yup.object().shape({
      prod_code: yup.string().required('This field is required'),
      prod_name: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        const costmasterPayload = {
          ...values,
          cost_code: (values as any).cost_code ?? '', // Provide a default or map as needed
          cost_name: (values as any).cost_name ?? '' // Provide a default or map as needed
        };
        const response = isEditMode
          ? await GmPfServiceInstance.ediTProduct(costmasterPayload)
          : await GmPfServiceInstance.addCostmaster(costmasterPayload);
        const returnValue = await handleAlert(); // Wait for result
        console.log('inside handleConfirm3');

        if (returnValue === 'success') {
          //   await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
          onClose(); // Close the window/dialog
        }
        if (response) {
          dispatch(
            showAlert({
              open: true,
              message: isEditMode ? 'Cost master updated successfully!' : 'Cost master added successfully!',
              severity: 'success'
            })
          );
          onClose(true);
        } else {
          dispatch(
            showAlert({
              open: true,
              message: 'Operation failed. Please try again.',
              severity: 'error'
            })
          );
        }
      } catch (error) {
        console.error('Error in cost master operation:', error);
        dispatch(
          showAlert({
            open: true,
            message: 'An unexpected error occurred!',
            severity: 'error'
          })
        );
      } finally {
        setSubmitting(false);
      }
    },
    enableReinitialize: true
  });

  const { data: divisionData, isLoading: isDivisionLoading } = useQuery<{ tableData: TProduct[]; count: number }>({
    queryKey: ['division_data', user?.company_code],
    queryFn: async (): Promise<{ tableData: TProduct[]; count: number }> => {
      if (!user?.company_code) return { tableData: [], count: 0 };
      try {
        console.log('Fetching Division data (dddivision)...');
        const response = await PfServiceInstance.getMasters(user.company_code, 'dddivision');
        return {
          tableData: (response?.tableData || []) as TProduct[],
          count: response?.count || 0
        };
      } catch (err) {
        console.error('Error fetching division data:', err);
        throw err;
      }
    },
    enabled: !!user?.company_code
  });

  useEffect(() => {
    if (isEditMode && existingData) {
      const { updated_at, updated_by, created_at, created_by, ...costmasterData } = existingData;

      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues({
        ...costmasterData,
        prod_code: costmasterData.prod_code ?? '',
        prod_name: costmasterData.prod_name ?? '',
        company_code: user?.company_code ?? '',
        updated_by: user?.updated_by ?? ''
      });
    }
  }, [isEditMode, existingData, user?.company_code, user?.updated_by, formik]);

  return (
    <Grid container spacing={2} component="form" onSubmit={formik.handleSubmit}>
      <Grid item xs={12}>
        <CustomAlert />
      </Grid>

      {/* Product Code - reduced width */}
      <Grid item xs={12} className="flex">
        <div className="w-full max-w-md">
          <InputLabel>Product Code*</InputLabel>
          <TextField
            value={formik.values.prod_code}
            name="prod_code"
            onChange={formik.handleChange}
            disabled={!!isEditMode}
            fullWidth
            error={Boolean(getIn(formik.touched, 'prod_code') && getIn(formik.errors, 'prod_code'))}
          />
          {getIn(formik.touched, 'prod_code') && getIn(formik.errors, 'prod_code') && (
            <FormHelperText error>{getIn(formik.errors, 'prod_code')}</FormHelperText>
          )}
        </div>
      </Grid>

      {/* Product Name - full width */}
      <Grid item xs={12}>
        <div className="w-full max-w-md">
          <InputLabel>Product Name*</InputLabel>
          <TextField
            value={formik.values.prod_name}
            name="prod_name"
            onChange={formik.handleChange}
            fullWidth
            error={Boolean(getIn(formik.touched, 'prod_name') && getIn(formik.errors, 'prod_name'))}
          />
          {getIn(formik.touched, 'prod_name') && getIn(formik.errors, 'prod_name') && (
            <FormHelperText error>{getIn(formik.errors, 'prod_name')}</FormHelperText>
          )}
        </div>
      </Grid>

      <Grid item xs={12} className="flex">
        <div className="w-full max-w-md">
          <FormControl fullWidth error={Boolean(getIn(formik.touched, 'division') && getIn(formik.errors, 'division'))}>
            <InputLabel>Division*</InputLabel>
            <Select
              name="division"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.division}
              label="Division*"
            >
              {isDivisionLoading ? (
                <MenuItem disabled>Loading...</MenuItem>
              ) : (
                (divisionData?.tableData || []).map((item) => (
                  <MenuItem key={item.prod_code} value={item.prod_code}>
                    {item.prod_name}
                  </MenuItem>
                ))
              )}
            </Select>
            {getIn(formik.touched, 'division') && getIn(formik.errors, 'division') && (
              <FormHelperText>{getIn(formik.errors, 'division')}</FormHelperText>
            )}
          </FormControl>
        </div>
      </Grid>

      {/* Submit button (left) */}
      <Grid item xs={6}>
        <ButtonGroup variant="contained" size="small" aria-label="Basic button group">
          <Button
            sx={{ textTransform: 'none', backgroundColor: '#082a89' }}
            type="submit"
            size="small"
            disabled={formik.isSubmitting}
            endIcon={<IoSendSharp />}
          >
            Submit
          </Button>
        </ButtonGroup>
      </Grid>

      {/* Cancel button (right) */}
      <Grid item xs={6} className="flex justify-end">
        <ButtonGroup>
          <Tooltip title="Cancel">
            <Button size="large" color="primary" onClick={() => onClose(false)}>
              <ImExit />
            </Button>
          </Tooltip>
        </ButtonGroup>
      </Grid>
    </Grid>
  );
};

export default AddPfProductform;
