// import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
// import { Button, FormHelperText, Grid, InputLabel } from '@mui/material';
// import TextField from '@mui/material/TextField';
// import { getIn, useFormik } from 'formik';
// import useAuth from 'hooks/useAuth';
// import { Tsecrollmaster } from 'pages/Security/type/flowmaster-sec-types';
// import { useEffect } from 'react';
// import GmSecServiceInstance from 'service/security/services.gm_security';
// import * as yup from 'yup';

// const AddSecRoleWmsForm = ({
//   onClose,
//   isEditMode,
//   existingData
// }: {
//   onClose: (refetchData?: boolean) => void;
//   isEditMode: Boolean;
//   existingData: Tsecrollmaster;
// }) => {
//   //-------------------constants-------------------
//   const { user } = useAuth();
//   //------------------formik-----------------
//   const formik = useFormik<Tsecrollmaster>({
//     initialValues: { company_code: user?.company_code, role_id: '', role_desc: '', remarks: '' },
//     validationSchema: yup.object().shape({
//       // country_code: yup.string().required('This field is required')
//     }),
//     onSubmit: async (values, { setSubmitting }) => {
//       setSubmitting(true);
//       let response;
//       if (isEditMode) {
//         response = await GmSecServiceInstance.editsecrolemaster(values);
//       } else {
//         response = await GmSecServiceInstance.addsecrolemaster(values);
//       }
//       if (response) {
//         onClose(true);
//         setSubmitting(false);
//       }
//     }
//   });
//   useEffect(() => {
//     console.log(formik.errors);
//   }, [formik.errors]);
//   //------------------Handlers------------
//   // const handleCountryGccChange = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
//   //   formik.setFieldValue('country_gcc', checked ? 'Y' : 'N');
//   // };
//   useEffect(() => {
//     if (isEditMode) {
//       const { updated_at, updated_by, created_at, created_by, ...countryData } = existingData;
//       console.log(updated_at, updated_by, created_at, created_by);

//       formik.setValues(countryData);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isEditMode]);

//   return (
//     <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
//       <Grid item xs={12}>
//         <InputLabel>Role ID</InputLabel>
//         <TextField
//           value={formik.values.role_id}
//           name="role_id"
//           disabled={isEditMode === true}
//           onChange={formik.handleChange}
//           className="w-28"
//           error={Boolean(getIn(formik.touched, 'salesman_code"') && getIn(formik.errors, 'salesman_code"'))}
//         />
//         {getIn(formik.touched, 'role_id') && getIn(formik.errors, 'role_id') && (
//           <FormHelperText error id="helper-text-first_name">
//             {getIn(formik.errors, 'role_id')}
//           </FormHelperText>
//         )}
//       </Grid>
//       <Grid item xs={12} sm={5}>
//         <InputLabel>Role Description*</InputLabel>
//         <TextField
//           value={formik.values.role_desc}
//           name="role_desc"
//           onChange={formik.handleChange}
//           fullWidth
//           error={Boolean(getIn(formik.touched, 'role_desc') && getIn(formik.errors, 'role_desc'))}
//         />
//         {getIn(formik.touched, 'role_desc') && getIn(formik.errors, 'role_desc') && (
//           <FormHelperText error id="helper-text-first_name">
//             {getIn(formik.errors, 'role_desc')}
//           </FormHelperText>
//         )}
//       </Grid>
//       <Grid item xs={12} sm={5}>
//         <InputLabel>Remarks</InputLabel>
//         <TextField
//           value={formik.values.remarks}
//           name="remarks"
//           onChange={formik.handleChange}
//           fullWidth
//           error={Boolean(getIn(formik.touched, 'salesman_name') && getIn(formik.errors, 'salesman_name'))}
//         />
//         {getIn(formik.touched, 'remarks') && getIn(formik.errors, 'remarks') && (
//           <FormHelperText error id="helper-text-first_name">
//             {getIn(formik.errors, 'remarks')}
//           </FormHelperText>
//         )}
//       </Grid>
//       <Grid item xs={12} className="flex justify-end">
//         <Button
//           type="submit"
//           variant="contained"
//           disabled={formik.isSubmitting}
//           startIcon={formik.isSubmitting ? <LoadingOutlined /> : <SaveOutlined />}
//         >
//           Submit
//         </Button>
//       </Grid>
//     </Grid>
//   );
// };
// export default AddSecRoleWmsForm;
// import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid } from '@mui/material';
import TextField from '@mui/material/TextField';
import CustomAlert from 'components/@extended/CustomAlert';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { Tsecrollmaster } from 'pages/Security/type/flowmaster-sec-types';
import { useEffect } from 'react';
import { IoSendSharp } from 'react-icons/io5';
import GmSecServiceInstance from 'service/security/services.gm_security';
import { dispatch } from 'store';
import { showAlert } from 'store/CustomAlert/alertSlice';
import * as yup from 'yup';

const AddSecRoleWmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: Tsecrollmaster;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();

  //------------------formik-----------------
  const formik = useFormik<Tsecrollmaster>({
    initialValues: { company_code: user?.company_code, role_id: '', role_desc: '', remarks: '' },
    validationSchema: yup.object().shape({
      // Add validation rules here if needed
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      try {
        if (isEditMode) {
          response = await GmSecServiceInstance.editsecrolemaster(values);
        } else {
          response = await GmSecServiceInstance.addsecrolemaster(values);
        }

        if (response) {
          dispatch(
            showAlert({
              open: true,
              message: isEditMode ? 'Role updated successfully!' : 'Role added successfully!',
              severity: 'success'
            })
          );
          onClose(true);
        } else {
          dispatch(
            showAlert({
              open: true,
              message: 'Operation failed. Please try again.',
              severity: 'error'
            })
          );
        }
      } catch (error) {
        console.error('Error in role master operation:', error);
        dispatch(
          showAlert({
            open: true,
            message: 'An unexpected error occurred!',
            severity: 'error'
          })
        );
      } finally {
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
      const { updated_at, updated_by, created_at, created_by, ...countryData } = existingData;
      console.log(updated_at, updated_by, created_at, created_by);

      formik.setValues(countryData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  return (
    <Grid container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12}>
        <CustomAlert />
        <TextField
          label="Role ID"
          value={formik.values.role_id}
          name="role_id"
          disabled
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'role_id') && getIn(formik.errors, 'role_id'))}
        />
        {getIn(formik.touched, 'role_id') && getIn(formik.errors, 'role_id') && (
          <FormHelperText error id="helper-text-role_id">
            {getIn(formik.errors, 'role_id')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Role Description*"
          value={formik.values.role_desc}
          name="role_desc"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'role_desc') && getIn(formik.errors, 'role_desc'))}
        />
        {getIn(formik.touched, 'role_desc') && getIn(formik.errors, 'role_desc') && (
          <FormHelperText error id="helper-text-role_desc">
            {getIn(formik.errors, 'role_desc')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          label="Remarks"
          value={formik.values.remarks}
          name="remarks"
          onChange={formik.handleChange}
          fullWidth
          error={Boolean(getIn(formik.touched, 'remarks') && getIn(formik.errors, 'remarks'))}
        />
        {getIn(formik.touched, 'remarks') && getIn(formik.errors, 'remarks') && (
          <FormHelperText error id="helper-text-remarks">
            {getIn(formik.errors, 'remarks')}
          </FormHelperText>
        )}
      </Grid>
      <Grid item xs={12} className="flex justify-start">
        <Button
          variant="outlined"
          color="primary"
          size="small"
          endIcon={<IoSendSharp />}
          type="submit"
          disabled={formik.isSubmitting}
          startIcon={formik.isSubmitting}
        >
          Submit
        </Button>
      </Grid>
    </Grid>
  );
};

export default AddSecRoleWmsForm;
