import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Checkbox, FormControlLabel, FormHelperText, Grid, InputLabel, MenuItem, Select } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TGrade } from 'pages/HR/type/grade-hr.types';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
//import countryServiceInstance from 'service/GM/service.country_wms';
import gradeServiceInstance from 'service/HR/service.grade_hr';

import * as yup from 'yup';

const AddGradeHrForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TGrade;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  //------------------formik-----------------
  const formik = useFormik<TGrade>({
    initialValues: {
      grade_code: '',
      grade_name: '',
      grade_short_name: '',
      remarks: '',
      status: existingData.status || '',
      grade_status: existingData.grade_status || '',
      ot_eligibility: 'N',
      company_code: user?.company_code
    },
    validationSchema: yup.object().shape({
      grade_code: yup.string().required('This field is required'),
      grade_name: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await gradeServiceInstance.editGrade(values);
      } else {
        response = await gradeServiceInstance.addGrade(values);
      }
      if (response) {
        onClose(true);
        setSubmitting(false);
      }
    }
  });
  //------------------Handlers------------
  const handleGradeChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    formik.setFieldValue('ot_eligibility', checked ? 'Y' : 'N');
  };

  //------------------useEffect------------

  useEffect(() => {
    if (isEditMode) {
      const { updated_at, updated_by, created_at, created_by, ...gradeData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(gradeData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12} sm={4}>
        <InputLabel>
          <FormattedMessage id="Grade Code" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.grade_code}
          name="grade_code"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'grade_code') && getIn(formik.errors, 'grade_code'))}
        />
        {getIn(formik.touched, 'grade_code') && getIn(formik.errors, 'grade_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'grade_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={8}>
        <InputLabel>
          <FormattedMessage id="Grade Name" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.grade_name}
          name="grade_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'grade_name') && getIn(formik.errors, 'grade_name'))}
        />
        {getIn(formik.touched, 'grade_name') && getIn(formik.errors, 'grade_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'grade_name')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={4}>
        <InputLabel>
          <FormattedMessage id="Short Name" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.grade_short_name}
          name="grade_short_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'grade_short_name') && getIn(formik.errors, 'grade_short_name'))}
        />
        {getIn(formik.touched, 'grade_short_name') && getIn(formik.errors, 'grade_short_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'grade_short_name')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={4} md={4}>
        <InputLabel>
          <FormattedMessage id="Eligibility for OT (Y/N)? :" />
        </InputLabel>
        <FormControlLabel
          control={<Checkbox onChange={handleGradeChange} />}
          checked={formik.values.ot_eligibility === 'Y'}
          name="ot_eligibility"
          label={<FormattedMessage id="Yes/No" />}
          value={formik.values.ot_eligibility}
        />
      </Grid>
      {/*----------------------Grade Status--------------------- */}

      <Grid item xs={12} sm={4}>
        <InputLabel>Grade Status</InputLabel>
        <Select value={formik.values.grade_status} onChange={(e) => formik.setFieldValue('grade_status', e.target.value)} fullWidth>
          <MenuItem value="J">Junior</MenuItem>
          <MenuItem value="S">Senior</MenuItem>
        </Select>
        {formik.touched.grade_status && formik.errors.grade_status && <FormHelperText error>{formik.errors.grade_status}</FormHelperText>}
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
      {/*----------------------Grade Status--------------------- */}

      <Grid item xs={12} sm={4}>
        <InputLabel>Status</InputLabel>
        <Select value={formik.values.status} onChange={(e) => formik.setFieldValue('status', e.target.value)} fullWidth>
          <MenuItem value="A">Active</MenuItem>
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
export default AddGradeHrForm;
