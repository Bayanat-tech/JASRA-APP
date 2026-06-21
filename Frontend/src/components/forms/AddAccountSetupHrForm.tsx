import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TAccountsetup } from 'pages/WMS/types/accountsetup-wms.types';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import accountsetupServiceInstance from 'service/GM/service.accountsetup_wms';
import * as yup from 'yup';

const AddAccountsetupWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TAccountsetup;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  //------------------formik-----------------
  const formik = useFormik<TAccountsetup>({
    initialValues: { ac_code: '', bank_name: '', ac_name: '', company_code: user?.company_code },
    validationSchema: yup.object().shape({
      ac_code: yup.string().required('This field is required'),
      ac_name: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await accountsetupServiceInstance.editAccountsetup(values);
      } else {
        response = await accountsetupServiceInstance.addAccountsetup(values);
      }
      if (response) {
        onClose(true);
        setSubmitting(false);
      }
    }
  });

  //------------------useEffect------------

  useEffect(() => {
    if (isEditMode) {
      const { updated_at, updated_by, created_at, created_by, ...accountsetupData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(accountsetupData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={1} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12} sm={6} >
        <InputLabel>
          <FormattedMessage id="Account Code" />*
        </InputLabel>
        <TextField
          // size="small"
          value={formik.values.ac_code}
          name="ac_code"
          fullWidth
          onChange={formik.handleChange}
          error={Boolean(getIn(formik.touched, 'ac_code') && getIn(formik.errors, 'ac_code'))}
        />
        {getIn(formik.touched, 'ac_code') && getIn(formik.errors, 'ac_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'ac_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <InputLabel>
          <FormattedMessage id="Account Name" />*
        </InputLabel>
        <TextField
          // size="small"
          value={formik.values.ac_name}
          name="ac_name"
          fullWidth
          onChange={formik.handleChange}
          // fullWidth
          error={Boolean(getIn(formik.touched, 'ac_name') && getIn(formik.errors, 'ac_name'))}
        />
        {getIn(formik.touched, 'ac_name') && getIn(formik.errors, 'ac_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'ac_name')}
          </FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={12}>
        <InputLabel>
          <FormattedMessage id="Bank Name" />*
        </InputLabel>
        <TextField
          // size="small"
          value={formik.values.bank_name}
          name="bank_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'bank_name') && getIn(formik.errors, 'bank_name'))}
        />
        {getIn(formik.touched, 'bank_name') && getIn(formik.errors, 'bank_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'bank_name')}
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
          <FormattedMessage id="Submit" />
        </Button>
      </Grid>
    </Grid>
  );
};
export default AddAccountsetupWmsForm;
