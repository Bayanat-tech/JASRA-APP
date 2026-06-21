import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TProdtype } from 'pages/WMS/types/producttype-wms.types';
import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import producttypeServiceInstance from 'service/GM/service.prodtype_wms';
import * as yup from 'yup';

const AddProducttypeWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TProdtype;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  //------------------formik-----------------
  const formik = useFormik<TProdtype>({
    initialValues: { prodtype_code: '', prodtype_desc: '', company_code: user?.company_code },
    validationSchema: yup.object().shape({
      prodtype_code: yup.string().required('This field is required'),
      prodtype_desc: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await producttypeServiceInstance.editProducttype(values);
      } else {
        response = await producttypeServiceInstance.addProducttype(values);
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
      const { updated_at, updated_by, created_at, created_by, ...producttypeData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(producttypeData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12} sm={3}>
        <InputLabel>
          <FormattedMessage id="Product Type Code" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.prodtype_code}
          name="prodtype_code"
          onChange={formik.handleChange}
          // className="w-28"
          fullWidth
          error={Boolean(getIn(formik.touched, 'prodtype_code') && getIn(formik.errors, 'prodtype_code'))}
        />
        {getIn(formik.touched, 'prodtype_code') && getIn(formik.errors, 'prodtype_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'prodtype_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={9}>
        <InputLabel>
          <FormattedMessage id="Product Type Name" />*
        </InputLabel>
        <TextField
          size="small"
          value={formik.values.prodtype_desc}
          name="prodtype_desc"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'prodtype_desc') && getIn(formik.errors, 'prodtype_desc'))}
        />
        {getIn(formik.touched, 'prodtype_desc') && getIn(formik.errors, 'prodtype_desc') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'prodtype_desc')}
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
export default AddProducttypeWmsForm;
