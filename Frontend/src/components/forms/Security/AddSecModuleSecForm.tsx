import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
// import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, FormControl, TextField, Autocomplete } from '@mui/material';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TSecmodulemaster } from 'pages/Security/type/flowmaster-sec-types';
import GmSecServiceInstance from 'service/security/services.gm_security';
import WmsSerivceInstance from 'service/wms/service.wms';
import * as yup from 'yup';
import { dispatch, useSelector } from 'store'; // Add this import
import { IoSendSharp } from 'react-icons/io5';
import { showAlert } from 'store/CustomAlert/alertSlice';
import CustomAlert from 'components/@extended/CustomAlert';

const AddSecModuleSecForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TSecmodulemaster;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  const [appCodes, setAppCodes] = useState<string[]>([]);
  const [level1Options, setLevel1Options] = useState<string[]>([]);
  const [level2Options, setLevel2Options] = useState<string[]>([]);
  const [positionOptions, setPositionOptions] = useState<string[]>([]);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);

  // Fetch app codes, level1, and level2 options
  const { data: mastersData } = useQuery({
    queryKey: ['fetchMasters', app],
    queryFn: () => WmsSerivceInstance.getMasters(app, 'sec_module_dropdown', undefined, undefined),
    enabled: !!app
  });

  useEffect(() => {
    if (mastersData) {
      const distinctAppCodes = Array.from(new Set((mastersData?.tableData as { app_code: string }[]).map((item) => item.app_code)));
      setAppCodes(distinctAppCodes);

      const distinctLevel1 = Array.from(new Set((mastersData?.tableData as { level1: string }[]).map((item) => item.level1)));
      setLevel1Options(distinctLevel1);

      const distinctLevel2 = Array.from(new Set((mastersData?.tableData as { level2: string }[]).map((item) => item.level2)));
      setLevel2Options(distinctLevel2);

      const distinctposition = Array.from(new Set((mastersData?.tableData as { position: string }[]).map((item) => item.position)));
      setPositionOptions(distinctposition);
    }
  }, [mastersData]);

  //------------------formik-----------------
  const formik = useFormik<TSecmodulemaster>({
    initialValues: {
      company_code: user?.company_code,
      app_code: '',
      serial_no: '',
      level1: '',
      level2: '',
      level3: '',
      position: '',
      url_path: '',
      icon: ''
    },
    validationSchema: yup.object().shape({
      app_code: yup.string().required('This field is required'),
      level1: yup.string().required('This field is required'),
      level2: yup.string(), // Optional
      level3: yup.string() // Optional
    }),
    onSubmit: async (values, { setSubmitting }) => {
      console.log('mode', isEditMode);
      setSubmitting(true);
      let response;
      try {
        if (isEditMode) {
          response = await GmSecServiceInstance.editsecmodulemaster(values);
        } else {
          response = await GmSecServiceInstance.addsecmoduleemaster(values);
        }

        if (response) {
          dispatch(
            showAlert({
              open: true,
              message: isEditMode ? 'Module updated successfully!' : 'Module added successfully!',
              severity: 'success'
            })
          );
          onClose(true);
        } else {
          dispatch(
            showAlert({
              open: true,
              message: 'Operation failed. Please try again.',
              severity: 'error'
            })
          );
        }
      } catch (error) {
        console.error('Error in module master operation:', error);
        dispatch(
          showAlert({
            open: true,
            message: 'An unexpected error occurred!',
            severity: 'error'
          })
        );
      } finally {
        setSubmitting(false);
      }
    }
  });

  useEffect(() => {
    console.log('Current Formik values:', formik.values);
  }, [formik.values]);

  //create url path
  const createPathUrl = () => {
    if (formik.values.app_code && formik.values.level1) {
      const urlParts = [formik.values.app_code, formik.values.level1, formik.values.level2, formik.values.level3].filter(Boolean); // Remove undefined or empty values
      const url = urlParts.join('/').toLowerCase();
      formik.setFieldValue('url_path', url);
    }
  };

  useEffect(() => {
    createPathUrl();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.app_code, formik.values.level1, formik.values.level2, formik.values.level3]);

  useEffect(() => {
    console.log(formik.errors);
  }, [formik.errors]);

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
      <Grid item xs={12}>
        <CustomAlert />
      </Grid>
      <Grid container item xs={12} spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <Autocomplete
              options={appCodes}
              value={formik.values.app_code}
              onChange={(event, newValue) => {
                formik.setFieldValue('app_code', newValue?.toUpperCase() || '');
              }}
              getOptionLabel={(option) => option || ''}
              renderInput={(params) => (
                <TextField {...params} label="App Code" onChange={(e) => formik.setFieldValue('app_code', e.target.value.toUpperCase())} />
              )}
            />
          </FormControl>
          {getIn(formik.touched, 'app_code') && getIn(formik.errors, 'app_code') && (
            <FormHelperText error id="helper-text-app_code">
              {getIn(formik.errors, 'app_code')}
            </FormHelperText>
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <TextField
              label={'Serial No'}
              value={formik.values?.serial_no}
              name="serial_no"
              disabled
              onChange={formik.handleChange}
              fullWidth
              error={Boolean(getIn(formik.touched, 'serial_no') && getIn(formik.errors, 'serial_no'))}
            />
          </FormControl>
          {getIn(formik.touched, 'serial_no') && getIn(formik.errors, 'serial_no') && (
            <FormHelperText error id="helper-text-serial_no">
              {getIn(formik.errors, 'serial_no')}
            </FormHelperText>
          )}
        </Grid>
      </Grid>
      <Grid container item xs={12} spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <Autocomplete
              options={level1Options}
              value={formik.values.level1}
              onChange={(event, newValue) => {
                formik.setFieldValue('level1', newValue || '');
              }}
              getOptionLabel={(option) => option || ''}
              renderInput={(params) => (
                <TextField {...params} label="Level 1*" onChange={(e) => formik.setFieldValue('level1', e.target.value)} />
              )}
            />
          </FormControl>
          {getIn(formik.touched, 'level1') && getIn(formik.errors, 'level1') && (
            <FormHelperText error id="helper-text-level1">
              {getIn(formik.errors, 'level1')}
            </FormHelperText>
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <Autocomplete
              options={level2Options}
              value={formik.values.level2}
              onChange={(event, newValue) => {
                formik.setFieldValue('level2', newValue|| '');
              }}
              getOptionLabel={(option) => option || ''}
              renderInput={(params) => (
                <TextField {...params} label="Level 2" onChange={(e) => formik.setFieldValue('level2', e.target.value)} />
              )}
            />
          </FormControl>
          {getIn(formik.touched, 'level2') && getIn(formik.errors, 'level2') && (
            <FormHelperText error id="helper-text-level2">
              {getIn(formik.errors, 'level2')}
            </FormHelperText>
          )}
        </Grid>
      </Grid>
      <Grid container item xs={12} spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <TextField
              label={'Level 3'}
              value={formik.values.level3}
              name="level3"
              onChange={(e) => {
                // Convert the input value to uppercase
                formik.setFieldValue('level3', e.target.value.toUpperCase());
              }}
              fullWidth
              error={Boolean(getIn(formik.touched, 'level3') && getIn(formik.errors, 'level3'))}
            />
          </FormControl>
          {getIn(formik.touched, 'level3') && getIn(formik.errors, 'level3') && (
            <FormHelperText error id="helper-text-level3">
              {getIn(formik.errors, 'level3')}
            </FormHelperText>
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <Autocomplete
              options={positionOptions}
              value={formik.values.position || ''} // Ensure no null value
              onChange={(event, newValue) => formik.setFieldValue('position', newValue || '')}
              getOptionLabel={(option) => (option ? option.toString() : '')} // Safe check
              renderInput={(params) => <TextField {...params} label="Position" />}
            />
          </FormControl>
        </Grid>
      </Grid>
      <Grid container item xs={12} spacing={2}>
        <Grid item xs={12}>
          <TextField
            label={'Url Path*'}
            value={formik.values.url_path}
            name="url_path"
            onChange={formik.handleChange}
            fullWidth
            error={Boolean(getIn(formik.touched, 'url_path') && getIn(formik.errors, 'url_path'))}
          />
          {getIn(formik.touched, 'url_path') && getIn(formik.errors, 'url_path') && (
            <FormHelperText error id="helper-text-url_path">
              {getIn(formik.errors, 'url_path')}
            </FormHelperText>
          )}
        </Grid>
      </Grid>
      <Grid item xs={12} className="flex justify-start">
        <Button
          variant="outlined"
          color="primary"
          size="small"
          endIcon={<IoSendSharp />}
          type="submit"
          disabled={formik.isSubmitting}
          startIcon={formik.isSubmitting}
        >
          Submit
        </Button>
      </Grid>
    </Grid>
  );
};
export default AddSecModuleSecForm;
