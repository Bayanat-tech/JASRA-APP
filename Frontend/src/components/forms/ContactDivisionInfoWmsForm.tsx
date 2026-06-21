import { Button, Grid, InputLabel, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { TDivision } from 'pages/WMS/types/division-wms.types';
import { useEffect } from 'react';

const ContactDivisionInfoWmsForm = ({
  handleNext,
  handleBack,

  contactInfo,
  setContactInfo
}: {
  handleNext: () => void;
  handleBack: () => void;

  contactInfo: TDivision;
  setContactInfo: (value: TDivision) => void;
}) => {
  //----------------formik-----------------
  const formik = useFormik<TDivision>({
    initialValues: contactInfo,
    onSubmit: async (values) => {
      setContactInfo(values);
      handleNext();
    }
  });
  //----------------useEffects-----------------
  useEffect(() => {
    if (!!contactInfo && !!Object.keys(contactInfo).length) formik.setValues(contactInfo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactInfo]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      {/*----------------------Contact-------------------------- */}

      <Grid item container xs={12} spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4" className="text-black  font-semibold">
            Contacts
          </Typography>
        </Grid>
        {/*----------------------div_address1-------------------------- */}
        <Grid item xs={12} sm={6} md={3}>
          <InputLabel>Contact 1</InputLabel>
          <TextField
            size="small"
            onChange={formik.handleChange}
            id="div_address1"
            name="div_address1"
            fullWidth
            value={formik.values.div_address1}
          />
        </Grid>
        {/*----------------------div_address2-------------------------- */}
        <Grid item xs={12} sm={6} md={3}>
          <InputLabel>Contact 2</InputLabel>
          <TextField
            size="small"
            onChange={formik.handleChange}
            id="div_address2"
            name="div_address2"
            fullWidth
            value={formik.values.div_address2}
          />
        </Grid>
        {/*----------------------div_address3-------------------------- */}
        <Grid item xs={12} sm={6} md={3}>
          <InputLabel>Contact 3</InputLabel>
          <TextField
            size="small"
            onChange={formik.handleChange}
            id="div_address3"
            name="div_address3"
            fullWidth
            value={formik.values.div_address3}
          />
        </Grid>
      </Grid>
      {/*-----------------------Emails------------------- */}
      <Grid item container xs={12} spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4" className="text-black  font-semibold">
            Emails
          </Typography>
        </Grid>
        {/*----------------------phone-------------------------- */}
        <Grid item xs={12} sm={6} md={3}>
          <InputLabel>Email 1</InputLabel>
          <TextField
            size="small"
            type="email"
            onChange={formik.handleChange}
            id="phone"
            name="phone"
            fullWidth
            value={formik.values.phone}
          />
        </Grid>
        {/*----------------------Email-------------------------- */}
        <Grid item xs={12} sm={6} md={3}>
          <InputLabel>Email 2</InputLabel>
          <TextField
            size="small"
            type="email"
            onChange={formik.handleChange}
            id="email"
            name="email"
            fullWidth
            value={formik.values.email}
          />
        </Grid>
        {/*----------------------fax-------------------------- */}
        <Grid item xs={12} sm={6} md={3}>
          <InputLabel>Email 3</InputLabel>
          <TextField
            size="small"
            type="fax"
            onChange={formik.handleChange}
            id="fax"
            name="fax"
            fullWidth
            value={formik.values.fax}
          />
        </Grid>
      </Grid>
      aaaaa<Grid item container xs={12} spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4" className="text-black  font-semibold">
            Telephones
          </Typography>
        </Grid>
        
      </Grid>

      <Grid item container xs={12} spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4" className="text-black  font-semibold">
            Faxs & Reference
          </Typography>
        </Grid>
      </Grid>
      <Grid item xs={12}>
        <Stack direction="row" justifyContent="space-between">
          <Button onClick={handleBack} sx={{ my: 1, ml: 1 }}>
            Back
          </Button>
          <Button variant="contained" type="submit" sx={{ my: 1, ml: 1 }}>
            Next
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default ContactDivisionInfoWmsForm;
