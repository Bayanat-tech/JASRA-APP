import { Button, FormHelperText, Grid } from '@mui/material';
import TextField from '@mui/material/TextField';
import CustomAlert from 'components/@extended/CustomAlert';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TFlowmaster } from 'pages/Security/type/flowmaster-sec-types';
import { useEffect } from 'react';
import { IoSendSharp } from 'react-icons/io5';
import GmSecServiceInstance from 'service/security/services.gm_security';
import { dispatch } from 'store';
import { showAlert } from 'store/CustomAlert/alertSlice';
import * as yup from 'yup';

const AddFlowmasterSecForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TFlowmaster;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  //------------------formik-----------------
  const formik = useFormik<TFlowmaster>({
    initialValues: { flow_description: '', flow_code: '', company_code: user?.company_code },
    validationSchema: yup.object().shape({
      // flow_code: yup.string().required('This field is required'),
      flow_description: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      try {
        if (isEditMode) {
          response = await GmSecServiceInstance.editFlowmaster(values);
        } else {
          response = await GmSecServiceInstance.addFlowmaster(values);
        }

        if (response) {
          dispatch(
            showAlert({
              open: true,
              message: isEditMode ? 'Flow master updated successfully!' : 'Flow master added successfully!',
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
        console.error('Error in flow master operation:', error);
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
    }
  });

  useEffect(() => {
    if (isEditMode) {
      const { updated_at, updated_by, created_at, created_by, ...flowmasterData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(flowmasterData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12}>
        <CustomAlert />
        <TextField
          label="Flow Code*"
          value={formik.values.flow_code}
          name="flow_code"
          disabled
          onChange={formik.handleChange}
          className="w-28"
          error={Boolean(getIn(formik.touched, 'flow_code') && getIn(formik.errors, 'flow_code'))}
        />
        {getIn(formik.touched, 'flow_code') && getIn(formik.errors, 'flow_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'flow_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Flow Name*"
          value={formik.values.flow_description}
          name="flow_description"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'flow_description') && getIn(formik.errors, 'flow_description'))}
        />
        {getIn(formik.touched, 'flow_description') && getIn(formik.errors, 'flow_description') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'flow_description')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} className="flex justify-start">
        <Button
          variant="outlined"
          color="primary"
          size="small"
          endIcon={<IoSendSharp />}
          type="submit"
          disabled={formik.isSubmitting}
          startIcon={formik.isSubmitting}
        >
          Submit
        </Button>
      </Grid>
    </Grid>
  );
};
export default AddFlowmasterSecForm;
