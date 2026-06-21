import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import useAuth from 'hooks/useAuth';
import { Tlocationtype } from 'pages/WMS/types/locationtype-wms.types';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import locationtypeServiceInstance from 'service/GM/service.locationtype_wms';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import * as yup from 'yup';

const AddLocationTypeWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: Tlocationtype;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  //------------------formik-----------------
  const formik = useFormik<Tlocationtype>({
    initialValues: {
      loc_type: '',
      loc_cbm: null as unknown as number,
      loc_wt: null as unknown as number,
      push_level: '',
      user_id: null as unknown as number,
      user_dt: null as unknown as Date,
      loc_name: '',
      company_code: user?.company_code
    },
    validationSchema: yup.object().shape({
      loc_cbm: yup.number().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await locationtypeServiceInstance.editLocationtype(values);
      } else {
        response = await locationtypeServiceInstance.addLocationtype(values);
      }
      if (response) {
        onClose(true);
        setSubmitting(false);
      }
    }
  });
  //------------------useEffect------------

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
      <Grid item xs={12} sm={5}>
        <InputLabel>
          <FormattedMessage id="Location type" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.loc_type}
          name="loc_type"
          onChange={formik.handleChange}
          className="w-28"
          error={Boolean(getIn(formik.touched, 'loc_type') && getIn(formik.errors, 'loc_type'))}
        />
        {getIn(formik.touched, 'loc_type') && getIn(formik.errors, 'loc_type') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'loc_type')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>
          <FormattedMessage id="Location cbm" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.loc_cbm}
          name="loc_cbm"
          onChange={formik.handleChange}
          className="w-28"
          error={Boolean(getIn(formik.touched, 'loc_cbm') && getIn(formik.errors, 'loc_cbm'))}
        />
        {getIn(formik.touched, 'loc_cbm') && getIn(formik.errors, 'loc_cbm') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'loc_cbm')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>
          <FormattedMessage id="Location weight" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.loc_wt}
          name="loc_wt"
          onChange={formik.handleChange}
          className="w-28"
          error={Boolean(getIn(formik.touched, 'loc_wt') && getIn(formik.errors, 'loc_wt'))}
        />
        {getIn(formik.touched, 'loc_wt') && getIn(formik.errors, 'loc_wt') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'loc_wt')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>
          <FormattedMessage id="Push Level" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.push_level}
          name="push_level"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'push_level') && getIn(formik.errors, 'push_level'))}
        />
        {getIn(formik.touched, 'push_level') && getIn(formik.errors, 'push_level') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'push_level')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>
          <FormattedMessage id="User Id" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.user_id}
          name="user_id"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'user_id') && getIn(formik.errors, 'user_id'))}
        />
        {getIn(formik.touched, 'user_id') && getIn(formik.errors, 'user_id') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'user_id')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        {/* <InputLabel>
          <FormattedMessage id="User date" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.user_dt}
          name="user_dt"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'user_dt') && getIn(formik.errors, 'user_dt'))}
        />
        {getIn(formik.touched, 'user_dt') && getIn(formik.errors, 'user_dt') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'user_dt')}
          </FormHelperText>
        )} */}

        <Grid item xs={12} sm={6}>
          <InputLabel>User date</InputLabel>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              value={formik.values.user_dt ? dayjs(formik.values.user_dt) : dayjs()}
              name="user_dt"
              onChange={(newValue) => formik.handleChange('user_dt')}
            />
            {getIn(formik.touched, 'user_dt') && getIn(formik.errors, 'user_dt') && (
              <FormHelperText error id="helper-text-first_name">
                {getIn(formik.errors, 'user_dt')}
              </FormHelperText>
            )}
          </LocalizationProvider>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>
          <FormattedMessage id="Location Name" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.loc_name}
          name="loc_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'loc_name') && getIn(formik.errors, 'loc_name'))}
        />
        {getIn(formik.touched, 'loc_name') && getIn(formik.errors, 'loc_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'loc_name')}
          </FormHelperText>
        )}
      </Grid>
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
          <FormattedMessage id="Submit" />
        </Button>
      </Grid>
    </Grid>
  );
};
export default AddLocationTypeWmsForm;
