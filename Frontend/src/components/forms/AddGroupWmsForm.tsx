import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Autocomplete, Button, FormHelperText, Grid, InputLabel } from '@mui/material';
import TextField from '@mui/material/TextField';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { TGroup } from 'pages/WMS/types/group-wms.types';
import { useEffect } from 'react';
import prodgroupServiceInstance from 'service/GM/service.prodgroup_wms';
import * as yup from 'yup';
import { useQuery } from '@tanstack/react-query';
import WmsSerivceInstance from 'service/service.wms';
import { TPrincipalWms } from 'pages/WMS/types/principal-wms.types';

const AddGroupWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TGroup;
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
  //------------------formik-----------------
  const formik = useFormik<TGroup>({
    initialValues: { group_name: '', group_code: '', prin_code: '', company_code: user?.company_code },
    validationSchema: yup.object().shape({
      // group_code: yup.string().required('This field is required'),
      group_name: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      if (isEditMode) {
        response = await prodgroupServiceInstance.editGroup(values);
      } else {
        response = await prodgroupServiceInstance.addGroup(values);
      }
      if (response) {
        onClose(true);
        setSubmitting(false);
      }
    }
  });
  useEffect(() => {
    console.log(formik.errors);
  }, [formik.errors]);
  //------------------Handlers------------

  useEffect(() => {
    if (isEditMode) {
      const { updated_at, updated_by, created_at, created_by, ...groupData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(groupData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      {/* <Grid item xs={12} sm={3}>
        <InputLabel>Group Code*</InputLabel>
        <TextField
          value={formik.values.group_code}
          name="group_code"
          onChange={formik.handleChange}
          error={Boolean(getIn(formik.touched, 'group_code') && getIn(formik.errors, 'group_code'))}
        />
        {getIn(formik.touched, 'group_code') && getIn(formik.errors, 'group_code') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'group_code')}
          </FormHelperText>
        )}
      </Grid> */}
      <Grid item xs={12} sm={6}>
        <InputLabel>Group Name*</InputLabel>
        <TextField
          value={formik.values.group_name}
          name="group_name"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'group_name') && getIn(formik.errors, 'group_name'))}
        />
        {getIn(formik.touched, 'group_name') && getIn(formik.errors, 'group_name') && (
          <FormHelperText error id="helper-text-first_name">
            {getIn(formik.errors, 'group_name')}
          </FormHelperText>
        )}
      </Grid>

      <Grid item xs={12} sm={6}>
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
          size="small"
          options={prinList?.tableData ?? []}
          fullWidth
          autoHighlight
          getOptionLabel={(option) => option?.prin_name || ''}
          renderInput={(params) => (
            <TextField {...params} error={Boolean(getIn(formik.touched, 'prin_code') && getIn(formik.errors, 'prin_code'))} />
          )}
        />
        {getIn(formik.touched, 'prin_code') && getIn(formik.errors, 'prin_code') && (
          <FormHelperText error id="helper-text-prin_code">
            {getIn(formik.errors, 'prin_code')}
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

export default AddGroupWmsForm;
