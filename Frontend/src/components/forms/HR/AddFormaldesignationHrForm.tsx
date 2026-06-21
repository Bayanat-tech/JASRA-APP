import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
//import { TCountry } from 'pages/WMS/types/country-wms.types';
import { TFormalDesignation } from 'pages/HR/type/formaldesignation-hr.types';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
//import countryServiceInstance from 'service/GM/service.country_wms';
import formaldesignationServiceInstance from 'service/HR/service.formaldesignation_hr';

import * as yup from 'yup';

const AddFormaldesignationHrForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TFormalDesignation;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  //------------------formik-----------------
  const formik = useFormik<TFormalDesignation>({
    initialValues: {
      labour_desg_code: '',
      labour_desg_name: '',
      labour_desg_short_name: '',
      remarks: '',
      status: '',
      company_code: user?.company_code
    },
    validationSchema: yup.object().shape({
      labour_desg_code: yup.string().required('This field is required'),
      labour_desg_short_name: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await formaldesignationServiceInstance.editFormaldesignation(values);
      } else {
        response = await formaldesignationServiceInstance.addFormaldesignation(values);
      }
      if (response) {
        onClose(true);
        setSubmitting(false);
      }
    }
  });
  //------------------Handlers------------
  // const handleCountryGccChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
  //   formik.setFieldValue('country_gcc', checked ? 'Y' : 'N');
  // };

  //------------------useEffect------------

  useEffect(() => {
    if (isEditMode) {
      const { updated_at, updated_by, created_at, created_by, ...formaldesignationData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(formaldesignationData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12} sm={4}>
        <InputLabel>
          <FormattedMessage id="Labour desg Code" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.labour_desg_code}
          name="labour_desg_code"
          fullWidth
          onChange={formik.handleChange}
          error={Boolean(getIn(formik.touched, 'labour_desg_code') && getIn(formik.errors, 'labour_desg_code'))}
        />
        {getIn(formik.touched, 'labour_desg_code') && getIn(formik.errors, 'labour_desg_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'labour_desg_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={8}>
        <InputLabel>
          <FormattedMessage id="Name" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.labour_desg_name}
          name="labour_desg_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'labour_desg_name') && getIn(formik.errors, 'labour_desg_name'))}
        />
        {getIn(formik.touched, 'labour_desg_name') && getIn(formik.errors, 'labour_desg_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'labour_desg_name')}
          </FormHelperText>
        )}
      </Grid>
      {/* <Grid item xs={12} sm={6} md={3}>
        <InputLabel>
          <FormattedMessage id="Is gcc?" />
        </InputLabel>
        <FormControlLabel
          control={<Checkbox onChange={handleCountryGccChange} />}
          checked={formik.values.country_gcc === 'Y'}
          name="country_gcc"
          label={<FormattedMessage id="Yes/No" />}
          value={formik.values.country_gcc}
        />
      </Grid> */}
      <Grid item xs={12} sm={4}>
        <InputLabel>
          <FormattedMessage id="Short Name" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.labour_desg_short_name}
          name="labour_desg_short_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'labour_desg_short_name') && getIn(formik.errors, 'labour_desg_short_name'))}
        />
        {getIn(formik.touched, 'labour_desg_short_name') && getIn(formik.errors, 'labour_desg_short_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'labour_desg_short_name')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={8}>
        <InputLabel>
          <FormattedMessage id="Remarks" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.remarks}
          name="remarks"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'remarks') && getIn(formik.errors, 'remarks'))}
        />
        {getIn(formik.touched, 'remarks') && getIn(formik.errors, 'remarks') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'remarks')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={4}>
        <InputLabel>Status</InputLabel>
        <Select value={formik.values.status} onChange={(e) => formik.setFieldValue('status', e.target.value)} fullWidth>
          <MenuItem value="O">Active</MenuItem>
          <MenuItem value="C">Inactive</MenuItem>
        </Select>
        {formik.touched.status && formik.errors.status && <FormHelperText error>{formik.errors.status}</FormHelperText>}
      </Grid>
      <Grid item xs={12} className="flex justify-end">
        <Button
          type="submit"
          variant="contained"
          disabled={formik.isSubmitting}
          startIcon={formik.isSubmitting ? <LoadingOutlined /> : <SaveOutlined />}
        >
          <FormattedMessage id="Submit" />
        </Button>
      </Grid>
    </Grid>
  );
};
export default AddFormaldesignationHrForm;
