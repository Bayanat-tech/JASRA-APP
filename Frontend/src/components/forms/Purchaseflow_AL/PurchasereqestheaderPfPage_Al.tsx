/* eslint-disable react/jsx-pascal-case */
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Checkbox } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { ColumnDef, RowSelectionState, SortingState } from '@tanstack/react-table';
import { ISearch } from 'components/filters/SearchFilter';
import UniversalDialog from 'components/popup/UniversalDialog';
import CustomDataTable, { rowsPerPageOptions } from 'components/tables/CustomDataTables';
import useAuth from 'hooks/useAuth';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router';
import PfServiceInstance_Al from '../../../service/service.purchaseflow_Al';

import { useSelector } from 'store';
import { TUniversalDialogProps } from 'types/types.UniversalDialog';
import { getPathNameList } from 'utils/functions';
import AddPurchaserequestPfForm_Al from 'components/forms/Purchaseflow_AL/AddPurchaserequestPfForm_Al';

import { TAvailableActionButtons } from 'types/types.actionButtonsGroups';
import ActionButtonsGroup from 'components/buttons/ActionButtonsGroup';

import { TVPurchaserequestheader_Al } from 'pages/Purchasefolder_Al/purchaserequestheader_pf-types_Al';

import AddBudgetrequestPfForm from 'components/forms/Purchaseflow/AddBudgetrequestPfForm';
import PurchaseOrderReport from 'components/reports/purchase/PurchaseOrderReport';

const filter: ISearch = {
  sort: { field_name: 'last_updated', desc: true },
  search: [[]]
};

const PurchaserequestheaderPfPage_Al = () => {
  //--------------constants----------
  const { permissions, user_permission } = useAuth();
  const location = useLocation();
  const pathNameList = getPathNameList(location.pathname);
  const { app } = useSelector((state: any) => state.menuSelectionSlice);
  const [paginationData, setPaginationData] = useState({ page: 0, rowsPerPage: rowsPerPageOptions[0] });
  const [searchData, setSearchData] = useState<ISearch>(filter);
  const [toggleFilter, setToggleFilter] = useState<boolean | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const [PurchaserequestheaderFormPopup, setPurchaserequestheaderFormPopup] = useState<TUniversalDialogProps>({
    action: {
      open: false,
      fullWidth: true,
      maxWidth: false
    },
    title: 'Purchase Request',
    data: { existingData: {}, isEditMode: false, request_number: '' } // Default request_number
  });

  const columns = useMemo<ColumnDef<TVPurchaserequestheader_Al>[]>(
    () => [
      {
        id: 'select-col',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllRowsSelected()}
            indeterminate={table.getIsSomeRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <Checkbox checked={row.getIsSelected()} disabled={!row.getCanSelect()} onChange={row.getToggleSelectedHandler()} />
        )
      },
      {
        accessorFn: (row) => row.display_request_number,
        id: 'display_request_number',
        header: () => <span>Request Number</span>
      },
      {
        accessorFn: (row) => row.request_date,
        id: 'request_date',
        header: () => <span>Request Date</span>
      },
      {
        accessorFn: (row) => row.flow_code,
        id: 'flow_code',
        header: () => <span>Flow Code</span>
      },

      {
        accessorFn: (row) => row.amount,
        id: 'Amount',
        header: () => <span>Amount</span>
      },
      {
        accessorFn: (row) => row.flow_code,
        id: 'document_type',
        header: () => <span>Document Type</span>
      },
      {
        id: 'actions',
        header: () => <span>Actions</span>,
        cell: ({ row }) => {
          const actionButtons: TAvailableActionButtons[] = ['edit'];

          return <ActionButtonsGroup handleActions={(action) => handleActions(action, row.original)} buttons={actionButtons} />;
        }
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  const { user } = useAuth();
  const username = user?.loginid;
  console.log('s', searchData);
  //----------- useQuery--------------

  const {
    data: PurchaserequestheaderData,
    isFetching: isPurchaserequestheaderFetchLoading,
    refetch: refetchPurchaserequestheaderData
  } = useQuery({
    queryKey: ['Purchaserequestheader_data', searchData, paginationData],
    queryFn: () => PfServiceInstance_Al.getMasters(app, pathNameList[pathNameList.length - 1], paginationData, searchData),
    enabled:
      !!user_permission &&
      Boolean(
        Object.keys(user_permission)?.includes(
          permissions?.[app.toUpperCase()]?.children[pathNameList[3]?.toUpperCase()]?.serial_number.toString()
        )
      ), // Safe check
    staleTime: 10000
  });
  console.log('pur', PurchaserequestheaderData);
  //-------------handlers---------------
  const handleChangePagination = (page: number, rowsPerPage: number) => {
    setPaginationData({ page, rowsPerPage });
  };

  const handleEditPurchaserequestheader = (existingData: TVPurchaserequestheader_Al) => {
    // Normalize request_number by replacing delimiters with plain text
    const normalizedRequestNumber = existingData.request_number?.replace(/\$/g, '/') ?? '';
    const isBudgetRequest = normalizedRequestNumber.includes('BUDGET');
    const title = isBudgetRequest ? 'Budget Request' : 'Purchase Request';

    setPurchaserequestheaderFormPopup((prev) => ({
      action: { ...prev.action, open: !prev.action.open },
      title, // Set the title based on the condition
      data: {
        isEditMode: true,
        request_number: existingData.request_number // Pass the original request_number
      }
    }));
  };

  const togglePurchaserequestheaderPopup = () => {
    // Close the popup and ensure data is always refreshed
    setPurchaserequestheaderFormPopup((prev) => ({
      ...prev,
      data: { isEditMode: false, existingData: {}, request_number: '' },
      action: { ...prev.action, open: !prev.action.open }
    }));

    // Refetch data when popup closes
    if (PurchaserequestheaderFormPopup.action.open) {
      refetchPurchaserequestheaderData();
    }
  };

  const handleActions = (actionType: string, rowOriginal: TVPurchaserequestheader_Al) => {
    if (actionType === 'edit') handleEditPurchaserequestheader(rowOriginal);
  };

  const handleDeletePurchaserequestheader = async () => {
    await PfServiceInstance_Al.deleteMasters('pf', 'purchaserequestheader', Object.keys(rowSelection));
    setRowSelection({});
    refetchPurchaserequestheaderData();
  };

  //------------------useEffect----------------
  useEffect(() => {
    setToggleFilter(null as any);
    return () => {};
  }, []);

  //----------------Filter and sorting ----------------
  const handleFilterChange = (value: ISearch['search']) => {
    setSearchData((prevData) => {
      return {
        ...prevData,
        search: value
      };
    });
  };

  const handleSortingChange = (sorting: SortingState) => {
    setSearchData((prevData) => {
      return {
        ...prevData,
        sort: sorting.length > 0 ? { field_name: sorting[0].id, desc: sorting[0].desc } : { field_name: 'updated_at', desc: true }
      };
    });
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex justify-end space-x-2">
        <Button
          variant="outlined"
          onClick={handleDeletePurchaserequestheader}
          color="error"
          hidden={!Object.keys(rowSelection).length}
          startIcon={<DeleteOutlined />}
        >
          Delete
        </Button>
        <Button
          startIcon={<PlusOutlined />}
          sx={{
            background: 'linear-gradient(to right, #082a89, #082a89)',
            color: '#fff',
            '&:hover': {
              background: 'linear-gradient(to right, #1675f2, #1675f2)'
            }
          }}
          variant="contained"
          onClick={() => togglePurchaserequestheaderPopup()}
        >
          General Request
        </Button>
      </div>
      <CustomDataTable
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        row_id="request_number"
        data={PurchaserequestheaderData?.tableData || []}
        columns={columns}
        count={PurchaserequestheaderData?.count}
        onPaginationChange={handleChangePagination}
        isDataLoading={isPurchaserequestheaderFetchLoading}
        toggleFilter={toggleFilter}
        handleFilterChange={handleFilterChange}
        handleSortingChange={handleSortingChange}
        hasPagination={true}
      />
      {PurchaserequestheaderFormPopup.action.open &&
        // For JONATHAN, check if request starts with 'BUDGET' or Add button was pressed (isEditMode is false)
        ((username === 'JONATHAN' || username === 'EMERALD') &&
        (PurchaserequestheaderFormPopup.data.request_number?.replace(/\//g, '$')?.startsWith('BUDGET') ||
          !PurchaserequestheaderFormPopup.data.isEditMode) ? (
          <UniversalDialog
            action={{ ...PurchaserequestheaderFormPopup.action }}
            onClose={togglePurchaserequestheaderPopup}
            title={PurchaserequestheaderFormPopup.title}
            hasPrimaryButton={false}
          >
            <AddBudgetrequestPfForm
              request_number={PurchaserequestheaderFormPopup.data.request_number}
              onClose={togglePurchaserequestheaderPopup}
              isEditMode={PurchaserequestheaderFormPopup.data.isEditMode}
              existingData={PurchaserequestheaderFormPopup.data.existingData || {}}
            />
          </UniversalDialog>
        ) : // For other users, open the corresponding form based on the request_number
        PurchaserequestheaderFormPopup.data.request_number?.replace(/\//g, '$')?.includes('PO$') ? (
          <PurchaseOrderReport poNumber={PurchaserequestheaderFormPopup.data.request_number} onClose={togglePurchaserequestheaderPopup} />
        ) : (
          // Default logic for AddPurchaserequestPfForm if conditions don't match
          <UniversalDialog
            action={{ ...PurchaserequestheaderFormPopup.action }}
            onClose={togglePurchaserequestheaderPopup}
            title={PurchaserequestheaderFormPopup.title}
            hasPrimaryButton={false}
          >
            <AddPurchaserequestPfForm_Al
              request_number={PurchaserequestheaderFormPopup.data.request_number}
              onClose={togglePurchaserequestheaderPopup}
              isEditMode={PurchaserequestheaderFormPopup.data.isEditMode}
              existingData={PurchaserequestheaderFormPopup.data.existingData || {}}
            />
          </UniversalDialog>
        ))}
    </div>
  );
};

export default PurchaserequestheaderPfPage_Al;
