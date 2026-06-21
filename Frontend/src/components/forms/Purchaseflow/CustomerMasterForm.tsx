import { Button, ButtonGroup, FormHelperText, Grid, TextField } from '@mui/material';
import { useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { useEffect } from 'react';
import * as yup from 'yup';
import ServiceCustomerMasterInstance from 'service/Purchaseflow/service.customer';
import { TcustomerMastertypes } from 'pages/Purchasefolder/type/customer-master-types';
import { showAlert } from 'store/CustomAlert/alertSlice';
import { dispatch } from 'store';
import CustomAlert from 'components/@extended/CustomAlert';
import { IoSendSharp } from 'react-icons/io5';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
const AddCustomerForm = ({
  onClose,
  isEditMode,
  existingData,
  isViewMode
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: boolean;
  isViewMode?: boolean;
  existingData: TcustomerMastertypes;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  console.log('updated_by', user?.updated_by);
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
  //------------------formik-----------------
  const formik = useFormik<TcustomerMastertypes>({
    initialValues: {
      company_code: user?.company_code || '',
      cust_name: '',
      cust_code: '',
      cust_add1: '',
      cust_add2: '',
      cust_add3: '',
      pincode: '',
      phone_number: '',
      email_id: '',
      updated_by: user?.updated_by
    },

    validationSchema: yup.object().shape({
      cust_name: yup.string().required('Customer Name is required').max(30, 'Customer Name cannot exceed 30 characters'),
      cust_add1: yup.string().required('Customer Address 1 is required').max(50, 'Maximum 50 characters allowed'),
      cust_add2: yup.string().required('Customer Address 2 is required').max(50, 'Maximum 50 characters allowed'),
      cust_add3: yup.string().required('Customer Address 3 is required').max(50, 'Maximum 50 characters allowed'),
      pincode: yup.string().required('Pincode is required'),
      phone_number: yup.string().required('Phone number is required'),
      email_id: yup.string().email('Invalid email address').required('Email ID is required')
    }),

    onSubmit: async (values, { setSubmitting }) => {
      try {
        setSubmitting(true);
        let myValues = { ...values };
        myValues = { ...myValues, updated_by: user?.updated_by };

        let response;
        if (isEditMode) {
          console.log('Editing customer:', myValues);
          response = await ServiceCustomerMasterInstance.editCustomerMaster(myValues);
        } else {
          console.log('Adding new customer:', values);
          response = await ServiceCustomerMasterInstance.addCustomerMaster(values);
        }
        const returnValue = await handleAlert(); // Wait for result
        console.log('inside handleConfirm3');

        if (returnValue === 'success') {
          //   await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
          onClose(); // Close the window/dialog
        }
        if (response) {
          dispatch(
            showAlert({
              severity: 'success',
              message: isEditMode ? 'Customer updated successfully!' : 'Customer added successfully!',
              open: true
            })
          );
          onClose?.(true);
        }
      } catch (error: any) {
        console.error('Error submitting customer form:', error);
        dispatch(
          showAlert({
            severity: 'error',
            message: error?.message || 'Something went wrong while submitting the form!',
            open: true
          })
        );
      } finally {
        setSubmitting(false);
      }
    }
  });

  useEffect(() => {
    if (isEditMode || isViewMode) {
      const { updated_at, updated_by, created_at, created_by, ...customerMasterData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(customerMasterData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, existingData, isViewMode]);

  return (
    <Grid container spacing={2} component="form" onSubmit={formik.handleSubmit} className="mt-2 ">
      <Grid item xs={12}>
        <CustomAlert />
      </Grid>

      {/* ************************************ Frist Row ******************************************** */}
      <Grid container spacing={2} sx={{ mb: '20px' }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label={'Customer Name*'}
            name="cust_name"
            value={formik.values.cust_name}
            onChange={formik.handleChange}
            error={Boolean(formik.touched.cust_name && formik.errors.cust_name)}
            fullWidth
            InputProps={{ readOnly: isViewMode }}
          />
          {formik.touched.cust_name && formik.errors.cust_name && <FormHelperText error>{formik.errors.cust_name}</FormHelperText>}
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            disabled={true}
            label={'Customer Code*'}
            name="cust_code"
            value={formik.values.cust_code}
            onChange={formik.handleChange}
            InputProps={{ readOnly: isViewMode }}
            error={Boolean(formik.touched.cust_code && formik.errors.cust_code)}
            fullWidth
          />
          {formik.touched.cust_code && formik.errors.cust_code && <FormHelperText error>{formik.errors.cust_code}</FormHelperText>}
        </Grid>
      </Grid>

      {/* ****************************** Second Row ************************************************* */}

      <Grid container spacing={2} sx={{ mb: '20px' }}>
        <Grid item xs={12} sm={4}>
          <TextField
            InputProps={{ readOnly: isViewMode }}
            label={'Customer Address 1*'}
            name="cust_add1"
            value={formik.values.cust_add1}
            onChange={formik.handleChange}
            error={formik.touched.cust_add1 && Boolean(formik.errors.cust_add1)}
            fullWidth
          />
          {formik.touched.cust_add1 && formik.errors.cust_add1 && <FormHelperText error>{formik.errors.cust_add1}</FormHelperText>}
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            InputProps={{ readOnly: isViewMode }}
            name="cust_add2"
            value={formik.values.cust_add2}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            label={'Customer Address 2*'}
            error={formik.touched.cust_add2 && Boolean(formik.errors.cust_add2)}
            helperText={formik.touched.cust_add2 && formik.errors.cust_add2}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            InputProps={{ readOnly: isViewMode }}
            name="cust_add3"
            value={formik.values.cust_add3}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            fullWidth
            label={'Customer Address 3*'}
            error={formik.touched.cust_add3 && Boolean(formik.errors.cust_add3)}
            helperText={formik.touched.cust_add3 && formik.errors.cust_add3}
          />
        </Grid>
      </Grid>

      {/* ************************** Third row ***************************************** */}
      <Grid container spacing={2} sx={{ mb: '20px' }}>
        <Grid item xs={12} sm={6}>
          <TextField
            InputProps={{ readOnly: isViewMode }}
            label={'Pincode*'}
            name="pincode"
            value={formik.values.pincode}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={Boolean(formik.touched.pincode && formik.errors.pincode)}
            helperText={formik.touched.pincode && formik.errors.pincode}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            InputProps={{ readOnly: isViewMode }}
            label={'Phone Number*'}
            name="phone_number"
            value={formik.values.phone_number}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur} // Ensure validation triggers on blur
            error={Boolean(formik.touched.phone_number && formik.errors.phone_number)}
            helperText={formik.touched.phone_number && formik.errors.phone_number}
            fullWidth
          />
        </Grid>
      </Grid>

      {/* ********************************* Fourth Row ****************************************** */}
      <Grid container spacing={2} sx={{ mb: '20px' }}>
        <Grid item xs={12} sm={12}>
          <TextField
            InputProps={{ readOnly: isViewMode }}
            label={'Email 1*'}
            name="email_id"
            value={formik.values.email_id}
            onChange={formik.handleChange}
            error={Boolean(formik.touched.email_id && formik.errors.email_id)}
            fullWidth
          />
          {formik.touched.email_id && formik.errors.email_id && <FormHelperText error>{formik.errors.email_id}</FormHelperText>}
        </Grid>
      </Grid>

      {/* *********************************Submit Button ******************************************** */}

      <Grid item xs={12} className="flex justify-start">
        {isViewMode ? (
          ''
        ) : (
          <ButtonGroup>
            <Button
              type="submit"
              variant="outlined"
              size="small"
              disabled={formik.isSubmitting}
              startIcon={formik.isSubmitting}
              endIcon={<IoSendSharp />}
            >
              Submit
            </Button>
          </ButtonGroup>
        )}
      </Grid>
    </Grid>
  );
};

export default AddCustomerForm;
