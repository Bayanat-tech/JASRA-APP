import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TPort } from 'pages/WMS/types/Port-wms.types';
import { useEffect } from 'react';
import PortServiceInstance from 'service/GM/service.port_wms';
import * as yup from 'yup';

const AddPortWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TPort;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  //------------------formik-----------------
  const formik = useFormik<TPort>({
    initialValues: { port_name: '', port_code: '', trp_mode: '', company_code: user?.company_code },
    validationSchema: yup.object().shape({
      port_code: yup.string().required('This field is required'),
      port_name: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await PortServiceInstance.editPort(values);
      } else {
        response = await PortServiceInstance.addPort(values);
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
      const { updated_at, updated_by, created_at, created_by, ...portData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(portData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12}  sm={3}>
        <InputLabel>Port Code*</InputLabel>
        <TextField
          value={formik.values.port_code}
          name="port_code"
          onChange={formik.handleChange}
          // className="w-28"
          error={Boolean(getIn(formik.touched, 'port_code') && getIn(formik.errors, 'port_code'))}
        />
        {getIn(formik.touched, 'port_code') && getIn(formik.errors, 'port_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'port_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={9}>
        <InputLabel>Port Name*</InputLabel>
        <TextField
          value={formik.values.port_name}
          name="port_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'port_name') && getIn(formik.errors, 'port_name'))}
        />
        {getIn(formik.touched, 'port_name') && getIn(formik.errors, 'port_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'port_name')}
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

export default AddPortWmsForm;
