import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TSupplier } from 'pages/WMS/types/supplier-wms.types';
import { useEffect } from 'react';
//import GmServiceInstance from 'service/wms/services.gm_wms';
import supplierServiceInstance from 'service/GM/service.supplier_wms';
import * as yup from 'yup';

const AddSupplierWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TSupplier;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  //------------------formik-----------------
  const formik = useFormik<TSupplier>({
    // initialValues: { dept_name: '', dept_code: '', company_code: user?.company_code, div_code: '', jobno_seq: '' },

    initialValues: {
      company_code: user?.company_code,
      prin_code: '101',
      supp_code: '',
      curr_code: '101',
      country_code: '101',
      supp_name: '',
      supp_addr1: '',
      supp_addr2: '',
      supp_addr3: '',
      supp_addr4: '',
      supp_city: '',
      supp_contact1: '',
      supp_telno1: '',
      supp_faxno1: '',
      supp_email1: '',
      supp_contact2: '',
      supp_telno2: '',
      supp_faxno2: '',
      supp_email2: '',
      supp_contact3: '',
      supp_telno3: '',
      supp_faxno3: '',
      supp_ref1: '',
      supp_ref2: '',
      supp_ref3: '',
      service_date: null as unknown as Date,
      supp_acref: '',
      supp_credit: 0,
      supp_stat: '',
      supp_imp_code: '',
      supp_lic_no: '',
      supp_lic_type: '',
      price_check: '',
      supp_email3: '',
      payment_terms: 0,
      importer_code: ''
    },

    validationSchema: yup.object().shape({
      supp_code: yup.string().required('This field is required'),
      supp_name: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await supplierServiceInstance.editSupplier(values);
      } else {
        response = await supplierServiceInstance.addSupplier(values);
      }
      if (response) {
        onClose(true);
        setSubmitting(false);
      }
    }
  });
  //   useEffect(() => {
  //     console.log(formik.errors);
  //   }, [formik.errors]);
  //   //------------------Handlers------------
  //   const handleCountryGccChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
  //     formik.setFieldValue('country_gcc', checked ? 'Y' : 'N');
  //   };
  useEffect(() => {
    if (isEditMode) {
      const { updated_at, updated_by, created_at, created_by, ...supplierData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(supplierData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={1} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12} sm={3}>
        <InputLabel>Supplier Code*</InputLabel>
        <TextField
          value={formik.values.supp_code}
          name="supp_code"
          onChange={formik.handleChange}
          error={Boolean(getIn(formik.touched, 'supp_code') && getIn(formik.errors, 'supp_code'))}
        />
        {getIn(formik.touched, 'supp_code') && getIn(formik.errors, 'supp_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'supp_code')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={9}>
        <InputLabel>Supplier Name*</InputLabel>
        <TextField
          value={formik.values.supp_name}
          name="supp_name"
          fullWidth
          onChange={formik.handleChange}
          error={Boolean(getIn(formik.touched, 'supp_name') && getIn(formik.errors, 'supp_name'))}
        />
        {getIn(formik.touched, 'supp_name') && getIn(formik.errors, 'supp_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'supp_name')}
          </FormHelperText>
        )}
      </Grid>
      {/* <Grid item xs={12} sm={6} md={3}>
        <InputLabel>Is gcc?</InputLabel>
        <FormControlLabel
          control={<Checkbox onChange={handleCountryGccChange} />}
          checked={formik.values.country_gcc === 'Y'}
          name="country_gcc"
          label={'Yes/No'}
          value={formik.values.country_gcc}
        />
      </Grid> */}

      <Grid item xs={12} sm={3}>
        <InputLabel>Address*</InputLabel>
        <TextField
          value={formik.values.supp_addr1}
          name="supp_addr1"
          onChange={formik.handleChange}
          error={Boolean(getIn(formik.touched, 'supp_addr1') && getIn(formik.errors, 'supp_addr1'))}
        />
        {getIn(formik.touched, 'supp_addr1') && getIn(formik.errors, 'supp_addr1') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'supp_addr1')}
          </FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={9}>
        <InputLabel>City*</InputLabel>
        <TextField
          value={formik.values.supp_city}
          fullWidth
          name="supp_city"
          onChange={formik.handleChange}
          error={Boolean(getIn(formik.touched, 'supp_city') && getIn(formik.errors, 'supp_city'))}
        />
        {getIn(formik.touched, 'supp_city') && getIn(formik.errors, 'supp_city') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'supp_city')}
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
          Submit
        </Button>
      </Grid>
    </Grid>
  );
};
export default AddSupplierWmsForm;
