import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Autocomplete, Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TBrand } from 'pages/WMS/types/brand-wms.types';
import { TGroup } from 'pages/WMS/types/group-wms.types';
import { useEffect } from 'react';
import brandServiceInstance from 'service/GM/service.brand_wms';
import * as yup from 'yup';
import { useQuery } from '@tanstack/react-query';
import WmsSerivceInstance from 'service/service.wms';
import { TPrincipalWms } from 'pages/WMS/types/principal-wms.types';

const AddBrandWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TBrand;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();

  const { data: prinList } = useQuery({
    queryKey: ['principal_code'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters('wms', 'principal');
      if (response) {
        return {
          tableData: response.tableData as TPrincipalWms[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 };
    }
  });

  const { data: groupList } = useQuery({
    queryKey: ['group_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters('wms', 'group');
      if (response) {
        return {
          tableData: response.tableData as TGroup[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 };
    }
  });
  //------------------formik-----------------
  const formik = useFormik<TBrand>({
    initialValues: {
      brand_code: '',
      prin_code: '101',
      group_code: '',
      brand_name: '',
      pref_site: '',
      pref_loc_from: '',
      pref_loc_to: '',
      pref_aisle_from: '',
      pref_aisle_to: '',
      pref_col_from: 0,
      pref_col_to: 0,
      pref_ht_from: 0,
      pref_ht_to: 0,
      company_code: user?.company_code
    },
    validationSchema: yup.object().shape({
      // brand_code: yup.string().required('This field is required'),
      brand_name: yup.string().required('This field is required'),
      prin_code: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await brandServiceInstance.editBrand(values);
      } else {
        response = await brandServiceInstance.addBrand(values);
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
      const { updated_at, updated_by, created_at, created_by, ...brandData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(brandData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      {/* <Grid item xs={12} sm={3}>
        <InputLabel>Brand Code*</InputLabel>
        <TextField
          value={formik.values.brand_code}
          name="brand_code"
          onChange={formik.handleChange}
          error={Boolean(getIn(formik.touched, 'brand_code') && getIn(formik.errors, 'brand_code'))}
        />
        {getIn(formik.touched, 'brand_code') && getIn(formik.errors, 'brand_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'brand_code')}
          </FormHelperText>
        )}
      </Grid> */}
      <Grid item xs={12} sm={4.5}>
        <InputLabel>Brand Name*</InputLabel>
        <TextField
          value={formik.values.brand_name}
          name="brand_name"
          fullWidth
          onChange={formik.handleChange}
          error={Boolean(getIn(formik.touched, 'brand_name') && getIn(formik.errors, 'brand_name'))}
        />
        {getIn(formik.touched, 'brand_name') && getIn(formik.errors, 'brand_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'brand_name')}
          </FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={4.5}>
        <InputLabel>Group Code*</InputLabel>
        <Autocomplete
          id="group_code"
          value={
            !!formik.values.group_code
              ? groupList?.tableData.find((group) => group.group_code === formik.values.group_code) || null
              : null
          }
          onChange={(event, value: TGroup | null) => {
            formik.setFieldValue('group_code', value?.group_code || '');
          }}
          options={groupList?.tableData ?? []}
          fullWidth
          autoHighlight
          getOptionLabel={(option) => `${option?.group_code} - ${option?.group_name}` || ''}
          renderInput={(params) => (
            <TextField
              {...params}
              error={Boolean(getIn(formik.touched, 'group_code') && getIn(formik.errors, 'group_code'))}
              sx={{ '& .MuiInputBase-root': { height: '41px' } }}
            />
          )}
        />
        {getIn(formik.touched, 'group_code') && getIn(formik.errors, 'group_code') && (
          <FormHelperText error id="helper-text-group_code">
            {getIn(formik.errors, 'group_code')}
          </FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={3}>
        <InputLabel>Principal Code*</InputLabel>
        <Autocomplete
          id="prin_code"
          value={
            !!formik.values.prin_code
              ? prinList?.tableData.find((eachPrin) => eachPrin.prin_code === formik.values.prin_code)
              : ({ prin_name: '' } as TPrincipalWms)
          }
          onChange={(event, value: TPrincipalWms | null) => {
            formik.setFieldValue('prin_code', value?.prin_code || '');
          }}
          options={prinList?.tableData ?? []}
          fullWidth
          autoHighlight
          getOptionLabel={(option) => `${option?.prin_code} - ${option?.prin_name}` || ''}
          renderInput={(params) => (
            <TextField
              {...params}
              error={Boolean(getIn(formik.touched, 'prin_code') && getIn(formik.errors, 'prin_code'))}
              sx={{ '& .MuiInputBase-root': { height: '41px' } }}
            />
          )}
        />
        {getIn(formik.touched, 'prin_code') && getIn(formik.errors, 'prin_code') && (
          <FormHelperText error id="helper-text-prin_code">
            {getIn(formik.errors, 'prin_code')}
          </FormHelperText>
        )}
      </Grid>

      {/* <Grid item xs={12} sm={3}>
        <InputLabel>Job No Sequence*</InputLabel>
        <TextField
          value={formik.values.jobno_seq}
          name="jobno_seq"
          onChange={formik.handleChange}
          error={Boolean(getIn(formik.touched, 'jobno_seq') && getIn(formik.errors, 'jobno_seq'))}
        />
        {getIn(formik.touched, 'jobno_seq') && getIn(formik.errors, 'jobno_seq') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'jobno_seq')}
          </FormHelperText>
        )}
      </Grid> */}

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
export default AddBrandWmsForm;
       