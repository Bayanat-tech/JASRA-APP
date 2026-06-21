import React from 'react'; // Add this line at the top of your file

import { Link } from 'react-router-dom';
import { Grid, Stack, Typography, Checkbox, FormControlLabel } from '@mui/material';
import useAuth from 'hooks/useAuth';
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthLogin from 'sections/auth/auth-forms/AuthLogin';
import Logo from 'components/logo'; // Imported Logo component

const Login = () => {
  const { isLoggedIn } = useAuth();
  const [rememberMe, setRememberMe] = React.useState(false);

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRememberMe(event.target.checked);
  };

  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            // sx={{
            //   mb: {
            //     xs: '24px',
            //     sm: 0.5
            //   }
            // }}
          >
            <Logo sx={{ mr: 1 }} /> {/* Optional: Add margin-right for spacing */}
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <AuthLogin />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={<Checkbox checked={rememberMe} onChange={handleCheckboxChange} name="rememberMe" color="primary" />}
            label="Remember Me"
          />
        </Grid>
        <Grid item xs={12}>
          <Typography
            component={Link}
            to={isLoggedIn ? '/auth/register' : '/register'}
            variant="body1"
            sx={{ textDecoration: 'none', display: 'block', textAlign: 'center', mt: 2 }}
            color="primary"
          >
            Don&apos;t have an account?
          </Typography>
        </Grid>
      </Grid>
    </AuthWrapper>
  );
};

export default Login;
