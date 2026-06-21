import { Button, FormHelperText, Grid } from '@mui/material';
import TextField from '@mui/material/TextField';
import CustomAlert from 'components/@extended/CustomAlert';
import { getIn, useFormik } from 'formik';
import { useEffect } from 'react';
import { IoSendSharp } from 'react-icons/io5';
import GmSecServiceInstance from 'service/security/services.gm_security';
import { dispatch } from 'store';
import { showAlert } from 'store/CustomAlert/alertSlice';
import * as yup from 'yup';
import { TQuerymaster } from 'pages/Security/type/querymaster-sec.types';

const AddQuerySecForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TQuerymaster;
}) => {
  //-------------------constants-------------------
  //------------------formik-----------------
  const formik = useFormik<TQuerymaster>({
    initialValues: { COMPANY_CODE: '', PARAMETER: '', SQL_STRING: '', STRING1: '', STRING2: '', STRING3: '', STRING4: '', USTRING1: '', USTRING2: '', USTRING3: '', USTRING4: '',  USTRING5: '', USTRING6: '', ORDER_BY: '' },
    validationSchema: yup.object().shape({
      // Add validation rules here if needed
      COMPANY_CODE: yup.string().required('This field is required'),
      PARAMETER: yup.string().required('This field is required'),
      SQL_STRING: yup.string().required('This field is required') 
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      try {
        if (isEditMode) {
          response = await GmSecServiceInstance.editquerymaster(values);
        } else {
          response = await GmSecServiceInstance.addquerymaster(values);
        }

        if (response) {
          dispatch(
            showAlert({
              open: true,
              message: isEditMode ? 'Transaction updated successfully!' : 'Transaction added successfully!',
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
        console.error('Error in company master operation:', error);
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
          label="Company Code"
          value={formik.values.COMPANY_CODE}
          name="COMPANY_CODE"
          disabled={isEditMode === true}
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'COMPANY_CODE') && getIn(formik.errors, 'COMPANY_CODE'))}
        />
        {getIn(formik.touched, 'COMPANY_CODE') && getIn(formik.errors, 'COMPANY_CODE') && (
          <FormHelperText error id="helper-text-COMPANY_CODE">
            {getIn(formik.errors, 'COMPANY_CODE')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Parameter"
          value={formik.values.PARAMETER}
          name="PARAMETER"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'PARAMETER') && getIn(formik.errors, 'PARAMETER'))}
        />
        {getIn(formik.touched, 'PARAMETER') && getIn(formik.errors, 'PARAMETER') && (
          <FormHelperText error id="helper-text-PARAMETER">
            {getIn(formik.errors, 'PARAMETER')}
          </FormHelperText>
        )}
      </Grid>
       <Grid item xs={12} sm={6}>
        <TextField
          label="Order By"
          value={formik.values.ORDER_BY}
          name="ORDER_BY"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'ORDER_BY') && getIn(formik.errors, 'ORDER_BY'))}
        />
        {getIn(formik.touched, 'ORDER_BY') && getIn(formik.errors, 'ORDER_BY') && (
          <FormHelperText error id="helper-text-ORDER_BY">
            {getIn(formik.errors, 'ORDER_BY')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} >
        <TextField
          label="SQL_STRING"
          value={formik.values.SQL_STRING}
          name="SQL_STRING"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'SQL_STRING') && getIn(formik.errors, 'SQL_STRING'))}
        />
        {getIn(formik.touched, 'SQL_STRING') && getIn(formik.errors, 'SQL_STRING') && (
          <FormHelperText error id="helper-text-SQL_STRING">
            {getIn(formik.errors, 'SQL_STRING')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="String 1"
          value={formik.values.STRING1}
          name="STRING1"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'STRING1') && getIn(formik.errors, 'STRING1'))}
        />
        {getIn(formik.touched, 'STRING1') && getIn(formik.errors, 'STRING1') && (
          <FormHelperText error id="helper-text-STRING1">
            {getIn(formik.errors, 'STRING1')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="String 2"
          value={formik.values.STRING2}
          name="STRING2"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'STRING2') && getIn(formik.errors, 'STRING2'))}
        />
        {getIn(formik.touched, 'STRING2') && getIn(formik.errors, 'STRING2') && (
          <FormHelperText error id="helper-text-STRING2">
            {getIn(formik.errors, 'STRING2')}
          </FormHelperText>
        )}
        </Grid>
        <Grid item xs={12} sm={6}>
        <TextField
          label="String 3"
          value={formik.values.STRING3}
          name="STRING3"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'STRING3') && getIn(formik.errors, 'STRING3'))}
        />
        {getIn(formik.touched, 'STRING3') && getIn(formik.errors, 'STRING3') && (
          <FormHelperText error id="helper-text-STRING3">
            {getIn(formik.errors, 'STRING3')}
          </FormHelperText>
        )}
        </Grid>
    <Grid item xs={12} sm={6}>
        <TextField
          label="String 4"
          value={formik.values.STRING4}
          name="STRING4"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'STRING4') && getIn(formik.errors, 'STRING4'))}
        />
        {getIn(formik.touched, 'STRING4') && getIn(formik.errors, 'STRING4') && (
          <FormHelperText error id="helper-text-STRING4">
            {getIn(formik.errors, 'STRING4')}
          </FormHelperText>
        )}
        </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="UString 1"
          value={formik.values.USTRING1}
          name="USTRING1"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'USTRING1') && getIn(formik.errors, 'USTRING1'))}
        />
        {getIn(formik.touched, 'USTRING1') && getIn(formik.errors, 'USTRING1') && (
          <FormHelperText error id="helper-text-USTRING1">
            {getIn(formik.errors, 'USTRING1')}
          </FormHelperText>
        )}
        </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="UString 2"
          value={formik.values.USTRING2}
          name="USTRING2"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'USTRING2') && getIn(formik.errors, 'USTRING2'))}
        />
        {getIn(formik.touched, 'USTRING2') && getIn(formik.errors, 'USTRING2') && (
          <FormHelperText error id="helper-text-USTRING2">
            {getIn(formik.errors, 'USTRING2')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="UString 3"
          value={formik.values.USTRING3}
          name="USTRING3"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'USTRING3') && getIn(formik.errors, 'USTRING3'))}
        />
        {getIn(formik.touched, 'USTRING3') && getIn(formik.errors, 'USTRING3') && (
          <FormHelperText error id="helper-text-USTRING3">
            {getIn(formik.errors, 'USTRING3')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="UString 4"
          value={formik.values.USTRING4}
          name="USTRING4"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'USTRING4') && getIn(formik.errors, 'USTRING4'))}
        />
        {getIn(formik.touched, 'USTRING4') && getIn(formik.errors, 'USTRING4') && (
          <FormHelperText error id="helper-text-USTRING4">
            {getIn(formik.errors, 'USTRING4')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="UString 5"
          value={formik.values.USTRING5}
          name="USTRING5"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'USTRING5') && getIn(formik.errors, 'USTRING5'))}
        />
        {getIn(formik.touched, 'USTRING5') && getIn(formik.errors, 'USTRING5') && (
          <FormHelperText error id="helper-text-USTRING5">
            {getIn(formik.errors, 'USTRING5')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="UString 6"
          value={formik.values.USTRING6}
          name="USTRING6"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'USTRING6') && getIn(formik.errors, 'USTRING6'))}
        />
        {getIn(formik.touched, 'USTRING6') && getIn(formik.errors, 'USTRING6') && (
          <FormHelperText error id="helper-text-USTRING6">
            {getIn(formik.errors, 'USTRING6')}
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

export default AddQuerySecForm;
