import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Checkbox, FormControlLabel, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TCountry } from 'pages/WMS/types/country-wms.types';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router';
import countryServiceInstance from 'service/GM/service.country_wms';
import { getPathNameList } from 'utils/functions';
import * as yup from 'yup';

const AddCountryWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TCountry;
}) => {
  //-------------------constants-------------------
  const { user, permissions, user_permission } = useAuth(); // Get user, permissions, and user_permission from auth hook
  const location = useLocation(); // Get current location
  const pathNameList = getPathNameList(location.pathname); // Get path name list
  const { app } = useSelector((state: any) => state.menuSelectionSlice); // Get selected app from state

  const serialNo = permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString(); // Get serial number for permissions

  //------------------formik-----------------
  const formik = useFormik<TCountry>({
    initialValues: { country_name: '', country_code: '', country_gcc: 'N', company_code: user?.company_code }, // Initial form values
    validationSchema: yup.object().shape({
      country_code: yup.string().required('This field is required'), // Validation for country code
      country_name: yup.string().required('This field is required') // Validation for country name
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await countryServiceInstance.editCountry(values); // Edit country if in edit mode
      } else {
        response = await countryServiceInstance.addCountry(values); // Add country if not in edit mode
      }
      if (response) {
        onClose(true); // Close form and refetch data if response is successful
        setSubmitting(false);
      }
    }
  });

  //------------------Handlers------------
  const handleCountryGccChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    formik.setFieldValue('country_gcc', checked ? 'Y' : 'N'); // Handle change for country GCC checkbox
  };

  //------------------useEffect------------
  useEffect(() => {
    if (isEditMode) {
      const { updated_at, updated_by, created_at, created_by, ...countryData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);
      formik.setValues(countryData); // Set form values if in edit mode
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12}>
        <InputLabel>
          <FormattedMessage id="Country Code" />
          <span className="text-red-500">*</span>
        </InputLabel>
        <TextField
          disabled={isEditMode && true} // Disable field if in edit mode
          size="small"
          value={formik.values.country_code}
          name="country_code"
          onChange={formik.handleChange}
          className="w-28"
          error={Boolean(getIn(formik.touched, 'country_code') && getIn(formik.errors, 'country_code'))}
        />
        {getIn(formik.touched, 'country_code') && getIn(formik.errors, 'country_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'country_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>
          <FormattedMessage id="Country Name" />
          <span className="text-red-500">*</span>
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.country_name}
          name="country_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'country_name') && getIn(formik.errors, 'country_name'))}
        />
        {getIn(formik.touched, 'country_name') && getIn(formik.errors, 'country_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'country_name')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
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
      </Grid>
      <Grid item xs={12} className="flex justify-end">
        <Button
          type="submit"
          variant="contained"
          disabled={user_permission?.[serialNo].save === 'N' && formik.isSubmitting} // Disable button if user doesn't have save permission or form is submitting
          startIcon={formik.isSubmitting ? <LoadingOutlined /> : <SaveOutlined />} // Show loading icon if submitting, otherwise show save icon
        >
          <FormattedMessage id="Submit" />
        </Button>
      </Grid>
    </Grid>
  );
};

export default AddCountryWmsForm;
