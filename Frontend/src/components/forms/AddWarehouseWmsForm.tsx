import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { Twarehouse } from 'pages/WMS/types/warehouse-wms.types';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import WarehouseServiceInstance from 'service/GM/service.warehouse_wms';
import * as yup from 'yup';

const AddWarehouseWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: Twarehouse;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  //------------------formik-----------------
  const formik = useFormik<Twarehouse>({
    initialValues: { company_code: user?.company_code, wh_code: '', wh_name: '', address: '', country_code: '', phone: '', city: '' },
    validationSchema: yup.object().shape({
      wh_code: yup.string().required(),
      wh_name: yup.string().required(),
      address: yup.string().required()
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      console.log('response ');

      if (isEditMode) {
        response = await WarehouseServiceInstance.editWarehouse(values);
      } else {
        response = await WarehouseServiceInstance.addWarehouse(values);
      }
      if (response) {
        onClose(true);
        setSubmitting(false);
      }
    }
  });
  //------------------Handlers------------
  // const handleWarehouseGccChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
  //   formik.setFieldValue('country_gcc', checked ? 'Y' : 'N');
  // };

  //------------------useEffect------------

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
      <Grid item xs={12} sm={5}>
        <InputLabel>
          <FormattedMessage id="Wh Code" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.wh_code}
          name="wh_code"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'wh_code') && getIn(formik.errors, 'wh_code'))}
        />
        {getIn(formik.touched, 'wh_code') && getIn(formik.errors, 'wh_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'wh_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>
          <FormattedMessage id="Wh Name " />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.wh_name}
          name="wh_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'wh_name') && getIn(formik.errors, 'wh_name'))}
        />
        {getIn(formik.touched, 'wh_name') && getIn(formik.errors, 'wh_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'wh_name')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>
          <FormattedMessage id="Address " />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.address}
          name="address"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'address') && getIn(formik.errors, 'address'))}
        />
        {getIn(formik.touched, 'address') && getIn(formik.errors, 'address') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'address')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>
          <FormattedMessage id="Phone" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.phone}
          name="phone"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'phone') && getIn(formik.errors, 'phone'))}
        />
        {getIn(formik.touched, 'phone') && getIn(formik.errors, 'phone') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'phone')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>
          <FormattedMessage id="Country Code" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.country_code}
          name="country_code"
          onChange={formik.handleChange}
          className="w-28"
          error={Boolean(getIn(formik.touched, 'country_code') && getIn(formik.errors, 'country_code'))}
        />
        {getIn(formik.touched, 'country_code') && getIn(formik.errors, 'country_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'country_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>
          <FormattedMessage id="city" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.city}
          name="city"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'city') && getIn(formik.errors, 'city'))}
        />
        {getIn(formik.touched, 'city') && getIn(formik.errors, 'city') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'city')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} className="flex justify-end">
        <Button
          type="submit"
          variant="contained"
          disabled={formik.isSubmitting}
          startIcon={formik.isSubmitting ? <LoadingOutlined /> : <SaveOutlined />}
        >
          <FormattedMessage id="Submit" />
        </Button>
      </Grid>
    </Grid>
  );
};
export default AddWarehouseWmsForm;
