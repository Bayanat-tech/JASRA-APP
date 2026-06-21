import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, FormHelperText, Grid, TextField, } from '@mui/material';
//import { useQuery } from '@tanstack/react-query';
import useAuth from 'hooks/useAuth';
import { useFormik } from 'formik';
import { TContainerDetails } from 'pages/WMS/Transaction/Inbound/types/shipmentDetails.types';
import shipmentServiceInstance from 'service/wms/transaction/inbound/service.shipmentDetailsWms';
import { useEffect } from 'react';
import * as yup from 'yup';
import { getIn } from 'formik';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const AddInboundShipmentDetailsForm = ({
  existingData,
  job_no,
  container_no,
  prin_code,
  onClose,
  isEditMode
}: {
  job_no: string;
  container_no: string;
  prin_code: string;
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TContainerDetails;
}) => {
  const { user } = useAuth();

  // const { data: shipmentData, isFetched: isShipmentDataFetched } = useQuery<TContainerDetails | undefined>({
  //   queryKey: ['principal_data'],
  //   queryFn: () => shipmentServiceInstance.getShipment(prin_code, job_no),
  //   enabled: isEditMode === true
  // });

  const theme = createTheme({
    typography: {
      fontFamily: 'Roboto, Arial, sans-serif' // Set Roboto as the default font
    }
  });

  const formik = useFormik<TContainerDetails>({
    initialValues: {
      prin_code: '',
      company_code: user?.company_code,
      job_no: '',
      vessel_name: '',
      voyage_no: '',
      container_no: '',
      seal_no: '',
      container_size: null as unknown as number,
      container_type: 'NORMAL',
      bl_no: '',
      packdet_entered: 'N',
      user_id: '',
      user_dt: null as unknown as Date,
      moc1: '0',
      moc2: '0',
      act_code: '',
      uoc: '0',
      volume: null as unknown as number,
      net_weight: null as unknown as number,
      assigned_pda_user: '',
      po_no: '',
      sr_comp_code: '',
      sr_cust_code: '',
      supp_code: '',
      assigned_tally_user: '',
      unstuff_start: null as unknown as Date,
      unstuff_end: null as unknown as Date,
      tally_start_time: null as unknown as Date,
      tally_end_time: null as unknown as Date,
      putaway_start_time: null as unknown as Date,
      putaway_end_time: null as unknown as Date,
      old_container_no: '',
      old_vessel_name: '',
      old_voyage_no: '',
      sr_reason_code: '',
      promo_shift: '',
      hbl_no: '',
      asn_no: '',
      doc_ref_no: '',
      cust_decl_no: '',
      truck_no: ''
    },
    validationSchema: yup.object().shape({
      container_no: yup.string().required('This field is required'),
      vessel_name: yup.string().required('This field is required'),
      voyage_no: yup.string().required('This field is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      values.job_no = job_no;
      values.prin_code = prin_code;

      let response;
      if (isEditMode) {
        //   if (values.container_no) response = await shipmentServiceInstance.updateShipmentDetail(values,container_no, prin_code, job_no);
        // } else {
        if (values.container_no) response = await shipmentServiceInstance.updateShipmentDetail(values, container_no, prin_code, job_no);
      } else {
        response = await shipmentServiceInstance.createShipmentDetail(values);
      }
      if (response) {
        onClose(true);
        setSubmitting(false);
      }
    }
  });

  useEffect(() => {
    if (isEditMode && !!existingData) {
      formik.setValues({
        prin_code: existingData.prin_code,
        company_code: existingData.company_code,
        job_no: existingData.job_no,
        vessel_name: existingData.vessel_name,
        voyage_no: existingData.voyage_no,
        container_no: existingData.container_no,
        seal_no: existingData.seal_no,
        container_size: existingData.container_size,
        container_type: existingData.container_type,
        bl_no: existingData.bl_no,
        packdet_entered: existingData.packdet_entered,
        user_id: existingData.user_id,
        user_dt: existingData.user_dt,
        moc1: existingData.moc1,
        moc2: existingData.moc2,
        act_code: existingData.act_code,
        uoc: existingData.uoc,
        volume: existingData.volume,
        net_weight: existingData.net_weight,
        assigned_pda_user: existingData.assigned_pda_user,
        po_no: existingData.po_no,
        sr_comp_code: existingData.sr_comp_code,
        sr_cust_code: existingData.sr_cust_code,
        supp_code: existingData.supp_code,
        assigned_tally_user: existingData.assigned_tally_user,
        unstuff_start: existingData.unstuff_start,
        unstuff_end: existingData.unstuff_end,
        tally_start_time: existingData.tally_start_time,
        tally_end_time: existingData.tally_end_time,
        putaway_start_time: existingData.putaway_start_time,
        putaway_end_time: existingData.putaway_end_time,
        old_container_no: existingData.old_container_no,
        old_vessel_name: existingData.old_vessel_name,
        old_voyage_no: existingData.old_voyage_no,
        sr_reason_code: existingData.sr_reason_code,
        promo_shift: existingData.promo_shift,
        hbl_no: existingData.hbl_no,
        asn_no: existingData.asn_no,
        doc_ref_no: existingData.doc_ref_no,
        cust_decl_no: existingData.cust_decl_no,
        truck_no: existingData.truck_no
      }); // Set form values when shipment data is fetched
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, existingData]); // Added missing dependencies

  return (
    <ThemeProvider theme={theme}>
      <Grid sx={{paddingTop: '16px'}} container spacing={2} component={'form'} onSubmit={formik.handleSubmit}>
        <Grid item xs={12}>
          <Grid container spacing={2}>
            {/* <Grid item xs={12}>
              <Typography variant="h4" className="text-black py-2 font-medium">
                Shipment Details
              </Typography>
            </Grid> */}

            <Grid item xs={12} sm={6}>
              {/* <InputLabel>Container No*</InputLabel> */}
              <TextField
                size="small"
                value={formik.values.container_no}
                label="Container No.*"
                name="container_no"
                onChange={formik.handleChange}
                //className="w-28"
                fullWidth
                error={Boolean(getIn(formik.touched, 'container_no') && getIn(formik.errors, 'container_no'))}
              />
              {getIn(formik.touched, 'container_no') && getIn(formik.errors, 'container_no') && (
                <FormHelperText error>{getIn(formik.errors, 'container_no')}</FormHelperText>
              )}
            </Grid>

            {/* Vessel Number */}
            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                value={formik.values.vessel_name}
                label="Vessel No.*"
                name="vessel_name"
                onChange={formik.handleChange}
                fullWidth
                error={Boolean(getIn(formik.touched, 'vessel_name') && getIn(formik.errors, 'vessel_name'))}
              />
              {getIn(formik.touched, 'vessel_name') && getIn(formik.errors, 'vessel_name') && (
                <FormHelperText error>{getIn(formik.errors, 'vessel_name')}</FormHelperText>
              )}
            </Grid>

            {/* Voyage Number */}
            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                value={formik.values.voyage_no}
                label="Voyage No.*"
                name="voyage_no"
                onChange={formik.handleChange}
                fullWidth
                error={Boolean(getIn(formik.touched, 'voyage_no') && getIn(formik.errors, 'voyage_no'))}
              />
              {getIn(formik.touched, 'voyage_no') && getIn(formik.errors, 'voyage_no') && (
                <FormHelperText error>{getIn(formik.errors, 'voyage_no')}</FormHelperText>
              )}
            </Grid>

            {/* Seal Number */}
            <Grid item xs={12} sm={6}>
              <TextField
                size="small"
                value={formik.values.seal_no}
                label="Seal No."
                name="seal_no"
                onChange={formik.handleChange}
                fullWidth
                error={Boolean(getIn(formik.touched, 'seal_no') && getIn(formik.errors, 'seal_no'))}
              />
              {getIn(formik.touched, 'seal_no') && getIn(formik.errors, 'seal_no') && (
                <FormHelperText error>{getIn(formik.errors, 'seal_no')}</FormHelperText>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              {/* <InputLabel>Truck No</InputLabel> */}
              <TextField
                size="small"
                value={formik.values.truck_no}
                label="Truck No."
                name="truck_no"
                onChange={formik.handleChange}
                fullWidth
                error={Boolean(getIn(formik.touched, 'truck_no') && getIn(formik.errors, 'truck_no'))}
              />
              {getIn(formik.touched, 'truck_no') && getIn(formik.errors, 'truck_no') && (
                <FormHelperText error>{getIn(formik.errors, 'truck_no')}</FormHelperText>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              {/* <InputLabel>PO (Purchase Order) No*</InputLabel> */}
              <TextField
                size="small"
                value={formik.values.po_no}
                label="PO (Purchase Order) No."
                name="po_no"
                onChange={formik.handleChange}
                //className="w-28"
                fullWidth
                error={Boolean(getIn(formik.touched, 'po_no') && getIn(formik.errors, 'po_no'))}
              />
              {getIn(formik.touched, 'po_no') && getIn(formik.errors, 'po_no') && (
                <FormHelperText error>{getIn(formik.errors, 'po_no')}</FormHelperText>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              {/* <InputLabel>ASN No</InputLabel> */}
              <TextField
                size="small"
                value={formik.values.asn_no}
                label="ASN No."
                name="asn_no"
                onChange={formik.handleChange}
                fullWidth
                error={Boolean(getIn(formik.touched, 'asn_no') && getIn(formik.errors, 'asn_no'))}
              />
              {getIn(formik.touched, 'asn_no') && getIn(formik.errors, 'asn_no') && (
                <FormHelperText error>{getIn(formik.errors, 'asn_no')}</FormHelperText>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              {/* <InputLabel>BL (Bill of Lading) No</InputLabel> */}
              <TextField
                size="small"
                value={formik.values.bl_no}
                label="BL (Bill of Lading) No."
                name="bl_no"
                onChange={formik.handleChange}
                fullWidth
                error={Boolean(getIn(formik.touched, 'bl_no') && getIn(formik.errors, 'bl_no'))}
              />
              {getIn(formik.touched, 'bl_no') && getIn(formik.errors, 'bl_no') && (
                <FormHelperText error>{getIn(formik.errors, 'bl_no')}</FormHelperText>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              {/* <InputLabel>Doc Ref No</InputLabel> */}
              <TextField
                size="small"
                value={formik.values.doc_ref_no}
                label="Doc Ref No."
                name="doc_ref_no"
                onChange={formik.handleChange}
                fullWidth
                error={Boolean(getIn(formik.touched, 'doc_ref_no') && getIn(formik.errors, 'doc_ref_no'))}
              />
              {getIn(formik.touched, 'doc_ref_no') && getIn(formik.errors, 'doc_ref_no') && (
                <FormHelperText error>{getIn(formik.errors, 'doc_ref_no')}</FormHelperText>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              {/* <InputLabel>Customs Declaration No</InputLabel> */}
              <TextField
                size="small"
                value={formik.values.cust_decl_no}
                label="Customs Declaration No."
                name="cust_decl_no"
                onChange={formik.handleChange}
                fullWidth
                error={Boolean(getIn(formik.touched, 'cust_decl_no') && getIn(formik.errors, 'cust_decl_no'))}
              />
              {getIn(formik.touched, 'cust_decl_no') && getIn(formik.errors, 'cust_decl_no') && (
                <FormHelperText error>{getIn(formik.errors, 'cust_decl_no')}</FormHelperText>
              )}
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12} sm={12}>
          <Button
           sx={{
            float: "right",
            backgroundColor: "#fff",
            color: "#082A89",
            border: "1.5px solid #082A89",
            fontWeight: 600,
            '&:hover': {
              backgroundColor: "#082A89",
              color: "#fff",
              border: "1.5px solid #082A89"
            }
          }}
            type="submit"
            variant="contained"
            color="primary"
            startIcon={formik.isSubmitting ? <LoadingOutlined /> : <SaveOutlined />}
          >
            {isEditMode ? 'Update' : 'Create'}
          </Button>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
};

export default AddInboundShipmentDetailsForm;
