import { Button, Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { ColDef } from 'ag-grid-community';
import TransferForm from '../StockTransferForms/TransferForm';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import CustomAgGrid from 'components/grid/CustomAgGrid';
import { useQuery } from '@tanstack/react-query';
import StocktransferServiceInstance from 'service/wms/transaction/stocktransfer/service.stocktransferwms';
import useAuth from 'hooks/useAuth';
import { useSelector } from 'store';
import { useLocation } from 'react-router-dom';
import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';
import { DialogPop } from 'components/popup/DIalogPop';

const TransferMainPage = () => {
  const [globalFilter, setGlobalFilter] = useState<string>('');

  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const { permissions, user_permission } = useAuth();
  const [, setGridApi] = useState<any>(null);
  const [transferFormDialog, setTransferFormDialog] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: 'md'
    },
    title: 'Stock Transfer',
    data: {}
  });
  const location = useLocation();
  const pathNameList = location.pathname.split('/').filter(Boolean);
  const stn_no = '1'; // replace dynamically
  const company_code = 'BSG'; // replace dynamically
  const prin_code = '10001'; // replace dynamically

  const { data: STNDetails = { data: [] } } = useQuery({
    queryKey: ['stn_data', stn_no, company_code, prin_code],
    queryFn: () => StocktransferServiceInstance.getTSSTNWithDetails(stn_no, company_code, prin_code),
    enabled:
      !!stn_no &&
      !!company_code &&
      !!prin_code &&
      !!user_permission &&
      Object.keys(user_permission)?.includes(
        permissions?.[app.toUpperCase()]?.children[pathNameList?.[3]?.toUpperCase()]?.serial_number?.toString()
      )
  });


  const onGridReady = (params: any) => {
    setGridApi(params.api);
    params.api.sizeColumnsToFit();
    console.log('Grid Data:', STNDetails?.data ?? '');
  };

  useEffect(() => {
    if (STNDetails) {
      console.log('Fetched STN details:', STNDetails);
    }
  }, [STNDetails]);

  const handleOpenTransferForm = () => {
    setTransferFormDialog((prev) => ({
      ...prev,
      action: { ...prev.action, open: true },
      data: {}, // No data for add
      title: 'Stock Transfer'
    }));
  };

  const handleCloseTransferForm = () => {
    setTransferFormDialog((prev) => ({
      ...prev,
      action: { ...prev.action, open: false }
    }));
  };

  const handleGlobalFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setGlobalFilter(value);
  };

  const handleActions = (action: string, rowData: any) => {
    if (action === 'edit') {
      setTransferFormDialog((prev) => ({
        ...prev,
        action: { ...prev.action, open: true },
        data: rowData, // Pass selected row data to dialog
        title: 'Edit Stock Transfer'
      }));
    }
    // handle other actions if needed
  };

  const onFilterChanged = useCallback(() => { }, []);

  const onPaginationChanged = useCallback(() => { }, []);

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: 'Sr. No',
        field: 'checkbox',
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 50,
        pinned: 'left',
        sortable: false,
        filter: false
      },
      { field: 'PRIN_CODE', headerName: 'Principal', sortable: true, filter: true },
      { field: 'STN_NO', headerName: 'Transfer No' }, // FIXED
      { field: 'USER_DT', headerName: 'Date' },
      { field: 'DESCRIPTION', headerName: 'Description' },
      { field: 'COUNT_NO', headerName: 'Count No' },
      {
        headerName: 'Actions',
        cellRenderer: (params: { data: any }) => {
          const actionButtons: TAvailableActionButtons[] = ['edit'];
          // Pass both action and row data to handler
          return <ActionButtonsGroup handleActions={(action) => handleActions(action, params.data)} buttons={actionButtons} />;
        }
      }
    ],
    []
  );

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-end space-x-2">
        <Box sx={{ flexGrow: 1 }}>
          <TextField
            value={globalFilter}
            onChange={handleGlobalFilterChange}
            fullWidth
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
        </Box>

        <Button color="customBlue" variant="contained" onClick={handleOpenTransferForm}>
          Stock Transfer
        </Button>
      </div>

      <CustomAgGrid
        rowData={Array.isArray(STNDetails) ? STNDetails : []}
        columnDefs={columnDefs}
        onGridReady={onGridReady}
        onFilterChanged={onFilterChanged}
        onPaginationChanged={onPaginationChanged}
        paginationPageSize={2000}
        paginationPageSizeSelector={[10, 50, 100, 500, 2000]}
        pagination={true}
        height="500px"
      />

      <DialogPop
        open={transferFormDialog.action.open}
        onClose={handleCloseTransferForm}
        title={"Stock Transfer"}
        width={2000} // You can pass any width value (number or string)
      >

        <TransferForm onClose={handleCloseTransferForm} data={transferFormDialog.data} />
      </DialogPop>
    </div>
  );
};

export default TransferMainPage;
