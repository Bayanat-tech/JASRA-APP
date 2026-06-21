import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TAssetgroup } from 'pages/WMS/types/Assetgroup-wms.types';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import AssetgroupServiceInstance from 'service/GM/service.assetgroup_wms';
import * as yup from 'yup';

const AddAssetgroupWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TAssetgroup;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  //------------------formik-----------------
  const formik = useFormik<TAssetgroup>({
    initialValues: { asset_group_code: '', asset_group_name: '', company_code: user?.company_code },
    validationSchema: yup.object().shape({
      asset_group_code: yup.string().required('This field is required'),
      asset_group_name: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await AssetgroupServiceInstance.editAssetgroup(values);
      } else {
        response = await AssetgroupServiceInstance.addAssetgroup(values);
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
      const { updated_at, updated_by, created_at, created_by, ...AssetgroupData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(AssetgroupData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12}>
        <InputLabel>
          <FormattedMessage id="Asset Group Code" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.asset_group_code}
          name="asset_group_code"
          onChange={formik.handleChange}
          className="w-28"
          error={Boolean(getIn(formik.touched, 'asset_group_code') && getIn(formik.errors, 'asset_group_code'))}
        />
        {getIn(formik.touched, 'asset_group_code') && getIn(formik.errors, 'asset_group_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'asset_group_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={5}>
        <InputLabel>
          <FormattedMessage id="Asset Group Name" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.asset_group_name}
          name="asset_group_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'asset_group_name') && getIn(formik.errors, 'asset_group_name'))}
        />
        {getIn(formik.touched, 'asset_group_name') && getIn(formik.errors, 'asset_group_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'asset_group_name')}
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
export default AddAssetgroupWmsForm;
