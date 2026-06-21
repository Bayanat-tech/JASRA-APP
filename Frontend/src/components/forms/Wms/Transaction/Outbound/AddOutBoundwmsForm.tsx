import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Autocomplete, FormControl, FormHelperText, InputLabel, MenuItem, Select } from '@mui/material';
import TextField from '@mui/material/TextField';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'store';
import { TJobInboundWms } from 'pages/WMS/Transaction/Inbound/types/jobInbound_wms.types';
import { useEffect, useState } from 'react';
import { TPrincipalWms } from 'pages/WMS/types/principal-wms.types';
import * as yup from 'yup';
import WmsSerivceInstance from 'service/service.wms';
import { TDepartment } from 'pages/WMS/types/department-wms.types';
import { TDivision } from 'pages/WMS/types/division-wms.types';
import { TCountry } from 'pages/WMS/types/country-wms.types';
import { TPort } from 'pages/WMS/types/Port-wms.types';
import CreateInboundJobServiceInstance from 'service/wms/transaction/inbound/service.inboundJobcreateWms';
//import PfSerivceInstance from 'service/service.purhaseflow';

//import { values } from 'lodash';

const AddOutBoundwmsForm = ({
  onClose,
  isEditMode,
  existingData
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  existingData: TJobInboundWms;
}) => {
  //-------------------constants-------------------
  const { user } = useAuth();
  const { app } = useSelector((state) => state.menuSelectionSlice);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string | null>(null);
console.log('existingData',existingData);
  const { data: prinList } = useQuery({
    queryKey: ['principal_code', app],
    queryFn: async () => {
      if (!app) return { tableData: [], count: 0 };
      console.log('principal');
      const response = await WmsSerivceInstance.proc_build_dynamic_sql_wms({
        parameter: 'ddprincipal', // 🔁 replaced "division" with "principal"
        loginid: user?.loginid ?? '',
        code1: user?.company_code ?? '',
        code2: 'NULL',
        code3: 'NULL',
        code4: 'NULL',
        number1: 0,
        number2: 0,
        number3: 0,
        number4: 0,
        date1: null,
        date2: null,
        date3: null,
        date4: null
      });

      // ✔ FIX: response is array → wrap into expected shape
      const tableData = Array.isArray(response) ? (response as TPrincipalWms[]) : [];
      const count = tableData.length;

      return { tableData, count };
    },
    enabled: !!app
  });
  console.log('department');
  const { data: departmentaList } = useQuery({
    queryKey: ['manufacturer_data', app],
    queryFn: async () => {
      if (!app) return { tableData: [], count: 0 };

      const response = await WmsSerivceInstance.proc_build_dynamic_sql_wms({
        parameter: 'ddepartment', // 🔁 replaced "division"
        loginid: user?.loginid ?? '',
        code1: user?.company_code ?? '',
        code2: 'NULL',
        code3: 'NULL',
        code4: 'NULL',
        number1: 0,
        number2: 0,
        number3: 0,
        number4: 0,
        date1: null,
        date2: null,
        date3: null,
        date4: null
      });

      // ✔ FIX: response is array → wrap into expected result structure
      const tableData = Array.isArray(response) ? (response as TDepartment[]) : [];
      const count = tableData.length;

      return { tableData, count };
    },
    enabled: !!app
  });

  console.log('division');

  const { data: divisionList } = useQuery({
    queryKey: ['division_data', app],
    queryFn: async () => {
      if (!app) return { tableData: [], count: 0 };

      const response = await WmsSerivceInstance.proc_build_dynamic_sql_wms({
        parameter: 'dddivision',
        loginid: user?.loginid ?? '',
        code1: user?.company_code ?? '',
        code2: 'NULL',
        code3: 'NULL',
        code4: 'NULL',
        number1: 0,
        number2: 0,
        number3: 0,
        number4: 0,
        date1: null,
        date2: null,
        date3: null,
        date4: null
      });

      // ✔ FIX: response is array → wrap into expected shape
      const tableData = Array.isArray(response) ? (response as any[]) : [];
      const count = tableData.length;

      return { tableData, count };
    },
    enabled: !!app
  });

  console.log('divisionList', divisionList);

  const { data: OrigincountryList } = useQuery({
    queryKey: ['origincountry_data'],
    queryFn: async () => {
      try {
        const response = await WmsSerivceInstance.getMasters(app, 'country', undefined, undefined);
        if (response) {
          return {
            tableData: response.tableData as TCountry[],
            count: response.count
          };
        }
        // Return empty data if response is undefined
        return { tableData: [], count: 0 };
      } catch (error) {
        // Handle error case
        console.error('Failed to fetch manufacture data', error);
        return { tableData: [], count: 0 }; // Fallback in case of error
      }
    }
  });

  const { data: DestinationcountryList } = useQuery({
    queryKey: ['destcountry_data'],
    queryFn: async () => {
      try {
        const response = await WmsSerivceInstance.getMasters(app, 'country', undefined, undefined);
        if (response) {
          return {
            tableData: response.tableData as TCountry[],
            count: response.count
          };
        }
        // Return empty data if response is undefined
        return { tableData: [], count: 0 };
      } catch (error) {
        // Handle error case
        console.error('Failed to fetch manufacture data', error);
        return { tableData: [], count: 0 }; // Fallback in case of error
      }
    }
  });

  const { data: portList } = useQuery({
    queryKey: ['port_data', selectedCountryCode],
    queryFn: async () => {
      try {
        const response = await WmsSerivceInstance.getMasters(app, 'port', undefined, undefined);
        if (response) {
          // Cast the tableData to TPort[] first
          const tableData = response.tableData as TPort[];

          // Filter ports based on selected country code
          const filteredPorts = selectedCountryCode
            ? tableData.filter((port: TPort) => port.country_code === selectedCountryCode)
            : tableData;

          return {
            tableData: filteredPorts,
            count: filteredPorts.length
          };
        }
        // Return empty data if response is undefined
        return { tableData: [], count: 0 };
      } catch (error) {
        // Handle error case
        console.error('Failed to fetch port data', error);
        return { tableData: [], count: 0 };
      }
    },
    enabled: !!selectedCountryCode
  });

  // const { data: portList } = useQuery({
  //   queryKey: ['port_data'],
  //   queryFn: async () => {
  //     try {
  //       const response = await WmsSerivceInstance.getMasters(app, 'port', undefined, undefined);
  //       if (response) {
  //         return {
  //           tableData: response.tableData as TPort[],
  //           count: response.count
  //         };
  //       }
  //       // Return empty data if response is undefined
  //       return { tableData: [], count: 0 };
  //     } catch (error) {
  //       // Handle error case
  //       console.error('Failed to fetch manufacture data', error);
  //       return { tableData: [], count: 0 }; // Fallback in case of error
  //     }
  //   }
  // });
  const normalizeKeys = (obj: any) => {
  const result: any = {};
  Object.keys(obj).forEach(key => {
    result[key.toLowerCase()] = obj[key];
  });
  return result;
};
  const { data: DestinationportList } = useQuery({
    queryKey: ['destport_data'],
    queryFn: async () => {
      try {
        const response = await WmsSerivceInstance.getMasters(app, 'port', undefined, undefined);
        if (response) {
          return {
            tableData: response.tableData as TPort[],
            count: response.count
          };
        }
        // Return empty data if response is undefined
        return { tableData: [], count: 0 };
      } catch (error) {
        // Handle error case
        console.error('Failed to fetch manufacture data', error);
        return { tableData: [], count: 0 }; // Fallback in case of error
      }
    }
  });
  //------------------formik-----------------
  const formik = useFormik<TJobInboundWms>({
    initialValues: {
      job_no: '',
      job_type: 'EXP',
      prin_code: '',
      company_code: user?.company_code,
      job_date: new Date(),
      job_class: 'N',
      dept_code: '',
      transport_mode: 'R',
      doc_ref: '',
      port_code: '',
      description1: '',
      description2: '',
      prin_ref1: '',
      prin_ref2: '',
      remarks: '',
      eta: null as unknown as Date,
      ata: null as unknown as Date,
      etd: null as unknown as Date,
      schedule_date: null as unknown as Date,
      payment_terms: '',
      curr_code: 'OMR',
      ex_rate: 1,
      frieght_value: 0,
      insurance_value: 0,
      cust_code: '',
      container_flag: '',
      container: '',
      packdet: 'N',
      allocated: 'N',
      canceled: 'N',
      confirmed: 'N',
      grn_no: null as unknown as number,
      invoiced: 'N',
      completed: '',
      exp_jobno: '',
      picked: 'N',
      ordered: 'N',
      destination_port: '',
      vessel_name: '',
      voyage_no: '',
      payableat: '',
      place_receipt: '',
      place_delivery: '',
      no_of_original_bl: null as unknown as number,
      broker_code: '',
      quotation_ref: '',
      be_deposits: '',
      ind_freight: '',
      country_origin: '',
      country_destination: '',
      //task_order: null as unknown as number,
      custom_recno: '',
      doc_ref2: '',
      hawb: '',
      reexport: '',
      ref_jobno: '',
      combined_jobno: '',
      carrier: '',
      job_lock: '',
      courier_code: '',
      delivery_point: '',
      div_code: '',
      salesman_code: '',
      transit_time: '',
      document_check: '',
      delivery_remarks: '',
      cargo_received: '',
      delivered_by: '',
      canceled_by: '',
      cancel_remarks: '',
      send_mail: '',
      backlog_mail: '',
      dplan_flag: '',
      trans_batch_id: '',
      send_mail_dn: '',
      kpi_inc: '',
      kpi_exc_remark: '',
      job_category: 'N/A',
      edit_user: '',
      tx_cat_code: '',
      bcf_code: '',
      request_category: '',
      load_point: '',
      updated_by: user?.loginid ?? '',
      created_by: user?.loginid ?? '',
      created_at: new Date(),
      updated_at: new Date()
    },
    validationSchema: yup.object().shape({
      job_type: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);

      let response;
      if (isEditMode) {
        response = await CreateInboundJobServiceInstance.editInboundjob(values);
      } else {
        response = await CreateInboundJobServiceInstance.addInboundjob(values);
      }
      if (response) {
        onClose(true);
        setSubmitting(false);
      }
    }
  });
  //------------------useEffect------------

  useEffect(() => {
  if (isEditMode && existingData) {

    const normalized = normalizeKeys(existingData);

    const {  ...rest } = normalized;

    const formikData: TJobInboundWms = {
      ...rest,
      created_by: normalized.created_by,
      updated_by: normalized.updated_by,
      updated_at: normalized.updated_at,
      created_at: normalized.created_at
    };

    console.log("FINAL FORMIK DATA:", formikData);

    formik.setValues(formikData);
  }
}, [isEditMode, existingData]); // <-- IMPORTANT


  return (
    //------------------jobno-----------
    <form onSubmit={formik.handleSubmit} className="space-y-4 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left Side Fields */}
        <div className="w-full md:w-2/3 space-y-4">
          {/* Principal and Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {/* <Autocomplete
                id="prin_code"
                value={
                  !!formik.values.prin_code
                    ? prinList?.tableData.find((eachBrand) => eachBrand.prin_code === formik.values.prin_code)
                    : ({ prin_name: '' } as TPrincipalWms)
                }
                onChange={(event, value: TPrincipalWms | null) => {
                  formik.setFieldValue('prin_code', value?.prin_code);
                }}
                options={prinList?.tableData ?? []}
                getOptionLabel={(option) => (option as TPrincipalWms)?.prin_name || ''}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    className="w-full"
                    label="Principal"
                    error={formik.touched.prin_code && Boolean(formik.errors.prin_code)}
                    helperText={formik.touched.prin_code && formik.errors.prin_code}
                  />
                )}
              /> */}
              <Autocomplete
                id="prin_code"
                value={
                  !!formik.values.prin_code
                    ? prinList?.tableData.find((eachBrand) => eachBrand.prin_code === formik.values.prin_code)
                    : ({ prin_name: '' } as TPrincipalWms)
                }
                onChange={(event, value: TPrincipalWms | null) => {
                  formik.setFieldValue('prin_code', value?.prin_code || '');

                  // Auto-populate department and division based on principal
                  if (value?.prin_code) {
                    // Use prin_group to set both dept_code and div_code
                    formik.setFieldValue('dept_code', value.prin_dept_code);
                    formik.setFieldValue('div_code', value.div_code);
                  } else {
                    // Clear department and division when principal is cleared
                    formik.setFieldValue('dept_code', '');
                    formik.setFieldValue('div_code', '');
                  }
                }}
                options={prinList?.tableData ?? []}
                fullWidth
                autoHighlight
                getOptionLabel={(option) => (option as TPrincipalWms)?.prin_name || ''}
                renderInput={(params) => <TextField {...params} label="Principal" />}
              />
            </div>

            <div>
              <Autocomplete
                id="dept_code"
                value={
                  !!formik.values.dept_code
                    ? departmentaList?.tableData.find((eachBrand) => eachBrand.dept_code === formik.values.dept_code)
                    : ({ dept_name: '' } as TDepartment)
                }
                onChange={(event, value: TJobInboundWms | TDepartment | null) => {
                  formik.setFieldValue('dept_code', value?.dept_code);
                }}
                options={departmentaList?.tableData ?? []}
                getOptionLabel={(option) => (option as TDepartment)?.dept_name || ''}
                isOptionEqualToValue={(option) => option.dept_code === formik.values.dept_code}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    className="w-full"
                    label="Department"
                    error={formik.touched.dept_code && Boolean(formik.errors.dept_code)}
                    helperText={formik.touched.dept_code && formik.errors.dept_code}
                  />
                )}
                readOnly={true}
              />
            </div>
          </div>

          {/* Job Classification and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormControl fullWidth error={formik.touched.job_class && Boolean(formik.errors.job_class)}>
                <InputLabel id="job-class-label">Job Classification</InputLabel>
                <Select
                  labelId="job-class-label"
                  id="job_class"
                  name="job_class"
                  value={formik.values.job_class}
                  onChange={(e) => formik.setFieldValue('job_class', e.target.value)}
                  label="Job Classification"
                >
                  <MenuItem value="N">Normal</MenuItem>
                  <MenuItem value="NP">Normal (HHT / RFID / AR)</MenuItem>
                  <MenuItem value="x">CrossDocking</MenuItem>
                  <MenuItem value="M">Manual Putaway</MenuItem>
                  <MenuItem value="S">Sales Return(WMS)</MenuItem>
                  <MenuItem value="O">Non-Inventory</MenuItem>
                  <MenuItem value="C">Co-Packing</MenuItem>
                  <MenuItem value="R">Sales return</MenuItem>
                  <MenuItem value="D">Sales return-Direct</MenuItem>
                  <MenuItem value="L">LTI</MenuItem>
                  <MenuItem value="Z">Distribution</MenuItem>
                  <MenuItem value="RNM">R & M</MenuItem>
                  <MenuItem value="HAC">HACCP</MenuItem>
                  <MenuItem value="SAN">Sanitation</MenuItem>
                  <MenuItem value="SEC">Security</MenuItem>
                  <MenuItem value="IDE">Indirect Exp</MenuItem>
                  <MenuItem value="52">Misc Receipts</MenuItem>
                  <MenuItem value="53">Inter Warehouse TRF</MenuItem>
                  <MenuItem value="64">Sales Return(RMA)</MenuItem>
                </Select>
                {formik.touched.job_class && formik.errors.job_class && <FormHelperText error>{formik.errors.job_class}</FormHelperText>}
              </FormControl>
            </div>

            <div>
              <FormControl fullWidth error={formik.touched.job_type && Boolean(formik.errors.job_type)}>
                <InputLabel id="job-type-label">Job Type</InputLabel>
                <Select
                  labelId="job-type-label"
                  id="job_type"
                  name="job_type"
                  value={formik.values.job_type}
                  onChange={(e) => formik.setFieldValue('job_type', e.target.value)}
                  label="Job Type"
                  sx={{
                    '& .MuiSelect-select': {
                      color: 'green.600'
                    }
                  }}
                >
                  <MenuItem value="EXP">Outbound</MenuItem>
                </Select>
                {formik.touched.job_type && formik.errors.job_type && <FormHelperText error>{formik.errors.job_type}</FormHelperText>}
              </FormControl>
            </div>
          </div>

          {/* Text Areas */}
          <div className="space-y-4">
            <div>
              <TextField
                id="description1"
                name="description1"
                label="Job Description"
                value={formik.values.description1}
                onChange={formik.handleChange}
                error={formik.touched.description1 && Boolean(formik.errors.description1)}
                helperText={formik.touched.description1 && formik.errors.description1}
                multiline
                rows={4}
                fullWidth
                variant="outlined"
              />
            </div>

            <div>
              <TextField
                id="remarks"
                name="remarks"
                label="Job Remarks"
                value={formik.values.remarks}
                onChange={formik.handleChange}
                error={formik.touched.remarks && Boolean(formik.errors.remarks)}
                helperText={formik.touched.remarks && formik.errors.remarks}
                multiline
                rows={4}
                fullWidth
                variant="outlined"
              />
            </div>

            <div>
              <TextField
                id="prin_ref2"
                name="prin_ref2"
                label="Delivery Note Remarks"
                value={formik.values.prin_ref2}
                onChange={formik.handleChange}
                error={formik.touched.prin_ref2 && Boolean(formik.errors.prin_ref2)}
                helperText={formik.touched.prin_ref2 && formik.errors.prin_ref2}
                multiline
                rows={4}
                fullWidth
                variant="outlined"
              />
            </div>
          </div>
        </div>

        {/* Right Side Fields */}
        <div className="w-full md:w-1/3 space-y-4">
          <div>
            <TextField
              id="div_code"
              name="div_code"
              label="Division"
              value={divisionList?.tableData.find((each) => each.div_code === formik.values.div_code)?.div_name || ''}
              className="w-full"
              InputProps={{
                readOnly: true
              }}
              variant="outlined"
            />
          </div>

          <div>
            <Autocomplete
              id="div_code"
              value={
                !!formik.values.div_code
                  ? divisionList?.tableData.find((eachBrand) => eachBrand.div_code === formik.values.div_code)
                  : ({ div_name: '' } as TDivision)
              }
              onChange={(event, value: TDivision | null) => {
                formik.setFieldValue('div_code', value?.div_code);
              }}
              options={divisionList?.tableData ?? []}
              getOptionLabel={(option) => option?.div_name || ''}
              readOnly={true}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Division"
                  className="w-full"
                  error={formik.touched.div_code && Boolean(formik.errors.div_code)}
                  helperText={formik.touched.div_code && formik.errors.div_code}
                />
              )}
            />
          </div>

          <div>
            <FormControl fullWidth>
              <InputLabel htmlFor="transport_mode">Transport Mode</InputLabel>
              <Select
                id="transport_mode"
                name="transport_mode"
                value={formik.values.transport_mode}
                onChange={(e) => formik.setFieldValue('transport_mode', e.target.value)}
                sx={{
                  '& .MuiSelect-select': {
                    textAlign: 'left'
                  }
                }}
              >
                <MenuItem value="R">Road/Land</MenuItem>
                <MenuItem value="S">Sea</MenuItem>
                <MenuItem value="A">Air</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div>
            {/* <Autocomplete
              id="country_origin"
              value={
                !!formik.values.country_origin
                  ? OrigincountryList?.tableData.find((eachCountry) => eachCountry.country_code === formik.values.country_origin)
                  : ({ country_name: '' } as TCountry)
              }
              onChange={(event, value: TCountry | null) => {
                formik.setFieldValue('country_origin', value?.country_code);
              }}
              options={OrigincountryList?.tableData ?? []}
              getOptionLabel={(option) => option?.country_name || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Origin Country"
                  className="w-full"
                  error={formik.touched.country_origin && Boolean(formik.errors.country_origin)}
                  helperText={formik.touched.country_origin && formik.errors.country_origin}
                />
              )}
            /> */}

            <Autocomplete
              id="country_origin"
              value={
                !!formik.values.country_origin
                  ? OrigincountryList?.tableData.find((eachCountry) => eachCountry.country_code === formik.values.country_origin)
                  : ({ country_name: '' } as TCountry)
              }
              onChange={(event, value: TCountry | null) => {
                formik.setFieldValue('country_origin', value?.country_code);
                setSelectedCountryCode(value?.country_code || null); // Update the selected country code
              }}
              options={OrigincountryList?.tableData ?? []}
              getOptionLabel={(option) => option?.country_name || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Origin Country"
                  className="w-full"
                  error={formik.touched.country_origin && Boolean(formik.errors.country_origin)}
                  helperText={formik.touched.country_origin && formik.errors.country_origin}
                />
              )}
            />
          </div>

          <div>
            <Autocomplete
              id="port_code"
              value={
                !!formik.values.port_code
                  ? portList?.tableData.find((eachPort) => eachPort.port_code === formik.values.port_code)
                  : ({ port_name: '' } as TPort)
              }
              onChange={(event, value: TPort | null) => {
                formik.setFieldValue('port_code', value?.port_code);
              }}
              options={portList?.tableData ?? []}
              getOptionLabel={(option) => option?.port_name || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Port Of Loading"
                  className="w-full"
                  error={formik.touched.port_code && Boolean(formik.errors.port_code)}
                  helperText={formik.touched.port_code && formik.errors.port_code}
                />
              )}
            />
          </div>
          <div>
            <Autocomplete
              id="country_destination"
              value={
                !!formik.values.country_destination
                  ? DestinationcountryList?.tableData.find((eachCountry) => eachCountry.country_code === formik.values.country_destination)
                  : ({ country_name: '' } as TCountry)
              }
              onChange={(event, value: TCountry | null) => {
                formik.setFieldValue('country_destination', value?.country_code);
              }}
              options={DestinationcountryList?.tableData ?? []}
              getOptionLabel={(option) => option?.country_name || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Destination Country"
                  className="w-full"
                  error={formik.touched.country_destination && Boolean(formik.errors.country_destination)}
                  helperText={formik.touched.country_destination && formik.errors.country_destination}
                />
              )}
            />
          </div>

          <div>
            <Autocomplete
              id="destination_port"
              value={
                !!formik.values.destination_port
                  ? DestinationportList?.tableData.find((eachPort) => eachPort.port_code === formik.values.destination_port)
                  : ({ port_name: '' } as TPort)
              }
              onChange={(event, value: TPort | null) => {
                formik.setFieldValue('destination_port', value?.port_code);
              }}
              options={DestinationportList?.tableData ?? []}
              getOptionLabel={(option) => option?.port_name || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Destination Port"
                  className="w-full"
                  error={formik.touched.destination_port && Boolean(formik.errors.destination_port)}
                  helperText={formik.touched.destination_port && formik.errors.destination_port}
                />
              )}
            />
          </div>

          {/* Date Pickers */}
          <div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                label="Eta Date"
                value={formik.values.eta ? dayjs(formik.values.eta) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) formik.setFieldValue('eta', newValue.toISOString());
                }}
                className="w-full"
                slotProps={{
                  textField: {
                    error: formik.touched.eta && Boolean(formik.errors.eta),
                    helperText: formik.touched.eta && formik.errors.eta
                  }
                }}
              />
            </LocalizationProvider>
          </div>

          <div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                label="Ata Date"
                value={formik.values.ata ? dayjs(formik.values.ata) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) formik.setFieldValue('ata', newValue.toISOString());
                }}
                className="w-full"
                slotProps={{
                  textField: {
                    error: formik.touched.ata && Boolean(formik.errors.ata),
                    helperText: formik.touched.ata && formik.errors.ata
                  }
                }}
              />
            </LocalizationProvider>
          </div>

          <div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Schedule Date"
                format="DD/MM/YYYY"
                value={formik.values.schedule_date ? dayjs(formik.values.schedule_date) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) formik.setFieldValue('schedule_date', newValue.toISOString());
                }}
                className="w-full"
                slotProps={{
                  textField: {
                    error: formik.touched.schedule_date && Boolean(formik.errors.schedule_date),
                    helperText: formik.touched.schedule_date && formik.errors.schedule_date
                  }
                }}
              />
            </LocalizationProvider>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          disabled={formik.isSubmitting}
          className={`px-4 py-2 rounded-md text-white flex items-center ${
            formik.isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {formik.isSubmitting ? (
            <>
              <LoadingOutlined className="mr-2" />
              Processing...
            </>
          ) : (
            <>
              <SaveOutlined className="mr-2" />
              Submit
            </>
          )}
        </button>
      </div>
    </form>
  );
};
export default AddOutBoundwmsForm;
