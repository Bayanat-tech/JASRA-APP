import { Button, ButtonGroup, FormHelperText, Grid, InputLabel, Tooltip } from '@mui/material';
import TextField from '@mui/material/TextField';
import CustomAlert from 'components/@extended/CustomAlert';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TMatrialCateogrymst } from 'pages/Purchasefolder/type/CatMatmaster-pf-types';
import { useEffect } from 'react';
import { ImExit } from 'react-icons/im';
import { IoSendSharp } from 'react-icons/io5';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import { dispatch } from 'store';
import { showAlert } from 'store/CustomAlert/alertSlice';
import * as yup from 'yup';

const AddMatCategorymasterPfForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: boolean;
  existingData?: TMatrialCateogrymst;
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
  const formik = useFormik<TMatrialCateogrymst>({
    initialValues: {
      mater_category_code: '',
      mater_category_desp: '',
      company_code: user?.company_code ?? '',
      updated_by: user?.updated_by ?? ''
    },
    validationSchema: yup.object().shape({
      mater_category_code: yup.string().required('This field is required'),
      mater_category_desp: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      try {
        if (isEditMode) {
          await GmPfServiceInstance.ediTMatrialCateogrymst(values);
        } else {
          await GmPfServiceInstance.ediTMatrialCateogrymst(values);
        }
        const returnValue = await handleAlert(); // Wait for result
        console.log('inside handleConfirm3');

        if (returnValue === 'success') {
          //   await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait 10 seconds
          onClose(); // Close the window/dialog
        }

        // Since the service returns void, always show success unless an error is thrown
        dispatch(
          showAlert({
            open: true,
            message: isEditMode ? 'Cost master updated successfully!' : 'Cost master added successfully!',
            severity: 'success'
          })
        );
        onClose(true);
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

  useEffect(() => {
    if (isEditMode && existingData) {
      const { updated_at, updated_by, created_at, created_by, ...costmasterData } = existingData;

      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues({
        ...costmasterData,
        mater_category_code: costmasterData.mater_category_code ?? '',
        mater_category_desp: costmasterData.mater_category_desp ?? '',
        company_code: user?.company_code ?? '',
        updated_by: user?.updated_by ?? ''
      });
    }
  }, [isEditMode, existingData, user?.company_code, user?.updated_by, formik]);

  return (
    <Grid container spacing={2} component="form" onSubmit={formik.handleSubmit}>
      <Grid item xs={12}>
        <CustomAlert />
        <InputLabel>Material Category Code*</InputLabel>
        <TextField
          value={formik.values.mater_category_code}
          name="mater_category_code"
          onChange={formik.handleChange}
          disabled={!!isEditMode}
          className="w-28"
          error={Boolean(getIn(formik.touched, 'mater_category_code') && getIn(formik.errors, 'mater_category_code'))}
        />
        {getIn(formik.touched, 'mater_category_code') && getIn(formik.errors, 'mater_category_code') && (
          <FormHelperText error>{getIn(formik.errors, 'mater_category_code')}</FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={5}>
        <InputLabel>Material Category Description*</InputLabel>
        <TextField
          value={formik.values.mater_category_desp}
          name="mater_category_desp"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'mater_category_desp') && getIn(formik.errors, 'mater_category_desp'))}
        />
        {getIn(formik.touched, 'mater_category_desp') && getIn(formik.errors, 'mater_category_desp') && (
          <FormHelperText error>{getIn(formik.errors, 'mater_category_desp')}</FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} className="flex justify-start">
        <ButtonGroup>
          <Button type="submit" size="small" variant="outlined" disabled={formik.isSubmitting} endIcon={<IoSendSharp />}>
            Submit
          </Button>
        </ButtonGroup>
      </Grid>

      <Grid item xs={12} className="flex justify-end">
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

export default AddMatCategorymasterPfForm;
