import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { Tsalesman } from 'pages/WMS/types/salesman-wms.types';
import { useEffect } from 'react';
//import GmServiceInstance from 'service/wms/services.gm_wms';
import salesmanServiceInstance from 'service/GM/service.salesman_wms';
import * as yup from 'yup';

const AddSalesmanWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: Tsalesman;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  //------------------formik-----------------
  const formik = useFormik<Tsalesman>({
    initialValues: { company_code: user?.company_code, salesman_code: '', salesman_name: '' },
    validationSchema: yup.object().shape({
      // country_code: yup.string().required('This field is required'),
      salesman_name: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await salesmanServiceInstance.editsalesman(values);
      } else {
        response = await salesmanServiceInstance.addSalesman(values);
      }
      if (response) {
        onClose(true);
        setSubmitting(false);
      }
    }
  });
  useEffect(() => {
    console.log(formik.errors);
  }, [formik.errors]);
  //------------------Handlers------------
  // const handleCountryGccChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
  //   formik.setFieldValue('country_gcc', checked ? 'Y' : 'N');
  // };
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
      <Grid item xs={12} sm={3}>
        <InputLabel>Salesman Code*</InputLabel>
        <TextField
          value={formik.values.salesman_code}
          name="salesman_code"
          disabled={isEditMode === true}
          onChange={formik.handleChange}
          // className="w-28"
          error={Boolean(getIn(formik.touched, 'salesman_code"') && getIn(formik.errors, 'salesman_code"'))}
        />
        {getIn(formik.touched, 'salesman_code') && getIn(formik.errors, 'salesman_code"') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'salesman_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={9}>
        <InputLabel>Salesman Name*</InputLabel>
        <TextField
          value={formik.values.salesman_name}
          name="salesman_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'salesman_name') && getIn(formik.errors, 'salesman_name'))}
        />
        {getIn(formik.touched, 'salesman_name') && getIn(formik.errors, 'salesman_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'salesman_name')}
          </FormHelperText>
        )}
      </Grid>
      {/* <Grid item xs={12} sm={6} md={3}>
        <InputLabel>Is gcc?</InputLabel>
        <FormControlLabel
          control={<Checkbox onChange={handleCountryGccChange} />}
          checked={formik.values.country_gcc === 'Y'}
          name="country_gcc"
          label={'Yes/No'}
          value={formik.values.country_gcc}
        />
      </Grid> */}
      <Grid item xs={12} className="flex justify-end">
        <Button
          type="submit"
          // variant="contained"
          sx={{
            fontSize: '0.895rem',
            backgroundColor: '#fff',
            color: '#082A89',
            border: '1.5px solid #082A89',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#082A89',
              color: '#fff',
              border: '1.5px solid #082A89'
            }
          }}
          disabled={formik.isSubmitting}
          startIcon={formik.isSubmitting ? <LoadingOutlined /> : <SaveOutlined />}
        >
          Submit
        </Button>
      </Grid>
    </Grid>
  );
};
export default AddSalesmanWmsForm;
