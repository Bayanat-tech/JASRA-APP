import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Autocomplete, FormControl, FormHelperText, InputLabel, MenuItem, Select, Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { getIn, useFormik } from 'formik';
import useAuth from 'hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'store';
import { TJobInboundWms } from 'pages/WMS/Transaction/Inbound/types/jobInbound_wms.types';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { TPrincipalWms } from 'pages/WMS/types/principal-wms.types';
import * as yup from 'yup';
import WmsSerivceInstance from 'service/wms/service.wms';
import { TDepartment } from 'pages/WMS/types/department-wms.types';
import { TDivision } from 'pages/WMS/types/division-wms.types';
import { TCountry } from 'pages/WMS/types/country-wms.types';
import { TPort } from 'pages/WMS/types/Port-wms.types';
import CreateInboundJobServiceInstance from 'service/wms/transaction/inbound/service.inboundJobcreateWms';

const AddJobWmsForm = ({
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

  // Add state to track if department and division should be disabled
  const [isDeptDivDisabled, setIsDeptDivDisabled] = useState(true);

  // Add state to track selected principal for PDA flag check
  const [selectedPrinCode, setSelectedPrinCode] = useState<string>('');

  // Add state to track submission errors
  const [, setSubmitError] = useState<string | null>(null);

  // State to track selected country code for port filtering
  const [selectedPortCountryCode, setSelectedPortCountryCode] = useState<string>('');

  // State to track selected country code for destination port filtering
  const [selectedDestPortCountryCode, setSelectedDestPortCountryCode] = useState<string>('');

  // Option arrays for autocomplete fields
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
  const { data: departmentaList } = useQuery({
    queryKey: ['manufacturer_data'],
    queryFn: async () => {
      try {
        const response = await WmsSerivceInstance.getMasters(app, 'ddepartment', undefined, undefined);
        if (response) {
          return {
            tableData: response.tableData as TDepartment[],
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
  const { data: divisionList } = useQuery({
    queryKey: ['division_data'],
    queryFn: async () => {
      try {
        const response = await WmsSerivceInstance.getMasters(app, 'dddivision', undefined, undefined);
        if (response) {
          return {
            tableData: response.tableData as TDivision[],
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
  const { data: countryList } = useQuery({
    queryKey: ['country_data'],
    queryFn: async () => {
      const sql = `SELECT * FROM MS_COUNTRY`;
      const response = await WmsSerivceInstance.executeRawSql(sql);
      if (response) {
        return {
          tableData: response as TCountry[],
          count: response.length
        };
      }
      return { tableData: [], count: 0 };
    }
  });

  // Fetch destination ports based on selected destination country code
  const { data: filteredDestPortListRaw } = useQuery({
    queryKey: ['dest_port_by_country', selectedDestPortCountryCode],
    queryFn: async () => {
      if (!selectedDestPortCountryCode) return { tableData: [], count: 0 };
      const sql = `SELECT * FROM MS_PORT WHERE COUNTRY_CODE = '${selectedDestPortCountryCode}'`;
      const response = await WmsSerivceInstance.executeRawSql(sql);
      if (response) {
        const tableData = response.map((port: any) => ({
          port_code: port.PORT_CODE ?? port.port_code,
          port_name: port.PORT_NAME ?? port.port_name,
          country_code: port.COUNTRY_CODE ?? port.country_code,
          company_code: port.COMPANY_CODE ?? port.company_code
        }));
        return {
          tableData,
          count: tableData.length
        };
      }
      return { tableData: [], count: 0 };
    },
    enabled: !!selectedDestPortCountryCode
  });

  // Map country list to expected format (lowercase keys)
  const mappedCountryList =
    countryList?.tableData.map((country) => ({
      country_code: country.COUNTRY_CODE ?? country.country_code,
      country_name: country.COUNTRY_NAME ?? country.country_name
    })) ?? [];

  // Fetch ports based on selected country code for "Port Of Loading"
  const { data: filteredPortListRaw } = useQuery({
    queryKey: ['port_by_country', selectedPortCountryCode],
    queryFn: async () => {
      if (!selectedPortCountryCode) return { tableData: [], count: 0 };
      const sql = `SELECT * FROM MS_PORT WHERE COUNTRY_CODE = '${selectedPortCountryCode}'`;
      const response = await WmsSerivceInstance.executeRawSql(sql);
      if (response) {
        // Map to expected format
        const tableData = response.map((port: any) => ({
          port_code: port.PORT_CODE ?? port.port_code,
          port_name: port.PORT_NAME ?? port.port_name,
          country_code: port.COUNTRY_CODE ?? port.country_code,
          company_code: port.COMPANY_CODE ?? port.company_code
          // add other fields if needed
        }));
        return {
          tableData,
          count: tableData.length
        };
      }
      return { tableData: [], count: 0 };
    },
    enabled: !!selectedPortCountryCode
  });

  //------------------formik-----------------
  const formik = useFormik<TJobInboundWms>({
    initialValues: {
      job_no: '',
      job_type: 'IMP',
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
      schedule_date: undefined,
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
      // Removed job_classification validation requirement
    }),
    onSubmit: async (values, { setSubmitting }) => {
      console.log('Formik onSubmit called');
      setSubmitting(true);
      setSubmitError(null);
      try {
        // Always use the code from formik values
        let prin_code = values.prin_code;
        // Validate that prin_code exists in principal list
        if (prinList?.tableData) {
          const found = prinList.tableData.find(p => p.prin_code === prin_code);
          if (!found) {
            setSubmitError('"prin_code" is required');
            setSubmitting(false);
            return;
          }
        }
        // Build payload with correct prin_code and remove id
        let payload: any = { ...values, prin_code };
        // Remove job_no and updated_at when creating a new job — server should generate them.
        if (!isEditMode) {
          if (Object.prototype.hasOwnProperty.call(payload, 'job_no')) {
            delete payload.job_no;
          }
          if (Object.prototype.hasOwnProperty.call(payload, 'updated_at')) {
            delete payload.updated_at;
          }
        }

        let response;
        if (isEditMode) {
          // Use the service method for editing job
          response = await CreateInboundJobServiceInstance.editInboundjob(payload);
        } else {
          response = await CreateInboundJobServiceInstance.addInboundjob(payload);
        }
        if (response) {
          // Handle success (e.g., close modal and refetch data)
          onClose(true);
        }
      } catch (error: any) {
        setSubmitError(error?.message || 'An error occurred');
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Debug validation - Add this to check if the form is valid
  useEffect(() => {
    console.log('Form errors:', formik.errors);
    console.log('Form values:', formik.values);
    console.log('Form is valid:', formik.isValid);
  }, [formik.errors, formik.values, formik.isValid]);

  //------------------useEffect------------

  useEffect(() => {
    if (
      isEditMode &&
      existingData &&
      typeof existingData === 'object' &&
      Object.keys(existingData).length > 0 &&
      prinList?.tableData &&
      departmentaList?.tableData &&
      divisionList?.tableData &&
      countryList?.tableData
    ) {
      if (existingData.country_origin) setSelectedPortCountryCode(existingData.country_origin);
      if (existingData.country_destination) setSelectedDestPortCountryCode(existingData.country_destination);

      const textFields = [
        'description1',
        'remarks',
        'prin_ref2',
        'prin_ref1',
        'doc_ref',
        'doc_ref2',
        'vessel_name',
        'voyage_no',
        'payableat',
        'place_receipt',
        'place_delivery',
        'carrier',
        'delivery_point',
        'cancel_remarks',
        'delivery_remarks',
        'custom_recno',
        'be_deposits'
      ];
      const normalizedData: any = { ...existingData };
      textFields.forEach((field) => {
        if (normalizedData[field] === null || normalizedData[field] === undefined) {
          normalizedData[field] = '';
        } else if (field === 'be_deposits' && typeof normalizedData[field] !== 'string') {
          normalizedData[field] = String(normalizedData[field]);
        }
      });
      delete normalizedData.id;
      delete normalizedData.prin_name;

      let schedule_date = undefined;
      if (normalizedData.schedule_date) {
        const d = dayjs(normalizedData.schedule_date);
        if (d.isValid() && d.year() > 1900) {
          schedule_date = d.toISOString();
        }
      }

      formik.resetForm({
        values: {
          ...formik.initialValues,
          ...normalizedData,
          company_code: normalizedData.company_code ?? user?.company_code,
          created_by: normalizedData.created_by ?? user?.loginid ?? '',
          updated_by: normalizedData.updated_by ?? user?.loginid ?? '',
          job_class: normalizedData.job_class ?? '',
          prin_code: normalizedData.prin_code ?? '',
          dept_code: normalizedData.dept_code ?? '',
          div_code: normalizedData.div_code ?? '',
          country_origin: normalizedData.country_origin ?? '',
          country_destination: normalizedData.country_destination ?? '',
          port_code: normalizedData.port_code ?? '',
          destination_port: normalizedData.destination_port ?? '',
          schedule_date: schedule_date
        }
      });

      setSelectedPrinCode(normalizedData.prin_code ?? '');
      setIsDeptDivDisabled(true);
    } else if (!isEditMode) {
      setIsDeptDivDisabled(true);
    }
    // Only run when edit mode or job changes, not on port/country list changes!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isEditMode,
    existingData,
    prinList?.tableData,
    departmentaList?.tableData,
    divisionList?.tableData,
    countryList?.tableData
  ]);

  // Add query to fetch PDA flag based on selected principal
  const { data: pdaFlag } = useQuery({
    queryKey: ['pda_flag', selectedPrinCode],
    queryFn: async () => {
      if (!selectedPrinCode) return null;

      const sql = `SELECT PDA FROM VW_FIND_PDA_FLAG WHERE PRIN_CODE = '${selectedPrinCode}'`;
      const response = await WmsSerivceInstance.executeRawSql(sql);

      if (response && response.length > 0) {
        return response[0].PDA;
      }
      return null;
    },
    enabled: !!selectedPrinCode
  });

  // Watch for PDA flag changes and auto-select Manual Putaway
  useEffect(() => {
    if (pdaFlag === 'Y') {
      formik.setFieldValue('job_class', 'M');
    }
  }, [pdaFlag]);

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4 p-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Left Side Fields */}
        <div className="w-full md:w-2/3 space-y-4">
          {/* Principal and Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Autocomplete
                id="prin_code"
                value={
                  prinList?.tableData.find((eachBrand) => eachBrand.prin_code === formik.values.prin_code) ||
                  null
                }
                onChange={(event, value: TPrincipalWms | null) => {
                  formik.setFieldValue('prin_code', value?.prin_code || '');

                  // Set selected principal for PDA flag check
                  setSelectedPrinCode(value?.prin_code || '');

                  // Auto-populate department and division based on principal
                  if (value?.prin_code && value?.prin_group) {
                    // Use prin_group to set both dept_code and div_code
                    formik.setFieldValue('dept_code', value.prin_group);
                    formik.setFieldValue('div_code', value.prin_group);
                    setIsDeptDivDisabled(true);
                  } else {
                    // Clear department and division when principal is cleared
                    formik.setFieldValue('dept_code', '');
                    formik.setFieldValue('div_code', '');
                    setIsDeptDivDisabled(false);
                  }
                }}
                size="small"
                options={prinList?.tableData ?? []}
                fullWidth
                autoHighlight
                getOptionLabel={(option) => {
                  const principal = option as TPrincipalWms;
                  return principal?.prin_code && principal?.prin_name 
                    ? `${principal.prin_code} - ${principal.prin_name}` 
                    : principal?.prin_name || '';
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Principal"
                    className="w-full"
                    error={formik.touched.prin_code && Boolean(formik.errors.prin_code)}
                    helperText={formik.touched.prin_code && formik.errors.prin_code}
                  />
                )}
              />
            </div>

            <div>
              <Autocomplete
                id="dept_code"
                disabled={isDeptDivDisabled}
                value={
                  departmentaList?.tableData.find((eachBrand) => eachBrand.dept_code === formik.values.dept_code) ||
                  null
                }
                onChange={(event, value: TJobInboundWms | TDepartment | null) => {
                  if (!isDeptDivDisabled) {
                    formik.setFieldValue('dept_code', value?.dept_code);
                  }
                }}
                size="small"
                options={departmentaList?.tableData ?? []}
                fullWidth
                autoHighlight
                getOptionLabel={(option) => (option as TDepartment)?.dept_name || ''}
                isOptionEqualToValue={(option) => option.dept_code === formik.values.dept_code}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Department"
                    className="w-full"
                    error={formik.touched.dept_code && Boolean(formik.errors.dept_code)}
                    helperText={formik.touched.dept_code && formik.errors.dept_code}
                  />
                )}
              />
            </div>
          </div>

          {/* Job Classification and Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormControl fullWidth size="small" error={formik.touched.job_class && Boolean(formik.errors.job_class)}>
                <InputLabel>Job Classification</InputLabel>
                <Select value={formik.values.job_class} onChange={(e) => formik.setFieldValue('job_class', e.target.value)}>
                  <MenuItem value="N">Normal</MenuItem>
                  <MenuItem value="NP">Normal (HHT / RFID / AR)</MenuItem>
                  <MenuItem value="M">Manual Putaway</MenuItem>
                  <MenuItem value="S">Sales Return</MenuItem>
                  <MenuItem value="SP">Sales Return (HHT / RFID / AR)</MenuItem>
                  <MenuItem value="NI">Non-Inventory</MenuItem>
                  <MenuItem value="CP">Co-Packing</MenuItem>
                  <MenuItem value="MR">Misc Receipts</MenuItem>
                  <MenuItem value="IWT">Inter Warehouse Transfer</MenuItem>
                  <MenuItem value="CD">Cross Docking</MenuItem>
                </Select>
                {formik.touched.job_class && formik.errors.job_class && <FormHelperText error>{formik.errors.job_class}</FormHelperText>}
              </FormControl>
            </div>

            <div>
              <FormControl fullWidth size="small" error={formik.touched.job_type && Boolean(formik.errors.job_type)}>
                <InputLabel>Job Type</InputLabel>
                <Select
                  value={formik.values.job_type}
                  onChange={(e) => formik.setFieldValue('job_type', e.target.value)}
                  sx={{
                    color: 'blue'
                  }}
                >
                  <MenuItem value="IMP">Inbound</MenuItem>
                </Select>
                {formik.touched.job_type && formik.errors.job_type && <FormHelperText error>{formik.errors.job_type}</FormHelperText>}
              </FormControl>
            </div>
          </div>

          {/* Text Areas */}
          <div className="space-y-4">
            <div>
              <TextField
                size="small"
                value={formik.values.description1 ?? ''}
                label="Job Description"
                name="description1"
                onChange={formik.handleChange}
                fullWidth
                multiline
                rows={4}
                error={Boolean(getIn(formik.touched, 'description1') && getIn(formik.errors, 'description1'))}
                helperText={getIn(formik.touched, 'description1') && getIn(formik.errors, 'description1')}
              />
            </div>

            <div>
              <TextField
                size="small"
                value={formik.values.remarks}
                label="Job Remarks"
                name="remarks"
                onChange={formik.handleChange}
                fullWidth
                multiline
                rows={4}
                error={Boolean(getIn(formik.touched, 'remarks') && getIn(formik.errors, 'remarks'))}
                helperText={getIn(formik.touched, 'remarks') && getIn(formik.errors, 'remarks')}
              />
            </div>

            <div>
              <TextField
                size="small"
                value={formik.values.prin_ref2}
                label="GRN Remarks"
                name="prin_ref2"
                onChange={formik.handleChange}
                fullWidth
                multiline
                rows={4}
                error={Boolean(getIn(formik.touched, 'prin_ref2') && getIn(formik.errors, 'prin_ref2'))}
                helperText={getIn(formik.touched, 'prin_ref2') && getIn(formik.errors, 'prin_ref2')}
              />
            </div>
          </div>
        </div>

        {/* Right Side Fields */}
        <div className="w-full md:w-1/3 space-y-4">
          <div>
            <Autocomplete
              id="div_code"
              disabled={isDeptDivDisabled}
              value={
                divisionList?.tableData.find((eachBrand) => eachBrand.div_code === formik.values.div_code) ||
                null
              }
              onChange={(event, value: TDivision | null) => {
                if (!isDeptDivDisabled) {
                  formik.setFieldValue('div_code', value?.div_code);
                }
              }}
              size="small"
              options={divisionList?.tableData ?? []}
              fullWidth
              autoHighlight
              getOptionLabel={(option) => option?.div_name || ''}
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
            <Autocomplete
              id="country_origin"
              value={
                mappedCountryList.find((eachCountry) => eachCountry.country_code === formik.values.country_origin) || null
              }
              onChange={(event, value: { country_code: any; country_name: any } | null) => {
                const newCountryCode = value?.country_code || '';
                formik.setFieldValue('country_origin', newCountryCode, true);
                setSelectedPortCountryCode(newCountryCode);
                // Always clear port_code when country changes
                setTimeout(() => formik.setFieldValue('port_code', '', true), 0);
              }}
              size="small"
              options={mappedCountryList}
              fullWidth
              autoHighlight
              getOptionLabel={(option) => option?.country_name || ''}
              isOptionEqualToValue={(option, value) => option?.country_code === value?.country_code}
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
              id="country_destination"
              value={
                mappedCountryList.find((eachCountry) => eachCountry.country_code === formik.values.country_destination) || null
              }
              onChange={(event, value: { country_code: any; country_name: any } | null) => {
                const newCountryCode = value?.country_code || '';
                formik.setFieldValue('country_destination', newCountryCode, true);
                setSelectedDestPortCountryCode(newCountryCode);
                // Always clear destination_port when country changes
                setTimeout(() => formik.setFieldValue('destination_port', '', true), 0);
              }}
              size="small"
              options={mappedCountryList}
              fullWidth
              autoHighlight
              getOptionLabel={(option) => option?.country_name || ''}
              isOptionEqualToValue={(option, value) => option?.country_code === value?.country_code}
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
              id="port_code"
              value={
                filteredPortListRaw?.tableData.find((eachPort) => eachPort.port_code === formik.values.port_code) ||
                null
              }
              onChange={(event, value: { port_code: any; port_name: any; country_code: any; company_code: any } | TPort | null) => {
                formik.setFieldValue('port_code', value?.port_code);
              }}
              size="small"
              options={filteredPortListRaw?.tableData ?? []}
              fullWidth
              autoHighlight
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
              id="destination_port"
              value={
                filteredDestPortListRaw?.tableData.find((eachPort) => eachPort.port_code === formik.values.destination_port) ||
                null
              }
              onChange={(event, value: { port_code: any; port_name: any; country_code: any; company_code: any } | TPort | null) => {
                formik.setFieldValue('destination_port', value?.port_code);
              }}
              size="small"
              options={filteredDestPortListRaw?.tableData ?? []}
              fullWidth
              autoHighlight
              getOptionLabel={(option) => option?.port_name || ''}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Port Of Destination"
                  className="w-full"
                  error={formik.touched.destination_port && Boolean(formik.errors.destination_port)}
                  helperText={formik.touched.destination_port && formik.errors.destination_port}
                />
              )}
            />
          </div>

          <div>
            <FormControl fullWidth size="small">
              <InputLabel>Transport Mode</InputLabel>
              <Select value={formik.values.transport_mode} onChange={(e) => formik.setFieldValue('transport_mode', e.target.value)}>
                <MenuItem value="R">Road\Land</MenuItem>
                <MenuItem value="S">Sea</MenuItem>
                <MenuItem value="A">Air</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                slotProps={{ textField: { size: 'small' } }}
                className="w-full"
                value={formik.values.schedule_date ? dayjs(formik.values.schedule_date) : dayjs()}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) formik.setFieldValue('schedule_date', newValue.toISOString());
                }}
                label="Schedule Date"
              />
              {getIn(formik.touched, 'schedule_date') && getIn(formik.errors, 'schedule_date') && (
                <FormHelperText error id="helper-text-first_name">
                  {getIn(formik.errors, 'schedule_date')}
                </FormHelperText>
              )}
            </LocalizationProvider>
          </div>
        </div>
      </div>

      {/* Display submission errors */}
      {/* {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{submitError}</span>
        </div>
      )} */}

      {/* Debug info - only in development */}
      {/* {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 p-2 text-xs">
          <div>Form valid: {formik.isValid ? 'Yes' : 'No'}</div>
          <div>Submitting: {formik.isSubmitting ? 'Yes' : 'No'}</div>
          <div>Dirty: {formik.dirty ? 'Yes' : 'No'}</div>
          {Object.keys(formik.errors).length > 0 && (
            <div className="text-red-500">
              <strong>Validation errors:</strong>
              <pre>{JSON.stringify(formik.errors, null, 2)}</pre>
            </div>
          )}
        </div>
      )} */}

      {/* Submit Button */}
      <div className="flex justify-end mt-4">
        <Button
          type="submit"
          disabled={formik.isSubmitting}
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
          // Remove the custom onClick handler to avoid interfering with submit
        >
          {formik.isSubmitting ? (
            <>
              <LoadingOutlined className="mr-2" />
              Processing...
            </>
          ) : (
            <>
              <SaveOutlined className="mr-2" />
              <FormattedMessage id="Submit" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
export default AddJobWmsForm;