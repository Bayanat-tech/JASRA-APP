import { LoadingOutlined, SaveOutlined } from '@ant-design/icons';
import { Autocomplete, Button, Checkbox, FormControlLabel, FormHelperText, Grid, InputLabel, TextField, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useQuery } from '@tanstack/react-query';
import dayjs, { Dayjs } from 'dayjs';
import { getIn, useFormik } from 'formik';
import { TAccountChildren } from 'pages/Finance/types/acTree.types';
import { TCountry } from 'pages/WMS/types/country-wms.types';
import { TCurrency } from 'pages/WMS/types/currency-wms.types';
import { TDepartment } from 'pages/WMS/types/department-wms.types';
import { Tsalesman } from 'pages/WMS/types/salesman-wms.types';
import { TSector } from 'pages/WMS/types/sector-wms.types';
import { TTerritory } from 'pages/WMS/types/territory-wms.types';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import AcTreeServiceInstance from 'service/Finance/Accounts/Masters/GM/service.actree';
import WmsSerivceInstance from 'service/wms/service.wms';
import * as yup from 'yup';
import { TBlFinance, TPlFinance } from './types/Accountree.types';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { TFile } from 'types/types.file';
import UniversalDialog from 'components/popup/UniversalDialog';
import Files from 'components/Files';
import FileUploadServiceInstance from 'service/services.files';
const AddAccountChildrenFinanceForm = ({
  onClose,
  isEditMode,
  ac_code,
  parent_code
}: {
  onClose: (refetchData?: boolean) => void;
  isEditMode: Boolean;
  ac_code?: string;
  parent_code: string;
}) => {
  //---------constants---
  const [uploadFilesPopup, setUploadFilesPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: 'Upload Files'
  }); // State to manage the upload files popup
  const [filesData, setFilesData] = useState<TFile[]>([]); // State to manage the files data

  //-------------useQuery-----------
  const { data: levelData } = useQuery({
    queryKey: ['acc_children'],
    queryFn: () => AcTreeServiceInstance.getAccountChildrenItem(ac_code as string),
    enabled: !!isEditMode
  }); // Query to fetch account children item data

  const { data: currencyList } = useQuery({
    queryKey: ['currency_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters('wms', 'currency', undefined, undefined);
      if (response) {
        return {
          tableData: response.tableData as TCurrency[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  }); // Query to fetch currency data

  const { data: territoryList } = useQuery({
    queryKey: ['territory_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters('wms', 'territory', undefined, undefined);
      if (response) {
        return {
          tableData: response.tableData as TTerritory[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  }); // Query to fetch territory data

  const { data: countryList } = useQuery({
    queryKey: ['country_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters('wms', 'country', undefined, undefined);
      if (response) {
        return {
          tableData: response.tableData as TCountry[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  }); // Query to fetch country data

  const { data: departmentList } = useQuery({
    queryKey: ['department_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters('wms', 'department', undefined, undefined);
      if (response) {
        return {
          tableData: response.tableData as TDepartment[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  }); // Query to fetch department data

  const { data: salesmanData } = useQuery({
    queryKey: ['salesman_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters('wms', 'salesman', undefined, undefined);
      if (response) {
        return {
          tableData: response.tableData as Tsalesman[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  }); // Query to fetch salesman data

  const { data: sectorData } = useQuery({
    queryKey: ['sector_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters('wms', 'industrysector', undefined, undefined);
      if (response) {
        return {
          tableData: response.tableData as TSector[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  }); // Query to fetch sector data

  const { data: files } = useQuery({
    queryKey: ['files_data'],
    queryFn: () => FileUploadServiceInstance.getFile('ACCT' + ac_code),
    enabled: !!isEditMode
  }); // Query to fetch files data

  const { data: blData } = useQuery({
    queryKey: ['bl_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters('finance', 'bl_setup', undefined, undefined);
      if (response) {
        return {
          tableData: response.tableData as TBlFinance[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    },
    enabled: !!['1', '2', '3'].includes(parent_code[0])
  }); // Query to fetch BL data

  const { data: plData } = useQuery({
    queryKey: ['pl_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters('finance', 'pl_setup', undefined, undefined);
      if (response) {
        return {
          tableData: response.tableData as TPlFinance[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    },
    enabled: !['1', '2', '3'].includes(parent_code[0])
  }); // Query to fetch PL data

  //---------------formik------------
  const formik = useFormik<TAccountChildren>({
    initialValues: {
      pl_bl_code: '',
      ac_code: '',
      ac_name: '',
      country_code: '',
      territory_code: '',
      address_1: '',
      address_2: '',
      address_3: '',
      phone: '',
      fax: '',
      e_mail: '',
      contact_person: '',
      mobile_no: '',
      l4_code: parent_code,
      curr_code: '',
      credit_period: null as unknown as number,
      credit_amount: null as unknown as number,
      dept_code: '',
      bank_ac_code: '',
      bank_name: '',
      bank_swift: '',
      salesman_code: '',
      sector_code: '',
      contract_expry_date: null as unknown as Date,
      bi_main_group: '',
      bi_sub_group: '',
      bi_exp_type: '',
      bi_pl_bs_ind: '',
      bi_dept: '',
      trn_no: '',
      ac_infze: '',
      tax_registrd: 'N',
      city_name: '',
      tax_country_code: '',
      rcm_apply: 'N',
      files: []
    },
    validationSchema: yup.object().shape({
      ac_name: yup.string().required('This field is required')
    }),
    onSubmit: async (values, { setSubmitting }) => {
      setSubmitting(true);
      let response;
      delete values.ac_code;

      values['files'] = values.files?.filter((eachFile: any) => eachFile.sr_no === undefined);

      if (isEditMode && !!ac_code) {
        response = await AcTreeServiceInstance.updateAccountChildrenItem(ac_code, values);
      } else {
        response = await AcTreeServiceInstance.addAccountChildrenItem(values);
      }
      setSubmitting(false);
      if (response) onClose();
    }
  }); // Formik setup for form handling

  //---------handlers---------
  const handleUploadPopup = () => {
    if (uploadFilesPopup.action.open === true) {
      formik.setFieldValue('files', filesData);
      // set data as per serial number
    }
    setUploadFilesPopup((prev) => {
      return { ...prev, action: { ...prev.action, open: !prev.action.open } };
    });
  }; // Handler to manage the upload files popup

  //-----------useEffect--------------
  useEffect(() => {
    if (levelData && Object.keys(levelData).length > 0 && isEditMode) {
      const {
        ac_code,
        ac_name,
        country_code,
        territory_code,
        address_1,
        address_2,
        address_3,
        phone,
        fax,
        e_mail,
        contact_person,
        mobile_no,
        l4_code,
        curr_code,
        credit_period,
        credit_amount,
        dept_code,
        bank_ac_code,
        bank_name,
        bank_swift,
        salesman_code,
        sector_code,
        contract_expry_date,
        bi_main_group,
        bi_sub_group,
        bi_exp_type,
        bi_pl_bs_ind,
        bi_dept,
        trn_no,
        ac_infze,
        tax_registrd,
        city_name,
        tax_country_code,
        rcm_apply,
        pl_bl_code,
        files
      } = levelData;

      formik.setValues({
        ac_code,
        ac_name,
        country_code,
        territory_code,
        address_1,
        address_2,
        address_3,
        phone,
        fax,
        e_mail,
        contact_person,
        mobile_no,
        l4_code,
        curr_code,
        credit_period,
        credit_amount,
        pl_bl_code,
        dept_code,
        bank_ac_code,
        bank_name,
        bank_swift,
        salesman_code,
        sector_code,
        contract_expry_date,
        bi_main_group,
        bi_sub_group,
        bi_exp_type,
        bi_pl_bs_ind,
        bi_dept,
        trn_no,
        ac_infze,
        tax_registrd,
        city_name,
        tax_country_code,
        rcm_apply,
        files
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelData]); // Effect to set form values when levelData changes

  //-----------useEffects---------
  useEffect(() => {
    if (files && isEditMode) {
      formik.setFieldValue('files', files);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]); // Effect to set form files when files data changes
  return (
    <Grid container spacing={6} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12} sm={6}>
        <Grid container spacing={6}>
          {/*----------------------Section 1-------------------------- */}

          <Grid item xs={12}>
            <Grid container spacing={2}>
              {/*----------------------Heading-------------------------- */}
              <Grid item xs={12} className="flex gap-4">
                <div className="flex flex-col sm:flex-row space-x-4 mt-4">
                  <Typography variant="h4" className="text-black py-2 font-semibold">
                    <FormattedMessage id="Contact Information" />
                  </Typography>
                </div>
                <div className="flex flex-col sm:flex-row space-x-4 mt-4">
                  <Button variant="contained" size="small" onClick={() => handleUploadPopup()}>
                    <FormattedMessage id="Upload" />
                  </Button>
                </div>
              </Grid>

              {/*----------------------Address 1-------------------------- */}
              <Grid item xs={12} sm={6}>
                <InputLabel>
                  <FormattedMessage id="Address" /> 1
                </InputLabel>
                <TextField
                  multiline
                  rows={2}
                  size="small"
                  onChange={formik.handleChange}
                  id="address_1"
                  name="address_1"
                  fullWidth
                  value={formik.values.address_1}
                />
              </Grid>
              {/*----------------------Address 2-------------------------- */}
              <Grid item xs={12} sm={6}>
                <InputLabel>
                  <FormattedMessage id="Address" /> 2
                </InputLabel>
                <TextField
                  multiline
                  rows={2}
                  size="small"
                  onChange={formik.handleChange}
                  id="address_2"
                  name="address_2"
                  fullWidth
                  value={formik.values.address_2}
                />
              </Grid>
              {/*----------------------Address 3-------------------------- */}
              <Grid item xs={12}>
                <InputLabel>
                  <FormattedMessage id="Address" /> 3
                </InputLabel>
                <TextField
                  multiline
                  rows={2}
                  size="small"
                  onChange={formik.handleChange}
                  id="address_3"
                  name="address_3"
                  fullWidth
                  value={formik.values.address_3}
                />
              </Grid>
              {/*----------------------City-------------------------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="City" />
                </InputLabel>
                <TextField
                  size="small"
                  onChange={formik.handleChange}
                  id="city_name"
                  name="city_name"
                  fullWidth
                  value={formik.values.city_name}
                />
              </Grid>
              {/*----------------------Territory-------------------------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="Territory" />
                </InputLabel>
                <Autocomplete
                  id="territory"
                  value={
                    !!formik.values.territory_code
                      ? territoryList?.tableData.find((eachTerritory) => eachTerritory.territory_code === formik.values.territory_code)
                      : ({ territory_name: '' } as TTerritory)
                  }
                  onChange={(event, value: TTerritory | null) => {
                    formik.setFieldValue('territory_code', value?.territory_code);
                  }}
                  options={territoryList?.tableData ?? []}
                  fullWidth
                  autoHighlight
                  getOptionLabel={(option) => option?.territory_name}
                  size="small"
                  isOptionEqualToValue={(option) => option.territory_code === formik.values.territory_code}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputProps={{
                        ...params.inputProps
                      }}
                    />
                  )}
                />
              </Grid>
              {/*----------------------Country-------------------------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="Country" />
                </InputLabel>
                <Autocomplete
                  id="country_code"
                  value={
                    !!formik.values.country_code
                      ? countryList?.tableData.find((eachCountry) => eachCountry.country_code === formik.values.country_code)
                      : ({ country_name: '' } as TCountry)
                  }
                  onChange={(event, value: TCountry | null) => {
                    formik.setFieldValue('country_code', value?.country_code);
                  }}
                  size="small"
                  options={countryList?.tableData ?? []}
                  fullWidth
                  autoHighlight
                  getOptionLabel={(option) => option?.country_name}
                  isOptionEqualToValue={(option) => option.country_code === formik.values.country_code}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputProps={{
                        ...params.inputProps
                      }}
                    />
                  )}
                />
              </Grid>
              {/*----------------------phone-------------------------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="Phone" />
                </InputLabel>
                <TextField size="small" onChange={formik.handleChange} id="phone" name="phone" fullWidth value={formik.values.phone} />
              </Grid>
              {/*----------------------Mobile-------------------------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="Mobile" />
                </InputLabel>
                <TextField
                  size="small"
                  onChange={formik.handleChange}
                  id="mobile_no"
                  name="mobile_no"
                  fullWidth
                  value={formik.values.mobile_no}
                />
              </Grid>
              {/*----------------------Fax-------------------------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="Fax" />
                </InputLabel>
                <TextField size="small" onChange={formik.handleChange} id="fax" name="fax" fullWidth value={formik.values.fax} />
              </Grid>
              {/*----------------------Email-------------------------- */}
              <Grid item xs={12} sm={6}>
                <InputLabel>
                  <FormattedMessage id="Email" />
                </InputLabel>
                <TextField
                  size="small"
                  type="email"
                  onChange={formik.handleChange}
                  id="e_mail"
                  name="e_mail"
                  fullWidth
                  value={formik.values.e_mail}
                />
              </Grid>
              {/*----------------------Contract Person-------------------------- */}
              <Grid item xs={12} sm={6}>
                <InputLabel>
                  <FormattedMessage id="Contract Person" />
                </InputLabel>
                <TextField
                  size="small"
                  onChange={formik.handleChange}
                  id="contact_person"
                  name="contact_person"
                  fullWidth
                  value={formik.values.contact_person}
                />
              </Grid>
            </Grid>
          </Grid>
          {/*-------------------------section 4 --------------- */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {/*----------------------Heading-------------------------- */}
              <Grid item xs={12}>
                <Typography variant="h4" className="text-black py-2 font-semibold">
                  Account Information
                </Typography>
              </Grid>
              {/*----------------------Acc Code-------------------------- */}
              {isEditMode && (
                <Grid item xs={12} sm={4}>
                  <InputLabel>
                    <FormattedMessage id="A/c Code" />
                  </InputLabel>
                  <TextField
                    value={formik.values.ac_code}
                    name="ac_code"
                    disabled
                    onChange={formik.handleChange}
                    fullWidth
                    error={Boolean(getIn(formik.touched, 'ac_code') && getIn(formik.errors, 'ac_code'))}
                  />
                </Grid>
              )}
              {/*----------------------A/C Name-------------------------- */}
              <Grid item xs={12} sm={6}>
                <InputLabel>
                  <FormattedMessage id="A/C Name" />
                  <span className="text-red-500">*</span>
                </InputLabel>
                <TextField
                  size="small"
                  onChange={formik.handleChange}
                  id="ac_name"
                  name="ac_name"
                  fullWidth
                  value={formik.values.ac_name}
                  error={Boolean(getIn(formik.touched, 'ac_name') && getIn(formik.errors, 'ac_name'))}
                />
                {getIn(formik.touched, 'ac_name') && getIn(formik.errors, 'ac_name') && (
                  <FormHelperText error id="helper-text-first_name">
                    {getIn(formik.errors, 'ac_name')}
                  </FormHelperText>
                )}
              </Grid>
              {/*----------------------Department-------------------------- */}
              <Grid item xs={12} sm={6}>
                <InputLabel>
                  <FormattedMessage id="Department" />
                </InputLabel>
                <Autocomplete
                  id="dept_code"
                  value={
                    !!formik.values.dept_code
                      ? departmentList?.tableData.find((eachDepartment) => eachDepartment.dept_code === formik.values.dept_code)
                      : ({ dept_name: '', dept_code: '' } as TDepartment)
                  }
                  onChange={(event, value: TDepartment | null) => {
                    formik.setFieldValue('dept_code', value?.dept_code);
                  }}
                  options={departmentList?.tableData ?? []}
                  fullWidth
                  autoHighlight
                  size="small"
                  getOptionLabel={(option) => option?.dept_name}
                  isOptionEqualToValue={(option) => option.dept_code === formik.values.dept_code}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputProps={{
                        ...params.inputProps
                      }}
                    />
                  )}
                />
              </Grid>
              {/*--------------------Credit Period---------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="Credit Period" />
                </InputLabel>
                <TextField
                  name="credit_period"
                  id="outlined-basic"
                  type="number"
                  variant="outlined"
                  value={formik.values.credit_period}
                  inputProps={{ min: 0 }}
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                    const inputValue = event.target.value;
                    if (inputValue.charAt(0) !== '-') {
                      formik.handleChange(event);
                    }
                  }}
                  fullWidth
                  size="small"
                />
              </Grid>
              {/*--------------------Credit Amount---------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="Credit Amount" />
                </InputLabel>
                <TextField
                  name="credit_amount"
                  id="outlined-basic"
                  type="number"
                  variant="outlined"
                  value={formik.values.credit_amount}
                  inputProps={{ min: 0 }}
                  onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                    const inputValue = event.target.value;
                    if (inputValue.charAt(0) !== '-') {
                      formik.handleChange(event);
                    }
                  }}
                  InputProps={{
                    inputProps: {
                      style: { textAlign: 'right' }
                    }
                  }}
                  fullWidth
                  size="small"
                />
              </Grid>
              {/*----------------------Default Currency-------------------------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="Default Currency" />
                </InputLabel>
                <Autocomplete
                  id="curr_code"
                  value={
                    !!formik.values.curr_code
                      ? currencyList?.tableData?.find((eachCurrency) => eachCurrency.curr_code === formik.values.curr_code)
                      : ({ curr_name: '' } as TCurrency)
                  }
                  onChange={(event, value: TCurrency | null) => {
                    formik.setFieldValue('curr_code', value?.curr_code);
                  }}
                  size="small"
                  options={currencyList?.tableData ?? []}
                  fullWidth
                  autoHighlight
                  getOptionLabel={(option) => option?.curr_name}
                  isOptionEqualToValue={(option) => option.curr_code === formik.values.curr_code}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputProps={{
                        ...params.inputProps
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Grid>
          {/*-------------------------section 5--------------- */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              {/*----------------------Heading-------------------------- */}
              <Grid item xs={12}>
                <Typography variant="h4" className="text-black py-2 font-semibold">
                  Bank Information
                </Typography>
              </Grid>
              {/*-------------------------Bank Acc code--------------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="Bank A/c Code" />
                </InputLabel>
                <TextField
                  size="small"
                  value={formik.values.bank_ac_code}
                  name="bank_ac_code"
                  onChange={formik.handleChange}
                  fullWidth
                  error={Boolean(getIn(formik.touched, 'bank_ac_code') && getIn(formik.errors, 'bank_ac_code'))}
                />
              </Grid>
              {/*-------------------------Name--------------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="Name" />
                </InputLabel>
                <TextField
                  size="small"
                  value={formik.values.bank_name}
                  name="bank_name"
                  onChange={formik.handleChange}
                  fullWidth
                  error={Boolean(getIn(formik.touched, 'bank_name') && getIn(formik.errors, 'bank_name'))}
                />
              </Grid>
              {/*-------------------------Swift--------------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="Swift" />
                </InputLabel>
                <TextField
                  size="small"
                  value={formik.values.bank_swift}
                  name="bank_swift"
                  onChange={formik.handleChange}
                  fullWidth
                  error={Boolean(getIn(formik.touched, 'bank_swift') && getIn(formik.errors, 'bank_swift'))}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} sm={6}>
        <Grid container spacing={6}>
          {/*----------------------Section 3-------------------------- */}

          <Grid item xs={12}>
            <Grid container spacing={2}>
              {/*----------------------Heading-------------------------- */}
              <Grid item xs={12}>
                <Typography variant="h4" className="text-black py-2 font-semibold">
                  Contract and Approval Information
                </Typography>
              </Grid>
              {/*----------------------Expiry Date-------------------------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="Expiry Date" />
                </InputLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    format="DD/MM/YYYY"
                    slotProps={{ textField: { size: 'small' } }}
                    className="w-full"
                    value={formik.values.contract_expry_date ? dayjs(formik.values.contract_expry_date) : null}
                    onChange={(newValue: Dayjs | null) => {
                      if (newValue?.isValid()) formik.setFieldValue('contract_expry_date', newValue.toISOString());
                    }}
                  />
                </LocalizationProvider>
              </Grid>
              {/*----------------------In Designated Zone-------------------------- */}
              <Grid item xs={12} sm={6} className="flex items-end">
                <FormControlLabel
                  control={<Checkbox onChange={(event, checked) => formik.setFieldValue('ac_infze', checked ? 'Y' : 'N')} />}
                  checked={formik.values.ac_infze === 'Y'}
                  name="ac_infze"
                  label={<FormattedMessage id="In Designated Zone" />}
                  value={formik.values.ac_infze}
                />
              </Grid>
            </Grid>
          </Grid>
          {/*-------------------------section 6--------------- */}

          <Grid item xs={12}>
            <Grid container spacing={2}>
              {/*-------------------------Heading--------------- */}

              <Grid item xs={12}>
                <Typography variant="h4" className="text-black py-2 font-semibold">
                  Sales and Tax Information
                </Typography>
              </Grid>

              {/*----------------------Salesman-------------------------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="Salesman" />
                </InputLabel>
                <Autocomplete
                  id="salesman_code"
                  value={
                    !!formik.values.salesman_code
                      ? salesmanData?.tableData.find((eachSalesman) => eachSalesman.salesman_code === formik.values.salesman_code)
                      : ({ salesman_name: '' } as Tsalesman)
                  }
                  onChange={(event, value: Tsalesman | null) => {
                    formik.setFieldValue('salesman_code', value?.salesman_code);
                  }}
                  options={salesmanData?.tableData ?? []}
                  fullWidth
                  autoHighlight
                  getOptionLabel={(option) => option?.salesman_name}
                  size="small"
                  isOptionEqualToValue={(option) => option.salesman_code === formik.values.salesman_code}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputProps={{
                        ...params.inputProps
                      }}
                    />
                  )}
                />
              </Grid>
              {/*----------------------Sector-------------------------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="Sector" />
                </InputLabel>
                <Autocomplete
                  id="sector_code"
                  value={
                    !!formik.values.sector_code
                      ? sectorData?.tableData.find((eachSector) => eachSector.sector_code === formik.values.sector_code)
                      : ({ sector_name: '' } as TSector)
                  }
                  onChange={(event, value: TSector | null) => {
                    formik.setFieldValue('sector_code', value?.sector_code);
                  }}
                  options={sectorData?.tableData ?? []}
                  fullWidth
                  autoHighlight
                  getOptionLabel={(option) => option?.sector_name}
                  size="small"
                  isOptionEqualToValue={(option) => option.sector_code === formik.values.sector_code}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputProps={{
                        ...params.inputProps
                      }}
                    />
                  )}
                />
              </Grid>
              {/*----------------------Tax Country-------------------------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="Tax Country" />
                </InputLabel>
                <Autocomplete
                  id="tax_country_code"
                  value={
                    !!formik.values.tax_country_code
                      ? countryList?.tableData.find((eachCountry) => eachCountry.country_code === formik.values.tax_country_code)
                      : ({ country_name: '' } as TCountry)
                  }
                  onChange={(event, value: TCountry | null) => {
                    formik.setFieldValue('tax_country_code', value?.country_code);
                  }}
                  options={countryList?.tableData ?? []}
                  fullWidth
                  autoHighlight
                  getOptionLabel={(option) => option?.country_name}
                  size="small"
                  isOptionEqualToValue={(option) => option.country_code === formik.values.tax_country_code}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputProps={{
                        ...params.inputProps
                      }}
                    />
                  )}
                />
              </Grid>
              {/*-------------------------TRN No--------------- */}
              <Grid item xs={12} sm={6}>
                <InputLabel>
                  <FormattedMessage id="TRN No" />
                </InputLabel>
                <TextField
                  size="small"
                  value={formik.values.trn_no}
                  name="trn_no"
                  onChange={formik.handleChange}
                  fullWidth
                  error={Boolean(getIn(formik.touched, 'trn_no') && getIn(formik.errors, 'trn_no'))}
                />
              </Grid>

              {/*----------------------Tax Registered-------------------------- */}
              <Grid item xs={12} sm={3} className="flex items-end">
                <FormControlLabel
                  control={<Checkbox onChange={(event, checked) => formik.setFieldValue('tax_registrd', checked ? 'Y' : 'N')} />}
                  checked={formik.values.tax_registrd === 'Y'}
                  name="tax_registrd"
                  label={<FormattedMessage id="Tax Registered" />}
                  value={formik.values.tax_registrd}
                />
              </Grid>
              {/*----------------------Reverse Charge Apply-------------------------- */}
              <Grid item xs={12} sm={3} className="flex items-end">
                <FormControlLabel
                  control={<Checkbox onChange={(event, checked) => formik.setFieldValue('rcm_apply', checked ? 'Y' : 'N')} />}
                  checked={formik.values.rcm_apply === 'Y'}
                  name="rcm_apply"
                  label={<FormattedMessage id="Reverse Charge Apply" />}
                  value={formik.values.rcm_apply}
                />
              </Grid>
            </Grid>
          </Grid>
          {/*-------------------------section 2--------------- */}

          <Grid item xs={12}>
            <Grid container spacing={2}>
              {/*----------------------Heading-------------------------- */}
              <Grid item xs={12}>
                <Typography variant="h4" className="text-black py-2 font-semibold">
                  Bi Information
                </Typography>
              </Grid>
              {/*----------------------BS Code-------------------------- */}
              {['1', '2', '3'].includes(parent_code[0]) ? (
                <Grid item xs={12} sm={4}>
                  <InputLabel>
                    <FormattedMessage id="BS Code" />*
                  </InputLabel>
                  <Autocomplete
                    id="pl_bl_code"
                    value={
                      !!formik.values.pl_bl_code
                        ? blData?.tableData?.find((eachBlData) => eachBlData.bl_code === formik.values.pl_bl_code)
                        : ({ bl_name: '' } as TBlFinance)
                    }
                    onChange={(event, value: TBlFinance | null) => {
                      formik.setFieldValue('pl_bl_code', value?.bl_code);
                    }}
                    size="small"
                    options={blData?.tableData ?? []}
                    fullWidth
                    autoHighlight
                    getOptionLabel={(option) => option?.bl_name}
                    isOptionEqualToValue={(option) => option.bl_code === formik.values.pl_bl_code}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        inputProps={{
                          ...params.inputProps
                        }}
                      />
                    )}
                  />
                </Grid>
              ) : (
                <Grid item xs={12} sm={4}>
                  <InputLabel>
                    <FormattedMessage id="BS Code" />*
                  </InputLabel>
                  <Autocomplete
                    id="pl_bl_code"
                    value={
                      !!formik.values.pl_bl_code
                        ? plData?.tableData?.find((eachPlData) => eachPlData.pl_code === formik.values.pl_bl_code)
                        : ({ pl_name: '' } as TPlFinance)
                    }
                    onChange={(event, value: TPlFinance | null) => {
                      formik.setFieldValue('pl_bl_code', value?.pl_code);
                    }}
                    size="small"
                    options={plData?.tableData ?? []}
                    fullWidth
                    autoHighlight
                    getOptionLabel={(option) => option?.pl_name}
                    isOptionEqualToValue={(option) => option.pl_code === formik.values.pl_bl_code}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        inputProps={{
                          ...params.inputProps
                        }}
                      />
                    )}
                  />
                </Grid>
              )}
              {/*-------------------------BI Sub Group--------------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="BI Sub Group" />
                </InputLabel>
                <TextField
                  size="small"
                  value={formik.values.bi_sub_group}
                  name="bi_sub_group"
                  onChange={formik.handleChange}
                  fullWidth
                  error={Boolean(getIn(formik.touched, 'bi_sub_group') && getIn(formik.errors, 'bi_sub_group'))}
                />
              </Grid>
              {/*-------------------------BI Main Group--------------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="BI Main Group" />
                </InputLabel>
                <TextField
                  size="small"
                  value={formik.values.bi_main_group}
                  name="bi_main_group"
                  onChange={formik.handleChange}
                  fullWidth
                  error={Boolean(getIn(formik.touched, 'bi_main_group') && getIn(formik.errors, 'bi_main_group'))}
                />
              </Grid>
              {/*-------------------------BI PL BS IND--------------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="BI PL BS IND" />
                </InputLabel>
                <TextField
                  size="small"
                  value={formik.values.bi_pl_bs_ind}
                  name="bi_pl_bs_ind"
                  onChange={formik.handleChange}
                  fullWidth
                  error={Boolean(getIn(formik.touched, 'bi_pl_bs_ind') && getIn(formik.errors, 'bi_pl_bs_ind'))}
                />
              </Grid>
              {/*-------------------------BI Exp Type--------------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="BI Exp Type" />
                </InputLabel>
                <TextField
                  size="small"
                  value={formik.values.bi_exp_type}
                  name="bi_exp_type"
                  onChange={formik.handleChange}
                  fullWidth
                  error={Boolean(getIn(formik.touched, 'bi_exp_type') && getIn(formik.errors, 'bi_exp_type'))}
                />
              </Grid>
              {/*-------------------------BI Dept--------------- */}
              <Grid item xs={12} sm={4}>
                <InputLabel>
                  <FormattedMessage id="BI Dept" />
                </InputLabel>
                <TextField
                  size="small"
                  value={formik.values.bi_dept}
                  name="bi_dept"
                  onChange={formik.handleChange}
                  fullWidth
                  error={Boolean(getIn(formik.touched, 'bi_dept') && getIn(formik.errors, 'bi_dept'))}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} className="flex justify-end">
        <Button
          type="submit"
          variant="contained"
          disabled={formik.isSubmitting} // Disable button while form is submitting
          startIcon={formik.isSubmitting ? <LoadingOutlined /> : <SaveOutlined />} // Show loading icon if submitting, otherwise show save icon
        >
          <FormattedMessage id="Submit" />
        </Button>
      </Grid>

      {!!uploadFilesPopup && uploadFilesPopup.action.open && (
        <UniversalDialog
          action={{ ...uploadFilesPopup.action }}
          onClose={handleUploadPopup} // Handle dialog close
          title={uploadFilesPopup.title}
          hasPrimaryButton={false}
        >
          <Files existingFilesData={formik.values.files ?? []} filesData={filesData} setFilesData={setFilesData} module="acct" />
        </UniversalDialog>
      )}
    </Grid>
  );
};

export default AddAccountChildrenFinanceForm;
