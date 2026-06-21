import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { KPIName } from 'pages/HR/type/AddCategoryHr.types';
import { useEffect } from 'react';

import * as yup from 'yup';
import { FormattedMessage } from 'react-intl';
import KpiNameServiceInstance from 'service/HR/KPINameService';

const KpiNameHrForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: KPIName;
}) => {
  //-------------------constants-------------------

  const { user } = useAuth();
  // const { app } = useSelector((state) => state.menuSelectionSlice);
  const formik = useFormik<KPIName>({
    initialValues: {
      company_code: user?.company_code,
      serial_no: '',
      kpi_name: ''
    },
    validationSchema: yup.object().shape({
      kpi_name: yup.string().required('This field is required'),
      serial_no: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await KpiNameServiceInstance.editKpiName(values);
      } else {
        response = await KpiNameServiceInstance.addKpiName(values);
      }
      if (response) {
        onClose(true);
      }
      setSubmitting(false);
    }
  });

  useEffect(() => {
    if (isEditMode && existingData) {
      const { ...kpiNameData } = existingData;
      formik.setValues(kpiNameData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, existingData]);

  return (
    <Grid container spacing={2} component="form" onSubmit={formik.handleSubmit} className="flex">
      {/* Company Code Row */}
      <Grid item xs={12}>
        <InputLabel>
          <FormattedMessage id="Company Code" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.company_code}
          name="company_code"
          onChange={formik.handleChange}
          className="w-28"
          error={Boolean(getIn(formik.touched, 'company_code') && getIn(formik.errors, 'company_code'))}
        />
        {getIn(formik.touched, 'company_code') && getIn(formik.errors, 'company_code') && (
          <FormHelperText error>{getIn(formik.errors, 'company_code')}</FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={6}>
        <InputLabel>
          <FormattedMessage id="Serial No" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values?.serial_no}
          name="serial_no"
          onChange={formik.handleChange}
          className="w-28"
          error={Boolean(getIn(formik.touched, 'serial_no') && getIn(formik.errors, 'serial_no'))}
        />
        {getIn(formik.touched, 'serial_no') && getIn(formik.errors, 'serial_no') && (
          <FormHelperText error>{getIn(formik.errors, 'serial_no')}</FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={6}>
        <InputLabel>
          <FormattedMessage id="KPI Name" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.kpi_name}
          name="kpi_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'kpi_name') && getIn(formik.errors, 'kpi_name'))}
        />
        {getIn(formik.touched, 'kpi_name') && getIn(formik.errors, 'kpi_name') && (
          <FormHelperText error>{getIn(formik.errors, 'kpi_name')}</FormHelperText>
        )}
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

export default KpiNameHrForm;
