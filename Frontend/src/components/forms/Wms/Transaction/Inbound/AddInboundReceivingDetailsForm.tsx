// import { SaveOutlined } from '@ant-design/icons';
import {
  // Autocomplete,
  Button,
  // FormControl,
  // FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  // InputLabel,
  // OutlinedInput,
  TextField,
  Typography
} from '@mui/material';
// import { useQuery } from '@tanstack/react-query';
import { useFormik, getIn } from 'formik';
// import { TPackingDetails } from 'pages/WMS/Transaction/Inbound/types/packingDetails.types';
import { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import WmsSerivceInstance from 'service/wms/service.wms';
import * as Yup from 'yup';
// import DataSelection from 'components/popup/DataSelection';
// import { TPair } from 'types/common';
// import axios from 'utils/axios'; // Change this import to use configured axios instance
import useAuth from 'hooks/useAuth';
import { SearchOutlined } from '@ant-design/icons';
import {
  // Autocomplete,
  // Button,
  FormControl,
  FormHelperText,
  // Grid,
  // IconButton,
  // InputAdornment,
  InputLabel,
  OutlinedInput,
  // Typography
} from '@mui/material';
interface IAddInboundReceivingDetailsFormProps {
  isEditMode: boolean;
  onClose: (isSuccess: boolean) => void;
  job_no: string;
  prin_code: string;
  packdet_no: string;
  initialData?: {
    qty1_arrived:number;
    qty2_arrived:number;
    quantity_arrived:number;
    prod_code: string;
    prod_name: string;
    pack_qty: number;
    qty_luom: number;
    qty_puom:number;
    received_qty: number;
    container_no: string;
    batch_no: string;
    lot_no: string;
    mfg_date: Date;
    exp_date: Date;
    manu_code: string;
    origin_country: string;
    doc_ref: string;
    gross_weight: number;
    volume: number;
    shelf_life_days: number;
    shelf_life_date: Date;
    po_no: string;
    p_uom: string;
    l_uom: string;
    uppp: number;
    uom_count: number;
    quantity:number;
    qty_arrived_string?: string | null;
    qty_arrived?: number | string;
    QTY_ARRIVED_STRING?: string | null;
  };
}

const AddInboundReceivingDetailsForm = (props: IAddInboundReceivingDetailsFormProps) => {
  console.log('AddInboundReceivingDetailsForm rendered with props:', props); // Enhanced logging
  const [isProductDataSelection, setIsProductDataSelection] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ prod_name: string; uom_count: number; uppp: number }>();
  const { user } = useAuth();

  // const { data: containerData } = useQuery({
  //   queryKey: ['container_no', props.job_no, props.prin_code],
  //   queryFn: async () => {
  //     const response = await WmsSerivceInstance.getMasters('wms', 'shipment_details_container', undefined, undefined, props.job_no);
  //     if (response) {
  //       return {
  //         tableData: response.tableData as any[],
  //         count: response.count
  //       };
  //     }
  //     return { tableData: [], count: 0 };
  //   },
  //   enabled: !!props.job_no && !!props.prin_code
  // });

  const formik = useFormik({
    initialValues: {
      prod_code: '',
      pack_qty: 0,
      qty_puom: 0,
      qty_luom: 0,
      received_qty: 0,
      container_no: '',
      qty1_arrived: 0,
      qty2_arrived: 0,
      quantity_arrived: 0,
      batch_no: '',
      lot_no: '',
      mfg_date: null as unknown as Date,
      exp_date: null as unknown as Date,
      manu_code: '',
      origin_country: '',
      doc_ref: '',
      gross_weight: null as number | null,
      volume: null as number | null,
      shelf_life_days: null as number | null,
      shelf_life_date: null as unknown as Date,
      po_no: '',
      p_uom: '',
      l_uom: '',
      uppp: 0,
      submit: '',
      
    },
    validationSchema: Yup.object().shape({
      prod_code: Yup.string().required('Product is required'),
      pack_qty: Yup.number().min(0, 'Cannot be negative').required('Packing quantity is required'),
      qty_luom: Yup.number().min(0, 'Cannot be negative'),
      received_qty: Yup.number().min(0, 'Cannot be negative').required('Received quantity is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      await directSubmit();
      setSubmitting(false);
    }
  });

  // Remove or comment out the old updatePackingDetailsQuantity function
  // const updatePackingDetailsQuantity = async ({
  //   companyCode,
  //   prinCode,
  //   jobNo,
  //   packdetNo,
  //   qty1Arrived,
  //   qty2Arrived,
  //   receivedQty
  // }: {
  //   companyCode?: string;
  //   prinCode: string;
  //   jobNo: string;
  //   packdetNo: string;
  //   qty1Arrived: number;
  //   qty2Arrived: number;
  //   receivedQty: number;
  // }) => {
  //   try {
  //     if (!companyCode) {
  //       throw new Error('Company code is required');
  //     }
      
  //     console.log('Executing SQL update with parameters:', {
  //       companyCode, prinCode, jobNo, packdetNo, qty1Arrived, qty2Arrived, receivedQty
  //     });
      
  //     const query_parameter = `Inbound-PackdetUpd_Qty$$$${companyCode}`;
  //     const query_where = `\`1$string\` = '${user?.company_code}' AND \`2$string\` = '${props.prin_code}' AND \`3$string\` = '${props.job_no}' AND \`4$string\` = ${props.packdet_no}`;
  //     const query_updatevalues = `${qty1Arrived}$$$${qty2Arrived}$$$CURRENT_DATE()$$$${receivedQty}`;

  //     console.log('SQL parameters:', { query_parameter, query_where, query_updatevalues });

  //     type UpdateResponseType = { success?: boolean; [key: string]: any } | Array<{ success?: boolean; [key: string]: any }>;
  //     const updateResponse = await WmsSerivceInstance.executeRawSqlbody(
  //       query_parameter,
  //       query_where,
  //       query_updatevalues
  //     ) as UpdateResponseType;

  //     console.log('SQL update response:', updateResponse);

  //     if (
  //       !updateResponse ||
  //       (Array.isArray(updateResponse)
  //         ? !updateResponse[0]?.success
  //         : !updateResponse.success)
  //     ) {
  //       throw new Error('Failed to update packing details quantity');
  //     }

  //     return updateResponse;
  //   } catch (error) {
  //     console.error('Error in updatePackingDetailsQuantity:', error);
  //     throw error;
  //   }
  // };

  // const handlePreferenceSelection = (data: TPair<'uom_count' | 'uppp' | 'p_uom' | 'l_uom'>) => {
  //   formik.setFieldValue('prod_code', data.value);
  //   formik.setFieldValue('p_uom', data.p_uom);
  //   formik.setFieldValue('l_uom', data.l_uom);
  //   formik.setFieldValue('uppp', data.uppp as number);
  //   setSelectedProduct({ prod_name: data.label, uom_count: data.uom_count, uppp: data.uppp });
  //   setIsProductDataSelection(!isProductDataSelection);
  // };

  useEffect(() => {
    if (!!selectedProduct) {
      if (selectedProduct?.uom_count <= 1) {
        formik.setFieldValue('quantity_arrived', Number(formik.values?.qty1_arrived) + Number(formik.values.qty2_arrived));
        return;
      }
      formik.setFieldValue('quantity_arrived', Number(formik.values?.qty1_arrived) * selectedProduct?.uppp + Number(formik.values.qty2_arrived));
    }
  }, [formik.values.qty1_arrived, formik.values.qty2_arrived]);

  useEffect(() => {
    if (props.isEditMode && props.initialData) {
      console.log('Initializing form with initialData:', props.initialData);
      
      // Parse quantities from various possible sources
      // Priority: qty1_arrived > QTY_PUOM > qty_arrived
      let primaryQty = 0;
      let secondaryQty = 0;
      
      if (props.initialData.qty1_arrived !== undefined && props.initialData.qty1_arrived !== null) {
        primaryQty = Number(props.initialData.qty1_arrived);
      } else if (props.initialData.qty_puom !== undefined && props.initialData.qty_puom !== null) {
        primaryQty = Number(props.initialData.qty_puom);
      } else if (props.initialData.quantity !== undefined && props.initialData.quantity !== null) {
        primaryQty = Number(props.initialData.quantity);
      }
      
      if (props.initialData.qty2_arrived !== undefined && props.initialData.qty2_arrived !== null) {
        secondaryQty = Number(props.initialData.qty2_arrived);
      } else if (props.initialData.qty_luom !== undefined && props.initialData.qty_luom !== null) {
        secondaryQty = Number(props.initialData.qty_luom);
      }
      
      // Calculate total quantity
      const uppp = props.initialData.uppp || 1;
      const totalQty = uppp > 1 ? (primaryQty * uppp) + secondaryQty : primaryQty + secondaryQty;
      
      console.log('Parsed quantities:', { primaryQty, secondaryQty, totalQty, uppp });
      
      // Set all form values including product info
      formik.setValues({
        prod_code: props.initialData.prod_code || '',
        pack_qty: props.initialData.pack_qty || 0,
        qty_puom: props.initialData.qty_puom || 0,
        qty_luom: props.initialData.qty_luom || 0,
        received_qty: props.initialData.received_qty || 0,
        container_no: props.initialData.container_no || '',
        qty1_arrived: primaryQty,
        qty2_arrived: secondaryQty,
        quantity_arrived: totalQty,
        batch_no: props.initialData.batch_no || '',
        lot_no: props.initialData.lot_no || '',
        mfg_date: props.initialData.mfg_date || null,
        exp_date: props.initialData.exp_date || null,
        manu_code: props.initialData.manu_code || '',
        origin_country: props.initialData.origin_country || '',
        doc_ref: props.initialData.doc_ref || '',
        gross_weight: props.initialData.gross_weight || null,
        volume: props.initialData.volume || null,
        shelf_life_days: props.initialData.shelf_life_days || null,
        shelf_life_date: props.initialData.shelf_life_date || null,
        po_no: props.initialData.po_no || '',
        p_uom: props.initialData.p_uom || '',
        l_uom: props.initialData.l_uom || '',
        uppp: uppp,
        submit: ''
      });
      
      // Set the selected product to display the product name
      setSelectedProduct({
        prod_name: props.initialData.prod_name || '',
        uom_count: props.initialData.uom_count || (uppp > 1 ? 2 : 1),
        uppp: uppp
      });
      
      console.log('Form initialized with values:', formik.values);
      console.log('Selected product set:', { 
        prod_name: props.initialData.prod_name, 
        uom_count: props.initialData.uom_count || (uppp > 1 ? 2 : 1), 
        uppp 
      });
    }
  }, [props.isEditMode, props.initialData]);

  // Replace the directSubmit function
  const directSubmit = async () => {
    try {
      // Enhanced logging for debugging
      console.log("DIRECT SUBMIT - Current state:", {
        prinCode: props.prin_code,
        jobNo: props.job_no,
        packdetNo: props.packdet_no,
        formValues: formik.values,
        selectedProduct
      });
      
      // Check each required value individually with detailed error messages
      if (!props.prin_code) {
        alert("Missing required data: Principal code (prin_code) is not provided");
        console.error("Missing prin_code from props:", props);
        return;
      }
      
      if (!props.job_no) {
        alert("Missing required data: Job number (job_no) is not provided");
        console.error("Missing job_no from props:", props);
        return;
      }
      
      if (!props.packdet_no) {
        alert("Missing required data: Packing detail number (packdet_no) is not provided");
        console.error("Missing packdet_no from props:", props);
        return;
      }
      
      // Validate that we have at least some quantity
      const qty1_arrived = Number(formik.values.qty1_arrived) || 0;
      const qty2_arrived = Number(formik.values.qty2_arrived) || 0;
      
      if (qty1_arrived === 0 && qty2_arrived === 0) {
        alert("Please enter a quantity before submitting");
        return;
      }
      
      // Prepare params and payload
      const params = {
        prin_code: props.prin_code,
        job_no: props.job_no,
        packdet_no: props.packdet_no
      };
      
      const payload = {
        qty1_arrived: qty1_arrived,
        qty2_arrived: qty2_arrived
      };
      
      console.log("DIRECT SUBMIT - Calling PUT API with:", { params, payload });
      
      // Call the new PUT API
      const result = await WmsSerivceInstance.putMasters(
        'wms',
        'inbound/packing_details/receiving',
        params,
        payload
      );
      
      console.log("PUT API RESULT:", result);
      
      if (!result || !result.success) {
        throw new Error("API update returned unsuccessful result");
      }
      
      // Success - close the form
      props.onClose(true);
      
    } catch (error) {
      console.error("DIRECT SUBMIT ERROR:", error);
      alert("Error: " + (error instanceof Error ? error.message : "Unknown error occurred"));
    }
  };
  
  // Add this effect to reset qty2_arrived when uppp is 1
  useEffect(() => {
    if (selectedProduct && selectedProduct.uppp === 1) {
      formik.setFieldValue('qty2_arrived', 0);
    }
  }, [selectedProduct?.uppp]);
  
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault(); // Prevent default form submission
        directSubmit(); // Call our direct submit function instead
      }}
      style={{ width: '100%' }}
    >
      <Grid sx={{paddingTop:"20px", paddingLeft: "15px"}} container spacing={2}>
        {/* Add Debug Info Section */}

        {/* <Grid item xs={12}>
          <Typography variant="h4" className="text-black py-2 font-semibold">
            Add Quantity
          </Typography>
        </Grid> */}

        {/* Container Number */}
        {/* <Grid item xs={12} sm={6}>
          <Autocomplete
            id="container_no"
            value={
              formik.values.container_no ? containerData?.tableData?.find((c) => c.container_no === formik.values.container_no) : null
            }
            onChange={(event, value: TPackingDetails | null) => {
              formik.setFieldValue('container_no', value?.container_no);
              formik.setFieldValue('po_no', value?.po_no);
            }}
            size="small"
            options={containerData?.tableData ?? []}
            fullWidth
            autoHighlight
            getOptionLabel={(option) => option.container_no}
            renderInput={(params) => <TextField {...params} label="Container No." />}
          />
        </Grid> */}

        {/* Quantity Section */}
        <Grid  item xs={12} container spacing={2}>
          {/* Product Selection */}
          <Grid item xs={12} sm={6}>
            <Typography sx={{fontWeight: 'bold',  paddingBottom: '4px'}}>Product</Typography>
            <TextField
              size="medium"
              id="prod_code"
              fullWidth
              disabled
              value={selectedProduct?.prod_name}
              placeholder={!selectedProduct?.prod_name ? 'Product/SKU' : undefined}
              error={getIn(formik.touched, 'prod_code') && Boolean(getIn(formik.errors, 'prod_code'))}
              helperText={getIn(formik.touched, 'prod_code') && getIn(formik.errors, 'prod_code')}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => setIsProductDataSelection(!isProductDataSelection)}>
                    <SearchOutlined />
                  </IconButton>
                )
              }}
            />
          </Grid>
          
          {/* All Quantities in one column */}
          <Grid item xs={12} sm={6} container spacing={2}>
            {/* Quantity 1 */}
            {/* <Grid item xs={12}> */}

            {/* </Grid> */}

                      {/* <Grid item xs={12} sm={4}>
  
                      </Grid> */}

            <Grid item xs={12}>
              {/* <Typography sx={{fontWeight: 'bold', paddingBottom: '4px'}}> Quantity </Typography> */}
                                    <FormControl fullWidth variant="outlined" size="small" disabled={!!selectedProduct?.uom_count ? false : true}>
                          <InputLabel 
                            htmlFor="qty1_arrived" 
                            shrink={true}
                          >
                            Quantity (Primary)
                          </InputLabel>
                          <OutlinedInput
                            id="qty1_arrived"
                            name="qty1_arrived"
                            type="number"
                            value={formik.values.qty1_arrived}
                            onChange={(event) => {
                              const inputValue = event.target.value;
                              if (inputValue.charAt(0) !== '-') {
                                formik.setFieldValue('qty1_arrived', inputValue);
                              }
                            }}
                            inputProps={{ min: 0 }}
                            placeholder={props.initialData?.QTY_ARRIVED_STRING ? `Received: ${props.initialData.QTY_ARRIVED_STRING}` : undefined}
                            endAdornment={<InputAdornment position="end">{formik.values.p_uom}</InputAdornment>}
                            label="Quantity (Primary)"
                          />
                          {getIn(formik.touched, 'qty1_arrived') && getIn(formik.errors, 'qty1_arrived') && (
                            <FormHelperText error id="helper-text-qty1_arrived">
                              {getIn(formik.errors, 'qty1_arrived')}
                            </FormHelperText>
                          )}
                        </FormControl>
              {/* <TextField
                fullWidth
                disabled={!!selectedProduct?.uom_count ? false : true}
                size="small"
                id="qty1_arrived"
                name="qty1_arrived"
                type="number"
                placeholder="Quantity 1(Primary)"
                value={formik.values.qty1_arrived}
                // Remove disabled or set to false to make the field editable
                // disabled={!selectedProduct?.uom_count}
                onChange={(event) => {
                  const inputValue = event.target.value;
                  console.log('qty1_arrived changed:', inputValue); // Debug: log change
                  if (inputValue.charAt(0) !== '-') {
                    formik.setFieldValue('qty1_arrived', inputValue);
                  }
                }}
                error={getIn(formik.touched, 'qty1_arrived') && Boolean(getIn(formik.errors, 'qty1_arrived'))}
                helperText={getIn(formik.touched, 'qty1_arrived') && getIn(formik.errors, 'qty1_arrived')}
                InputProps={{
                  endAdornment: <InputAdornment position="end">{formik.values.p_uom}</InputAdornment>
                }}
              /> */}
            </Grid>

            {/* Quantity 2 */}
            <Grid item xs={12}>
              <FormControl 
                fullWidth 
                variant="outlined" 
                size="small" 
                disabled={!selectedProduct?.uom_count || selectedProduct?.uppp === 1}
              >
                <InputLabel 
                  htmlFor="qty2_arrived" 
                  shrink={true}
                >
                  Quantity (Secondary)
                </InputLabel>
                <OutlinedInput
                  id="qty2_arrived"
                  name="qty2_arrived"
                  type="number"
                  value={formik.values.qty2_arrived}
                  onChange={(event) => {
                    const inputValue = event.target.value;
                    if (inputValue.charAt(0) !== '-') {
                      formik.setFieldValue('qty2_arrived', inputValue);
                    }
                  }}
                  inputProps={{ min: 0 }}
                  endAdornment={<InputAdornment position="end">{formik.values.l_uom}</InputAdornment>}
                  label={`Quantity (Secondary)${selectedProduct?.uppp === 1 ? ' (Disabled)' : ''}`}
                />
                {getIn(formik.touched, 'qty2_arrived') && getIn(formik.errors, 'qty2_arrived') && (
                  <FormHelperText error id="helper-text-qty2_arrived">
                    {getIn(formik.errors, 'qty2_arrived')}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>

            {/* Total Quantity */}
            <Grid item xs={12}>
              <FormControl fullWidth variant="outlined" size="small" disabled={!!selectedProduct?.uom_count ? false : true}>
                <InputLabel 
                  htmlFor="quantity_arrived" 
                  shrink={true}
                >
                  Total Quantity
                </InputLabel>
                <OutlinedInput
                  id="quantity_arrived"
                  name="quantity_arrived"
                  type="number"
                  disabled
                  value={formik.values.quantity_arrived}
                  onChange={(event) => {
                    const inputValue = event.target.value;
                    if (inputValue.charAt(0) !== '-') {
                      formik.setFieldValue('quantity_arrived', inputValue);
                    }
                  }}
                  inputProps={{ min: 0 }}
                  endAdornment={
                    <InputAdornment position="end">
                      {formik.values.p_uom === formik.values.l_uom || !formik.values.l_uom
                        ? formik.values.p_uom
                        : `${formik.values.p_uom}  ${formik.values.l_uom}`}
                    </InputAdornment>
                  }
                  label="Total Quantity"
                />
                {getIn(formik.touched, 'quantity_arrived') && getIn(formik.errors, 'quantity_arrived') && (
                  <FormHelperText error id="helper-text-quantity_arrived">
                    {getIn(formik.errors, 'quantity_arrived')}
                  </FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </Grid>

        {/* Add error display for general form errors */}
        {formik.errors.submit && (
          <Grid item xs={12}>
            <Typography color="error" variant="body2">
              {formik.errors.submit}
            </Typography>
          </Grid>
        )}

        {/* Move the submit button inside the form */}
        <Grid item xs={12} className="flex justify-end">
          <Button
            sx={{
              backgroundColor: '#fff',
              color: '#082A89',
              border: '1.5px solid #082A89',
              fontWeight: 600,
              marginRight: '10px',
              '&:hover': {
                backgroundColor: '#082A89',
                color: '#fff',
                border: '1.5px solid #082A89'
              }
            }}
            onClick={directSubmit} // Direct function call on click
            variant="contained"
            disabled={!user?.company_code || !props.prin_code || !props.job_no || !props.packdet_no}
          >
            <FormattedMessage id="Submit" defaultMessage="Submit " />
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};



export default AddInboundReceivingDetailsForm