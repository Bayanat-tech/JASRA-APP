import React from 'react';
import { Button, FormHelperText, Grid, InputAdornment, InputLabel, OutlinedInput, Stack, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

// third party
import { Formik } from 'formik';
import * as Yup from 'yup';

// project import
import AnimateButton from 'components/@extended/AnimateButton';
import IconButton from 'components/@extended/IconButton';
import AuthServicesInstance from 'service/service.auth';

// assets
import { EyeInvisibleOutlined, EyeOutlined } from '@ant-design/icons';
import { Badge as BadgeIcon, Lock as LockIcon } from '@mui/icons-material';

// ============================|| FIREBASE - FORGOT PASSWORD ||============================ //

const AuthForgotPassword = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [emailSent, setEmailSent] = React.useState(false);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownPassword = (event: React.SyntheticEvent) => {
    event.preventDefault();
  };

  return (
    <>
      <Formik
        initialValues={{
          loginId: '',
          newPassword: '',
          confirmPassword: '',
          submit: null
        }}
        validationSchema={Yup.object().shape({
          loginId: Yup.string().max(255).required('Login ID is required'),
          newPassword: Yup.string().min(8, 'Password must be at least 8 characters').max(255).required('New password is required'),
          confirmPassword: Yup.string()
            .oneOf([Yup.ref('newPassword')], 'Passwords must match')
            .required('Confirm password is required')
        })}
        onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
          try {
            const response = await AuthServicesInstance.resetPasswordByLoginId(values.loginId, values.newPassword);
            
            // Check if email was sent (JASRA case) - check for emailSent flag or message keywords
            const isEmailSent = response?.data?.emailSent === true || 
                                response?.data?.message?.toLowerCase().includes('email') ||
                                response?.data?.message?.toLowerCase().includes('sent');
            
            if (isEmailSent) {
              setEmailSent(true);
              setStatus({ success: true });
              setSubmitting(false);
              // Don't navigate, show email sent message
            } else {
              // Direct password reset (non-JASRA case)
              setStatus({ success: true });
              setSubmitting(false);
              navigate('/login');
            }
          } catch (err: any) {
            console.error(err);
            const errorMessage = err.response?.data?.message || 'Failed to reset password. Please try again.';
            setStatus({ success: false });
            setErrors({ submit: errorMessage });
            setSubmitting(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {emailSent && (
                <Grid item xs={12}>
                  <Alert severity="success" onClose={() => setEmailSent(false)}>
                    Password reset link has been sent to your registered email address. Please check your inbox.
                  </Alert>
                </Grid>
              )}

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="loginId-reset">Login ID</InputLabel>
                  <OutlinedInput
                    id="loginId-reset"
                    value={values.loginId}
                    name="loginId"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    placeholder="Enter your Login ID"
                    fullWidth
                    error={Boolean(touched.loginId && errors.loginId)}
                    autoFocus
                    startAdornment={
                      <InputAdornment position="start">
                        <BadgeIcon />
                      </InputAdornment>
                    }
                  />
                  {touched.loginId && errors.loginId && (
                    <FormHelperText error id="standard-weight-helper-text-loginId-reset">
                      {errors.loginId}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="newPassword-reset">New Password</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.newPassword && errors.newPassword)}
                    id="newPassword-reset"
                    type={showPassword ? 'text' : 'password'}
                    value={values.newPassword}
                    name="newPassword"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="Enter new password"
                    startAdornment={
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    }
                  />
                  {touched.newPassword && errors.newPassword && (
                    <FormHelperText error id="standard-weight-helper-text-newPassword-reset">
                      {errors.newPassword}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <Stack spacing={1}>
                  <InputLabel htmlFor="confirmPassword-reset">Confirm Password</InputLabel>
                  <OutlinedInput
                    fullWidth
                    error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                    id="confirmPassword-reset"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={values.confirmPassword}
                    name="confirmPassword"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={handleClickShowConfirmPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          color="secondary"
                        >
                          {showConfirmPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                        </IconButton>
                      </InputAdornment>
                    }
                    placeholder="Confirm new password"
                    startAdornment={
                      <InputAdornment position="start">
                        <LockIcon />
                      </InputAdornment>
                    }
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <FormHelperText error id="standard-weight-helper-text-confirmPassword-reset">
                      {errors.confirmPassword}
                    </FormHelperText>
                  )}
                </Stack>
              </Grid>

              {errors.submit && (
                <Grid item xs={12}>
                  <FormHelperText error>{errors.submit}</FormHelperText>
                </Grid>
              )}

              <Grid item xs={12}>
                <AnimateButton>
                  <Button
                    disableElevation
                    disabled={isSubmitting || emailSent}
                    fullWidth
                    size="large"
                    type="submit"
                    variant="contained"
                    sx={{
                      background:
                        'linear-gradient(270deg, rgba(2,0,36,1) 0%, rgba(0,212,255,1) 0%, rgba(9,9,121,1) 81%, rgba(8,25,132,1) 100%)',
                      color: 'white',
                      '&:hover': {
                        background:
                          'linear-gradient(270deg, rgba(2,0,36,1) 0%, rgba(0,212,255,1) 0%, rgba(9,9,121,1) 81%, rgba(8,25,132,1) 100%)'
                      }
                    }}
                  >
                    {emailSent ? 'Email Sent' : 'Reset Password'}
                  </Button>
                </AnimateButton>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </>
  );
};

export default AuthForgotPassword;
