import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import CustomAlert from 'components/@extended/CustomAlert';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TCostmaster } from 'pages/Purchasefolder/type/costmaster-pf-types';
import { useEffect } from 'react';
import { IoSendSharp } from 'react-icons/io5';
import GmPfServiceInstance from 'service/Purchaseflow/services.purchaseflow';
import { dispatch } from 'store';
import { showAlert } from 'store/CustomAlert/alertSlice';
import * as yup from 'yup';

const AddCostmasterPfForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: boolean;
  existingData?: TCostmaster;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();

  //------------------formik-----------------
  const formik = useFormik<TCostmaster>({
    initialValues: {
      cost_code: '',
      cost_name: '',
      company_code: user?.company_code ?? '',
      updated_by: user?.updated_by ?? '',
      id: undefined
    },
    validationSchema: yup.object().shape({
      cost_code: yup.string().required('This field is required'),
      cost_name: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);

      try {
        let response;
        if (isEditMode) {
          response = await GmPfServiceInstance.editCostmaster(values);
        } else {
          response = await GmPfServiceInstance.addCostmaster(values);
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

  // Set form values when in edit mode
  useEffect(() => {
    if (isEditMode && existingData) {
      const { ...costmasterData } = existingData;

      formik.setValues({
        ...costmasterData,
        cost_code: costmasterData.cost_code ?? '',
        cost_name: costmasterData.cost_name ?? '',
        company_code: user?.company_code ?? '',
        updated_by: user?.updated_by ?? ''
      });
    }
  }, [isEditMode, existingData, user?.company_code, user?.updated_by]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12}>
        <CustomAlert />
      </Grid>

      <Grid item xs={12}>
        <InputLabel>Cost Code*</InputLabel>
        <TextField
          value={formik.values.cost_code}
          name="cost_code"
          onChange={formik.handleChange}
          className="w-28"
          error={Boolean(getIn(formik.touched, 'cost_code') && getIn(formik.errors, 'cost_code'))}
        />
        {getIn(formik.touched, 'cost_code') && getIn(formik.errors, 'cost_code') && (
          <FormHelperText error id="helper-text-cost-code">
            {getIn(formik.errors, 'cost_code')}
          </FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={5}>
        <InputLabel>Cost Name*</InputLabel>
        <TextField
          value={formik.values.cost_name}
          name="cost_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'cost_name') && getIn(formik.errors, 'cost_name'))}
        />
        {getIn(formik.touched, 'cost_name') && getIn(formik.errors, 'cost_name') && (
          <FormHelperText error id="helper-text-cost-name">
            {getIn(formik.errors, 'cost_name')}
          </FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} className="flex justify-end">
        <Button type="submit" variant="contained" disabled={formik.isSubmitting} endIcon={<IoSendSharp />}>
          Submit
        </Button>
      </Grid>
    </Grid>
  );
};

export default AddCostmasterPfForm;
