import { Autocomplete, Button, FormHelperText, Grid, InputLabel, Stack, TextField, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getIn, useFormik } from 'formik';
import { TCountry } from 'pages/WMS/types/country-wms.types';
import { TDivision } from 'pages/WMS/types/division-wms.types';
import { useEffect } from 'react';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useSelector } from 'store';
import * as yup from 'yup';

const BasicDivisionInfoWmsForm = ({
  handleNext,
  isEditMode,
  basicInfo,
  setBasicInfo
}: {
  handleNext: () => void;
  isEditMode: boolean;
  basicInfo: TDivision;
  setBasicInfo: (value: TDivision) => void;
}) => {
  const { app } = useSelector((state) => state.menuSelectionSlice);

  const formik = useFormik<TDivision>({
    initialValues: basicInfo,
    validationSchema: yup.object().shape({
      div_name: yup.string().required('This field is required'),
      div_code: yup.string().required('This field is required')
    }),
    onSubmit: async (values) => {
      setBasicInfo(values);
      handleNext();
    }
  });

  const { data: countryList, isLoading } = useQuery({
    queryKey: ['country_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters(app, 'country');
      return response ? { tableData: response.tableData as TCountry[], count: response.count } : { tableData: [], count: 0 };
    }
  });

  useEffect(() => {
    if (basicInfo && Object.keys(basicInfo).length) {
      formik.setValues(basicInfo);
    }
  }, [basicInfo]);

  return (
    <Grid container spacing={6} component={'form'} onSubmit={formik.handleSubmit}>
      {/* Sales/Company Information */}
      <Grid item xs={12} sm={6}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h4" className="text-black py-2 font-semibold">
              Sales/Company Information
            </Typography>
          </Grid>
          {/* Prin Code */}
          <Grid item xs={12} sm={6} hidden={!isEditMode}>
            <InputLabel>Code</InputLabel>
            <TextField
              size="small"
              name="div_code"
              fullWidth
              disabled
              value={formik.values.div_code}
              error={getIn(formik.touched, 'div_code') && Boolean(getIn(formik.errors, 'div_code'))}
            />
            <FormHelperText error>{getIn(formik.touched, 'div_code') && getIn(formik.errors, 'div_code')}</FormHelperText>
          </Grid>
          {/* Name */}
          <Grid item xs={12} sm={6}>
            <InputLabel>Name*</InputLabel>
            <TextField
              size="small"
              onChange={formik.handleChange}
              name="div_name"
              fullWidth
              value={formik.values.div_name}
              error={getIn(formik.touched, 'div_name') && Boolean(getIn(formik.errors, 'div_name'))}
            />
            <FormHelperText error>{getIn(formik.touched, 'div_name') && getIn(formik.errors, 'div_name')}</FormHelperText>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {/* Short Name */}
              <Grid item xs={12} sm={6}>
                <InputLabel>Short Desc 1</InputLabel>
                <TextField
                  size="small"
                  onChange={formik.handleChange}
                  id="div_short_name"
                  name="div_short_name"
                  fullWidth
                  value={formik.values.div_short_name}
                />
              </Grid>
              {/* Country */}
              <Grid item xs={12} sm={6}>
                <InputLabel>Country*</InputLabel>
                <Autocomplete
                  id="country_code"
                  value={
                    formik.values.country_code
                      ? countryList?.tableData.find((eachCountry) => eachCountry.country_code === formik.values.country_code) || null
                      : null
                  }
                  onChange={(event, value: TCountry | null) => {
                    formik.setFieldValue('country_code', value?.country_code || '');
                  }}
                  size="small"
                  options={countryList?.tableData ?? []}
                  fullWidth
                  autoHighlight
                  getOptionLabel={(option) => option?.country_name || ''}
                  isOptionEqualToValue={(option, value) => option.country_code === value.country_code}
                  renderInput={(params) => (
                    <TextField {...params} error={getIn(formik.touched, 'country_code') && Boolean(getIn(formik.errors, 'country_code'))} />
                  )}
                />
                <FormHelperText error>{getIn(formik.touched, 'country_code') && getIn(formik.errors, 'country_code')}</FormHelperText>
              </Grid>
              {/* Company Fax 1 */}
              <Grid item xs={12} sm={4}>
                <InputLabel>Company Fax 1</InputLabel>
                <TextField size="small" onChange={formik.handleChange} id="fax" name="fax" fullWidth value={formik.values.fax} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Stack direction="row" justifyContent="end">
          <Button variant="contained" type="submit" sx={{ my: 1, ml: 1 }} disabled={isLoading}>
            Next
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default BasicDivisionInfoWmsForm;
