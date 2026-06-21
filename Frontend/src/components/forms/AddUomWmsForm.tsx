import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
//import { Button, Checkbox, FormControlLabel, FormHelperText, Grid, InputLabel } from '@mui/material';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TUom } from 'pages/WMS/types/uom-wms.type';
import { useEffect } from 'react';
import GmServiceInstance from 'service/wms/services.gm_wms';
import * as yup from 'yup';

const AddUomWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TUom;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  //------------------formik-----------------
  const formik = useFormik<TUom>({
    initialValues: { uom_name: '', uom_code: '', company_code: user?.company_code },
    validationSchema: yup.object().shape({
      uom_code: yup.string().required('This field is required'),
      uom_name: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await GmServiceInstance.editUom(values);
      } else {
        response = await GmServiceInstance.addUom(values);
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
  //   //------------------Handlers------------
  //   const handleCountryGccChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
  //     formik.setFieldValue('country_gcc', checked ? 'Y' : 'N');
  //   };
  useEffect(() => {
    if (isEditMode) {
      const { updated_at, updated_by, created_at, created_by, ...countryData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(countryData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={1} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12}>
        <InputLabel>Uom Code*</InputLabel>
        <TextField
          value={formik.values.uom_code}
          name="uom_code"
          fullWidth
          onChange={formik.handleChange}
          // className="w-28"
          error={Boolean(getIn(formik.touched, 'uom_code') && getIn(formik.errors, 'uom_code'))}
        />
        {getIn(formik.touched, 'uom_code') && getIn(formik.errors, 'uom_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'uom_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12}>
        <InputLabel>Description*</InputLabel>
        <TextField
          value={formik.values.uom_name}
          name="uom_name"
          onChange={formik.handleChange}
          fullWidth
          // fullWidth
          error={Boolean(getIn(formik.touched, 'uom_name') && getIn(formik.errors, 'uom_name'))}
        />
        {getIn(formik.touched, 'uom_name') && getIn(formik.errors, 'uom_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'uom_name')}
          </FormHelperText>
        )}
      </Grid>
      {/* 
      <Grid item xs={12} sm={6} md={3}>
        <InputLabel>Is gcc?</InputLabel>
        <FormControlLabel
          control={<Checkbox onChange={handleCountryGccChange} />}
          checked={formik.values.country_gcc === 'Y'}
          name="country_gcc"
          label={'Yes/No'}
          value={formik.values.country_gcc}
        />
      </Grid>
       */}
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
export default AddUomWmsForm;
