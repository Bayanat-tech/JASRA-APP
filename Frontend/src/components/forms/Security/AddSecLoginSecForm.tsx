import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Button, Checkbox, FormHelperText, Grid, IconButton, InputAdornment, InputLabel, TextField, FormControlLabel } from '@mui/material';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { FormattedMessage } from 'react-intl';
import { TSecmaster } from 'pages/Security/type/flowmaster-sec-types';
import { useEffect, useState } from 'react';
import GmSecServiceInstance from 'service/security/services.gm_security';
import * as yup from 'yup';
import CustomAlert from 'components/@extended/CustomAlert';
import { dispatch } from 'store';
import { showAlert } from 'store/CustomAlert/alertSlice';
import { IoSendSharp } from 'react-icons/io5';

const AddSecLoginSecForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TSecmaster;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  //------------------formik-----------------
  const formik = useFormik<TSecmaster>({
    initialValues: {
      id: '',
      username: '',
      userpass: '',
      contact_no: '',
      email_id: '',
      company_code: user?.company_code,
      active_flag: 'N'
    },
    validationSchema: yup.object().shape({
      username: yup.string().required('This field is required'),
      userpass: yup.string().required('This field is required'),
      email_id: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      console.log('mode', isEditMode);
      setSubmitting(true);
      let response;
      try {
        if (isEditMode) {
          const { id } = existingData;
          response = await GmSecServiceInstance.editsecemaster({
            id,
            contact_no: values.contact_no,
            userpass: values.userpass,
            email_id: values.email_id,
            loginid: values.username,
            user_id: values.username,
            user_code: values.username,
            username: values.username,
            company_code: user?.company_code,
            active_flag: values.active_flag
          });
        } else {
          response = await GmSecServiceInstance.addsecemaster(values);
        }

        if (response) {
          dispatch(
            showAlert({
              open: true,
              message: isEditMode ? 'User updated successfully!' : 'User added successfully!',
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
        console.error('Error in secemaster operation:', error);
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
    console.log(formik.errors);
  }, [formik.errors]);

  //------------------Handlers------------
  const handleActiveGccChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    console.log('Checkbox changed:', checked);
    formik.setFieldValue('active_flag', checked ? 'Y' : 'N');
  };
  useEffect(() => {
    if (isEditMode) {
      const { loginid, user_id, user_code, active_flag, ...countryData } = existingData;

      formik.setValues({
        ...countryData,
        loginid,
        user_id,
        user_code,
        active_flag: active_flag || 'N' // Ensure default value is set
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, existingData]);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12}>
        <CustomAlert />
        <TextField
          label="User Id"
          value={formik.values.id}
          name="id"
          disabled
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'id') && getIn(formik.errors, 'id'))}
        />
        {getIn(formik.touched, 'id') && getIn(formik.errors, 'id') && (
          <FormHelperText error id="helper-text-id">
            {getIn(formik.errors, 'id')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Username*"
          value={formik.values.username}
          name="username"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'username') && getIn(formik.errors, 'username'))}
        />
        {getIn(formik.touched, 'username') && getIn(formik.errors, 'username') && (
          <FormHelperText error id="helper-text-username">
            {getIn(formik.errors, 'username')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Password*"
          type={showPassword ? 'text' : 'password'}
          value={formik.values.userpass}
          name="userpass"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'userpass') && getIn(formik.errors, 'userpass'))}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleClickShowPassword} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        {getIn(formik.touched, 'userpass') && getIn(formik.errors, 'userpass') && (
          <FormHelperText error id="helper-text-userpass">
            {getIn(formik.errors, 'userpass')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Contact No"
          value={formik.values.contact_no}
          name="contact_no"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'contact_no') && getIn(formik.errors, 'contact_no'))}
        />
        {getIn(formik.touched, 'contact_no') && getIn(formik.errors, 'contact_no') && (
          <FormHelperText error id="helper-text-contact_no">
            {getIn(formik.errors, 'contact_no')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Email*"
          value={formik.values.email_id}
          name="email_id"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'email_id') && getIn(formik.errors, 'email_id'))}
        />
        {getIn(formik.touched, 'email_id') && getIn(formik.errors, 'email_id') && (
          <FormHelperText error id="helper-text-email_id">
            {getIn(formik.errors, 'email_id')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <InputLabel>
          <FormattedMessage id="Active?" />
        </InputLabel>
        <FormControlLabel
          control={<Checkbox onChange={handleActiveGccChange} checked={formik.values.active_flag === 'Y'} />}
          name="active_flag"
          label={<FormattedMessage id="Yes/No" />}
          value={formik.values.active_flag}
        />
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

export default AddSecLoginSecForm;
