import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, TextField, CircularProgress, InputAdornment, IconButton, Radio } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import StocktransferServiceInstance from '../../../service/wms/transaction/stocktransfer/service.stocktransferwms';
import { TPrincipalWms } from 'pages/WMS/types/principal-wms.types';
import { useQuery } from '@tanstack/react-query';
import WmsSerivceInstance from 'service/service.wms';
import { SearchIcon } from 'lucide-react';
import { DialogPop } from 'components/popup/DIalogPop';
import MyAgGrid from 'components/grid/MyAgGrid';
import { ColDef } from 'ag-grid-community';
import BlueButton from 'components/buttons/BlueButton';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';

interface StnDetailRecord {
  PROD_CODE: string;
  PROD_NAME: string;
  FROM_SITE: string;
  FROM_LOC_START: string;
  FROM_LOC_END: string;
  TO_SITE: string;
  TO_LOC_START: string;
  TO_LOC_END: string;
  JOB_NO: string;
  LOT_NO_FROM: string;
  LOT_NO_TO: string;
  BATCH_NO_FROM: string;
  BATCH_NO_TO: string;
  EXP_DATE_FROM: string;
  EXP_DATE_TO: string;
  MFG_DATE: string;
  QUANTITY: number;
  P_UOM?: string;
  L_UOM?: string;
  QTY_AVL?: number;
  [key: string]: any;
}

interface StnRecord {
  STN_NO: string;
  CONFIRMED: string;
  ALLOCATED: string;
  [key: string]: any;
}

const TransferRequestTab1: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openProduct, setOpenProduct] = useState(false);
  const [openSTN, setOpenSTN] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [selectedSTN, setSelectedSTN] = useState<any | null>(null);
  const [stnDetailRecords, setStnDetailRecords] = useState<StnDetailRecord[]>([]);
  const [editStn, setEditStn] = useState<any>();
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);

  const [newFormData, setNewFormData] = useState<any>({
    prin_code: '',
    transferNumber: '',
    transferDate: '',
    count_no: '',
    description: '',
    stnDetails: []
  });

  console.log('Edit STN Data:', editStn);

  const newHandleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewFormData((prev: any) => ({ ...prev, [name]: value }));
  }, []);

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
    },
    staleTime: 5 * 60 * 1000
  });

  const { data: stnNumber, refetch: refetchStnNumber } = useQuery({
    queryKey: ['stnNumber', newFormData.prin_code],
    queryFn: async () => {
      if (!newFormData.prin_code) {
        return { tableData: [], count: 0 };
      }

      const sql = `SELECT * FROM TS_STN WHERE PRIN_CODE = '${newFormData.prin_code}'`;
      const response = await WmsSerivceInstance.executeRawSql(sql);
      return response
        ? {
          tableData: response as StnRecord[],
          count: response.length
        }
        : { tableData: [], count: 0 };
    },
    enabled: false,
    staleTime: 2 * 60 * 1000
  });

  const { data: stnDetail, refetch: refetchStnDetail } = useQuery({
    queryKey: ['stnDetail', newFormData.prin_code, newFormData.transferNumber],
    queryFn: async () => {
      if (!newFormData.prin_code || !newFormData.transferNumber) {
        return { tableData: [], count: 0 };
      }

      const STN_DETAIL_SQL = `SELECT * FROM TS_STNDETAIL WHERE PRIN_CODE = '${newFormData.prin_code}' AND STN_NO = '${newFormData.transferNumber}'`;
      const response = await WmsSerivceInstance.executeRawSql(STN_DETAIL_SQL);
      return response
        ? {
          tableData: response as StnDetailRecord[],
          count: response.length
        }
        : { tableData: [], count: 0 };
    },
    enabled: false,
    staleTime: 2 * 60 * 1000
  });

  const { data: product, refetch: refetchProduct } = useQuery({
    queryKey: ['product', newFormData.prin_code],
    queryFn: async () => {
      if (!newFormData.prin_code) {
        return { tableData: [], count: 0 };
      }

      const PRODUCT_SQL = `SELECT * FROM TT_STKLED WHERE PRIN_CODE = '${newFormData.prin_code}' AND COMPANY_CODE = 'BSG'`;
      const response = await WmsSerivceInstance.executeRawSql(PRODUCT_SQL);
      return response
        ? {
          tableData: response as any[],
          count: response.length
        }
        : { tableData: [], count: 0 };
    },
    enabled: false,
    staleTime: 2 * 60 * 1000
  });

  const fetchData = useCallback(async () => {
    try {
      if (newFormData.prin_code) {
        await refetchStnNumber();
        await refetchProduct();
      }

      if (newFormData.prin_code && newFormData.transferNumber) {
        await refetchStnDetail();
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, [newFormData.prin_code, newFormData.transferNumber, refetchStnNumber, refetchStnDetail, refetchProduct]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSTNDialogClose = useCallback(() => {
    setOpenSTN(false);
    fetchData();
  }, [fetchData]);

  const handleEditDialogClose = useCallback(() => {
    setOpenEdit(false);
    setEditingRowIndex(null);
  }, []);

  const handleProductDialogClose = useCallback(() => {
    setOpenProduct(false);
    fetchData();
  }, [fetchData]);

  // Update stnDetailRecords when stnDetail data changes
  useEffect(() => {
    if (stnDetail?.tableData) {
      setStnDetailRecords(stnDetail.tableData);
    }
  }, [stnDetail]);

  // Handle product selection and add to main table
  const handleProductSelection = useCallback(() => {
    if (selectedProduct) {
      // Create a new record for the main table
      const newRecord: StnDetailRecord = {
        id: Date.now() + Math.random(),
        PROD_CODE: selectedProduct.PROD_CODE,
        PROD_NAME: selectedProduct.PROD_NAME || '',
        FROM_SITE: selectedProduct.SITE_CODE || '',
        FROM_LOC_START: selectedProduct.LOCATION_CODE || '',
        FROM_LOC_END: selectedProduct.LOCATION_CODE || '',
        TO_SITE: '',
        TO_LOC_START: '',
        TO_LOC_END: '',
        JOB_NO: selectedProduct.JOB_NO || '',
        LOT_NO_FROM: '',
        LOT_NO_TO: '',
        BATCH_NO_FROM: '',
        BATCH_NO_TO: '',
        EXP_DATE_FROM: '',
        EXP_DATE_TO: '',
        MFG_DATE: '',
        QUANTITY: selectedProduct.QTY_AVL || 0,
        P_UOM: selectedProduct.P_UOM,
        L_UOM: selectedProduct.L_UOM,
        QTY_AVL: selectedProduct.QTY_AVL
      };

      // Add the new record to the main table
      setStnDetailRecords((prev) => [...prev, newRecord]);

      // Also update the form data
      setNewFormData((prev: any) => ({
        ...prev,
        PROD_CODE: selectedProduct.PROD_CODE,
        stnDetails: [...(prev.stnDetails || []), newRecord]
      }));

      setSelectedProduct(null);
    }
    setOpenProduct(false);
  }, [selectedProduct]);

  // Handle STN selection
  const handleStnSelection = useCallback(() => {
    if (selectedSTN) {
      setNewFormData((prev: any) => ({
        ...prev,
        transferNumber: selectedSTN
      }));
      setSelectedSTN(null);
    }
    setOpenSTN(false);
  }, [selectedSTN]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Prepare the data with all stnDetailRecords
      const submitData = {
        ...newFormData,
        stnDetails: stnDetailRecords
      };

      await StocktransferServiceInstance.createOrUpdateTSSTNSequential(submitData as any);
      // Optionally reset form or show success message
    } catch (err) {
      console.error('Error submitting transfer request:', err);
    } finally {
      setLoading(false);
    }
  };

  const RadioCellRenderer = useCallback((params: any) => {
    const isSelected = params.node.isSelected();

    const handleRadioChange = () => {
      params.api.forEachNode((node: any) => {
        node.setSelected(false);
      });
      params.node.setSelected(true);
      params.api.refreshCells({ force: true });
    };

    return (
      <Radio
        checked={isSelected}
        onChange={handleRadioChange}
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
  }, []);

  const handleEditTransfer = (existingData: any, rowIndex: number) => {
    setOpenEdit(true);
    setEditStn({ ...existingData }); // Create a copy to avoid reference issues
    setEditingRowIndex(rowIndex);
  };

  const handleActions = (actionType: string, rowOriginal: any, rowIndex: number) => {
  console.log('Action params:', { actionType, rowOriginal, rowIndex }); // Debug log
  
  if (actionType === 'edit') {
    // Use the actual index from the current data array
    const actualIndex = stnDetailRecords.findIndex(record => record.id === rowOriginal.id);
    console.log('Found index:', actualIndex); // Debug log
    setEditingRowIndex(actualIndex);
    handleEditTransfer(rowOriginal, actualIndex);
  } else if (actionType === 'delete') {
    setStnDetailRecords((prevRecords) => prevRecords.filter((record) => record.id !== rowOriginal.id));
  }
};

  const stnDetailsColumn = useMemo<ColDef[]>(
    () => [
      {
        colId: 'actions',
        headerName: 'Actions',
        width: 120,
        cellRenderer: (params: any) => {
          const actionButtons: TAvailableActionButtons[] = ['edit', 'delete'];

          return React.createElement(ActionButtonsGroup, {
            handleActions: (action) => handleActions(action, params.data, params.rowIndex),
            buttons: actionButtons
          });
        }
      },
      {
        field: 'PROD_CODE',
        headerName: 'Product',
        width: 200,
        sortable: true,
        filter: true,
        cellStyle: {
          textAlign: 'center',
          fontSize: '12px'
        } as any,
        headerClass: 'header-center'
      },
      {
        headerName: 'Transfer From',
        width: 250,
        cellStyle: {
          textAlign: 'center',
          fontSize: '12px',
          backgroundColor: '#e3f2fd'
        } as any,
        headerClass: 'header-center bg-blue-100',
        children: [
          {
            field: 'FROM_SITE',
            headerName: 'From Site',
            width: 150,
            cellStyle: { textAlign: 'center', fontSize: '12px' } as any,
            headerClass: 'header-center bg-blue-100'
          },
          {
            headerName: 'Location',
            width: 150,
            headerClass: 'header-center bg-blue-100',
            children: [
              {
                field: 'FROM_LOC_START',
                headerName: 'Start',
                width: 150,
                cellStyle: { textAlign: 'center', fontSize: '12px' } as any,
                headerClass: 'header-center bg-blue-100'
              },
              {
                field: 'FROM_LOC_END',
                headerName: 'End',
                width: 150,
                cellStyle: { textAlign: 'center', fontSize: '12px' } as any,
                headerClass: 'header-center bg-blue-100'
              }
            ]
          }
        ]
      },
      {
        headerName: 'Transfer To',
        width: 150,
        cellStyle: {
          textAlign: 'center',
          fontSize: '12px'
        } as any,
        headerClass: 'header-center',
        children: [
          {
            field: 'TO_SITE',
            headerName: 'To Site',
            width: 150,
            cellStyle: { textAlign: 'center', fontSize: '12px' } as any
          },
          {
            headerName: 'Location',
            width: 150,
            headerClass: 'header-center',
            children: [
              {
                field: 'TO_LOC_START',
                headerName: 'Start',
                width: 150,
                cellStyle: { textAlign: 'center', fontSize: '12px' } as any
              },
              {
                field: 'TO_LOC_END',
                headerName: 'End',
                width: 150,
                cellStyle: { textAlign: 'center', fontSize: '12px' } as any
              }
            ]
          }
        ]
      },
      {
        field: 'JOB_NO',
        headerName: 'Job No',
        width: 150,
        cellStyle: { textAlign: 'center', fontSize: '12px' } as any,
        headerClass: 'header-center'
      },
      {
        headerName: 'Lot Number',
        width: 150,
        cellStyle: {
          textAlign: 'center',
          fontSize: '12px'
        } as any,
        headerClass: 'header-center',
        children: [
          {
            field: 'LOT_NO_FROM',
            headerName: 'From',
            width: 150,
            cellStyle: { textAlign: 'center', fontSize: '12px' } as any
          },
          {
            field: 'LOT_NO_TO',
            headerName: 'To',
            width: 150,
            cellStyle: { textAlign: 'center', fontSize: '12px' } as any
          }
        ]
      },
      {
        headerName: 'Batch Number',
        width: 150,
        cellStyle: {
          textAlign: 'center',
          fontSize: '12px'
        } as any,
        headerClass: 'header-center',
        children: [
          {
            field: 'BATCH_NO_FROM',
            headerName: 'From',
            width: 150,
            cellStyle: { textAlign: 'center', fontSize: '12px' } as any
          },
          {
            field: 'BATCH_NO_TO',
            headerName: 'To',
            width: 150,
            cellStyle: { textAlign: 'center', fontSize: '12px' } as any
          }
        ]
      },
      {
        headerName: 'Expiry Date',
        width: 150,
        cellStyle: {
          textAlign: 'center',
          fontSize: '12px'
        } as any,
        headerClass: 'header-center',
        children: [
          {
            field: 'EXP_DATE_FROM',
            headerName: 'From',
            width: 150,
            cellStyle: { textAlign: 'center', fontSize: '12px' } as any
          },
          {
            field: 'EXP_DATE_TO',
            headerName: 'To',
            width: 150,
            cellStyle: { textAlign: 'center', fontSize: '12px' } as any
          }
        ]
      },
      {
        field: 'MFG_DATE',
        headerName: 'Manufacture Date',
        width: 150,
        cellStyle: { textAlign: 'center', fontSize: '12px' } as any,
        headerClass: 'header-center'
      },
      {
        field: 'QUANTITY',
        headerName: 'Quantity',
        width: 150,
        cellStyle: { textAlign: 'center', fontSize: '12px' } as any,
        headerClass: 'header-center'
      }
    ],
    []
  );

  const mycolumnDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: 'Select',
        field: 'checkbox',
        width: 40,
        cellRenderer: RadioCellRenderer,
        cellStyle: { display: 'flex', justifyContent: 'center' } as any,
        minWidth: 30,
        maxWidth: 40,
        suppressMenu: true,
        sortable: false,
        filter: false
      },
      { headerName: 'Transfer Number', field: 'STN_NO', cellStyle: { fontSize: '12px' } },
      { headerName: 'Confirmed', field: 'CONFIRMED', cellStyle: { fontSize: '12px' } },
      { headerName: 'Allocated', field: 'ALLOCATED', cellStyle: { fontSize: '12px' } }
    ],
    [RadioCellRenderer]
  );

  const productColDefs: ColDef[] = useMemo(
    () => [
      {
        headerName: 'Select',
        field: 'checkbox',
        width: 120,
        cellRenderer: RadioCellRenderer,
        cellStyle: { display: 'flex', justifyContent: 'center' } as any,
        minWidth: 120,
        maxWidth: 120,
        suppressMenu: true,
        sortable: false,
        filter: false
      },
      { headerName: 'Product Code', field: 'PROD_CODE', cellStyle: { fontSize: '12px' } },
      { headerName: 'Site', field: 'SITE_CODE', cellStyle: { fontSize: '12px' } },
      { headerName: 'Location', field: 'LOCATION_CODE', cellStyle: { fontSize: '12px' } },
      { headerName: 'Primary UOM', field: 'P_UOM', cellStyle: { fontSize: '12px' } },
      { headerName: 'Lowest UOM', field: 'L_UOM', cellStyle: { fontSize: '12px' } },
      { headerName: 'Quantity', field: 'QTY_AVL', cellStyle: { fontSize: '12px', textAlign: 'right' } as any }
    ],
    [RadioCellRenderer]
  );

  // Reset all data when principal changes
  useEffect(() => {
    if (newFormData.prin_code) {
      // Reset table data and form fields
      setStnDetailRecords([]);
      setNewFormData((prev: any) => ({
        ...prev,
        transferNumber: '',
        PROD_CODE: '',
        stnDetails: []
      }));

      // Also reset selection states
      setSelectedProduct(null);
      setSelectedSTN(null);
    }
  }, [newFormData.prin_code]);

  return (
    <>
      <div className="flex gap-2 mb-2 mt-4">
        <Autocomplete
          id="prin_code"
          value={
            !!newFormData.prin_code
              ? prinList?.tableData.find((eachBrand) => eachBrand.prin_code === newFormData.prin_code)
              : ({ prin_name: '' } as TPrincipalWms)
          }
          onChange={(event, value: TPrincipalWms | null) => {
            newHandleChange({
              target: {
                name: 'prin_code',
                value: value?.prin_code || ''
              }
            } as React.ChangeEvent<HTMLInputElement>);
          }}
          size="small"
          options={prinList?.tableData ?? []}
          fullWidth
          autoHighlight
          getOptionLabel={(option) => option?.prin_name || ''}
          renderInput={(params) => <TextField {...params} label="Principal" />}
        />

        <TextField
          fullWidth
          size="small"
          name="transferNumber"
          label="Transfer Number"
          variant="outlined"
          value={newFormData.transferNumber}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end" onClick={() => setOpenSTN(true)} disabled={!newFormData.prin_code}>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <TextField
          fullWidth
          size="small"
          name="productCode"
          label="Product"
          variant="outlined"
          value={newFormData.PROD_CODE}
          InputLabelProps={{
            shrink: true // This fixes the overlapping issue
          }}
          inputProps={{
            readOnly: true
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton edge="end" onClick={() => setOpenProduct(true)} disabled={!newFormData.prin_code} size="small">
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            )
          }}
          required
        />

        <TextField
          label="Transfer Date"
          name="transferDate"
          type="date"
          size="small"
          value={newFormData.transferDate || ''}
          onChange={newHandleChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        <TextField label="Count No" name="count_no" value={newFormData.count_no || ''} size="small" onChange={newHandleChange} fullWidth />

        <TextField
          label="Description"
          name="description"
          value={newFormData.description || ''}
          onChange={newHandleChange}
          multiline
          rows={1}
          fullWidth
          size="small"
        />
      </div>

      <MyAgGrid
        rowSelection="single"
        rowData={stnDetailRecords || []}
        columnDefs={stnDetailsColumn}
        paginationPageSize={1000}
        pagination={true}
        paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
        height="40vw"
        rowHeight={25}
        headerHeight={30}
      />

      <Button variant="contained" color="primary" onClick={handleSubmit} disabled={loading}>
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit'}
      </Button>

      <DialogPop open={openSTN} onClose={handleSTNDialogClose} title={'Transfer Number'} width={'60vw'}>
        <MyAgGrid
          rowSelection="single"
          rowData={stnNumber?.tableData || []}
          columnDefs={mycolumnDefs}
          paginationPageSize={1000}
          pagination={true}
          paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
          height="480px"
          rowHeight={25}
          headerHeight={30}
          onSelectionChanged={(params) => {
            const selectedNode = params.api.getSelectedNodes()[0];
            if (selectedNode) {
              setSelectedSTN(selectedNode.data.STN_NO);
            }
          }}
        />
        <div className="flex justify-end mt-4">
          <BlueButton onClick={handleStnSelection} disabled={!selectedSTN}>
            OK
          </BlueButton>
        </div>
      </DialogPop>

      <DialogPop open={openProduct} onClose={handleProductDialogClose} title={'Product Selection'} width={'60vw'}>
        <MyAgGrid
          rowSelection="single"
          rowData={product?.tableData || []}
          columnDefs={productColDefs}
          paginationPageSize={1000}
          pagination={true}
          paginationPageSizeSelector={[10, 50, 100, 500, 1000]}
          height="480px"
          rowHeight={25}
          headerHeight={30}
          onSelectionChanged={(params) => {
            const selectedNode = params.api.getSelectedNodes()[0];
            if (selectedNode) {
              setSelectedProduct(selectedNode.data);
            }
          }}
        />
        <div className="flex justify-end mt-4">
          <BlueButton onClick={handleProductSelection} disabled={!selectedProduct}>
            Select
          </BlueButton>
        </div>
      </DialogPop>

      {/* Edit Entry Dialog */}
      {/* Edit Entry Dialog */}
      <DialogPop open={openEdit} onClose={handleEditDialogClose} title={'Transfer Entry'} width={'60vw'}>
        <div className="max-h-[70vh] overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Product Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Product Information</h3>

              <TextField
                label="Product Code"
                name="PROD_CODE"
                value={editStn?.PROD_CODE || ''}
                size="small"
                fullWidth
                InputProps={{ readOnly: true }}
                className="bg-gray-50"
              />

              <TextField
                label="Product Name"
                name="PROD_NAME"
                value={editStn?.PROD_NAME || ''}
                size="small"
                fullWidth
                onChange={(e) => {
                  setEditStn((prev: any) => ({ ...prev, PROD_NAME: e.target.value }));
                }}
              />

              <TextField
                label="Job No"
                name="JOB_NO"
                value={editStn?.JOB_NO || ''}
                size="small"
                fullWidth
                onChange={(e) => {
                  setEditStn((prev: any) => ({ ...prev, JOB_NO: e.target.value }));
                }}
              />

              <div className="grid grid-cols-2 gap-2">
                <TextField
                  label="Primary UOM"
                  name="P_UOM"
                  value={editStn?.P_UOM || ''}
                  size="small"
                  InputProps={{ readOnly: true }}
                  className="bg-gray-50"
                />
                <TextField
                  label="Lowest UOM"
                  name="L_UOM"
                  value={editStn?.L_UOM || ''}
                  size="small"
                  InputProps={{ readOnly: true }}
                  className="bg-gray-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <TextField
                  label="Available Qty"
                  name="QTY_AVL"
                  type="number"
                  value={editStn?.QTY_AVL || ''}
                  size="small"
                  InputProps={{ readOnly: true }}
                  className="bg-gray-50"
                />
                <TextField
                  label="Transfer Quantity"
                  name="QUANTITY"
                  type="number"
                  value={editStn?.QUANTITY || ''}
                  size="small"
                  onChange={(e) => {
                    setEditStn((prev: any) => ({ ...prev, QUANTITY: Number(e.target.value) }));
                  }}
                />
              </div>
            </div>

            {/* Transfer From */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Transfer From</h3>

              <TextField
                label="From Site"
                name="FROM_SITE"
                value={editStn?.FROM_SITE || ''}
                size="small"
                fullWidth
                onChange={(e) => {
                  setEditStn((prev: any) => ({ ...prev, FROM_SITE: e.target.value }));
                }}
              />

              <TextField
                label="Location Start"
                name="FROM_LOC_START"
                value={editStn?.FROM_LOC_START || ''}
                size="small"
                fullWidth
                onChange={(e) => {
                  setEditStn((prev: any) => ({ ...prev, FROM_LOC_START: e.target.value }));
                }}
              />

              <TextField
                label="Location End"
                name="FROM_LOC_END"
                value={editStn?.FROM_LOC_END || ''}
                size="small"
                fullWidth
                onChange={(e) => {
                  setEditStn((prev: any) => ({ ...prev, FROM_LOC_END: e.target.value }));
                }}
              />
            </div>

            {/* Transfer To */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Transfer To</h3>

              <TextField
                label="To Site"
                name="TO_SITE"
                value={editStn?.TO_SITE || ''}
                size="small"
                fullWidth
                onChange={(e) => {
                  setEditStn((prev: any) => ({ ...prev, TO_SITE: e.target.value }));
                }}
              />

              <TextField
                label="Location Start"
                name="TO_LOC_START"
                value={editStn?.TO_LOC_START || ''}
                size="small"
                fullWidth
                onChange={(e) => {
                  setEditStn((prev: any) => ({ ...prev, TO_LOC_START: e.target.value }));
                }}
              />

              <TextField
                label="Location End"
                name="TO_LOC_END"
                value={editStn?.TO_LOC_END || ''}
                size="small"
                fullWidth
                onChange={(e) => {
                  setEditStn((prev: any) => ({ ...prev, TO_LOC_END: e.target.value }));
                }}
              />
            </div>

            {/* Lot Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Lot Information</h3>

              <TextField
                label="Lot From"
                name="LOT_NO_FROM"
                value={editStn?.LOT_NO_FROM || ''}
                size="small"
                fullWidth
                onChange={(e) => {
                  setEditStn((prev: any) => ({ ...prev, LOT_NO_FROM: e.target.value }));
                }}
              />

              <TextField
                label="Lot To"
                name="LOT_NO_TO"
                value={editStn?.LOT_NO_TO || ''}
                size="small"
                fullWidth
                onChange={(e) => {
                  setEditStn((prev: any) => ({ ...prev, LOT_NO_TO: e.target.value }));
                }}
              />
            </div>

            {/* Batch Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Batch Information</h3>

              <TextField
                label="Batch From"
                name="BATCH_NO_FROM"
                value={editStn?.BATCH_NO_FROM || ''}
                size="small"
                fullWidth
                onChange={(e) => {
                  setEditStn((prev: any) => ({ ...prev, BATCH_NO_FROM: e.target.value }));
                }}
              />

              <TextField
                label="Batch To"
                name="BATCH_NO_TO"
                value={editStn?.BATCH_NO_TO || ''}
                size="small"
                fullWidth
                onChange={(e) => {
                  setEditStn((prev: any) => ({ ...prev, BATCH_NO_TO: e.target.value }));
                }}
              />
            </div>

            {/* Date Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">Date Information</h3>

              <TextField
                label="Expiry Date From"
                name="EXP_DATE_FROM"
                type="date"
                value={editStn?.EXP_DATE_FROM || ''}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                onChange={(e) => {
                  setEditStn((prev: any) => ({ ...prev, EXP_DATE_FROM: e.target.value }));
                }}
              />

              <TextField
                label="Expiry Date To"
                name="EXP_DATE_TO"
                type="date"
                value={editStn?.EXP_DATE_TO || ''}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                onChange={(e) => {
                  setEditStn((prev: any) => ({ ...prev, EXP_DATE_TO: e.target.value }));
                }}
              />

              <TextField
                label="Manufacture Date"
                name="MFG_DATE"
                type="date"
                value={editStn?.MFG_DATE || ''}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                onChange={(e) => {
                  setEditStn((prev: any) => ({ ...prev, MFG_DATE: e.target.value }));
                }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <Button variant="outlined" onClick={handleEditDialogClose} className="px-6">
              Cancel
            </Button>
            <BlueButton
              onClick={() => {
                if (editingRowIndex !== null && editStn) {
                  setStnDetailRecords((prev) => {
                    const updatedRecords = [...prev];
                    updatedRecords[editingRowIndex] = {
                      ...updatedRecords[editingRowIndex], // Keep existing properties
                      ...editStn, // Apply all edits
                    };
                    return updatedRecords;
                  });



                  // Also update form data if needed
                  setNewFormData((prev: any) => ({
                    ...prev,
                    stnDetails: prev.stnDetails?.map((record: any, index: number) =>
                      index === editingRowIndex ? { ...record, ...editStn } : record
                    ) || []
                  }));
                }
                // Inside the update button onClick, add:
                console.log('Editing row index:', editingRowIndex);
                console.log('Edit STN data:', editStn);
                console.log('Current stnDetailRecords:', stnDetailRecords);
                handleEditDialogClose();
              }}
              className="px-6"
            >
              Update
            </BlueButton>
          </div>
        </div>
      </DialogPop>
    </>
  );
};

export default TransferRequestTab1;
