import { useQuery } from '@tanstack/react-query';
import { ISearch } from 'components/filters/SearchFilter';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import useAuth from 'hooks/useAuth';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router';
import PfServiceInstance from 'service/service.purhaseflow'; // Correct spelling!
import WmsSerivceInstance from 'service/service.wms';
import { ColDef } from 'ag-grid-community';
import { useSelector } from 'store';
import { getPathNameList } from 'utils/functions';
import { TextField, Box, Autocomplete, Grid, Typography, Divider, InputAdornment, IconButton, Radio } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { DialogPop } from 'components/popup/DIalogPop';
// import { TLocation } from 'pages/WMS/types/location-wms.types';
import { IStnDetailRequest } from 'service/wms/transaction/stocktransfer/stocktransfertypes';
import BlueButton from 'components/buttons/BlueButton';
import { SearchIcon } from 'lucide-react';
import { TOrderDetail as OriginalTOrderDetail } from 'pages/WMS/Transaction/outbound/types/jobOutbound_wms.types';
import OutboundJobServiceInstance from 'service/wms/transaction/outbound/service.outboundJobWms';

// Extend TOrderDetail to include conversion_factor if not present
type TOrderDetail = OriginalTOrderDetail & { conversion_factor?: number };

//--- Type Declarations --

const TransferDetailsTab2 = () => {
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  // --- State ---
  const [paginationData, setPaginationData] = useState({ page: 1, rowsPerPage: 2000 });
  const [searchData, setSearchData] = useState<ISearch | null>(null);
  const [, setGridApi] = useState<any>(null);
  const [rowData, setRowData] = useState<any[]>([]);
  const [prodOptions, setProdOptions] = useState<any>();
  const [locOptions, setLocOptions] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<TOrderDetail | null>(null);
  const [open, setOpen] = useState(false);
  const [productDialog, setProductDialog] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [siteResponse, setSiteOptions] = useState<any[]>([]);
  // const [orderEntryOptions, setOrderOptions] = useState<any[]>([]);
  //const [custCode, setCustCode] = useState<any>('');
  const [LotNum, setLotnum] = useState<any>('');
  //const [details, setDetails] = useState<TOrderDetail>();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<IStnDetailRequest>({
    stn_no: 0, // required number, initialize as 0 or suitable default
    prin_code: '', // required string, initialize empty
    seq_number: 0, // required number, default 0
    serial_no: 0, // required number, default 0
    company_code: '', // required string, empty default
    loc_code_from: '',
    // Optional fields initialized to empty or undefined
    prod_code: '',
    job_no: '',
    container_no: '',
    doc_ref: '',
    from_site: '',
    to_site: '',
    from_loc_start: '',
    from_loc_end: '',
    to_loc_start: '',
    to_loc_end: '',
    from_column_start: undefined,
    from_column_end: undefined,
    to_column_start: undefined,
    to_column_end: undefined,
    from_height_start: undefined,
    from_height_end: undefined,
    to_height_start: undefined,
    to_height_end: undefined,
    from_aisle_start: '',
    from_aisle_end: '',
    to_aisle_start: '',
    to_aisle_end: '',
    lot_no: '',
    mfg_date: undefined,
    exp_date: undefined,
    user_id: '',
    user_dt: undefined,
    qty_puom: undefined,
    qty_luom: undefined,
    p_uom: '',
    allocated: '',
    confirmed: '',
    allocated_date: undefined,
    confirmed_date: undefined,
    mixed_putaway: '',
    l_uom: '',
    quantity: undefined,
    key_number: '',
    selected: '',
    processed: '',
    receipt_type: '',
    exp_date_to: undefined,
    lot_no_to: '',
    batch_no_from: '',
    batch_no_to: '',
    count_no: '',
    pallet_id: '',
    multi_series: '',
    carton_no_from: '',
    carton_no_to: '',

    // Audit columns
    created_at: undefined,
    created_by: '',
    updated_at: undefined,
    updated_by: ''
  });

  const fetch = async () => {
    try {
      setLoading(true);
      const [siteResponse, locationResponse, lotResponse] = await Promise.all([
        OutboundJobServiceInstance.getddSiteCode(),
        WmsSerivceInstance.getddLocationCode(),
        //OutboundJobServiceInstance.getddPrinceCustomer(details?.company_code || '', details?.prin_code || ''),
        OutboundJobServiceInstance.getddLotNum()
      ]);

      if (siteResponse) {
        console.log(siteResponse, 'siteResponse');
        setSiteOptions(siteResponse);
      }
      // if (orderEntryResponse) {
      //   console.log(orderEntryResponse, 'orderEntryResponse');
      //   setOrderOptions(orderEntryResponse);
      // }
      if (locationResponse) {
        console.log(locationResponse, 'locationResponse');
        setLocOptions(locationResponse);
      }
      if (lotResponse) {
        console.log(lotResponse, 'lotResponse');
        setLotnum(lotResponse);
      }
      // if (custResponse) {
      //   console.log(custResponse, 'custResponse');
      //   setCustCode(custResponse);
      // }
    } catch (error) {
      const knownError = error as { message: string };
      console.error('Error:', knownError.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Permissions ---
  const children = permissions?.[app.toUpperCase()]?.children || {};
  const moduleKey = Object.keys(children).find((key) => key.toLowerCase() === pathNameList[3]?.toLowerCase());
  const serialNumber = moduleKey ? children[moduleKey]?.serial_number?.toString() : undefined;
  const permissionCheck = !!serialNumber && !!user_permission && Object.keys(user_permission).includes(serialNumber);

  // --- Queries ---
  const { data: SupplierData } = useQuery({
    queryKey: ['cost_data', searchData, paginationData],
    queryFn: () => PfServiceInstance.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
    enabled: permissionCheck
  });

  // Utility
  const calculateQuantity = (data: Partial<TOrderDetail>): number => {
    const { qty_puom, conversion_factor } = data;
    return (qty_puom ?? 0) * (conversion_factor ?? 1);
  };

  // Fetch locations when putwayDetails.site_from changes

  // Set table data
  useEffect(() => {
    setRowData(SupplierData?.tableData || []);
  }, [SupplierData]);

  // AG Grid column definitions
  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: 'prod_code', headerName: 'Product Code', editable: true, sortable: true, filter: true },
      { field: 'transfer_from', headerName: 'Transfer From', editable: true },
      { field: 'transfer_to', headerName: 'Transfer To', editable: true },
      { field: 'l_uom', headerName: 'UOM', editable: true },
      { field: 'Quantity', headerName: 'Quantity', editable: true },
      { field: 'job_no', headerName: 'Job No', editable: true },
      { field: 'lot_no_from', headerName: 'Lot No From', editable: true },
      { field: 'lot_no_to', headerName: 'Lot No To', editable: true },
      { field: 'batch_no_from', headerName: 'Batch No From', editable: true },
      { field: 'batch_no_to', headerName: 'Batch No To', editable: true },
      { field: 'expiry_date_from', headerName: 'Expiry Date From', editable: true },
      { field: 'expiry_date_to', headerName: 'Expiry Date To', editable: true },
      { field: 'container_no', headerName: 'Container No', editable: true },
      { field: 'doc_ref', headerName: 'Doc. Ref.', editable: true },
      { field: 'manufacture_date', headerName: 'Manufacture Date', editable: true },
      { field: 'quantity2', headerName: 'Quantity 2', editable: true },
      { field: 'transaction', headerName: 'Transaction', editable: true }
    ],
    []
  );

  const RadioCellRenderer = (params: any) => {
    const isSelected = params.node.isSelected();

    const handleChange = () => {
      // Clear all other selections
      params.api.forEachNode((node: any) => {
        node.setSelected(false);
      });

      // Select current node
      params.node.setSelected(true);
      params.api.refreshCells({ force: true });
    };

    return (
      <Radio
        checked={isSelected}
        onChange={handleChange}
        color="primary"
        size="small"
        value={params.node.id}
        sx={{
          padding: '0',
          '&.Mui-checked': {
            color: 'primary.main'
          }
        }}
      />
    );
  };

  // AG Grid handlers
  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
  };
  const onFilterChanged = useCallback((event: any) => {
    const filterModel = event.api.getFilterModel();
    const filters: any[] = [];
    Object.entries(filterModel).forEach(([field, value]: [string, any]) => {
      if (value.filter || value.value) {
        filters.push([
          {
            field_name: field,
            field_value: value.filter || value.value,
            operator: 'equals'
          }
        ]);
      }
    });
    setSearchData({
      sort: { field_name: 'updated_at', desc: true },
      search: filters.length > 0 ? filters : [[]]
    });
  }, []);
  const handleProduct = async () => {
    try {
      // Hardcoded values
      const effectiveCompanyCode = 'JASRA';
      const effectivePrinCode = '10001';

      // Get product list
      const prodList = await WmsSerivceInstance.getProductAvailability(effectiveCompanyCode, effectivePrinCode);

      if (Array.isArray(prodList)) {
        setProdOptions(prodList);
      } else {
        console.warn('No product list returned from API.');
        setProdOptions([]); // prevent map errors
      }

      setProductDialog(true);
      setModalTitle('Product Search');
    } catch (error) {
      console.error('Error fetching products:', error);
      setProdOptions([]); // fail-safe for grid
    }
  };

  const onPaginationChanged = useCallback((params: any) => {
    const currentPage = params.api.paginationGetCurrentPage();
    const pageSize = params.api.paginationGetPageSize();
    setPaginationData({ page: currentPage, rowsPerPage: pageSize });
  }, []);

  // Dialog Handlers
  const handleAdd = () => {
    fetch();
    setOpen(true);
  };
  const handleDialogClose = (p0: boolean) => {
    setProductDialog(false);
    setOpen(false);
  };

  // Unified input handler
  const handleChange = (field: keyof IStnDetailRequest) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const columnDef: ColDef[] = useMemo(
    () => [
      {
        headerName: 'Select',
        field: 'checkbox',
        width: 10,
        cellRenderer: RadioCellRenderer,
        cellStyle: { display: 'flex', justifyContent: 'center' } as any,
        minWidth: 10,
        maxWidth: 30,
        suppressMenu: true,
        sortable: false,
        filter: false
      },
      { headerName: 'Product Code ', field: 'PROD_CODE', width: 100, minWidth: 100, cellStyle: { fontSize: '12px' } },
      { headerName: 'Product Name', field: 'PROD_NAME', width: 200, minWidth: 100, cellStyle: { fontSize: '12px' } },
      { headerName: 'L Uom', field: 'L_UOM', width: 200, minWidth: 100, cellStyle: { fontSize: '12px' } },
      { headerName: 'P Uom', field: 'P_UOM', width: 200, minWidth: 100, cellStyle: { fontSize: '12px' } },
      { headerName: 'UPPP', field: 'UPPP', width: 200, minWidth: 100, cellStyle: { fontSize: '12px' } },
      { headerName: 'Quantity Available', field: 'QTY_AVL', width: 200, minWidth: 100, cellStyle: { fontSize: '12px' } }
    ],
    []
  );

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-start">
        <BlueButton variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAdd}>
          Add
        </BlueButton>
      </div>

      {/* DialogPop with form fields */}
      <DialogPop
        open={open}
        onClose={handleDialogClose}
        title="Add Transfer Details"
        // onSave={handleSave}
        width={1200} // You can pass any width value (number or string)
        //handleSecondaryClick={handleDialogClose}
      >
        <Box>
          <Grid container spacing={1}>
            {/* Product Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Product Details
              </Typography>
              <Divider />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                name="prod_code"
                label="Product Code"
                variant="outlined"
                value={formData.prod_code}
                onChange={handleChange('prod_code')}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton edge="end" onClick={() => handleProduct()}>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            {/* Source Details */}
            {/* Source Details */}
            <Grid item xs={12}>
              <Box className="bg-blue-50 p-4 rounded-md shadow-sm mb-4">
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Source Details
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      options={siteResponse || []}
                      loading={loading}
                      getOptionLabel={(option) => option?.SITE_CODE || ''}
                      isOptionEqualToValue={(option, value) => option?.SITE_CODE === value?.SITE_CODE}
                      value={siteResponse.find((option) => option.SITE_CODE === formData.from_site) || null}
                      onChange={async (_, newValue) => {
                        const selectedSiteCode = newValue?.SITE_CODE || '';
                        setFormData((prev) => ({
                          ...prev,
                          from_site: selectedSiteCode,
                          from_loc_start: '',
                          from_loc_end: ''
                        }));

                        try {
                          setLoading(true);
                          const locationResponse = await WmsSerivceInstance.getddLocationCode();

                          if (locationResponse) {
                            setLocOptions(locationResponse);
                          }
                        } catch (error) {
                          console.error('Error fetching locations:', error);
                          setLocOptions([]);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      renderInput={(params) => <TextField {...params} label="From Site" variant="outlined" fullWidth size="small" />}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      options={locOptions || []}
                      getOptionLabel={(option) => option?.LOCATION_CODE || ''}
                      isOptionEqualToValue={(option, value) => option?.LOCATION_CODE === value?.LOCATION_CODE}
                      value={locOptions.find((option) => option.LOCATION_CODE === formData.from_loc_start) || null}
                      onChange={(_, newValue) => {
                        setFormData((prev) => ({
                          ...prev,
                          from_loc_start: newValue?.LOCATION_CODE || ''
                        }));
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="From Location Start" variant="outlined" fullWidth size="small" />
                      )}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      options={locOptions || []}
                      getOptionLabel={(option) => option?.LOCATION_CODE || ''}
                      isOptionEqualToValue={(option, value) => option?.LOCATION_CODE === value?.LOCATION_CODE}
                      value={locOptions.find((option) => option.LOCATION_CODE === formData.from_loc_end) || null}
                      onChange={(_, newValue) => {
                        setFormData((prev) => ({
                          ...prev,
                          from_loc_end: newValue?.LOCATION_CODE || ''
                        }));
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="From Location End" variant="outlined" fullWidth size="small" />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      options={siteResponse || []}
                      loading={loading}
                      getOptionLabel={(option) => option?.SITE_CODE || ''}
                      isOptionEqualToValue={(option, value) => option?.SITE_CODE === value?.SITE_CODE}
                      value={siteResponse.find((option) => option.SITE_CODE === formData.from_site) || null}
                      onChange={async (_, newValue) => {
                        const selectedSiteCode = newValue?.SITE_CODE || '';
                        setFormData((prev) => ({
                          ...prev,
                          from_site: selectedSiteCode,
                          from_loc_start: '',
                          from_loc_end: ''
                        }));

                        try {
                          setLoading(true);
                          const locationResponse = await WmsSerivceInstance.getddLocationCode();

                          if (locationResponse) {
                            setLocOptions(locationResponse);
                          }
                        } catch (error) {
                          console.error('Error fetching locations:', error);
                          setLocOptions([]);
                        } finally {
                          setLoading(false);
                        }
                      }}
                      renderInput={(params) => <TextField {...params} label="To Site" variant="outlined" fullWidth size="small" />}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      options={Array.isArray(locOptions) ? locOptions : []}
                      loading={loading}
                      getOptionLabel={(option) => option?.LOCATION_CODE || ''}
                      isOptionEqualToValue={(option, value) => option?.LOCATION_CODE === value?.LOCATION_CODE}
                      value={locOptions.find((option) => option.LOCATION_CODE === formData.loc_code_from) || null}
                      onChange={(_, newValue) => {
                        setFormData((prev) => ({
                          ...prev,
                          from_loc_start: newValue?.LOCATION_CODE || ''
                        }));
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="From Location Start" variant="outlined" fullWidth size="small" />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Autocomplete
                      options={Array.isArray(locOptions) ? locOptions : []}
                      loading={loading}
                      getOptionLabel={(option) => option?.LOCATION_CODE || ''}
                      isOptionEqualToValue={(option, value) => option?.LOCATION_CODE === value?.LOCATION_CODE}
                      value={locOptions.find((option) => option.LOCATION_CODE === formData.loc_code_from) || null}
                      onChange={(_, newValue) => {
                        setFormData((prev) => ({
                          ...prev,
                          from_loc_start: newValue?.LOCATION_CODE || ''
                        }));
                      }}
                      renderInput={(params) => (
                        <TextField {...params} label="From Location End" variant="outlined" fullWidth size="small" />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Quantity and UOM */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Quantity & UOM
              </Typography>
              <Divider />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField label="UOM" value={formData.l_uom} onChange={handleChange('l_uom')} fullWidth size="small" />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Quantity 1"
                value={formData.qty_puom}
                onChange={(e) => {
                  const qtyValue = Number(e.target.value);
                  handleChange('qty_puom')(e);

                  setFormData((prev) => ({
                    ...prev,
                    quantity: calculateQuantity({
                      ...prev,
                      qty_puom: qtyValue
                    })
                  }));
                }}
                fullWidth
                size="small"
                type="number"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField label="UOM" value={formData.l_uom} onChange={handleChange('l_uom')} fullWidth size="small" />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Quantity 2"
                value={formData.qty_luom}
                onChange={handleChange('qty_luom')}
                fullWidth
                size="small"
                type="number"
              />
            </Grid>

            {/* Lot/Batch Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Lot & Batch Details
              </Typography>
              <Divider />
            </Grid>

            <Grid item xs={12} sm={3}>
              <Autocomplete
                options={Array.isArray(LotNum) ? LotNum : []}
                loading={loading}
                getOptionLabel={(option) => option?.LOT_NO || ''}
                isOptionEqualToValue={(option, value) => option?.LOT_NO === value?.LOT_NO}
                value={(Array.isArray(LotNum) && LotNum.find((option) => option.LOT_NO === formData.lot_no)) || null}
                onChange={(_, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    lot_no: newValue?.LOT_NO || ''
                  }));
                }}
                renderInput={(params) => <TextField {...params} label="Lot No From" variant="outlined" fullWidth size="small" />}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <Autocomplete
                options={Array.isArray(LotNum) ? LotNum : []}
                loading={loading}
                getOptionLabel={(option) => option?.LOT_NO || ''}
                isOptionEqualToValue={(option, value) => option?.LOT_NO === value?.LOT_NO}
                value={(Array.isArray(LotNum) && LotNum.find((option) => option.LOT_NO === formData.lot_no)) || null}
                onChange={(_, newValue) => {
                  setFormData((prev) => ({
                    ...prev,
                    lot_no: newValue?.LOT_NO || ''
                  }));
                }}
                renderInput={(params) => <TextField {...params} label="Lot No To" variant="outlined" fullWidth size="small" />}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Batch No From"
                value={formData.batch_no_from}
                onChange={handleChange('batch_no_from')}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField label="Batch No To" value={formData.batch_no_to} onChange={handleChange('batch_no_to')} fullWidth size="small" />
            </Grid>

            {/* Date & Doc Info */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Date & Documentation
              </Typography>
              <Divider />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Expiry Date From"
                value={formData.exp_date}
                onChange={handleChange('exp_date')}
                fullWidth
                size="small"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Expiry Date To"
                value={formData.exp_date_to}
                onChange={handleChange('exp_date_to')}
                fullWidth
                size="small"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Manufacture Date"
                value={formData.mfg_date}
                onChange={handleChange('mfg_date')}
                fullWidth
                size="small"
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                label="Container No"
                value={formData.container_no}
                onChange={handleChange('container_no')}
                fullWidth
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField label="Doc. Ref." value={formData.doc_ref} onChange={handleChange('doc_ref')} fullWidth size="small" />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField label="Job No" value={formData.job_no} onChange={handleChange('job_no')} fullWidth size="small" />
            </Grid>
          </Grid>
          <Grid>
            <Box className="flex justify-end mt-4">
              <BlueButton variant="contained" color="primary" onClick={() => setOpen(false)}>
                Save
              </BlueButton>
            </Box>
          </Grid>
        </Box>
      </DialogPop>

      {/* Product Dialog */}
      <DialogPop open={productDialog} onClose={handleDialogClose} title={modalTitle} width={1000}>
        <CustomAgGrid
          rowSelection="single"
          rowData={prodOptions}
          columnDefs={columnDef}
          paginationPageSize={1000}
          pagination={true}
          paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
          rowHeight={30}
          onSelectionChanged={(params) => {
            const selectedNode = params.api.getSelectedNodes()[0];
            if (selectedNode) {
              setSelectedProduct(selectedNode.data);
            }
          }}
        />
        <BlueButton
          onClick={() => {
            if (selectedProduct) {
              setFormData((prev) => ({
                ...prev,
                prod_code: selectedProduct.prod_code,
                prod_name: selectedProduct.prod_name,
                p_uom: selectedProduct.p_uom ?? '',
                l_uom: selectedProduct.l_uom ?? ''
              }));
            }
            setProductDialog(false);
          }}
        >
          OK
        </BlueButton>
      </DialogPop>

      {/* AG Grid */}
      <CustomAgGrid
        rowData={rowData}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        pagination
        height="500px"
      />
    </div>
  );
};

export default TransferDetailsTab2;
