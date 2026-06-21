import { Button, Grid, InputLabel, Stack, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { TContactPrincipalWms } from 'pages/WMS/types/principal-wms.types';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

const AddContactInfoWmsForm = ({
  handleNext,
  handleBack,
  contactInfo,
  setContactInfo
}: {
  handleNext: () => void;
  handleBack: () => void;
  contactInfo: TContactPrincipalWms;
  setContactInfo: (value: TContactPrincipalWms) => void;
}) => {
  //----------------formik-----------------
  // Initialize formik with initial values and submit handler
  const formik = useFormik<TContactPrincipalWms>({
    initialValues: contactInfo,
    onSubmit: async (values) => {
      setContactInfo(values); // Update contact info state
      handleNext(); // Move to the next step
    }
  });

  //----------------useEffects-----------------
  // Update formik values when contactInfo changes
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
            <FormattedMessage id="Contacts" />
          </Typography>
        </Grid>
        {/*----------------------Contact 1-------------------------- */}
        <Grid item xs={12} sm={6} md={3}>
          <InputLabel>
            <FormattedMessage id="Contact 1" />
          </InputLabel>
          <TextField
            size="small"
            onChange={formik.handleChange}
            id="prin_cont1"
            name="prin_cont1"
            fullWidth
            value={formik.values.prin_cont1}
          />
        </Grid>
        {/*----------------------Contact 2-------------------------- */}
        <Grid item xs={12} sm={6} md={3}>
          <InputLabel>
            <FormattedMessage id="Contact 2" />
          </InputLabel>
          <TextField
            size="small"
            onChange={formik.handleChange}
            id="prin_cont2"
            name="prin_cont2"
            fullWidth
            value={formik.values.prin_cont2}
          />
        </Grid>
        {/*----------------------Contact 3-------------------------- */}
        <Grid item xs={12} sm={6} md={3}>
          <InputLabel>
            <FormattedMessage id="Contact 3" />
          </InputLabel>
          <TextField
            size="small"
            onChange={formik.handleChange}
            id="prin_cont3"
            name="prin_cont3"
            fullWidth
            value={formik.values.prin_cont3}
          />
        </Grid>
      </Grid>
      {/*-----------------------Emails------------------- */}
      <Grid item container xs={12} spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4" className="text-black  font-semibold">
            <FormattedMessage id="Emails" />
          </Typography>
        </Grid>
        {/*----------------------Email 1-------------------------- */}
        <Grid item xs={12} sm={6} md={3}>
          <InputLabel>
            <FormattedMessage id="Email 1" />
          </InputLabel>
          <TextField
            size="small"
            type="email"
            onChange={formik.handleChange}
            id="prin_cont_email1"
            name="prin_cont_email1"
            fullWidth
            value={formik.values.prin_cont_email1}
          />
        </Grid>
        {/*----------------------Email 2-------------------------- */}
        <Grid item xs={12} sm={6} md={3}>
          <InputLabel>
            <FormattedMessage id="Email 2" />
          </InputLabel>
          <TextField
            size="small"
            type="email"
            onChange={formik.handleChange}
            id="prin_cont_email2"
            name="prin_cont_email2"
            fullWidth
            value={formik.values.prin_cont_email2}
          />
        </Grid>
        {/*----------------------Email 3-------------------------- */}
        <Grid item xs={12} sm={6} md={3}>
          <InputLabel>
            <FormattedMessage id="Email 3" />
          </InputLabel>
          <TextField
            size="small"
            type="email"
            onChange={formik.handleChange}
            id="prin_cont_email3"
            name="prin_cont_email3"
            fullWidth
            value={formik.values.prin_cont_email3}
          />
        </Grid>
      </Grid>
      {/*-----------------------Telephones------------------- */}
      <Grid item container xs={12} spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4" className="text-black  font-semibold">
            <FormattedMessage id="Telephones" />
          </Typography>
        </Grid>
        {/*----------------------Telephone 1-------------------------- */}
        <Grid item xs={12} sm={6} md={3}>
          <InputLabel>
            <FormattedMessage id="Telephone 1" />
          </InputLabel>
          <TextField
            size="small"
            onChange={formik.handleChange}
            id="prin_cont_telno1"
            name="prin_cont_telno1"
            fullWidth
            value={formik.values.prin_cont_telno1}
          />
        </Grid>
        {/*----------------------Telephone 2-------------------------- */}
        <Grid item xs={12} sm={6} md={3}>
          <InputLabel>
            <FormattedMessage id="Telephone 2" />
          </InputLabel>
          <TextField
            size="small"
            onChange={formik.handleChange}
            id="prin_cont_telno2"
            name="prin_cont_telno2"
            fullWidth
            value={formik.values.prin_cont_telno2}
          />
        </Grid>
        {/*----------------------Telephone 3-------------------------- */}
        <Grid item xs={12} sm={6} md={3}>
          <InputLabel>
            <FormattedMessage id="Telephone 3" />
          </InputLabel>
          <TextField
            size="small"
            onChange={formik.handleChange}
            id="prin_cont_telno3"
            name="prin_cont_telno3"
            fullWidth
            value={formik.values.prin_cont_telno3}
          />
        </Grid>
      </Grid>
      {/*-----------------------Fax & Reference------------------- */}
      <Grid item container xs={12} spacing={2}>
        <Grid item xs={12}>
          <Typography variant="h4" className="text-black  font-semibold">
            <FormattedMessage id="Fax & Reference" />
          </Typography>
        </Grid>
        {/*----------------------Fax 1-------------------------- */}
        <Grid item xs={12} sm={6} md={3}>
          <InputLabel>
            <FormattedMessage id="Fax 1" />
          </InputLabel>
          <TextField
            size="small"
            onChange={formik.handleChange}
            id="prin_cont_faxno1"
            name="prin_cont_faxno1"
            fullWidth
            value={formik.values.prin_cont_faxno1}
          />
        </Grid>
        {/*----------------------Fax 2-------------------------- */}
        <Grid item xs={12} sm={6} md={3}>
          <InputLabel>
            <FormattedMessage id="Fax 2" />
          </InputLabel>
          <TextField
            size="small"
            onChange={formik.handleChange}
            id="prin_cont_faxno2"
            name="prin_cont_faxno2"
            fullWidth
            value={formik.values.prin_cont_faxno2}
          />
        </Grid>
        {/*----------------------Fax 3-------------------------- */}
        <Grid item xs={12} sm={6} md={3}>
          <InputLabel>
            <FormattedMessage id="Fax 3" />
          </InputLabel>
          <TextField
            size="small"
            onChange={formik.handleChange}
            id="prin_cont_faxno3"
            name="prin_cont_faxno3"
            fullWidth
            value={formik.values.prin_cont_faxno3}
          />
        </Grid>
        {/*----------------------Reference-------------------------- */}
        <Grid item xs={12} sm={6} md={3}>
          <InputLabel>
            <FormattedMessage id="Reference" />
          </InputLabel>
          <TextField
            size="small"
            onChange={formik.handleChange}
            id="prin_cont_ref1"
            name="prin_cont_ref1"
            fullWidth
            value={formik.values.prin_cont_ref1}
          />
        </Grid>
      </Grid>
      {/*-----------------------Buttons------------------- */}
      <Grid item xs={12} marginTop={13}>
        <Stack direction="row" justifyContent="space-between">
          <Button onClick={handleBack} sx={{ my: 1, ml: 1 }}>
            <FormattedMessage id="Back" />
          </Button>
          <Button variant="contained" type="submit" sx={{ my: 1, ml: 1 }}>
            <FormattedMessage id="Next" />
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default AddContactInfoWmsForm;
