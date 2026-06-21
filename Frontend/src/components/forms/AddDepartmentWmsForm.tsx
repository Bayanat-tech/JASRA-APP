import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TDepartment } from 'pages/WMS/types/department-wms.types';
import { useEffect } from 'react';
import departmentServiceInstance from 'service/GM/service.department_wms';
import * as yup from 'yup';

const AddDepartmentWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TDepartment;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  //------------------formik-----------------
  const formik = useFormik<TDepartment>({
    initialValues: { dept_name: '', dept_code: '', company_code: user?.company_code, div_code: '', jobno_seq: '' },
    validationSchema: yup.object().shape({
      dept_code: yup.string().required('This field is required'),
      dept_name: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await departmentServiceInstance.editDepartment(values);
      } else {
        response = await departmentServiceInstance.addDepartment(values);
      }
      if (response) {
        onClose(true);
        setSubmitting(false);
      }
    }
  });

  useEffect(() => {
    if (isEditMode) {
      const { updated_at, updated_by, created_at, created_by, ...departmentData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(departmentData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={1} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12} sm={3}>
        <InputLabel>Department Code*</InputLabel>
        <TextField
          value={formik.values.dept_code}
          name="dept_code"
          onChange={formik.handleChange}
          error={Boolean(getIn(formik.touched, 'dept_code') && getIn(formik.errors, 'dept_code'))}
        />
        {getIn(formik.touched, 'dept_code') && getIn(formik.errors, 'dept_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'dept_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={9}>
        <InputLabel>Department Name*</InputLabel>
        <TextField
          value={formik.values.dept_name}
          name="dept_name"
          fullWidth
          onChange={formik.handleChange}
          error={Boolean(getIn(formik.touched, 'dept_name') && getIn(formik.errors, 'dept_name'))}
        />
        {getIn(formik.touched, 'dept_name') && getIn(formik.errors, 'dept_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'dept_name')}
          </FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={3}>
        <InputLabel>Division Code*</InputLabel>
        <TextField
          value={formik.values.div_code}
          name="div_code"
          onChange={formik.handleChange}
          error={Boolean(getIn(formik.touched, 'div_code') && getIn(formik.errors, 'div_code'))}
        />
        {getIn(formik.touched, 'div_code') && getIn(formik.errors, 'div_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'div_code')}
          </FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={9}>
        <InputLabel>Job No Sequence*</InputLabel>
        <TextField
          value={formik.values.jobno_seq}
          name="jobno_seq"
          fullWidth
          onChange={formik.handleChange}
          error={Boolean(getIn(formik.touched, 'jobno_seq') && getIn(formik.errors, 'jobno_seq'))}
        />
        {getIn(formik.touched, 'jobno_seq') && getIn(formik.errors, 'jobno_seq') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'jobno_seq')}
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
          Submit
        </Button>
      </Grid>
    </Grid>
  );
};
export default AddDepartmentWmsForm;
