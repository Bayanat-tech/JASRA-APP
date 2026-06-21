import { EyeOutlined } from '@ant-design/icons';
import { Autocomplete, Button, FormHelperText, Grid, InputLabel, Paper, TextField, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useQuery } from '@tanstack/react-query';
import ProductPlaceholder from 'components/cards/skeleton/ProductPlaceholder';
import { ISearch, TSearchConditionsObject } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import StockReport from 'components/reports/wms/stockriteria/detailstock/StockReport';
import SummuryReport from 'components/reports/wms/stockriteria/summurystock/SummuryReport';
import dayjs, { Dayjs } from 'dayjs';
import { getIn, useFormik } from 'formik';
import { TBrand } from 'pages/WMS/types/brand-wms.types';
import { TGroup } from 'pages/WMS/types/group-wms.types';
import { TPrincipalWms } from 'pages/WMS/types/principal-wms.types';
import { TProduct } from 'pages/WMS/types/product-wms.types';
import { useEffect, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router';
import { useReactToPrint } from 'react-to-print';
import StockcriteriaServiceInstance from 'service/wms/reports/stockcritera/service.stockcriteriaDetailsWms';
import WmsSerivceInstance from 'service/wms/service.wms';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import * as yup from 'yup';
import { TDetailFilter, TDetailReport, TSummary } from '../types/detailStockWms.types';

const DetailsStock = () => {
  //--------------------------constants------------------------
  const contentRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;
  const date = new Date();
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;
  const formattedTime = date.toLocaleTimeString();
  const handlePrint = useReactToPrint({
    contentRef,
    pageStyle: `
    @page { 
      size: A4 landscape;
      margin: 11mm;

      @top-left { 
        content: "Printed on: ${formattedDate} ${formattedTime}"; 
        font-size: 12px;  
        text-align: left;
        padding-left: 5mm; 
      }

      @top-right {
        content: "Powered By Bayanat"; 
        font-size: 12px; 
        text-align: right;
        padding-right: 5mm; 
      }
    }

    @bottom-right {
      content: "Page " counter(page) " of " counter(pages); 
      font-size: 12px; 
      text-align: right;
      padding-right: 5mm; 
    }

 
    body:last-child tfoot {
      display: table-footer-group;
    }

    
    tfoot {
      display: none;
    }
  `,
    onBeforePrint: async () => {},
    onAfterPrint: () => {
      formik.resetForm();
      setFilterValue({ sort: undefined, search: [] });
      togglePrintData();
    }
  });

  const [printDataPopup, setPrintDataPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: <FormattedMessage id="Print Report" />,
    data: {}
  });

  const [filterValue, setFilterValue] = useState<ISearch>({ sort: undefined, search: [] });

  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);

  //----------------formik-----------------

  const formik = useFormik<TDetailFilter>({
    initialValues: {
      prin_code: '',
      productGroupFrom: '',
      productGroupTo: '',
      brand_code_from: '',
      brand_code_to: '',
      prod_code_from: '',
      prod_code_to: '',
      expirationDateTo: '' as unknown as Date,
      mfg_date_from: '' as unknown as Date,
      mfg_date_to: '' as unknown as Date,
      expirationDateFrom: '' as unknown as Date,
      ...(pathNameList[pathNameList.length - 1] === 'summarystock' && {
          txn_date_from: '' as unknown as Date
        } && {
          txn_date_to: '' as unknown as Date
        })
    },

    validationSchema: yup.object().shape({
      prin_code: yup.string().required('This field is required')
    }),

    onSubmit: () => {
      const newSearch = filterValue?.search?.map((filter) => {
        const updatedFilter = filter.map((condition) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { label, ...rest } = condition;
          return rest;
        });
        return updatedFilter;
      });

      setFilterValue({ ...filterValue, search: newSearch as TSearchConditionsObject[][] });
      togglePrintData();
    }
  });

  //---------use Query---------
  const { data: principalData } = useQuery({
    queryKey: ['principal_data'],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters('wms', 'principal');
      if (response) {
        return {
          tableData: response.tableData as TPrincipalWms[]
        };
      }
      return { tableData: [] }; // Handle undefined case
    }
  });

  const { data: productData } = useQuery({
    queryKey: ['product_data', formik.values.prin_code],
    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters('wms', 'product');
      if (response) {
        return {
          tableData: response.tableData as TProduct[]
        };
      }
      return { tableData: [] };
    },
    enabled: !!formik.values.prin_code
  });

  const { data: brandData } = useQuery({
    queryKey: ['brand_data', formik.values.prin_code],

    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters('wms', 'brand');
      if (response) {
        return {
          tableData: response.tableData as TBrand[]
        };
      }
      return { tableData: [] };
    },
    enabled: !!formik.values.prin_code && formik.values.prin_code.length > 0
  });

  const { data: groupData } = useQuery({
    queryKey: ['group_data', formik.values.prin_code],

    queryFn: async () => {
      const response = await WmsSerivceInstance.getMasters('wms', 'group');
      if (response) {
        return {
          tableData: response.tableData as TGroup[]
        };
      }
      return { tableData: [] };
    },
    enabled: !!formik.values.prin_code
  });

  const { data: reportData } = useQuery({
    queryKey: ['report_Data', printDataPopup.action.open],
    queryFn: () => {
      switch (pathNameList[pathNameList.length - 1]) {
        case 'summarystock':
          return StockcriteriaServiceInstance.getSummaryReport({
            filterValue: filterValue as ISearch,
            reportName: pathNameList[pathNameList.length - 1],
            prin_code: formik.values.prin_code,
            prod_code_from: formik.values.prod_code_from,
            prod_code_to: formik.values.prod_code_to,
            start_date: formik.values.txn_date_from,
            end_date: formik.values.txn_date_to
          });
        case 'detailstock':
          return StockcriteriaServiceInstance.getDetailReport({
            filterValue: filterValue as ISearch,
            reportName: pathNameList[pathNameList.length - 1]
          });
      }
    },
    enabled: !!formik.values.prin_code && !!printDataPopup.action.open
  });

  //---------handlers--------
  const togglePrintData = () => {
    setPrintDataPopup((prev) => {
      return { ...prev, data: {}, action: { ...prev.action, open: !prev.action.open } };
    });
  };

  const handleFilterData = (label: string, field_name: string, field_value: string | Date[] | undefined, operator: string) => {
    const newSearch = filterValue?.search?.map((filter) => {
      const updatedFilter = filter.map((condition) => {
        if (condition.label === label) {
          return { ...condition, field_value, operator, label };
        }
        return condition;
      });
      return updatedFilter;
    });

    const hasFieldName = newSearch?.some((filter) => filter.some((condition) => condition.label === label));

    if (!hasFieldName) {
      newSearch?.push([{ field_name, field_value, operator, label }]);
    }
    setFilterValue({ ...filterValue, search: newSearch as TSearchConditionsObject[][] });
  };

  //------------Render Report Handlers------
  const renderReport = () => {
    if (!!formik.values.prin_code) {
      switch (pathNameList[pathNameList.length - 1]) {
        case 'detailstock':
          return <StockReport handlPrint={handlePrint} contentRef={contentRef} data={reportData as TDetailReport} />;
        case 'summarystock':
          return (
            <SummuryReport
              handlePrint={handlePrint}
              prin_code={formik.values.prin_code as string}
              contentRef={contentRef}
              data={reportData as TSummary[]}
            />
          );
      }
    }
  };

  //----------useffect-------
  useEffect(() => {
    return () => {
      formik.resetForm();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Grid container component={'form'} onSubmit={formik.handleSubmit} spacing={2}>
      <Grid container item component={Paper} xs={12} paddingBottom={2} paddingRight={2} marginLeft={2} marginTop={2}>
        <Grid className="flex justify-end" item xs={12}>
          <Button disabled={!formik.values.prin_code} startIcon={<EyeOutlined />} variant="contained" type="submit">
            <FormattedMessage id="Preview" />
          </Button>
        </Grid>

        <Grid item xs={12} sm={4}>
          <InputLabel>
            <FormattedMessage id="Principal" />
            <span className="text-red-500">*</span>
          </InputLabel>
          <Autocomplete
            id="prin_code"
            value={
              !!formik.values.prin_code
                ? principalData?.tableData.find((eachPrincipal) => eachPrincipal.prin_code === formik.values.prin_code)
                : ({ prin_name: '' } as TPrincipalWms)
            }
            onChange={(event, value: TPrincipalWms | null) => {
              if (!!value) {
                formik.setFieldValue('prin_code', value?.prin_code);
                if (pathNameList[pathNameList.length - 1] === 'detailstock') {
                  handleFilterData('prin_code', 'prin_code', value?.prin_code as string, 'exactmatch');
                }
              }
            }}
            size="small"
            options={principalData?.tableData ?? []}
            fullWidth
            autoHighlight
            getOptionLabel={(option) => option.prin_name}
            renderInput={(params) => (
              <TextField
                {...params}
                inputProps={{
                  ...params.inputProps
                }}
                autoFocus
              />
            )}
          />

          {getIn(formik.touched, 'principal') && getIn(formik.errors, 'principal') && (
            <FormHelperText error id="helper-text-first_name">
              {getIn(formik.errors, 'principal')}
            </FormHelperText>
          )}
        </Grid>

        <Grid container item rowSpacing={1}>
          <Grid item xs={12}>
            <Typography variant="h5" marginTop={2}>
              <FormattedMessage id="Product Details" />
            </Typography>
          </Grid>

          {pathNameList[pathNameList.length - 1] === 'detailstock' && (
            <Grid container item spacing={{ sm: 12, xs: 2 }}>
              <Grid item sm={6} xs={12}>
                <InputLabel>
                  <FormattedMessage id="Product Group From" />
                </InputLabel>
                <Autocomplete
                  id="product_group_from"
                  value={
                    !!formik.values.productGroupFrom
                      ? groupData?.tableData.find((eachPGF) => eachPGF.group_code === formik.values.productGroupFrom)
                      : ({ group_name: '' } as TGroup)
                  }
                  onChange={(event, value: TGroup | null) => {
                    if (!!value) {
                      formik.setFieldValue('productGroupFrom', value?.group_code);

                      handleFilterData('productGroupFrom', 'group_code', value?.group_code as string, '>=');
                    }
                  }}
                  size="small"
                  options={groupData?.tableData ?? []}
                  fullWidth
                  autoHighlight
                  getOptionLabel={(option) => option.group_name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputProps={{
                        ...params.inputProps
                      }}
                    />
                  )}
                />

                {getIn(formik.touched, 'productGroupFrom') && getIn(formik.errors, 'productGroupFrom') && (
                  <FormHelperText error id="helper-text-first_name">
                    {getIn(formik.errors, 'productGroupFrom')}
                  </FormHelperText>
                )}
              </Grid>

              <Grid item sm={6} xs={12}>
                <InputLabel>
                  <FormattedMessage id="Product Group To" />
                </InputLabel>
                <Autocomplete
                  id="product_group_to"
                  value={
                    !!formik.values.productGroupTo
                      ? groupData?.tableData.find((eachPGT) => eachPGT.group_code === formik.values.productGroupTo)
                      : ({ group_name: '' } as TGroup)
                  }
                  onChange={(event, value: TGroup | null) => {
                    formik.setFieldValue('productGroupTo', value?.group_code);
                    handleFilterData('productGroupTo', 'group_code', value?.group_code as string, '<=');
                  }}
                  size="small"
                  options={groupData?.tableData ?? []}
                  fullWidth
                  autoHighlight
                  getOptionLabel={(option) => option?.group_name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputProps={{
                        ...params.inputProps
                      }}
                    />
                  )}
                />

                {getIn(formik.touched, 'productGroupTo') && getIn(formik.errors, 'productGroupTo') && (
                  <FormHelperText error id="helper-text-first_name">
                    {getIn(formik.errors, 'productGroupTo')}
                  </FormHelperText>
                )}
              </Grid>
            </Grid>
          )}

          {pathNameList[pathNameList.length - 1] === 'detailstock' && (
            <Grid container item spacing={{ sm: 12, xs: 2 }}>
              <Grid item sm={6} xs={12}>
                <InputLabel>
                  <FormattedMessage id="Product Brand From" />
                </InputLabel>
                <Autocomplete
                  id="product_brand_from"
                  value={
                    !!formik.values.brand_code_from
                      ? brandData?.tableData.find((eachPBF) => eachPBF.brand_code === formik.values.brand_code_from)
                      : ({ brand_name: '' } as TBrand)
                  }
                  onChange={(event, value: TBrand | null) => {
                    formik.setFieldValue('brand_code_from', value?.brand_code);
                    handleFilterData('brand_code_from', 'brand_code', value?.brand_code as string, '>=');
                  }}
                  size="small"
                  options={brandData?.tableData ?? []}
                  fullWidth
                  autoHighlight
                  getOptionLabel={(option) => option?.brand_name ?? ''}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputProps={{
                        ...params.inputProps
                      }}
                    />
                  )}
                />

                {getIn(formik.touched, 'brand_code_from') && getIn(formik.errors, 'brand_code_from') && (
                  <FormHelperText error id="helper-text-first_name">
                    {getIn(formik.errors, 'brand_code_from')}
                  </FormHelperText>
                )}
              </Grid>

              <Grid item sm={6} xs={12}>
                <InputLabel>
                  <FormattedMessage id="Product Brand To" />
                </InputLabel>
                <Autocomplete
                  id="product_brand_to"
                  value={
                    !!formik.values.brand_code_to
                      ? brandData?.tableData.find((eachPBT) => eachPBT.brand_code === formik.values.brand_code_to)
                      : ({ brand_name: '' } as TBrand)
                  }
                  onChange={(event, value: TBrand | null) => {
                    formik.setFieldValue('brand_code_to', value?.brand_code);
                    handleFilterData('brand_code_to', 'brand_code', value?.brand_code as string, '<=');
                  }}
                  size="small"
                  options={brandData?.tableData ?? []}
                  fullWidth
                  autoHighlight
                  getOptionLabel={(option) => option?.brand_name ?? ''}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      inputProps={{
                        ...params.inputProps
                      }}
                    />
                  )}
                />

                {getIn(formik.touched, 'brand_code_to') && getIn(formik.errors, 'brand_code_to') && (
                  <FormHelperText error id="helper-text-first_name">
                    {getIn(formik.errors, 'brand_code_to')}
                  </FormHelperText>
                )}
              </Grid>
            </Grid>
          )}

          <Grid container item spacing={{ sm: 12, xs: 2 }}>
            <Grid item sm={6} xs={12}>
              <InputLabel>
                <FormattedMessage id="Product From" />
              </InputLabel>
              <Autocomplete
                id="product_from"
                value={
                  !!formik.values.prod_code_from
                    ? productData?.tableData.find((eachPF) => eachPF.prod_code === formik.values.prod_code_from)
                    : ({ prod_name: '' } as TProduct)
                }
                onChange={(event, value: TProduct | null) => {
                  formik.setFieldValue('prod_code_from', value?.prod_code);
                }}
                size="small"
                options={productData?.tableData ?? []}
                fullWidth
                autoHighlight
                getOptionLabel={(option) => option?.prod_name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    inputProps={{
                      ...params.inputProps
                    }}
                  />
                )}
              />

              {getIn(formik.touched, 'prod_code_from') && getIn(formik.errors, 'prod_code_from') && (
                <FormHelperText error id="helper-text-first_name">
                  {getIn(formik.errors, 'prod_code_from')}
                </FormHelperText>
              )}
            </Grid>

            <Grid item sm={6} xs={12}>
              <InputLabel>
                <FormattedMessage id="Product To" />
              </InputLabel>
              <Autocomplete
                id="product_to"
                value={
                  !!formik.values.prod_code_to
                    ? productData?.tableData.find((eachPT) => eachPT.prod_code === formik.values.prod_code_to)
                    : ({ prod_name: '' } as TProduct)
                }
                onChange={(event, value: TProduct | null) => {
                  formik.setFieldValue('prod_code_to', value?.prod_code);
                }}
                size="small"
                options={productData?.tableData ?? []}
                fullWidth
                autoHighlight
                getOptionLabel={(option) => option?.prod_name}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    inputProps={{
                      ...params.inputProps
                    }}
                  />
                )}
              />

              {getIn(formik.touched, 'prod_code_to') && getIn(formik.errors, 'prod_code_to') && (
                <FormHelperText error id="helper-text-first_name">
                  {getIn(formik.errors, 'prod_code_to')}
                </FormHelperText>
              )}
            </Grid>
          </Grid>

          {pathNameList[pathNameList.length - 1] === 'detailstock' && (
            <Grid container item spacing={{ sm: 12, xs: 2 }}>
              <Grid item sm={6} xs={12}>
                <InputLabel>
                  <FormattedMessage id="Manuf. Date From" />
                </InputLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    format="DD/MM/YYYY"
                    value={formik.values.mfg_date_from ? dayjs(formik.values.mfg_date_from) : null}
                    onChange={(newValue: Dayjs | null) => {
                      if (newValue?.isValid()) {
                        formik.setFieldValue('mfg_date_from', newValue.toISOString());
                        handleFilterData('mfg_date_from', 'mfg_date', dayjs(newValue).format('MM/DD/YYYY'), '>=');
                      }
                    }}
                    slotProps={{ textField: { size: 'small' } }}
                    sx={{
                      width: '100%'
                    }}
                    name="mfg_date_from"
                  />
                </LocalizationProvider>

                {getIn(formik.touched, 'mfg_date_from') && getIn(formik.errors, 'mfg_date_from') && (
                  <FormHelperText error id="helper-text-first_name">
                    {getIn(formik.errors, 'mfg_date_from')}
                  </FormHelperText>
                )}
              </Grid>

              <Grid item sm={6} xs={12}>
                <InputLabel>
                  <FormattedMessage id="Manuf. Date To" />
                </InputLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    format="DD/MM/YYYY"
                    minDate={dayjs(formik.values.mfg_date_from)}
                    value={formik.values.mfg_date_to ? dayjs(formik.values.mfg_date_to) : null}
                    onChange={(newValue: Dayjs | null) => {
                      if (newValue?.isValid()) {
                        formik.setFieldValue('mfg_date_to', newValue.toISOString());
                        handleFilterData('mfg_date_to', 'mfg_date', dayjs(newValue).format('MM/DD/YYYY'), '<=');
                      }
                    }}
                    slotProps={{ textField: { size: 'small' } }}
                    sx={{
                      width: '100%'
                    }}
                    name="mfg_date_to"
                  />
                </LocalizationProvider>

                {getIn(formik.touched, 'mfg_date_to') && getIn(formik.errors, 'mfg_date_to') && (
                  <FormHelperText error id="helper-text-first_name">
                    {getIn(formik.errors, 'mfg_date_to')}
                  </FormHelperText>
                )}
              </Grid>
            </Grid>
          )}

          {pathNameList[pathNameList.length - 1] === 'detailstock' && (
            <Grid container item spacing={{ sm: 12, xs: 2 }}>
              <Grid item sm={6} xs={12}>
                <InputLabel>
                  <FormattedMessage id="Exp. Date From" />
                </InputLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    format="DD/MM/YYYY"
                    value={formik.values.expirationDateFrom ? dayjs(formik.values.expirationDateFrom) : null}
                    onChange={(newValue: Dayjs | null) => {
                      if (newValue?.isValid()) {
                        formik.setFieldValue('expirationDateFrom', newValue.toISOString());
                        handleFilterData(
                          'expirationDateFrom',
                          'exp_date',
                          [newValue.toDate(), formik.values.expirationDateFrom],
                          'between'
                        );
                      }
                    }}
                    slotProps={{ textField: { size: 'small' } }}
                    sx={{
                      width: '100%'
                    }}
                    name="expirationDateFrom"
                  />
                </LocalizationProvider>

                {getIn(formik.touched, 'expirationDateFrom') && getIn(formik.errors, 'expirationDateFrom') && (
                  <FormHelperText error id="helper-text-first_name">
                    {getIn(formik.errors, 'expirationDateFrom')}
                  </FormHelperText>
                )}
              </Grid>

              <Grid item sm={6} xs={12}>
                <InputLabel>
                  <FormattedMessage id="Exp. Date To" />
                </InputLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    format="DD/MM/YYYY"
                    minDate={dayjs(formik.values.expirationDateFrom)}
                    value={formik.values.expirationDateTo ? dayjs(formik.values.expirationDateTo) : null}
                    onChange={(newValue: Dayjs | null) => {
                      if (newValue?.isValid()) {
                        formik.setFieldValue('expirationDateTo', newValue.toISOString());
                        handleFilterData('expirationDateTo', 'exp_date', [formik.values.expirationDateTo, newValue.toDate()], 'between');
                      }
                    }}
                    slotProps={{ textField: { size: 'small' } }}
                    sx={{
                      width: '100%'
                    }}
                    name="expirationDateTo"
                  />
                </LocalizationProvider>

                {getIn(formik.touched, 'expirationDateTo') && getIn(formik.errors, 'expirationDateTo') && (
                  <FormHelperText error id="helper-text-first_name">
                    {getIn(formik.errors, 'expirationDateTo')}
                  </FormHelperText>
                )}
              </Grid>
            </Grid>
          )}

          {pathNameList[pathNameList.length - 1] === 'summarystock' || pathNameList[pathNameList.length - 1] === 'aging' ? (
            <Grid container item spacing={{ sm: 12, xs: 2 }}>
              <Grid item sm={6} xs={12}>
                <InputLabel>
                  <FormattedMessage id="Transaction Date From" />
                </InputLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    format="DD/MM/YYYY"
                    value={formik.values.txn_date_from ? dayjs(formik.values.txn_date_from) : null}
                    onChange={(newValue: Dayjs | null) => {
                      if (!!newValue && newValue?.isValid()) {
                        formik.setFieldValue('txn_date_from', newValue.toISOString());
                      }
                    }}
                    slotProps={{ textField: { size: 'small' } }}
                    sx={{
                      width: '100%'
                    }}
                    name="txn_date_from"
                  />
                </LocalizationProvider>

                {getIn(formik.touched, 'txn_date_from') && getIn(formik.errors, 'txn_date_from') && (
                  <FormHelperText error id="helper-text-first_name">
                    {getIn(formik.errors, 'txn_date_from')}
                  </FormHelperText>
                )}
              </Grid>

              <Grid item sm={6} xs={12}>
                <InputLabel>
                  <FormattedMessage id="Transaction Date To" />
                </InputLabel>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    format="DD/MM/YYYY"
                    minDate={dayjs(formik.values.txn_date_from)}
                    value={formik.values.txn_date_to ? dayjs(formik.values.txn_date_to) : null}
                    onChange={(newValue: Dayjs | null) => {
                      if (newValue?.isValid()) {
                        formik.setFieldValue('txn_date_to', newValue.toISOString());
                        if (!(pathNameList[pathNameList.length - 1] === 'summarystock'))
                          handleFilterData(
                            'txn_date',
                            'txn_date',
                            [dayjs(formik.values.txn_date_from).toDate(), newValue.toDate()],
                            'between'
                          );
                      }
                    }}
                    slotProps={{ textField: { size: 'small' } }}
                    sx={{
                      width: '100%'
                    }}
                    name="txn_date_to"
                  />
                </LocalizationProvider>

                {getIn(formik.touched, 'txn_date_to') && getIn(formik.errors, 'txn_date_to') && (
                  <FormHelperText error id="helper-text-first_name">
                    {getIn(formik.errors, 'txn_date_to')}
                  </FormHelperText>
                )}
              </Grid>
            </Grid>
          ) : null}
        </Grid>
      </Grid>

      {!!printDataPopup && !!printDataPopup.action.open && (
        <UniversalDialog
          action={{ ...printDataPopup.action }}
          onClose={togglePrintData}
          title={printDataPopup.title}
          hasPrimaryButton={false}
        >
          {!reportData ? (
            <ProductPlaceholder />
          ) : pathNameList[pathNameList.length - 1] === 'summarystock' ? (
            <SummuryReport
              handlePrint={handlePrint}
              prin_code={formik.values.prin_code as string}
              contentRef={contentRef}
              data={reportData as TSummary[]}
            />
          ) : (
            <StockReport handlPrint={handlePrint} contentRef={contentRef} data={reportData as TDetailReport} />
          )}
        </UniversalDialog>
      )}

      <div className="hidden">{renderReport()} </div>
    </Grid>
  );
};

export default DetailsStock;
