import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TLeavetype } from 'pages/HR/type/AddLeavetypeHr.types';
import { useEffect } from 'react';
import hrLeavetypeServiceInstance from 'service/HR/HRLeavetypeService';
import * as yup from 'yup';
// import { useSelector } from 'store';
import { FormattedMessage } from 'react-intl';

const AddLeavetypeForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TLeavetype;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  // const { app } = useSelector((state) => state.menuSelectionSlice);

  const formik = useFormik<TLeavetype>({
    initialValues: {
      company_code: user?.company_code,
      leave_type: '',
      leave_type_desc: '',
      carry_forward: '',
      half_day: ''
    },
    validationSchema: yup.object().shape({
      leave_type: yup.string().required('This field is required'),
      leave_type_desc: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await hrLeavetypeServiceInstance.editHrLeavetype(values);
      } else {
        response = await hrLeavetypeServiceInstance.addHrLeavetype(values);
      }
      if (response) {
        onClose(true);
      }
      setSubmitting(false);
    }
  });

  useEffect(() => {
    if (isEditMode && existingData) {
      const { ...categoryData } = existingData;
      formik.setValues(categoryData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, existingData]);

  return (
    <Grid container spacing={2} component="form" onSubmit={formik.handleSubmit}>
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
      <Grid item xs={12}>
        <InputLabel>
          <FormattedMessage id="Leavetype Code" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.leave_type}
          name="leave_type"
          onChange={formik.handleChange}
          className="w-28"
          error={Boolean(getIn(formik.touched, 'leave_type') && getIn(formik.errors, 'leave_type'))}
        />
        {getIn(formik.touched, 'leave_type') && getIn(formik.errors, 'leave_type') && (
          <FormHelperText error>{getIn(formik.errors, 'leave_type')}</FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>
          <FormattedMessage id="Leavetype Name" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.leave_type_desc}
          name="leave_type_desc"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'leave_type_desc') && getIn(formik.errors, 'leave_type_desc'))}
        />
        {getIn(formik.touched, 'leave_type_desc') && getIn(formik.errors, 'leave_type_desc') && (
          <FormHelperText error>{getIn(formik.errors, 'leave_type_desc')}</FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={4}>
        <InputLabel>Carry forward</InputLabel>
        <Select value={formik.values.carry_forward} onChange={(e) => formik.setFieldValue('carry_forward', e.target.value)} fullWidth>
          <MenuItem value="Y">Yes</MenuItem>
          <MenuItem value="N">No</MenuItem>
        </Select>
        {formik.touched.carry_forward && formik.errors.carry_forward && (
          <FormHelperText error>{formik.errors.carry_forward}</FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={4}>
        <InputLabel>Half Day</InputLabel>
        <Select value={formik.values.half_day} onChange={(e) => formik.setFieldValue('half_day', e.target.value)} fullWidth>
          <MenuItem value="Y">Yes</MenuItem>
          <MenuItem value="N">No</MenuItem>
        </Select>
        {formik.touched.half_day && formik.errors.half_day && <FormHelperText error>{formik.errors.half_day}</FormHelperText>}
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

export default AddLeavetypeForm;
