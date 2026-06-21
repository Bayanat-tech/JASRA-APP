import { Autocomplete, Button, Grid, InputLabel, OutlinedInput, Stack, TextField, Typography } from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useQuery } from '@tanstack/react-query';
import dayjs, { Dayjs } from 'dayjs';
import { useFormik } from 'formik';
import { TLocation } from 'pages/WMS/types/location-wms.types';
import { TStorageDetailsPrincipalWms } from 'pages/WMS/types/principal-wms.types';
import { TSite } from 'pages/WMS/types/site-wms.types';
import { TStorageWms } from 'pages/WMS/types/storage-wms.types';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import WmsSerivceInstance from 'service/wms/service.wms';
import { useSelector } from 'store';

type TItem = { label: string; value: string };
const AddStoragePrincipleForm = ({
  submitting,
  handleNext,
  handleBack,
  storage,
  setStorage
}: {
  submitting: boolean;
  handleNext: () => void;
  handleBack: () => void;

  storage: TStorageDetailsPrincipalWms;
  setStorage: (value: TStorageDetailsPrincipalWms) => void;
}) => {
  //-------------constants-------------
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { app } = useSelector((state) => state.menuSelectionSlice);
  const storageTypes = [
    { label: 'Stock Storage', value: 'stock_storage' },
    { label: 'Flat Area Storage', value: 'flat_area_storage' },
    { label: 'Both', value: 'both' },
    { label: 'Doc Entry Wise', value: 'doc_entry_wise' },
    { label: 'Straight Method', value: 'straight_method' },
    { label: 'Lumpsum', value: 'lumpsum' }
  ];
  //----------------useQuery-----------------

  const { data: siteList } = useQuery({
    queryKey: ['site_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters(app, 'site', undefined, undefined);
      if (response) {
        return {
          tableData: response.tableData as TSite[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  });
  const { data: locationList } = useQuery({
    queryKey: ['location_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters(app, 'location', undefined, undefined);
      if (response) {
        return {
          tableData: response.tableData as TLocation[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  });

  console.log('locationList', locationList);

  const { data: storageList } = useQuery({
    queryKey: ['storage_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters(app, 'storage', undefined, undefined);
      if (response) {
        return {
          tableData: response.tableData as TStorageWms[],
          count: response.count
        };
      }
      return { tableData: [], count: 0 }; // Handle undefined case
    }
  });
  //----------------formik-----------------
  const formik = useFormik<TStorageDetailsPrincipalWms>({
    initialValues: storage,
    onSubmit: async (values) => {
      setStorage(values);
      setIsSubmitted(true);
    }
  });
  //-------------------------useEffects--------------
  useEffect(() => {
    if (!!storage && !!Object.keys(storage).length) formik.setValues(storage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storage]);
  useEffect(() => {
    if (isSubmitted === true && Object.keys(storage).length > 0) {
      handleNext();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSubmitted, storage]);

  return (
    <Grid container spacing={6} component={'form'} onSubmit={formik.handleSubmit}>
      <Grid item xs={12} sm={6}>
        <Grid container spacing={2}>
          <Grid item container xs={12}>
            <Typography variant="h4" className="text-black font-semibold">
              <FormattedMessage id="Location" />
            </Typography>
          </Grid>
          {/*----------------------Preferred Site-------------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Preferred" />
            </InputLabel>
            <Autocomplete
              id="Preferred Site"
              value={
                !!formik.values.pref_site
                  ? siteList?.tableData.find((eachSite) => eachSite.site_code === formik.values.pref_site)
                  : ({ site_name: '' } as TSite)
              }
              onChange={(event, value: TSite | null) => {
                formik.setFieldValue('pref_site', value?.site_code);
              }}
              options={siteList?.tableData ?? []}
              fullWidth
              autoHighlight
              size="small"
              getOptionLabel={(option) => option?.site_name}
              isOptionEqualToValue={(option) => option.site_code === formik.values.pref_site}
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
          {/*----------------------Location-------------------------- */}
          <Grid item xs={12} container spacing={2}>
            <Grid item xs={12} sm={6}>
              <InputLabel>
                <FormattedMessage id="Location From" />
              </InputLabel>
              <Autocomplete
                id="loc_from"
                value={
                  !!formik.values.pref_loc_from
                    ? locationList?.tableData.find((eachSite) => eachSite.location_code === formik.values.pref_loc_from)
                    : ({ loc_desc: '' } as TLocation)
                }
                onChange={(event, value: TLocation | null) => {
                  formik.setFieldValue('pref_loc_from', value?.location_code);
                }}
                options={locationList?.tableData ?? []}
                fullWidth
                autoHighlight
                size="small"
                getOptionLabel={(option) => option?.loc_desc ?? ''}
                isOptionEqualToValue={(option) => option.location_code === formik.values.pref_loc_from}
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

            <Grid item xs={12} sm={6}>
              <InputLabel>
                <FormattedMessage id="Location To" />
              </InputLabel>
              <Autocomplete
                id="pref_loc_to"
                value={
                  !!formik.values.pref_loc_to
                    ? locationList?.tableData.find((eachSite) => eachSite.location_code === formik.values.pref_loc_to)
                    : ({ loc_desc: '' } as TLocation)
                }
                onChange={(event, value: TLocation | null) => formik.setFieldValue('pref_loc_to', value?.location_code)}
                options={locationList?.tableData ?? []}
                fullWidth
                autoHighlight
                size="small"
                getOptionLabel={(option) => option?.loc_desc ?? ''}
                isOptionEqualToValue={(option) => option.location_code === formik.values.pref_loc_to}
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

          {/*----------------------Alise------------------------ */}
          <Grid item xs={12} container spacing={2}>
            <Grid item xs={12}>
              <Typography className="text-gray-600 font-medium">
                <FormattedMessage id="Alise" />
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <OutlinedInput
                type="number"
                endAdornment={<FormattedMessage id="From" />}
                inputProps={{ min: 0 }}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                  const inputValue = event.target.value;
                  if (inputValue.charAt(0) !== '-') {
                    formik.handleChange(event);
                  }
                }}
                id="pref_aisle_from"
                name="pref_aisle_from"
                fullWidth
                value={formik.values.pref_aisle_from}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <OutlinedInput
                type="number"
                endAdornment={<FormattedMessage id="To" />}
                inputProps={{ min: 0 }}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                  const inputValue = event.target.value;
                  if (inputValue.charAt(0) !== '-') {
                    formik.handleChange(event);
                  }
                }}
                id="pref_aisle_to"
                name="pref_aisle_to"
                fullWidth
                value={formik.values.pref_aisle_to}
              />
            </Grid>
          </Grid>
          {/*----------------------Column------------------------ */}

          <Grid item xs={12} container spacing={2}>
            <Grid item xs={12}>
              <Typography className="text-gray-600 font-medium">
                <FormattedMessage id="Column" />
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <OutlinedInput
                type="number"
                endAdornment={<FormattedMessage id="From" />}
                inputProps={{ min: 0 }}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                  const inputValue = event.target.value;
                  if (inputValue.charAt(0) !== '-') {
                    formik.handleChange(event);
                  }
                }}
                id="pref_col_from"
                name="pref_col_from"
                fullWidth
                value={formik.values.pref_col_from}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <OutlinedInput
                type="number"
                endAdornment={<FormattedMessage id="To" />}
                inputProps={{ min: 0 }}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                  const inputValue = event.target.value;
                  if (inputValue.charAt(0) !== '-') {
                    formik.handleChange(event);
                  }
                }}
                id="pref_col_to"
                name="pref_col_to"
                fullWidth
                value={formik.values.pref_col_to}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sm={6}>
        <Grid container spacing={2}>
          <Grid item container xs={12}>
            <Typography variant="h4" className="text-black font-semibold">
              <FormattedMessage id="Site, Service, and Storage Details" />
            </Typography>
          </Grid>
          {/*----------------------Height------------------------ */}

          <Grid item xs={12} container spacing={2}>
            <Grid item xs={12}>
              <Typography className="text-gray-600 font-medium">
                <FormattedMessage id="Height" />
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <OutlinedInput
                type="number"
                endAdornment={<FormattedMessage id="From" />}
                inputProps={{ min: 0 }}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                  const inputValue = event.target.value;
                  if (inputValue.charAt(0) !== '-') {
                    formik.handleChange(event);
                  }
                }}
                id="pref_ht_from"
                name="pref_ht_from"
                fullWidth
                value={formik.values.pref_ht_from}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <OutlinedInput
                type="number"
                endAdornment={<FormattedMessage id="To" />}
                inputProps={{ min: 0 }}
                onChange={(event: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
                  const inputValue = event.target.value;
                  if (inputValue.charAt(0) !== '-') {
                    formik.handleChange(event);
                  }
                }}
                id="pref_ht_to"
                name="pref_ht_to"
                fullWidth
                value={formik.values.pref_ht_to}
              />
            </Grid>
          </Grid>
          {/*----------------------Default Site Ind-------------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Default Site Ind" />
            </InputLabel>
            <Autocomplete
              id="Default Site Ind"
              value={
                !!formik.values.prin_siteind
                  ? siteList?.tableData.find((eachSite) => eachSite.site_code === formik.values.prin_siteind)
                  : ({ site_name: '' } as TSite)
              }
              onChange={(event, value: TSite | null) => {
                formik.setFieldValue('prin_siteind', value?.site_code);
              }}
              options={siteList?.tableData ?? []}
              fullWidth
              size="small"
              autoHighlight
              getOptionLabel={(option) => option?.site_name}
              isOptionEqualToValue={(option) => option.site_code === formik.values.prin_siteind}
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
          {/*----------------------Last Invoice Date-------------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Last Invoice Date" />
            </InputLabel>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                slotProps={{ textField: { size: 'small' } }}
                className="w-full"
                value={formik.values.service_date ? dayjs(formik.values.service_date) : null}
                onChange={(newValue: Dayjs | null) => {
                  if (newValue?.isValid()) formik.setFieldValue('service_date', newValue.toISOString());
                }}
              />
            </LocalizationProvider>
          </Grid>
          {/*----------------------Storage Type-------------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Storage Type" />
            </InputLabel>
            <Autocomplete
              id="Storage Type"
              value={
                !!formik.values.storage_type
                  ? storageTypes.find((eachStorage) => eachStorage.value === formik.values.storage_type)
                  : ({ value: '', label: '' } as TItem)
              }
              onChange={(event, value: TItem | null) => {
                formik.setFieldValue('storage_type', value?.value);
              }}
              options={storageTypes ?? []}
              fullWidth
              size="small"
              autoHighlight
              getOptionLabel={(option) => option?.label}
              isOptionEqualToValue={(option) => option.value === formik.values.storage_type}
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
          {/*----------------------Default Foc-------------------------- */}
          <Grid item xs={12} sm={6}>
            <InputLabel>
              <FormattedMessage id="Default Foc" />
            </InputLabel>
            <Autocomplete
              id="Default Foc"
              value={
                !!formik.values.default_foc
                  ? storageList?.tableData.find((eachStorage) => eachStorage.foc === formik.values.default_foc)
                  : ({ foc: '' } as TStorageWms)
              }
              onChange={(event, value: TStorageWms | null) => {
                formik.setFieldValue('default_foc', value?.foc);
              }}
              options={storageList?.tableData ?? []}
              fullWidth
              size="small"
              autoHighlight
              getOptionLabel={(option) => option?.foc}
              isOptionEqualToValue={(option) => option.foc === formik.values.default_foc}
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
      <Grid item xs={12} marginTop={18.2}>
        <Stack direction="row" justifyContent="space-between">
          <Button onClick={handleBack} sx={{ my: 1, ml: 1 }}>
            <FormattedMessage id="Back" />
          </Button>
          <Button variant="contained" type="submit" sx={{ my: 1, ml: 1 }} disabled={submitting}>
            <FormattedMessage id="Submit" />
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default AddStoragePrincipleForm;
