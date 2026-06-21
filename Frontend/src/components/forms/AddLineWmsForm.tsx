import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TLine } from 'pages/WMS/types/Line-wms.types';
import { useEffect } from 'react';
import lineServiceInstance from 'service/GM/service.line_wms';
import * as yup from 'yup';

const AddLineWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TLine;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();

  //------------------formik-----------------
  const formik = useFormik<TLine>({
    initialValues: { line_name: '', line_code: '', company_code: user?.company_code },
    validationSchema: yup.object().shape({
      line_code: yup.string().required('This field is required'),
      line_name: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await lineServiceInstance.editLine(values);
      } else {
        response = await lineServiceInstance.addLine(values);
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
  //------------------Handlers------------

  useEffect(() => {
    if (isEditMode) {
      const { updated_at, updated_by, created_at, created_by, ...LineData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(LineData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12} sm={3}>
        <InputLabel>Line Code*</InputLabel>
        <TextField
          value={formik.values.line_code}
          name="line_code"
          onChange={formik.handleChange}
          // className="w-28"
          error={Boolean(getIn(formik.touched, 'line_code') && getIn(formik.errors, 'line_code'))}
        />
        {getIn(formik.touched, 'line_code') && getIn(formik.errors, 'line_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'line_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={9}>
        <InputLabel>Line Name*</InputLabel>
        <TextField
          value={formik.values.line_name}
          name="line_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'line_name') && getIn(formik.errors, 'wave_name'))}
        />
        {getIn(formik.touched, 'line_name') && getIn(formik.errors, 'line_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'line_name')}
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

export default AddLineWmsForm;
