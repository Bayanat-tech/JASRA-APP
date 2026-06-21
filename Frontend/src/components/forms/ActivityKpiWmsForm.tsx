import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TActivityKPI } from 'pages/WMS/types/activityKpi-wms.types';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import activityKpiServiceInstance from 'service/GM/service.activitykpi_wms';
import * as yup from 'yup';

const ActivityKpiWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TActivityKPI;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();

  //------------------formik-----------------
  const formik = useFormik<TActivityKPI>({
    initialValues: {
      prin_code: '',
      job_type: '',
      act_code: '',
      cust_code: '',
      exp_hours: '',
      company_code: user?.company_code || '',
      updated_by: user?.username || '',
      created_by: user?.username || ''
    },
    validationSchema: yup.object().shape({
      prin_code: yup.string().required('This field is required'),
      job_type: yup.string().required('This field is required'),
      act_code: yup.string().required('This field is required'),
      exp_hours: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        // Update existing activity KPI
        response = await activityKpiServiceInstance.editActivityKpi(values);
      } else {
        // Add a new activity KPI
        response = await activityKpiServiceInstance.addActivityKpi(values);
      }

      if (response) {
        // On success, close the form and optionally refetch data
        onClose(true);
      }
      setSubmitting(false);
    }
  });

  //------------------useEffect------------
  useEffect(() => {
    if (isEditMode) {
      // Remove unnecessary fields and set the form values
      const { ...activityKpiData } = existingData;

      formik.setValues(activityKpiData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, existingData]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      {/* Company Code */}
      <Grid item xs={12} sm={6}>
        <InputLabel>
          <FormattedMessage id="Company Code" />
        </InputLabel>
        <TextField size="small" value={formik.values.company_code} name="company_code" onChange={formik.handleChange} fullWidth />
      </Grid>
      {/* Principal Code */}
      <Grid item xs={12} sm={6}>
        <InputLabel>
          <FormattedMessage id="Principal Code" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.prin_code}
          name="prin_code"
          onChange={formik.handleChange}
          //   className="w-28"
          error={Boolean(getIn(formik.touched, 'prin_code') && getIn(formik.errors, 'prin_code'))}
        />
        {getIn(formik.touched, 'prin_code') && getIn(formik.errors, 'prin_code') && (
          <FormHelperText error>{getIn(formik.errors, 'prin_code')}</FormHelperText>
        )}
      </Grid>

      {/* Job Type */}
      <Grid item xs={12} sm={6}>
        <InputLabel>
          <FormattedMessage id="Job Type" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.job_type}
          name="job_type"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'job_type') && getIn(formik.errors, 'job_type'))}
        />
        {getIn(formik.touched, 'job_type') && getIn(formik.errors, 'job_type') && (
          <FormHelperText error>{getIn(formik.errors, 'job_type')}</FormHelperText>
        )}
      </Grid>

      {/* Activity Code */}
      <Grid item xs={12} sm={6}>
        <InputLabel>
          <FormattedMessage id="Activity Code" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.act_code}
          name="act_code"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'act_code') && getIn(formik.errors, 'act_code'))}
        />
        {getIn(formik.touched, 'act_code') && getIn(formik.errors, 'act_code') && (
          <FormHelperText error>{getIn(formik.errors, 'act_code')}</FormHelperText>
        )}
      </Grid>

      {/* Customer Code */}
      <Grid item xs={12} sm={6}>
        <InputLabel>
          <FormattedMessage id="Customer Code" />
        </InputLabel>
        <TextField size="small" value={formik.values.cust_code || ''} name="cust_code" onChange={formik.handleChange} fullWidth />
      </Grid>

      {/* Expense Hours */}
      <Grid item xs={12} sm={6}>
        <InputLabel>
          <FormattedMessage id="Expense Hours" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.exp_hours}
          name="exp_hours"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'exp_hours') && getIn(formik.errors, 'exp_hours'))}
        />
        {getIn(formik.touched, 'exp_hours') && getIn(formik.errors, 'exp_hours') && (
          <FormHelperText error>{getIn(formik.errors, 'exp_hours')}</FormHelperText>
        )}
      </Grid>

      {/* Submit Button */}
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

export default ActivityKpiWmsForm;
