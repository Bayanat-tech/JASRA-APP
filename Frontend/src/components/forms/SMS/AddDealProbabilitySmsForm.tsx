import { Button, FormHelperText, Grid } from '@mui/material';
import TextField from '@mui/material/TextField';
import CustomAlert from 'components/@extended/CustomAlert';
import { getIn, useFormik } from 'formik';
import { TSmsProbabilitymaster } from 'types/SMS/sms.types';
import { useEffect } from 'react';
import { IoSendSharp } from 'react-icons/io5';
import { dispatch } from 'store';
import { showAlert } from 'store/CustomAlert/alertSlice';
import * as yup from 'yup';
import SmscompanyServiceInstance from 'service/SMS/Service.SMSmaster';

const AddDealProbabilitySmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TSmsProbabilitymaster;
}) => {
  //-------------------constants-------------------
  //------------------formik-----------------
  const formik = useFormik<TSmsProbabilitymaster>({
    initialValues: { deal_probability: '' },
    validationSchema: yup.object().shape({
      // validation
      deal_probability: yup.string().required('This feild is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      try {
        if (isEditMode) {
          response = await SmscompanyServiceInstance.editprobabilitymaster(values);
        } else {
          response = await SmscompanyServiceInstance.addprobabilitymaster(values);
        }

        if (response) {
          dispatch(
            showAlert({
              open: true,
              message: isEditMode ? 'Deal probability updated successfully!' : 'Deal Probability added successfully!',
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
        console.error('Error in Probability master operation:', error);
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
    console.log(formik.errors);
  }, [formik.errors]);

  //------------------Handlers------------
  useEffect(() => {
    if (isEditMode) {
      const { updated_at, updated_by, created_at, created_by, ...countryData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(countryData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12}>
        <CustomAlert />
        <TextField
          label="Deal Probability*"
          value={formik.values.deal_probability}
          name="deal_probability"
          //disabled={isEditMode === true}
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'deal_probability') && getIn(formik.errors, 'deal_probability'))}
        />
        {getIn(formik.touched, 'deal_probability') && getIn(formik.errors, 'deal_probability') && (
          <FormHelperText error id="helper-text-deal_probability">
            {getIn(formik.errors, 'deal_probability')}
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

export default AddDealProbabilitySmsForm;
