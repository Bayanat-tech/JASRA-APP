import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TDivision } from 'pages/WMS/types/division-wms.types';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import divisionServiceInstance from 'service/wms/service.division_wms';

import * as yup from 'yup';

const AddDivisionWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TDivision;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  //------------------formik-----------------
  const formik = useFormik<TDivision>({
    initialValues: { div_name: '', div_code: '', company_code: user?.company_code },
    validationSchema: yup.object().shape({
      div_code: yup.string().required('This field is required'),
      div_name: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await divisionServiceInstance.editDivision(values);
      } else {
        response = await divisionServiceInstance.addDivision(values);
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
      const { updated_at, updated_by, created_at, created_by, ...divisionData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(divisionData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={1} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12} sm={3}>
        <InputLabel>
          <FormattedMessage id="Division Code" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.div_code}
          name="div_code"
           fullWidth
          onChange={formik.handleChange}
          // className="w-28"
          error={Boolean(getIn(formik.touched, 'div_code') && getIn(formik.errors, 'div_code'))}
        />
        {getIn(formik.touched, 'div_code') && getIn(formik.errors, 'div_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'div_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={9}>
        <InputLabel>
          <FormattedMessage id="Division Name" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.div_name}
          name="div_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'div_name') && getIn(formik.errors, 'div_name'))}
        />
        {getIn(formik.touched, 'div_name') && getIn(formik.errors, 'div_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'div_name')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={3}>
        <InputLabel>
          <FormattedMessage id="Div Short Desc" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.div_short_name}
          name="div_short_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'div_short_name') && getIn(formik.errors, 'div_short_name'))}
        />
        {getIn(formik.touched, 'div_short_name') && getIn(formik.errors, 'div_short_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'div_short_name')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={9}>
        <InputLabel>
          <FormattedMessage id="Address1" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.div_address1}
          name="div_address1"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'div_address1') && getIn(formik.errors, 'div_address1'))}
        />
        {getIn(formik.touched, 'div_address1') && getIn(formik.errors, 'div_address1') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'div_address1')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <InputLabel>
          <FormattedMessage id="Address2" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.div_address2}
          name="div_address2"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'div_address2') && getIn(formik.errors, 'div_address2'))}
        />
        {getIn(formik.touched, 'div_address2') && getIn(formik.errors, 'div_address2') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'div_address2')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <InputLabel>
          <FormattedMessage id="Address3" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.div_address3}
          name="div_address3"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'div_address3') && getIn(formik.errors, 'div_address3'))}
        />
        {getIn(formik.touched, 'div_address3') && getIn(formik.errors, 'div_address3') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'div_address3')}
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
export default AddDivisionWmsForm;
